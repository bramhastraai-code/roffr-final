<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBrokerStore } from "@/stores/brokerStore";
import { debounce } from "@/utils/debounce";
import { ratingOf, starIcon, brokerTypeOf, initialsOf as initials, hashOf } from "@/utils/brokerDisplay";
import PinMap from "@/components/PinMap.vue";
import CardSkeleton from "@/components/ui/CardSkeleton.vue";
import StateBlock from "@/components/ui/StateBlock.vue";

const router = useRouter();
const brokerStore = useBrokerStore();
const { brokerList, brokerListTotal, brokerListError } = storeToRefs(brokerStore);

const searchInput = ref("");
const searchTerm = ref("");

// This page had no loading flag at all, so it rendered "No channel partners
// found" until data arrived — a false negative on every single page load.
const loading = ref(true);

const fetchPartners = async () => {
  loading.value = true;
  await brokerStore.getBrokerList({ search: searchTerm.value });
  loading.value = false;
};

const liveSearch = debounce(async () => {
  searchTerm.value = searchInput.value.trim();
  await fetchPartners();
}, 300);

watch(searchInput, () => liveSearch());

onMounted(fetchPartners);

const partners = computed(() => {
  const list = brokerList.value;
  return Array.isArray(list) ? list : [];
});

const goToDetails = (id) => {
  if (!id) return;
  router.push(`/channel-partners/${id}`);
};

// ── Load more (append pages — map pins accumulate with the list) ──
const { brokerListPage } = storeToRefs(brokerStore);
const loadingMore = ref(false);
const loadMore = async () => {
  loadingMore.value = true;
  await brokerStore.getBrokerList({
    search: searchTerm.value,
    page: brokerListPage.value + 1,
    append: true,
  });
  loadingMore.value = false;
};

// ── Map ──────────────────────────────────────────────────────────
const mobileView = ref("list"); // 'list' | 'map' (mobile toggle)

// The users API has no location fields, so pins use a stable id-derived
// position near a metro anchor — see docs/PLACEHOLDER_DATA.md. Real
// broker.latitude/longitude wins automatically if the backend adds it.
const CITY_ANCHORS = [
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Thane", lat: 19.2183, lng: 72.9781 },
  { name: "Navi Mumbai", lat: 19.033, lng: 73.0297 },
  { name: "Pune", lat: 18.5204, lng: 73.8567 },
  { name: "Raipur", lat: 21.2514, lng: 81.6296 },
];

const positionOf = (broker) => {
  const lat = Number(broker?.latitude);
  const lng = Number(broker?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng, area: "" };
  const h = hashOf(broker?._id);
  const anchor = CITY_ANCHORS[h % CITY_ANCHORS.length];
  return {
    lat: anchor.lat + (((h >> 3) % 600) - 300) / 10000,
    lng: anchor.lng + (((h >> 9) % 600) - 300) / 10000,
    area: anchor.name,
  };
};

const brokerPins = computed(() =>
  partners.value.map((b) => {
    const pos = positionOf(b);
    return {
      id: b._id,
      lat: pos.lat,
      lng: pos.lng,
      title: b.name || "Broker",
      subtitle: [b.firmName || "Independent", pos.area].filter(Boolean).join(" · "),
      initials: initials(b.name),
      chips: [
        `★ ${ratingOf(b).toFixed(1)}`,
        brokerTypeOf(b).startsWith("Primary") ? "Primary Market" : "Secondary Market",
      ],
    };
  }),
);

const mapNote = computed(() =>
  partners.value.length
    ? `Approx. locations · ${partners.value.length} of ${brokerListTotal.value} loaded`
    : "",
);

</script>

<template>
  <section class="max-w-7xl mx-auto py-10 px-4 2xl:px-0 mt-24 md:mt-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-marcellus text-gray-900">Channel Partners</h1>
        <p class="text-sm text-gray-500 mt-1">
          Connect with verified property advisors across the network.
        </p>
      </div>

      <div class="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white w-full md:w-96">
        <i class="pi pi-search text-gray-400"></i>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by name, firm, or RERA…"
          class="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        <button
          v-if="searchInput"
          @click="searchInput = ''"
          class="text-gray-400 hover:text-gray-600"
          aria-label="Clear"
        >
          <i class="pi pi-times-circle"></i>
        </button>
      </div>
    </div>

    <p class="text-xs text-gray-500 mb-4">
      {{ brokerListTotal }} partner{{ brokerListTotal === 1 ? "" : "s" }}
      <span v-if="searchTerm">matching "{{ searchTerm }}"</span>
    </p>

    <!-- Split: list + map -->
    <div class="lg:flex lg:gap-5 lg:items-start">

      <!-- Left: list -->
      <div
        class="lg:w-[55%]"
        :class="mobileView === 'map' ? 'hidden lg:block' : ''"
      >
        <!-- Loading: a skeleton, not the empty state -->
        <CardSkeleton v-if="loading && !partners.length" variant="row" :count="6" />

        <StateBlock
          v-else-if="brokerListError && !partners.length"
          variant="error"
          title="Couldn't load channel partners"
          message="Something went wrong reaching our servers. Check your connection and try again."
          action-label="Retry"
          @action="fetchPartners"
        />

        <StateBlock
          v-else-if="!partners.length"
          icon="pi-users"
          :title="searchTerm ? `No partners match “${searchTerm}”` : 'No channel partners yet'"
          :message="searchTerm
            ? 'Try a different name, firm, or city.'
            : 'Verified partners will appear here as they join the network.'"
          :action-label="searchTerm ? 'Clear search' : ''"
          @action="searchInput = ''"
        />

        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
      <div
        v-for="broker in partners"
        :key="broker._id"
        @click="goToDetails(broker._id)"
        class="bg-white rounded-xl border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
      >
        <div class="h-[140px] bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
          <img
            v-if="broker?.brokerImage"
            :src="broker.brokerImage"
            :alt="broker.name"
            class="h-20 w-20 rounded-full object-cover border-4 border-white shadow"
           loading="lazy" decoding="async" />
          <div
            v-else
            class="h-20 w-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow"
          >
            {{ initials(broker?.name) }}
          </div>
        </div>

        <div class="p-4 text-sm text-gray-700">
          <h2 class="font-semibold text-base text-gray-900 line-clamp-1">
            {{ broker?.name || "Unnamed broker" }}
          </h2>
          <p class="text-xs text-gray-500 line-clamp-1">
            {{ broker?.firmName || "Independent" }}
          </p>

          <!-- Rating -->
          <div class="flex items-center gap-1.5 mt-2">
            <div class="flex items-center gap-0.5">
              <i
                v-for="i in 5"
                :key="i"
                :class="starIcon(ratingOf(broker), i)"
                class="text-[13px]"
                :style="{ color: ratingOf(broker) >= i - 0.5 ? '#f59e0b' : '#d1d5db' }"
              ></i>
            </div>
            <span class="text-xs font-semibold text-gray-700">{{ ratingOf(broker).toFixed(1) }}</span>
          </div>

          <!-- Broker type -->
          <span
            class="inline-block mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
            :class="brokerTypeOf(broker).startsWith('Primary')
              ? 'bg-blue-50 text-blue-700 border-blue-100'
              : 'bg-purple-50 text-purple-700 border-purple-100'"
          >
            {{ brokerTypeOf(broker) }}
          </span>

          <div class="border-t my-2"></div>

          <div class="flex justify-between py-1 text-xs">
            <span class="text-gray-500">Phone</span>
            <span class="text-gray-800">**********</span>
          </div>
          <!-- <div class="flex justify-between py-1 text-xs">
            <span class="text-gray-500">Site visits</span>
            <span class="text-gray-800">{{ broker?.totalSiteVisits ?? 0 }}</span>
          </div> -->

          <button
            class="mt-3 w-full bg-black text-white text-xs py-2 rounded-full hover:bg-gray-800 transition"
            @click.stop="goToDetails(broker._id)"
          >
            View profile
          </button>
        </div>
      </div>
        </div>

        <!-- Load more -->
        <div v-if="partners.length && partners.length < brokerListTotal" class="text-center mt-8">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="px-8 py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#EB3131] hover:text-[#EB3131] transition-colors duration-200 disabled:opacity-50"
          >
            <span v-if="loadingMore"><i class="pi pi-spinner pi-spin text-xs mr-1.5"></i>Loading…</span>
            <span v-else>Load more ({{ partners.length }} of {{ brokerListTotal }})</span>
          </button>
        </div>
      </div>

      <!-- Right: map (sticky on desktop, toggled on mobile) -->
      <div
        class="lg:w-[45%] lg:sticky lg:top-24 h-[68vh] lg:h-[calc(100vh-130px)] mt-2 lg:mt-0"
        :class="mobileView === 'map' ? 'block' : 'hidden lg:block'"
      >
        <PinMap
          :pins="brokerPins"
          :note="mapNote"
          @pin-click="(pin) => goToDetails(pin.id)"
        />
      </div>
    </div>

    <!-- Mobile list/map toggle -->
    <div class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div class="flex items-center bg-gray-900 rounded-full shadow-2xl p-1">
        <button
          @click="mobileView = 'list'"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="mobileView === 'list' ? 'bg-white text-gray-900' : 'text-white/80'"
        >
          <i class="pi pi-list text-xs"></i> List
        </button>
        <button
          @click="mobileView = 'map'"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="mobileView === 'map' ? 'bg-white text-gray-900' : 'text-white/80'"
        >
          <i class="pi pi-map text-xs"></i> Map
        </button>
      </div>
    </div>
  </section>
</template>
