import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'), // <-- usa layout
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
  { path: '', component: () => import('src/pages/admin/admin_dashboard.vue') },
      {
        path: 'transactions-old',
        component: () => import('src/pages/admin/old/TransactionsPage.vue'),
      },
      { path: 'transactions', component: () => import('src/pages/admin/transactions/index.vue') },
      { path: 'currencies', component: () => import('src/pages/admin/currencies/index.vue') },
      { path: 'clients', component: () => import('src/pages/admin/clients/index.vue') },
      { path: 'users', component: () => import('src/pages/admin/users/index.vue') },
      { path: 'account_type', component: () => import('src/pages/admin/account_type/index.vue') },
      { path: 'accounts', component: () => import('src/pages/admin/accounts/index.vue') },
      { path: 'taxes', component: () => import('src/pages/admin/taxes/index.vue') },
      {
        path: 'item_categories',
        component: () => import('src/pages/admin/item_categories/index.vue'),
      },
      { path: 'items', component: () => import('src/pages/admin/items/index.vue') },
      { path: 'jars', component: () => import('src/pages/admin/jars/index.vue') },
      { path: 'categories', component: () => import('src/pages/admin/categories/index.vue') },
      { path: 'rates', component: () => import('src/pages/admin/rates/index.vue') },
      { path: 'providers', component: () => import('src/pages/admin/providers/index.vue') },
    ],
  },
  {
    path: '/user',
    component: () => import('layouts/UserLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
  // Landing now points to user dashboard home
  { path: '', redirect: '/user/home' },
  { path: 'home', component: () => import('src/pages/user/user_dashboard.vue') },
  { path: 'transactions', component: () => import('src/pages/user/transactions/index.vue') },
  { path: 'accounts', component: () => import('src/pages/user/accounts/index.vue') },
  { path: 'categories', component: () => import('src/pages/user/categories/index.vue') },
  { path: 'taxes', component: () => import('src/pages/user/taxes/index.vue') },
  { path: 'config', component: () => import('src/pages/user/config/index.vue') },
  { path: 'jars', component: () => import('src/pages/user/jars/index.vue') },
    ],
  },
  {
    path: '/',
    redirect: '/login',
  },
  // Friendly alias: decide dashboard based on auth role; fallback to login
  {
    path: '/dashboard',
    redirect: () => {
      const auth = useAuthStore()
      if (!auth.token) auth.loadFromStorage()
      if (!auth.isLoggedIn) return '/login'
      if (auth.role === 'admin') return '/admin'
      if (auth.role === 'user') return '/user/home'
      return '/login'
    }
  },
  // Catch-all 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
