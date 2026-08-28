<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useGroupBuyStore } from "@/stores/groupBuyStore";
import { fmtINRShort } from "@/data/properties.js";
import { bhkConfigsOf } from "@/utils/bhkDisplay";

const props = defineProps({
  // City the visitor is browsing (e.g. route param on /cities/:city).
  // Empty = generic mode showing all live campaigns.
  city: { type: String, default: "" },
});

const router = useRouter();
const groupBuyStore = useGroupBuyStore();
const { activeCampaigns, campaignsFetched } = storeToRefs(groupBuyStore);

onMounted(() => {
  if (!campaignsFetched.value) groupBuyStore.fetchActiveCampaigns();
});

const norm = (s) => String(s || "").trim().toLowerCase();
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

// All numbers below are real campaign data — slots, fill %, queue size,
// discount tiers, token amount. No fabricated urgency (no fake countdowns).
const deals = computed(() =>
  (activeCampaigns.value || [])
    .filter((c) => c.projectId?._id && (c.status || "ACTIVE") === "ACTIVE")
    .map((c) => {
      const p = c.projectId;
      const joined = Number(c.acceptedMembersCount || 0);
      const slots = Number(c.memberLimit || 0) || 30;
      const slotsLeft = Math.max(0, slots - joined);
      const pct = Math.min(100, Math.round((joined / slots) * 100));
      const tierMax = Math.max(
        0,
        ...(c.discountTiers || []).map((t) => Number(t.discountPercent) || 0),
      );
      const bestPct = Math.max(Number(c.currentDiscountPercent) || 0, tierMax);
      const base = Number(p.minPrice || 0);
      return {
        id: c._id,
        projectId: p._id,
        name: p.projectName || "Project",
        city: cap(norm(p.city)),
        image: p.propertyPictures?.[0] || "",
        bhks: bhkConfigsOf(p),
        minPrice: base,
        groupPrice: base && bestPct ? base * (1 - bestPct / 100) : 0,
        savings: base && bestPct ? Math.round((base * bestPct) / 100) : 0,
        joined,
        slots,
        slotsLeft,
        pct,
        bestPct,
        queue: Number(c.totalRequestsCount || 0),
        token: Number(c.tokenAmount || 0),
        inCity: props.city ? norm(p.city) === norm(props.city) : false,
        urgency:
          slotsLeft <= Math.ceil(slots * 0.2)
            ? "🔥 Almost full"
            : pct >= 60
              ? "⚡ Filling fast"
              : "◉ Open now",
      };
    })
    // City matches first, then the most-filled (most urgent) first
    .sort((a, b) => (b.inCity - a.inCity) || b.pct - a.pct),
);

const cityMatches = computed(() => deals.value.filter((d) => d.inCity));
const cityLabel = computed(() => cap(props.city));

const otherCityNames = computed(() =>
  [...new Set(deals.value.filter((d) => !d.inCity).map((d) => d.city).filter(Boolean))].slice(0, 3),
);

const headline = computed(() => {
  if (props.city && cityMatches.value.length) {
    const n = cityMatches.value.length;
    return `${n} Group Buy${n === 1 ? "" : "s"} LIVE in ${cityLabel.value}`;
  }
  if (props.city && deals.value.length) {
    return `Buyers in ${otherCityNames.value.join(", ")} are saving lakhs right now`;
  }
  return `${deals.value.length} Group Buys LIVE right now`;
});

const subline = computed(() => {
  if (props.city && !cityMatches.value.length) {
    return `No live group buy in ${cityLabel.value} yet — join one below before it fills, or be first when ${cityLabel.value} goes live.`;
  }
  return "Every member who joins unlocks a bigger discount for the whole group. Slots are first-come, first-serve — when it's full, it's gone.";
});

// Marquee ticker built from real campaign facts, duplicated for seamless loop
const tickerItems = computed(() => {
  const items = deals.value.map(
    (d) =>
      `🔥 ${d.name}${d.city ? ` · ${d.city}` : ""} — ${d.slotsLeft} slot${d.slotsLeft === 1 ? "" : "s"} left${d.bestPct ? ` · up to ${d.bestPct}% OFF` : ""}`,
  );
  return [...items, ...items];
});

const goToDeal = (d) => router.push(`/project-details/${d.projectId}`);
</script>

<template>
  <section v-if="deals.length" class="my-8">
    <div class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#131735] via-[#1a2b5f] to-[#45101a]">

      <!-- Glow accents -->
      <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#EB3131]/20 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

      <!-- Ticker -->
      <div class="relative border-b border-white/10 overflow-hidden">
        <div class="fomo-ticker flex items-center gap-10 whitespace-nowrap py-2.5">
          <span
            v-for="(t, i) in tickerItems"
            :key="i"
            class="text-[11px] font-semibold text-white/70 tracking-wide shrink-0"
          >{{ t }}</span>
        </div>
      </div>

      <div class="relative px-5 md:px-8 pt-6 pb-7">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EB3131] text-white uppercase tracking-wide mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
              Live Group Buying
            </span>
            <h2 class="font-intertight font-bold text-[22px] md:text-[30px] text-white leading-tight">
              {{ headline }}
            </h2>
            <p class="text-white/60 text-sm mt-1.5 max-w-xl">{{ subline }}</p>
          </div>

          <router-link
            to="/group"
            class="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors"
          >
            How group buying works
            <i class="pi pi-arrow-right text-[10px]"></i>
          </router-link>
        </div>

        <!-- Deal cards -->
        <div class="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-thin">
          <article
            v-for="d in deals"
            :key="d.id"
            @click="goToDeal(d)"
            class="group snap-start shrink-0 w-[300px] md:w-[350px] bg-white rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:-translate-y-1 transition-transform duration-300"
          >
            <!-- Image -->
            <div class="relative h-36 bg-gray-200">
              <div
                class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                :style="d.image ? { backgroundImage: `url('${d.image}')` } : {}"
              ></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

              <!-- Urgency ribbon -->
              <span class="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                {{ d.urgency }}
              </span>
              <!-- Discount -->
              <span
                v-if="d.bestPct"
                class="absolute top-3 right-3 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#EB3131] text-white shadow"
              >
                {{ d.bestPct }}% OFF
              </span>

              <!-- City + name -->
              <div class="absolute bottom-2.5 left-3 right-3">
                <h3 class="text-white font-bold text-[15px] leading-tight truncate drop-shadow">{{ d.name }}</h3>
                <p v-if="d.city" class="text-white/80 text-[11px] flex items-center gap-1 mt-0.5">
                  <i class="pi pi-map-marker text-[9px]"></i>{{ d.city }}
                </p>
              </div>
            </div>

            <!-- Body -->
            <div class="p-4">
              <!-- BHK + price row -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1 flex-wrap">
                  <span
                    v-for="b in d.bhks"
                    :key="b"
                    class="text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5"
                  >{{ b }}</span>
                </div>
                <div class="text-right shrink-0">
                  <div v-if="d.groupPrice" class="text-[15px] font-extrabold text-green-600 leading-none">
                    {{ fmtINRShort(d.groupPrice) }}
                  </div>
                  <div v-if="d.minPrice && d.bestPct" class="text-[11px] text-gray-400 line-through leading-none mt-1">
                    {{ fmtINRShort(d.minPrice) }}
                  </div>
                  <div v-else-if="d.minPrice && !d.bestPct" class="text-[15px] font-extrabold text-gray-800 leading-none">
                    {{ fmtINRShort(d.minPrice) }}
                  </div>
                </div>
              </div>

              <!-- Savings hook -->
              <div v-if="d.savings" class="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <span class="text-sm">🏷️</span>
                <span class="text-[12px] text-green-700 font-semibold">Save up to {{ fmtINRShort(d.savings) }} by joining this group</span>
              </div>

              <!-- Progress -->
              <div class="mt-3">
                <div class="flex items-center justify-between text-[11px] mb-1.5">
                  <span class="font-semibold text-gray-700">{{ d.joined }}/{{ d.slots }} joined</span>
                  <span class="font-bold text-[#EB3131]">{{ d.slotsLeft }} slots left</span>
                </div>
                <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-[#E8820C] to-[#EB3131] transition-all duration-700"
                    :style="{ width: `${Math.max(d.pct, 4)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Social proof + token -->
              <div class="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                <span v-if="d.queue" class="flex items-center gap-1">
                  <i class="pi pi-eye text-gray-400 text-[10px]"></i>
                  {{ d.queue }} buyer{{ d.queue === 1 ? "" : "s" }} already in queue
                </span>
                <span v-else></span>
                <span v-if="d.token" class="font-semibold text-gray-600">
                  Reserve with {{ fmtINRShort(d.token) }}
                </span>
              </div>

              <!-- CTA -->
              <button
                class="mt-3.5 w-full bg-[#EB3131] hover:bg-[#c72828] text-white text-sm font-bold py-2.5 rounded-xl transition-colors duration-200 active:scale-[0.98]"
                @click.stop="goToDeal(d)"
              >
                Join the Group →
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fomo-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.fomo-ticker {
  width: max-content;
  animation: fomo-marquee 22s linear infinite;
}
.fomo-ticker:hover {
  animation-play-state: paused;
}
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
</style>
