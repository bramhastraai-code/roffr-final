<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { usePropertyStore } from "@/stores/propertyStore";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

const router = useRouter();
const propertyStore = usePropertyStore();
const { propertyData } = storeToRefs(propertyStore);

const colors = [
  "bg-[#E8DFC8]",
  "bg-[#EADDE3]",
  "bg-[#DCEBE3]",
  "bg-[#DCE3EC]",
  "bg-[#F1E4D3]",
  "bg-[#FCE7F3]",
];

const cards = computed(() => {
  const list = Array.isArray(propertyData.value)
    ? propertyData.value
    : propertyData.value?.properties || propertyData.value?.results || [];

  return list.map((property, idx) => ({
    id: property._id || property.id,
    title: property.title || "Property",
    location:
      [
        property?.location?.locality,
        property?.location?.city,
        property?.location?.state,
      ]
        .filter(Boolean)
        .join(", ") || "—",
    bhk: property?.property_details?.bhk || "",
    unitType: property?.property_details?.unit_type || "",
    image: property?.media?.images?.[0] || "",
    bg: colors[idx % colors.length],
  }));
});

const goToProperty = (id) => {
  if (!id) return;
  router.push(`/property-details/${id}`);
};

onMounted(async () => {
  if (!propertyData.value || propertyData.value.length === 0) {
    await propertyStore.getProperty();
  }
});
</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0">
    <h1 class="title-text text-center">Properties For Rent</h1>

    <div v-if="cards.length === 0" class="text-center mt-10 text-gray-500">
      No properties available right now.
    </div>

    <div v-else class="mt-6">
      <Swiper
        :space-between="20"
        :slides-per-view="3"
        :breakpoints="{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 3 },
        }"
      >
        <SwiperSlide v-for="card in cards" :key="card.id">
          <div
            class="rounded-2xl h-[320px] flex flex-col justify-between shadow-sm overflow-hidden cursor-pointer relative"
            :class="card.image ? 'text-white' : card.bg + ' text-gray-900'"
            @click="goToProperty(card.id)"
          >
            <img
              v-if="card.image"
              :src="card.image"
              :alt="card.title"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div
              v-if="card.image"
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            ></div>

            <div class="relative z-10 p-5 flex flex-col justify-between h-full">
              <div class="flex gap-2 self-start">
                <span
                  v-if="card.bhk"
                  class="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-orange-600 font-semibold"
                >
                  {{ card.bhk }}
                </span>
                <span
                  v-if="card.unitType"
                  class="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 text-gray-800 font-semibold"
                >
                  {{ card.unitType }}
                </span>
              </div>

              <div>
                <h2 class="text-lg font-semibold line-clamp-2">{{ card.title }}</h2>
                <p class="text-sm opacity-90 mt-1">{{ card.location }}</p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>
