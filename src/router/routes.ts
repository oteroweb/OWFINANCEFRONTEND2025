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
  { path: 'currencies', component: () => import('src/pages/admin/currencies/index.vue') },
  { path: 'clients', component: () => import('src/pages/admin/clients/index.vue') },
  { path: 'users', component: () => import('src/pages/admin/users/index.vue') },
  { path: 'account_type', component: () => import('src/pages/admin/account_type/index.vue') },
  { path: 'accounts', component: () => import('src/pages/admin/accounts/index.vue') },
  { path: 'taxes', component: () => import('src/pages/admin/taxes/index.vue') },
  { path: 'item_categories', component: () => import('src/pages/admin/item_categories/index.vue') },
  { path: 'items', component: () => import('src/pages/admin/items/index.vue') },
  { path: 'jars', component: () => import('src/pages/admin/jars/index.vue') },
  { path: 'categories', component: () => import('src/pages/admin/categories/index.vue') }
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
