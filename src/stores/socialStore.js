import { defineStore } from "pinia";
import { ref } from "vue";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

// Shared social-feed store. The store is *agnostic* about who the author is —
// callers pass `authorId/authorType/authorName/authorAvatar` when posting,
// liking, or commenting. That's how the same backend supports the
// marketplace customer, the broker dashboard, and the admin dashboard.
export const useSocialStore = defineStore("social", () => {
  const posts = ref([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const loading = ref(false);
  const error = ref(null);

  // postId -> [comments]
  const commentsByPost = ref({});
  const commentsLoadingByPost = ref({});

  const fetchPosts = async ({ viewerId, viewerType, append = false } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const params = { page: page.value, limit: limit.value };
      if (viewerId) params.viewerId = viewerId;
      if (viewerType) params.viewerType = viewerType;

      const res = await makeRequest(endpoints.social, "GET", {}, {}, params, 0);
      const payload = res?.data ?? {};
      const list = Array.isArray(payload.posts) ? payload.posts : [];
      posts.value = append ? [...posts.value, ...list] : list;
      total.value = Number(payload.total ?? list.length);
    } catch (err) {
      console.error("fetchPosts failed", err);
      error.value = err?.response?.data?.message ?? "Failed to load posts";
      if (!append) posts.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createPost = async (payload) => {
    if (!payload?.content?.trim()) throw new Error("Post content is required");
    if (!payload.authorId || !payload.authorType) {
      throw new Error("Author info is required");
    }
    const res = await makeRequest(endpoints.social, "POST", payload, {}, {}, 0);
    const created = res?.data ?? res;
    if (created && created._id) {
      posts.value = [
        { ...created, likeCount: 0, likedByMe: false },
        ...posts.value,
      ];
      total.value += 1;
    }
    return created;
  };

  const toggleLike = async (postId, { userId, userType }) => {
    if (!userId || !userType) throw new Error("Login required");
    const res = await makeRequest(
      `${endpoints.social}/post/${postId}/like`,
      "POST",
      { userId, userType },
      {},
      {},
      0,
    );
    const data = res?.data ?? res;
    const idx = posts.value.findIndex((p) => p._id === postId);
    if (idx >= 0) {
      posts.value[idx] = {
        ...posts.value[idx],
        likeCount: data.likeCount,
        likedByMe: !!data.liked,
      };
    }
    return data;
  };

  const deletePost = async (postId, requester) => {
    if (!requester?.requesterId || !requester?.requesterType) {
      throw new Error("Login required");
    }
    await makeRequest(
      `${endpoints.social}/post/${postId}`,
      "DELETE",
      requester,
      {},
      {},
      0,
    );
    posts.value = posts.value.filter((p) => p._id !== postId);
    total.value = Math.max(0, total.value - 1);
  };

  const fetchComments = async (postId) => {
    if (!postId) return;
    commentsLoadingByPost.value = {
      ...commentsLoadingByPost.value,
      [postId]: true,
    };
    try {
      const res = await makeRequest(
        `${endpoints.social}/post/${postId}/comments`,
        "GET",
        {},
        {},
        { page: 1, limit: 100 },
        0,
      );
      const list = res?.data?.comments ?? [];
      commentsByPost.value = { ...commentsByPost.value, [postId]: list };
    } catch (err) {
      console.error("fetchComments failed", err);
      commentsByPost.value = { ...commentsByPost.value, [postId]: [] };
    } finally {
      commentsLoadingByPost.value = {
        ...commentsLoadingByPost.value,
        [postId]: false,
      };
    }
  };

  const addComment = async (postId, payload) => {
    if (!payload?.content?.trim()) throw new Error("Comment is required");
    if (!payload.authorId || !payload.authorType) throw new Error("Login required");

    const res = await makeRequest(
      `${endpoints.social}/post/${postId}/comments`,
      "POST",
      payload,
      {},
      {},
      0,
    );
    const created = res?.data ?? res;

    const existing = commentsByPost.value[postId] || [];
    commentsByPost.value = {
      ...commentsByPost.value,
      [postId]: [...existing, created],
    };

    const idx = posts.value.findIndex((p) => p._id === postId);
    if (idx >= 0) {
      posts.value[idx] = {
        ...posts.value[idx],
        commentsCount: (posts.value[idx].commentsCount || 0) + 1,
      };
    }
    return created;
  };

  const deleteComment = async (postId, commentId, requester) => {
    if (!requester?.requesterId || !requester?.requesterType) {
      throw new Error("Login required");
    }
    await makeRequest(
      `${endpoints.social}/post/${postId}/comments/${commentId}`,
      "DELETE",
      requester,
      {},
      {},
      0,
    );
    const existing = commentsByPost.value[postId] || [];
    commentsByPost.value = {
      ...commentsByPost.value,
      [postId]: existing.filter((c) => c._id !== commentId),
    };
    const idx = posts.value.findIndex((p) => p._id === postId);
    if (idx >= 0) {
      posts.value[idx] = {
        ...posts.value[idx],
        commentsCount: Math.max(0, (posts.value[idx].commentsCount || 0) - 1),
      };
    }
  };

  const reset = () => {
    posts.value = [];
    total.value = 0;
    page.value = 1;
    commentsByPost.value = {};
  };

  return {
    posts,
    total,
    page,
    limit,
    loading,
    error,
    commentsByPost,
    commentsLoadingByPost,

    fetchPosts,
    createPost,
    toggleLike,
    deletePost,
    fetchComments,
    addComment,
    deleteComment,
    reset,
  };
});
