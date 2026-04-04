<template>
  <nav class="lite-nav" :class="themeClass">
    <div class="lite-nav__pill">
      <button class="lite-nav__tab" :class="{ 'lite-nav__tab--active': currentTab === 'home' }" @click="$emit('tab', 'home')">
        <q-icon :name="currentTab === 'home' ? 'home' : 'o_home'" size="22px" />
        <span>Inicio</span>
      </button>
      <button class="lite-nav__tab" :class="{ 'lite-nav__tab--active': currentTab === 'transactions' }" @click="$emit('tab', 'transactions')">
        <q-icon :name="currentTab === 'transactions' ? 'receipt_long' : 'o_receipt_long'" size="22px" />
        <span>Trans</span>
      </button>
      <div class="lite-nav__center">
        <div class="lite-nav__ai-icon">
          <q-icon name="psychology" size="18px" />
        </div>
        <button class="lite-nav__fab" @click="$emit('fab')" aria-label="Agregar">
          <q-icon name="add" size="26px" />
        </button>
      </div>
      <button class="lite-nav__tab" :class="{ 'lite-nav__tab--active': currentTab === 'jars' }" @click="$emit('tab', 'jars')">
        <q-icon :name="currentTab === 'jars' ? 'savings' : 'o_savings'" size="22px" />
        <span>Cántaros</span>
      </button>
      <button class="lite-nav__tab" :class="{ 'lite-nav__tab--active': currentTab === 'settings' }" @click="$emit('tab', 'settings')">
        <q-icon :name="currentTab === 'settings' ? 'settings' : 'o_settings'" size="22px" />
        <span>Ajustes</span>
      </button>
    </div>
  </nav>
</template>


<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ currentTab: string; theme?: 'light' | 'dark' }>();
const themeClass = computed(() => props.theme === 'dark' ? 'lite-nav--dark' : 'lite-nav--light');
</script>

<style scoped>
.lite-nav { display: flex; justify-content: center; align-items: center; padding: 0.5rem 0; }
.lite-nav--dark { background: #171f33; color: #fff; }
.lite-nav--light { background: #fff; color: #0b1326; }
.lite-nav__pill { display: flex; border-radius: 2rem; background: inherit; }
.lite-nav__tab { border: none; background: none; padding: 0.5rem 1rem; font-size: 1rem; display: flex; flex-direction: column; align-items: center; }
.lite-nav__tab--active { font-weight: 700; }
.lite-nav__center { display: flex; flex-direction: column; align-items: center; margin: 0 1rem; }
.lite-nav__fab { border-radius: 50%; background: #0ea5e9; color: #fff; border: none; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(14,165,233,0.2); }
</style>
