<template>
  <q-page padding>
    <div class="text-overline text-grey-6">SISTEMA</div>
    <h1 class="text-h5 q-mb-lg">Estado del sistema</h1>

    <div v-if="loading" class="text-center q-pa-xl"><q-spinner size="40px" /></div>
    <template v-else>
      <!-- Deploy info -->
      <div class="text-overline text-grey-5 q-mb-sm">Entorno</div>
      <div class="row q-gutter-sm q-mb-lg">
        <q-chip v-for="(val, key) in deploy" :key="key" outline color="primary" size="sm">
          <strong>{{ key }}:</strong>&nbsp;{{ val }}
        </q-chip>
      </div>

      <!-- Table counts -->
      <div class="text-overline text-grey-5 q-mb-sm">Registros por tabla</div>
      <div class="row q-gutter-md q-mb-lg">
        <q-card
          v-for="(count, table) in tableCounts"
          :key="table"
          flat bordered
          style="min-width:140px"
        >
          <q-card-section>
            <div class="text-caption text-grey-6 text-uppercase">{{ table }}</div>
            <div class="text-h5 text-weight-bold q-mt-xs">{{ count ?? '—' }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Last logins -->
      <div class="text-overline text-grey-5 q-mb-sm">Últimas sesiones</div>
      <q-list bordered separator>
        <q-item v-for="u in lastLogins" :key="u.id">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="32px">{{ initial(u.name) }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ u.name }}</q-item-label>
            <q-item-label caption>{{ u.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label caption>{{ formatDate(u.last_login_at) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';

defineOptions({ name: 'AdminSystem' });

const loading = ref(true);
const tableCounts = ref<Record<string, number | null>>({});
const lastLogins  = ref<{ id: number; name: string; email: string; last_login_at: string }[]>([]);
const deploy      = ref<Record<string, string>>({});

function initial(name: string) { return name.charAt(0).toUpperCase(); }
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
}

onMounted(async () => {
  try {
    const r = await api.get('/admin/system');
    const d = r.data?.data ?? {};
    tableCounts.value = d.table_counts ?? {};
    lastLogins.value  = d.last_logins ?? [];
    deploy.value      = d.deploy ?? {};
  } finally {
    loading.value = false;
  }
});
</script>
