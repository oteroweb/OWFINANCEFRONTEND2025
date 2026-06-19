import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/register',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/RegisterPage.vue') }],
  },
  {
    path: '/forgot-password',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ForgotPasswordPage.vue') }],
  },
  {
    path: '/reset-password',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/ResetPasswordPage.vue') }],
  },
];
