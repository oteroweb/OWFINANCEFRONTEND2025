<template>
  <div v-if="auth.impersonating" class="imp-banner">
    <span class="material-icons imp-banner__icon">manage_accounts</span>
    <span class="imp-banner__text">
      Estás viendo la cuenta de
      <strong>{{ auth.impersonatedUser?.name }}</strong>
      — modo impersonación
    </span>
    <button class="imp-banner__btn" @click="stop">
      <span class="material-icons" style="font-size:15px">arrow_back</span>
      Volver al Admin
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

async function stop() {
  auth.stopImpersonation();
  await router.push('/admin/users');
}
</script>

<style scoped>
.imp-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 44px;
  background: linear-gradient(90deg, #DC2626 0%, #EF4444 100%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: #fff;
  font-family: 'DM Sans', 'Satoshi', sans-serif;
  font-size: 13px;
}
.imp-banner__icon {
  font-size: 18px;
  flex-shrink: 0;
}
.imp-banner__text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.imp-banner__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 150ms;
  flex-shrink: 0;
}
.imp-banner__btn:hover {
  background: rgba(255,255,255,0.25);
}
</style>
