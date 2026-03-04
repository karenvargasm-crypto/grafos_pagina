import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import InformacionView from '../views/InformacionView.vue'
import SimuladorView from '../views/SimuladorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/informacion',
      name: 'informacion',
      component: InformacionView,
    },
    {
      path: '/simulador',
      name: 'simulador',
      component: SimuladorView,
    },
  ],
})

export default router
