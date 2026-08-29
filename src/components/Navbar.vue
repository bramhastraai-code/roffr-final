<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";

const isScrolled  = ref(false);
const isMenuOpen  = ref(false);

const route  = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const { isAuthenticated, user } = storeToRefs(authStore);

// ── RIOS AI — the navbar bar is a shortcut to the AI assistant page ──
const goToRios = () => {
  isMenuOpen.value = false;
  router.push("/rios");
};

// ── Scroll ────────────────────────────────────────────────────────
const handleScroll = () => { isScrolled.value = window.scrollY > 10; };

onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

// ── Nav ───────────────────────────────────────────────────────────
const isActive = (path) => route.path === path;

const links = [
  { label: "Projects",         path: "/project",         icon: "pi-warehouse" },
  { label: "Properties",       path: "/properties",       icon: "pi-building" },
  { label: "Builders",         path: "/builders",         icon: "pi-wrench" },
  { label: "Channel Partners", path: "/channel-partners", icon: "pi-users" },
  { label: "Platforms",        path: "/platforms",        icon: "pi-globe" },
  // { label: "Community",        path: "/social",           icon: "pi-comments" },
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
    class="w-full fixed top-0 z-30 transition-[background-color,box-shadow] duration-300"
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

      <!-- Desktop RIOS AI bar — clicking anywhere opens the RIOS page -->
      <div class="hidden md:flex relative items-center flex-1 max-w-2xl mx-auto">
        <button
          @click="goToRios"
          class="w-full rounded-full p-[1.5px] ai-gradient-border text-left cursor-pointer group"
        >
          <div
            class="w-full flex items-center gap-2 rounded-full px-4 py-1"
            :class="isScrolled ? 'bg-black' : 'bg-white'"
          >
            <svg class="w-4 h-4 shrink-0 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
            <span
              class="flex-1 text-sm py-2 select-none"
              :class="isScrolled ? 'text-white/40' : 'text-gray-400'"
            >
              Ask RIOS AI — your real estate assistant…
            </span>
            <span
              class="shrink-0 h-8 px-4 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white text-sm font-semibold flex items-center justify-center group-hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Ask RIOS
            </span>
          </div>
        </button>
      </div>

      <!-- Right: burger + auth -->
      <div class="flex items-center gap-2 ml-auto shrink-0">
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="h-9 w-9 rounded-full flex items-center justify-center transition-colors duration-200"
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

    <!-- Mobile RIOS AI bar (below topbar, md:hidden) -->
    <div class="md:hidden px-4 pb-3">
      <button @click="goToRios" class="w-full rounded-full p-[1.5px] ai-gradient-border text-left cursor-pointer group">
        <div
          class="flex items-center gap-2 px-4 py-2 rounded-full"
          :class="isScrolled ? 'bg-black' : 'bg-white'"
        >
          <svg class="w-4 h-4 shrink-0 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0 1.5 5.5 4 7.5S23 12 23 12s-4.5 1.5-7 3.5S12 22 12 22s-1.5-5.5-4-7.5S1 12 1 12s4.5-1.5 7-3.5S12 2 12 2z"/></svg>
          <span
            class="flex-1 text-sm select-none"
            :class="isScrolled ? 'text-white/40' : 'text-gray-400'"
          >
            Ask RIOS AI…
          </span>
          <span
            class="shrink-0 h-7 px-3 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white text-xs font-semibold flex items-center justify-center group-hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Ask RIOS
          </span>
        </div>
      </button>
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
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
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
/* Static gradient. This previously animated `background-position` forever on
   EVERY route in the app — a 1px border repainting on every frame, even idle.
   It now brightens on hover instead, which is where the feedback belongs. */
.ai-gradient-border {
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #ef4444, #f97316);
  transition: filter var(--dur-2) var(--ease-standard);
}
.ai-gradient-border:hover {
  filter: brightness(1.12) saturate(1.1);
}

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
