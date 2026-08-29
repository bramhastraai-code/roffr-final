import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'
import "./assets/main.css"
import Vue3Marquee from 'vue3-marquee'
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import { createHead } from '@unhead/vue/client'

import App from './App.vue'
import router from './router'
import vMotionGate from './directives/vMotionGate'
import vReveal from './directives/vReveal'

// Reveal animations hide their content until observed. Gating that behind
// html.js means content stays visible if JS never runs.
document.documentElement.classList.add('js')

// Pause every [data-loop] animation while the tab is in the background.
document.addEventListener('visibilitychange', () => {
  document.documentElement.toggleAttribute('data-page-hidden', document.hidden)
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
// Per-route <head>: titles, descriptions, canonicals, OG tags and JSON-LD.
app.use(createHead())
app.use(Vue3Marquee)
app.use(Vue3Toastify, {
  autoClose: 3000,
});
app.directive('motion-gate', vMotionGate);
app.directive('reveal', vReveal);

app.mount('#app')
