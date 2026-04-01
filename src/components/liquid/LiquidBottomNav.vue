<template>
  <q-footer class="bg-transparent" flat>
    <div class="glass-nav-wrapper row justify-center q-pb-md">
      <nav class="liquid-bottom-nav row items-center justify-between q-px-md">
        
        <div 
          v-for="item in leftItems" 
          :key="item.id" 
          class="nav-item column items-center justify-center cursor-pointer"
          :class="{ 'is-active': isActive(item.to) }"
          @click="navigateTo(item.to)"
        >
          <q-icon :name="isActive(item.to) ? item.iconActive : item.icon" size="24px" />
          <div v-if="isActive(item.to)" class="active-indicator"></div>
        </div>

        <!-- Stitch Center FAB -->
        <div class="fab-container flex flex-center">
          <button class="stitch-fab" @click="$emit('fabClick')">
            <q-icon name="solar:scanner-linear" size="24px" />
          </button>
        </div>

        <div 
          v-for="item in rightItems" 
          :key="item.id" 
          class="nav-item column items-center justify-center cursor-pointer"
          :class="{ 'is-active': isActive(item.to) }"
          @click="navigateTo(item.to)"
        >
          <q-icon :name="isActive(item.to) ? item.iconActive : item.icon" size="24px" />
          <div v-if="isActive(item.to)" class="active-indicator"></div>
        </div>

      </nav>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

defineEmits(['fabClick']);

const leftItems = [
  { id: 'home', icon: 'solar:home-2-linear', iconActive: 'solar:home-2-bold-duotone', to: '/app/home' },
  { id: 'history', icon: 'solar:history-linear', iconActive: 'solar:history-bold-duotone', to: '/app/transactions' }
];

const rightItems = [
  { id: 'cards', icon: 'solar:card-line-duotone', iconActive: 'solar:card-bold-duotone', to: '/app/accounts' },
  { id: 'profile', icon: 'solar:user-linear', iconActive: 'solar:user-bold-duotone', to: '/app/config' }
];

const isActive = (path: string) => {
  return route.path.includes(path);
};

const navigateTo = (path: string) => {
  router.push(path).catch(() => {});
};
</script>

<style lang="scss" scoped>
.glass-nav-wrapper {
  z-index: 2000;
  width: 100%;
}

.liquid-bottom-nav {
  pointer-events: auto;
  width: 92%;
  max-width: 400px;
  height: 72px;
  border-radius: 36px;
  background: rgba(18, 24, 38, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
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
  bottom: 0px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary-cyan);
  box-shadow: 0 0 10px var(--primary-cyan);
}

.fab-container {
  width: 64px;
  height: 64px;
  margin-top: -32px; /* Elevates the FAB above the nav bar */
  z-index: 10;
}

.stitch-fab {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--primary-cyan);
  color: #0b1326;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(14, 165, 233, 0.3);
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &:active {
    transform: scale(0.9);
  }
}
</style>
