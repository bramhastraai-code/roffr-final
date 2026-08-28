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

// ── Tabs (each maps to real /search params) ──────────────────────
const TABS = [
  { key: "buy",        label: "Buy" },
  { key: "rent",       label: "Rent" },
  { key: "new",        label: "New Projects" },
  { key: "pg",         label: "PG" },
  { key: "plot",       label: "Plot" },
  { key: "commercial", label: "Commercial" },
];
const activeTab = ref("buy");

const setTab = (key) => {
  activeTab.value = key;
  // Plot / Commercial fix the unit type; clear a conflicting manual pick
  if (key === "plot") selectedUnitType.value = "Plot";
  else if (key === "commercial") selectedUnitType.value = "Commercial";
  else if (["Plot", "Commercial"].includes(selectedUnitType.value)) selectedUnitType.value = "";
};

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

// ── Property type + BHK dropdown ─────────────────────────────────
// Values match SearchView's ALLOWED_UNIT_TYPES / ALLOWED_BHK
const UNIT_TYPES = ["Apartment", "Villa", "Studio", "Plot", "Commercial"];
const BHK_OPTIONS = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];
const selectedUnitType = ref("");
const selectedBhk = ref("");
const typeOpen = ref(false);

const typeLabel = computed(() => {
  if (!selectedUnitType.value && !selectedBhk.value) return "Property Type";
  const base = selectedUnitType.value || selectedBhk.value;
  const extra = selectedUnitType.value && selectedBhk.value ? " +1" : "";
  return `${base}${extra}`;
});

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
  typeOpen.value = false;
  budgetOpen.value = false;
};
const toggle = (which, e) => {
  e.stopPropagation();
  const open = { city: cityListOpen, type: typeOpen, budget: budgetOpen };
  const cur = open[which].value;
  closeAll();
  open[which].value = !cur;
};

// ── Search → deep link into /search (SearchView reads all of these) ──
const runSearch = () => {
  const q = {};
  let term = freeText.value.trim();

  if (activeTab.value === "rent") q.type = "property";
  else if (activeTab.value === "new") {
    q.type = "project";
    q.projectStatus = "New Launch";
  } else if (activeTab.value === "pg") {
    q.type = "property";
    term = term ? `${term} PG` : "PG";
  }

  if (term) q.q = term;
  if (selectedCity.value) q.city = selectedCity.value;
  if (selectedUnitType.value) q.unitType = selectedUnitType.value;
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
        @click="setTab(t.key)"
        class="relative px-3 py-2 text-sm md:text-[15px] font-semibold transition-colors"
        :class="activeTab === t.key ? 'text-[#EB3131]' : 'text-gray-800 hover:text-[#EB3131]'"
      >
        {{ t.label }}
        <span
          v-if="activeTab === t.key"
          class="absolute left-3 right-3 -bottom-0.5 h-[3px] rounded-full bg-[#EB3131]"
        ></span>
      </button>

      <router-link
        to="/dashboard"
        class="px-3 py-2 text-sm md:text-[15px] font-semibold text-gray-800 hover:text-[#EB3131] transition-colors"
      >
        Post Free Property Ad
      </router-link>
    </div>

    <!-- Search bar -->
    <div class="mt-6 bg-white border border-gray-200 rounded-3xl md:rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-0">

      <!-- Location + free text -->
      <div class="relative flex items-center gap-2 flex-1 min-w-0 px-3 py-2">
        <i class="pi pi-map-marker text-[#EB3131] shrink-0"></i>

        <!-- Selected city chip -->
        <span
          v-if="selectedCity"
          class="flex items-center gap-1.5 bg-red-50 text-[#EB3131] text-sm font-semibold px-3 py-1.5 rounded-full shrink-0"
        >
          {{ selectedCity }}
          <button @click.stop="selectedCity = ''" class="hover:opacity-70">
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
            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors capitalize"
          >
            <i class="pi pi-map-marker text-gray-300 text-xs"></i>
            {{ c }}
          </button>
        </div>
      </div>

      <div class="hidden md:block h-9 w-px bg-gray-200 shrink-0"></div>

      <!-- Property type + BHK -->
      <div class="relative shrink-0">
        <button
          @click="toggle('type', $event)"
          class="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-full"
          :class="selectedUnitType || selectedBhk ? 'text-[#EB3131]' : 'text-gray-700 hover:text-gray-900'"
        >
          <span class="flex items-center gap-2">
            <i class="pi pi-home text-[#EB3131] text-sm"></i>
            {{ typeLabel }}
          </span>
          <i class="pi pi-angle-down text-xs opacity-60"></i>
        </button>

        <div
          v-if="typeOpen"
          @click.stop
          class="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4"
        >
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Property type</p>
          <div class="flex flex-wrap gap-1.5 mb-4">
            <button
              v-for="u in UNIT_TYPES"
              :key="u"
              @click="selectedUnitType = selectedUnitType === u ? '' : u"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              :class="selectedUnitType === u
                ? 'bg-[#EB3131] text-white border-[#EB3131]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
            >
              {{ u }}
            </button>
          </div>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">BHK</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="b in BHK_OPTIONS"
              :key="b"
              @click="selectedBhk = selectedBhk === b ? '' : b"
              class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              :class="selectedBhk === b
                ? 'bg-[#EB3131] text-white border-[#EB3131]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
            >
              {{ b.replace("BHK", " BHK") }}
            </button>
          </div>
        </div>
      </div>

      <div class="hidden md:block h-9 w-px bg-gray-200 shrink-0"></div>

      <!-- Budget -->
      <div class="relative shrink-0">
        <button
          @click="toggle('budget', $event)"
          class="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-full"
          :class="selectedPriceKey !== 'any' ? 'text-[#EB3131]' : 'text-gray-700 hover:text-gray-900'"
        >
          <span class="flex items-center gap-2">
            <i class="pi pi-indian-rupee text-[#EB3131] text-sm"></i>
            {{ budgetLabel }}
          </span>
          <i class="pi pi-angle-down text-xs opacity-60"></i>
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
            class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors"
            :class="selectedPriceKey === r.key ? 'text-[#EB3131] font-semibold bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
          >
            {{ r.label }}
            <i v-if="selectedPriceKey === r.key" class="pi pi-check text-[10px]"></i>
          </button>
        </div>
      </div>

      <!-- Search button -->
      <button
        @click="runSearch"
        class="shrink-0 flex items-center justify-center gap-2 bg-[#EB3131] hover:bg-[#c72828] text-white text-[15px] font-bold px-8 py-3 rounded-full transition-colors duration-200 active:scale-[0.98] shadow-md shadow-red-200 md:ml-1"
      >
        <i class="pi pi-search text-sm"></i>
        Search
      </button>
    </div>
  </section>
</template>
