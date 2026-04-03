<template>
  <nav class="fixed bottom-0 left-0 right-0 h-20 pb-safe bg-white border-t border-slate-100 z-40">
    <div class="flex items-center justify-between h-full px-4">
      <!-- Left: 2 tabs -->
      <div class="flex flex-1 gap-4">
        <button
          v-for="tab in tabs.slice(0, 2)"
          :key="tab.id"
          class="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 transition group"
          :class="activeTab === tab.id ? 'text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900'"
          @click="onTabClick(tab)"
        >
          <q-icon :name="tab.icon" size="24px" />
          <span class="text-xs font-medium">{{ tab.label }}</span>
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-1 bg-[#1E3A8A] rounded-t-sm"
          />
        </button>
      </div>

      <!-- Center: FAB -->
      <button
        class="relative w-14 h-14 -mt-8 rounded-full bg-[#1E3A8A] text-white shadow-lg hover:shadow-xl transition flex items-center justify-center"
        @click="onFabClick"
        title="Agregar transacción"
      >
        <q-icon name="add_outlined" size="28px" />
      </button>

      <!-- Right: 2 tabs -->
      <div class="flex flex-1 gap-4">
        <button
          v-for="tab in tabs.slice(2)"
          :key="tab.id"
          class="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 transition group"
          :class="activeTab === tab.id ? 'text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900'"
          @click="onTabClick(tab)"
        >
          <q-icon :name="tab.icon" size="24px" />
          <span class="text-xs font-medium">{{ tab.label }}</span>
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-1 bg-[#1E3A8A] rounded-t-sm"
          />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

type TabId = 'home' | 'transactions' | 'jars' | 'settings'

interface TabItem {
  id: TabId
  label: string
  icon: string
  route: string
}

interface LiquidBottomNavProps {
  /** Currently active tab ID */
  activeTab?: TabId
  /** Show/hide the entire bottom nav */
  modelValue?: boolean
  /** Tab configuration (can be extended) */
  tabs?: TabItem[]
}

const props = withDefaults(defineProps<LiquidBottomNavProps>(), {
  activeTab: 'home',
  modelValue: true,
})

const emit = defineEmits<{
  'fab-click': []
  'tab-change': [tabId: TabId]
  'update:modelValue': [visible: boolean]
}>()

const router = useRouter()
const route = useRoute()

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: 'home_outlined', route: '/app/home' },
  { id: 'transactions', label: 'Transacciones', icon: 'receipt_outlined', route: '/app/transactions' },
  { id: 'jars', label: 'Jarras', icon: 'savings_outlined', route: '/app/jars' },
  { id: 'settings', label: 'Config', icon: 'settings_outlined', route: '/app/config' },
]

const activeTab = ref<TabId>(props.activeTab || 'home')

/**
 * Computed activeTab synchronized with route
 */
const activeTabComputed = computed((): TabId => {
  const path = route.path
  if (path.includes('/transactions')) return 'transactions'
  if (path.includes('/jars')) return 'jars'
  if (path.includes('/config') || path.includes('/settings')) return 'settings'
  return 'home'
})

/**
 * Handle tab click - navigate and emit event
 */
function onTabClick(tab: TabItem) {
  activeTab.value = tab.id
  router.push(tab.route).catch(() => {})
  emit('tab-change', tab.id)
}

/**
 * Handle FAB click
 */
function onFabClick() {
  emit('fab-click')
}

/**
 * Synchronize active tab with route on mount
 */
function syncActiveTabWithRoute() {
  activeTab.value = activeTabComputed.value
}

/**
 * Watch route changes
 */
watch(
  () => route.path,
  () => {
    syncActiveTabWithRoute()
  }
)

onMounted(() => {
  syncActiveTabWithRoute()
})
</script>

<style lang="scss" scoped>
nav {
  @apply pb-safe;
}
</style>
