<script setup>
import Reveal from '@/components/Reveal.vue'

import HeroSection from '@/sections/aboutSection2/HeroSection.vue'
import PowerSection from '@/sections/aboutSection2/PowerSection.vue'
import WhyChooseSection from '@/sections/aboutSection2/WhyChooseSection.vue'
import TheCorePillars from '@/sections/aboutSection2/The Core Pillars.vue';
import MeetTheFounders from '@/sections/aboutSection2/MeetTheFounders.vue';
</script>

<template>
  <main>
    <Reveal>
      <HeroSection />
    </Reveal>

    <Reveal>
      <PowerSection />
    </Reveal>

    <Reveal>
      <TheCorePillars />
    </Reveal>

    <Reveal>
      <MeetTheFounders />
    </Reveal>

  </main>
</template>
