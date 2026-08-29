<script setup>
import Reveal from '@/components/Reveal.vue'

import HeroSection from '@/sections/loanSection2/HeroSection.vue';
import HowSection from '@/sections/loanSection2/HowSection.vue';
import PersonalisedSection from '@/sections/loanSection2/PersonalisedSection.vue';
import ContactSection from '@/sections/loanSection2/ContactSection.vue';
</script>

<template>
  <main>
    <Reveal>
      <HeroSection />
    </Reveal>

    <Reveal>
      <HowSection />
    </Reveal>

    <Reveal>
      <PersonalisedSection />
    </Reveal>

    <Reveal>
      <ContactSection />
    </Reveal>
  </main>
</template>
