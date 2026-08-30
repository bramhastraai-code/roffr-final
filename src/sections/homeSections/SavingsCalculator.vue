<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  fmtINRShort,
  calcEMI,
  DISCOUNT_MIN,
  DISCOUNT_MAX,
  DISCOUNT_RANGE,
} from "@/data/properties.js";

// "What would you save?" — the one element on the page a visitor can play with.
//
// Uses calcEMI() and fmtINRShort() from src/data/properties.js: calcEMI has
// existed unused since the project started, and routing every figure through
// fmtINRShort keeps this section out of the ~10 competing price formatters
// scattered across the app.
const router = useRouter();

// ₹25 L → ₹5 Cr, stepping in lakhs.
const MIN = 2_500_000;
const MAX = 50_000_000;
const STEP = 500_000;

const budget = ref(10_000_000); // ₹1 Cr — a realistic default

// Loan assumptions, shown openly so the EMI figure isn't a black box.
const DOWN_PCT = 20;
const YEARS = 20;
const RATE = 8.5;

const saveLow = computed(() => Math.round((budget.value * DISCOUNT_MIN) / 100));
const saveHigh = computed(() => Math.round((budget.value * DISCOUNT_MAX) / 100));

const priceLow = computed(() => budget.value - saveHigh.value); // best case
const priceHigh = computed(() => budget.value - saveLow.value);

const emiBefore = computed(() => calcEMI(budget.value, DOWN_PCT, YEARS, RATE));
const emiAfter = computed(() => calcEMI(priceLow.value, DOWN_PCT, YEARS, RATE));
const emiDrop = computed(() => Math.max(0, emiBefore.value - emiAfter.value));

// Percentage along the track, used for the gradient fill.
const progress = computed(
  () => ((budget.value - MIN) / (MAX - MIN)) * 100,
);

// Hand off to the real search with the matching budget filter. These keys are
// the ones SearchView already validates, so the results page opens filtered.
const priceKeyForBudget = computed(() => {
  const b = budget.value;
  if (b < 5_000_000) return "u50";
  if (b < 10_000_000) return "50to100";
  if (b < 30_000_000) return "100to300";
  return "above300";
});

const seeDeals = () => {
  router.push({ path: "/search", query: { priceKey: priceKeyForBudget.value } });
};
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 xl:px-0 py-14">
    <div
      v-reveal
      class="rounded-card border border-gray-200 bg-white shadow-e1 overflow-hidden"
    >
      <div class="grid lg:grid-cols-[1.05fr_1fr]">
        <!-- ── Controls ─────────────────────────────────────── -->
        <div class="p-6 md:p-9">
          <span
            class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand uppercase tracking-wide mb-3"
          >
            <i class="pi pi-calculator text-[9px]"></i>
            Savings calculator
          </span>
          <h2 class="font-intertight font-bold text-[26px] md:text-[34px] text-ink leading-tight">
            What would you save?
          </h2>
          <p class="text-gray-500 text-sm mt-2.5 leading-relaxed">
            Move the slider to your budget and see what buying with a group
            could take off the price.
          </p>

          <!-- Slider -->
          <div class="mt-8">
            <div class="flex items-baseline justify-between gap-3 mb-3">
              <label for="budget-slider" class="text-xs font-semibold text-gray-500">
                Your budget
              </label>
              <output
                for="budget-slider"
                class="text-2xl md:text-3xl font-extrabold text-gray-900 tabular-nums"
              >
                {{ fmtINRShort(budget) }}
              </output>
            </div>

            <input
              id="budget-slider"
              v-model.number="budget"
              type="range"
              :min="MIN"
              :max="MAX"
              :step="STEP"
              class="sc-slider w-full"
              :style="{ '--fill': `${progress}%` }"
              :aria-valuetext="`${fmtINRShort(budget)} budget`"
            />

            <div class="flex justify-between text-[11px] text-gray-400 mt-2">
              <span>{{ fmtINRShort(MIN) }}</span>
              <span>{{ fmtINRShort(MAX) }}+</span>
            </div>
          </div>

          <!-- EMI comparison -->
          <div class="mt-7 rounded-control bg-gray-50 border border-gray-200 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[11px] text-gray-500">Monthly EMI could drop by</p>
                <p class="text-lg font-extrabold text-green-700 leading-tight mt-0.5 tabular-nums">
                  {{ fmtINRShort(emiDrop) }}<span class="text-xs font-semibold text-gray-400">/mo</span>
                </p>
              </div>
              <div class="text-right">
                <p class="text-[11px] text-gray-400 line-through tabular-nums">
                  {{ fmtINRShort(emiBefore) }}
                </p>
                <p class="text-sm font-bold text-gray-900 tabular-nums">
                  {{ fmtINRShort(emiAfter) }}
                </p>
              </div>
            </div>
            <p class="text-[10px] text-gray-400 mt-2.5 leading-relaxed">
              Assumes {{ DOWN_PCT }}% down payment, {{ YEARS }}-year loan at {{ RATE }}% p.a.
            </p>
          </div>
        </div>

        <!-- ── Result ───────────────────────────────────────── -->
        <div class="relative bg-gradient-to-br from-[#1a2b5f] via-[#22336b] to-[#3b1230] p-6 md:p-9 flex flex-col justify-center">
          <img
            src="/svg/calculateSection/saving-img.svg"
            alt=""
            aria-hidden="true"
            class="absolute right-5 bottom-5 w-28 opacity-15 pointer-events-none select-none"
            loading="lazy"
            decoding="async"
          />

          <div class="relative">
            <p class="text-white/60 text-xs font-semibold uppercase tracking-wider">
              You could save
            </p>
            <p class="font-intertight font-extrabold text-white text-[38px] md:text-[46px] leading-none mt-2 tabular-nums">
              {{ fmtINRShort(saveLow) }} – {{ fmtINRShort(saveHigh) }}
            </p>
            <p class="text-white/50 text-sm mt-2">
              that's {{ DISCOUNT_RANGE }} off {{ fmtINRShort(budget) }}
            </p>

            <div class="h-px bg-white/15 my-6"></div>

            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-white/50 text-[11px]">List price</p>
                <p class="text-white/70 text-lg font-bold line-through tabular-nums">
                  {{ fmtINRShort(budget) }}
                </p>
              </div>
              <i class="pi pi-arrow-right text-white/30 text-sm"></i>
              <div class="text-right">
                <p class="text-white/50 text-[11px]">Group price</p>
                <p class="text-white text-lg font-extrabold tabular-nums">
                  {{ fmtINRShort(priceLow) }} – {{ fmtINRShort(priceHigh) }}
                </p>
              </div>
            </div>

            <button
              @click="seeDeals"
              class="mt-7 w-full bg-white hover:bg-gray-100 text-gray-900 text-sm font-bold py-3.5 rounded-control transition-colors duration-200 flex items-center justify-center gap-2"
            >
              See group deals in this range
              <i class="pi pi-arrow-right text-[11px]"></i>
            </button>

            <!-- Honest framing: this illustrates the stated range, it is not a quote -->
            <p class="text-white/35 text-[10px] mt-3 leading-relaxed text-center">
              An illustration based on our typical {{ DISCOUNT_RANGE }} range.
              Actual savings depend on the project and how many buyers join.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Range input styled without a library. Track fill is driven by --fill so the
   filled portion tracks the thumb. */
.sc-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #eb3131 0%,
    #e8820c var(--fill, 0%),
    #e5e7eb var(--fill, 0%),
    #e5e7eb 100%
  );
  outline: none;
  cursor: pointer;
}

.sc-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background: #fff;
  border: 3px solid #eb3131;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.18);
  cursor: grab;
  transition: transform 0.15s ease;
}
.sc-slider::-webkit-slider-thumb:hover { transform: scale(1.12); }
.sc-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.05); }

.sc-slider::-moz-range-thumb {
  width: 26px;
  height: 26px;
  border-radius: 9999px;
  background: #fff;
  border: 3px solid #eb3131;
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.18);
  cursor: grab;
}
.sc-slider::-moz-range-track { background: transparent; }

.sc-slider:focus-visible {
  outline: 2px solid #eb3131;
  outline-offset: 4px;
}
</style>
