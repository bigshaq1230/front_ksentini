import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/connexion', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { title: 'Atelier' } },
    { path: '/nouveau', name: 'intake', component: () => import('@/views/IntakeView.vue'), meta: { title: 'Nouvelle entrée', back: true } },
    { path: '/clients', name: 'customers', component: () => import('@/views/CustomersView.vue'), meta: { title: 'Clients' } },
    { path: '/clients/:id', name: 'customer', component: () => import('@/views/CustomerView.vue'), props: true, meta: { title: 'Client', back: true } },
    { path: '/vehicules/:id', name: 'vehicle', component: () => import('@/views/VehicleView.vue'), props: true, meta: { title: 'Véhicule', back: true } },
    { path: '/travaux/:id', name: 'job', component: () => import('@/views/JobView.vue'), props: true, meta: { title: 'Passage', back: true } },
    { path: '/travaux/:id/devis', name: 'quote', component: () => import('@/views/QuoteView.vue'), props: true, meta: { title: 'Devis', back: true } },
    { path: '/parametres', name: 'settings', component: () => import('@/views/SettingsView.vue'), meta: { title: 'Mon atelier', back: true } },
    { path: '/devis/:token', name: 'public-quote', component: () => import('@/views/PublicQuoteView.vue'), props: true, meta: { public: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})

router.beforeEach(async (to) => {
  if (to.meta.public) return
  const auth = useAuthStore()
  if (auth.authenticated === null) await auth.check()
  if (!auth.authenticated) return { name: 'login', query: { next: to.fullPath } }
})

export default router
