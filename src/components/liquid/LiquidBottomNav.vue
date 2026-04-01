<template>
  <q-footer class="bg-transparent q-px-lg q-pb-xl" flat v-if="!$q.screen.gt.sm">
    <div class="nav-shell liquid-panel row items-center justify-between q-px-md">
      <template v-for="item in navItems" :key="item.to">
        <q-btn
          flat
          dense
          :class="{ 'active-nav': $route.path.includes(item.to) }"
          :icon="item.icon"
          class="nav-item"
          :to="item.to"
        />
        <!-- Spacer for FAB in the middle -->
        <div v-if="item.spacer" class="fab-placeholder"></div>
      </template>
    </div>

    <!-- Center Floating Action Button Slot -->
    <slot name="fab"></slot>
  </q-footer>
</template>

<script setup lang="ts">
const navItems = [
  { icon: 'solar:home-2-bold-duotone', to: '/app/home' },
  { icon: 'solar:bill-list-bold-duotone', to: '/app/transactions', spacer: true },
  { icon: 'solar:jar-bold-duotone', to: '/app/jars' },
  { icon: 'solar:settings-bold-duotone', to: '/app/config' }
];
</script>

<style lang="scss" scoped>
.liquid-panel {
  background: var(--glass-bg) !important;
  backdrop-filter: var(--glass-blur) !important;
  -webkit-backdrop-filter: var(--glass-blur) !important;
  border: none !important;
  border-radius: 24px !important;
  box-shadow: var(--glass-shadow) !important;
}

.nav-shell {
  height: 72px;
  width: 100%;
  max-width: 440px;
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
