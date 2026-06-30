<template>
  <q-page class="adm-detail">

    <!-- Header -->
    <div class="adm-detail__header">
      <q-btn flat dense icon="arrow_back" label="Usuarios" @click="router.back()" class="adm-detail__back" />
      <div class="adm-detail__title-row" v-if="user">
        <div class="adm-detail__avatar" :style="{ background: avatarColor(user.name) }">
          {{ initials(user.name) }}
        </div>
        <div>
          <div class="adm-detail__name">{{ user.name }}</div>
          <div class="adm-detail__email">{{ user.email }}</div>
          <div class="adm-detail__badges">
            <span class="adm-badge" :class="user.role?.slug === 'admin' ? 'adm-badge--admin' : 'adm-badge--user'">
              {{ user.role?.name ?? 'Usuario' }}
            </span>
            <span class="adm-badge" :class="user.active ? 'adm-badge--active' : 'adm-badge--inactive'">
              {{ user.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
        <div class="adm-detail__actions" v-if="user.role?.slug !== 'admin'">
          <q-btn unelevated color="warning" icon="manage_accounts" label="Impersonar" dense
            @click="confirmImpersonate" :loading="impersonating" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="adm-detail__loading">
      <q-spinner-dots size="48px" color="primary" />
    </div>

    <!-- Tabs -->
    <div v-else-if="detail">
      <q-tabs v-model="tab" dense align="left" class="adm-detail__tabs" active-color="primary" indicator-color="primary">
        <q-tab name="info"     icon="person"           label="Perfil" />
        <q-tab name="accounts" icon="account_balance"  label="Cuentas" />
        <q-tab name="jars"     icon="savings"          label="Cántaros" />
        <q-tab name="txns"     icon="receipt_long"     label="Transacciones" />
        <q-tab name="security" icon="lock"             label="Seguridad" />
        <q-tab name="settings" icon="settings"         label="Ajustes" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>

        <!-- PERFIL -->
        <q-tab-panel name="info" class="adm-panel">
          <!-- Read-only info row -->
          <div class="adm-panel__grid" style="margin-bottom:24px">
            <div class="adm-field"><div class="adm-field__label">ID</div><div class="adm-field__value">{{ user?.id }}</div></div>
            <div class="adm-field"><div class="adm-field__label">Moneda</div><div class="adm-field__value">{{ detail.user.currency?.code ?? '—' }}</div></div>
            <div class="adm-field"><div class="adm-field__label">Registro</div><div class="adm-field__value">{{ fmtDate(user?.created_at) }}</div></div>
            <div class="adm-field"><div class="adm-field__label">Último login</div><div class="adm-field__value">{{ fmtDate(detail.security.last_login) }}</div></div>
          </div>

          <!-- Editable form -->
          <div class="adm-profile-form">
            <div class="adm-profile-form__section-label">Datos personales</div>
            <div class="adm-profile-form__row">
              <q-input v-model="profileForm.name" label="Nombre completo" outlined dense />
              <q-input v-model="profileForm.email" label="Email" outlined dense type="email" />
            </div>

            <div class="adm-profile-form__section-label" style="margin-top:20px">Cuenta y rol</div>
            <div class="adm-profile-form__row">
              <q-select
                v-model="profileForm.role_id"
                :options="roles"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Rol"
                outlined dense
                hint="Cambiar el rol afecta el acceso al panel"
              />
              <div>
                <div class="adm-field__label" style="margin-bottom:6px">Plan</div>
                <q-btn-toggle
                  v-model="profileForm.layout_mode"
                  :options="[{ label: 'Lite', value: 'lite' }, { label: 'Pro', value: 'pro' }]"
                  unelevated dense
                  color="primary"
                  text-color="primary"
                  toggle-color="primary"
                  toggle-text-color="white"
                  style="border:1px solid #CBD5E1;border-radius:8px"
                />
              </div>
            </div>

            <div class="adm-profile-form__actions">
              <q-btn flat label="Descartar" @click="() => { if(detail) profileForm = { name: detail.user.name, email: detail.user.email, role_id: detail.user.role?.id ?? null, layout_mode: (detail.settings as Record<string,string>|null)?.layout_mode === 'pro' ? 'pro' : 'lite' } }" />
              <q-btn unelevated color="primary" icon="check" label="Guardar cambios" @click="saveProfile" :loading="savingProfile" />
            </div>
          </div>
        </q-tab-panel>

        <!-- CUENTAS -->
        <q-tab-panel name="accounts" class="adm-panel">
          <div v-if="!detail.accounts.length" class="adm-panel__empty">Sin cuentas registradas</div>
          <div v-else class="adm-panel__list">
            <div v-for="acc in detail.accounts" :key="acc.id" class="adm-panel__card">
              <div class="adm-panel__card-title">{{ acc.name }}</div>
              <div class="adm-panel__card-sub">{{ acc.type?.name ?? acc.account_type?.name ?? '—' }}</div>
              <div class="adm-panel__card-value">{{ fmtAmount(acc.balance ?? acc.current_balance) }}</div>
            </div>
          </div>
        </q-tab-panel>

        <!-- CÁNTAROS -->
        <q-tab-panel name="jars" class="adm-panel">
          <div v-if="!detail.jars.length" class="adm-panel__empty">Sin cántaros registrados</div>
          <div v-else class="adm-panel__list">
            <div v-for="jar in detail.jars" :key="jar.id" class="adm-panel__card">
              <div class="adm-panel__card-title">{{ jar.name }}</div>
              <div class="adm-panel__card-sub">{{ jar.slug }}</div>
            </div>
          </div>
        </q-tab-panel>

        <!-- TRANSACCIONES RECIENTES -->
        <q-tab-panel name="txns" class="adm-panel">
          <div v-if="!detail.recent_transactions.length" class="adm-panel__empty">Sin transacciones</div>
          <q-list v-else bordered separator dense>
            <q-item v-for="tx in detail.recent_transactions" :key="tx.id">
              <q-item-section>
                <q-item-label>{{ tx.description || tx.category?.name || 'Sin descripción' }}</q-item-label>
                <q-item-label caption>{{ fmtDate(tx.date) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <span :class="tx.type === 'income' ? 'text-positive' : 'text-negative'" style="font-weight:700">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ fmtAmount(tx.amount) }}
                </span>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <!-- SEGURIDAD -->
        <q-tab-panel name="security" class="adm-panel">
          <div class="adm-panel__grid">
            <div class="adm-field">
              <div class="adm-field__label">Sesiones activas</div>
              <div class="adm-field__value">{{ detail.security.tokens_count }}</div>
            </div>
            <div class="adm-field">
              <div class="adm-field__label">Último login</div>
              <div class="adm-field__value">{{ fmtDate(detail.security.last_login) }}</div>
            </div>
          </div>

          <div class="adm-panel__actions">
            <q-btn unelevated color="warning" icon="key" label="Cambiar contraseña" @click="pwdDialog = true" />
            <q-btn unelevated color="negative" icon="logout" label="Revocar sesiones" @click="confirmRevoke" :disable="!detail.security.tokens_count" />
            <q-btn flat color="primary" icon="email" label="Enviar reset por email" @click="sendReset" :loading="sendingReset" />
          </div>
        </q-tab-panel>

        <!-- AJUSTES -->
        <q-tab-panel name="settings" class="adm-panel">
          <div v-if="!detail.settings" class="adm-panel__empty">Sin ajustes personalizados</div>
          <div v-else class="adm-panel__grid">
            <div class="adm-field" v-for="(v, k) in flatSettings" :key="k">
              <div class="adm-field__label">{{ k }}</div>
              <div class="adm-field__value">{{ v }}</div>
            </div>
          </div>
        </q-tab-panel>

      </q-tab-panels>
    </div>

    <!-- Change password dialog -->
    <q-dialog v-model="pwdDialog">
      <q-card style="min-width: 320px">
        <q-card-section><div class="text-h6">Cambiar contraseña</div></q-card-section>
        <q-card-section class="q-pt-none q-gutter-sm">
          <q-input v-model="newPwd" label="Nueva contraseña" type="password" outlined dense />
          <q-input v-model="newPwdConfirm" label="Confirmar contraseña" type="password" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn unelevated color="primary" label="Guardar" @click="changePassword" :loading="savingPwd" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Impersonate confirm dialog -->
    <q-dialog v-model="impersonateDialog">
      <q-card style="min-width: 340px">
        <q-card-section>
          <div class="text-h6">Impersonar usuario</div>
          <div class="text-body2 q-mt-sm text-grey-7">
            Vas a iniciar sesión como <strong>{{ user?.name }}</strong>.
            Podrás volver al admin en cualquier momento desde el banner rojo.
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';

defineOptions({ name: 'AdminUserDetail' });

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const userId = computed(() => route.params.id as string);
const loading = ref(true);
const tab = ref('info');

interface UserFull {
  id: number;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  role?: { id: number; name: string; slug: string };
  currency?: { code: string };
}

interface AccItem { id: number; name: string; balance?: number; current_balance?: number; type?: { name: string }; account_type?: { name: string } }
interface JarFull { id: number; name: string; slug?: string }
interface TxItem { id: number; description?: string; date: string; amount: number; type?: string; category?: { name: string } }
interface DetailData {
  user: UserFull;
  settings: Record<string, string | number | boolean> | null;
  accounts: AccItem[];
  jars: JarFull[];
  recent_transactions: TxItem[];
  security: { tokens_count: number; last_login: string | null };
  currencies: Array<unknown>;
}

const detail = ref<DetailData | null>(null);
const user = computed(() => detail.value?.user ?? null);

// --- Roles ---
interface RoleOption { id: number; name: string; slug: string }
const roles = ref<RoleOption[]>([]);
async function loadRoles() {
  try {
    const res = await api.get('/admin/roles');
    const raw = res.data?.data ?? res.data ?? [];
    roles.value = Array.isArray(raw) ? raw : [];
  } catch { /* silent */ }
}

// --- Profile form ---
interface ProfileForm { name: string; email: string; role_id: number | null; layout_mode: 'lite' | 'pro' }
const profileForm = ref<ProfileForm>({ name: '', email: '', role_id: null, layout_mode: 'lite' });
const savingProfile = ref(false);

watch(detail, (d) => {
  if (!d) return;
  profileForm.value = {
    name:        d.user.name,
    email:       d.user.email,
    role_id:     d.user.role?.id ?? null,
    layout_mode: (d.settings as Record<string, string> | null)?.layout_mode === 'pro' ? 'pro' : 'lite',
  };
});

async function saveProfile() {
  savingProfile.value = true;
  try {
    const res = await api.put(`/admin/users/${userId.value}/profile`, profileForm.value);
    $q.notify({ type: 'positive', message: 'Perfil actualizado' });
    // update local detail with fresh user
    if (detail.value) detail.value.user = res.data.data as UserFull;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al guardar' });
  } finally {
    savingProfile.value = false;
  }
}

const flatSettings = computed((): Record<string, string | number | boolean> => {
  const s = detail.value?.settings;
  if (!s) return {};
  return Object.fromEntries(
    Object.entries(s).filter(([, v]) => v !== null && v !== undefined)
  ) as Record<string, string | number | boolean>;
});

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}
function avatarColor(name: string) {
  const colors = ['#1E3A8A', '#0EA5E9', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(h)];
}
function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtAmount(v: unknown) {
  const n = parseFloat(v as string);
  if (isNaN(n)) return '—';
  return n.toLocaleString('es-VE', { minimumFractionDigits: 2 });
}

async function loadDetail() {
  loading.value = true;
  try {
    const res = await api.get(`/admin/users/${userId.value}/detail`);
    detail.value = res.data.data as DetailData;
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar el usuario' });
  } finally {
    loading.value = false;
  }
}

// --- Password change ---
const pwdDialog = ref(false);
const newPwd = ref('');
const newPwdConfirm = ref('');
const savingPwd = ref(false);

async function changePassword() {
  if (newPwd.value.length < 8) {
    $q.notify({ type: 'warning', message: 'Mínimo 8 caracteres' }); return;
  }
  if (newPwd.value !== newPwdConfirm.value) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' }); return;
  }
  savingPwd.value = true;
  try {
    await api.put(`/admin/users/${userId.value}/password`, {
      password: newPwd.value,
      password_confirmation: newPwdConfirm.value,
    });
    pwdDialog.value = false;
    newPwd.value = ''; newPwdConfirm.value = '';
    $q.notify({ type: 'positive', message: 'Contraseña actualizada' });
    await loadDetail();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al cambiar contraseña' });
  } finally {
    savingPwd.value = false;
  }
}

// --- Revoke tokens ---
function confirmRevoke() {
  $q.dialog({
    title: 'Revocar sesiones',
    message: `¿Cerrar todas las sesiones activas de <strong>${user.value?.name}</strong>?`,
    html: true, cancel: true, persistent: true,
    ok: { label: 'Revocar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        const res = await api.delete(`/admin/users/${userId.value}/tokens`);
        $q.notify({ type: 'positive', message: `${res.data.data.revoked_count} sesión(es) revocadas` });
        await loadDetail();
      } catch {
        $q.notify({ type: 'negative', message: 'Error al revocar sesiones' });
      }
    })();
  });
}

// --- Reset email ---
const sendingReset = ref(false);
async function sendReset() {
  sendingReset.value = true;
  try {
    await api.post(`/admin/users/${userId.value}/reset-password-email`);
    $q.notify({ type: 'positive', message: 'Email de reset enviado' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al enviar email' });
  } finally {
    sendingReset.value = false;
  }
}

// --- Impersonation ---
const impersonateDialog = ref(false);
const impersonating = ref(false);

function confirmImpersonate() {
  impersonateDialog.value = true;
}
async function doImpersonate() {
  impersonating.value = true;
  try {
    const res = await api.post(`/admin/users/${userId.value}/impersonate`);
    const { token, user: u } = res.data.data;
    auth.startImpersonation(token, u);
    impersonateDialog.value = false;
    await router.push('/user/home');
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    $q.notify({ type: 'negative', message: err.response?.data?.message ?? 'Error al impersonar' });
  } finally {
    impersonating.value = false;
  }
}

onMounted(() => {
  void loadDetail();
  void loadRoles();
});
</script>

<style scoped>
.adm-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 16px;
}

.adm-detail__header {
  margin-bottom: 20px;
}
.adm-detail__back {
  margin-bottom: 12px;
  color: #64748B;
}
.adm-detail__title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.adm-detail__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}
.adm-detail__name {
  font-size: 20px;
  font-weight: 800;
  color: #1E293B;
  line-height: 1.2;
}
.adm-detail__email {
  font-size: 13px;
  color: #64748B;
  margin-top: 2px;
}
.adm-detail__badges {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.adm-detail__actions {
  margin-left: auto;
}

.adm-detail__loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}

/* Tabs */
.adm-detail__tabs { margin-bottom: 0; }

/* Panels */
.adm-panel { padding: 20px 0; }
.adm-panel__empty {
  text-align: center;
  color: #94A3B8;
  padding: 40px;
  font-size: 14px;
}
.adm-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.adm-field {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 12px 16px;
}
.adm-field__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 4px;
}
.adm-field__value {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
  word-break: break-all;
}
.adm-panel__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.adm-panel__card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 14px;
}
.adm-panel__card-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1E293B;
}
.adm-panel__card-sub {
  font-size: 11.5px;
  color: #64748B;
  margin-top: 2px;
}
.adm-panel__card-value {
  font-size: 15px;
  font-weight: 800;
  color: #1E3A8A;
  margin-top: 8px;
}

.adm-panel__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

/* Badges */
.adm-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.adm-badge--admin    { background: #FEE2E2; color: #DC2626; }
.adm-badge--user     { background: #DBEAFE; color: #1D4ED8; }
.adm-badge--active   { background: #DCFCE7; color: #16A34A; }
.adm-badge--inactive { background: #F1F5F9; color: #64748B; }

/* Profile edit form */
.adm-profile-form {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 20px;
}
.adm-profile-form__section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 12px;
}
.adm-profile-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 600px) {
  .adm-profile-form__row { grid-template-columns: 1fr; }
}
.adm-profile-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}
</style>
