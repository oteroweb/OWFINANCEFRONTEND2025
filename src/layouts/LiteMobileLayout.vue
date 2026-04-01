<template>
  <q-layout view="lHh lpr lFf" class="bg-primary-dark">
    <!-- Ethereal Vault Header -->
    <LiquidHeader :balance="24850" />

    <!-- Page Container -->
    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Liquid Navigation -->
    <LiquidBottomNav>
      <template #fab>
        <LiquidFAB @click="showAddTransaction = true" />
      </template>
    </LiquidBottomNav>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LiquidHeader from 'components/liquid/LiquidHeader.vue';
import LiquidBottomNav from 'components/liquid/LiquidBottomNav.vue';
import LiquidFAB from 'components/liquid/LiquidFAB.vue';

const showAddTransaction = ref(false);
</script>

<style lang="scss" scoped>
.bg-primary-dark {
  background-color: var(--bg-app);
}

/* Smooth Router Transitions */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
