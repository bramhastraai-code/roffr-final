<script setup>
import ProjectCardSection from '@/sections/projectDetailSections/ProjectCardSection.vue';
import ProjectDetailSection from '@/sections/projectDetailSections/ProjectDetailSection.vue';
import AboutDeveloperSection from '@/sections/projectDetailSections2/AboutDeveloperSection.vue';
import HeroSection from '@/sections/projectDetailSections2/HeroSection.vue';
import ProjectSummarySection from '@/sections/projectDetailSections2/ProjectSummarySection.vue';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectStore } from '@/stores/projectStore';
import GroupBuyingSection from '@/sections/projectDetailSections2/GroupBuyingSection.vue';

const route = useRoute()
const projectId = route.params.id
const projectStore = useProjectStore()

onMounted(async() => {
  projectStore.getProjectById(projectId)
})
</script>

<template>
  <main class="">
    <!-- <ProjectCardSection/>
    <ProjectDetailSection/> -->
    <HeroSection/>
    <GroupBuyingSection/>
    <ProjectSummarySection/>
    <AboutDeveloperSection/>
  </main>
</template>
