<template>
  <q-layout view="hHh lpR fFf" class="bg-[#F8FAFC]">
    <!-- ─── Top Bar ─────────────────────────────────────────────── -->
    <q-header class="bg-transparent shadow-none" elevated>
      <div class="pro-topbar-wrapper relative">
        <!-- Hamburger button (mobile only, overlaid left of the topbar) -->
        <q-btn
          v-if="isMobile"
          flat
          dense
          round
          icon="menu"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-200 text-slate-700"
          @click="toggleSidebar"
        />
        <ProTopbar
          :notification-count="notificationCount"
          :user-name="userName"
          :user-email="userEmail"
          :avatar-color="avatarColor"
          :user-icon="userIcon"
          @notification-open="onNotificationOpen"
          @settings-open="onSettingsOpen"
          @user-menu="onUserMenu"
          @logout="onLogout"
          @search="onSearch"
        />
      </div>
    </q-header>

    <!-- ─── Left Drawer (sidebar) ──────────────────────────────── -->
    <!--
      ProSidebar uses `position: fixed` internally, so we embed it
      inside a QDrawer whose overlay/backdrop handles mobile dismiss.
      On desktop the drawer is always open; on mobile it overlays.
    -->
    <q-drawer
      v-model="sidebarOpen"
      :breakpoint="1024"
      :width="sidebarCollapsed ? 72 : 280"
      :overlay="isMobile"
      :mini="sidebarCollapsed"
      class="pro-drawer bg-white"
      bordered
    >
      <ProSidebar
        :user="sidebarUser"
        :main-nav="mainNav"
        :custom-sections="customSections"
        :collapsed="sidebarCollapsed"
        @nav-click="onNavClick"
        @collapse-toggle="onCollapseToggle"
        @profile-click="onProfileClick"
        @add-section="onAddSection"
        @section-delete="onSectionDelete"
        @section-reorder="onSectionReorder"
      />
    </q-drawer>

    <!-- ─── Main content ────────────────────────────────────────── -->
    <q-page-container class="bg-[#F8FAFC]">
      <router-view v-slot="{ Component }">
        <transition name="pro-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth'
import ProSidebar from 'components/ProSidebar.vue'
import ProTopbar from 'components/ProTopbar.vue'

// ─── Types ─────────────────────────────────────────────────────────────────
interface NavItem {
  id: string
  label: string
  icon: string
  route: string
}

interface CustomSection {
  id: string
  label: string
  items?: Array<{ id: string; label: string; route?: string }>
}

// ─── State ─────────────────────────────────────────────────────────────────
const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

/** Whether the sidebar drawer is open */
const sidebarOpen = ref(true)

/** Whether the sidebar is in collapsed (icon-only) mode */
const sidebarCollapsed = ref(false)

/** Whether we are on a mobile/tablet viewport (< 1024px) */
const isMobile = computed(() => $q.screen.lt.lg)

/** On mobile, sidebar starts closed */
watch(
  isMobile,
  (mobile) => {
    if (mobile) {
      sidebarOpen.value = false
    } else {
      sidebarOpen.value = true
      sidebarCollapsed.value = false
    }
  },
  { immediate: true }
)

// ─── User data (from auth store) ──────────────────────────────────────────
const userName = computed(() => authStore.user?.name || 'Usuario')
const userEmail = computed(
  () =>
    (authStore.user as { email?: string } | null)?.email ||
    'usuario@owfinance.app'
)
const avatarColor = ref<string>('primary')
const userIcon = ref<string>('person')
const notificationCount = ref<number>(0)

const sidebarUser = computed(() => ({
  name: authStore.user?.name || 'User',
  email:
    (authStore.user as { email?: string } | null)?.email ||
    'user@example.com',
  avatar:
    (authStore.user as { avatar?: string | null } | null)?.avatar || '',
}))

// ─── Navigation ────────────────────────────────────────────────────────────
const mainNav = ref<NavItem[]>([
  { id: 'home', label: 'Home', icon: 'dashboard', route: '/user/home' },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: 'receipt_long',
    route: '/user/transactions',
  },
  { id: 'jars', label: 'Jars', icon: 'savings', route: '/user/jars' },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/user/config',
  },
])

const customSections = ref<CustomSection[]>([])

// ─── Event handlers ────────────────────────────────────────────────────────

function toggleSidebar(): void {
  sidebarOpen.value = !sidebarOpen.value
}

function onCollapseToggle(): void {
  if (!isMobile.value) {
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    sidebarOpen.value = false
  }
}

function onNavClick({ route }: { route: string }): void {
  void router.push(route)
  // On mobile, close the sidebar after navigation
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

function onProfileClick(): void {
  void router.push('/user/config')
  if (isMobile.value) sidebarOpen.value = false
}

function onAddSection(): void {
  // Placeholder: open a dialog or inline form for adding a section
}

function onSectionDelete({ sectionId }: { sectionId: string }): void {
  customSections.value = customSections.value.filter(
    (s) => s.id !== sectionId
  )
}

function onSectionReorder({
  newOrder,
}: {
  newOrder: CustomSection[]
}): void {
  customSections.value = newOrder
}

// ─── Topbar handlers ───────────────────────────────────────────────────────

function onNotificationOpen(): void {
  // TODO: open notifications panel
}

function onSettingsOpen(): void {
  void router.push('/user/config')
}

function onUserMenu(action: 'profile' | 'preferences'): void {
  if (action === 'profile' || action === 'preferences') {
    void router.push('/user/config')
  }
}

function onLogout(): void {
  authStore.logout()
  void router.push('/login')
}

function onSearch({ query }: { query: string }): void {
  // TODO: wire to global search/filter store
  console.debug('[ProLayout] search:', query)
}
</script>

<style lang="scss" scoped>
/*
  The QDrawer wraps ProSidebar which positions itself with `position: fixed`.
  We make the drawer transparent so ProSidebar's own white background shows.
*/
.pro-drawer {
  background: transparent !important;
  overflow: visible !important;

  :deep(.q-drawer) {
    background: transparent !important;
    box-shadow: none !important;
    border-right: none !important;
  }
}

.pro-topbar-wrapper {
  position: relative;
  width: 100%;
}

/* Route page transition */
.pro-page-enter-active,
.pro-page-leave-active {
  transition:
    opacity 200ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 200ms cubic-bezier(0.23, 1, 0.32, 1);
}
.pro-page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.pro-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
