<template>
  <q-layout view="lHh lpr lFf" class="lite-desktop-layout">

    <!-- Desktop Header (Quasar-managed, auto-offsets q-page) -->
    <q-header flat bordered class="dte-layout-header">
      <LiteHeaderDesktop
        :user="user"
        @nuevo-click="showQuickActions = true"
        @avatar-click="onAvatarClick"
        @notifications-click="onMenuClick"
      />
    </q-header>

    <!-- Main Content Area -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Floating Bottom Nav -->
    <LiteFloatingBottomNav @fab-click="showQuickActions = true" />

    <!-- Quick Action Sheet -->
    <QuickActionSheet
      v-model="showQuickActions"
      @action-selected="onActionSelected"
    />

  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import LiteHeaderDesktop from 'components/liquid/LiteHeaderDesktop.vue';
import LiteFloatingBottomNav from 'components/liquid/LiteFloatingBottomNav.vue';
import QuickActionSheet from 'components/liquid/QuickActionSheet.vue';

const router = useRouter();
const auth = useAuthStore();

const showQuickActions = ref(false);

const user = computed(() => {
  const u = auth.user;
  const result: { name?: string; avatar?: string | null; initials?: string } = {};
  if (u?.name) result.name = u.name;
  if (u?.avatar !== undefined) result.avatar = u.avatar;
  const initials = u?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  if (initials) result.initials = initials;
  return result;
});

const onAvatarClick = () => { void router.push('/user/config'); };
const onMenuClick  = () => { void router.push('/user/home'); };

const onActionSelected = () => {
  // Action handling is centralized inside QuickActionSheet.
};
</script>

<style scoped lang="scss">
.lite-desktop-layout {
  background: #f8fafc;

  .body--dark & { background: #0f172a; }
}

.dte-layout-header {
  background: transparent;
  height: 72px;
}
</style>
