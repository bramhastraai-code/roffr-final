<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated, user } = storeToRefs(authStore);

const handleLogout = () => {
  authStore.logout();
  router.push("/");
  isMobileMenuOpen.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const isActive = (path) => route.path === path;

const links = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/project" },
  { label: "Properties", path: "/properties" },
  { label: "Builders", path: "/builders" },
  { label: "Channel Partners", path: "/channel-partners" },
  { label: "Community", path: "/social" },
  // { label: "About Us", path: "/about" },
  // {
  //   label: "Resources",
  //   path: "/resources",
  //   dropdown: [
  //     { label: "Articles", path: "/articles" },
  //     { label: "News", path: "/news" },
  //     { label: "Case Studies", path: "/case-study" },
  //   ],
  // },
  // { label: "Loan", path: "/loan" },
  // { label: "Corporate", path: "/corporate" },
];

// Protected navigation for Projects route
const goTo = (path) => {
  // if (path === "/project" && !isAuthenticated.value) {
  //   router.push("/login");
  //   isMobileMenuOpen.value = false;
  //   return;
  // }
  router.push(path);
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <nav
    class="w-full py-3 fixed top-0 z-30 backdrop-blur-md transition-all duration-300"
    :class="
      isScrolled ? 'bg-black bg-opacity-90 shadow-md' : 'bg-white shadow-sm'
    "
  >
    <div
      class="flex justify-between items-center max-w-7xl mx-auto text-white px-4 xl:px-0"
    >
      <!-- Logo -->
      <router-link
        to="/"
        class="flex items-center gap-2"
      >
        <img
        v-if="isScrolled"
          src="/svg/Global/main-logo-white.svg"
          alt=""
          class="h-[42px] md:h-[40px]"
        />
        <img
        v-else
          src="/svg/Global/main-logo.svg"
          alt=""
          class="h-[42px] md:h-[40px]"
        />
      </router-link>

      <!-- Desktop links -->
      <div
        class="hidden xl:flex items-center gap-8 font-inter text-sm md:text-base"
      >
        <template v-for="link in links" :key="link.path + link.label">
          <!-- Dropdown menu -->
          <div v-if="link.dropdown" class="relative group">
            <router-link
              :to="link.path"
              class="relative pb-1 transition-colors duration-200 flex items-center gap-1"
              :class="
                isActive(link.path)
                  ? isScrolled
                    ? 'text-[#FDBA74]'
                    : 'text-orange-500'
                  : isScrolled
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-800 hover:text-black'
              "
            >
              {{ link.label }}
              <i class="pi pi-angle-down text-xs"></i>
              <span
                class="absolute left-0 -bottom-0.5 h-[2px] bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
                :class="
                  isActive(link.path)
                    ? 'w-full opacity-100'
                    : 'w-0 opacity-0 group-hover:w-full'
                "
              ></span>
            </router-link>
            <!-- Dropdown content -->
            <div
              class="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
            >
              <router-link
                v-for="item in link.dropdown"
                :key="item.path"
                :to="item.path"
                class="block px-5 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#EB3131] transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {{ item.label }}
              </router-link>
            </div>
          </div>
          <!-- Regular link - Protected Projects link -->
          <template v-else>
            <!-- Show Projects as login button if not authenticated -->
            <div
              v-if="link.path === '/project' && !isAuthenticated"
              class="relative pb-1 transition-colors duration-200 group cursor-pointer"
              @click="router.push('/project')"
            >
              <span
                class="text-sm md:text-base font-inter"
                :class="
                  isScrolled
                    ? 'text-white/80 hover:text-white'
                    : 'text-gray-800 hover:text-black'
                "
              >
                {{ link.label }}
              </span>
              <span
                class="absolute left-0 -bottom-0.5 h-[2px] bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 w-0 opacity-0 group-hover:w-full"
              ></span>
            </div>
            <!-- Normal router-link for authenticated users or other routes -->
            <router-link
              v-else
              :to="link.path"
              class="relative pb-1 transition-colors duration-200 group"
              :class="
                isActive(link.path)
                  ? isScrolled
                    ? 'text-[#FDBA74]'
                    : 'text-orange-500'
                  : isScrolled
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-800 hover:text-black'
              "
            >
              {{ link.label }}
              <span
                class="absolute left-0 -bottom-0.5 h-[2px] bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
                :class="
                  isActive(link.path)
                    ? 'w-full opacity-100'
                    : 'w-0 opacity-0 group-hover:w-full'
                "
              ></span>
            </router-link>
          </template>
        </template>
        <!-- Auth Buttons -->
        <div v-if="!isAuthenticated">
          <router-link
            to="/login"
            class="bg-[#EB3131] hover:bg-[#DDA439] text-white px-5 py-2 rounded-full transition-colors duration-300 font-medium"
          >
            Login
          </router-link>
        </div>
        <div v-else class="flex items-center gap-4">
          <router-link
            to="/dashboard"
            class=" transition-colors duration-300"
            :class="isScrolled ? 'text-white' : 'text-black'"
          >
            Hi, {{ user?.name || "User" }}
          </router-link>
          <button
            @click="handleLogout"
            class="text-white/80 bg-[#EB3131] hover:bg-[#DDA439] text-white px-5 py-1 rounded-full transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Mobile hamburger -->
      <button
        class="xl:hidden h-9 w-9 rounded-full flex items-center justify-center transition-colors"
        :class="isScrolled ? 'bg-white/10' : 'bg-black/5'"
        @click="isMobileMenuOpen = true"
      >
        <i
          class="pi pi-bars text-lg"
          :class="isScrolled ? 'text-white' : 'text-black'"
        ></i>
      </button>
    </div>

    <!-- Overlay -->
    <transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-30 xl:hidden"
        @click.self="isMobileMenuOpen = false"
      >
        <!-- Left Sidebar -->
        <transition name="slide-left">
          <div
            class="absolute top-0 left-0 h-screen w-72 bg-black text-white shadow-xl flex flex-col z-40"
          >
            <div
              class="flex items-center justify-between px-4 py-4 border-b border-white/10"
            >
              <img src="/svg/Global/main-logo.svg" alt="" class="h-[32px]" />

              <button
                class="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
                @click="isMobileMenuOpen = false"
              >
                <i class="pi pi-times text-white text-sm"></i>
              </button>
            </div>

            <nav
              class="px-4 py-4 flex flex-col gap-2 font-inter text-sm bg-black h-screen"
            >
              <template
                v-for="link in links"
                :key="'m-' + link.path + link.label"
              >
                <!-- Link with dropdown -->
                <div v-if="link.dropdown">
                  <button
                    @click="goTo(link.path)"
                    class="flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors w-full"
                    :class="
                      isActive(link.path)
                        ? 'bg-white/10 text-[#FDBA74]'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    "
                  >
                    <i class="pi pi-server text-sm"></i>
                    <span>{{ link.label }}</span>
                  </button>
                  <!-- Submenu items -->
                  <div class="ml-6 mt-1 flex flex-col gap-1">
                    <button
                      v-for="item in link.dropdown"
                      :key="item.path"
                      @click="goTo(item.path)"
                      class="flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors"
                      :class="
                        isActive(item.path)
                          ? 'bg-white/10 text-[#FDBA74]'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      "
                    >
                      <i class="pi pi-circle-fill text-[6px]"></i>
                      <span>{{ item.label }}</span>
                    </button>
                  </div>
                </div>
                <!-- Regular link - Protected Projects link -->
                <button
                  v-else
                  @click="goTo(link.path)"
                  class="flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors"
                  :class="
                    isActive(link.path)
                      ? 'bg-white/10 text-[#FDBA74]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  "
                >
                  <i
                    class="pi text-sm"
                    :class="{
                      'pi-home': link.path === '/',
                      'pi-warehouse': link.path === '/project',
                      'pi-users': link.path === '/about',
                      'pi-indian-rupee': link.path === '/loan',
                      'pi-times': link.path === '/channel-partner',
                      'pi-book': link.path === '/contact',
                    }"
                  ></i>
                  <span>{{ link.label }}</span>
                </button>
              </template>

              <!-- Mobile Auth -->
              <div class="mt-4 pt-4 border-t border-white/10">
                <button
                  v-if="!isAuthenticated"
                  @click="goTo('/login')"
                  class="flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors w-full text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <i class="pi pi-sign-in text-sm"></i>
                  <span>Login</span>
                </button>
                <div v-else>
                  <div
                    class="px-2 py-2 text-white/60 text-xs uppercase tracking-wider"
                  >
                    Account
                  </div>
                  <button
                    @click="goTo('/dashboard')"
                    class="flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors w-full text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <i class="pi pi-th-large text-sm"></i>
                    <span>Dashboard</span>
                  </button>
                  <button
                    @click="handleLogout"
                    class="flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors w-full text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <i class="pi pi-sign-out text-sm"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </transition>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* LEFT drawer slide animation */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
