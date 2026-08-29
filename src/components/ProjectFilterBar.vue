<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  projects: { type: Array, default: () => [] },
});

const selectedLocation   = ref("");
const selectedType       = ref("");
const selectedBudget     = ref("");
const selectedPossession = ref("");
const selectedSort       = ref("Popular");

const filterOptions = {
  type:       ["Apartment", "Villa", "Plot", "Commercial", "Studio"],
  budget:     ["Under 50L", "50L – 1Cr", "1Cr – 2Cr", "2Cr – 5Cr", "5Cr+"],
  possession: ["Ready to Move", "Under Construction", "New Launch"],
  sort:       ["Popular", "Price: Low to High", "Price: High to Low", "Newest"],
};

// Cities come from the passed projects so every option yields results
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const locationOptions = computed(() => {
  const cities = new Set();
  (props.projects || []).forEach((p) => {
    if (p.city) cities.add(titleCase(String(p.city).trim()));
  });
  return [...cities].sort();
});

const openDropdown = ref("");
const toggleDropdown = (name, e) => {
  e.stopPropagation();
  openDropdown.value = openDropdown.value === name ? "" : name;
};
const closeAllDropdowns = () => { openDropdown.value = ""; };

onMounted(() => document.addEventListener("click", closeAllDropdowns));
onBeforeUnmount(() => document.removeEventListener("click", closeAllDropdowns));

const select = (filter, value) => {
  if (filter === "location")   selectedLocation.value = value;
  else if (filter === "type")        selectedType.value = value;
  else if (filter === "budget")      selectedBudget.value = value;
  else if (filter === "possession")  selectedPossession.value = value;
  else if (filter === "sort")        selectedSort.value = value;
  openDropdown.value = "";
};

const clearFilter = (filter, e) => {
  e.stopPropagation();
  if (filter === "location")   selectedLocation.value = "";
  else if (filter === "type")        selectedType.value = "";
  else if (filter === "budget")      selectedBudget.value = "";
  else if (filter === "possession")  selectedPossession.value = "";
};

const clearAllFilters = () => {
  selectedLocation.value = "";
  selectedType.value = "";
  selectedBudget.value = "";
  selectedPossession.value = "";
};

const activeCount = computed(() =>
  [selectedLocation.value, selectedType.value, selectedBudget.value, selectedPossession.value].filter(Boolean).length
);

// A project missing the filtered field is kept (matches the budget filter's
// long-standing behavior) — campaign-populated projects only carry a few fields.
const matchesText = (val, sel) => String(val).toLowerCase() === sel.toLowerCase();

const filteredProjects = computed(() => {
  if (!props.projects?.length) return [];
  let list = [...props.projects];

  if (selectedLocation.value)
    list = list.filter(
      (p) => String(p.city || "").trim().toLowerCase() === selectedLocation.value.toLowerCase()
    );

  if (selectedType.value)
    list = list.filter((p) => {
      const t = p.propertyType || p.projectType;
      return !t || matchesText(t, selectedType.value);
    });

  if (selectedPossession.value)
    list = list.filter(
      (p) => !p.projectStatus || matchesText(p.projectStatus, selectedPossession.value)
    );

  if (selectedBudget.value) {
    list = list.filter((p) => {
      const price = p.minPrice;
      if (!price) return true;
      if (selectedBudget.value === "Under 50L")  return price < 5_000_000;
      if (selectedBudget.value === "50L – 1Cr")  return price >= 5_000_000  && price < 10_000_000;
      if (selectedBudget.value === "1Cr – 2Cr")  return price >= 10_000_000 && price < 20_000_000;
      if (selectedBudget.value === "2Cr – 5Cr")  return price >= 20_000_000 && price < 50_000_000;
      if (selectedBudget.value === "5Cr+")        return price >= 50_000_000;
      return true;
    });
  }

  if (selectedSort.value === "Price: Low to High")
    list.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
  else if (selectedSort.value === "Price: High to Low")
    list.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
  else if (selectedSort.value === "Newest")
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return list;
});
</script>

<template>
  <div>
    <!-- ── Filter row ─────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3 mt-6">

      <!-- Left filter pills -->
      <div class="flex items-center gap-2 flex-wrap">

        <!-- Active count badge -->
        <div v-if="activeCount" class="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
          <span class="bg-[#EB3131] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{{ activeCount }}</span>
          filters active
          <button
            @click="clearAllFilters"
            class="text-[#EB3131] hover:underline ml-1"
          >Clear all</button>
        </div>

        <!-- Location -->
        <div class="relative">
          <button
            @click="toggleDropdown('location', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200"
            :class="selectedLocation
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-map-marker text-[11px]"></i>
            <span>{{ selectedLocation || 'Location' }}</span>
            <button v-if="selectedLocation" @click.stop="clearFilter('location', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'location'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[170px] py-1.5 max-h-64 overflow-y-auto">
              <div v-if="!locationOptions.length" class="px-4 py-2.5 text-sm text-gray-400">No locations</div>
              <button
                v-for="opt in locationOptions" :key="opt"
                @click="select('location', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedLocation === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedLocation === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>

        <!-- Property Type -->
        <div class="relative">
          <button
            @click="toggleDropdown('type', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200"
            :class="selectedType
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-home text-[11px]"></i>
            <span>{{ selectedType || 'Property Type' }}</span>
            <button v-if="selectedType" @click.stop="clearFilter('type', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'type'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[170px] py-1.5 overflow-hidden">
              <button
                v-for="opt in filterOptions.type" :key="opt"
                @click="select('type', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedType === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedType === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>

        <!-- Budget -->
        <div class="relative">
          <button
            @click="toggleDropdown('budget', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200"
            :class="selectedBudget
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-indian-rupee text-[11px]"></i>
            <span>{{ selectedBudget || 'Budget' }}</span>
            <button v-if="selectedBudget" @click.stop="clearFilter('budget', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'budget'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[170px] py-1.5 overflow-hidden">
              <button
                v-for="opt in filterOptions.budget" :key="opt"
                @click="select('budget', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedBudget === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedBudget === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>

        <!-- Possession -->
        <div class="relative">
          <button
            @click="toggleDropdown('possession', $event)"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200"
            :class="selectedPossession
              ? 'bg-[#EB3131] text-white border-[#EB3131] shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'"
          >
            <i class="pi pi-calendar text-[11px]"></i>
            <span>{{ selectedPossession || 'Possession' }}</span>
            <button v-if="selectedPossession" @click.stop="clearFilter('possession', $event)" class="hover:opacity-70 ml-0.5">
              <i class="pi pi-times text-[9px]"></i>
            </button>
            <i v-else class="pi pi-angle-down text-[10px] opacity-60"></i>
          </button>
          <transition name="dropdown">
            <div v-if="openDropdown === 'possession'"
                 class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[190px] py-1.5 overflow-hidden">
              <button
                v-for="opt in filterOptions.possession" :key="opt"
                @click="select('possession', opt)"
                class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
                :class="selectedPossession === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
              >
                {{ opt }}
                <i v-if="selectedPossession === opt" class="pi pi-check text-[10px]"></i>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- Sort By -->
      <div class="relative">
        <button
          @click="toggleDropdown('sort', $event)"
          class="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 transition-all duration-200 shadow-sm"
        >
          <i class="pi pi-sort-alt text-[11px] text-gray-400"></i>
          <span class="text-gray-400">Sort:</span>
          <span class="font-semibold text-gray-800">{{ selectedSort }}</span>
          <i class="pi pi-angle-down text-[10px] opacity-60"></i>
        </button>
        <transition name="dropdown">
          <div v-if="openDropdown === 'sort'"
               class="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 min-w-[210px] py-1.5 overflow-hidden">
            <button
              v-for="opt in filterOptions.sort" :key="opt"
              @click="select('sort', opt)"
              class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
              :class="selectedSort === opt ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
            >
              {{ opt }}
              <i v-if="selectedSort === opt" class="pi pi-check text-[10px]"></i>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Parent renders the results (swiper / empty state) here -->
    <slot :filtered="filteredProjects" :clear-all="clearAllFilters" :active-count="activeCount" />
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
