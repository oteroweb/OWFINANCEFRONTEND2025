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
.glass-nav-wrapper {
  z-index: 2000;
  pointer-events: none;
}

.liquid-bottom-nav {
  pointer-events: auto;
  width: 90%;
  max-width: 400px;
  height: 80px;
  border-radius: 40px;
  background: rgba(18, 24, 38, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  position: relative;
}

.nav-item {
  position: relative;
  width: 48px;
  height: 48px;
  color: var(--text-soft);
  transition: all 0.3s ease;

  &.is-active {
    color: var(--primary-cyan);
  }
}

.active-indicator {
  position: absolute;
  bottom: -6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary-cyan);
  box-shadow: 0 0 10px var(--primary-cyan);
}

.fab-container {
  position: absolute;
  left: 50%;
  top: -24px;
  transform: translateX(-50%);
}
</style>
