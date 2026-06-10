import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'landing', component: () => import('src/pages/public/LandingPage.vue') },
      { path: 'funciones', name: 'funciones', component: () => import('src/pages/public/FeaturesPage.vue') },
      { path: 'planes', name: 'planes', component: () => import('src/pages/public/PricingPage.vue') },
      { path: 'matriz', name: 'matriz', component: () => import('src/pages/public/MatrixPage.vue') },
    ],
  },
];
