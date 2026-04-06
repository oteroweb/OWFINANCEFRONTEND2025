<template>
  <div class="lite-desktop-layout">
    <!-- Header -->
    <LiquidHeader
      :user="user"
      @avatar-click="onAvatarClick"
      @ai-click="onAiClick"
      @menu-click="onMenuClick"
      @theme-toggle="onThemeToggle"
    />
    
    <!-- Main Content Area -->
    <main class="lite-desktop-main">
      <router-view />
    </main>
    
    <!-- Bottom Navigation (Desktop Adapted) -->
    <LiquidBottomNavNew
      :active-tab="currentTab"
      @fab-click="onQuickActionToggle"
      @tab-change="onTabChange"
    />
    
    <!-- Quick Action Sheet -->
    <QuickActionSheet
      v-model="showQuickActions"
      @action-selected="onActionSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import LiquidHeader from 'components/liquid/LiquidHeader.vue';
import LiquidBottomNavNew from 'components/liquid/LiquidBottomNavNew.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const showQuickActions = ref(false);

const user = computed(() => ({
  name: auth.user?.name,
  avatar: auth.user?.avatar,
  initials: auth.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()
}));

const currentTab = computed(() => {
  const path = route.path;
  if (path.includes('/transactions')) return 'transactions';
  if (path.includes('/jars')) return 'jars'; 
  if (path.includes('/config') || path.includes('/settings')) return 'settings';
  return 'home';
});

const onAvatarClick = () => {
  void router.push('/user/config');
};

const onAiClick = () => {
  // TODO: Crear ruta /user/ai-coach en routes.ts
  void router.push('/user/home');
};

const onMenuClick = () => {
  // TODO: Crear ruta /user/notifications en routes.ts
  void router.push('/user/home');
};

const onThemeToggle = () => {
  // Theme toggle is handled by the header component
  console.log('Theme toggled');
};

const onQuickActionToggle = () => {
  showQuickActions.value = !showQuickActions.value;
};

const onTabChange = (tabId: string) => {
  console.log('Tab changed:', tabId);
  // Navigation is handled by the bottom nav component
};

const onActionSelected = (action: { type: string }) => {
  console.log('Action selected:', action.type);
  // Action handling is handled by the QuickActionSheet component
};
</script>

<style scoped lang="scss">
.lite-desktop-layout {
  min-height: 100vh;
  background: var(--q-color-background, #f7f9fb);
  display: flex;
  flex-direction: column;
}

.lite-desktop-main {
  flex: 1;
  padding-top: 64px; // Header height
  padding-bottom: 120px; // Bottom nav height + padding
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding-left: 24px;
  padding-right: 24px;
  
  @media (min-width: 768px) {
    padding-left: 48px;
    padding-right: 48px;
  }
  
  @media (min-width: 1024px) {
    padding-left: 64px;
    padding-right: 64px;
  }
}

/* Dark mode support */
.body--dark .lite-desktop-layout {
  background: var(--q-color-dark, #1a1a1a);
}
</style>