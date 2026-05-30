import rawData from '@/data/1000_blogs.json'

const CATEGORY_IMAGES = {
  'Residential Properties': '/images/heroSection/building-hero.webp',
  'Commercial Properties':  '/images/GroupBuy/hero.webp',
  'Investment Guides':      '/images/HomePage/dealSection/home-img.webp',
  'Market Analysis':        '/images/HomePage/dealSection/bg-image.webp',
  'Legal Information':      '/images/AboutPage/aboutHero/about-bg.webp',
  'Financing Solutions':    '/images/LoanPage/loan-hero.webp',
  'Property Management':    '/images/AboutPage/groupBuy/group-buy.webp',
  'Buyer Resources':        '/images/GroupBuy/community.webp',
}
const FALLBACK = '/images/heroSection/hero-bg.webp'

export const blogs = rawData.blogs.map(b => ({
  blog_id:          b.id,
  id:               b.id,
  slug:             b.slug,
  title:            b.title,
  description:      b.meta_description,
  meta_description: b.meta_description,
  content:          b.content,
  content_html:     `<p class="leading-relaxed">${b.content}</p>`,
  category:         b.category,
  city:             b.city,
  locality:         b.locality,
  property_type:    b.property_type,
  bhk:              b.bhk,
  price_range:      b.price_range,
  amenity:          b.amenity,
  tags:             b.keywords,
  keywords:         b.keywords,
  reading_time_min: Math.max(1, Math.ceil(b.word_count / 200)),
  word_count:       b.word_count,
  language:         'English',
  img:              CATEGORY_IMAGES[b.category] || FALLBACK,
}))

export const CATEGORIES    = rawData.categories_covered
export const CITIES        = rawData.cities_covered
export const PROPERTY_TYPES = rawData.property_types
