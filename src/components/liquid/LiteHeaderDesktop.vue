<template>
  <header class="lite-header-desktop" :class="themeClass" role="banner">
    <div class="lite-header-desktop__left">
      <button class="lite-header-desktop__avatar" @click="$emit('avatar-click')" aria-label="Perfil de usuario">
        <img v-if="user?.avatar" :src="user.avatar" :alt="user?.name || 'Usuario'" />
        <span v-else class="lite-header-desktop__initials">{{ user?.initials || 'U' }}</span>
      </button>
      <h1 class="lite-header-desktop__greeting">Bienvenido, {{ firstName }} 👋</h1>
    </div>
    <div class="lite-header-desktop__right">
      <button class="lite-header-desktop__bell" @click="$emit('menu-click')" aria-label="Notificaciones">
        <q-icon name="notifications" size="24px" />
      </button>
      <button class="lite-header-desktop__settings" @click="$emit('settings-click')" aria-label="Configuración">
        <q-icon name="settings" size="24px" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
interface User { name?: string; avatar?: string; initials?: string; }
const props = defineProps<{ user?: User; theme?: 'light' | 'dark' }>();
const firstName = computed(() => props.user?.name?.split(' ')[0] || 'Usuario');
const themeClass = computed(() => props.theme === 'dark' ? 'lite-header-desktop--dark' : 'lite-header-desktop--light');
</script>

<style scoped>
.lite-header-desktop { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-radius: 2.5rem; }
.lite-header-desktop--dark { background: #131b2e; color: #fff; }
.lite-header-desktop--light { background: #fff; color: #0b1326; }
.lite-header-desktop__avatar { border: none; background: none; margin-right: 1.5rem; }
.lite-header-desktop__greeting { font-size: 2rem; font-weight: 700; }
.lite-header-desktop__bell, .lite-header-desktop__settings { border: none; background: none; margin-left: 1rem; }
</style>
