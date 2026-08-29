<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { WHATSAPP } from "@/data/properties.js";
import { ratingOf, starIcon, initialsOf } from "@/utils/brokerDisplay";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  // Video/tour URL — opened directly; without one, the tour is requested on WhatsApp
  tourLink: { type: String, default: "" },
  // Project/property name used in WhatsApp messages
  contextName: { type: String, default: "this property" },
  // Prefilled question for the RIOS AI page; empty hides the Ask R AI card
  riosQuery: { type: String, default: "" },
  // The channel partner assigned to this project (matched by company).
  // null = no partner registered for this company -> generic team card.
  broker: { type: Object, default: null },
  // true = 3 cards side by side on md+ (page band), false = stacked (sidebar)
  horizontal: { type: Boolean, default: false },
});

const emit = defineEmits(["book-visit"]);
const router = useRouter();
const authStore = useAuthStore();

// Partner's own number when assigned, company line otherwise
const contactNumber = computed(() => {
  const raw = String(props.broker?.phoneNumber || "").replace(/\D/g, "");
  return raw.length >= 10 ? raw : WHATSAPP;
});

const wa = (text) =>
  window.open(`https://wa.me/${contactNumber.value}?text=${encodeURIComponent(text)}`, "_blank");

const takeLiveTour = () => {
  if (props.tourLink) window.open(props.tourLink, "_blank");
  else wa(`Hi, I'd like a live video tour of ${props.contextName}. When can we schedule it?`);
};

// Reaching a partner directly is the lead — sign in first. Viewing the card,
// and taking the self-serve video tour, stay open to everyone.
const callRm = () => {
  const message = props.broker
    ? `Hi ${props.broker.name || ""}, I have some questions about ${props.contextName}.`
    : `Hi, I have some questions about ${props.contextName}. Please connect me with an RM.`;
  authStore.requireAuth(() => wa(message));
};

const viewBrokerProfile = () => {
  if (props.broker?._id) router.push(`/channel-partners/${props.broker._id}`);
};

const askRios = () => {
  router.push({ path: "/rios", query: { q: props.riosQuery } });
};
</script>

<template>
  <div class="grid gap-4" :class="horizontal ? 'md:grid-cols-3' : 'grid-cols-1'">

    <!-- ── Card 1: Live tour ─────────────────────────────────── -->
    <div class="va-card bg-[#2A211E] rounded-3xl p-5 flex flex-col">
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-white font-semibold text-lg leading-snug">
          Visit property from<br />your home.
        </h3>
        <span class="flex items-center gap-1.5 text-white text-xs font-medium shrink-0 mt-1">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 va-live-dot" data-loop></span>
          Live
        </span>
      </div>

      <div class="va-glow rounded-full mt-5" data-loop>
        <button
          @click="takeLiveTour"
          class="w-full flex items-center justify-center gap-2.5 bg-[#EFE7DD] hover:bg-white text-gray-900 text-[13px] font-bold tracking-[0.15em] uppercase py-3.5 rounded-full transition-all duration-200 active:scale-[0.98]"
        >
          <i class="pi pi-video text-sm"></i>
          Take a Live Tour
        </button>
      </div>
    </div>

    <!-- ── Card 2: RM assist ─────────────────────────────────── -->
    <div class="va-card bg-[#2A211E] rounded-3xl overflow-hidden flex flex-col">
      <div class="p-5 flex-1">
        <h3 class="text-white font-semibold text-lg leading-snug">
          Our team is here to help you with any questions&rdquo;
        </h3>

        <!-- Assigned channel partner (real, matched by company) -->
        <div v-if="broker" class="flex items-start gap-4 mt-4">
          <img
            v-if="broker.brokerImage"
            :src="broker.brokerImage"
            :alt="broker.name"
            class="w-20 h-24 rounded-xl object-cover shrink-0"
          />
          <div
            v-else
            class="w-20 h-24 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-extrabold shrink-0"
          >
            {{ initialsOf(broker.name) }}
          </div>
          <div class="pt-1 min-w-0">
            <p class="text-white font-semibold text-[15px] truncate">{{ broker.name || "Channel Partner" }}</p>
            <p class="text-white/40 text-xs mt-0.5 truncate">
              Channel Partner · {{ broker.firmName || broker.companyId?.companyName || "Independent" }}
            </p>
            <div class="flex items-center gap-1 mt-2">
              <i
                v-for="i in 5"
                :key="i"
                :class="starIcon(ratingOf(broker), i)"
                class="text-[11px]"
                :style="{ color: ratingOf(broker) >= i - 0.5 ? '#f59e0b' : 'rgba(255,255,255,0.25)' }"
              ></i>
              <span class="text-white/60 text-[11px] font-semibold ml-1">{{ ratingOf(broker).toFixed(1) }}</span>
            </div>
            <button
              @click="viewBrokerProfile"
              class="text-white/70 hover:text-white text-xs mt-2.5 underline underline-offset-2 transition-colors"
            >
              View profile
            </button>
          </div>
        </div>

        <!-- Fallback: no partner registered for this company -->
        <div v-else class="flex items-start gap-4 mt-4">
          <div class="w-20 h-24 rounded-xl bg-[#3A302B] flex items-center justify-center shrink-0">
            <i class="pi pi-users text-white/50 text-2xl"></i>
          </div>
          <div class="pt-1">
            <p class="text-white font-semibold text-[15px]">Relationship Manager</p>
            <p class="text-white/40 text-xs mt-0.5">ROFFR Assist Team</p>
            <p class="text-white/70 text-xs mt-3 leading-relaxed">
              One of our RMs will assist you.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-[#3A302B] px-5 py-4 flex items-center justify-between gap-3">
        <button
          @click="emit('book-visit')"
          class="flex-1 flex items-center justify-center gap-2.5 bg-[#EFE7DD] hover:bg-white text-gray-900 text-[12px] font-bold tracking-[0.15em] uppercase py-3 rounded-full transition-all duration-200 active:scale-[0.98]"
        >
          <i class="pi pi-calendar text-sm"></i>
          Book a Visit
        </button>
        <button
          @click="callRm"
          class="w-12 h-12 rounded-full bg-[#5a4c45] hover:bg-[#6d5c53] text-white flex items-center justify-center shrink-0 transition-colors duration-200"
          title="Talk to us"
        >
          <i class="pi pi-phone text-base"></i>
        </button>
      </div>
    </div>

    <!-- ── Card 3: Ask R AI ──────────────────────────────────── -->
    <div v-if="riosQuery" class="va-card rounded-3xl p-[1.5px] va-ai-border">
      <button
        @click="askRios"
        class="w-full h-full text-left bg-[#17131f] rounded-[22px] p-5 relative overflow-hidden group"
      >
        <div class="flex items-center gap-2.5">
          <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shrink-0">
            <svg class="w-4.5 h-4.5 text-white" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
          </span>
          <h3 class="text-white font-semibold text-lg leading-snug">Ask R AI</h3>
        </div>
        <p class="text-white/60 text-xs mt-3 leading-relaxed">
          Get an instant overview of this property — pros &amp; cons, price analysis, locality insights. Ask anything.
        </p>
        <span class="inline-flex items-center gap-2 mt-4 text-[12px] font-bold tracking-[0.12em] uppercase text-white bg-gradient-to-r from-purple-500 to-rose-500 px-5 py-2.5 rounded-full group-hover:opacity-90 transition-opacity">
          Ask about this property
          <i class="pi pi-arrow-right text-[10px]"></i>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Staggered entrance */
.va-card {
  animation: va-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.va-card:nth-child(2) { animation-delay: 0.12s; }
.va-card:nth-child(3) { animation-delay: 0.24s; }
@keyframes va-enter {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Warm glow around the live-tour button.
   Was an infinite box-shadow animation growing an 18px blur to 70px — the
   most expensive paint on this page. Same breathing look, now a pseudo-element
   halo animating opacity + scale on the compositor. */
.va-glow {
  position: relative;
}
.va-glow::before {
  content: '';
  position: absolute;
  inset: -14px;
  border-radius: 9999px;
  background: radial-gradient(closest-side, rgba(235, 100, 49, 0.55), rgba(235, 49, 49, 0.18) 70%, transparent);
  animation: va-glow-breathe var(--dur-loop) var(--ease-loop) infinite;
  pointer-events: none;
  z-index: -1;
}
@keyframes va-glow-breathe {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.06); }
}

/* Live dot — "ping" ring instead of an animated box-shadow spread */
.va-live-dot {
  position: relative;
}
.va-live-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.55);
  animation: va-live 2.4s var(--ease-loop) infinite;
}
@keyframes va-live {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Static AI gradient border. The animated background-position version
   repainted the whole border every frame for a hue shift nobody tracks. */
.va-ai-border {
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #ef4444, #f97316);
  animation: va-enter 0.6s var(--ease-out) both;
}
</style>
