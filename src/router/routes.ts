// import type { RouteRecordRaw } from 'vue-router';

// const routes: RouteRecordRaw[] = [
//   {
//     path: '/',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
//   },

//   // Always leave this as last one,
//   // but you can also remove it
//   {
//     path: '/:catchAll(.*)*',
//     component: () => import('pages/ErrorNotFound.vue'),
//   },
// ];

const routes = [
 {
  path: '/login',
  component: () => import('layouts/MainLayout.vue'), // <-- usa layout
  children: [
    {
      path: '',
      component: () => import('pages/LoginPage.vue')
    }
  ]
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
  { path: '', component: () => import('src/pages/admin/AdminDashboard.vue') },
  { path: 'transactions-old', component: () => import('src/pages/admin/old/TransactionsPage.vue') },
  { path: 'transactions', component: () => import('src/pages/admin/transactions/index.vue') },
  { path: 'currencies', component: () => import('src/pages/admin/currencies/index.vue') }
    ]
  },
  {
    path: '/user',
    component: () => import('layouts/UserLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
  { path: '', component: () => import('src/pages/user/UserHome.vue') }
    ]
  },
  {
    path: '/',
    redirect: '/login'
  }
]

export default routes;
