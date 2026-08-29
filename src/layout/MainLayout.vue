<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import BotModal from "@/components/BotModal.vue";
import CompareTray from "@/components/CompareTray.vue";
</script>

<template>
  <main class="">
    <Navbar />
    <div class="relative">
      <RouterView />
      <!-- Bot launcher button and VideoContainer were disabled here; their
           assets (bot-logo.svg, demo-video.mp4) were removed as unreferenced.
           Both are recoverable from git history if re-enabled. -->
      <BotModal/>
      <CompareTray />
    </div>
    <Footer />
  </main>
</template>
