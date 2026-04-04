<template>
  <header class="lite-header" :class="themeClass" role="banner">
    <div class="lite-header__left">
      <button class="lite-header__avatar" @click="$emit('avatar-click')" aria-label="Perfil de usuario">
        <img v-if="user?.avatar" :src="user.avatar" :alt="user?.name || 'Usuario'" />
        <span v-else class="lite-header__initials">{{ user?.initials || 'U' }}</span>
      </button>
      <h1 class="lite-header__greeting">Hola, {{ firstName }} 👋</h1>
    </div>
    <button class="lite-header__bell" @click="$emit('menu-click')" aria-label="Notificaciones">
      <q-icon name="notifications" size="24px" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
interface User { name?: string; avatar?: string; initials?: string; }
const props = defineProps<{ user?: User; theme?: 'light' | 'dark' }>();
const firstName = computed(() => props.user?.name?.split(' ')[0] || 'Usuario');
const themeClass = computed(() => props.theme === 'dark' ? 'lite-header--dark' : 'lite-header--light');
</script>

<style scoped>
.lite-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 2rem; }
.lite-header--dark { background: #131b2e; color: #fff; }
.lite-header--light { background: #fff; color: #0b1326; }
.lite-header__avatar { border: none; background: none; margin-right: 1rem; }
.lite-header__greeting { font-size: 1.5rem; font-weight: 700; }
.lite-header__bell { border: none; background: none; }
</style>
