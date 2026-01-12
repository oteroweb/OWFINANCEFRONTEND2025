<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md text-primary">⚙️ Configuraciones del Usuario</div>

    <q-card flat bordered>
      <q-tabs v-model="tab" dense class="text-primary" align="left" inline-label>
        <q-tab name="profile" icon="person" label="Perfil" />
        <q-tab name="finance" icon="account_balance" label="Finanzas" />
        <q-tab name="accounts" icon="account_balance_wallet" label="Cuentas" />
        <q-tab name="taxes" icon="percent" label="Impuestos" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="profile">
          <div class="q-gutter-md">
            <!-- Avatar y datos básicos -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-md">
                <q-icon name="person" class="q-mr-sm" />
                Información Personal
              </div>
              <div class="row q-col-gutter-md items-center q-mb-md">
                <div class="col-auto">
                  <q-avatar size="96px">
                    <img :src="avatarPreview || avatarUrl" alt="avatar" />
                  </q-avatar>
                </div>
                <div class="col-auto">
                  <q-btn color="primary" label="Cambiar foto" @click="pickAvatar" />
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onFileChange"
                  />
                  <div class="text-caption text-grey-7 q-mt-xs">Formatos: JPG, PNG (máx. 2MB)</div>
                </div>
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="name"
                    label="Nombre completo"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'El nombre es requerido']"
                  >
                    <template #prepend>
                      <q-icon name="badge" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="email"
                    label="Correo electrónico"
                    type="email"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'El correo es requerido']"
                  >
                    <template #prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card>

            <!-- Seguridad -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="lock" class="q-mr-sm" />
                Cambiar Contraseña
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Deja estos campos vacíos si no deseas cambiar tu contraseña
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="password"
                    label="Nueva contraseña"
                    type="password"
                    outlined
                    dense
                  >
                    <template #prepend>
                      <q-icon name="vpn_key" />
                    </template>
                    <template #hint> Mínimo 8 caracteres </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="passwordConfirm"
                    label="Confirmar contraseña"
                    type="password"
                    outlined
                    dense
                    :rules="[(v) => !password || v === password || 'Las contraseñas no coinciden']"
                  >
                    <template #prepend>
                      <q-icon name="check_circle" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card>

            <!-- Botón de guardar -->
            <div class="row justify-end q-gutter-sm">
              <q-btn outline color="grey-7" label="Cancelar" @click="resetForm" />
              <q-btn
                color="primary"
                :loading="saving"
                label="Guardar cambios"
                icon-right="save"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Pestaña Finanzas -->
        <q-tab-panel name="finance">
          <div class="q-gutter-md">
            <!-- Información general de finanzas -->
            <q-card flat bordered class="q-pa-md bg-blue-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="account_balance" size="48px" color="blue-7" />
                <div>
                  <div class="text-h6 text-blue-9">Configuración Financiera</div>
                  <div class="text-body2 text-blue-8">
                    Administra tu ingreso mensual y configuración monetaria para optimizar la
                    distribución en tus cántaros
                  </div>
                </div>
              </div>
            </q-card>

            <!-- Moneda por defecto -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="attach_money" class="q-mr-sm" />
                Moneda por Defecto
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Selecciona la moneda en la que deseas visualizar todas las cantidades en la
                aplicación
              </div>
              <q-select
                v-model="selectedCurrencyId"
                :options="currencyOptions"
                :loading="currencyLoading"
                option-label="nameLabel"
                option-value="id"
                emit-value
                map-options
                use-input
                :on-filter="onCurrencyFilter"
                label="Moneda"
                outlined
                dense
                @focus="ensureCurrenciesLoaded"
              >
                <template #prepend>
                  <q-icon name="payments" />
                </template>
              </q-select>
            </q-card>

            <!-- Ingreso mensual -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="trending_up" class="q-mr-sm" />
                Ingreso Mensual Esperado
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Define tu ingreso mensual esperado. Este valor es la base para calcular las
                sugerencias de distribución en tus cántaros según porcentajes
              </div>
              <q-input
                v-model.number="monthlyIncome"
                type="number"
                label="Ingreso mensual esperado"
                outlined
                step="0.01"
                min="0"
                prefix="$"
                class="q-mb-md"
              >
                <template #prepend>
                  <q-icon name="paid" />
                </template>
              </q-input>

              <!-- Info boxes sobre el ingreso mensual -->
              <q-banner v-if="monthlyIncome > 0" class="bg-blue-1 text-blue-9" dense rounded>
                <template #avatar>
                  <q-icon name="info" color="blue" />
                </template>
                <div class="text-body2">
                  <div class="text-weight-bold q-mb-sm">✅ Sistema Híbrido Activado</div>
                  <p class="q-mb-sm">
                    Con un ingreso mensual de
                    <strong>${{ monthlyIncome.toFixed(2) }}</strong> configurado, verás dos tipos de
                    sugerencias en cada cántaro:
                  </p>
                  <ul class="q-my-sm q-pl-md">
                    <li class="q-mb-xs">
                      <strong>💰 Sugerido (Esperado):</strong> Calculado en base a tu ingreso
                      mensual esperado de ${{ monthlyIncome.toFixed(2) }}. Ideal para planificación
                      y presupuestos.
                    </li>
                    <li>
                      <strong>📊 Sugerido (Real):</strong> Calculado dinámicamente desde tus
                      transacciones de ingreso del mes actual. Te muestra la realidad de tus
                      ingresos.
                    </li>
                  </ul>
                  <div class="q-mt-sm text-caption">
                    <q-icon name="lightbulb" size="14px" />
                    <strong>Tip:</strong> Compara ambas sugerencias para ver si estás cumpliendo tus
                    metas de ingreso y ajusta tu presupuesto en consecuencia.
                  </div>
                </div>
              </q-banner>
              <q-banner v-else class="bg-orange-1 text-orange-9" dense rounded>
                <template #avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                <div class="text-body2">
                  <strong>⚠️ Configura tu ingreso mensual</strong>
                  <p class="q-my-sm">
                    Sin un ingreso mensual configurado, solo verás los montos reales basados en tus
                    transacciones. Configúralo para obtener sugerencias de distribución por
                    porcentajes en tus cántaros.
                  </p>
                </div>
              </q-banner>
            </q-card>

            <!-- Cómo funciona -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="help_outline" class="q-mr-sm" />
                ¿Cómo Funciona?
              </div>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_one" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Configura tu ingreso mensual esperado</q-item-label>
                    <q-item-label caption>Define cuánto esperas ganar cada mes</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_two" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Asigna porcentajes a tus cántaros</q-item-label>
                    <q-item-label caption
                      >Ejemplo: 50% necesidades, 30% ahorros, 20% ocio</q-item-label
                    >
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_3" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Registra tus ingresos reales</q-item-label>
                    <q-item-label caption
                      >Agrega transacciones de ingreso para ver cálculos reales</q-item-label
                    >
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_4" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Compara y ajusta</q-item-label>
                    <q-item-label caption
                      >Ve la diferencia entre lo esperado y lo real en tiempo real</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>

            <!-- Botón de guardar -->
            <div class="row justify-end q-gutter-sm">
              <q-btn outline color="grey-7" label="Cancelar" @click="resetForm" />
              <q-btn
                color="primary"
                :loading="saving"
                label="Guardar cambios"
                icon-right="save"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="accounts">
          <CrudPage :dictionary="accountsDictionary" />
        </q-tab-panel>

        <q-tab-panel name="taxes">
          <CrudPage :dictionary="taxesDictionary" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import CrudPage from 'components/CrudPage.vue';
import { useAuthStore } from 'stores/auth';
import { defaultAvatarUrl } from '../config';
import { dictionary as accountsDictionary } from '../accounts/dictionary';
import { dictionary as taxesDictionary } from '../taxes/dictionary';
import { api } from 'boot/axios';
import { Notify } from 'quasar';

defineOptions({ name: 'user_config_page' });

const auth = useAuthStore();
const tab = ref<'profile' | 'finance' | 'accounts' | 'taxes'>('profile');

const name = ref(auth.user?.name || '');
const email = ref(auth.user?.email || '');
const monthlyIncome = ref(auth.user?.monthly_income || 0);
const password = ref('');
const passwordConfirm = ref('');

const fileInput = ref<HTMLInputElement | null>(null);
const avatarUrl = computed(() => defaultAvatarUrl);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);

const saving = ref(false);

// ----- Moneda por defecto -----
type CurrencyOption = {
  id: number;
  name: string;
  code?: string | undefined;
  symbol?: string | undefined;
  nameLabel: string;
};
const currencyOptions = ref<CurrencyOption[]>([]);
const allCurrencies = ref<CurrencyOption[]>([]);
const currencyLoading = ref(false);
type LooseUser = {
  currency?: {
    id?: number | null;
    code?: string | null;
    symbol?: string | null;
    name?: string | null;
  } | null;
  currency_id?: number | null;
};
function getInitialCurrencyId(): number | null {
  const u = (auth.user as unknown as LooseUser) || null;
  const id = u?.currency?.id ?? u?.currency_id ?? null;
  return typeof id === 'number' ? id : null;
}
const selectedCurrencyId = ref<number | null>(getInitialCurrencyId());

async function ensureCurrenciesLoaded() {
  if (allCurrencies.value.length) return;
  currencyLoading.value = true;
  try {
    const res = await api.get('/currencies', { params: { order_by: 'name', order_dir: 'asc' } });
    const raw = (res.data?.data || res.data) as Array<{
      id: number;
      name: string;
      symbol?: string;
      code?: string;
    }>;
    const mapped: CurrencyOption[] = (raw || []).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol ?? undefined,
      code: c.code ?? undefined,
      nameLabel: c.symbol ? `${c.name} (${c.symbol})` : c.name,
    }));
    allCurrencies.value = mapped;
    currencyOptions.value = mapped;
    // Prefijar si no hay seleccionado e info en usuario
    if (selectedCurrencyId.value == null) {
      const uid = getInitialCurrencyId();
      selectedCurrencyId.value = typeof uid === 'number' ? uid : null;
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Error cargando monedas' });
  } finally {
    currencyLoading.value = false;
  }
}

function onCurrencyFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    currencyOptions.value = !needle
      ? allCurrencies.value
      : allCurrencies.value.filter(
          (o) =>
            (o.name || '').toLowerCase().includes(needle) ||
            (o.code || '').toLowerCase().includes(needle)
        );
  });
}

onMounted(() => {
  // Cargar monedas al entrar a la pestaña perfil o si ya está activa
  if (tab.value === 'profile') void ensureCurrenciesLoaded();
});
watch(
  () => tab.value,
  (t) => {
    if (t === 'profile') void ensureCurrenciesLoaded();
  }
);

function pickAvatar() {
  fileInput.value?.click();
}

function onFileChange(evt: Event) {
  const target = evt.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  avatarFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      avatarPreview.value = typeof res === 'string' ? res : '';
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.value = null;
  }
}

function resetForm() {
  name.value = auth.user?.name || '';
  email.value = auth.user?.email || '';
  monthlyIncome.value = auth.user?.monthly_income || 0;
  password.value = '';
  passwordConfirm.value = '';
  avatarFile.value = null;
  avatarPreview.value = null;
  selectedCurrencyId.value = getInitialCurrencyId();
}

async function saveProfile() {
  try {
    if (!name.value || !email.value) {
      Notify.create({ type: 'warning', message: 'Nombre y correo son requeridos' });
      return;
    }
    if (password.value && password.value !== passwordConfirm.value) {
      Notify.create({ type: 'warning', message: 'Las contraseñas no coinciden' });
      return;
    }
    saving.value = true;

    // Update profile basic data
    await api.put('/user/profile', {
      name: name.value,
      email: email.value,
      monthly_income: monthlyIncome.value || 0,
      ...(password.value ? { password: password.value } : {}),
      ...(typeof selectedCurrencyId.value === 'number'
        ? { currency_id: selectedCurrencyId.value }
        : {}),
    });

    // Upload avatar if selected
    if (avatarFile.value) {
      const form = new FormData();
      form.append('avatar', avatarFile.value);
      await api.post('/user/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Refresh local auth store (incluye moneda por defecto)
    if (auth.user) {
      auth.user.name = name.value;
      auth.user.email = email.value;
      auth.user.monthly_income = monthlyIncome.value || 0;
      const cid = typeof selectedCurrencyId.value === 'number' ? selectedCurrencyId.value : null;
      if (cid) {
        (auth.user as unknown as LooseUser).currency_id = cid;
        const cur = allCurrencies.value.find((c) => c.id === cid);
        if (cur) {
          (auth.user as unknown as LooseUser).currency = {
            id: cur.id,
            name: cur.name,
            code: cur.code ?? null,
            symbol: cur.symbol ?? null,
          };
        }
      }
      localStorage.setItem('user', JSON.stringify(auth.user));
    }

    Notify.create({ type: 'positive', message: 'Perfil actualizado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al guardar';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
