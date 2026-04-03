<template>
  <nav class="lite-nav">
    <div class="lite-nav__pill">
      <!-- Inicio -->
      <button
        class="lite-nav__tab"
        :class="{ 'lite-nav__tab--active': currentTab === 'home' }"
        @click="tabs[0] && onTabClick(tabs[0])"
      >
        <q-icon :name="currentTab === 'home' ? 'home' : 'o_home'" size="22px" />
        <span>Inicio</span>
      </button>

      <!-- Transacciones -->
      <button
        class="lite-nav__tab"
        :class="{ 'lite-nav__tab--active': currentTab === 'transactions' }"
        @click="tabs[1] && onTabClick(tabs[1])"
      >
        <q-icon :name="currentTab === 'transactions' ? 'receipt_long' : 'o_receipt_long'" size="22px" />
        <span>Trans</span>
      </button>

      <!-- Center FAB -->
      <div class="lite-nav__center">
        <div class="lite-nav__ai-icon">
          <q-icon name="psychology" size="18px" />
        </div>
        <button class="lite-nav__fab" @click="onFabClick" aria-label="Agregar">
          <q-icon name="add" size="26px" />
        </button>
      </div>

      <!-- Cántaros -->
      <button
        class="lite-nav__tab"
        :class="{ 'lite-nav__tab--active': currentTab === 'jars' }"
        @click="tabs[2] && onTabClick(tabs[2])"
      >
        <q-icon :name="currentTab === 'jars' ? 'savings' : 'o_savings'" size="22px" />
        <span>Cántaros</span>
      </button>

      <!-- Ajustes -->
      <button
        class="lite-nav__tab"
        :class="{ 'lite-nav__tab--active': currentTab === 'settings' }"
        @click="tabs[3] && onTabClick(tabs[3])"
      >
        <q-icon :name="currentTab === 'settings' ? 'settings' : 'o_settings'" size="22px" />
        <span>Ajustes</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

type TabId = 'home' | 'transactions' | 'jars' | 'settings';

interface TabItem {
  id: TabId;
  route: string;
}

interface LiquidBottomNavProps {
  activeTab?: TabId;
  modelValue?: boolean;
}

withDefaults(defineProps<LiquidBottomNavProps>(), {
  activeTab: 'home',
  modelValue: true,
});

const emit = defineEmits<{
  'fab-click': [];
  'tab-change': [tabId: TabId];
  'update:modelValue': [visible: boolean];
}>();

const router = useRouter();
const route = useRoute();

const tabs: TabItem[] = [
  { id: 'home', route: '/app/home' },
  { id: 'transactions', route: '/app/transactions' },
  { id: 'jars', route: '/app/jars' },
  { id: 'settings', route: '/app/config' },
];

const currentTab = computed((): TabId => {
  const path = route.path;
  if (path.includes('/transactions')) return 'transactions';
  if (path.includes('/jars')) return 'jars';
  if (path.includes('/config') || path.includes('/settings')) return 'settings';
  return 'home';
});

function onTabClick(tab: TabItem) {
  void router.push(tab.route).catch(() => {});
  emit('tab-change', tab.id);
}

function onFabClick() {
  emit('fab-click');
}

watch(() => route.path, () => { /* reactive via computed */ });
onMounted(() => { /* reactive via computed */ });
</script>

<style lang="scss" scoped>
.lite-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  padding: 0 24px 20px;

  &__pill {
    width: 100%;
    max-width: 480px;
    height: 80px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 3rem;
    box-shadow: 0 -8px 32px rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 16px;
    position: relative;
  }

  &__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: color 150ms ease-out;
    padding: 0;
    font-family: 'Outfit', sans-serif;

    &--active { color: #0ea5e9; }

    span {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  }

  &__center {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    top: -32px;
  }

  &__ai-icon {
    margin-bottom: 4px;
    color: #0ea5e9;
    animation: ai-pulse 2.5s ease-in-out infinite;
    line-height: 1;
  }

  &__fab {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9 0%, #006591 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.4);
    transition: transform 160ms ease-out, box-shadow 160ms ease-out;

    &:active {
      transform: scale(0.91);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }
  }
}

@keyframes ai-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.88); }
}
</style>
