<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { usePropertyStore } from "@/stores/propertyStore";
import { storeToRefs } from "pinia";
import { useRouter, useRoute } from "vue-router";
import { useSearchStore } from "@/stores/SearchStore";
import { debounce } from "@/utils/debounce";
import { useShare } from "@/utils/useShare";
import ShareModal from "@/components/ShareModal.vue";
import PropertyMap from "@/components/PropertyMap.vue";

const router = useRouter();

const {
  showShareModal,
  shareUrl,
  shareTitle,
  openShareModal,
  closeShareModal,
} = useShare();

const route = useRoute();

const propertyStore = usePropertyStore();
const {
  propertyData,
  pageNumber,
  totalpages,
  pageSize,
} = storeToRefs(propertyStore);

const searchStore = useSearchStore();
const { searchSuggestionData, term } = storeToRefs(searchStore);

// UI state
const searchInput = ref("");
const suggestionsVisible = ref(false);
const containerRef = ref(null);

const selectedCity = ref("");
const cityDropdownOpen = ref(false);
const showBestDealsOnly = ref(false);
const selectedType = ref("project");

// status filter
const selectedStatuses = ref([]);

// New Filters
const filterFreeCancellation = ref(false);
const filterInstantBook = ref(false);
const priceDropdownOpen = ref(false);
const selectedPriceRange = ref(null);

const priceRanges = [
  { label: "Under ₹50L", min: 0, max: 5000000 },
  { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr - ₹3Cr", min: 10000000, max: 30000000 },
  { label: "Above ₹3Cr", min: 30000000, max: Infinity },
];

const togglePriceRange = (range) => {
  if (selectedPriceRange.value?.label === range.label) {
    selectedPriceRange.value = null;
  } else {
    selectedPriceRange.value = range;
  }
  priceDropdownOpen.value = false;
};

const imageErrors = ref({});
const handleImageError = (key) => {
  imageErrors.value[key] = true;
};

const suggestionsList = computed(() => {
  if (Array.isArray(searchSuggestionData.value))
    return searchSuggestionData.value;
  return searchSuggestionData.value?.data || [];
});

const performSearch = async () => {
  await projectStore.getProjectPropertyList(
    "project",
    searchInput.value,
    selectedCity.value,
  );
};

onMounted(async () => {
  if (route.query.city) {
    selectedCity.value = route.query.city;
  }

  if (route.query.q || route.query.city) {
    if (route.query.q) searchInput.value = route.query.q;
    await performSearch();
  } else {
    await propertyStore.getProperty();
  }
  await propertyStore.getProperty();
});

const formatINR = (num) => `₹ ${Number(num || 0).toLocaleString("en-IN")}`;

const redirect = (id, type = selectedType.value) => {
  if (type === "property") {
    router.push(`/property-details/${id}`);
  } else {
    router.push(`/project-details/${id}`);
  }
};

// suggestions
const updateTermDebounced = debounce((value) => {
  const v = value.trim();
  if (!v) {
    suggestionsVisible.value = false;
    return;
  }
  term.value = v;
  searchStore.getSearchSuggestion();
}, 300);

watch(searchInput, (newVal) => {
  updateTermDebounced(newVal);
  suggestionsVisible.value = newVal.trim().length > 0;
});

const suggestionRedirect = (suggestion) => {
  if (!suggestion || !suggestion._id) return;
  const type = (suggestion.itsTypeIs || "").toUpperCase();
  if (type === "PROJECT") {
    router.push(`/project-details/${suggestion._id}`);
  } else if (type === "PROPERTY") {
    router.push(`/property-details/${suggestion._id}`);
  } else {
    router.push(`/project-details/${suggestion._id}`);
  }
};

const onSuggestionClick = (s) => {
  router.push(`/project-details/${s}`);
  suggestionsVisible.value = false;
};

const onSearchButtonClicked = () => {
  suggestionsVisible.value = false;
  performSearch();
};

// city filter (server request)
async function fetchByCity(city) {
  await projectStore.getProjectPropertyList(
    "project",
    searchInput.value,
    city || "",
  );
}

function onCitySelect(city) {
  selectedCity.value = city;
  cityDropdownOpen.value = false;
  fetchByCity(city);
}

// close dropdowns on outside click
const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    suggestionsVisible.value = false;
    cityDropdownOpen.value = false;
  }
};

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside),
);

// helpers
const normalize = (str = "") => str.toString().toLowerCase().trim();

const isBestDeal = (project) => {
  if (project.bestDeal || project.negotiable) return true;
  const tags = project.tags || [];
  return tags.some((t) => {
    const txt = normalize(t.text);
    return (
      txt.includes("best deal") ||
      txt.includes("negotiable") ||
      txt.includes("offer") ||
      txt.includes("exclusive")
    );
  });
};

const matchesStatus = (project) => {
  if (!selectedStatuses.value.length) return true;
  const status = normalize(project.projectStatus || "");
  return selectedStatuses.value.some((s) => status.includes(normalize(s)));
};

// final list
const filteredProjects = computed(() => {
  const q = normalize(searchInput.value);
  let list = projectPropertyListData.value || [];

  // text search
  if (q) {
    list = list.filter((p) => {
      const name = normalize(p.projectName || p.title);
      const loc = normalize(p.location);
      const city = normalize(p.city);
      const region = normalize(p.region);
      const builder = normalize(p.builder?.name);
      const priceStr = normalize(
        `${p.priceMin || ""} ${p.priceMax || ""} ${p.price || ""}`,
      );
      const amenities = (p.amenities || [])
        .map((a) => normalize(a.text))
        .join(" ");
      const crmName = normalize(p.crmDetails?.crmName);

      return (
        name.includes(q) ||
        loc.includes(q) ||
        city.includes(q) ||
        region.includes(q) ||
        builder.includes(q) ||
        priceStr.includes(q) ||
        amenities.includes(q) ||
        crmName.includes(q)
      );
    });
  }

  // Price Filter
  if (selectedPriceRange.value) {
    list = list.filter((p) => {
      const price = p.priceMin || p.price || 0;
      return (
        price >= selectedPriceRange.value.min &&
        price <= selectedPriceRange.value.max
      );
    });
  }

  // Free Cancellation
  if (filterFreeCancellation.value) {
    list = list.filter(
      (p) =>
        p.freeCancellation ||
        (p.tags &&
          p.tags.some((t) =>
            t.text.toLowerCase().includes("free cancellation"),
          )),
    );
  }

  // Instant Book
  if (filterInstantBook.value) {
    list = list.filter(
      (p) =>
        p.instantBook ||
        (p.tags &&
          p.tags.some((t) => t.text.toLowerCase().includes("instant book"))),
    );
  }

  // best-deal / negotiable
  if (showBestDealsOnly.value) {
    list = list.filter((p) => isBestDeal(p));
  }

  // status
  list = list.filter((p) => matchesStatus(p));

  return list;
});

const locationPills = computed(() => {
  if (!projectPropertyListData.value) return [];
  const regions = projectPropertyListData.value
    .map((p) => p.region)
    .filter((r) => r && r.trim().length > 0);
  return [...new Set(regions)].slice(0, 5);
});

const selectLocation = (loc) => {
  searchInput.value = loc;
};

const fetchProjects = async () => {
  await projectStore.getProjectPropertyList(
    selectedType.value,
    "",
    selectedCity.value || "",
  );
};

watch([pageNumber, pageSize, selectedType], fetchProjects);

const canPrev = computed(() => pageNumber.value > 1);
const canNext = computed(() => pageNumber.value < totalpages.value);

const prevPage = () => {
  if (canPrev.value) pageNumber.value -= 1;
};

const nextPage = () => {
  if (canNext.value) pageNumber.value += 1;
};

// Map Sync
const mapRef = ref(null);
const onCardHover = (project) => {
  if (mapRef.value) {
    mapRef.value.flyToProject(project);
  }
};
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 2xl:px-0 mt-20 pb-10">
    <div class="flex flex-col xl:flex-row items-center justify-between">
      <h1 class="title-text">Select to explore</h1>
      <div
        class="flex items-center justify-center xl:justify-start gap-3 flex-wrap mt-4 xl:mt-0"
      >
        <!-- Free Cancellation -->
        <button
          @click="filterFreeCancellation = !filterFreeCancellation"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
          :class="
            filterFreeCancellation
              ? 'bg-orange-50 border-orange-500 text-orange-600'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          "
        >
          Negotiable
        </button>

        <!-- Price Dropdown -->
        <div class="relative">
          <button
            @click.stop="priceDropdownOpen = !priceDropdownOpen"
            class="px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2"
            :class="
              selectedPriceRange
                ? 'bg-orange-50 border-orange-500 text-orange-600'
                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
            "
          >
            {{ selectedPriceRange ? selectedPriceRange.label : "Price" }}
            <i class="pi pi-angle-down text-xs"></i>
          </button>

          <div
            v-if="priceDropdownOpen"
            class="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden"
          >
            <button
              v-for="range in priceRanges"
              :key="range.label"
              @click="togglePriceRange(range)"
              class="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
              :class="
                selectedPriceRange?.label === range.label
                  ? 'text-orange-600 font-medium bg-orange-50'
                  : 'text-gray-700'
              "
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <!-- Instant Book -->
        <button
          @click="filterInstantBook = !filterInstantBook"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
          :class="
            filterInstantBook
              ? 'bg-orange-50 border-orange-500 text-orange-600'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          "
        >
          Best Deal
        </button>

        <!-- New Launch -->
        <button
          @click="filterInstantBook = !filterInstantBook"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
          :class="
            filterInstantBook
              ? 'bg-orange-50 border-orange-500 text-orange-600'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          "
        >
          New Launch
        </button>

        <!-- Under Construction -->
        <button
          @click="filterInstantBook = !filterInstantBook"
          class="px-4 py-2 rounded-full border text-sm font-medium transition-all"
          :class="
            filterInstantBook
              ? 'bg-orange-50 border-orange-500 text-orange-600'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          "
        >
          Under Construction
        </button>
      </div>
    </div>

    <div class="mt-2 bg-white z-20" ref="containerRef">
      <div class="w-full flex flex-col">
        <!-- Search Bar -->
        <div
          class="w-full p-[1px] rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-md relative"
        >
          <div
            class="w-full flex items-center bg-white rounded-full px-2 py-2 gap-2"
          >
            <!-- City dropdown -->
            <div class="relative flex items-center shrink-0">
              <button
                type="button"
                class="flex items-center gap-2 px-3 py-1 text-gray-700 font-medium outline-none hover:text-orange-600 transition-colors text-sm"
                @click.stop="cityDropdownOpen = !cityDropdownOpen"
              >
                <span class="truncate max-w-[100px]">
                  {{ selectedCity || "All cities" }}
                </span>
                <i
                  class="pi text-[10px]"
                  :class="
                    cityDropdownOpen ? 'pi-chevron-up' : 'pi-chevron-down'
                  "
                ></i>
              </button>

              <!-- Vertical Divider -->
              <div class="h-5 w-px bg-gray-300 mx-2"></div>

              <ul
                v-if="cityDropdownOpen"
                class="absolute top-full left-0 mt-2 w-48 max-h-64 overflow-auto bg-white text-black rounded-xl shadow-lg border border-gray-200 z-30 text-sm"
              >
                <li
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  @click.stop="onCitySelect('')"
                >
                  All cities
                </li>
                <li
                  v-for="city in uniqueCitiesData"
                  :key="city"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  @click.stop="onCitySelect(city)"
                >
                  {{ city }}
                </li>
              </ul>
            </div>

            <!-- search input -->
            <input
              v-model="searchInput"
              type="text"
              class="w-full outline-none px-2 text-gray-600 placeholder-gray-400 text-sm"
              placeholder="Search..."
              autocomplete="off"
            />
            <button
              @click="onSearchButtonClicked"
              class="h-8 w-8 min-w-[2rem] rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white flex items-center justify-center shadow hover:shadow-md transition-shadow"
            >
              <i class="pi pi-search text-xs"></i>
            </button>

            <!-- suggestions dropdown -->
            <ul
              v-if="suggestionsVisible && suggestionsList.length"
              class="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-auto bg-white text-black rounded-xl shadow-lg border border-gray-200 z-50"
            >
              <li
                v-for="(suggestion, index) in suggestionsList"
                :key="suggestion._id || index"
                class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                @click="onSuggestionClick(suggestion?._id)"
              >
                {{ suggestion.title }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- CARD -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden border">
          <!-- IMAGE -->
          <div class="relative">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920"
              class="w-full h-56 object-cover"
            />

            <!-- Availability -->
            <span
              class="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full"
            >
              Available: Dec 27, 2028
            </span>

            <!-- Icons -->
            <div class="absolute top-3 right-3 flex gap-2">
              <i
                class="pi pi-heart bg-white py-1.5 px-2 rounded-full text-sm cursor-pointer"
              ></i>
              <i
                class="pi pi-share-alt bg-white py-1.5 px-2 rounded-full text-sm cursor-pointer"
              ></i>
            </div>
          </div>

          <!-- CONTENT -->
          <div class="p-4 space-y-3">
            <!-- Title -->
            <div class="">
              <h3 class="font-semibold text-lg">
                B - 2701 / 2801, Godrej Five Gardens
              </h3>
              <p class="text-sm text-gray-500">Maheshwari Udyan , Matunga</p>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[20px] font-semibold">₹ 18.50 Cr.</p>
                <p class="text-[14px] text-gray-500">₹ 89,027 per sqft</p>
              </div>

              <span class="text-sm font-medium px-2 py-1 rounded-md">
                Carpet: 2078.0 sqft
              </span>
            </div>

            <!-- FEATURES -->
            <div
              class="grid grid-cols-4 text-center text-sm font-medium bg-gray-100 rounded-lg py-3"
            >
              <div>
                <i class="pi pi-home mb-1"></i>
                <p>2.5 BHK</p>
              </div>
              <div>
                <i class="pi pi-sliders-h mb-1"></i>
                <p>3 Baths</p>
              </div>
              <div>
                <i class="pi pi-car mb-1"></i>
                <p>4 Parks</p>
              </div>
              <div>
                <i class="pi pi-building mb-1"></i>
                <p>Condition</p>
              </div>
            </div>

            <!-- FOOTER INFO -->
            <div class="flex justify-between text-sm text-gray-500 pt-2">
              <div>
                <p>Listing Realtor</p>
                <p class="text-black font-medium">AssetPro</p>
              </div>
              <div class="text-right">
                <p>Last Updated</p>
                <p class="text-black font-medium">Mar 27, 2026</p>
              </div>
            </div>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="flex gap-2 p-3 border-t bg-gray-100 font-semibold">
            <button
              class="flex-1 border rounded-lg py-2 flex items-center justify-center gap-2 text-sm bg-white"
            >
              <i class="pi pi-whatsapp text-green-500"></i>
              Whatsapp
            </button>

            <button
              class="flex-1 bg-black text-white rounded-lg py-2 flex items-center justify-center gap-2 text-sm"
            >
              <i class="pi pi-phone"></i>
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
