import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

export default route(function () {
  const router = createRouter({
    history:
      process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory(process.env.VUE_ROUTER_BASE)
        : createWebHashHistory(process.env.VUE_ROUTER_BASE),
    routes
  })

  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    // Ensure store is hydrated from localStorage in case boot hasn't yet
    if (!auth.token) {
      auth.loadFromStorage()
    }
    // If trying to access login while already authenticated, redirect to home
    if (to.path === '/login' && auth.isLoggedIn) {
      if (auth.role === 'admin') {
        return next('/admin')
      } else if (auth.role === 'user') {
        return next('/user/home')
      }
      return next('/')
    }
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return next('/login')
    }
    if (to.meta.role && auth.role !== to.meta.role) {
      return next('/login')
    }
    next()
  })

  return router
})
