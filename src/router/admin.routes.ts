import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', component: () => import('src/pages/admin/admin_dashboard.vue') },
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
      { path: 'categories', component: () => import('src/pages/admin/categories/index.vue') },
      { path: 'rates', component: () => import('src/pages/admin/rates/index.vue') },
      { path: 'providers', component: () => import('src/pages/admin/providers/index.vue') },
      { path: 'transaction_types', component: () => import('pages/admin/transaction_types/index.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: 'roles', component: () => import('pages/admin/roles/index.vue'), meta: { requiresAuth: true, role: 'admin' } },
      { path: 'system', component: () => import('pages/admin/system/index.vue'), meta: { requiresAuth: true, role: 'admin' } },
    ],
  },
];
