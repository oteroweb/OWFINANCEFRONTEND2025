<template>
  <q-layout view="lHh lpr lFf" class="bg-app">
    <!-- Top Summary Header (Sticky) -->
    <q-header class="bg-transparent text-strong q-py-md q-px-lg" flat>
      <div class="row items-center justify-between">
        <div class="column">
          <span class="text-caption text-muted font-medium">Balance Total</span>
          <span class="text-h5 font-bold tracking-tight text-primary">$4,250.00</span>
        </div>
        <q-btn
          round
          flat
          color="primary"
          icon="notifications_none"
          class="bg-surface-soft"
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

    <!-- Bottom Navigation Shell -->
    <q-footer class="bg-transparent q-px-md q-pb-lg" flat v-if="!$q.screen.gt.sm">
      <div class="nav-shell glass-panel row items-center justify-between q-px-sm">
        <!-- Home -->
        <q-btn
          flat
          dense
          :color="$route.path.includes('/home') ? 'primary' : 'muted'"
          icon="home"
          class="nav-item"
          to="/app/home"
        />
        
        <!-- Transactions -->
        <q-btn
          flat
          dense
          :color="$route.path.includes('/transactions') ? 'primary' : 'muted'"
          icon="receipt_long"
          class="nav-item"
          to="/app/transactions"
        />

        <!-- Action Spacer for FAB -->
        <div class="fab-placeholder"></div>

        <!-- Jars -->
        <q-btn
          flat
          dense
          :color="$route.path.includes('/jars') ? 'primary' : 'muted'"
          icon="account_balance_wallet"
          class="nav-item"
          to="/app/jars"
        />

        <!-- Config -->
        <q-btn
          flat
          dense
          :color="$route.path.includes('/config') ? 'primary' : 'muted'"
          icon="settings"
          class="nav-item"
          to="/app/config"
        />
      </div>

      <!-- Center FAB -->
      <q-page-sticky position="bottom" :offset="[0, 18]" class="fab-sticky">
        <q-btn
          fab
          icon="add"
          color="primary"
          class="main-fab shadow-8"
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
.bg-app {
  background-color: var(--bg-app);
}

.text-strong {
  color: var(--text-strong);
}

.text-muted {
  color: var(--text-muted);
}

.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }

.nav-shell {
  height: 64px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: var(--radius-pill) !important;
  display: flex;
  position: relative;
  overflow: visible;
}

.nav-item {
  flex: 1;
  height: 100%;
  border-radius: var(--radius-pill);
  font-size: 20px;
}

.fab-placeholder {
  width: 64px;
  flex-shrink: 0;
}

.fab-sticky {
  z-index: 2000;
}

.main-fab {
  width: 56px;
  height: 56px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  &:active {
    transform: scale(0.9);
  }
}

.bg-surface-soft {
  background-color: var(--surface-soft);
}

.tracking-tight {
  letter-spacing: -0.02em;
}
</style>
