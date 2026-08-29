<script setup>
import Reveal from '@/components/Reveal.vue';
import GroupBuyHero from '@/sections/homeSections/GroupBuyHero.vue';
import HeroSearchBar from '@/sections/homeSections/HeroSearchBar.vue';
import DealOfTheDay from '@/sections/homeSections/DealOfTheDay.vue';
import GroupBuyDealsSection from '@/sections/homeSections/GroupBuyDealsSection.vue';
import FeaturedProjectsSection from '@/sections/homeSections/FeaturedProjectsSection.vue';
import CitiesSection from '@/sections/homeSections/CitiesSection.vue';
import HowItWorks from '@/sections/homeSections/HowItWorks.vue';
import AboutSection from '@/sections/homeSections/AboutSection.vue';
import ExploreByVideo from '@/sections/homeSections/ExploreByVideo.vue';
import BlogsInsights from '@/sections/homeSections/BlogsInsights.vue';
import FindRealtorBanner from '@/sections/homeSections/FindRealtorBanner.vue';
import FaqSection from '@/sections/homeSections/FaqSection.vue';
import RecentlyViewedSection from '@/sections/homeSections/RecentlyViewedSection.vue';
</script>

<template>
  <main>
    <!-- The hero is above the fold: render it immediately rather than
         revealing it, so first paint isn't an empty screen. -->
    <GroupBuyHero />

    <!-- Reveal clears its transform once settled (.is-done), so sections no
         longer create stacking contexts. The `relative z-20` hack that the
         old FadeIn required here is gone; the search bar keeps its own z-20
         inside the component for the dropdowns. -->
    <Reveal>
      <HeroSearchBar />
    </Reveal>

    <!-- Only renders for returning visitors who have viewed something.
         Not wrapped in <Reveal>: its header and cards reveal themselves with
         v-reveal, and nesting the two would double-animate the same content. -->
    <RecentlyViewedSection />

    <Reveal>
      <DealOfTheDay />
    </Reveal>

    <Reveal>
      <FindRealtorBanner />
    </Reveal>

    <Reveal>
      <GroupBuyDealsSection />
    </Reveal>

    <Reveal>
      <FeaturedProjectsSection />
    </Reveal>

    <!-- Not wrapped: the bento tiles stagger themselves with v-reveal -->
    <CitiesSection />

    <Reveal>
      <HowItWorks />
    </Reveal>

    <Reveal>
      <AboutSection />
    </Reveal>

    <Reveal>
      <ExploreByVideo />
    </Reveal>

    <Reveal>
      <BlogsInsights />
    </Reveal>

    <Reveal>
      <FaqSection />
    </Reveal>
  </main>
</template>
