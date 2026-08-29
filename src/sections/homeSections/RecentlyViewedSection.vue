<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useRecentlyViewed } from "@/composables/useRecentlyViewed";
import { fmtINRShort } from "@/data/properties.js";

// Only renders once the visitor has actually viewed something, so a
// first-time visitor never sees an empty shelf.
const router = useRouter();
const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

const items = computed(() => recentlyViewed.value.slice(0, 6));

const priceLabel = (p) => (p.minPrice ? `${fmtINRShort(p.minPrice)}+` : "Price on request");
const areaLabel = (p) => [p.region, p.city].filter(Boolean).join(", ");
const go = (p) => router.push(`/project-details/${p._id}`);
</script>

<template>
  <section v-if="items.length" class="max-w-7xl mx-auto px-4 xl:px-0 py-10">
    <div class="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 class="font-intertight font-bold text-[22px] md:text-[28px] text-ink">
          Pick up where you left off
        </h2>
        <p class="text-sm text-gray-500 mt-1">Projects you viewed recently</p>
      </div>
      <button
        @click="clearRecentlyViewed"
        class="text-xs font-semibold text-gray-400 hover:text-brand transition-colors shrink-0"
      >
        Clear
      </button>
    </div>

    <div class="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar">
      <button
        v-for="p in items"
        :key="p._id"
        @click="go(p)"
        class="group snap-start shrink-0 w-[240px] text-left bg-white border border-gray-200 rounded-card overflow-hidden hover:shadow-e2 hover:border-gray-300 transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5"
      >
        <div class="h-28 bg-gray-100 overflow-hidden">
          <img
            v-if="p.propertyPictures?.[0]"
            :src="p.propertyPictures[0]"
            :alt="p.projectName"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <i class="pi pi-building text-2xl text-gray-300"></i>
          </div>
        </div>
        <div class="p-3">
          <p class="text-[13px] font-bold text-gray-900 truncate">{{ p.projectName }}</p>
          <p v-if="areaLabel(p)" class="text-[11px] text-gray-500 truncate mt-0.5">
            {{ areaLabel(p) }}
          </p>
          <p class="text-[12px] font-bold text-brand mt-1.5">{{ priceLabel(p) }}</p>
        </div>
      </button>
    </div>
  </section>
</template>
