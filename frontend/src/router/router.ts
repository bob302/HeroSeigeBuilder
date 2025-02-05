import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue') // Lazy-load
  },
  {
    path: '/add',
    name: 'add',
    component: () => import('../views/AddItemView.vue') // Lazy-load
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: () => import('../views/EquipmentCatalogView.vue') // Lazy-load
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
