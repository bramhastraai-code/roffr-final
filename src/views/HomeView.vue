<script setup>
import FadeIn from '@/components/FadeIn.vue';
import GroupBuyHero from '@/sections/homeSections/GroupBuyHero.vue';
import DealOfTheDay from '@/sections/homeSections/DealOfTheDay.vue';
import HowItWorks from '@/sections/homeSections/HowItWorks.vue';
import ExploreByVideo from '@/sections/homeSections/ExploreByVideo.vue';
import BlogsInsights from '@/sections/homeSections/BlogsInsights.vue';
import InTheNews from '@/sections/homeSections/InTheNews.vue';
import FaqSection from '@/sections/homeSections/FaqSection.vue';
</script>

<template>
  <main>
    <FadeIn :duration="0.8">
      <GroupBuyHero />
    </FadeIn>

    <FadeIn :duration="0.8" :delay="0.05">
      <DealOfTheDay />
    </FadeIn>

    <FadeIn :duration="0.8">
      <HowItWorks />
    </FadeIn>

    <FadeIn :duration="0.8">
      <ExploreByVideo />
    </FadeIn>

    <FadeIn :duration="0.8">
      <BlogsInsights />
    </FadeIn>

    <FadeIn :duration="0.8">
      <InTheNews />
    </FadeIn>

    <FadeIn :duration="0.8">
      <FaqSection />
    </FadeIn>
  </main>
</template>
