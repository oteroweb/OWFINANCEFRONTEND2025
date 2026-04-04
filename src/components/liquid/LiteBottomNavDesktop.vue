<template>
  <nav class="lite-nav-desktop" :class="themeClass">
    <div class="lite-nav-desktop__container">
      <button class="lite-nav-desktop__tab" :class="{ 'lite-nav-desktop__tab--active': currentTab === 'home' }" @click="$emit('tab', 'home')">
        <q-icon :name="currentTab === 'home' ? 'home' : 'o_home'" size="24px" />
        <span>Inicio</span>
      </button>
      <button class="lite-nav-desktop__tab" :class="{ 'lite-nav-desktop__tab--active': currentTab === 'transactions' }" @click="$emit('tab', 'transactions')">
        <q-icon :name="currentTab === 'transactions' ? 'receipt_long' : 'o_receipt_long'" size="24px" />
        <span>Transacciones</span>
      </button>
      <button class="lite-nav-desktop__tab" :class="{ 'lite-nav-desktop__tab--active': currentTab === 'jars' }" @click="$emit('tab', 'jars')">
        <q-icon :name="currentTab === 'jars' ? 'savings' : 'o_savings'" size="24px" />
        <span>Cántaros</span>
      </button>
      <button class="lite-nav-desktop__tab" :class="{ 'lite-nav-desktop__tab--active': currentTab === 'settings' }" @click="$emit('tab', 'settings')">
        <q-icon :name="currentTab === 'settings' ? 'settings' : 'o_settings'" size="24px" />
        <span>Ajustes</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{ currentTab: string; theme?: 'light' | 'dark' }>();
const themeClass = computed(() => props.theme === 'dark' ? 'lite-nav-desktop--dark' : 'lite-nav-desktop--light');
</script>

<style scoped>
.lite-nav-desktop { display: flex; justify-content: center; align-items: center; padding: 1rem 0; }
.lite-nav-desktop--dark { background: #171f33; color: #fff; }
.lite-nav-desktop--light { background: #fff; color: #0b1326; }
.lite-nav-desktop__container { display: flex; border-radius: 2.5rem; background: inherit; }
.lite-nav-desktop__tab { border: none; background: none; padding: 0.75rem 2rem; font-size: 1.1rem; display: flex; flex-direction: column; align-items: center; }
.lite-nav-desktop__tab--active { font-weight: 700; border-bottom: 2px solid #0ea5e9; }
</style>
