<template>
  <q-layout view="lHh lpr lFf" class="bg-primary-dark">
    <!-- Ethereal Vault Header (Sticky) -->
    <q-header class="bg-transparent q-py-lg q-px-xl" flat>
      <div class="row items-center justify-between">
        <div class="column">
          <span class="text-overline text-soft tracking-widest uppercase">Ethereal Vault</span>
          <div class="row items-baseline q-gutter-x-xs">
            <span class="text-h4 text-editorial text-pure">$24,850</span>
            <span class="text-h6 text-editorial text-primary-cyan opacity-80">.00</span>
          </div>
        </div>
        <q-btn
          round
          flat
          icon="notifications_none"
          class="liquid-btn-soft text-primary-cyan"
        />
      </div>
    </q-header>

    <!-- Page Container -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Liquid Navigation Shell -->
    <q-footer class="bg-transparent q-px-lg q-pb-xl" flat v-if="!$q.screen.gt.sm">
      <div class="nav-shell liquid-panel row items-center justify-between q-px-md">
        <!-- Home -->
        <q-btn
          flat
          dense
          :class="{ 'active-nav': $route.path.includes('/home') }"
          icon="solar:home-2-bold-duotone"
          class="nav-item"
          to="/app/home"
        />
        
        <!-- Transactions -->
        <q-btn
          flat
          dense
          :class="{ 'active-nav': $route.path.includes('/transactions') }"
          icon="solar:bill-list-bold-duotone"
          class="nav-item"
          to="/app/transactions"
        />

        <!-- Action Spacer for FAB -->
        <div class="fab-placeholder"></div>

        <!-- Jars -->
        <q-btn
          flat
          dense
          :class="{ 'active-nav': $route.path.includes('/jars') }"
          icon="solar:jar-bold-duotone"
          class="nav-item"
          to="/app/jars"
        />

        <!-- Config -->
        <q-btn
          flat
          dense
          :class="{ 'active-nav': $route.path.includes('/config') }"
          icon="solar:settings-bold-duotone"
          class="nav-item"
          to="/app/config"
        />
      </div>

      <!-- Center FAB: Liquid Core -->
      <q-page-sticky position="bottom" :offset="[0, 24]" class="fab-sticky">
        <q-btn
          fab
          icon="add"
          class="liquid-fab"
          @click="showAddTransaction = true"
        />
      </q-page-sticky>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showAddTransaction = ref(false);
</script>

<style lang="scss" scoped>
.bg-primary-dark {
  background-color: var(--bg-app);
}

.text-pure { color: var(--text-pure); }
.text-soft { color: var(--text-soft); }
.text-primary-cyan { color: var(--primary-cyan); }

.liquid-btn-soft {
  background: rgba(137, 206, 255, 0.1);
  width: 44px;
  height: 44px;
}

.opacity-80 { opacity: 0.8; }

.nav-shell {
  height: 72px;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  border-radius: 24px !important;
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

.fab-sticky {
  z-index: 2000;
}

.liquid-fab {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #89ceff 0%, #7c4dff 100%) !important;
  color: white !important;
  box-shadow: 0 12px 24px rgba(124, 77, 255, 0.4) !important;
  border: none !important;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  
  &:active {
    transform: scale(0.85) rotate(90deg);
  }
}

.tracking-widest {
  letter-spacing: 0.15em;
}
</style>
