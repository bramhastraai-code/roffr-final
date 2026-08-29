<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";
import ProjectCard from "@/components/ProjectCard.vue";
import GroupBuyFomo from "@/components/GroupBuyFomo.vue";
import CardSkeleton from "@/components/ui/CardSkeleton.vue";
import StateBlock from "@/components/ui/StateBlock.vue";

const route  = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const { projectPropertyListData, totalProjects } = storeToRefs(projectStore);

const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
// Accumulated across pages; the store ref only holds the latest page
const projects = ref([]);

// This had no try/catch, so a failed request silently rendered the empty
// state — indistinguishable from "this city genuinely has no projects".
const loadError = ref(false);

const fetchProjects = async () => {
  loading.value = true;
  loadError.value = false;
  page.value = 1;
  try {
    await projectStore.getProjectList("project", "", route.params.city, 1);
    projects.value = [...(projectPropertyListData.value || [])];
  } catch {
    loadError.value = true;
    projects.value = [];
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  loadingMore.value = true;
  page.value += 1;
  await projectStore.getProjectList("project", "", route.params.city, page.value);
  projects.value = [...projects.value, ...(projectPropertyListData.value || [])];
  loadingMore.value = false;
};

onMounted(fetchProjects);
watch(() => route.params.city, fetchProjects);

const cityLabel = () => {
  const c = route.params.city || "";
  return c.charAt(0).toUpperCase() + c.slice(1);
};
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 xl:px-0 py-10 mt-24 md:mt-0">

    <!-- Breadcrumb / Back -->
    <div class="flex items-center gap-2 mb-6">
      <button
        @click="router.back()"
        class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <i class="pi pi-arrow-left text-xs"></i>
        Back
      </button>
      <span class="text-gray-300">/</span>
      <span class="text-sm text-gray-400">Cities</span>
      <span class="text-gray-300">/</span>
      <span class="text-sm font-semibold text-gray-800 capitalize">{{ cityLabel() }}</span>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-intertight font-bold text-[28px] md:text-[36px] text-gray-900 capitalize">
        Projects in {{ cityLabel() }}
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        <span v-if="!loading && totalProjects">{{ totalProjects }} project{{ totalProjects === 1 ? "" : "s" }} · </span>
        Browse all available group buy deals in {{ cityLabel() }}
      </p>
    </div>

    <!-- Live group-buy FOMO band for this city -->
    <GroupBuyFomo :city="String(route.params.city || '')" />

    <!-- Skeleton -->
    <CardSkeleton v-if="loading" :count="6" />

    <!-- Error — distinct from "this city has no projects" -->
    <StateBlock
      v-else-if="loadError"
      variant="error"
      title="Couldn't load projects"
      :message="`Something went wrong fetching projects in ${cityLabel()}.`"
      action-label="Try again"
      @action="fetchProjects"
    />

    <!-- Empty -->
    <StateBlock
      v-else-if="!projects.length"
      icon="pi-building"
      :title="`No projects in ${cityLabel()} yet`"
      message="We're adding new projects regularly. Try a nearby city in the meantime."
      action-label="Browse other cities"
      @action="router.push('/cities')"
    />

    <!-- Project grid -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project._id"
          :project="project"
          :show-group-buy="true"
        />
      </div>

      <!-- Load more -->
      <div v-if="projects.length < totalProjects" class="text-center mt-10">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="px-8 py-3 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#EB3131] hover:text-[#EB3131] transition-colors duration-200 disabled:opacity-50"
        >
          <span v-if="loadingMore"><i class="pi pi-spinner pi-spin text-xs mr-1.5"></i>Loading…</span>
          <span v-else>Load more ({{ projects.length }} of {{ totalProjects }})</span>
        </button>
      </div>
    </template>

  </main>
</template>
