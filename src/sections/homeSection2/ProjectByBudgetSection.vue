<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

const router = useRouter();
const projectStore = useProjectStore();
const { projectAffordablityData } = storeToRefs(projectStore);

const cards = computed(() => {
  const list = Array.isArray(projectAffordablityData.value)
    ? projectAffordablityData.value
    : [];
  return list.map((p) => ({
    id: p?._id || p?.id,
    name: p?.projectName || "Project",
    image: p?.propertyPictures?.[0] || p?.floorPlan?.[0] || "",
  }));
});

const goToProject = (id) => {
  if (!id) return;
  router.push(`/project-details/${id}`);
};

onMounted(async () => {
  if (!projectAffordablityData.value || projectAffordablityData.value.length === 0) {
    await projectStore.getProjectAffordiablityData();
  }
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <h1 class="title-text text-center">Projects by Budget</h1>

    <div v-if="cards.length === 0" class="text-center mt-10 text-gray-500">
      No budget-sorted projects to show right now.
    </div>

    <div v-else class="mt-6">
      <Swiper
        :space-between="20"
        :slides-per-view="4"
        :breakpoints="{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }"
      >
        <SwiperSlide v-for="card in cards" :key="card.id">
          <div
            class="rounded-2xl h-[420px] overflow-hidden relative shadow-sm border text-white cursor-pointer"
            @click="goToProject(card.id)"
          >
            <img
              v-if="card.image"
              :src="card.image"
              :alt="card.name"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div
              v-else
              class="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"
            ></div>

            <div class="absolute inset-0 bg-black/50"></div>

            <div class="relative z-10 p-5 flex flex-col justify-between h-full">
              <div>
                <h2 class="text-[24px] font-semibold line-clamp-3">
                  {{ card.name }}
                </h2>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
