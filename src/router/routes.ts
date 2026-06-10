import type { RouteRecordRaw } from 'vue-router'
import { authRoutes } from './auth.routes'
import { adminRoutes } from './admin.routes'
import { userRoutes } from './user.routes'
import { publicRoutes } from './public.routes'

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  // Friendly alias: decide dashboard based on auth role; fallback to login
  {
    path: '/dashboard',
    redirect: () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')
      if (!token) return '/login'
      if (role === 'admin') return '/admin'
      if (role === 'user') return '/user/home'
      return '/login'
    }
  },
  // Short aliases
  {
    path: '/home',
    redirect: '/user/home'
  },
  // Catch-all 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
