<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { makeRequest } from "@/request/request";
import endpoints from "@/request/endpoints";

const router = useRouter();

const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Standalone requests (not via the shared project store) so the homepage
// swiper lists are not clobbered by this section's larger discovery fetch.
const cities = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Discover cities + a cover image from a 100-project sample
    const res = await makeRequest(
      endpoints.getProjectProperty,
      "GET",
      {},
      {},
      { type: "project", pageSize: 100, pageNumber: 1 },
      0
    );
    const map = new Map();
    (res?.data?.projects || []).forEach((p) => {
      const raw = String(p.city || "").trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      const entry = map.get(key) || { name: titleCase(raw), raw, sample: 0, count: 0, image: "" };
      entry.sample += 1;
      if (!entry.image && p.propertyPictures?.[0]) entry.image = p.propertyPictures[0];
      map.set(key, entry);
    });
    const discovered = [...map.values()]
      .sort((a, b) => b.sample - a.sample)
      .slice(0, 12);

    // True count per city = the server total for the same searchQuery the
    // city page runs, so the card number matches what the page shows
    const counts = await Promise.all(
      discovered.map((c) =>
        makeRequest(
          endpoints.getProjectProperty,
          "GET",
          {},
          {},
          { type: "project", pageSize: 1, pageNumber: 1, searchQuery: c.raw },
          0
        )
          .then((r) => r?.data?.totalProjects ?? 0)
          .catch(() => 0)
      )
    );
    discovered.forEach((c, i) => { c.count = counts[i]; });

    cities.value = discovered
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  } catch (error) {
    console.error("Error in building cities section", error);
    cities.value = [];
  } finally {
    loading.value = false;
  }
});

// Bento layout: first city is a 2×2 hero card; when the grid is full (8
// cities) the last card goes wide so the bottom row closes cleanly
const cardClass = (idx) => {
  if (idx === 0) return "col-span-2 row-span-2";
  if (idx === cities.value.length - 1 && cities.value.length === 8) return "col-span-2";
  return "";
};

// Pass the raw casing from the API so server-side city filtering matches
const goToCity = (city) => {
  router.push(`/cities/${encodeURIComponent(city.raw)}`);
};
</script>

<template>
  <section v-if="loading || cities.length" class="max-w-7xl mx-auto py-14 px-4 xl:px-0">

    <!-- Header row -->
    <div class="flex items-end justify-between gap-4">
      <div>
        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#EB3131] uppercase tracking-wide mb-3">
          <i class="pi pi-map-marker text-[9px]"></i>
          Top Locations
        </span>
        <h2 class="font-intertight font-bold text-[26px] md:text-[34px] xl:text-[40px] text-[#1a2b5f] leading-tight">
          Explore by City
        </h2>
        <p class="text-sm text-gray-500 mt-1">Find group deals and projects in your city</p>
      </div>

      <router-link
        to="/cities"
        class="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#EB3131] transition-colors shrink-0 mb-1"
      >
        View all cities
        <i class="pi pi-arrow-right text-[10px]"></i>
      </router-link>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="mt-8 grid grid-cols-2 md:grid-cols-4 auto-rows-[130px] md:auto-rows-[160px] gap-4">
      <div
        v-for="n in 7"
        :key="n"
        class="rounded-[28px] bg-gray-100 animate-pulse"
        :class="n === 1 ? 'col-span-2 row-span-2' : n === 7 ? 'col-span-2' : ''"
      ></div>
    </div>

    <!-- Bento city grid -->
    <div v-else class="mt-8 grid grid-cols-2 md:grid-cols-4 auto-rows-[130px] md:auto-rows-[160px] gap-4">
      <div
        v-for="(city, idx) in cities"
        :key="city.name"
        @click="goToCity(city)"
        class="group relative rounded-[28px] overflow-hidden cursor-pointer bg-gray-900 shadow-sm hover:shadow-2xl hover:shadow-gray-400/40 transition-all duration-300 hover:-translate-y-1"
        :class="cardClass(idx)"
      >
        <!-- Cover image from a project in this city -->
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-[900ms] ease-out group-hover:scale-110"
          :style="city.image ? { backgroundImage: `url('${city.image}')` } : {}"
        ></div>
        <!-- Fallback when no image -->
        <div v-if="!city.image" class="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <i class="pi pi-building text-4xl text-white/25"></i>
        </div>

        <!-- Overlays: deep bottom fade + subtle top vignette + hover warm tint -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#0b1020]/90 via-[#0b1020]/25 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent"></div>
        <div class="absolute inset-0 bg-[#EB3131]/0 group-hover:bg-[#EB3131]/10 transition-colors duration-300"></div>

        <!-- Count pill — top left, frosted -->
        <span
          class="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm"
        >
          <i class="pi pi-building text-[9px]"></i>
          {{ city.count }} Project{{ city.count === 1 ? "" : "s" }}
        </span>

        <!-- Bottom content -->
        <div class="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between gap-2">
          <div class="min-w-0">
            <h3
              class="text-white font-intertight font-bold leading-tight drop-shadow-sm truncate"
              :class="idx === 0 ? 'text-2xl md:text-[32px]' : 'text-lg md:text-xl'"
            >
              {{ city.name }}
            </h3>
            <p
              class="text-white/70 text-xs mt-1 flex items-center gap-1.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-[transform,box-shadow,opacity] duration-300"
            >
              View projects
              <i class="pi pi-arrow-right text-[9px]"></i>
            </p>
          </div>
          <span
            class="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shrink-0 shadow-lg opacity-0 scale-75 -rotate-45 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 transition-[transform,box-shadow,opacity] duration-300"
          >
            <i class="pi pi-arrow-right text-xs"></i>
          </span>
        </div>

        <!-- Hairline inner border for polish -->
        <div class="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10 pointer-events-none"></div>
      </div>
    </div>

    <!-- Mobile "view all" -->
    <router-link
      to="/cities"
      class="sm:hidden mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-600"
    >
      View all cities
      <i class="pi pi-arrow-right text-[10px]"></i>
    </router-link>
  </section>
</template>
