<template>
  <q-page class="q-pa-md column q-gutter-md">
    <div class="row items-center q-col-gutter-md">
      <div class="col-grow">
        <div class="text-h5">Hola, {{ auth.user?.name || 'Usuario' }}</div>
        <div class="text-caption text-grey-7">Dashboard limpio.</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva transacción"
          @click="ui.openNewTransactionDialog()"
        />
      </div>
    </div>
    <q-separator spaced />
    <div class="dashboard-grid">
      <q-card v-for="w in widgets" :key="w" class="widget">
        <q-card-section class="q-pa-sm">{{ w }}</q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';

defineOptions({ name: 'UserDashboard' });
const auth = useAuthStore();
const ui = useUiStore();
const widgets = ['Balance', 'Distribución', 'Presupuestos', 'Evolución', 'Vencimientos'];
</script>
<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.widget {
  min-height: 100px;
}
</style>
