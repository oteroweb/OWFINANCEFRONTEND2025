import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

export default route(function () {
  const router = createRouter({
    history:
      process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory(process.env.VUE_ROUTER_BASE)
        : createWebHashHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) return { el: to.hash, behavior: 'smooth' }
      return { top: 0, behavior: 'instant' }
    },
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

    // If root path and logged in, redirect to appropriate dashboard
    if (to.path === '/' && auth.isLoggedIn) {
      if (auth.role === 'admin') {
        return next('/admin')
      } else if (auth.role === 'user') {
        return next('/user/home')
      }
      return next('/login')
    }

    // App nativa (Capacitor): la landing de marketing es del sitio web, no del
    // app instalado — sin sesión, la primera pantalla es directamente el login.
    if (to.path === '/' && !auth.isLoggedIn && Capacitor.isNativePlatform()) {
      return next('/login')
    }

    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return next('/login')
    }

    if (to.meta.role && auth.role !== to.meta.role) {
      return next('/login')
    }

    // Lite mode: /user/accounts is a Pro-only page — redirect to config
    if (to.path === '/user/accounts') {
      const layoutMode = auth.settings?.layout_mode ?? auth.user?.layout_mode
      if (layoutMode === 'lite') {
        return next('/user/config')
      }
    }

    next()
  })

  return router
})
