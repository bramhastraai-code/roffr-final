<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useRecentlyViewed } from "@/composables/useRecentlyViewed";
import { useProjectStore } from "@/stores/projectStore";
import { fmtINRShort } from "@/data/properties.js";
import { rateComparison } from "@/utils/priceInsight";

// Only renders once the visitor has actually viewed something, so a
// first-time visitor never sees an empty shelf.
const router = useRouter();
const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

const projectStore = useProjectStore();
const { rateIndex } = storeToRefs(projectStore);

const items = computed(() => recentlyViewed.value.slice(0, 6));

const priceLabel = (p) => (p.minPrice ? `${fmtINRShort(p.minPrice)}+` : "Price on request");
const areaLabel = (p) => [p.region, p.city].filter(Boolean).join(", ");
const insightOf = (p) => rateComparison(p, rateIndex.value);

// "2 days ago" reads better than a timestamp and explains why this is here.
const agoLabel = (p) => {
  const ms = Date.now() - Number(p.viewedAt || 0);
  if (!Number.isFinite(ms) || ms < 0) return "";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

const go = (p) => router.push(`/project-details/${p._id}`);
</script>

<template>
  <section v-if="items.length" class="max-w-7xl mx-auto px-4 xl:px-0 py-12">
    <!-- Header -->
    <div v-reveal class="flex items-end justify-between gap-4 mb-6">
      <div>
        <span
          class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide mb-3"
        >
          <i class="pi pi-history text-[9px]"></i>
          Your history
        </span>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] text-ink leading-tight">
          Pick up where you left off
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ items.length }} project{{ items.length === 1 ? "" : "s" }} you viewed recently
        </p>
      </div>

      <button
        @click="clearRecentlyViewed"
        class="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-brand border border-gray-200 hover:border-brand/40 rounded-full px-3.5 py-2 transition-colors duration-200 mb-1"
      >
        <i class="pi pi-trash text-[10px]"></i>
        Clear
      </button>
    </div>

    <!-- Cards -->
    <div class="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
      <button
        v-for="(p, i) in items"
        :key="p._id"
        v-reveal="{ y: 14, delay: i * 60 }"
        @click="go(p)"
        class="rv-card group snap-start shrink-0 w-[260px] sm:w-[290px] text-left bg-white border border-gray-200 rounded-[22px] overflow-hidden hover:border-gray-300 hover:shadow-e2 transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-1"
      >
        <!-- Cover -->
        <div class="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <img
            v-if="p.propertyPictures?.[0]"
            :src="p.propertyPictures[0]"
            :alt="p.projectName"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <i class="pi pi-building text-3xl text-gray-300"></i>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>

          <!-- Viewed-when chip -->
          <span
            v-if="agoLabel(p)"
            class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 px-2.5 py-1 rounded-full shadow-sm"
          >
            {{ agoLabel(p) }}
          </span>

          <!-- Status -->
          <span
            v-if="p.projectStatus"
            class="absolute bottom-3 left-3 text-[10px] font-semibold text-white/90"
          >
            {{ p.projectStatus }}
          </span>

          <!-- Resume affordance -->
          <span
            class="absolute bottom-2.5 right-3 w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-300"
          >
            <i class="pi pi-arrow-right text-[11px]"></i>
          </span>
        </div>

        <!-- Body -->
        <div class="p-4">
          <p class="text-[14px] font-bold text-gray-900 truncate">{{ p.projectName }}</p>
          <p v-if="areaLabel(p)" class="text-[11px] text-gray-500 truncate mt-1 flex items-center gap-1">
            <i class="pi pi-map-marker text-[9px] text-gray-400"></i>
            {{ areaLabel(p) }}
          </p>

          <div class="flex items-baseline justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
            <span class="text-[14px] font-extrabold text-gray-900">{{ priceLabel(p) }}</span>
            <span v-if="insightOf(p)" class="text-[11px] font-semibold text-gray-500 shrink-0">
              {{ insightOf(p).rateLabel }}
            </span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
/* Cards are revealed by v-reveal (shared IntersectionObserver + CSS).
   No per-card animation is declared here, so nothing competes with it. */
.rv-card:focus-visible {
  outline: 2px solid #eb3131;
  outline-offset: 2px;
}
</style>
