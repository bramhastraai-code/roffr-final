<script setup>
import { RouterView } from "vue-router";
import LoginModal from "@/components/LoginModal.vue";
import BenefitsModal from "@/components/BenefitsModal.vue";

// Lenis smooth scroll was removed deliberately. It re-drove scrolling from a
// rAF loop on the MAIN thread, so any main-thread hitch became visible scroll
// stutter; native scroll runs on the compositor and stays smooth regardless.
// Its rAF loop was also never cancelled and it was never linked to route
// changes. Scroll is now owned solely by router.scrollBehavior.
</script>

<template>
  <RouterView />
  <LoginModal />
  <BenefitsModal />
</template>
