<script setup>
import GsapFade from '@/components/GsapFade.vue'

import HeroSection from '@/sections/homeSection2/HeroSection.vue';
import ProjectByTimeSection from '@/sections/homeSection2/ProjectByTimeSection.vue';
import ProjectByBudgetSection from '@/sections/homeSection2/ProjectByBudgetSection.vue';
import ExclusiveProjectSection from '@/sections/homeSection2/ExclusiveProjectSection.vue';
import PropertiesForRentSection from '@/sections/homeSection2/PropertiesForRentSection.vue';
</script>

<template>
  <main class="">
    <GsapFade direction="bottom" :duration="0.8" :triggerOffset="120" class="relative z-20">
      <HeroSection />
    </GsapFade>

    <ProjectByTimeSection/>

    <ProjectByBudgetSection/>

    <ExclusiveProjectSection/>

    <PropertiesForRentSection/>

    <!-- <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <DiscountSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <TopProjectSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <ProjectCarouselSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <TopResearchedSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <UnbeatableDealsSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <WorkSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <CaseStudySection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <CalculateSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <BlogSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <SecuredInvestmentSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <EmiCalculatorSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" :triggerOffset="120">
      <TestimonialSection />
    </GsapFade>

    <GsapFade direction="bottom" :duration="0.7" delay="0.15" :triggerOffset="120">
      <FaqSection />
    </GsapFade> -->
  </main>
</template>
