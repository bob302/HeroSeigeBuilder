import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue') // Lazy-load
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('../views/InventoryEditorView.vue') // Lazy-load
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
