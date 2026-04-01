<template>
  <VersionBadge />
  <router-view />
  <OnboardingModal />
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores/auth';
import VersionBadge from 'components/VersionBadge.vue';
import OnboardingModal from 'components/OnboardingModal.vue';

// 👇 Restaurar sesión desde localStorage al cargar la app
const auth = useAuthStore();
auth.loadFromStorage();
</script>

