<template>
  <div class="public-layout">
    <!-- Header -->
    <header class="nav">
      <div class="wrap nav-inner">
        <router-link class="nav-logo" to="/" aria-label="OW Finance — inicio">
          <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" height="26">
            <text x="0" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="700" font-size="20" fill="currentColor">OW</text>
            <text x="44" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="400" font-size="20" fill="currentColor" opacity="0.6">Finance</text>
          </svg>
        </router-link>

        <nav class="nav-links">
          <a href="/#como-funciona" @click.prevent="scrollTo('como-funciona')">Cómo funciona</a>
          <router-link to="/funciones">Funciones</router-link>
          <a href="/#modos" @click.prevent="scrollTo('modos')">Lite &amp; Pro</a>
          <router-link to="/planes">Planes</router-link>
        </nav>

        <div class="nav-right">
          <button
            class="icon-btn"
            :aria-label="isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'"
            @click="toggleTheme"
          >
            <span class="material-icons">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </button>
          <router-link class="btn btn-quiet nav-cta-secondary" to="/login">Iniciar sesión</router-link>
          <router-link class="btn btn-primary" to="/register">Crear cuenta</router-link>
          <button class="icon-btn nav-burger" aria-label="Menú" @click="toggleMobileMenu">
            <span class="material-icons">menu</span>
          </button>
        </div>
      </div>

      <div class="wrap" :hidden="!mobileMenuOpen" style="padding-bottom: 16px">
        <nav style="display: flex; flex-direction: column; gap: 4px">
          <a class="btn btn-quiet" style="justify-content: flex-start" href="/#como-funciona" @click.prevent="scrollTo('como-funciona')">Cómo funciona</a>
          <router-link class="btn btn-quiet" style="justify-content: flex-start" to="/funciones" @click="mobileMenuOpen = false">Funciones</router-link>
          <a class="btn btn-quiet" style="justify-content: flex-start" href="/#modos" @click.prevent="scrollTo('modos')">Lite &amp; Pro</a>
          <router-link class="btn btn-quiet" style="justify-content: flex-start" to="/planes" @click="mobileMenuOpen = false">Planes</router-link>
          <router-link class="btn btn-ghost" style="margin-top: 8px" to="/login" @click="mobileMenuOpen = false">Iniciar sesión</router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-brand">
            <router-link class="nav-logo" to="/" aria-label="OW Finance">
              <svg viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg" height="26">
                <text x="0" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="700" font-size="20" fill="currentColor">OW</text>
                <text x="44" y="22" font-family="var(--font-display), system-ui, sans-serif" font-weight="400" font-size="20" fill="currentColor" opacity="0.6">Finance</text>
              </svg>
            </router-link>
            <p>Finanzas personales calmadas. Reparte, ahorra y entiende tu dinero — en Lite o en Pro.</p>
            <div class="app-downloads">
              <a href="https://appfinanzasdev.blockshift.website/downloads/owfinance-dev.apk" target="_blank" rel="noopener" aria-label="Descargar APK Dev (Beta)">
                <span class="material-icons">android</span>
                Android DEV
              </a>
              <a href="https://appfinanzas.blockshift.website/downloads/owfinance-stage.apk" target="_blank" rel="noopener" aria-label="Descargar APK Stage">
                <span class="material-icons">android</span>
                Android Stage
              </a>
            </div>
          </div>
          <div>
            <h4>Producto</h4>
            <ul>
              <li><router-link to="/funciones#cantaros">Cántaros</router-link></li>
              <li><router-link to="/funciones#suenos">Sueños</router-link></li>
              <li><router-link to="/funciones#analisis">Análisis</router-link></li>
              <li><a href="/#modos" @click.prevent="scrollTo('modos')">Lite &amp; Pro</a></li>
            </ul>
          </div>
          <div>
            <h4>Empezar</h4>
            <ul>
              <li><router-link to="/register">Crear cuenta</router-link></li>
              <li><router-link to="/login">Iniciar sesión</router-link></li>
              <li><router-link to="/planes">Planes</router-link></li>
            </ul>
          </div>
          <div>
            <h4>Recursos</h4>
            <ul>
              <li><router-link to="/funciones">Funciones</router-link></li>
              <li><router-link to="/matriz">Matriz Lite vs Pro</router-link></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 OW Finance. Todos los derechos reservados.</span>
          <span style="display: flex; gap: 18px"><a href="#">Privacidad</a><a href="#">Términos</a><a href="#">Contacto</a></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePublicTheme } from 'src/composables/usePublicTheme'

const router = useRouter()
const route = useRoute()
const { isDark, toggleTheme } = usePublicTheme()
const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

async function scrollTo(id: string) {
  mobileMenuOpen.value = false
  if (route.path !== '/') {
    await router.push({ path: '/' })
  }
  await new Promise(r => setTimeout(r, 300))
  await nextTick()
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

// Scroll reveal with IntersectionObserver
let io: IntersectionObserver | null = null

function observeReveals() {
  const targets = document.querySelectorAll('.reveal:not(.in)')
  targets.forEach((el) => io?.observe(el))
}

void nextTick().then(observeReveals)

onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          io?.unobserve(en.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  void nextTick().then(observeReveals)
})

// Re-observe reveals when navigating between public child routes
watch(
  () => route.path,
  () => {
    // Remove .in from old page elements that are leaving, then observe new ones
    void nextTick().then(observeReveals)
  }
)

onUnmounted(() => {
  io?.disconnect()
})
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.public-layout main {
  flex: 1;
}
</style>
