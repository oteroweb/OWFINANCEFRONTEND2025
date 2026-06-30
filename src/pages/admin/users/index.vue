<template>
  <q-page class="adm-users">

    <!-- KPI Row -->
    <div class="adm-users__kpis">
      <div class="adm-kpi" v-for="kpi in kpis" :key="kpi.label">
        <span class="material-icons adm-kpi__icon" :style="{ color: kpi.color }">{{ kpi.icon }}</span>
        <div class="adm-kpi__body">
          <div class="adm-kpi__value">{{ kpi.value ?? '—' }}</div>
          <div class="adm-kpi__label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="adm-users__filters">
      <q-input v-model="filters.search" dense outlined placeholder="Buscar por nombre o email…"
        class="adm-users__search" @update:model-value="onFilterChange">
        <template #prepend><q-icon name="search" /></template>
        <template #append>
          <q-icon v-if="filters.search" name="close" class="cursor-pointer" @click="filters.search=''; onFilterChange()" />
        </template>
      </q-input>
      <q-select v-model="filters.role" dense outlined label="Rol" :options="roleOptions" emit-value map-options
        clearable class="adm-users__filter-sel" @update:model-value="onFilterChange" />
      <q-select v-model="filters.active" dense outlined label="Estado" :options="activeOptions" emit-value map-options
        clearable class="adm-users__filter-sel" @update:model-value="onFilterChange" />
    </div>

    <!-- Table -->
    <q-table
      :rows="users"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat bordered
      class="adm-users__table"
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
    >
      <!-- Avatar + nombre + email -->
      <template #body-cell-name="{ row }">
        <q-td>
          <div class="adm-users__name-cell">
            <div class="adm-users__avatar" :style="{ background: avatarColor(row.name) }">
              {{ initials(row.name) }}
            </div>
            <div>
              <div class="adm-users__fullname">{{ row.name }}</div>
              <div class="adm-users__email">{{ row.email }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Rol badge -->
      <template #body-cell-role="{ row }">
        <q-td>
          <span class="adm-badge" :class="row.role?.slug === 'admin' ? 'adm-badge--admin' : 'adm-badge--user'">
            {{ row.role?.slug === 'admin' ? 'Admin' : 'Usuario' }}
          </span>
        </q-td>
      </template>

      <!-- Toggle activo -->
      <template #body-cell-active="{ row }">
        <q-td class="text-center">
          <q-toggle :model-value="!!row.active" dense @update:model-value="val => toggleActive(row, val)" />
        </q-td>
      </template>

      <!-- Fecha registro -->
      <template #body-cell-created_at="{ row }">
        <q-td>
          <span class="adm-users__date">{{ formatDate(row.created_at) }}</span>
        </q-td>
      </template>

      <!-- Acciones -->
      <template #body-cell-actions="{ row }">
        <q-td class="adm-users__actions-cell">
          <q-btn flat dense round icon="person" size="sm" title="Ver detalle" @click="goDetail(row.id)" />
          <q-btn flat dense round icon="manage_accounts" size="sm" title="Impersonar" color="warning"
            @click="confirmImpersonate(row)" :disable="row.role?.slug === 'admin'" />
          <q-btn flat dense round icon="delete_outline" size="sm" title="Eliminar" color="negative"
            @click="confirmDelete(row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Pagination -->
    <div class="adm-users__pagination" v-if="totalPages > 1">
      <q-pagination v-model="page" :max="totalPages" boundary-links direction-links
        @update:model-value="loadUsers" />
    </div>

    <!-- Impersonate confirm dialog -->
    <q-dialog v-model="impersonateDialog">
      <q-card style="min-width: 340px">
        <q-card-section>
          <div class="text-h6">Impersonar usuario</div>
          <div class="text-body2 q-mt-sm text-grey-7">
            Vas a iniciar sesión como <strong>{{ impersonateTarget?.name }}</strong>.
            Podrás volver al admin en cualquier momento.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn unelevated color="warning" label="Impersonar" @click="doImpersonate" :loading="impersonating" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';

defineOptions({ name: 'AdminUsersIndex' });

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

interface UserRow {
  id: number;
  name: string;
  email: string;
  active: number | boolean;
  created_at: string;
  role?: { id: number; name: string; slug: string };
}

const users = ref<UserRow[]>([]);
const loading = ref(false);
const page = ref(1);
const perPage = 20;
const totalRows = ref(0);
const totalPages = computed(() => Math.ceil(totalRows.value / perPage));

const filters = reactive({ search: '', role: null as string | null, active: null as string | null });

const kpisData = ref({ total_users: 0, active_today: 0, registered_this_month: 0 });

const kpis = computed(() => [
  { label: 'Total usuarios', value: kpisData.value.total_users, icon: 'group', color: '#1E3A8A' },
  { label: 'Activos hoy', value: kpisData.value.active_today, icon: 'today', color: '#10B981' },
  { label: 'Este mes', value: kpisData.value.registered_this_month, icon: 'calendar_month', color: '#0EA5E9' },
  { label: 'Total registros', value: totalRows.value, icon: 'person_add', color: '#7C3AED' },
]);

const roleOptions = [
  { label: 'Todos', value: null },
  { label: 'Admin', value: 'admin' },
  { label: 'Usuario', value: 'user' },
];
const activeOptions = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: '1' },
  { label: 'Inactivos', value: '0' },
];

const columns = [
  { name: 'name', label: 'Usuario', field: 'name', align: 'left' as const, sortable: true },
  { name: 'role', label: 'Rol', field: 'role', align: 'center' as const },
  { name: 'active', label: 'Activo', field: 'active', align: 'center' as const },
  { name: 'created_at', label: 'Registro', field: 'created_at', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'center' as const },
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

function avatarColor(name: string) {
  const colors = ['#1E3A8A', '#0EA5E9', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(h)];
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadUsers() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = { page: page.value, per_page: perPage };
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.active !== null) params.active = filters.active;
    const res = await api.get('/users', { params });
    const body = res.data;
    users.value = (body?.data || body || []) as UserRow[];
    totalRows.value = body?.meta?.total ?? body?.total ?? users.value.length;
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando usuarios' });
  } finally {
    loading.value = false;
  }
}

async function loadKpis() {
  try {
    const res = await api.get('/admin/dashboard');
    const d = res.data?.data ?? res.data ?? {};
    kpisData.value = {
      total_users: d.total_users ?? 0,
      active_today: d.active_today ?? 0,
      registered_this_month: d.registered_this_month ?? 0,
    };
  } catch { /* silencioso */ }
}

function onFilterChange() {
  page.value = 1;
  void loadUsers();
}

function goDetail(id: number) {
  void router.push(`/admin/users/${id}`);
}

// Toggle active
async function toggleActive(row: UserRow, val: boolean) {
  try {
    await api.patch(`/users/${row.id}/status`, { active: val ? 1 : 0 });
    row.active = val ? 1 : 0;
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cambiar el estado' });
  }
}

// Impersonation
const impersonateDialog = ref(false);
const impersonateTarget = ref<UserRow | null>(null);
const impersonating = ref(false);

function confirmImpersonate(row: UserRow) {
  impersonateTarget.value = row;
  impersonateDialog.value = true;
}

async function doImpersonate() {
  if (!impersonateTarget.value) return;
  impersonating.value = true;
  try {
    const res = await api.post(`/admin/users/${impersonateTarget.value.id}/impersonate`);
    const { token, user } = res.data.data;
    auth.startImpersonation(token, user);
    impersonateDialog.value = false;
    await router.push('/user/home');
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al impersonar' });
  } finally {
    impersonating.value = false;
  }
}

// Delete
function confirmDelete(row: UserRow) {
  $q.dialog({
    title: 'Eliminar usuario',
    message: `¿Eliminar a <strong>${row.name}</strong>? Esta acción no se puede deshacer.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/users/${row.id}`);
        await loadUsers();
        $q.notify({ type: 'positive', message: 'Usuario eliminado' });
      } catch {
        $q.notify({ type: 'negative', message: 'No se pudo eliminar' });
      }
    })();
  });
}

onMounted(() => {
  void loadUsers();
  void loadKpis();
});
</script>

<style scoped>
.adm-users {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* KPIs */
.adm-users__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.adm-kpi {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}
.adm-kpi__icon { font-size: 28px; }
.adm-kpi__value {
  font-size: 22px;
  font-weight: 800;
  color: #1E293B;
  line-height: 1.1;
}
.adm-kpi__label {
  font-size: 11px;
  color: #64748B;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Filters */
.adm-users__filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.adm-users__search { flex: 1; min-width: 200px; }
.adm-users__filter-sel { min-width: 130px; }

/* Table */
.adm-users__table { border-radius: 12px; }
.adm-users__name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.adm-users__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.adm-users__fullname {
  font-size: 13.5px;
  font-weight: 600;
  color: #1E293B;
}
.adm-users__email {
  font-size: 11.5px;
  color: #64748B;
  margin-top: 1px;
}
.adm-users__date { font-size: 12.5px; color: #475569; }
.adm-users__actions-cell { white-space: nowrap; }

/* Badges */
.adm-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.adm-badge--admin { background: #FEE2E2; color: #DC2626; }
.adm-badge--user  { background: #DBEAFE; color: #1D4ED8; }

/* Pagination */
.adm-users__pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .adm-users__kpis { grid-template-columns: repeat(2, 1fr); }
}
</style>
