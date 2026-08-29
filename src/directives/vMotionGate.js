import { observe, unobserve } from '@/composables/useIntersect'

// v-motion-gate — marks a subtree so that any [data-loop] inside it pauses
// while the subtree is off-screen (see motion.css). Resumes slightly before
// entering view so nothing visibly "starts" as the user scrolls to it.
//
// IMPORTANT: data-loop belongs on INFINITE animations only. Putting it on a
// one-shot entrance would freeze that element at opacity: 0 forever.
const ROOT_MARGIN = '200px 0px'

export default {
  mounted(el) {
    el.setAttribute('data-motion-gate', '')
    observe(
      el,
      (entry) => el.toggleAttribute('data-inview', entry.isIntersecting),
      ROOT_MARGIN,
    )
  },
  unmounted(el) {
    unobserve(el, ROOT_MARGIN)
  },
}
