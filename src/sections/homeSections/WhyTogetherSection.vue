<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { DISCOUNT_RANGE } from "@/data/properties.js";

// Answers "what IS this?" before any deal is shown.
//
// The homepage says "Group Buying" six times above the fold and never defines
// it — the first explanation is ~9 sections down. This explains the MECHANISM
// (why does grouping lower the price?), which is different from HowItWorks.vue
// below it, which covers the process steps.
const groupBuyStore = useGroupBuyStore();
const { activeCampaigns } = storeToRefs(groupBuyStore);

onMounted(() => {
  if (!groupBuyStore.campaignsFetched) groupBuyStore.fetchActiveCampaigns();
});

// Prefer the real tier ladder from a live campaign; fall back to the canonical
// claim when nothing is running. Never invents a tier that doesn't exist.
const tiers = computed(() => {
  const withTiers = (activeCampaigns.value || []).find(
    (c) => Array.isArray(c.discountTiers) && c.discountTiers.length,
  );
  if (!withTiers) return [];
  return [...withTiers.discountTiers]
    .map((t) => ({
      members: Number(t.minMembers) || 0,
      percent: Number(t.discountPercent) || 0,
    }))
    .filter((t) => t.members && t.percent)
    .sort((a, b) => a.members - b.members);
});

const alonePoints = [
  "You negotiate against a developer who does this every day",
  "One flat costs the builder nothing to lose",
  "You pay the price on the brochure",
];

const togetherPoints = [
  "We bring several confirmed buyers to the same project",
  "Selling four flats at once is worth a discount to the builder",
  "Everyone in the group gets the same lower price",
];
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 xl:px-0 py-14">
    <!-- Header -->
    <div v-reveal class="max-w-2xl">
      <span
        class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand uppercase tracking-wide mb-3"
      >
        <i class="pi pi-users text-[9px]"></i>
        Why together costs less
      </span>
      <h2 class="font-intertight font-bold text-[26px] md:text-[36px] text-ink leading-tight">
        One buyer asks for a discount.<br class="hidden sm:block" />
        Four buyers change the price.
      </h2>
      <p class="text-gray-500 text-sm md:text-base mt-3 leading-relaxed">
        A builder has no reason to drop the price for one flat. Give them four
        confirmed buyers at once and the maths changes — that's the whole idea.
      </p>
    </div>

    <!-- The face-off -->
    <div class="grid md:grid-cols-2 gap-4 md:gap-5 mt-8 items-stretch">
      <!-- ── On your own ─────────────────────────────────── -->
      <div
        v-reveal="{ y: 16 }"
        class="rounded-card border border-gray-200 bg-gray-50 overflow-hidden flex flex-col"
      >
        <!-- One person, cash on one side and a house on the other: the trade
             you make alone, at the price on the brochure. -->
        <div class="relative aspect-[16/9] bg-gray-200 overflow-hidden">
          <img
            src="/images/HomePage/groupSection/group4.webp"
            alt="One person holding cash in one hand and a model house in the other"
            class="absolute inset-0 w-full h-full object-cover grayscale-[35%]"
            loading="lazy"
            decoding="async"
            width="640"
            height="360"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent"></div>
          <div class="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
            <div>
              <p class="text-white font-bold text-[16px] leading-tight">On your own</p>
              <p class="text-white/60 text-[12px] font-semibold mt-0.5">You pay the list price</p>
            </div>
            <span
              class="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <i class="pi pi-user text-white text-sm"></i>
            </span>
          </div>
        </div>

        <ul class="p-5 md:p-6 space-y-3 flex-1">
          <li
            v-for="point in alonePoints"
            :key="point"
            class="flex items-start gap-2.5 text-sm leading-relaxed text-gray-500"
          >
            <i class="pi pi-minus text-[10px] mt-1.5 shrink-0 text-gray-300"></i>
            {{ point }}
          </li>
        </ul>
      </div>

      <!-- ── With a Roffr group ──────────────────────────── -->
      <div
        v-reveal="{ y: 16, delay: 90 }"
        class="rounded-card border border-brand/30 bg-white shadow-e2 ring-1 ring-brand/10 overflow-hidden flex flex-col"
      >
        <!-- Several buyers, one home: the whole proposition in one picture. -->
        <div class="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          <img
            src="/images/GroupBuy/hero.webp"
            alt="A group of buyers gathered around a single model home"
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            width="640"
            height="360"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"></div>
          <div class="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
            <div>
              <p class="text-white font-bold text-[16px] leading-tight">With a Roffr group</p>
              <p class="text-brand-gold text-[12px] font-bold mt-0.5">
                {{ DISCOUNT_RANGE }} lower
              </p>
            </div>
            <span
              class="w-9 h-9 rounded-full bg-brand flex items-center justify-center shrink-0 shadow-lg"
              aria-hidden="true"
            >
              <i class="pi pi-users text-white text-sm"></i>
            </span>
          </div>
        </div>

        <div class="p-5 md:p-6 flex-1 flex flex-col">
          <ul class="space-y-3">
            <li
              v-for="point in togetherPoints"
              :key="point"
              class="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700"
            >
              <i class="pi pi-check text-[11px] mt-1 shrink-0 text-green-600"></i>
              {{ point }}
            </li>
          </ul>

          <!-- Tier note, folded in here rather than sprawling across its own
               full-width row below — it's a property of group buying, so it
               belongs on this card. -->
          <div class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
            <p class="text-[12px] font-semibold text-gray-500 shrink-0">
              More members, bigger discount:
            </p>
            <div v-if="tiers.length" class="flex items-center gap-1.5 flex-wrap">
              <span
                v-for="t in tiers"
                :key="t.members"
                class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand border border-brand/15"
              >
                {{ t.members }}+ → {{ t.percent }}% off
              </span>
            </div>
            <span
              v-else
              class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand border border-brand/15"
            >
              typically {{ DISCOUNT_RANGE }} off
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
