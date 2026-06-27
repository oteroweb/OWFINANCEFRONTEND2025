<template>
  <q-page class="settings-page">
    <!-- Mobile header -->
    <div class="settings-header">
      <q-btn flat round dense icon="arrow_back" @click="router.back()" />
      <span class="settings-header__title">Configuración</span>
      <div style="width:40px" />
    </div>

    <div class="settings-scroll">
      <!-- ── Apariencia: Plan + Tema ──────────────────────────────── -->
      <div class="settings-group">
        <div class="settings-group__label">Apariencia</div>
        <q-list class="settings-list">
          <!-- Plan: Lite / Pro -->
          <q-item class="settings-item settings-item--tall">
            <q-item-section>
              <q-item-label class="settings-item__label">Plan</q-item-label>
              <q-item-label caption class="settings-item__hint">
                {{ activeLayoutMode === 'pro' ? 'Multimoneda · multicuenta' : 'Billetera única, calmada' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="seg-ctrl" :style="{ '--seg-accent': activeLayoutMode === 'pro' ? 'var(--info, #3b82f6)' : 'var(--brand-primary)' }">
                <button
                  v-for="opt in modeOptions"
                  :key="opt.value"
                  class="seg-ctrl__btn"
                  :class="{ 'seg-ctrl__btn--on': activeLayoutMode === opt.value }"
                  @click="switchMode(opt.value)"
                >{{ opt.label }}</button>
              </div>
            </q-item-section>
          </q-item>
          <q-separator inset />
          <!-- Tema: Claro / Oscuro -->
          <q-item class="settings-item settings-item--tall">
            <q-item-section>
              <q-item-label class="settings-item__label">Tema</q-item-label>
              <q-item-label caption class="settings-item__hint">
                {{ isDark ? 'Oscuro' : 'Claro' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="seg-ctrl" :style="{ '--seg-accent': activeLayoutMode === 'pro' ? 'var(--info, #3b82f6)' : 'var(--brand-primary)' }">
                <button
                  v-for="opt in themeOptions"
                  :key="opt.value"
                  class="seg-ctrl__btn"
                  :class="{ 'seg-ctrl__btn--on': (isDark ? 'dark' : 'light') === opt.value }"
                  @click="onThemeChange(opt.value)"
                >
                  <span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:3px">{{ opt.icon }}</span>{{ opt.label }}
                </button>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- ── Cuenta ─────────────────────────────────────────────────── -->
      <div class="settings-group">
        <div class="settings-group__label">Cuenta</div>
        <q-list class="settings-list">
          <q-item v-for="(item, i) in cuentaItems" :key="item.label" clickable class="settings-item" @click="handleItem(item)">
            <q-separator v-if="i > 0" inset />
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" class="settings-item__icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="settings-item__label">{{ item.label }}</q-item-label>
              <q-item-label v-if="item.hint" caption class="settings-item__hint">{{ item.hint }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="18px" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- ── Visualización ─────────────────────────────────────────── -->
      <div class="settings-group">
        <div class="settings-group__label">Visualización</div>
        <q-list class="settings-list">
          <!-- Ocultar saldos -->
          <q-item class="settings-item" clickable @click="ui.toggleHideValues()">
            <q-item-section avatar>
              <q-icon name="visibility" size="20px" class="settings-item__icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="settings-item__label">Ocultar saldos por defecto</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="ui.hideValues"
                :color="activeLayoutMode === 'pro' ? 'blue' : 'primary'"
                dense
                @update:model-value="ui.toggleHideValues()"
              />
            </q-item-section>
          </q-item>
          <q-separator inset />
          <!-- Divisa predeterminada -->
          <q-item clickable class="settings-item" @click="router.push('/user/accounts')">
            <q-item-section avatar>
              <q-icon name="settings" size="20px" class="settings-item__icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="settings-item__label">Divisa predeterminada</q-item-label>
              <q-item-label caption class="settings-item__hint">USD</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="18px" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- ── Notificaciones ────────────────────────────────────────── -->
      <div class="settings-group">
        <div class="settings-group__label">Notificaciones</div>
        <q-list class="settings-list">
          <template v-for="(notif, i) in notifItems" :key="notif.key">
            <q-separator v-if="i > 0" inset />
            <q-item class="settings-item" clickable @click="toggleNotif(notif.key)">
              <q-item-section avatar>
                <q-icon name="notifications" size="20px" class="settings-item__icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="settings-item__label">{{ notif.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  :model-value="notifPrefs[notif.key]"
                  :color="activeLayoutMode === 'pro' ? 'blue' : 'primary'"
                  dense
                  @update:model-value="toggleNotif(notif.key)"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>

      <!-- ── Cerrar sesión ─────────────────────────────────────────── -->
      <div class="settings-group">
        <q-list class="settings-list">
          <q-item clickable class="settings-item settings-item--danger" @click="handleLogout">
            <q-item-section avatar>
              <q-icon name="close" size="20px" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label style="color: var(--expense-fg, #b91c1c); font-weight: 500;">Cerrar sesión</q-item-label>
              <q-item-label caption>{{ auth.user?.email }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <div style="height: 32px" />
    </div>

    <OnboardingFlow v-model="showOnboarding" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import { api } from 'boot/axios';
import { normalizeLayoutMode, type UserLayoutMode } from 'src/utils/layoutMode';
import OnboardingFlow from 'src/components/OnboardingFlow.vue';

defineOptions({ name: 'user_settings_page' });

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const showOnboarding = ref(false);

// ── Layout mode ────────────────────────────────────────────────
const activeLayoutMode = computed<UserLayoutMode>(
  () => normalizeLayoutMode(auth.settings?.layout_mode ?? auth.user?.layout_mode)
);
const isDark = computed(() => $q.dark.isActive);

const modeOptions: { label: string; value: 'lite' | 'pro' }[] = [
  { label: 'Lite', value: 'lite' },
  { label: 'Pro', value: 'pro' },
];

const themeOptions = [
  { label: 'Claro', value: 'light', icon: 'light_mode' },
  { label: 'Oscuro', value: 'dark', icon: 'dark_mode' },
];

async function switchMode(mode: 'lite' | 'pro') {
  auth.updateLayoutMode(mode);
  await auth.updateSettings({ layout_mode: mode });
}

function onThemeChange(value: string) {
  if (value === 'dark' && !$q.dark.isActive) $q.dark.set(true);
  else if (value === 'light' && $q.dark.isActive) $q.dark.set(false);
  try { localStorage.setItem('ow-theme', value); } catch { /* noop */ }
}

// ── Cuenta items ───────────────────────────────────────────────
const cuentaItems = [
  { icon: 'person', label: 'Perfil', hint: computed(() => auth.user?.name || 'Mi perfil'), nav: '/user/profile' },
  { icon: 'insights', label: 'Mi perfil financiero', hint: 'Ingresos, cántaros, metas y asesor IA', nav: '/user/financial-profile' },
  { icon: 'savings', label: 'Cuentas vinculadas', hint: '3 tarjetas · 1 banco', nav: '/user/accounts' },
  { icon: 'route', label: 'Repetir configuración inicial', hint: 'Volver a ver el onboarding', act: 'onboarding' as const },
  { icon: 'receipt_long', label: 'Exportar datos', hint: 'CSV, PDF', act: 'export' as const },
];

function handleItem(item: { nav?: string; act?: string }) {
  if (item.nav) { void router.push(item.nav); return; }
  if (item.act === 'onboarding') { showOnboarding.value = true; return; }
  if (item.act === 'export') {
    $q.notify({ message: 'Exportación próximamente', color: 'info' });
  }
}

// ── Notif prefs ────────────────────────────────────────────────
type NotifKey = 'weekDigest' | 'idleAlerts' | 'overBudget';
const notifPrefs = reactive<Record<NotifKey, boolean>>({
  weekDigest: true,
  idleAlerts: true,
  overBudget: false,
});

const notifItems: { key: NotifKey; label: string }[] = [
  { key: 'weekDigest', label: 'Resumen semanal' },
  { key: 'idleAlerts', label: 'Alertas de dinero ocioso' },
  { key: 'overBudget', label: 'Alerta de sobrepresupuesto' },
];

async function toggleNotif(key: NotifKey) {
  notifPrefs[key] = !notifPrefs[key];
  try {
    const existing = (auth.settings?.preferences as Record<string, unknown>) ?? {};
    await api.put('/user/settings', {
      preferences: { ...existing, notifications: { ...notifPrefs } },
    });
  } catch { /* silent */ }
}

// ── Logout ─────────────────────────────────────────────────────
async function handleLogout() {
  try { await api.post('/auth/logout'); } catch { /* best-effort */ }
  auth.logout();
  await router.replace('/login');
}
</script>

<style scoped>
.settings-page {
  background: var(--bg-canvas, var(--surface-2));
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-hairline);
  position: sticky;
  top: 0;
  z-index: 10;
}

.settings-header__title {
  font-family: var(--font-body, sans-serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--fg-1);
}

.settings-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.settings-group {
  margin-bottom: 24px;
}

.settings-group__label {
  padding: 0 20px 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-2);
}

.settings-list {
  background: var(--surface-1);
  margin: 0 16px;
  border-radius: var(--radius-xl, 16px);
  overflow: hidden;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,.08));
}

.settings-item {
  min-height: 52px;
  padding: 10px 18px;
}

.settings-item--tall {
  min-height: 66px;
}

.settings-item__icon {
  color: var(--fg-2);
}

.settings-item__label {
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-1);
}

.settings-item__hint {
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  color: var(--fg-2);
}

.settings-item--danger:hover {
  background: rgba(239, 68, 68, 0.05);
}

/* Segmented control */
.seg-ctrl {
  display: flex;
  gap: 2px;
  background: var(--surface-2);
  border-radius: var(--radius-pill, 999px);
  padding: 3px;
}

.seg-ctrl__btn {
  flex: 1;
  border: 0;
  cursor: pointer;
  padding: 7px 10px;
  border-radius: var(--radius-pill, 999px);
  background: transparent;
  color: var(--fg-2);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 500;
  transition: background 160ms, color 160ms;
  white-space: nowrap;
}

.seg-ctrl__btn--on {
  background: var(--seg-accent, var(--brand-primary));
  color: #fff;
  font-weight: 700;
}
</style>
