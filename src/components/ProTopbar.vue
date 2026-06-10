<template>
  <header class="pro-topbar sticky top-0 h-18 bg-white border-b border-slate-200 flex items-center px-6 z-100">
    <!-- Logo (Left) -->
    <div class="flex items-center gap-2 shrink-0">
      <div class="w-10 h-10 flex items-center justify-center rounded-md bg-blue-900 bg-opacity-10">
        <span class="text-lg font-bold text-[#1E3A8A]">OW</span>
      </div>
      <span class="text-xl font-bold text-[#1E3A8A] hidden sm:inline">OWFinance</span>
    </div>

    <!-- Search Bar (Center - flex-grow) -->
    <div class="flex-1 mx-4 sm:mx-6">
      <div class="relative">
        <q-icon name="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <q-input
          v-model="searchQuery"
          outlined
          dense
          placeholder="Buscar transacciones..."
          class="pl-10 search-input"
          @update:model-value="onSearchInput"
          @focus="showSearchResults = true"
          @blur="scheduleHideResults"
        />
        <!-- Search Results Dropdown -->
        <div
          v-if="showSearchResults && searchQuery.length > 0"
          class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          <div v-if="searchResults.length > 0" class="divide-y divide-slate-100">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              @click="selectSearchResult(result)"
            >
              <div class="text-sm font-medium text-slate-900">{{ result.label }}</div>
              <div class="text-xs text-slate-500">{{ result.type }}</div>
            </div>
          </div>
          <div v-else class="px-4 py-8 text-center text-sm text-slate-500">
            No se encontraron resultados
          </div>
        </div>
      </div>
    </div>

    <!-- Right Icons Section -->
    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
      <!-- Notifications -->
      <div class="relative">
        <q-btn
          flat
          dense
          round
          icon="notifications_none"
          size="md"
          class="text-slate-600 hover:text-slate-900"
          @click="handleNotificationClick"
        />
        <span
          v-if="(notificationCount ?? 0) > 0"
          class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
        >
          {{ (notificationCount ?? 0) > 9 ? '9+' : (notificationCount ?? 0) }}
        </span>
      </div>

      <!-- Settings -->
      <q-btn
        flat
        dense
        round
        icon="settings"
        size="md"
        class="text-slate-600 hover:text-slate-900"
        @click="handleSettingsClick"
      />

      <!-- User Menu (Right) -->
      <q-menu ref="userMenuRef" anchor="bottom right" self="top right" transition-show="scale" transition-hide="scale">
        <template #default>
          <q-card style="min-width: 200px">
            <q-card-section class="row items-center q-pb-none">
              <q-avatar
                size="48px"
                :color="avatarColor"
                text-color="white"
                :icon="userIcon"
                font-size="24px"
              />
              <div class="column q-ml-md">
                <div class="text-weight-bold">{{ userName }}</div>
                <div class="text-caption text-grey">{{ userEmail }}</div>
              </div>
              <q-space />
              <q-btn icon="close" flat dense round size="sm" @click="userMenuRef?.hide()" />
            </q-card-section>

            <q-separator class="q-my-sm" />

            <q-card-section class="q-pa-none">
              <q-item clickable v-ripple @click="handleUserMenuAction('profile')">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Perfil</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="handleUserMenuAction('preferences')">
                <q-item-section avatar>
                  <q-icon name="tune" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Preferencias</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="q-my-sm" />

              <q-item clickable v-ripple @click="handleUserMenuAction('logout')">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-negative">Cerrar sesión</q-item-label>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </template>
      </q-menu>

      <!-- User Avatar Trigger -->
      <q-btn
        flat
        dense
        round
        class="user-avatar-btn"
        @click.stop
      >
        <q-avatar
          size="36px"
          :color="avatarColor"
          text-color="white"
          :icon="userIcon"
          font-size="18px"
        />
      </q-btn>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

/**
 * Props interface for ProTopbar component
 */
interface Props {
  /** Number of unread notifications */
  notificationCount?: number
  /** User's display name */
  userName?: string
  /** User's email address */
  userEmail?: string
  /** User avatar color (Quasar color name) */
  avatarColor?: string
  /** User avatar icon (Quasar icon name) */
  userIcon?: string
  /** Search debounce delay in milliseconds */
  searchDebounce?: number
}

/**
 * Search result interface
 */
interface SearchResult {
  id: string
  label: string
  type: string
}

/**
 * Component props with defaults
 */
const props = withDefaults(defineProps<Props>(), {
  notificationCount: 0,
  userName: 'Usuario',
  userEmail: 'usuario@owfinance.app',
  avatarColor: 'primary',
  userIcon: 'person',
  searchDebounce: 500,
})

/**
 * Component emits
 */
const emit = defineEmits<{
  search: [payload: { query: string }]
  notificationOpen: []
  settingsOpen: []
  userMenu: [action: 'profile' | 'preferences']
  logout: []
  menuClose: []
}>()

const userMenuRef = ref<{ hide: () => void } | null>(null)
const searchQuery = ref<string>('')
const showSearchResults = ref<boolean>(false)
const searchResults = ref<SearchResult[]>([])
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let hideResultsTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Mock search results - replace with actual API call
 */
function mockSearchResults(query: string): SearchResult[] {
  if (!query || query.length < 2) return []

  const mockData: SearchResult[] = [
    { id: '1', label: 'Compra de groceries', type: 'Transacción' },
    { id: '2', label: 'Pago de servicios', type: 'Transacción' },
    { id: '3', label: 'Salary deposit', type: 'Transferencia' },
    { id: '4', label: 'Investment transfer', type: 'Movimiento' },
  ]

  return mockData.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * Handle search input with debouncing
 */
function onSearchInput(value: string | number | null): void {
  const str = typeof value === 'string' ? value : String(value ?? '');
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    const trimmed = str.trim()
    searchResults.value = mockSearchResults(trimmed)
    emit('search', { query: trimmed })
  }, props.searchDebounce)
}

/**
 * Handle search result selection
 */
function selectSearchResult(result: SearchResult): void {
  searchQuery.value = result.label
  showSearchResults.value = false
  emit('search', { query: result.label })
}

/**
 * Schedule hiding search results with slight delay
 */
function scheduleHideResults(): void {
  hideResultsTimer = setTimeout(() => {
    showSearchResults.value = false
  }, 100)
}

/**
 * Handle notification bell click
 */
function handleNotificationClick(): void {
  emit('notificationOpen')
}

/**
 * Handle settings icon click
 */
function handleSettingsClick(): void {
  emit('settingsOpen')
}

/**
 * Handle user menu actions
 */
function handleUserMenuAction(
  action: 'profile' | 'preferences' | 'logout'
): void {
  userMenuRef.value?.hide()

  if (action === 'logout') {
    emit('logout')
  } else {
    emit('userMenu', action)
  }
}

/**
 * Cleanup timers on component unmount
 */
onUnmounted(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (hideResultsTimer) clearTimeout(hideResultsTimer)
})
</script>

<style lang="scss" scoped>
.pro-topbar {
  z-index: 100;

  .search-input {
    :deep(.q-field__control) {
      padding-left: 0;
    }
  }

  .user-avatar-btn {
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}

@media (max-width: 640px) {
  .pro-topbar {
    height: 4rem;
    padding: 0.75rem;

    .pro-topbar__logo-text {
      display: none;
    }
  }
}
</style>
