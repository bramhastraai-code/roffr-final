import { observe, unobserve } from '@/composables/useIntersect'

// v-reveal — fade/rise an element in when it scrolls into view.
//
// The lightest possible implementation, and deliberately so:
//   • no library (this replaces the GSAP + ScrollTrigger reveals)
//   • no component instance per element — it's a directive, so a list of 20
//     cards costs 20 class toggles, not 20 Vue components
//   • ONE shared IntersectionObserver app-wide (see composables/useIntersect)
//   • animates transform + opacity only, on the compositor
//   • clears the transform when finished, so revealed elements don't leave
//     behind stacking contexts or promoted layers (the bug the old GSAP
//     FadeIn caused, which forced a z-index hack in HomeView)
//   • honours prefers-reduced-motion via the global block in motion.css
//
// Conflict rules, to keep motion coherent:
//   • Never put v-reveal on an element that already has its own entrance
//     animation, or on a child of a <Reveal> wrapper — one reveal per element.
//   • Never combine with data-loop (that's for infinite animations only).
//
// Usage:
//   v-reveal                      -> default rise
//   v-reveal="{ y: 24, delay: 80 }"
//   v-reveal:80                   -> shorthand for an 80ms delay (stagger)
const DEFAULTS = { y: 16, delay: 0 }

export default {
  mounted(el, binding) {
    // Respect an entrance the element already defines for itself.
    if (el.hasAttribute('data-reveal')) return

    // Self-enforcing conflict guard: if any ancestor is already revealing
    // (a <Reveal> wrapper, or another v-reveal), skip. Nesting two reveals
    // over the same content double-animates it and looks like a stutter.
    if (el.parentElement?.closest('[data-reveal]')) return

    const opts = {
      ...DEFAULTS,
      ...(typeof binding.value === 'object' && binding.value ? binding.value : {}),
    }
    // v-reveal:120 -> 120ms delay, handy for staggering a v-for
    if (binding.arg) {
      const parsed = Number(binding.arg)
      if (Number.isFinite(parsed)) opts.delay = parsed
    }

    el.setAttribute('data-reveal', '')
    el.style.setProperty('--reveal-y', `${opts.y}px`)
    // Cap the stagger so the last item in a long list never waits seconds
    if (opts.delay) {
      el.style.setProperty('--reveal-delay', `${Math.min(opts.delay, 400)}ms`)
    }

    const finish = () => {
      clearTimeout(el._revealTimer)
      el.classList.add('is-done')
    }

    observe(el, (entry) => {
      if (!entry.isIntersecting) return
      el.addEventListener('transitionend', finish, { once: true })
      el.classList.add('is-revealed')
      // Safety net: transitionend won't fire under reduced motion, or if the
      // element is hidden mid-transition.
      el._revealTimer = setTimeout(finish, 900)
      unobserve(el)
    })
  },

  unmounted(el) {
    clearTimeout(el._revealTimer)
    unobserve(el)
  },
}
