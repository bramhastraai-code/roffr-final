<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useSearchStore } from "@/stores/SearchStore";
import { storeToRefs } from "pinia";
import { debounce } from "@/utils/debounce";

const isScrolled  = ref(false);
const isMenuOpen  = ref(false);
const location    = ref("Raipur, Chhattisgarh, 492001, In...");

const route  = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const { isAuthenticated, user } = storeToRefs(authStore);

const searchStore = useSearchStore();
const { searchSuggestionData, term } = storeToRefs(searchStore);

// ── Search state ─────────────────────────────────────────────────
const searchInput       = ref("");
const desktopSugOpen    = ref(false);
const sidebarSugOpen    = ref(false);
const desktopSearchRef  = ref(null);

const suggestionsList = computed(() =>
  Array.isArray(searchSuggestionData.value)
    ? searchSuggestionData.value
    : searchSuggestionData.value?.data || []
);

const fetchSuggestions = debounce(async () => {
  const t = searchInput.value.trim();
  if (t.length < 2) {
    desktopSugOpen.value = false;
    sidebarSugOpen.value = false;
    return;
  }
  term.value = t;
  await searchStore.getSearchSuggestion();
  desktopSugOpen.value = true;
  sidebarSugOpen.value = isMenuOpen.value;
}, 300);

watch(searchInput, fetchSuggestions);

const goToResults = () => {
  const q = searchInput.value.trim();
  desktopSugOpen.value = false;
  sidebarSugOpen.value = false;
  isMenuOpen.value = false;
  router.push({ path: "/search", query: q ? { q } : {} });
};

const onSuggestionClick = (s) => {
  desktopSugOpen.value = false;
  sidebarSugOpen.value = false;
  isMenuOpen.value = false;
  if (s.type === "project" && s._id) {
    router.push(`/project-details/${s._id}`);
    return;
  }
  if (s.type === "property" && s._id) {
    router.push(`/property-details/${s._id}`);
    return;
  }
  searchInput.value = s.title || searchInput.value;
  goToResults();
};

// ── Click-outside closes desktop suggestions ─────────────────────
const onClickOutside = (e) => {
  if (desktopSearchRef.value && !desktopSearchRef.value.contains(e.target)) {
    desktopSugOpen.value = false;
  }
};

// ── Scroll ────────────────────────────────────────────────────────
const handleScroll = () => { isScrolled.value = window.scrollY > 10; };

onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("click", onClickOutside);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", onClickOutside);
});

// ── Nav ───────────────────────────────────────────────────────────
const isActive = (path) => route.path === path;

const links = [
  { label: "Projects",         path: "/project",         icon: "pi-warehouse" },
  { label: "Properties",       path: "/properties",       icon: "pi-building" },
  { label: "Builders",         path: "/builders",         icon: "pi-wrench" },
  { label: "Channel Partners", path: "/channel-partners", icon: "pi-users" },
  { label: "Platforms",        path: "/platforms",        icon: "pi-globe" },
  { label: "Community",        path: "/social",           icon: "pi-comments" },
  { label: "Cities",         path: "/cities",            icon: "pi-building" },
  { label: "About Us",         path: "/about",            icon: "pi-info-circle" },
  // { label: "Resources",        path: "/resources",        icon: "pi-book" },
  // { label: "Articles",         path: "/articles",         icon: "pi-file" },
  // { label: "News",             path: "/news",             icon: "pi-megaphone" },
];

const goTo = (path) => { router.push(path); isMenuOpen.value = false; };

const handleLogout = () => { authStore.logout(); router.push("/"); isMenuOpen.value = false; };
</script>

<template>
  <!-- ── Backdrop (sidebar) ────────────────────────────────────── -->
  <transition name="fade">
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
      @click="isMenuOpen = false"
    />
  </transition>

  <!-- ── Sidebar (mobile / tablet) ────────────────────────────── -->
  <transition name="slide-sidebar">
    <aside
      v-if="isMenuOpen"
      class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col lg:hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <router-link to="/" @click="isMenuOpen = false">
          <img src="/svg/Global/main-logo.svg" alt="ROFFR" class="h-9" />
        </router-link>
        <button
          @click="isMenuOpen = false"
          class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <i class="pi pi-times text-gray-600 text-sm"></i>
        </button>
      </div>

      <!-- Sidebar search with suggestions -->
      <div class="px-5 py-3 border-b border-gray-100 shrink-0">
        <div class="relative">
          <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <i class="pi pi-search text-gray-400 text-sm"></i>
            <input
              v-model="searchInput"
              @keyup.enter="goToResults"
              @focus="sidebarSugOpen = !!suggestionsList.length"
              type="text"
              placeholder="Search projects & properties..."
              class="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            />
            <button
              v-if="searchInput"
              @click="searchInput = ''; sidebarSugOpen = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>

          <!-- Sidebar suggestions dropdown -->
          <div
            v-if="sidebarSugOpen && suggestionsList.length"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden max-h-60 overflow-y-auto"
          >
            <button
              v-for="(s, i) in suggestionsList"
              :key="s._id || i"
              @click="onSuggestionClick(s)"
              class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
            >
              <i class="pi text-gray-400 text-xs shrink-0"
                 :class="s.type === 'project' ? 'pi-warehouse' : 'pi-building'"></i>
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ s.title }}</p>
                <p v-if="s.subtitle" class="text-[11px] text-gray-400 truncate">{{ s.subtitle }}</p>
              </div>
              <span class="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    :class="s.type === 'project' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'">
                {{ s.type }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 overflow-y-auto px-3 py-3">
        <button
          v-for="link in links"
          :key="link.path"
          @click="goTo(link.path)"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5"
          :class="isActive(link.path)
            ? 'bg-red-50 text-[#EB3131]'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            :class="isActive(link.path) ? 'bg-[#EB3131]/10' : 'bg-gray-100'"
          >
            <i class="pi text-sm"
               :class="[link.icon, isActive(link.path) ? 'text-[#EB3131]' : 'text-gray-500']"></i>
          </div>
          {{ link.label }}
          <i v-if="isActive(link.path)" class="pi pi-angle-right text-[#EB3131] text-xs ml-auto"></i>
        </button>
      </nav>

      <!-- Auth bottom -->
      <div class="px-5 py-4 border-t border-gray-100 shrink-0">
        <template v-if="!isAuthenticated">
          <button
            @click="goTo('/login')"
            class="w-full flex items-center justify-center gap-2 bg-[#EB3131] hover:bg-[#c72828] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            <i class="pi pi-user text-xs"></i>
            Sign in / Register
          </button>
        </template>
        <template v-else>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br from-orange-400 to-red-500 shrink-0">
              {{ (user?.name || "U").charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 leading-tight truncate">{{ user?.name || "User" }}</p>
              <p class="text-[11px] text-gray-400 truncate">{{ user?.email || "" }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="goTo('/dashboard')"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              <i class="pi pi-th-large text-xs"></i> Dashboard
            </button>
            <button @click="handleLogout"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-red-50 hover:bg-red-100 text-[#EB3131] transition-colors">
              <i class="pi pi-sign-out text-xs"></i> Logout
            </button>
          </div>
        </template>
      </div>
    </aside>
  </transition>

  <!-- ── Top navbar ────────────────────────────────────────────── -->
  <nav
    class="w-full fixed top-0 z-30 transition-all duration-300"
    :class="isScrolled ? 'bg-black/90 shadow-lg backdrop-blur-md' : 'bg-white shadow-sm'"
  >
    <div class="max-w-7xl mx-auto px-4 xl:px-0 flex items-center gap-3 py-3">

      <!-- Logo -->
      <router-link to="/" class="flex items-center shrink-0">
        <img
          :src="isScrolled ? '/svg/Global/main-logo-white.svg' : '/svg/Global/main-logo.svg'"
          alt="ROFFR" class="h-[40px]"
        />
      </router-link>

      <!-- Desktop search bar + suggestions -->
      <div ref="desktopSearchRef" class="hidden md:flex relative items-center flex-1 max-w-2xl mx-auto">
        <div
          class="w-full flex items-center gap-0 rounded-full border overflow-visible"
          :class="isScrolled ? 'border-white/20 bg-white/10' : 'border-gray-200 bg-white'"
        >
          <!-- Location -->
          <button
            class="flex items-center gap-2 px-4 py-2 shrink-0 transition-colors duration-200 rounded-l-full"
            :class="isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-50'"
          >
            <i class="pi pi-map-marker text-[#EB3131] text-base"></i>
            <div class="text-left min-w-0">
              <div class="text-[10px] font-semibold uppercase tracking-wide leading-none"
                   :class="isScrolled ? 'text-white/50' : 'text-gray-400'">Location</div>
              <div class="text-xs font-medium truncate max-w-[130px] leading-tight mt-0.5"
                   :class="isScrolled ? 'text-white/80' : 'text-gray-700'">{{ location }}</div>
            </div>
            <i class="pi pi-angle-down text-xs" :class="isScrolled ? 'text-white/50' : 'text-gray-400'"></i>
          </button>

          <div class="h-8 w-px shrink-0" :class="isScrolled ? 'bg-white/20' : 'bg-gray-200'"></div>

          <!-- Input -->
          <div class="flex items-center gap-2 px-4 flex-1">
            <i class="pi pi-search text-sm shrink-0" :class="isScrolled ? 'text-white/50' : 'text-gray-400'"></i>
            <input
              v-model="searchInput"
              @keyup.enter="goToResults"
              @focus="desktopSugOpen = !!suggestionsList.length"
              type="text"
              placeholder="Search projects, properties, locations..."
              class="flex-1 bg-transparent outline-none text-sm py-2"
              :class="isScrolled ? 'text-white placeholder-white/40' : 'text-gray-800 placeholder-gray-400'"
            />
            <button
              v-if="searchInput"
              @click.stop="searchInput = ''; desktopSugOpen = false"
              class="shrink-0 transition-colors"
              :class="isScrolled ? 'text-white/40 hover:text-white' : 'text-gray-300 hover:text-gray-500'"
            >
              <i class="pi pi-times text-xs"></i>
            </button>
            <button
              @click="goToResults"
              class="shrink-0 h-8 px-4 rounded-full bg-[#EB3131] text-white text-xs font-semibold hover:bg-[#c72828] transition-colors ml-1"
            >
              Search
            </button>
          </div>
        </div>

        <!-- Desktop suggestions dropdown -->
        <div
          v-if="desktopSugOpen && suggestionsList.length"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
        >
          <button
            v-for="(s, i) in suggestionsList"
            :key="s._id || i"
            @click="onSuggestionClick(s)"
            class="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                 :class="s.type === 'project' ? 'bg-blue-50' : 'bg-emerald-50'">
              <i class="pi text-sm"
                 :class="s.type === 'project' ? 'pi-warehouse text-blue-500' : 'pi-building text-emerald-500'"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ s.title }}</p>
              <p v-if="s.subtitle" class="text-[11px] text-gray-400 truncate mt-0.5">{{ s.subtitle }}</p>
            </div>
            <span class="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0"
                  :class="s.type === 'project' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'">
              {{ s.type }}
            </span>
          </button>

          <!-- View all results -->
          <button
            @click="goToResults"
            class="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#EB3131] hover:bg-red-50 transition-colors border-t border-gray-100"
          >
            View all results for "{{ searchInput }}"
            <i class="pi pi-arrow-right text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Right: burger + auth -->
      <div class="flex items-center gap-2 ml-auto shrink-0">
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200"
          :class="isMenuOpen
            ? 'bg-[#EB3131] text-white'
            : isScrolled
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-black/5 text-gray-700 hover:bg-black/10'"
          aria-label="Toggle menu"
        >
          <i class="pi text-base" :class="isMenuOpen ? 'pi-times' : 'pi-bars'"></i>
        </button>

        <template v-if="!isAuthenticated">
          <router-link
            to="/login"
            class="hidden sm:inline-flex items-center gap-2 bg-[#EB3131] hover:bg-[#c72828] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
          >
            <i class="pi pi-user text-xs"></i>
            Sign in / Register
          </router-link>
        </template>
        <template v-else>
          <router-link to="/dashboard" title="Dashboard">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm text-white bg-gradient-to-br from-orange-400 to-red-500">
              {{ (user?.name || "U").charAt(0).toUpperCase() }}
            </div>
          </router-link>
          <button
            @click="handleLogout"
            class="h-9 w-9 rounded-full flex items-center justify-center transition-colors"
            :class="isScrolled ? 'bg-white/10 text-white/80 hover:bg-white/20' : 'bg-black/5 text-gray-600 hover:bg-black/10'"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </template>
      </div>
    </div>

    <!-- Mobile search bar (below topbar) -->
    <div class="md:hidden px-4 pb-3">
      <div
        class="flex items-center gap-2 px-4 py-2 rounded-full border"
        :class="isScrolled ? 'border-white/20 bg-white/10' : 'border-gray-200 bg-white'"
      >
        <i class="pi pi-search text-sm" :class="isScrolled ? 'text-white/50' : 'text-gray-400'"></i>
        <input
          v-model="searchInput"
          @keyup.enter="goToResults"
          type="text"
          placeholder="Search For Property"
          class="flex-1 bg-transparent outline-none text-sm"
          :class="isScrolled ? 'text-white placeholder-white/40' : 'text-gray-800 placeholder-gray-400'"
        />
        <button @click="goToResults" :class="isScrolled ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-[#EB3131]'">
          <i class="pi pi-arrow-right text-sm transition-colors duration-200"></i>
        </button>
      </div>
    </div>

    <!-- Desktop dropdown (lg+) -->
    <transition name="slide-down">
      <div
        v-if="isMenuOpen"
        class="hidden lg:block border-t overflow-hidden"
        :class="isScrolled ? 'bg-black/95 border-white/10' : 'bg-white border-gray-100'"
      >
        <div class="max-w-7xl mx-auto px-4 xl:px-0 py-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="link in links"
              :key="link.path"
              @click="goTo(link.path)"
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="isActive(link.path)
                ? 'bg-[#EB3131] text-white shadow-sm shadow-red-200'
                : isScrolled
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
            >
              <i class="pi text-xs" :class="link.icon"></i>
              {{ link.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-sidebar-enter-active,
.slide-sidebar-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-sidebar-enter-from,
.slide-sidebar-leave-to { transform: translateX(-100%); }

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  transform-origin: top;
}
.slide-down-enter-from,
.slide-down-leave-to { transform: translateY(-12px) scaleY(0.95); opacity: 0; }
.slide-down-enter-to,
.slide-down-leave-from { transform: translateY(0) scaleY(1); opacity: 1; }
</style>
