<script setup>
// One card skeleton for the whole app. There were three competing skeleton
// designs (ProjectView2's, CityProjectsView's flat block, BuilderListView's),
// and several pages showed their EMPTY state while still loading — which
// reads as "no results" on every page load.
defineProps({
  count: { type: Number, default: 6 },
  // 'card' — image + text lines; 'row' — compact list row
  variant: { type: String, default: 'card' },
})
</script>

<template>
  <div
    v-if="variant === 'card'"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    aria-busy="true"
    aria-label="Loading results"
  >
    <div
      v-for="n in count"
      :key="n"
      class="rounded-card bg-white border border-gray-200 overflow-hidden"
    >
      <div class="h-44 bg-gray-100 motion-safe:animate-pulse"></div>
      <div class="p-4 space-y-2.5">
        <div class="h-4 bg-gray-100 rounded w-3/4 motion-safe:animate-pulse"></div>
        <div class="h-3 bg-gray-100 rounded w-1/2 motion-safe:animate-pulse"></div>
        <div class="h-3 bg-gray-100 rounded w-2/3 motion-safe:animate-pulse"></div>
      </div>
    </div>
  </div>

  <div v-else class="space-y-3" aria-busy="true" aria-label="Loading">
    <div
      v-for="n in count"
      :key="n"
      class="flex items-center gap-4 p-4 rounded-card bg-white border border-gray-200"
    >
      <div class="w-12 h-12 rounded-full bg-gray-100 shrink-0 motion-safe:animate-pulse"></div>
      <div class="flex-1 space-y-2">
        <div class="h-3.5 bg-gray-100 rounded w-1/3 motion-safe:animate-pulse"></div>
        <div class="h-3 bg-gray-100 rounded w-1/4 motion-safe:animate-pulse"></div>
      </div>
    </div>
  </div>
</template>
