<script setup>
import Reveal from '@/components/Reveal.vue'

import HeroSection from '@/sections/channelPartnerSection2/HeroSection.vue';
import BestCrmSection from '@/sections/channelPartnerSection2/BestCrmSection.vue';
import UnbeatableDealsSection from '@/sections/homeSections/UnbeatableDealsSection.vue';
import WorkSection from '@/sections/homeSections/WorkSection.vue';
</script>

<template>
  <main>
    <Reveal>
      <HeroSection />
    </Reveal>

    <Reveal>
      <BestCrmSection />
    </Reveal>

    <Reveal>
      <UnbeatableDealsSection />
    </Reveal>

    <Reveal>
      <WorkSection />
    </Reveal>
  </main>
</template>
