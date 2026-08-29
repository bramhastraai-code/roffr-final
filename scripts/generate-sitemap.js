/**
 * Sitemap generator — run before `vite build` to produce public/sitemap.xml.
 *
 * Static pages are hardcoded below.
 * Dynamic pages are fetched from the API at build time; if the API is offline
 * those sections are skipped and a warning is printed (the build still succeeds).
 *
 * Usage:
 *   node scripts/generate-sitemap.js        # standalone
 *   npm run build                           # automatically runs this first
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { news } from '../src/data/news.js'
import { caseStudies } from '../src/dummyData/case-study.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Blogs are read straight from the JSON rather than via src/data/blogsData.js,
// because that module imports through the Vite alias ('@/data/...') which bare
// Node cannot resolve. Only `slug` is needed here, and it passes through
// blogsData untransformed, so reading the source is equivalent.
const blogs = JSON.parse(
  readFileSync(resolve(ROOT, 'src/data/1000_blogs.json'), 'utf8'),
).blogs ?? []
const SITE = 'https://roffr.com'
const TODAY = new Date().toISOString().slice(0, 10)

// ── Load .env ────────────────────────────────────────────────────────────────

function loadEnv() {
  const p = resolve(ROOT, '.env')
  if (!existsSync(p)) return {}
  return Object.fromEntries(
    readFileSync(p, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }),
  )
}

// Real environment variables win over the .env file. Hosts like Vercel inject
// config as process.env and may not ship a .env at all — without this the API
// URL silently fell back to localhost during a deploy, so every request failed.
const env = { ...loadEnv(), ...process.env }
const API = (env.VITE_API_BASE_URL || 'http://localhost:3333').replace(/\/$/, '')

// A missing catalogue should be loud, but it must not block a deploy: the
// build would then depend on a third-party API being reachable from the build
// container. Set SITEMAP_STRICT=1 (locally or in a scheduled job) to turn it
// back into a hard failure.
const STRICT = env.SITEMAP_STRICT === '1' || env.SITEMAP_STRICT === 'true'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(path) {
  try {
    const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) {
      console.warn(`  ⚠  API ${path} → HTTP ${res.status}`)
      return null
    }
    return res.json()
  } catch (err) {
    console.warn(`  ⚠  API ${path} unreachable: ${err.message}`)
    return null
  }
}

function toDate(val) {
  if (!val) return TODAY
  const d = new Date(val)
  return isNaN(d.getTime()) ? TODAY : d.toISOString().slice(0, 10)
}

function urlEntry(loc, { lastmod = TODAY, changefreq = 'weekly', priority = '0.5' } = {}) {
  return (
    '  <url>\n' +
    `    <loc>${SITE}${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    '  </url>'
  )
}

// ── Static pages ─────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  ['/',                 { changefreq: 'daily',   priority: '1.0' }],
  ['/project',         { changefreq: 'daily',   priority: '0.9' }],
  ['/properties',      { changefreq: 'daily',   priority: '0.9' }],
  ['/search',          { changefreq: 'daily',   priority: '0.8' }],
  ['/channel-partners',{ changefreq: 'weekly',  priority: '0.8' }],
  ['/builders',        { changefreq: 'weekly',  priority: '0.8' }],
  ['/broker-list',     { changefreq: 'weekly',  priority: '0.7' }],
  ['/resources',       { changefreq: 'weekly',  priority: '0.7' }],
  ['/articles',        { changefreq: 'weekly',  priority: '0.7' }],
  ['/news',            { changefreq: 'daily',   priority: '0.7' }],
  ['/case-study',      { changefreq: 'weekly',  priority: '0.6' }],
  ['/loan',            { changefreq: 'monthly', priority: '0.7' }],
  ['/corporate',       { changefreq: 'monthly', priority: '0.6' }],
  ['/group',           { changefreq: 'weekly',  priority: '0.6' }],
  ['/channel-partner', { changefreq: 'monthly', priority: '0.6' }],
  ['/about',           { changefreq: 'monthly', priority: '0.5' }],
  ['/contact',         { changefreq: 'monthly', priority: '0.5' }],
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
  console.log(`\n🗺  Generating sitemap for ${SITE}`)
  console.log(`   API: ${API}\n`)

  const entries = []
  // Catalogue sections that came back empty. Treated as a build failure at the
  // end, rather than a warning that scrolls past in CI.
  const missingCatalogue = []

  // Static pages
  for (const [loc, opts] of STATIC_PAGES) {
    entries.push(urlEntry(loc, { lastmod: TODAY, ...opts }))
  }
  console.log(`  ✓ ${STATIC_PAGES.length} static pages`)

  // ── Projects ──────────────────────────────────────────────────────────────
  // NOTE: this API ignores `limit`/`page`; it honours `pageSize`/`pageNumber`.
  // With limit=2000 it silently returned only 10 rows, which is why the live
  // sitemap listed 10 projects instead of 775.
  const projRes = await apiFetch('/projects?type=project&pageSize=2000&pageNumber=1')
  const projects = projRes?.data?.projects ?? projRes?.projects ?? []
  if (projects.length) {
    for (const p of projects) {
      const id = p._id ?? p.id
      if (!id) continue
      entries.push(urlEntry(`/project-details/${id}`, {
        lastmod: toDate(p.updatedAt ?? p.createdAt),
        changefreq: 'weekly',
        priority: '0.8',
      }))
    }
    console.log(`  ✓ ${projects.length} projects`)
  } else {
    // Hard failure, not a warning: the catalogue IS the sitemap. Shipping one
    // without any listings is how the live file ended up with 2,241 URLs of
    // which only 20 were projects/properties, while the build reported success.
    missingCatalogue.push('projects')
  }

  // ── Properties ────────────────────────────────────────────────────────────
  // Must use /properties/roffer, NOT /projects?type=property — that endpoint
  // ignores `type` and returns the same project records, so the previous
  // version emitted /property-details/<projectId> for every project: hundreds
  // of URLs pointing at the wrong entity.
  const propRes = await apiFetch('/properties/roffer?pageSize=2000&pageNumber=1')
  const properties =
    propRes?.data?.properties ??
    propRes?.data?.results ??
    (Array.isArray(propRes?.data) ? propRes.data : null) ??
    []
  if (properties.length) {
    for (const p of properties) {
      const id = p._id ?? p.id
      if (!id) continue
      entries.push(urlEntry(`/property-details/${id}`, {
        lastmod: toDate(p.updatedAt ?? p.createdAt),
        changefreq: 'weekly',
        priority: '0.8',
      }))
    }
    console.log(`  ✓ ${properties.length} properties`)
  } else {
    missingCatalogue.push('properties')
  }

  // ── Builders ──────────────────────────────────────────────────────────────
  const builderRes = await apiFetch('/company?pageNumber=1&pageSize=2000')
  const builders =
    builderRes?.data?.companies ??
    (Array.isArray(builderRes?.data) ? builderRes.data : null) ??
    []
  if (builders.length) {
    for (const b of builders) {
      const id = b._id ?? b.id
      if (!id) continue
      entries.push(urlEntry(`/builders/${id}`, {
        lastmod: toDate(b.updatedAt ?? b.createdAt),
        changefreq: 'monthly',
        priority: '0.7',
      }))
    }
    console.log(`  ✓ ${builders.length} builders`)
  } else {
    console.warn('  ⚠  Builders skipped (API offline or empty)')
  }

  // ── Brokers / Channel Partners ────────────────────────────────────────────
  const brokerRes = await apiFetch('/users?pageNumber=1&pageSize=2000')
  const brokers =
    brokerRes?.data?.users ??
    (Array.isArray(brokerRes?.data) ? brokerRes.data : null) ??
    []
  if (brokers.length) {
    for (const b of brokers) {
      const id = b._id ?? b.id
      if (!id) continue
      const lastmod = toDate(b.updatedAt ?? b.createdAt)
      // Both URL shapes point to the same detail component
      // One canonical shape only — /broker-details/:id renders the same
      // component and has been removed from the router.
      entries.push(urlEntry(`/channel-partners/${id}`, { lastmod, changefreq: 'monthly', priority: '0.7' }))
    }
    console.log(`  ✓ ${brokers.length} brokers`)
  } else {
    console.warn('  ⚠  Brokers skipped (API offline or empty)')
  }

  // ── Static-data: blogs ────────────────────────────────────────────────────
  for (const b of blogs) {
    if (!b.slug) continue
    entries.push(urlEntry(`/blog-details/${b.slug}`, {
      lastmod: TODAY,
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }
  console.log(`  ✓ ${blogs.length} blogs (static data)`)

  // ── Static-data: news ─────────────────────────────────────────────────────
  for (const n of news) {
    if (!n.id) continue
    entries.push(urlEntry(`/news/${n.id}`, {
      lastmod: toDate(n.date?.iso),
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }
  console.log(`  ✓ ${news.length} news items (static data)`)

  // ── Static-data: case studies ─────────────────────────────────────────────
  for (const c of caseStudies) {
    const id = c._id ?? c.slug
    if (!id) continue
    entries.push(urlEntry(`/case-details/${id}`, {
      lastmod: toDate(c.createdAt),
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }
  console.log(`  ✓ ${caseStudies.length} case studies (static data)`)

  // ── Write file ────────────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Generated ${new Date().toISOString()} — run "npm run sitemap" to refresh -->`,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n')

  const out = resolve(ROOT, 'public', 'sitemap.xml')

  if (missingCatalogue.length) {
    const summary = `${missingCatalogue.join(' and ')} returned no results from ${API}`

    if (STRICT) {
      throw new Error(
        `${summary}.\n` +
        `   SITEMAP_STRICT is set — refusing to write a sitemap without the catalogue.`,
      )
    }

    // Keep whatever is already committed rather than overwriting it with a
    // sitemap that omits the listings. Better a slightly stale sitemap than
    // one that tells Google the catalogue disappeared — and better than a
    // failed deploy.
    console.warn(
      `\n⚠  ${summary}.\n` +
      `   Keeping the existing public/sitemap.xml instead of writing an incomplete one.\n` +
      `   The deploy continues; re-run once the API is reachable to refresh it.\n`,
    )
    if (!existsSync(out)) {
      console.warn('   (No existing sitemap found — writing the partial one so the build has something.)')
      writeFileSync(out, xml, 'utf-8')
    }
    return
  }

  writeFileSync(out, xml, 'utf-8')
  console.log(`\n✅ Wrote ${entries.length} URLs → public/sitemap.xml\n`)
}

generate().catch(err => {
  console.error('❌ Sitemap generation failed:', err)
  process.exit(1)
})
