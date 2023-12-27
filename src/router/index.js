import { createRouter, createWebHistory } from 'vue-router'
import layout from '../layout/index.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: layout
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
