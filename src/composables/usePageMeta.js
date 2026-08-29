import { useHead } from '@unhead/vue'
import { computed, unref } from 'vue'

// Per-route <head> management.
//
// Before this, index.html held the only title/description/canonical in the
// app, so every URL — every project, property, builder and blog post — served
// the homepage's metadata, and the hardcoded canonical told Google that every
// page was a duplicate of "/". This composable gives each route its own.
//
// Accepts plain values or refs/computeds; everything re-evaluates reactively,
// which matters because detail pages set meta before their data has loaded.

const SITE_NAME = 'Roffr'
const SITE_URL = 'https://roffr.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-cover.jpg`

/** Trim to a length search engines will actually display. */
const clamp = (text, max) => {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trimEnd()}…`
}

const absolute = (path) => {
  const p = String(path || '')
  if (!p) return SITE_URL
  if (/^https?:\/\//i.test(p)) return p
  return `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`
}

/**
 * @param {object} source - values or refs:
 *   title       page title, without the site suffix
 *   description meta description
 *   path        canonical path, e.g. `/project-details/123`
 *   image       absolute or root-relative OG image
 *   type        og:type ('website' | 'article' | 'product')
 *   noindex     true to keep a page out of the index
 */
export function usePageMeta(source = {}) {
  const meta = computed(() => {
    const s = typeof source === 'function' ? source() : source
    const get = (k) => unref(s[k])

    const rawTitle = get('title')
    const title = rawTitle
      ? clamp(`${rawTitle} | ${SITE_NAME}`, 65)
      : 'Roffr — Discover Verified Real Estate Projects, Listings & Channel Partners'

    return {
      title,
      description: clamp(
        get('description') ||
          'Browse verified real estate projects, compare prices per sqft and join group buys to unlock better rates.',
        160,
      ),
      canonical: absolute(get('path')),
      image: absolute(get('image') || DEFAULT_IMAGE),
      type: get('type') || 'website',
      noindex: Boolean(get('noindex')),
    }
  })

  useHead(() => ({
    title: meta.value.title,
    link: [{ rel: 'canonical', href: meta.value.canonical }],
    meta: [
      { name: 'description', content: meta.value.description },
      ...(meta.value.noindex
        ? [{ name: 'robots', content: 'noindex, follow' }]
        : []),

      { property: 'og:title', content: meta.value.title },
      { property: 'og:description', content: meta.value.description },
      { property: 'og:url', content: meta.value.canonical },
      { property: 'og:image', content: meta.value.image },
      { property: 'og:type', content: meta.value.type },
      { property: 'og:site_name', content: SITE_NAME },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: meta.value.title },
      { name: 'twitter:description', content: meta.value.description },
      { name: 'twitter:image', content: meta.value.image },
    ],
  }))
}

/**
 * Attach a JSON-LD block. Pass a ref/getter so it updates once data arrives;
 * returning null skips the script entirely rather than emitting a half-empty
 * object that would fail validation.
 */
export function useJsonLd(build) {
  useHead(() => {
    const data = typeof build === 'function' ? build() : unref(build)
    if (!data) return {}
    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(data),
        },
      ],
    }
  })
}

export { SITE_URL, SITE_NAME, absolute }
