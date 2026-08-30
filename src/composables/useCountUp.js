import { ref, onBeforeUnmount } from 'vue'
import { observe, unobserve } from '@/composables/useIntersect'

// Count a number up when it scrolls into view.
//
// Extracted from the inline implementation in AboutSection.vue so the new
// numeric sections don't each grow their own copy. Uses the app's shared
// IntersectionObserver rather than creating another one, animates with rAF
// (no library), and runs once.
//
// Respects prefers-reduced-motion by jumping straight to the final value —
// the information still lands, the motion doesn't.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * @param {number} target   final value
 * @param {object} options
 *   duration  ms, default 1400
 *   decimals  fixed decimal places, default 0
 * @returns { value, start, watchEl }
 *
 * Bind `watchEl` as a FUNCTION ref on the element whose visibility should
 * trigger the count:  <div :ref="watchEl">
 */
export function useCountUp(target, { duration = 1400, decimals = 0 } = {}) {
  const value = ref(0)

  let frame = null
  let started = false
  let watched = null

  const round = (n) => (decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n))

  const start = () => {
    if (started) return
    started = true

    const to = Number(target) || 0
    if (prefersReducedMotion() || !to) {
      value.value = round(to)
      return
    }

    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      // ease-out cubic: quick start, gentle settle
      value.value = round((1 - Math.pow(1 - p, 3)) * to)
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  const release = () => {
    if (watched) unobserve(watched)
    watched = null
  }

  // Vue calls a function ref with the element on mount and null on unmount.
  const watchEl = (el) => {
    if (!el) {
      release()
      return
    }
    watched = el
    observe(el, (entry) => {
      if (!entry.isIntersecting) return
      start()
      release()
    })
  }

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame)
    release()
  })

  return { value, start, watchEl }
}
