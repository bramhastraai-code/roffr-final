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
const configOf = (p) => bhkConfigsOf(p).join(" · ") || "—";

// Amenities at least one project offers, so no row is entirely empty.
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

// Winners — only meaningful when comparing more than one.
const bestRateId = computed(() => {
  if (items.value.length < 2) return null;
  let best = null;
  items.value.forEach((p) => {
    const r = pricePerSqft(p);
    if (r && (!best || r < best.rate)) best = { id: p._id, rate: r };
  });
  return best?.id || null;
});
const bestEntryId = computed(() => {
  if (items.value.length < 2) return null;
  let best = null;
  items.value.forEach((p) => {
    const v = Number(p.minPrice || 0);
    if (v && (!best || v < best.v)) best = { id: p._id, v };
  });
  return best?.id || null;
});
const mostAmenitiesId = computed(() => {
  if (items.value.length < 2) return null;
  let best = null;
  items.value.forEach((p) => {
    const n = (p.amenities || []).length;
    if (n && (!best || n > best.n)) best = { id: p._id, n };
  });
  return best?.id || null;
});

const goTo = (p) => {
  compare.close();
  router.push(`/project-details/${p._id}`);
};
</script>

<template>
  <!-- ══════════ Docked tray ══════════
       Sits above the mobile List/Map toggle (bottom-6, lg:hidden) on the
       listing pages, and drops to the bottom edge once that toggle is gone. -->
  <Transition name="tray">
    <div
      v-if="items.length && !isOpen"
      class="fixed bottom-24 lg:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl"
    >
      <div
        class="bg-gray-900/95 backdrop-blur-xl ring-1 ring-white/10 text-white rounded-[28px] shadow-[0_16px_50px_rgba(0,0,0,0.4)] px-3 py-3 sm:px-4 flex items-center gap-3"
      >
        <!-- Thumbnails + empty slots -->
        <div class="flex items-center gap-2 shrink-0">
          <div
            v-for="p in items"
            :key="p._id"
            class="relative group/thumb w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-white/10 ring-1 ring-white/15 shrink-0"
            :title="p.projectName"
          >
            <img
              v-if="p.propertyPictures?.[0]"
              :src="p.propertyPictures[0]"
              :alt="p.projectName"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="pi pi-building text-white/40 text-sm"></i>
            </div>
            <button
              @click="compare.remove(p._id)"
              class="absolute inset-0 bg-gray-900/70 opacity-0 group-hover/thumb:opacity-100 focus:opacity-100 flex items-center justify-center transition-opacity duration-150"
              :aria-label="`Remove ${p.projectName} from comparison`"
            >
              <i class="pi pi-trash text-white text-xs"></i>
            </button>
          </div>

          <span
            v-for="n in Math.max(0, 2 - items.length)"
            :key="`slot-${n}`"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-dashed border-white/20 flex items-center justify-center shrink-0"
          >
            <i class="pi pi-plus text-white/25 text-xs"></i>
          </span>
        </div>

        <!-- Label -->
        <div class="flex-1 min-w-0 hidden sm:block pl-1">
          <p class="text-[13px] font-bold leading-tight">
            {{ items.length }} selected
          </p>
          <p class="text-[11px] text-white/45 leading-tight mt-0.5">
            {{ items.length < 2 ? "Add one more to compare" : `Up to ${compare.MAX} projects` }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            @click="compare.clear()"
            class="w-10 h-10 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
            aria-label="Clear all selected projects"
            title="Clear all"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
          <button
            @click="compare.open()"
            :disabled="items.length < 2"
            class="bg-brand hover:bg-brand-dark disabled:bg-white/10 disabled:text-white/35 disabled:cursor-not-allowed text-white text-sm font-bold pl-5 pr-4 py-3 rounded-full transition-colors duration-200 flex items-center gap-2 shadow-lg shadow-brand/25 disabled:shadow-none"
          >
            Compare
            <i class="pi pi-arrow-right text-[11px]"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ══════════ Comparison sheet ══════════ -->
  <Transition name="sheet">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-gray-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      @click.self="compare.close()"
    >
      <div
        class="cmp-panel bg-gray-50 w-full max-w-4xl max-h-[92vh] sm:max-h-[86vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
      >
        <!-- Grab handle (mobile sheet affordance) -->
        <div class="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-white">
          <span class="w-10 h-1 rounded-full bg-gray-300"></span>
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div class="min-w-0">
            <h2 class="font-intertight font-bold text-lg sm:text-xl text-gray-900 leading-tight">
              Compare projects
            </h2>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ items.length }} projects · best values highlighted
            </p>
          </div>
          <button
            @click="compare.close()"
            class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close comparison"
          >
            <i class="pi pi-times text-gray-600 text-sm"></i>
          </button>
        </div>

        <!-- Scrollable comparison -->
        <div class="overflow-auto flex-1 cmp-scroll">
          <table class="w-full text-sm border-separate border-spacing-0">
            <!-- Project headers -->
            <thead>
              <tr>
                <th class="cmp-label-col cmp-sticky-head bg-white w-24 sm:w-36"></th>
                <th
                  v-for="p in items"
                  :key="p._id"
                  class="cmp-sticky-head bg-white px-3 pt-4 pb-3.5 text-left align-top min-w-[160px] sm:min-w-[190px]"
                >
                  <!-- 16:10 keeps every header image the same shape regardless
                       of the source aspect ratio, so the columns line up -->
                  <div class="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-200/70 mb-3">
                    <img
                      v-if="p.propertyPictures?.[0]"
                      :src="p.propertyPictures[0]"
                      :alt="p.projectName"
                      class="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div v-else class="absolute inset-0 flex items-center justify-center">
                      <i class="pi pi-building text-gray-300 text-2xl"></i>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>
                    <button
                      @click="compare.remove(p._id)"
                      class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-brand flex items-center justify-center transition-colors shadow-sm"
                      :aria-label="`Remove ${p.projectName}`"
                    >
                      <i class="pi pi-times text-[10px]"></i>
                    </button>
                  </div>
                  <p class="font-bold text-gray-900 text-[13px] leading-snug line-clamp-2 min-h-[2.4em]">
                    {{ p.projectName }}
                  </p>
                  <p class="text-[11px] text-gray-400 truncate mt-1">
                    {{ p.builderName || "—" }}
                  </p>
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- Key facts -->
              <tr>
                <td :colspan="items.length + 1" class="cmp-section">Key details</td>
              </tr>

              <tr class="cmp-row">
                <td class="cmp-label cmp-label-col">Location</td>
                <td v-for="p in items" :key="p._id" class="cmp-cell text-gray-800">
                  {{ areaOf(p) }}
                </td>
              </tr>

              <tr class="cmp-row cmp-row--alt">
                <td class="cmp-label cmp-label-col">Price</td>
                <td v-for="p in items" :key="p._id" class="cmp-cell">
                  <span class="font-bold text-gray-900">{{ priceRange(p) }}</span>
                  <span v-if="p._id === bestEntryId" class="cmp-badge cmp-badge--win">
                    <i class="pi pi-check text-[8px]"></i> Lowest entry
                  </span>
                </td>
              </tr>

              <tr class="cmp-row">
                <td class="cmp-label cmp-label-col">Rate</td>
                <td v-for="p in items" :key="p._id" class="cmp-cell">
                  <span
                    class="font-bold"
                    :class="p._id === bestRateId ? 'text-green-700' : 'text-gray-900'"
                  >{{ rateOf(p) }}</span>
                  <span v-if="p._id === bestRateId" class="cmp-badge cmp-badge--win">
                    <i class="pi pi-check text-[8px]"></i> Best rate
                  </span>
                  <span v-if="rateNote(p)" class="block text-[10px] text-gray-500 mt-1 leading-snug">
                    {{ rateNote(p) }}
                  </span>
                </td>
              </tr>

              <tr class="cmp-row cmp-row--alt">
                <td class="cmp-label cmp-label-col">Configuration</td>
                <td v-for="p in items" :key="p._id" class="cmp-cell text-gray-800">
                  {{ configOf(p) }}
                </td>
              </tr>

              <tr class="cmp-row">
                <td class="cmp-label cmp-label-col">Status</td>
                <td v-for="p in items" :key="p._id" class="cmp-cell">
                  <span
                    v-if="p.projectStatus"
                    class="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                  >{{ p.projectStatus }}</span>
                  <span v-else class="text-gray-300">—</span>
                </td>
              </tr>

              <tr class="cmp-row cmp-row--alt">
                <td class="cmp-label cmp-label-col">RERA</td>
                <td v-for="p in items" :key="p._id" class="cmp-cell">
                  <span class="text-[11px] text-gray-600 break-all">
                    {{ p.projectReraNumber || "—" }}
                  </span>
                </td>
              </tr>

              <!-- Amenities -->
              <template v-if="amenityRows.length">
                <tr>
                  <td :colspan="items.length + 1" class="cmp-section">
                    Amenities
                    <span class="font-medium text-gray-400 normal-case tracking-normal">
                      · {{ amenityRows.length }} compared
                    </span>
                  </td>
                </tr>

                <tr class="cmp-row">
                  <td class="cmp-label cmp-label-col">Total listed</td>
                  <td v-for="p in items" :key="p._id" class="cmp-cell">
                    <span class="font-bold text-gray-900">{{ (p.amenities || []).length }}</span>
                    <span v-if="p._id === mostAmenitiesId" class="cmp-badge cmp-badge--win">
                      <i class="pi pi-check text-[8px]"></i> Most
                    </span>
                  </td>
                </tr>

                <tr
                  v-for="(a, i) in amenityRows"
                  :key="a.key"
                  class="cmp-row"
                  :class="i % 2 === 0 ? 'cmp-row--alt' : ''"
                >
                  <td class="cmp-label cmp-label-col capitalize">{{ a.label }}</td>
                  <td v-for="p in items" :key="p._id" class="cmp-cell">
                    <span
                      v-if="hasAmenity(p, a.key)"
                      class="w-6 h-6 rounded-full bg-green-50 border border-green-100 inline-flex items-center justify-center"
                      :aria-label="`${p.projectName} has ${a.label}`"
                    >
                      <i class="pi pi-check text-green-600 text-[10px]"></i>
                    </span>
                    <span
                      v-else
                      class="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 inline-flex items-center justify-center text-gray-300 text-[11px]"
                      :aria-label="`${p.projectName} does not list ${a.label}`"
                    >–</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 bg-white px-3 py-3 flex gap-2 shrink-0">
          <button
            v-for="p in items"
            :key="p._id"
            @click="goTo(p)"
            class="flex-1 min-w-0 bg-brand hover:bg-brand-dark text-white text-xs sm:text-[13px] font-bold py-3 rounded-2xl transition-colors duration-200 px-3 flex items-center justify-center gap-1.5"
          >
            <span class="truncate">{{ p.projectName }}</span>
            <i class="pi pi-arrow-right text-[10px] shrink-0"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Table primitives ─────────────────────────────────────────── */
.cmp-section {
  padding: 18px 14px 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  background: #f9fafb;
}

.cmp-row--alt .cmp-label,
.cmp-row--alt .cmp-cell {
  background: #ffffff;
}
.cmp-row .cmp-label,
.cmp-row .cmp-cell {
  background: #f9fafb;
  border-top: 1px solid #f1f2f4;
}

.cmp-label {
  padding: 14px 14px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1.4;
  vertical-align: middle;
}

.cmp-cell {
  padding: 14px 12px;
  vertical-align: middle;
  line-height: 1.5;
  border-left: 1px solid #f1f2f4;
}

/* Row labels stay visible while comparing horizontally on small screens */
.cmp-label-col {
  position: sticky;
  left: 0;
  z-index: 2;
}
.cmp-sticky-head {
  position: sticky;
  top: 0;
  z-index: 3;
  box-shadow: 0 1px 0 #eef0f2;
}
.cmp-label-col.cmp-sticky-head {
  z-index: 4;
}

.cmp-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* breathing room from the value it annotates, on both axes */
  margin-left: 8px;
  margin-top: 4px;
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  vertical-align: middle;
}
.cmp-badge--win {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #d1fae5;
}

/* Slim scrollbars inside the sheet */
.cmp-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.cmp-scroll::-webkit-scrollbar-thumb {
  background: #d5d8dd;
  border-radius: 9999px;
}
.cmp-scroll::-webkit-scrollbar-track { background: transparent; }

/* ── Transitions ──────────────────────────────────────────────── */
.tray-enter-active,
.tray-leave-active {
  transition: transform var(--dur-3) var(--ease-out), opacity var(--dur-3) var(--ease-out);
}
.tray-enter-from,
.tray-leave-to {
  opacity: 0;
  /* -50% preserves the horizontal centering while sliding up */
  transform: translate(-50%, 20px);
}

.sheet-enter-active,
.sheet-leave-active { transition: opacity var(--dur-3) var(--ease-out); }
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }

.sheet-enter-active .cmp-panel,
.sheet-leave-active .cmp-panel {
  transition: transform var(--dur-3) var(--ease-out);
}
.sheet-enter-from .cmp-panel,
.sheet-leave-to .cmp-panel {
  transform: translateY(24px);
}
</style>
