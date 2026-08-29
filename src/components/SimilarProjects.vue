<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/stores/projectStore";
import ProjectCard from "@/components/ProjectCard.vue";

// A project detail page used to be a dead end — the only exits were "Join
// Group" or leaving. This scores the market sample the store already holds
// (no extra request) to surface genuinely comparable projects.
const props = defineProps({
  project: { type: Object, required: true },
  limit: { type: Number, default: 6 },
});

const projectStore = useProjectStore();
const { marketSample } = storeToRefs(projectStore);

onMounted(() => projectStore.getRateIndex()); // loads the shared sample

const norm = (s) => String(s || "").trim().toLowerCase();

const similar = computed(() => {
  const self = props.project || {};
  if (!self._id) return [];

  const selfCity = norm(self.city);
  const selfRegion = norm(self.region);
  const selfPrice = Number(self.minPrice || 0);
  const selfStatus = norm(self.projectStatus);

  const scored = (marketSample.value || [])
    .filter((p) => p._id && p._id !== self._id)
    .map((p) => {
      let score = 0;
      // Same locality is the strongest signal, city next.
      if (selfRegion && norm(p.region) === selfRegion) score += 5;
      if (selfCity && norm(p.city) === selfCity) score += 3;
      // Comparable budget — within 35% of this project's entry price.
      const price = Number(p.minPrice || 0);
      if (selfPrice && price) {
        const delta = Math.abs(price - selfPrice) / selfPrice;
        if (delta <= 0.35) score += 3;
        else if (delta <= 0.6) score += 1;
      }
      if (selfStatus && norm(p.projectStatus) === selfStatus) score += 1;
      return { project: p, score };
    })
    // Require a real reason to be here, not just "also exists"
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, props.limit).map((x) => x.project);
});

// Explains WHY these are shown, rather than making the user guess.
const basis = computed(() => {
  const self = props.project || {};
  const area = self.region || self.city;
  return area ? `In and around ${area}, at a similar budget` : "At a similar budget";
});
</script>

<template>
  <section v-if="similar.length" class="max-w-7xl mx-auto px-4 2xl:px-0 py-10">
    <div class="mb-5">
      <h2 class="font-intertight font-bold text-[22px] md:text-[28px] text-gray-900">
        Similar projects
      </h2>
      <p class="text-sm text-gray-500 mt-1">{{ basis }}</p>
    </div>

    <div class="flex gap-5 overflow-x-auto pb-2 snap-x no-scrollbar">
      <div
        v-for="p in similar"
        :key="p._id"
        class="snap-start shrink-0 w-[300px] md:w-[340px]"
      >
        <ProjectCard :project="p" :show-group-buy="true" />
      </div>
    </div>
  </section>
</template>
