<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/stores/projectStore";

const props = defineProps({
  project: { type: Object, default: () => ({}) },
});

const router = useRouter();
const projectStore = useProjectStore();
const { projectPropertyListData } = storeToRefs(projectStore);

onMounted(() => {
  if (!projectPropertyListData.value?.length) projectStore.getProjectList();
});

const ytId = (url) => {
  const m = String(url || "").match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/,
  );
  return m ? m[1] : "";
};

// Real tour videos only: this project's video first, then other projects'
const reels = computed(() => {
  const out = [];
  const seen = new Set();
  const push = (p, own) => {
    if (out.length >= 10) return;
    const id = ytId(p?.videoLink || p?.tourLink);
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push({
      videoId: id,
      name: p.projectName || "Project",
      city: p.city || "",
      projectId: p._id,
      own,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  };
  if (props.project?._id) push(props.project, true);
  (projectPropertyListData.value || []).forEach((p) => push(p, false));
  return out;
});

const playing = ref("");
const play = (r) => { playing.value = r.videoId; };

const rail = ref(null);
const scrollRail = (dir) =>
  rail.value?.scrollBy({ left: dir * 280, behavior: "smooth" });

const goToProject = (r) => {
  if (!r.own && r.projectId) router.push(`/project-details/${r.projectId}`);
};
</script>

<template>
  <section v-if="reels.length" class="max-w-7xl mx-auto px-4 2xl:px-0 py-10">

    <!-- Header -->
    <div class="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 class="font-intertight font-bold text-[22px] md:text-[28px] text-gray-900 flex items-center gap-2">
          🎬 Project Reels
        </h2>
        <p class="text-sm text-gray-500 mt-1">Video tours of this project and more like it</p>
      </div>
      <div class="hidden md:flex items-center gap-2">
        <button
          @click="scrollRail(-1)"
          class="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-[#EB3131] hover:border-[#EB3131] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
        >
          <i class="pi pi-angle-left text-sm"></i>
        </button>
        <button
          @click="scrollRail(1)"
          class="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-[#EB3131] hover:border-[#EB3131] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
        >
          <i class="pi pi-angle-right text-sm"></i>
        </button>
      </div>
    </div>

    <!-- Rail -->
    <div ref="rail" class="flex gap-4 overflow-x-auto pb-2 snap-x reels-rail">
      <div
        v-for="(r, idx) in reels"
        :key="r.videoId"
        class="reel-card group snap-start shrink-0 w-[210px] md:w-[240px] aspect-[9/16] rounded-3xl overflow-hidden relative bg-gray-900 cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300"
        :style="{ animationDelay: `${Math.min(idx, 6) * 0.08}s` }"
      >
        <!-- Playing -->
        <iframe
          v-if="playing === r.videoId"
          :src="`https://www.youtube.com/embed/${r.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>

        <!-- Thumbnail -->
        <template v-else>
          <div @click="play(r)" class="absolute inset-0">
            <img
              :src="r.thumb"
              :alt="r.name"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30"></div>

            <!-- This-project badge -->
            <span
              v-if="r.own"
              class="absolute top-3 left-3 bg-[#EB3131] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow"
            >
              This project
            </span>

            <!-- Play button -->
            <span class="reel-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/30 border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-play text-white text-lg ml-1"></i>
            </span>

            <!-- Caption -->
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <p class="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow">{{ r.name }}</p>
              <div class="flex items-center justify-between gap-2 mt-1.5">
                <p v-if="r.city" class="text-white/70 text-[11px] flex items-center gap-1">
                  <i class="pi pi-map-marker text-[9px]"></i>{{ r.city }}
                </p>
                <button
                  v-if="!r.own"
                  @click.stop="goToProject(r)"
                  class="text-white/80 hover:text-white text-[10px] font-semibold underline underline-offset-2"
                >
                  View project
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reels-rail::-webkit-scrollbar {
  height: 6px;
}
.reels-rail::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 9999px;
}

.reel-card {
  animation: reel-enter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes reel-enter {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* The play button previously ran an infinite box-shadow pulse — on up to ten
   reels at once, each on an element that also carried backdrop-blur, which is
   the most expensive pairing available. It is now a static ring; the existing
   group-hover scale already provides the interactive feedback. */
.reel-play {
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.14);
}
</style>
