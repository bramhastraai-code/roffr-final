<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useMyDashboardStore } from "@/stores/myDashboardStore";

const route = useRoute();
const router = useRouter();

const projectStore = useProjectStore();
const { specificProjectDetails } = storeToRefs(projectStore);

const authStore = useAuthStore();
const dashboardStore = useMyDashboardStore();

// ----- Loaders -----
const loading = ref(false);
const loadProject = async (id) => {
  if (!id) return;
  loading.value = true;
  try {
    await projectStore.getProjectById(id);
  } finally {
    loading.value = false;
  }
};

onMounted(() => loadProject(route.params.id));
watch(
  () => route.params.id,
  (id) => loadProject(id),
);

// ----- Derived data -----
const project = computed(() => specificProjectDetails.value || {});
const heroImages = computed(() => {
  const list = project.value?.propertyPictures;
  return Array.isArray(list) ? list.filter(Boolean) : [];
});
const floorPlans = computed(() => {
  const fp = project.value?.floorPlan;
  if (!fp) return [];
  if (Array.isArray(fp)) return fp.filter(Boolean);
  return [fp].filter(Boolean);
});
const amenities = computed(() => {
  const a = project.value?.amenities;
  return Array.isArray(a) ? a.filter(Boolean) : [];
});
const facilities = computed(() => {
  const f = project.value?.facilities;
  return Array.isArray(f) ? f : [];
});
const whyConsiderBuying = computed(() => {
  const w = project.value?.whyConsiderBuying;
  return Array.isArray(w) ? w.filter(Boolean) : [];
});
const propertyConfigs = computed(() => {
  const c = project.value?.PropertyConfig;
  return Array.isArray(c) ? c.filter(Boolean) : [];
});
const brochureUrl = computed(() => {
  const b = project.value?.brochure;
  if (!b) return "";
  if (Array.isArray(b)) return b[0] || "";
  return b;
});
const videoUrl = computed(() => project.value?.videoLink || project.value?.tourLink || "");

const formatINR = (n) => {
  const num = Number(n || 0);
  if (!num) return "—";
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(1)} L`;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const priceLabel = computed(() => {
  const min = Number(project.value?.minPrice || 0);
  const max = Number(project.value?.maxPrice || 0);
  if (!min && !max) return "Price on request";
  if (min && max && min !== max) return `${formatINR(min)} – ${formatINR(max)}`;
  return formatINR(min || max);
});

const carpetAreaLabel = computed(() => {
  const min = project.value?.minCarpetArea;
  const max = project.value?.maxCarpetArea;
  if (!min && !max) return "—";
  if (min && max && min !== max) return `${min} – ${max} sqft`;
  return `${min || max} sqft`;
});

const locationLabel = computed(() => {
  return (
    project.value?.address ||
    project.value?.venue ||
    project.value?.glocation ||
    [project.value?.region, project.value?.city].filter(Boolean).join(", ") ||
    "Location not specified"
  );
});

// Try to extract a "lat,lng" pair from glocation for the map embed.
const mapEmbedSrc = computed(() => {
  const g = project.value?.glocation || "";
  const coordMatch = String(g).match(
    /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/,
  );
  if (coordMatch) {
    return `https://www.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&hl=en&z=15&output=embed`;
  }
  const q = encodeURIComponent(
    project.value?.venue ||
      project.value?.glocation ||
      project.value?.address ||
      project.value?.projectName ||
      "",
  );
  if (!q) return "";
  return `https://www.google.com/maps?q=${q}&hl=en&z=15&output=embed`;
});

// ----- Hero gallery -----
const activeImageIdx = ref(0);
watch(heroImages, () => {
  activeImageIdx.value = 0;
});
const activeImage = computed(
  () =>
    heroImages.value[activeImageIdx.value] ||
    heroImages.value[0] ||
    "/images/heroSection/hero-bg.webp",
);

// ----- Tabs -----
const TABS = [
  { key: "overview", label: "Overview", icon: "pi-info-circle" },
  { key: "photos", label: "Photos", icon: "pi-images" },
  { key: "video", label: "Video", icon: "pi-video" },
  { key: "amenities", label: "Amenities", icon: "pi-star" },
  { key: "plans", label: "Plans", icon: "pi-th-large" },
  { key: "location", label: "Location", icon: "pi-map-marker" },
  { key: "about", label: "About Builder", icon: "pi-building" },
];
const activeTab = ref("overview");

// ----- Site visit booking -----
const showVisitModal = ref(false);
const submittingVisit = ref(false);
const visitMsg = ref("");
const visitForm = ref({
  scheduledDate: "",
  customerName: "",
  phoneNumber: "",
});

const openBookVisit = () => {
  visitForm.value = {
    scheduledDate: "",
    customerName: authStore.currentUserData?.name || authStore.user?.name || "",
    phoneNumber:
      authStore.currentUserData?.phoneNumber ||
      authStore.user?.phoneNumber ||
      "",
  };
  visitMsg.value = "";
  showVisitModal.value = true;
};

const submitVisit = async () => {
  if (!authStore.isAuthenticated) {
    visitMsg.value = "Please log in to book a site visit.";
    return;
  }
  if (!visitForm.value.scheduledDate) {
    visitMsg.value = "Please pick a date and time.";
    return;
  }
  if (!visitForm.value.phoneNumber) {
    visitMsg.value = "Phone number is required.";
    return;
  }

  submittingVisit.value = true;
  visitMsg.value = "";
  try {
    const customerId =
      authStore.user?._id || localStorage.getItem("customerId");
    await dashboardStore.bookSiteVisit(customerId, {
      projectId: project.value?._id,
      scheduledDate: visitForm.value.scheduledDate,
      customerName: visitForm.value.customerName,
      phoneNumber: visitForm.value.phoneNumber,
    });
    visitMsg.value = "Booked! You can manage it from your dashboard.";
    setTimeout(() => (showVisitModal.value = false), 1200);
  } catch (err) {
    visitMsg.value =
      err?.response?.data?.message || "Failed to book site visit.";
  } finally {
    submittingVisit.value = false;
  }
};

// ----- Wishlist (existing endpoint expects login) -----
const togglingWishlist = ref(false);
const handleShortlist = async () => {
  const customerId = authStore.user?._id || localStorage.getItem("customerId");
  if (!customerId) {
    router.push("/login");
    return;
  }
  togglingWishlist.value = true;
  try {
    await projectStore.addToWishlist(project.value?._id, customerId);
    visitMsg.value = "Added to favourites.";
  } finally {
    togglingWishlist.value = false;
  }
};

// ----- Share -----
const handleShare = async () => {
  const url = window.location.href;
  const title = project.value?.projectName || "Project";
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch {
      /* fall through to clipboard */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    visitMsg.value = "Link copied to clipboard.";
  } catch {
    /* ignore */
  }
};
</script>

<template>
  <main class="bg-gray-50 min-h-screen pb-12">
    <!-- Loading -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500">
      <i class="pi pi-spin pi-spinner text-3xl"></i>
      <p class="mt-2 text-sm">Loading project…</p>
    </div>

    <template v-else-if="project?._id">
      <!-- ========== HERO ========== -->
      <section class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 2xl:px-0 pt-24 pb-8">
          <button
            @click="router.back()"
            class="text-sm text-gray-500 hover:text-gray-900 mb-3 inline-flex items-center gap-1"
          >
            <i class="pi pi-arrow-left text-xs"></i> Back
          </button>

          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span
                v-if="project.projectStatus"
                class="inline-block text-[11px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700 mb-2"
              >
                {{ project.projectStatus }}
              </span>
              <h1 class="text-3xl md:text-4xl font-marcellus text-gray-900">
                {{ project.projectName || "Project" }}
              </h1>
              <p class="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-xs"></i>
                {{ locationLabel }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2 text-sm">
              <button
                @click="handleShare"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-900 flex items-center gap-1.5"
              >
                <i class="pi pi-share-alt text-xs"></i> Share
              </button>
              <button
                @click="handleShortlist"
                :disabled="togglingWishlist"
                class="px-3 py-1.5 rounded-full border border-gray-300 hover:border-orange-400 hover:text-orange-600 flex items-center gap-1.5"
              >
                <i class="pi pi-heart text-xs"></i> Shortlist
              </button>
              <button
                @click="openBookVisit"
                class="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium shadow flex items-center gap-1.5"
              >
                <i class="pi pi-calendar text-xs"></i> Book site visit
              </button>
            </div>
          </div>

          <!-- Gallery + summary card -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <!-- Gallery -->
            <div class="xl:col-span-2">
              <div
                class="rounded-2xl overflow-hidden bg-gray-100 h-[260px] sm:h-[400px] xl:h-[500px]"
              >
                <img
                  :src="activeImage"
                  :alt="project.projectName"
                  class="w-full h-full object-cover"
                />
              </div>

              <div
                v-if="heroImages.length > 1"
                class="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2"
              >
                <button
                  v-for="(img, idx) in heroImages.slice(0, 12)"
                  :key="idx"
                  @click="activeImageIdx = idx"
                  class="rounded-lg overflow-hidden h-16 border-2 transition"
                  :class="
                    activeImageIdx === idx
                      ? 'border-orange-500'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  "
                >
                  <img :src="img" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <!-- Summary card -->
            <aside class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div>
                <p class="text-xs uppercase tracking-wider text-gray-500">Price</p>
                <p class="text-2xl font-semibold text-gray-900">
                  {{ priceLabel }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Carpet area</p>
                  <p class="font-medium text-gray-800">{{ carpetAreaLabel }}</p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Configs</p>
                  <p class="font-medium text-gray-800">
                    {{ propertyConfigs.length ? propertyConfigs.join(", ") : "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">RERA</p>
                  <p class="font-medium text-gray-800 truncate">
                    {{ project.projectReraNumber || project.reraNo || "—" }}
                  </p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-wider text-gray-500">Possession</p>
                  <p class="font-medium text-gray-800">
                    {{ project.readyToPossessDate || "—" }}
                  </p>
                </div>
              </div>

              <a
                v-if="brochureUrl"
                :href="brochureUrl"
                target="_blank"
                rel="noopener"
                class="border border-gray-300 rounded-lg w-full py-2 text-center text-sm font-medium text-gray-700 hover:border-gray-900"
              >
                <i class="pi pi-download text-xs mr-1"></i>
                Download brochure
              </a>

              <button
                @click="openBookVisit"
                class="bg-black text-white rounded-lg w-full py-2.5 text-sm font-medium hover:bg-gray-800"
              >
                Schedule a site visit
              </button>
            </aside>
          </div>
        </div>
      </section>

      <!-- ========== TABS ========== -->
      <section class="bg-white border-b border-gray-200 sticky top-[72px] z-10">
        <div class="max-w-7xl mx-auto px-4 2xl:px-0">
          <div class="flex gap-1 overflow-x-auto whitespace-nowrap py-3">
            <button
              v-for="tab in TABS"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition"
              :class="
                activeTab === tab.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
            >
              <i :class="['pi text-xs', tab.icon]"></i>
              {{ tab.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- ========== TAB BODIES ========== -->
      <section class="max-w-7xl mx-auto px-4 2xl:px-0 py-8">
        <!-- OVERVIEW -->
        <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-2xl border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">About this project</h2>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {{ project.description || "No description provided." }}
            </p>

            <div v-if="whyConsiderBuying.length" class="mt-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                Why consider buying
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li v-for="(point, i) in whyConsiderBuying" :key="i" class="flex gap-2">
                  <i class="pi pi-check-circle text-orange-500 mt-1"></i>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="bg-white rounded-2xl border p-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Project facts
            </h3>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Status</dt>
                <dd class="text-gray-900 font-medium">{{ project.projectStatus || "—" }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Builder</dt>
                <dd class="text-gray-900 font-medium truncate">
                  {{ project.builderName || "—" }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">RERA No.</dt>
                <dd class="text-gray-900 font-medium truncate">
                  {{ project.projectReraNumber || project.reraNo || "—" }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Carpet area</dt>
                <dd class="text-gray-900 font-medium">{{ carpetAreaLabel }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Possession</dt>
                <dd class="text-gray-900 font-medium">
                  {{ project.readyToPossessDate || "—" }}
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-gray-500">Region</dt>
                <dd class="text-gray-900 font-medium truncate">
                  {{ project.region || project.city || "—" }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- PHOTOS -->
        <div v-else-if="activeTab === 'photos'">
          <div v-if="!heroImages.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-images text-5xl text-gray-300 mb-3 block"></i>
            <p>No photos available.</p>
          </div>
          <div v-else>
            <div class="rounded-2xl overflow-hidden">
              <Swiper :space-between="10" :slides-per-view="1">
                <SwiperSlide v-for="(img, idx) in heroImages" :key="idx">
                  <img :src="img" class="w-full h-[300px] sm:h-[500px] object-cover" />
                </SwiperSlide>
              </Swiper>
            </div>
            <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <img
                v-for="(img, idx) in heroImages"
                :key="idx"
                :src="img"
                class="rounded-lg h-28 w-full object-cover border"
              />
            </div>
          </div>
        </div>

        <!-- VIDEO -->
        <div v-else-if="activeTab === 'video'">
          <div v-if="!videoUrl" class="text-center py-16 text-gray-500">
            <i class="pi pi-video text-5xl text-gray-300 mb-3 block"></i>
            <p>No video walkthrough available.</p>
          </div>
          <div v-else class="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border">
            <iframe
              :src="videoUrl"
              class="w-full h-full"
              frameborder="0"
              allow="autoplay; encrypted-media; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- AMENITIES -->
        <div v-else-if="activeTab === 'amenities'">
          <div v-if="!amenities.length && !facilities.length" class="text-center py-16 text-gray-500">
            <i class="pi pi-star text-5xl text-gray-300 mb-3 block"></i>
            <p>Amenities not listed yet.</p>
          </div>

          <div v-if="amenities.length" class="mb-8">
            <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Project amenities
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                v-for="amenity in amenities"
                :key="amenity"
                class="bg-white border rounded-xl px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-sm flex items-center justify-center gap-2"
              >
                <i class="pi pi-check text-orange-500 text-xs"></i>
                {{ amenity }}
              </div>
            </div>
          </div>

          <div v-if="facilities.length">
            <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Public facilities nearby
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                v-for="(f, i) in facilities"
                :key="i"
                class="bg-white border rounded-xl px-4 py-3 text-center text-sm flex flex-col items-center gap-2"
              >
                <img
                  v-if="f?.iconImage"
                  :src="f.iconImage"
                  :alt="f.name"
                  class="h-8 w-8 object-contain"
                />
                <i v-else class="pi pi-map text-orange-500"></i>
                <span class="text-gray-800 font-medium">{{ f?.name || "—" }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PLANS -->
        <div v-else-if="activeTab === 'plans'">
          <div v-if="!floorPlans.length && !project.masterPlan" class="text-center py-16 text-gray-500">
            <i class="pi pi-th-large text-5xl text-gray-300 mb-3 block"></i>
            <p>Floor plans not uploaded yet.</p>
          </div>

          <div v-if="project.masterPlan" class="mb-8">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Master plan
            </h3>
            <div class="bg-white border rounded-2xl p-4">
              <img
                :src="project.masterPlan"
                alt="Master plan"
                class="w-full max-h-[600px] object-contain"
              />
            </div>
          </div>

          <div v-if="floorPlans.length">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Floor plans
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(fp, i) in floorPlans"
                :key="i"
                class="bg-white border rounded-2xl p-3"
              >
                <img :src="fp" :alt="`Floor plan ${i + 1}`" class="w-full h-72 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <!-- LOCATION -->
        <div v-else-if="activeTab === 'location'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-2xl border overflow-hidden">
              <iframe
                v-if="mapEmbedSrc"
                :src="mapEmbedSrc"
                class="w-full h-[450px]"
                style="border: 0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
              <div v-else class="h-[300px] flex items-center justify-center text-gray-400">
                Map not available
              </div>
            </div>
            <div class="bg-white rounded-2xl border p-5 space-y-3 text-sm">
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Address</p>
                <p class="text-gray-900">{{ project.address || project.venue || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Region</p>
                <p class="text-gray-900">{{ project.region || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">City</p>
                <p class="text-gray-900">{{ project.city || project.venue || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Landmark</p>
                <p class="text-gray-900">{{ project.landmark || "—" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ABOUT BUILDER -->
        <div v-else-if="activeTab === 'about'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white rounded-2xl border p-6">
            <div class="flex items-center gap-4 mb-4">
              <div
                class="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold"
              >
                {{ (project.builderName || "B").slice(0, 1).toUpperCase() }}
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ project.builderName || "Builder" }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ project.region || project.city || "—" }}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed">
              {{ project.description || "No description provided." }}
            </p>
          </div>

          <div class="bg-white rounded-2xl border p-6 text-sm">
            <h3 class="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Reach the builder
            </h3>
            <div class="space-y-3">
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">Phone</p>
                <p class="text-gray-900">{{ project.builderContact || "—" }}</p>
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-500">RERA</p>
                <p class="text-gray-900 truncate">
                  {{ project.projectReraNumber || project.reraNo || "—" }}
                </p>
              </div>
              <button
                v-if="project.builderName"
                class="mt-2 w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800"
                @click="openBookVisit"
              >
                Talk to builder
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Not found -->
    <div
      v-else
      class="max-w-7xl mx-auto px-4 py-24 text-center text-gray-500"
    >
      <i class="pi pi-exclamation-circle text-5xl text-gray-300 mb-3 block"></i>
      <p>Project not found.</p>
      <button
        @click="router.push('/project')"
        class="mt-4 px-4 py-2 rounded-full bg-orange-500 text-white text-sm"
      >
        Browse projects
      </button>
    </div>

    <!-- Site visit modal -->
    <div
      v-if="showVisitModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="showVisitModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">Book a site visit</h3>
          <button
            @click="showVisitModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          For <span class="font-medium">{{ project?.projectName }}</span>
        </p>

        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-500">Date &amp; time</label>
            <input
              v-model="visitForm.scheduledDate"
              type="datetime-local"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Your name</label>
            <input
              v-model="visitForm.customerName"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-orange-400"
              placeholder="Full name"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">Phone</label>
            <input
              v-model="visitForm.phoneNumber"
              type="tel"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-orange-400"
              placeholder="10-digit mobile"
            />
          </div>

          <p
            v-if="visitMsg"
            class="text-sm"
            :class="visitMsg.startsWith('Booked') ? 'text-green-600' : 'text-red-500'"
          >
            {{ visitMsg }}
          </p>

          <button
            @click="submitVisit"
            :disabled="submittingVisit"
            class="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-2.5 rounded-lg hover:opacity-95 disabled:opacity-60"
          >
            {{ submittingVisit ? "Booking…" : "Confirm booking" }}
          </button>

          <p v-if="!authStore.isAuthenticated" class="text-xs text-gray-500 text-center">
            You'll need to <router-link to="/login" class="text-orange-600 underline">log in</router-link> to confirm.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
