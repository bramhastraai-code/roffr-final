<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const suggestions = [
  { label: "Browse projects", path: "/project", icon: "pi-warehouse" },
  { label: "Explore cities", path: "/cities", icon: "pi-map-marker" },
  { label: "Group buy deals", path: "/group", icon: "pi-users" },
  { label: "Ask RIOS AI", path: "/rios", icon: "pi-sparkles" },
];
</script>

<template>
  <main class="min-h-[70vh] flex items-center justify-center px-4 pt-28 pb-16">
    <div class="max-w-lg w-full text-center">
      <!-- 404 mark -->
      <p
        class="font-intertight font-bold text-[88px] md:text-[120px] leading-none bg-gradient-to-r from-brand to-brand-amber bg-clip-text text-transparent"
      >
        404
      </p>

      <h1 class="font-intertight font-bold text-2xl md:text-3xl text-ink mt-2">
        This page has moved out
      </h1>
      <p class="text-gray-500 text-sm md:text-base mt-3 leading-relaxed">
        The page you're looking for doesn't exist or may have been taken down.
        Here's where most people go next.
      </p>

      <!-- Suggested destinations -->
      <div class="grid grid-cols-2 gap-3 mt-8">
        <button
          v-for="s in suggestions"
          :key="s.path"
          @click="router.push(s.path)"
          class="group flex items-center gap-3 p-4 rounded-card bg-white border border-gray-200 hover:border-brand hover:shadow-e2 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 text-left"
        >
          <span
            class="w-9 h-9 rounded-control bg-brand-light flex items-center justify-center shrink-0 group-hover:bg-brand transition-colors duration-200"
          >
            <i
              :class="`pi ${s.icon}`"
              class="text-brand text-sm group-hover:text-white transition-colors duration-200"
            ></i>
          </span>
          <span class="text-sm font-semibold text-gray-800">{{ s.label }}</span>
        </button>
      </div>

      <button
        @click="router.push('/')"
        class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand transition-colors duration-200"
      >
        <i class="pi pi-arrow-left text-xs"></i>
        Back to home
      </button>
    </div>
  </main>
</template>
