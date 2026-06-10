import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/public/LandingPage.vue'),
      },
    ],
  },
  {
    path: '/funciones',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/public/FeaturesPage.vue'),
      },
    ],
  },
  {
    path: '/planes',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/public/PricingPage.vue'),
      },
    ],
  },
  {
    path: '/matriz',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/public/MatrixPage.vue'),
      },
    ],
  },
];
