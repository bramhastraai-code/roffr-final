<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import ProjectCard from "@/components/ProjectCard.vue";
import ProjectFilterBar from "@/components/ProjectFilterBar.vue";

const swiperInstance = ref(null);
const isBeginning = ref(true);
const isEnd = ref(false);

const onSwiper = (swiper) => {
  swiperInstance.value = swiper;
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};
const onSlideChange = (swiper) => {
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
  maybeLoadMore(swiper);
};
const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();

const projectStore = useProjectStore();
const { projectPropertyListData } = storeToRefs(projectStore);

// When the swiper reaches its last slide, pull the next page of projects
// so the carousel keeps going through the full catalog
const maybeLoadMore = async (swiper) => {
  if (!swiper.isEnd) return;
  await projectStore.loadMoreProjects();
  await nextTick();
  swiper.update();
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
};

onMounted(async () => {
  await projectStore.getProjectList();
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- ── Header row ─────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] xl:text-[40px] bg-gradient-to-r from-[#DDA439] to-[#E8820C] bg-clip-text text-transparent leading-tight">
          Deal Of The Day
        </h2>
        <p class="text-sm text-gray-500 mt-0.5">Handpicked group deals refreshed daily</p>
      </div>

      <!-- Nav buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="slidePrev"
          :disabled="isBeginning"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
          :class="isBeginning
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-[#EB3131] hover:border-[#EB3131] hover:text-white shadow-sm'"
        >
          <i class="pi pi-angle-left text-sm"></i>
        </button>
        <button
          @click="slideNext"
          :disabled="isEnd"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
          :class="isEnd
            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-[#EB3131] hover:border-[#EB3131] hover:text-white shadow-sm'"
        >
          <i class="pi pi-angle-right text-sm"></i>
        </button>
      </div>
    </div>

    <!-- ── Filters + results ──────────────────────────────────── -->
    <ProjectFilterBar :projects="projectPropertyListData || []">
      <template #default="{ filtered, clearAll }">

        <!-- Empty state -->
        <div v-if="!filtered.length" class="text-center py-20 text-gray-400">
          <i class="pi pi-filter-slash text-4xl mb-4 block opacity-30"></i>
          <p class="text-sm font-medium">No projects match the selected filters</p>
          <button
            @click="clearAll"
            class="mt-3 text-[#EB3131] text-sm font-semibold hover:underline"
          >Clear all filters</button>
        </div>

        <!-- Swiper -->
        <div v-else class="mt-8">
          <Swiper
            :space-between="20"
            :breakpoints="{
              320:  { slidesPerView: 1 },
              640:  { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }"
            class="!pb-2"
            @swiper="onSwiper"
            @slideChange="onSlideChange"
          >
            <SwiperSlide
              v-for="(project, index) in filtered"
              :key="project._id || index"
              class="!h-auto"
            >
              <ProjectCard :project="project" :show-group-buy="true" />
            </SwiperSlide>
          </Swiper>
        </div>
      </template>
    </ProjectFilterBar>
  </section>
</template>
