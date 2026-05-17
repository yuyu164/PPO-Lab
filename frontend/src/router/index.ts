import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import EmptyView from '@/views/EmptyView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: EmptyView,
    meta: { section: 'hero', title: 'PPO-Lab' },
  },
  {
    path: '/alignment',
    name: 'alignment',
    component: EmptyView,
    meta: { section: 'alignment', title: '对齐剧场' },
  },
  {
    path: '/quad-model',
    name: 'quad-model',
    component: EmptyView,
    meta: { section: 'quad-model', title: '四模演武场' },
  },
  {
    path: '/kl-controller',
    name: 'kl-controller',
    component: EmptyView,
    meta: { section: 'kl-controller', title: 'KL散度调节器' },
  },
  {
    path: '/gae-retracer',
    name: 'gae-retracer',
    component: EmptyView,
    meta: { section: 'gae-retracer', title: 'GAE回溯器' },
  },
  {
    path: '/training-simulator',
    name: 'training-simulator',
    component: EmptyView,
    meta: { section: 'training-simulator', title: '训练模拟器' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (to.meta.section && to.name !== 'home') {
      return { el: `#${to.meta.section as string}`, behavior: 'smooth' }
    }
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const section = to.meta.section as string | undefined
  if (section) {
    document.title = to.meta.title ? `${to.meta.title} - PPO-Lab` : 'PPO-Lab'
  }
})

export default router
