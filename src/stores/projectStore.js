import { makeRequest } from "@/request/request";
import { defineStore } from "pinia";
import endpoints from "@/request/endpoints";
import { ref } from "vue";

export const useProjectStore = defineStore("project", () => {
  const projectAffordablityData = ref([]);
  const groupBuyingData = ref([]);
  const specificProjectDetails = ref([]);
  const projectPropertyListData = ref([]);
  const uniqueCitiesData = ref([]);
  const wishlistData = ref([]);
  const isModalOpen = ref(false)
  const pageNumber = ref(1);
  const pageSize = ref(10);
  const totalpages = ref(0);

  const getProjectAffordiablityData = async (
    city = "mumbai",
    affordability = "asc"
  ) => {
    try {
      const params = {
        // searchQuery: city,
        sortOrder: affordability,
        pageSize: pageSize.value,
        pageNumber: pageNumber.value,
      };

      const response = await makeRequest(
        endpoints.getProjectProperty,
        "GET",
        {},
        {},
        params,
        0
      );

      projectAffordablityData.value = response?.data?.projects;
      totalpages.value = response?.data?.totalPages;
      pageSize.value = response?.data?.pageSize;
      pageNumber.value = response?.data?.pageNumber;
    } catch (error) {
      console.error("Error in fetching project affordability data", error);
    }
  };

  const getGroupBuyingData = async () => {
    try {
      const response = await makeRequest(
        endpoints.groupBuying,
        "GET",
        {},
        {},
        {},
        0
      );

      groupBuyingData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching group project data", error);
    }
  };

  const getProjectById = async (id) => {
    try {
      const response = await makeRequest(
        endpoints.getProjectById,
        "GET",
        {},
        {},
        {},
        0,
        id
      );

      specificProjectDetails.value = response?.data;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  const totalProjects = ref(0);

  // The API honors pageSize/pageNumber/searchQuery only (limit/page/city/search
  // are ignored server-side — see docs/PLACEHOLDER_DATA.md). searchQuery is a
  // text match that covers city, name, and venue.
  const getProjectList = async (
    type = "project",
    search = "",
    city = "",
    page = 1
  ) => {
    try {
      const params = {
        type: type,
        pageSize: pageSize.value || 10,
        pageNumber: page,
      };

      const q = search || city;
      if (q) {
        params.searchQuery = q;
      }
      const response = await makeRequest(
        endpoints.getProjectProperty,
        "GET",
        {},
        {},
        params,
        0
      );

      projectPropertyListData.value = response?.data?.projects;
      totalProjects.value = response?.data?.totalProjects ?? 0;
      totalpages.value = response?.data?.totalPages ?? 0;
      pageSize.value = response?.data?.pageSize ?? pageSize.value;
      pageNumber.value = response?.data?.pageNumber ?? page;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  // Append the next unfiltered page to projectPropertyListData. Shared by the
  // homepage swiper sections, so it guards against concurrent calls and dedupes.
  let loadingMoreProjects = false;
  const loadMoreProjects = async () => {
    if (loadingMoreProjects) return;
    const current = projectPropertyListData.value || [];
    if (current.length >= (totalProjects.value || 0)) return;
    loadingMoreProjects = true;
    try {
      const size = pageSize.value || 10;
      const nextPage = Math.floor(current.length / size) + 1;
      const response = await makeRequest(
        endpoints.getProjectProperty,
        "GET",
        {},
        {},
        { type: "project", pageSize: size, pageNumber: nextPage },
        0
      );
      const seen = new Set(current.map((p) => p._id));
      const fresh = (response?.data?.projects || []).filter((p) => !seen.has(p._id));
      projectPropertyListData.value = [...current, ...fresh];
      totalProjects.value = response?.data?.totalProjects ?? totalProjects.value;
      totalpages.value = response?.data?.totalPages ?? totalpages.value;
    } catch (error) {
      console.error("Error in loading more projects", error);
    } finally {
      loadingMoreProjects = false;
    }
  };

  const getProjectCities = async () => {
    try {
      const response = await makeRequest(
        endpoints.projectCities,
        "GET",
        {},
        {},
        {},
        0
      );

      uniqueCitiesData.value = response?.data;
    } catch (error) {
      console.error("Error in fetching specific project data", error);
    }
  };

  // Cities that actually have projects, most inventory first. Derived from a
  // 300-project sample because /projects/unique-cities is a raw dump full of
  // junk entries with zero listings. Session-cached.
  const activeCitiesData = ref([]);
  let activeCitiesPromise = null;
  const getActiveCities = () => {
    if (activeCitiesData.value.length) return Promise.resolve(activeCitiesData.value);
    if (!activeCitiesPromise) {
      activeCitiesPromise = (async () => {
        const counts = new Map();
        try {
          const res = await makeRequest(
            endpoints.getProjectProperty,
            "GET",
            {},
            {},
            { type: "project", pageSize: 300, pageNumber: 1 },
            0
          );
          (res?.data?.projects || []).forEach((p) => {
            const raw = String(p.city || "").trim();
            if (!raw) return;
            const key = raw.toLowerCase();
            const entry = counts.get(key) || { raw, count: 0 };
            entry.count += 1;
            counts.set(key, entry);
          });
        } catch (error) {
          console.error("Error in building active cities", error);
        }
        activeCitiesData.value = [...counts.values()]
          .sort((a, b) => b.count - a.count)
          .map((e) => e.raw);
        return activeCitiesData.value;
      })();
    }
    return activeCitiesPromise;
  };


  const joinProjectGroup = async (projectId, customerId) => {
    try {
      const response = await makeRequest(
        `/projects/${projectId}/apply/${customerId}`,
        "POST",
        {},
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };


  const getWishlist = async (customerId) => {
    try {
      const response = await makeRequest(
        `/projects/wishlist/customer/${customerId}`,
        "GET",
        {},
        {},
        {},
        0
      );
      
      wishlistData.value = response?.data?.wishlist
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };


  const addToWishlist = async (projectId, customerId) => {
    try {
      const response = await makeRequest(
        `/projects/wishlist/${projectId}/customer/${customerId}`,
        "POST",
        {},
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };


  const removeFromWishlist = async (projectId, customerId) => {
    try {
      const response = await makeRequest(
        `/projects/wishlist/${projectId}/customer/${customerId}`,
        "DELETE",
        {},
        {},
        {},
        0
      );

      return response;
    } catch (error) {
      console.error("Error in joining the project group", error);
    }
  };

  // NOTE: no fetches on store instantiation — they used to fire on every
  // page (~120KB wasted). The consuming sections lazy-load on mount instead.

  // Super-admin curated feeds — populated only when the corresponding
  // section mounts so the home page doesn't fire 3+ extra requests on
  // every load.
  const featuredProjects = ref([]);
  const trendingProjects = ref([]);

  /**
   * Pull projects super-admin marked `isFeaturedOnMarketplace: true`.
   * Returns the list and stashes it on `featuredProjects` so the section
   * can read it reactively.
   */
  const getFeaturedProjects = async (limit = 12) => {
    try {
      const response = await makeRequest(
        "GET",
        endpoints.marketplaceFeatured("projects"),
        { params: { limit } }
      );
      const items = response?.data?.data || response?.data || [];
      featuredProjects.value = Array.isArray(items) ? items : [];
      return featuredProjects.value;
    } catch (error) {
      console.error("Error fetching featured projects", error);
      featuredProjects.value = [];
      return [];
    }
  };

  const getTrendingProjects = async (limit = 12) => {
    try {
      const response = await makeRequest(
        "GET",
        endpoints.marketplaceTrending("projects"),
        { params: { limit } }
      );
      const items = response?.data?.data || response?.data || [];
      trendingProjects.value = Array.isArray(items) ? items : [];
      return trendingProjects.value;
    } catch (error) {
      console.error("Error fetching trending projects", error);
      trendingProjects.value = [];
      return [];
    }
  };

  return {
    projectAffordablityData,
    getProjectAffordiablityData,
    groupBuyingData,
    getProjectById,
    specificProjectDetails,
    getProjectList,
    // PropertyProjectView calls this name; same signature, same list ref
    getProjectPropertyList: getProjectList,
    loadMoreProjects,
    projectPropertyListData,
    getProjectCities,
    uniqueCitiesData,
    getActiveCities,
    activeCitiesData,
    joinProjectGroup,
    wishlistData,
    removeFromWishlist,
    getWishlist,
    addToWishlist,
    isModalOpen,
    featuredProjects,
    trendingProjects,
    getFeaturedProjects,
    getTrendingProjects,
    totalpages,
    totalProjects,
    pageNumber,
    pageSize,
  };
});
