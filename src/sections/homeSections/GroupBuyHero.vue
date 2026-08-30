<script setup>
import { useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const router = useRouter();
const heroModules = [Autoplay, Pagination];

const partners = [
  { name: "DLF", abbr: "DLF", projects: 128, bg: "bg-gray-100", textColor: "text-gray-800" },
  { name: "Godrej Properties", abbr: "Godrej", projects: 95, bg: "bg-black", textColor: "text-white" },
  { name: "Lodha", abbr: "LODHA", projects: 112, bg: "bg-gray-50", textColor: "text-gray-700" },
  { name: "Prestige Group", abbr: "Prestige", projects: 87, bg: "bg-gray-50", textColor: "text-gray-800" },
  { name: "Metropolis", abbr: "Metro", projects: 64, bg: "bg-[#f5ede0]", textColor: "text-gray-700" },
  { name: "Omaxe", abbr: "OMAXE", projects: 76, bg: "bg-[#0057a8]", textColor: "text-white" },
  { name: "World Street", abbr: "WS", projects: 43, bg: "bg-gray-50", textColor: "text-gray-800" },
];

const stats = [
  { icon: "pi-percentage", iconBg: "bg-purple-100", iconColor: "text-purple-600", value: "Up to 15%", label: "Better pricing" },
  { icon: "pi-tag",        iconBg: "bg-red-100",    iconColor: "text-[#EB3131]",   value: "₹ 2 Cr+",   label: "Total savings" },
  { icon: "pi-users",      iconBg: "bg-teal-100",   iconColor: "text-teal-600",    value: "500+",       label: "Deals completed" },
];
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 xl:px-0 py-6 mt-24">

    <!-- ── Hero banner carousel ─────────────────────────────────── -->
    <Swiper
      :modules="heroModules"
      :slides-per-view="1"
      :loop="true"
      :speed="700"
      :autoplay="{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }"
      :pagination="{ clickable: true }"
      class="hero-swiper rounded-[40px] overflow-hidden"
    >

      <!-- ═══ Slide 1: Group Buying (blue) ═══ -->
      <SwiperSlide>
        <div class="flex flex-col md:flex-row md:h-[380px] xl:h-[420px]"
             style="background: linear-gradient(135deg, #ddeeff 0%, #f4f8ff 45%, #e6efff 100%);">

          <div class="flex flex-col justify-center px-8 md:px-12 py-14 w-full md:w-[55%] shrink-0">
            <div class="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 text-[#1a2b5f] text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit mb-4 shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
              India's #1 Group Buying Platform
            </div>

            <h1 class="font-intertight font-bold leading-tight">
              <span class="block text-[28px] md:text-[38px] xl:text-[46px] text-[#1a2b5f]">Group Buying</span>
              <span class="block text-[32px] md:text-[44px] xl:text-[54px] text-[#EB3131]">Property Deals</span>
            </h1>

            <p class="mt-2 text-gray-500 text-sm md:text-[15px] font-medium">
              Buy together. Save up to <span class="font-bold text-[#1a2b5f]">15%</span> on your dream home.
            </p>

            <div class="flex items-center gap-3 mt-5 flex-wrap">
              <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                <i class="pi pi-verified text-green-500 text-xs"></i>
                <span class="text-[11px] font-semibold text-gray-700">RERA Verified</span>
              </div>
              <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                <span class="text-amber-500 font-bold text-[11px]">%</span>
                <span class="text-[11px] font-semibold text-gray-700">Lowest Group Price</span>
              </div>
              <div class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
                <i class="pi pi-shield text-blue-500 text-xs"></i>
                <span class="text-[11px] font-semibold text-gray-700">100% Transparent</span>
              </div>
            </div>

            <button
              @click="router.push('/project')"
              class="mt-7 w-fit flex items-center gap-2 bg-[#EB3131] hover:bg-[#c72828] text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5"
            >
              Explore Deals
              <i class="pi pi-arrow-right text-xs"></i>
            </button>
          </div>

          <div class="relative flex-1 flex items-end justify-center min-h-[220px]">
            <img
              src="/images/heroSection/building-hero.webp"
              alt="Properties"
              class="h-full w-full object-contain object-bottom"
            />
            <div class="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 z-10">
              <div
                v-for="stat in stats"
                :key="stat.value"
                class="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg shadow-blue-100/60 min-w-[185px] border border-white"
              >
                <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="stat.iconBg">
                  <i class="pi text-sm" :class="[stat.icon, stat.iconColor]"></i>
                </div>
                <div>
                  <div class="text-[14px] font-bold text-gray-900 leading-tight">{{ stat.value }}</div>
                  <div class="text-[10px] text-gray-400 leading-none mt-0.5">{{ stat.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SwiperSlide>

      <!-- ═══ Slide 2: Live Group Buys (warm amber) ═══ -->
      <SwiperSlide>
        <div class="flex flex-col md:flex-row md:h-[380px] xl:h-[420px]"
             style="background: linear-gradient(135deg, #fff1e4 0%, #fff8f0 45%, #ffe8dc 100%);">

          <div class="flex flex-col justify-center px-8 md:px-12 py-14 w-full md:w-[55%] shrink-0">
            <div class="inline-flex items-center gap-1.5 bg-[#EB3131] text-white text-[11px] font-bold px-3 py-1.5 rounded-full w-fit mb-4 shadow-sm uppercase tracking-wide">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span>
              Live Now
            </div>

            <h1 class="font-intertight font-bold leading-tight">
              <span class="block text-[28px] md:text-[38px] xl:text-[46px] text-[#7c2d12]">Join a Live</span>
              <span class="block text-[32px] md:text-[44px] xl:text-[54px] text-[#E8820C]">Group Buy Today</span>
            </h1>

            <p class="mt-2 text-gray-600 text-sm md:text-[15px] font-medium">
              Limited slots per campaign — every member unlocks a
              <span class="font-bold text-[#7c2d12]">bigger discount</span> for the whole group.
            </p>

            <div class="flex items-center gap-3 mt-5 flex-wrap">
              <div class="flex items-center gap-1.5 bg-white border border-orange-100 rounded-full px-3 py-1.5 shadow-sm">
                <i class="pi pi-users text-[#E8820C] text-xs"></i>
                <span class="text-[11px] font-semibold text-gray-700">First-come, first-serve slots</span>
              </div>
              <div class="flex items-center gap-1.5 bg-white border border-orange-100 rounded-full px-3 py-1.5 shadow-sm">
                <i class="pi pi-tag text-[#EB3131] text-xs"></i>
                <span class="text-[11px] font-semibold text-gray-700">Discount grows as the group fills</span>
              </div>
            </div>

            <button
              @click="router.push('/group')"
              class="mt-7 w-fit flex items-center gap-2 bg-gradient-to-r from-[#E8820C] to-[#EB3131] hover:opacity-90 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-orange-200 hover:-translate-y-0.5"
            >
              See Live Deals
              <i class="pi pi-arrow-right text-xs"></i>
            </button>
          </div>

          <div class="relative flex-1 min-h-[220px] overflow-hidden">
            <img
              src="/images/GroupBuy/community.webp"
              alt="Group buying community"
              class="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-[#fff8f0] via-transparent to-transparent hidden md:block"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#fff8f0] via-transparent to-transparent md:hidden"></div>
          </div>
        </div>
      </SwiperSlide>

      <!-- ═══ Slide 3: RIOS AI (dark purple) ═══ -->
      <SwiperSlide>
        <div class="flex flex-col md:flex-row md:h-[380px] xl:h-[420px]"
             style="background: linear-gradient(135deg, #17131f 0%, #241a38 55%, #3b1230 100%);">

          <div class="flex flex-col justify-center px-8 md:px-12 py-14 w-full md:w-[55%] shrink-0">
            <div class="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-purple-200 text-[11px] font-semibold px-3 py-1.5 rounded-full w-fit mb-4">
              <svg class="w-3 h-3 text-purple-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
              AI-Powered Assistant
            </div>

            <h1 class="font-intertight font-bold leading-tight">
              <span class="block text-[28px] md:text-[38px] xl:text-[46px] text-white">Meet RIOS</span>
              <span class="block text-[32px] md:text-[44px] xl:text-[54px] bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">Ask Anything</span>
            </h1>

            <p class="mt-2 text-white/50 text-sm md:text-[15px] font-medium">
              Projects, prices, localities and group buying — answered in plain language, instantly.
            </p>

            <div class="flex items-center gap-3 mt-5 flex-wrap">
              <div class="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                <i class="pi pi-comments text-purple-300 text-xs"></i>
                <span class="text-[11px] font-semibold text-white/80">Instant answers</span>
              </div>
              <div class="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                <i class="pi pi-map-marker text-pink-300 text-xs"></i>
                <span class="text-[11px] font-semibold text-white/80">Locality insights</span>
              </div>
            </div>

            <button
              @click="router.push('/rios')"
              class="mt-7 w-fit flex items-center gap-2 bg-gradient-to-r from-purple-500 to-rose-500 hover:opacity-90 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/50 hover:-translate-y-0.5"
            >
              Ask RIOS
              <i class="pi pi-arrow-right text-xs"></i>
            </button>
          </div>

          <!-- CSS visual: glowing orb + floating chat chips -->
          <div class="relative flex-1 min-h-[220px] flex items-center justify-center overflow-hidden">
            <div class="hero-rios-orb" data-loop></div>
            <div class="hero-rios-chip" style="top: 18%; left: 12%; animation-delay: 0s;">
              <i class="pi pi-home text-purple-300 text-[10px] mr-1.5"></i>2 BHK under ₹1 Cr?
            </div>
            <div class="hero-rios-chip" style="top: 62%; left: 6%; animation-delay: 1.2s;">
              <i class="pi pi-users text-pink-300 text-[10px] mr-1.5"></i>How does group buying work?
            </div>
            <div class="hero-rios-chip" style="top: 40%; right: 8%; animation-delay: 0.6s;">
              <i class="pi pi-indian-rupee text-rose-300 text-[10px] mr-1.5"></i>Is this price fair?
            </div>
            <svg class="relative w-24 h-24 text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- ── Developer Partners (hidden per request, Aug 2026) ────── -->
    <div v-if="false" class="mt-12">
      <div class="flex items-center gap-4">
        <div class="flex-1 border-t border-dashed border-gray-300"></div>
        <h3 class="text-xs font-bold text-[#1a2b5f] tracking-widest uppercase whitespace-nowrap">
          Our Top Developer Partners
        </h3>
        <div class="flex-1 border-t border-dashed border-gray-300"></div>
      </div>

      <div class="mt-8 flex items-start justify-between gap-4 overflow-x-auto pb-2">
        <div
          v-for="partner in partners"
          :key="partner.name"
          class="flex flex-col items-center gap-2.5 min-w-[90px] group cursor-pointer"
        >
          <div
            class="w-[68px] h-[68px] rounded-full flex items-center justify-center shrink-0 shadow-sm ring-2 ring-transparent group-hover:ring-blue-200 transition-colors duration-200"
            :class="partner.bg"
          >
            <span class="text-[11px] font-bold text-center leading-tight px-1" :class="partner.textColor">
              {{ partner.abbr }}
            </span>
          </div>
          <div class="text-center">
            <p class="text-[12px] font-semibold text-gray-800 leading-tight">{{ partner.name }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ partner.projects }} Projects</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Pagination dots over the banner */
.hero-swiper :deep(.swiper-pagination) {
  bottom: 14px;
}
.hero-swiper :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(120, 120, 130, 0.45);
  opacity: 1;
  transition: all 0.3s ease;
}
.hero-swiper :deep(.swiper-pagination-bullet-active) {
  width: 22px;
  border-radius: 9999px;
  background: #eb3131;
}

/* RIOS slide: glowing orb behind the spark.
   This is the homepage "beacon" — the one element allowed to loop forever.
   Scoped to the ACTIVE slide so Swiper's loop clones don't animate a second
   copy off-screen, and gated so it pauses when scrolled away or tab-hidden. */
.hero-rios-orb {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.45), rgba(236, 72, 153, 0.18) 55%, transparent 70%);
}
.swiper-slide-active .hero-rios-orb {
  animation: hero-orb-breathe var(--dur-loop) var(--ease-loop) infinite;
}
@keyframes hero-orb-breathe {
  0%, 100% { transform: scale(1); opacity: 0.82; }
  50%      { transform: scale(1.06); opacity: 1; }
}

/* Question chips.
   The float animation was removed: it animated transform on elements carrying
   backdrop-filter: blur(6px), which forces the backdrop to be re-sampled and
   re-blurred every frame — and Swiper's loop cloned all three, so six ran at
   once. The blur is replaced with a flat translucent fill (indistinguishable
   over this dark gradient) and the chips now sit still. */
.hero-rios-chip {
  position: absolute;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 9999px;
  white-space: nowrap;
  z-index: 5;
}
</style>
