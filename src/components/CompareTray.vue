<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useCompareStore } from "@/stores/compareStore";
import { useProjectStore } from "@/stores/projectStore";
import { fmtINRShort } from "@/data/properties.js";
import { pricePerSqft, formatRate, rateComparison } from "@/utils/priceInsight";
import { bhkConfigsOf } from "@/utils/bhkDisplay";

const router = useRouter();
const compare = useCompareStore();
const { items, isOpen } = storeToRefs(compare);

const projectStore = useProjectStore();
const { rateIndex } = storeToRefs(projectStore);

const priceRange = (p) => {
  if (p.minPrice && p.maxPrice && p.maxPrice > p.minPrice)
    return `${fmtINRShort(p.minPrice)} – ${fmtINRShort(p.maxPrice)}`;
  if (p.minPrice) return `${fmtINRShort(p.minPrice)}+`;
  return "On request";
};

const rateOf = (p) => {
  const r = pricePerSqft(p);
  return r ? formatRate(r) : "—";
};

const rateNote = (p) => rateComparison(p, rateIndex.value)?.text || "";

const areaOf = (p) => [p.region, p.city].filter(Boolean).join(", ") || "—";
const configOf = (p) => bhkConfigsOf(p).join(", ") || "—";

// Only amenities that at least one project has, so the table never shows a
// row of all-empty cells.
const amenityRows = computed(() => {
  const seen = new Map();
  items.value.forEach((p) => {
    (p.amenities || []).forEach((a) => {
      const key = String(a).trim().toLowerCase();
      if (key && !seen.has(key)) seen.set(key, String(a).trim());
    });
  });
  return [...seen.entries()].map(([key, label]) => ({ key, label }));
});

const hasAmenity = (p, key) =>
  (p.amenities || []).some((a) => String(a).trim().toLowerCase() === key);

// The cheapest per-sqft rate is worth calling out.
const bestRateId = computed(() => {
  let best = null;
  items.value.forEach((p) => {
    const r = pricePerSqft(p);
    if (r && (!best || r < best.rate)) best = { id: p._id, rate: r };
  });
  return items.value.length > 1 ? best?.id : null;
});

const goTo = (p) => {
  compare.close();
  router.push(`/project-details/${p._id}`);
};
</script>

<template>
  <!-- ── Docked tray ─────────────────────────────────────────────
       Sits above the mobile List/Map toggle (bottom-6, lg:hidden) on the
       listing pages, and drops to the bottom edge once that toggle is gone. -->
  <Transition name="tray">
    <div
      v-if="items.length && !isOpen"
      class="fixed bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
    >
      <div class="bg-gray-900 text-white rounded-card shadow-e3 p-2.5 flex items-center gap-3">
        <div class="flex items-center gap-2 pl-1.5 shrink-0">
          <div
            v-for="p in items"
            :key="p._id"
            class="relative w-11 h-11 rounded-control overflow-hidden bg-white/10 shrink-0"
          >
            <img
              v-if="p.propertyPictures?.[0]"
              :src="p.propertyPictures[0]"
              :alt="p.projectName"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <button
              @click="compare.remove(p._id)"
              class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-gray-900 flex items-center justify-center shadow"
              :aria-label="`Remove ${p.projectName} from comparison`"
            >
              <i class="pi pi-times text-[7px]"></i>
            </button>
          </div>
          <span
            v-for="n in Math.max(0, 2 - items.length)"
            :key="`slot-${n}`"
            class="w-11 h-11 rounded-control border border-dashed border-white/25 shrink-0"
          ></span>
        </div>

        <p class="text-xs text-white/60 flex-1 min-w-0 hidden sm:block">
          {{ items.length }} of {{ compare.MAX }} selected
        </p>

        <button
          @click="compare.clear()"
          class="text-xs font-semibold text-white/50 hover:text-white transition-colors shrink-0 px-2"
        >
          Clear
        </button>
        <button
          @click="compare.open()"
          :disabled="items.length < 2"
          class="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-control transition-colors shrink-0"
        >
          Compare<span v-if="items.length < 2" class="hidden sm:inline"> (add {{ 2 - items.length }})</span>
        </button>
      </div>
    </div>
  </Transition>

  <!-- ── Comparison sheet ────────────────────────────────────── -->
  <Transition name="sheet">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-6"
      @click.self="compare.close()"
    >
      <div class="bg-white w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] rounded-t-card sm:rounded-card overflow-hidden flex flex-col shadow-e3">
        <!-- Header -->
        <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 class="font-intertight font-bold text-lg text-gray-900">Compare projects</h2>
            <p class="text-xs text-gray-500 mt-0.5">Side by side, on what actually differs</p>
          </div>
          <button
            @click="compare.close()"
            class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close comparison"
          >
            <i class="pi pi-times text-gray-600 text-sm"></i>
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-auto flex-1">
          <table class="w-full text-sm border-collapse">
            <thead class="sticky top-0 bg-white z-10">
              <tr>
                <th class="w-28 sm:w-36"></th>
                <th
                  v-for="p in items"
                  :key="p._id"
                  class="p-3 text-left align-top border-l border-gray-100 min-w-[150px]"
                >
                  <div class="h-20 rounded-control overflow-hidden bg-gray-100 mb-2">
                    <img
                      v-if="p.propertyPictures?.[0]"
                      :src="p.propertyPictures[0]"
                      :alt="p.projectName"
                      class="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p class="font-bold text-gray-900 text-[13px] leading-snug line-clamp-2">
                    {{ p.projectName }}
                  </p>
                  <button
                    @click="compare.remove(p._id)"
                    class="text-[11px] text-gray-400 hover:text-brand transition-colors mt-1"
                  >
                    Remove
                  </button>
                </th>
              </tr>
            </thead>

            <tbody class="align-top">
              <tr class="border-t border-gray-100">
                <td class="p-3 text-xs font-semibold text-gray-500">Builder</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100 text-gray-800">
                  {{ p.builderName || "—" }}
                </td>
              </tr>
              <tr class="border-t border-gray-100 bg-gray-50/60">
                <td class="p-3 text-xs font-semibold text-gray-500">Location</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100 text-gray-800">
                  {{ areaOf(p) }}
                </td>
              </tr>
              <tr class="border-t border-gray-100">
                <td class="p-3 text-xs font-semibold text-gray-500">Price</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100 font-bold text-gray-900">
                  {{ priceRange(p) }}
                </td>
              </tr>
              <tr class="border-t border-gray-100 bg-gray-50/60">
                <td class="p-3 text-xs font-semibold text-gray-500">Rate</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100">
                  <span
                    class="font-bold"
                    :class="p._id === bestRateId ? 'text-green-700' : 'text-gray-900'"
                  >{{ rateOf(p) }}</span>
                  <span
                    v-if="p._id === bestRateId"
                    class="block text-[10px] font-bold text-green-700 mt-0.5"
                  >Lowest rate</span>
                  <span v-if="rateNote(p)" class="block text-[10px] text-gray-500 mt-0.5">
                    {{ rateNote(p) }}
                  </span>
                </td>
              </tr>
              <tr class="border-t border-gray-100">
                <td class="p-3 text-xs font-semibold text-gray-500">Configuration</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100 text-gray-800">
                  {{ configOf(p) }}
                </td>
              </tr>
              <tr class="border-t border-gray-100 bg-gray-50/60">
                <td class="p-3 text-xs font-semibold text-gray-500">Status</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100 text-gray-800">
                  {{ p.projectStatus || "—" }}
                </td>
              </tr>
              <tr class="border-t border-gray-100">
                <td class="p-3 text-xs font-semibold text-gray-500">RERA</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100 text-[11px] text-gray-600 break-all">
                  {{ p.projectReraNumber || "—" }}
                </td>
              </tr>

              <!-- Amenities: only those at least one project offers -->
              <tr v-if="amenityRows.length" class="border-t border-gray-100">
                <td colspan="99" class="px-3 pt-4 pb-1 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Amenities
                </td>
              </tr>
              <tr
                v-for="(a, i) in amenityRows"
                :key="a.key"
                class="border-t border-gray-100"
                :class="i % 2 ? 'bg-gray-50/60' : ''"
              >
                <td class="p-3 text-xs text-gray-500 capitalize">{{ a.label }}</td>
                <td v-for="p in items" :key="p._id" class="p-3 border-l border-gray-100">
                  <i
                    v-if="hasAmenity(p, a.key)"
                    class="pi pi-check text-green-600 text-xs"
                    :aria-label="`${p.projectName} has ${a.label}`"
                  ></i>
                  <span v-else class="text-gray-300" :aria-label="`${p.projectName} does not list ${a.label}`">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer actions -->
        <div class="border-t border-gray-100 p-3 flex gap-2 shrink-0">
          <button
            v-for="p in items"
            :key="p._id"
            @click="goTo(p)"
            class="flex-1 bg-brand hover:bg-brand-dark text-white text-xs font-bold py-3 rounded-control transition-colors truncate px-2"
          >
            View {{ p.projectName }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tray-enter-active,
.tray-leave-active {
  transition: transform var(--dur-3) var(--ease-out), opacity var(--dur-3) var(--ease-out);
}
.tray-enter-from,
.tray-leave-to {
  opacity: 0;
  /* -50% keeps the horizontal centering while sliding up from below */
  transform: translate(-50%, 16px);
}

.sheet-enter-active,
.sheet-leave-active { transition: opacity var(--dur-3) var(--ease-out); }
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }
</style>
