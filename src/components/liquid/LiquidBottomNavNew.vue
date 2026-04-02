<template>
  <q-footer class="bg-transparent overflow-visible" style="border: none;">
    <div class="nav-shell">
      <!-- Left items -->
      <button
        v-for="item in leftItems"
        :key="item.id"
        class="nav-item"
        :class="isActive(item.to) ? 'nav-item--active' : 'nav-item--inactive'"
        @click="navigateTo(item.to)"
      >
        <q-icon :name="isActive(item.to) ? item.iconActive : item.icon" size="24px" />
        <span class="nav-label">{{ item.label }}</span>
      </button>

      <!-- FAB Center -->
      <div class="fab-wrapper">
        <button class="fab-btn" @click="$emit('fabClick')">
          <q-icon name="add" size="32px" color="white" />
        </button>
      </div>

      <!-- Right items -->
      <button
        v-for="item in rightItems"
        :key="item.id"
        class="nav-item"
        :class="isActive(item.to) ? 'nav-item--active' : 'nav-item--inactive'"
        @click="navigateTo(item.to)"
      >
        <q-icon :name="isActive(item.to) ? item.iconActive : item.icon" size="24px" />
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

defineEmits(['fabClick'])

const route = useRoute()
const router = useRouter()

const leftItems = [
  {
    id: 'home',
    label: 'Inicio',
    icon: 'home',
    iconActive: 'home',
    to: '/app/home'
  },
  {
    id: 'transactions',
    label: 'Movim.',
    icon: 'receipt_long',
    iconActive: 'receipt_long',
    to: '/app/transactions'
  }
]

const rightItems = [
  {
    id: 'jars',
    label: 'Jars',
    icon: 'savings',
    iconActive: 'savings',
    to: '/app/jars'
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: 'person_outline',
    iconActive: 'person',
    to: '/app/config'
  }
]

const isActive = (path: string) => route.path.startsWith(path)

const navigateTo = (path: string) => {
  router.push(path).catch(() => {})
}
</script>

<style scoped>
.nav-shell {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  border-top: 1px solid #E2E8F0;
  border-radius: 40px 40px 0 0;
  box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.07);
  padding: 8px 16px 28px;
  height: 96px;
  position: relative;
  overflow: visible;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 9999px;
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
  background: transparent;
}

.nav-item:active {
  transform: scale(0.97);
}

.nav-item--inactive {
  color: #64748B;
}

.nav-item--inactive:hover {
  color: #1E3A8A;
}

.nav-item--active {
  background-color: #DBEAFE;
  color: #1E3A8A;
}

.nav-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

/* FAB */
.fab-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-32px);
  position: relative;
  z-index: 10;
}

.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #1E3A8A;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(30, 58, 138, 0.35);
  transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.fab-btn:hover {
  background-color: #1D4ED8;
}

.fab-btn:active {
  transform: scale(0.97);
}
</style>
