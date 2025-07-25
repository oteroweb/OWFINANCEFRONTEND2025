import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

export default route(function () {
  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
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
