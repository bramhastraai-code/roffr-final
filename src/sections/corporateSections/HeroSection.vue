<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = ref(null);
const leftContentRef = ref(null);
const rightImageRef = ref(null);

onMounted(() => { 
  const ctx = gsap.context(() => {
    // Left column staggered entrance
    gsap.fromTo(leftContentRef.value.children,
      { opacity: 0, y: 40 },
      { 
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true }
      }
    );

    // Right column image reveal
    gsap.fromTo(rightImageRef.value,
      { opacity: 0, scale: 0.95, x: 40 },
      { 
        opacity: 1, scale: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: sectionRef.value, start: 'top 85%', once: true }
      }
    );
  }, sectionRef.value);

  return () => ctx.revert();
});
</script>

<template>
  <section ref="sectionRef" class="corporate-hero-section">
    <div class="inner-container">
      
      <!-- Left Column: Text Content -->
      <div ref="leftContentRef" class="left-col">
        
        <div class="badge-wrapper">
          <span class="badge">INSTITUTIONAL PLATFORM</span>
        </div>

        <h1 class="main-title">
          Empowering Corporates & <br class="hidden xl:block"/>
          <span class="text-purple">Communities</span> to <br class="hidden xl:block"/>
          Buy Smarter
        </h1>

        <p class="subtitle">
          Scale your real estate acquisitions through collective bargaining,
          institutional-grade verification, and zero-brokerage direct procurement.
        </p>

        <div class="btn-group">
          <button class="btn btn-primary">Start Your Bulk Requirement</button>
          <button class="btn btn-secondary">Explore Solutions</button>
        </div>

      </div>

      <!-- Right Column: Image with Offset Background -->
      <div class="right-col">
        <div ref="rightImageRef" class="image-showcase">
          <!-- The soft purple rotated shape behind the image -->
          <div class="soft-bg-shape"></div>
          
          <img 
            src="/images/corporatePage/hero.png" 
            alt="Corporate Real Estate Skyscraper" 
            class="hero-img"
          />
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* ── Main Layout ── */
.corporate-hero-section {
  background-color: #FAFAFB; /* Very soft off-white background matching design */
  padding: 10rem 1.5rem 6rem; /* High top padding to account for fixed navbars typically */
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
  position: relative;
}

.inner-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

@media (min-width: 1024px) {
  .inner-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

/* ── Left Column ── */
.left-col {
  flex: 1;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
}

/* Badge */
.badge-wrapper {
  margin-bottom: 2rem;
  will-change: transform, opacity;
}

.badge {
  font-family: 'Urbanist', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background-color: #ECE9FE; /* Light soft purple */
  color: #4B3BE0; /* Dark intense purple */
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
}

/* Typography */
.main-title {
  font-family: 'Urbanist', sans-serif;
  font-size: clamp(3rem, 5vw, 4.5rem);
  font-weight: 800;
  color: #111827;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0 0 1.5rem 0;
  will-change: transform, opacity;
}

.text-purple {
  color: #4736D9; /* Vibrant Royal Purple matching screenshot */
}

.subtitle {
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  color: #4B5563;
  line-height: 1.6;
  margin: 0 0 2.5rem 0;
  max-width: 550px;
  will-change: transform, opacity;
}

/* Buttons */
.btn-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  will-change: transform, opacity;
}

.btn {
  font-family: 'Urbanist', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  padding: 1rem 1.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: #4736D9; /* Primary Purple */
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(71, 54, 217, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(71, 54, 217, 0.3);
}

.btn-secondary {
  background-color: #EAEAEF; /* Light gray */
  color: #4736D9; /* Purple text */
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background-color: #E0E0E8;
}

/* ── Right Column ── */
.right-col {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-showcase {
  position: relative;
  width: 100%;
  max-width: 500px;
  will-change: transform, opacity;
}

.soft-bg-shape {
  position: absolute;
  top: -15px;
  bottom: -15px;
  left: -20px;
  right: -20px;
  background-color: #EBE9FE; /* Soft purple backdrop */
  border-radius: 32px;
  transform: rotate(-3deg);
  z-index: 1;
}

.hero-img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: auto;
  border-radius: 24px; /* Crisp rounded corners matching the UI */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  display: block;
}

/* Responsive Overrides */
@media (max-width: 1024px) {
  .left-col {
    text-align: center;
    align-items: center;
  }
  
  .subtitle {
    margin: 0 auto 2.5rem;
  }
  
  .btn-group {
    justify-content: center;
  }
}
</style>
