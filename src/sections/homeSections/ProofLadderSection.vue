<script setup>
import { fmtINRShort } from "@/data/properties.js";
import { useCountUp } from "@/composables/useCountUp";

// Real proof, from content that already exists but was unreachable.
//
// src/dummyData/case-study.js holds three written case studies with structured
// `meta` objects, rendered only at /case-details/:slug — a route nothing in
// the app linked to. This surfaces the two strongest and restores that link.
//
// Deliberately excludes cs-1: it refers to the product as "TogetherBuying"
// rather than Roffr throughout, so it isn't safe to put on the homepage.
//
// These are figures from two specific deals, not a claim about typical
// savings — the copy below says so explicitly.

// --- Anuj (cs-3): the three-rung ladder, the clearest proof of the mechanic
const LADDER = [
  {
    key: "list",
    label: "Builder's list price",
    sub: "What was on the brochure",
    value: 30_000_000,
    tone: "muted",
  },
  {
    key: "solo",
    label: "After negotiating alone",
    sub: "Anuj's own best offer",
    value: 28_500_000,
    tone: "mid",
  },
  {
    key: "group",
    label: "With a Roffr group",
    sub: "4 buyers, one negotiation",
    value: 27_000_000,
    tone: "brand",
  },
];

const TOP = LADDER[0].value;
// Bar widths are relative, floored so the shortest bar is still readable.
const widthFor = (v) => `${Math.round(35 + (v / TOP) * 65)}%`;

const extraSaving = LADDER[1].value - LADDER[2].value; // ₹15 L beyond haggling
const totalSaving = LADDER[0].value - LADDER[2].value; // ₹30 L vs list

// Count the headline saving up when the section scrolls into view.
const { value: savedLakh, watchEl } = useCountUp(Math.round(extraSaving / 100000));

// --- Raghav (cs-2): the headline number
const raghav = {
  slug: "how-raghav-saved-with-group-buying",
  name: "Raghav",
  cover: "/dummy/dummy-case2.webp",
  saved: 4_770_000,
  original: 47_700_000,
  project: "Tulip Melrose, Gurugram",
  rateBefore: 14_832,
  rateAfter: 13_349,
};

const anujSlug = "how-anuj-saved-with-group-buying";

const toneClass = (tone) => {
  if (tone === "brand") return "bg-gradient-to-r from-brand to-brand-amber";
  if (tone === "mid") return "bg-gray-400";
  return "bg-gray-300";
};
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 xl:px-0 py-14">
    <!-- Header -->
    <div v-reveal class="max-w-2xl mb-8">
      <span
        class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 uppercase tracking-wide mb-3"
      >
        <i class="pi pi-verified text-[9px]"></i>
        Real buyers, real numbers
      </span>
      <h2 class="font-intertight font-bold text-[26px] md:text-[36px] text-ink leading-tight">
        Anuj negotiated hard on his own.<br class="hidden sm:block" />
        The group still beat his best price.
      </h2>
      <p class="text-gray-500 text-sm md:text-base mt-3 leading-relaxed">
        He'd already talked the builder down ₹15 lakh before he found Roffr.
        Joining three other buyers on the same project took another ₹15 lakh off.
      </p>
    </div>

    <div class="grid lg:grid-cols-[1.35fr_1fr] gap-5">
      <!-- ── The ladder ─────────────────────────────────────── -->
      <!-- :ref (function ref) — useCountUp starts the count when this scrolls in -->
      <div
        :ref="watchEl"
        v-reveal
        class="rounded-card border border-gray-200 bg-white shadow-e1 p-6 md:p-8"
      >
        <div class="flex items-baseline justify-between gap-4 flex-wrap mb-6">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Krisumi 3 BHK · Gurugram
            </p>
            <p class="text-sm text-gray-500 mt-1">Same flat, three different prices</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-extrabold text-brand leading-none tabular-nums">
              ₹{{ savedLakh }} L
            </p>
            <p class="text-[11px] text-gray-400 mt-1">extra, versus going alone</p>
          </div>
        </div>

        <!-- Rungs -->
        <div class="space-y-4">
          <div
            v-for="(rung, i) in LADDER"
            :key="rung.key"
            v-reveal="{ y: 12, delay: i * 110 }"
          >
            <div class="flex items-baseline justify-between gap-3 mb-1.5">
              <p
                class="text-[13px] font-semibold"
                :class="rung.tone === 'brand' ? 'text-gray-900' : 'text-gray-500'"
              >
                {{ rung.label }}
                <span class="font-normal text-gray-400 hidden sm:inline">· {{ rung.sub }}</span>
              </p>
              <p
                class="text-[15px] font-extrabold tabular-nums shrink-0"
                :class="rung.tone === 'brand' ? 'text-brand' : 'text-gray-500'"
              >
                {{ fmtINRShort(rung.value) }}
              </p>
            </div>
            <div class="h-9 rounded-control bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-control pl-flow"
                :class="toneClass(rung.tone)"
                :style="{ width: widthFor(rung.value) }"
              ></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 flex-wrap mt-6 pt-5 border-t border-gray-100">
          <p class="text-sm text-gray-600">
            <span class="font-bold text-gray-900">{{ fmtINRShort(totalSaving) }}</span>
            off the list price in total
          </p>
          <router-link
            :to="`/case-details/${anujSlug}`"
            class="text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1.5"
          >
            Read Anuj's story
            <i class="pi pi-arrow-right text-[10px]"></i>
          </router-link>
        </div>
      </div>

      <!-- ── Raghav card ────────────────────────────────────── -->
      <router-link
        :to="`/case-details/${raghav.slug}`"
        v-reveal="{ y: 16, delay: 120 }"
        class="group rounded-card border border-gray-200 bg-white shadow-e1 overflow-hidden flex flex-col hover:shadow-e2 hover:border-gray-300 transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-1"
      >
        <div class="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <img
            :src="raghav.cover"
            :alt="`${raghav.name}'s home at ${raghav.project}`"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
          <div class="absolute bottom-4 left-5 right-5">
            <p class="text-white/70 text-[11px] font-semibold uppercase tracking-wider">
              {{ raghav.name }} saved
            </p>
            <p class="text-white font-intertight font-extrabold text-[30px] leading-none mt-1">
              {{ fmtINRShort(raghav.saved) }}
            </p>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <p class="text-sm text-gray-700 leading-relaxed">
            On a {{ fmtINRShort(raghav.original) }} home at
            <span class="font-semibold text-gray-900">{{ raghav.project }}</span>.
          </p>

          <div class="flex items-center gap-2 mt-4 text-[12px]">
            <span class="text-gray-400 line-through tabular-nums">
              ₹{{ raghav.rateBefore.toLocaleString('en-IN') }}/sqft
            </span>
            <i class="pi pi-arrow-right text-gray-300 text-[9px]"></i>
            <span class="font-bold text-green-700 tabular-nums">
              ₹{{ raghav.rateAfter.toLocaleString('en-IN') }}/sqft
            </span>
          </div>

          <span class="mt-auto pt-4 text-sm font-semibold text-brand inline-flex items-center gap-1.5">
            Read the full story
            <i class="pi pi-arrow-right text-[10px] transition-transform duration-200 group-hover:translate-x-1"></i>
          </span>
        </div>
      </router-link>
    </div>

    <p v-reveal class="text-[11px] text-gray-400 mt-5 max-w-3xl leading-relaxed">
      Figures from two completed purchases. What a group achieves depends on the
      project, the developer and how many buyers join.
    </p>
  </section>
</template>

<style scoped>
/* Bars grow from the left as they reveal, rather than popping in at width. */
.pl-flow {
  transform-origin: left center;
  animation: pl-grow 620ms var(--ease-out) both;
}
@keyframes pl-grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
</style>
