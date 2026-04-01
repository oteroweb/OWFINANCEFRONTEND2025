<template>
  <div class="glass-nav-wrapper fixed-bottom row justify-center q-pb-lg">
    <nav class="liquid-bottom-nav row items-center justify-between q-px-xl">
      <!-- Nav Items -->
      <div v-for="item in navItems" :key="item.id" 
           class="nav-item column items-center justify-center cursor-pointer"
           :class="{ 'is-active': activeTab === item.id }"
           @click="activeTab = item.id">
        <q-icon :name="activeTab === item.id ? item.iconActive : item.icon" size="24px" />
        <div v-if="activeTab === item.id" class="active-indicator"></div>
      </div>

      <!-- Centered FAB Slot (Overlay) -->
      <div class="fab-container flex flex-center">
        <slot name="fab"></slot>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('home');

const navItems = [
  { id: 'home', icon: 'solar:home-2-linear', iconActive: 'solar:home-2-bold-duotone' },
  { id: 'activity', icon: 'solar:history-linear', iconActive: 'solar:history-bold-duotone' },
  { id: 'placeholder', icon: '', iconActive: '' }, // Central gap for FAB
  { id: 'accounts', icon: 'solar:card-line-duotone', iconActive: 'solar:card-bold-duotone' },
  { id: 'settings', icon: 'solar:settings-linear', iconActive: 'solar:settings-bold-duotone' }
];
</script>

<style lang="scss" scoped>
  margin: 0 auto;
  display: flex;
  position: relative;
  overflow: visible;
}

.nav-item {
  flex: 1;
  height: 100%;
  border-radius: 20px;
  font-size: 26px;
  color: var(--text-soft);
  transition: all 0.3s ease;

  &.active-nav {
    color: var(--primary-cyan);
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px rgba(137, 206, 255, 0.4));
  }
}

.fab-placeholder {
  width: 72px;
  flex-shrink: 0;
}
</style>
