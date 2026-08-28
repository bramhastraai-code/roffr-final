<script setup>
import { ref, computed, onMounted } from "vue";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { storeToRefs } from "pinia";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";
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
};
const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();

const groupBuyStore = useGroupBuyStore();
const { activeCampaigns, loading } = storeToRefs(groupBuyStore);

// The campaign's populated projectId only carries a few fields (name, city,
// prices, pictures) — no builderName/venue/status. Enrich each deal with its
// full project doc so cards show builder, real location, configs, etc.
const projectDetails = ref(new Map());

onMounted(async () => {
  await groupBuyStore.fetchActiveCampaigns();
  const ids = [
    ...new Set(
      activeCampaigns.value.map((c) => c.projectId?._id).filter(Boolean),
    ),
  ].filter((id) => !projectDetails.value.has(id));
  if (!ids.length) return;
  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await makeRequest(
          endpoints.getProjectById, "GET", {}, {}, {}, 0, id,
        );
        projectDetails.value.set(id, res?.data || null);
      } catch {
        projectDetails.value.set(id, null);
      }
    }),
  );
  // Map mutations aren't reactive — reassign to refresh the cards
  projectDetails.value = new Map(projectDetails.value);
});

// Pass the (enriched) project to ProjectCard so it can find the campaign in
// the store cache without extra calls.
const deals = computed(() =>
  activeCampaigns.value
    .filter((c) => c.projectId?._id)
    .map((c) => ({
      ...c.projectId,
      ...(projectDetails.value.get(c.projectId._id) || {}),
    }))
);
</script>

<template>
  <section class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EB3131] text-white uppercase tracking-wide mb-3">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
          Live Now
        </span>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] xl:text-[40px] text-[#1a2b5f] leading-tight">
          Group Buying Deals
        </h2>
        <p class="text-sm text-gray-500 mt-1">Join a group and unlock exclusive discounts — more buyers, bigger savings</p>
      </div>

      <!-- Nav buttons -->
      <div class="flex items-center gap-2 shrink-0 mt-2">
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

    <!-- Loading skeleton -->
    <div v-if="loading" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="n in 3"
        :key="n"
        class="rounded-3xl border border-gray-100 bg-white h-[480px] animate-pulse"
      >
        <div class="h-64 bg-gray-100 rounded-t-3xl"></div>
        <div class="p-5 space-y-3">
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          <div class="h-10 bg-gray-100 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!deals.length" class="text-center py-20 text-gray-400">
      <i class="pi pi-tag text-4xl mb-4 block opacity-30"></i>
      <p class="text-sm font-medium">No active group buying deals right now — check back soon</p>
    </div>

    <!-- Filters + results -->
    <ProjectFilterBar v-else :projects="deals">
      <template #default="{ filtered, clearAll }">

        <!-- No filter matches -->
        <div v-if="!filtered.length" class="text-center py-20 text-gray-400">
          <i class="pi pi-filter-slash text-4xl mb-4 block opacity-30"></i>
          <p class="text-sm font-medium">No deals match the selected filters</p>
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
              v-for="project in filtered"
              :key="project._id"
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
