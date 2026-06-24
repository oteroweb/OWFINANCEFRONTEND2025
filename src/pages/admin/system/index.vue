<template>
  <q-page padding>
    <div class="text-overline text-grey-6">SISTEMA</div>
    <h1 class="text-h5 q-mb-lg">Estado del sistema</h1>
    <div v-if="loading" class="text-center q-pa-xl"><q-spinner size="40px" /></div>
    <div v-else class="row q-gutter-md">
      <q-card v-for="m in metrics" :key="m.key" flat bordered class="col-auto" style="min-width:180px">
        <q-card-section>
          <div class="text-caption text-grey-6 text-uppercase">{{ m.label }}</div>
          <div class="text-h4 text-weight-bold q-mt-xs">{{ m.value }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
<script setup lang="ts">
// eslint-disable-next-line vue/multi-word-component-names
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
const loading = ref(true)
const metrics = ref<{key:string;label:string;value:string|number}[]>([])
onMounted(async () => {
  try {
    const r = await api.get('/admin/dashboard')
    const d = r.data?.data || {}
    metrics.value = [
      { key: 'users', label: 'Usuarios totales', value: d.total_users ?? '—' },
      { key: 'active', label: 'Usuarios activos', value: d.active_users ?? '—' },
      { key: 'tx', label: 'Transacciones', value: d.total_transactions ?? '—' },
      { key: 'txmonth', label: 'Tx este mes', value: d.transactions_this_month ?? '—' },
      { key: 'accounts', label: 'Cuentas', value: d.total_accounts ?? '—' },
      { key: 'jars', label: 'Cántaros', value: d.total_jars ?? '—' },
    ]
  } finally { loading.value = false }
})
</script>
