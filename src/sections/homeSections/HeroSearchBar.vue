<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/stores/projectStore";

const router = useRouter();
const projectStore = useProjectStore();
const { activeCitiesData } = storeToRefs(projectStore);

onMounted(() => {
  // Only cities that actually have listings (not the raw unique-cities dump)
  projectStore.getActiveCities();
  document.addEventListener("click", closeAll);
});
onBeforeUnmount(() => document.removeEventListener("click", closeAll));

// ── Tabs — only ones that map to real, working /search filters ───
const TABS = [
  { key: "buy",  label: "Buy" },
  { key: "rent", label: "Rent" },
  { key: "new",  label: "New Projects" },
];
const activeTab = ref("buy");

// ── City + free text ─────────────────────────────────────────────
const selectedCity = ref("");
const freeText = ref("");
const cityListOpen = ref(false);

const citySuggestions = computed(() => {
  const list = Array.isArray(activeCitiesData.value) ? activeCitiesData.value : [];
  const q = freeText.value.trim().toLowerCase();
  const filtered = q
    ? list.filter((c) => String(c).toLowerCase().includes(q))
    : list;
  return filtered.slice(0, 8);
});

const pickCity = (c) => {
  selectedCity.value = c;
  freeText.value = "";
  cityListOpen.value = false;
};

// ── BHK dropdown (values match SearchView's ALLOWED_BHK) ─────────
const BHK_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];
const selectedBhk = ref("");
const bhkOpen = ref(false);
const bhkLabel = computed(() =>
  selectedBhk.value ? selectedBhk.value.replace("BHK", " BHK") : "BHK",
);

// ── Budget dropdown (keys match SearchView PRICE_RANGES) ─────────
const PRICE_RANGES = [
  { key: "any",      label: "Any price" },
  { key: "u50",      label: "Under ₹50L" },
  { key: "50to100",  label: "₹50L – ₹1Cr" },
  { key: "100to300", label: "₹1Cr – ₹3Cr" },
  { key: "above300", label: "Above ₹3Cr" },
];
const selectedPriceKey = ref("any");
const budgetOpen = ref(false);

const budgetLabel = computed(() => {
  const r = PRICE_RANGES.find((p) => p.key === selectedPriceKey.value);
  return r && r.key !== "any" ? r.label : "Budget";
});

const closeAll = () => {
  cityListOpen.value = false;
  bhkOpen.value = false;
  budgetOpen.value = false;
};
const toggle = (which, e) => {
  e.stopPropagation();
  const open = { city: cityListOpen, bhk: bhkOpen, budget: budgetOpen };
  const cur = open[which].value;
  closeAll();
  open[which].value = !cur;
};

// ── Search → deep link into /search ──────────────────────────────
const runSearch = () => {
  const q = {};
  const term = freeText.value.trim();

  if (activeTab.value === "rent") q.type = "property";
  else if (activeTab.value === "new") {
    q.type = "project";
    q.projectStatus = "New Launch";
  }

  if (term) q.q = term;
  if (selectedCity.value) q.city = selectedCity.value;
  if (selectedBhk.value) q.bhk = selectedBhk.value;
  if (selectedPriceKey.value !== "any") q.priceKey = selectedPriceKey.value;

  router.push({ path: "/search", query: q });
};
</script>

<template>
  <section class="relative z-20 max-w-5xl mx-auto px-4 pt-10 pb-4">

    <!-- Heading -->
    <h2 class="text-center font-intertight text-[26px] md:text-[36px] text-gray-900 leading-tight">
      Start your <span class="font-bold bg-gradient-to-r from-[#EB3131] to-[#E8820C] bg-clip-text text-transparent">Group Buying</span> Journey
    </h2>

    <!-- Tabs -->
    <div class="mt-6 flex items-center justify-center gap-1 md:gap-6 flex-wrap">
      <button
        v-for="t in TABS"
        :key="t.key"
        @click="activeTab = t.key"
        class="hsb-tab relative px-3 py-2 text-sm md:text-[15px] font-semibold transition-colors duration-200"
        :class="activeTab === t.key ? 'text-[#EB3131] hsb-tab--active' : 'text-gray-800 hover:text-[#EB3131]'"
      >
        {{ t.label }}
      </button>

      <router-link
        to="/dashboard"
        class="hsb-tab relative px-3 py-2 text-sm md:text-[15px] font-semibold text-gray-800 hover:text-[#EB3131] transition-colors duration-200"
      >
        Post Free Property Ad
      </router-link>
    </div>

    <!-- Search bar -->
    <div class="hsb-bar mt-6 bg-white border border-gray-200 rounded-3xl md:rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-0">

      <!-- Location + free text -->
      <div class="relative flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
        <i class="pi pi-map-marker text-[#EB3131] shrink-0"></i>

        <!-- Selected city chip -->
        <span
          v-if="selectedCity"
          class="flex items-center gap-1.5 bg-red-50 text-[#EB3131] text-sm font-semibold px-3 py-1.5 rounded-full shrink-0 capitalize"
        >
          {{ selectedCity }}
          <button @click.stop="selectedCity = ''" class="hover:opacity-70 hover:rotate-90 transition-transform duration-200">
            <i class="pi pi-times text-[10px]"></i>
          </button>
        </span>

        <input
          v-model="freeText"
          @focus="toggle('city', $event)"
          @click.stop
          @keyup.enter="runSearch"
          type="text"
          :placeholder="selectedCity ? 'Add more…' : 'Search city, locality, project…'"
          class="flex-1 min-w-0 outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
        />

        <!-- City suggestions -->
        <div
          v-if="cityListOpen && citySuggestions.length"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-1.5 max-h-64 overflow-y-auto"
        >
          <p class="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cities</p>
          <button
            v-for="c in citySuggestions"
            :key="c"
            @click="pickCity(c)"
            class="hsb-item w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-[#EB3131] flex items-center gap-2.5 transition-all duration-150 capitalize"
          >
            <i class="pi pi-map-marker text-gray-300 text-xs"></i>
            {{ c }}
          </button>
        </div>
      </div>

      <div class="hidden md:block h-9 w-px bg-gray-200 shrink-0"></div>

      <!-- BHK -->
      <div class="relative shrink-0">
        <button
          @click="toggle('bhk', $event)"
          class="hsb-pill w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200"
          :class="selectedBhk ? 'text-[#EB3131]' : 'text-gray-700 hover:text-gray-900'"
        >
          <span class="flex items-center gap-2">
            <i class="pi pi-home text-[#EB3131] text-sm"></i>
            {{ bhkLabel }}
          </span>
          <i class="pi pi-angle-down text-xs opacity-60 transition-transform duration-200" :class="bhkOpen ? 'rotate-180' : ''"></i>
        </button>

        <div
          v-if="bhkOpen"
          @click.stop
          class="absolute top-full left-0 md:left-auto md:right-0 mt-2 min-w-[160px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-1.5 overflow-hidden"
        >
          <button
            v-for="b in BHK_OPTIONS"
            :key="b"
            @click="selectedBhk = selectedBhk === b ? '' : b; bhkOpen = false"
            class="hsb-item w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-all duration-150"
            :class="selectedBhk === b ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-red-50 hover:text-[#EB3131]'"
          >
            {{ b.replace("BHK", " BHK") }}
            <i v-if="selectedBhk === b" class="pi pi-check text-[10px]"></i>
          </button>
        </div>
      </div>

      <div class="hidden md:block h-9 w-px bg-gray-200 shrink-0"></div>

      <!-- Budget -->
      <div class="relative shrink-0">
        <button
          @click="toggle('budget', $event)"
          class="hsb-pill w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200"
          :class="selectedPriceKey !== 'any' ? 'text-[#EB3131]' : 'text-gray-700 hover:text-gray-900'"
        >
          <span class="flex items-center gap-2">
            <i class="pi pi-indian-rupee text-[#EB3131] text-sm"></i>
            {{ budgetLabel }}
          </span>
          <i class="pi pi-angle-down text-xs opacity-60 transition-transform duration-200" :class="budgetOpen ? 'rotate-180' : ''"></i>
        </button>

        <div
          v-if="budgetOpen"
          @click.stop
          class="absolute top-full left-0 md:left-auto md:right-0 mt-2 min-w-[190px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-1.5 overflow-hidden"
        >
          <button
            v-for="r in PRICE_RANGES"
            :key="r.key"
            @click="selectedPriceKey = r.key; budgetOpen = false"
            class="hsb-item w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-all duration-150"
            :class="selectedPriceKey === r.key ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-red-50 hover:text-[#EB3131]'"
          >
            {{ r.label }}
            <i v-if="selectedPriceKey === r.key" class="pi pi-check text-[10px]"></i>
          </button>
        </div>
      </div>

      <!-- Search button -->
      <button
        @click="runSearch"
        class="hsb-search shrink-0 flex items-center justify-center gap-2 bg-[#EB3131] text-white text-[15px] font-bold px-8 py-3 rounded-full transition-all duration-200 active:scale-[0.97] shadow-md shadow-red-200 md:ml-1"
      >
        <i class="pi pi-search text-sm"></i>
        Search
      </button>
    </div>
  </section>
</template>

<style scoped>
/* Tab underline: grows in from the center on hover, stays for active */
.hsb-tab::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 2px;
  height: 3px;
  border-radius: 9999px;
  background: #eb3131;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.hsb-tab:hover::after,
.hsb-tab--active::after {
  transform: scaleX(1);
}

/* Bar lifts when hovered or focused */
.hsb-bar {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.hsb-bar:hover,
.hsb-bar:focus-within {
  box-shadow: 0 14px 40px rgba(235, 49, 49, 0.14);
  transform: translateY(-2px);
}

/* Filter pills tint on hover */
.hsb-pill:hover {
  background: #fef2f2;
}
.hsb-pill:hover .pi-home,
.hsb-pill:hover .pi-indian-rupee {
  transform: scale(1.15);
}
.hsb-pill .pi-home,
.hsb-pill .pi-indian-rupee {
  transition: transform 0.2s ease;
}

/* Dropdown items nudge right on hover */
.hsb-item:hover {
  padding-left: 20px;
}

/* Search button glow + lift */
.hsb-search:hover {
  background: #c72828;
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(235, 49, 49, 0.4);
}
.hsb-search:hover .pi-search {
  transform: rotate(90deg);
}
.hsb-search .pi-search {
  transition: transform 0.3s ease;
}
</style>
