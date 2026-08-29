import { createRouter, createWebHistory } from 'vue-router'

// Layout and the landing page stay eager — they are needed for first paint.
import MainLayout from '@/layout/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'

// Every other route is code-split: each becomes its own chunk fetched on
// navigation, instead of all 29 views living in one eager bundle.
const AboutView = () => import('@/views/AboutView.vue')
const ProjectDetailView = () => import('@/views/ProjectDetailView.vue')
const PropertyDetailView = () => import('@/views/PropertyDetailView.vue')
const BlogDetails = () => import('@/views/BlogDetails.vue')
const BlogsView = () => import('@/views/BlogsView.vue')
const ResourceView = () => import('@/views/ResourceView.vue')
const ContactusView = () => import('@/views/ContactusView.vue')
const CaseStudyDetails = () => import('@/views/CaseStudyDetails.vue')
const LoanView = () => import('@/views/LoanView.vue')
const ChannelPartnerView = () => import('@/views/ChannelPartnerView.vue')
const ArticlesView = () => import('@/views/ArticlesView.vue')
const NewsView = () => import('@/views/NewsView.vue')
const CaseStudyView = () => import('@/views/CaseStudyView.vue')
const CorporateView = () => import('@/views/CorporateView.vue')
const GroupBuyView = () => import('@/views/GroupBuyView.vue')
const ProjectView2 = () => import('@/views/ProjectView2.vue')
const PropertiesView2 = () => import('@/views/PropertiesView2.vue')
const SearchView = () => import('@/views/SearchView.vue')
const BrokerListView = () => import('@/views/BrokerListView.vue')
const BrokerDetailsView = () => import('@/views/BrokerDetailsView.vue')
const BuilderListView = () => import('@/views/BuilderListView.vue')
const BuilderDetailsView = () => import('@/views/BuilderDetailsView.vue')
const SocialView = () => import('@/views/SocialView.vue')
const NewsDetails = () => import('@/views/NewsDetails.vue')
const PlatformsView = () => import('@/views/PlatformsView.vue')
const CitiesView = () => import('@/views/CitiesView.vue')
const CityProjectsView = () => import('@/views/CityProjectsView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "",
      path: "/",
      component: MainLayout,
      children: [
        {
          name: "home",
          path: "/",
          component: HomeView
        },
        {
          name: "about",
          path: "/about",
          component: AboutView
        },
        {
          name: "project",
          path: "/project",
          component: ProjectView2,
          meta: { requiresAuth: true }
        },
        {
          name: "search",
          path: "/search",
          component: SearchView
        },
        {
          name: "properties",
          path: "/properties",
          component: PropertiesView2,
          meta: { requiresAuth: true }
        },
        {
          name: "contact",
          path: "/contact",
          component: ContactusView
        },
        {
          name: "broker-list",
          path: "/broker-list",
          component: BrokerListView
        },
        {
          name: "broker-details",
          path: "/broker-details/:id",
          component: BrokerDetailsView
        },
        {
          name: "channel-partners",
          path: "/channel-partners",
          component: BrokerListView,
          meta: { requiresAuth: true }
        },
        {
          name: "channel-partner-details",
          path: "/channel-partners/:id",
          component: BrokerDetailsView,
          meta: { requiresAuth: true }
        },
        {
          name: "builders",
          path: "/builders",
          component: BuilderListView,
          meta: { requiresAuth: true }
        },
        {
          name: "builder-details",
          path: "/builders/:id",
          component: BuilderDetailsView,
          meta: { requiresAuth: true }
        },
        {
          name: "social",
          path: "/social",
          component: SocialView
        },
        {
          name: "project-details",
          path: "/project-details/:id",
          component: ProjectDetailView,
          meta: { requiresAuth: true }
        },
        {
          name: "property-details",
          path: "/property-details/:id",
          component: PropertyDetailView,
          meta: { requiresAuth: true }
        },
        {
          name: "resources",
          path: "/resources",
          component: ResourceView
        },
        {
          name: "articles",
          path: "/articles",
          component: ArticlesView
        },
        {
          name: "news",
          path: "/news",
          component: NewsView
        },
        {
          name: "case-study",
          path: "/case-study",
          component: CaseStudyView
        },
        {
          name: "loan",
          path: "/loan",
          component: LoanView
        },
        {
          name: "corporate",
          path: "/corporate",
          component: CorporateView
        },
        {
          name: "group",
          path: "/group",
          component: GroupBuyView
        },
        {
          name: "my-group-buys",
          path: "/my-group-buys",
          component: () => import('@/views/MyGroupBuysView.vue')
        },
        {
          name: "channel-partner",
          path: "/channel-partner",
          component: ChannelPartnerView
        },
        {
          name: "blogs",
          path: "/blogs",
          component: BlogsView
        },
        {
          name: "blog-details",
          path: "/blog-details/:slug",
          component: BlogDetails
        },
        {
          name: "news-details",
          path: "/news/:id",
          component: NewsDetails
        },
        {
          name: "case-details",
          path: "/case-details/:id",
          component: CaseStudyDetails
        },
        {
          name: "dashboard",
          path: "/dashboard",
          component: () => import('@/views/DashboardView.vue')
        },
        {
          name: "platforms",
          path: "/platforms",
          component: PlatformsView
        },
        {
          name: "rios",
          path: "/rios",
          component: () => import('@/views/RiosAiView.vue')
        },
        {
          name: "cities",
          path: "/cities",
          component: CitiesView
        },
        {
          name: "city-projects",
          path: "/cities/:city",
          component: CityProjectsView
        },
        {
          // Catch-all. Previously an unknown URL rendered an empty layout.
          name: "not-found",
          path: "/:pathMatch(.*)*",
          component: () => import('@/views/NotFoundView.vue')
        },
      ]
    },
    {
      name: "login",
      path: "/login",
      component: () => import('@/views/LoginView.vue')
    },
  ],
  // Single scroll authority. Lenis and `html { scroll-behavior: smooth }` were
  // removed — this is now the only thing that moves the page on navigation.
  scrollBehavior(to, from, savedPosition) {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Back / forward: restore instantly, never animate a restore.
    if (savedPosition) return savedPosition;

    // In-page anchor: the one place smooth scrolling earns its keep.
    if (to.hash) return { el: to.hash, behavior: reduce ? 'auto' : 'smooth' };

    // Same route, different query (filters, tabs, pagination): don't move.
    if (to.path === from.path) return false;

    // New page: jump to top, instantly.
    return { top: 0, left: 0 };
  }
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('accessToken')) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
