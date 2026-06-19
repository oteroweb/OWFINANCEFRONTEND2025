import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('layouts/AppShell.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      { path: '', redirect: '/user/home' },
      { path: 'home', component: () => import('src/pages/user/HomeView.vue') },
      { path: 'home-components', component: () => import('src/pages/user/home_components_showcase.vue') },
      { path: 'expense-analysis', component: () => import('src/pages/user/expense-analysis/index.vue') },
      { path: 'transactions', component: () => import('src/pages/user/transactions/index.vue') },
      { path: 'accounts', component: () => import('src/pages/user/accounts/index.vue') },
      { path: 'categories', component: () => import('src/pages/user/categories/index.vue') },
      { path: 'taxes', component: () => import('src/pages/user/taxes/index.vue') },
      { path: 'config', component: () => import('src/pages/user/config/index.vue') },
      { path: 'jars', component: () => import('src/pages/user/jars/index.vue') },
      { path: 'dreams', component: () => import('src/pages/user/dreams/index.vue') },
      { path: 'debts', component: () => import('src/pages/user/debts/index.vue') },
      { path: 'asesor', component: () => import('src/pages/AsesorPage.vue') },
      { path: 'profile', component: () => import('src/pages/user/profile/index.vue') },
      { path: 'financial-profile', component: () => import('src/pages/user/financial-profile/index.vue') },
      // /user/settings alias → mismo componente que /user/config (usado desde Pro sidebar)
      { path: 'settings', redirect: '/user/config' },
    ],
  },
];
