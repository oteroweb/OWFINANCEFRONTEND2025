<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md text-primary">⚙️ Configuraciones del Usuario</div>

    <q-card flat bordered>
      <q-tabs v-model="tab" dense class="text-primary" align="left" inline-label>
        <q-tab name="profile" icon="person" label="Perfil" />
        <q-tab name="finance" icon="account_balance" label="Finanzas" />
        <q-tab name="categories" icon="category" label="Categorías" />
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
                input-debounce="300"
                label="Moneda"
                outlined
                dense
                @focus="ensureCurrenciesLoaded"
                @filter="onCurrencyFilter"
              >
                <template #prepend>
                  <q-icon name="payments" />
                </template>
              </q-select>
            </q-card>

            <!-- Mis Tasas de Cambio -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm row items-center justify-between">
                <div>
                  <q-icon name="currency_exchange" class="q-mr-sm" />
                  Mis Tasas de Cambio
                </div>
                <q-btn dense flat round icon="add" color="primary" title="Agregar tasa" @click="openRateForm(null)" />
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Cuántas unidades de cada moneda equivalen a <strong>1 USD</strong>. Ej: VES 530 = 530 bolívares por dólar.
              </div>
              <q-skeleton v-if="userRatesLoading" type="rect" height="60px" />
              <div v-else-if="!userRates.length" class="text-caption text-grey-6 q-pa-sm text-center">
                Sin tasas configuradas. Haz clic en <q-icon name="add" size="14px" /> para agregar.
              </div>
              <q-list v-else bordered separator dense class="rounded-borders">
                <q-item v-for="r in userRates" :key="r.id" class="q-py-xs">
                  <q-item-section avatar>
                    <q-chip dense :color="r.is_current ? 'teal' : 'grey-4'" :text-color="r.is_current ? 'white' : 'grey-8'" class="text-weight-bold">
                      {{ r.currency?.code || '?' }}
                    </q-chip>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ r.currency?.name || r.currency?.code }}</q-item-label>
                    <q-item-label caption>Tasa: {{ r.current_rate }} {{ r.currency?.code }}/USD</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-toggle v-model="r.is_current" dense color="teal" title="Activa para conversiones" @update:model-value="(v) => toggleRateCurrent(r, v)" />
                      <q-btn dense flat round icon="edit" color="primary" @click="openRateForm(r)" />
                      <q-btn dense flat round icon="delete" color="negative" @click="deleteRate(r)" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
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

        <q-tab-panel name="categories">
          <div class="q-gutter-md">
            <q-card flat bordered class="q-pa-md bg-purple-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="category" size="48px" color="purple-7" />
                <div>
                  <div class="text-h6 text-purple-9">Gestión de Categorías</div>
                  <div class="text-body2 text-purple-8">
                    Administra tus categorías y organízalas en carpetas jerárquicas para clasificar tus transacciones y cantaros
                  </div>
                </div>
              </div>
            </q-card>

            <q-card flat bordered style="min-height: 500px; height: 600px; display: flex; flex-direction: column;">
              <CategoriesTree
                :readonly="false"
                :nodes="categoriesTreeNodes"
                :category-jar-map="categoryToJarMap"
                ref="categoriesTreeRef"
                style="flex: 1; height: 100%;"
                @create-category="onCreateCategory"
                @create-folder="onCreateCategoryFolder"
                @move-node="onMoveCategoryNode"
                @delete-category="onDeleteCategory"
                @edit-category="onEditCategory"
              />
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="accounts">
          <div class="q-gutter-md">
            <q-card flat bordered class="q-pa-md bg-orange-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="account_balance_wallet" size="48px" color="orange-7" />
                <div>
                  <div class="text-h6 text-orange-9">Gestión de Cuentas</div>
                  <div class="text-body2 text-orange-8">
                    Administra tus cuentas bancarias, tarjetas y otros medios de pago en forma de árbol organizado
                  </div>
                </div>
              </div>
            </q-card>

            <q-card flat bordered style="min-height: 500px;">
              <AccountsTree
                ref="accountsTreeRef"
                :tree="accountsTreeNodes"
                :can-delete-folder="true"
                @create-account="onCreateAccount"
                @create-folder="onCreateAccountFolder"
                @move-node="onMoveAccountNode"
                @reorder-siblings="onReorderAccountFolderSiblings"
                @delete-folder="onDeleteAccountFolder"
                @view-account="onViewAccount"
                @edit-account="onEditAccount"
                @delete-account="onDeleteAccount"
                @rename-folder="onRenameAccountFolder"
                @toggle-global-balance="onToggleAccountGlobalBalance"
              />
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="taxes">
          <CrudPage :dictionary="taxesDictionary" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Rate form dialog -->
    <q-dialog v-model="showRateForm">
      <q-card style="min-width: 320px; max-width: 420px">
        <q-card-section class="text-h6 q-pb-sm">
          <q-icon name="currency_exchange" class="q-mr-sm" />
          {{ rateFormId ? 'Editar Tasa' : 'Nueva Tasa' }}
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <div v-if="rateFormId" class="text-body2 text-grey-8 q-mb-sm">
            <strong>{{ rateFormCurrencyLabel }}</strong>
          </div>
          <q-select
            v-if="!rateFormId"
            v-model="rateForm.currency_id"
            :options="currencyOptions"
            option-value="id"
            option-label="nameLabel"
            emit-value
            map-options
            label="Moneda"
            dense
            outlined
            use-input
            input-debounce="200"
            @focus="ensureCurrenciesLoaded"
            @filter="onCurrencyFilter"
          />
          <q-input
            v-model.number="rateForm.current_rate"
            label="Tasa (unidades por 1 USD)"
            type="number"
            step="0.01"
            min="0.0001"
            dense
            outlined
            autofocus
          >
            <template #hint>Ej: 530 significa 530 VES = 1 USD</template>
          </q-input>
          <q-checkbox v-model="rateForm.is_current" label="Activa para conversiones" dense color="teal" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn color="primary" label="Guardar" :loading="savingRate" @click="saveRate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Account create/edit dialog -->
    <q-dialog v-model="showAccountForm" persistent>
      <q-card style="min-width: 400px; max-width: 480px;">
        <q-card-section>
          <div class="text-h6">{{ acctFormTitle }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="acctForm.name" label="Nombre de la cuenta" dense outlined autofocus />
          <q-select
            v-model="acctForm.account_type_id"
            :options="accountTypeOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Tipo de cuenta"
            dense
            outlined
          />
          <q-select
            v-model="acctForm.currency_id"
            :options="acctCurrencyFilterOptions"
            option-value="id"
            option-label="nameLabel"
            emit-value
            map-options
            label="Moneda"
            dense
            outlined
            use-input
            @filter="onAcctCurrencyFilter"
          />
          <q-select
            v-model="acctForm.folder_id"
            :options="acctFolderOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Carpeta"
            dense
            outlined
          />
          <q-input v-if="acctFormMode === 'create'" v-model.number="acctForm.initial" label="Balance inicial" type="number" dense outlined />
          <q-input v-if="acctFormMode === 'edit'" v-model.number="acctForm.balance" label="Saldo actual" type="number" dense outlined />
          <q-toggle v-if="acctFormMode === 'edit'" v-model="acctForm.active" label="Cuenta activa" />
          <q-toggle v-model="acctForm.include_in_global_balance" color="teal" label="Incluir en balance global">
            <q-tooltip>Si está activo, el saldo de esta cuenta se sumará al balance global configurado</q-tooltip>
          </q-toggle>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            :label="acctFormMode === 'create' ? 'Crear' : 'Guardar'"
            color="primary"
            :disable="!acctForm.name.trim()"
            @click="onSaveAccountForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import CrudPage from 'components/CrudPage.vue';
import CategoriesTree from 'components/CategoriesTree.vue';
import AccountsTree from 'components/AccountsTree.vue';
import { useAuthStore } from 'stores/auth';
import { defaultAvatarUrl } from '../config';
import { dictionary as taxesDictionary } from '../taxes/dictionary';
import { api } from 'boot/axios';
import { Notify, useQuasar } from 'quasar';

defineOptions({ name: 'user_config_page' });

const $q = useQuasar();
const auth = useAuthStore();
const tab = ref<'profile' | 'finance' | 'categories' | 'accounts' | 'taxes'>('profile');

// ----- Tasas de Cambio del Usuario -----
type UserRate = {
  id: number;
  currency_id: number;
  currency?: { id: number; name: string; code: string; symbol?: string };
  current_rate: number;
  is_current: boolean;
  is_official: boolean;
  updated_at?: string;
};
const userRates = ref<UserRate[]>([]);
const userRatesLoading = ref(false);
const showRateForm = ref(false);
const rateFormId = ref<number | null>(null);
const rateFormCurrencyLabel = ref('');
const savingRate = ref(false);
const rateForm = reactive({
  currency_id: null as number | null,
  current_rate: 1,
  is_current: true,
});

async function loadUserRates() {
  userRatesLoading.value = true;
  try {
    const res = await api.get('/user_currencies', { params: { user_id: auth.user?.id, per_page: 100 } });
    const raw = res.data?.data?.data || res.data?.data || res.data || [];
    userRates.value = Array.isArray(raw) ? raw as UserRate[] : [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error cargando tasas' });
  } finally {
    userRatesLoading.value = false;
  }
}

/**
 * Detecta monedas usadas en cuentas del usuario que no tengan tasa configurada
 * y las crea automáticamente con tasa 1 (para que el usuario las corrija).
 */
async function syncAccountCurrencies() {
  if (!auth.user?.id) return;
  try {
    const res = await api.get('/accounts');
    type RawAcct = { currency?: { id?: number; name?: string; code?: string }; currency_id?: number };
    const flat: RawAcct[] = Array.isArray(res.data?.data) ? (res.data.data as RawAcct[]) : [];

    // Recopilar monedas únicas de las cuentas (omitir la moneda base del usuario)
    const defaultCurrId = auth.user?.currency_id;
    const seen = new Set<number>();
    const accountCurrencies: Array<{ id: number; code: string }> = [];
    for (const acc of flat) {
      const cid = acc.currency?.id || acc.currency_id;
      const ccode = acc.currency?.code || '';
      if (!cid || seen.has(cid) || cid === defaultCurrId) continue;
      seen.add(cid);
      accountCurrencies.push({ id: cid, code: ccode });
    }

    // Comparar con las tasas ya configuradas
    const configuredIds = new Set(userRates.value.map((r) => r.currency_id));
    const missing = accountCurrencies.filter((c) => !configuredIds.has(c.id));
    if (!missing.length) return;

    // Crear automáticamente con tasa 1
    for (const curr of missing) {
      await api.post('/user_currencies', {
        user_id: auth.user?.id,
        currency_id: curr.id,
        current_rate: 1,
        is_current: true,
        is_official: false,
      });
    }

    // Recargar lista y notificar
    await loadUserRates();
    await auth.refreshUserCurrencies();
    const names = missing.map((c) => c.code).join(', ');
    Notify.create({
      type: 'info',
      icon: 'info',
      message: `Se detectaron monedas sin tasa configurada: ${names}. Se crearon con valor 1. Por favor, actualiza las tasas reales.`,
      multiLine: true,
      timeout: 7000,
    });
  } catch {
    // Silencioso — no interrumpir el flujo normal
  }
}

function openRateForm(rate: UserRate | null) {
  if (rate) {
    rateFormId.value = rate.id;
    rateFormCurrencyLabel.value = rate.currency
      ? `${rate.currency.name} (${rate.currency.code})`
      : String(rate.currency_id);
    rateForm.currency_id = rate.currency_id;
    rateForm.current_rate = rate.current_rate;
    rateForm.is_current = rate.is_current;
  } else {
    rateFormId.value = null;
    rateFormCurrencyLabel.value = '';
    rateForm.currency_id = null;
    rateForm.current_rate = 1;
    rateForm.is_current = true;
  }
  void ensureCurrenciesLoaded();
  showRateForm.value = true;
}

async function saveRate() {
  if (!rateFormId.value && !rateForm.currency_id) {
    Notify.create({ type: 'warning', message: 'Selecciona una moneda' });
    return;
  }
  if (!rateForm.current_rate || rateForm.current_rate <= 0) {
    Notify.create({ type: 'warning', message: 'La tasa debe ser mayor a 0' });
    return;
  }
  savingRate.value = true;
  try {
    if (rateFormId.value) {
      await api.put(`/user_currencies/${rateFormId.value}`, {
        current_rate: rateForm.current_rate,
        is_current: rateForm.is_current,
      });
    } else {
      await api.post('/user_currencies', {
        user_id: auth.user?.id,
        currency_id: rateForm.currency_id,
        current_rate: rateForm.current_rate,
        is_current: rateForm.is_current,
        is_official: false,
      });
    }
    showRateForm.value = false;
    await loadUserRates();
    await auth.refreshUserCurrencies();
    Notify.create({ type: 'positive', message: 'Tasa guardada' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error guardando tasa' });
  } finally {
    savingRate.value = false;
  }
}

async function toggleRateCurrent(rate: UserRate, value: boolean) {
  try {
    await api.put(`/user_currencies/${rate.id}`, { is_current: value });
    await auth.refreshUserCurrencies();
  } catch {
    rate.is_current = !value; // revert
    Notify.create({ type: 'negative', message: 'Error actualizando tasa' });
  }
}

function deleteRate(rate: UserRate) {
  $q.dialog({
    title: 'Eliminar tasa',
    message: `¿Eliminar la tasa de ${rate.currency?.code || rate.currency_id}?`,
    cancel: true,
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/user_currencies/${rate.id}`);
        await loadUserRates();
        await auth.refreshUserCurrencies();
        Notify.create({ type: 'positive', message: 'Tasa eliminada' });
      } catch {
        Notify.create({ type: 'negative', message: 'Error eliminando tasa' });
      }
    })();
  });
}

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

// ----- Categories Tree -----
type CategoryNode = {
  id: number | string;
  label: string;
  is_folder: boolean;
  children?: CategoryNode[];
  [key: string]: unknown;
};

type Jar = {
  id: number;
  name: string;
  categories?: { id: string | number; name: string }[];
};

const categoriesTreeNodes = ref<CategoryNode[]>([]);
const categoriesTreeRef = ref<InstanceType<typeof CategoriesTree> | null>(null);
const jars = ref<Jar[]>([]);
const categoryToJarMap = ref<Record<string | number, string>>({});

async function loadJars() {
  try {
    console.log('🔄 Iniciando carga de jars...');
    const res = await api.get('/jars', { params: { per_page: 100 } });
    console.log('📦 Respuesta de /jars:', res.data);
    const rawJars = res.data?.data || res.data || [];
    jars.value = rawJars;

    // Crear mapa de categoría a jar
    const map: Record<string | number, string> = {};
    for (const jar of rawJars) {
      console.log('🏺 Procesando jar:', jar.name, 'categorías:', jar.categories);
      if (jar.categories && Array.isArray(jar.categories)) {
        for (const cat of jar.categories) {
          map[cat.id] = jar.name;
        }
      }
    }
    categoryToJarMap.value = map;
    console.log('✅ Jars cargados:', rawJars.length, 'jars. Mapa de categorías:', map);
  } catch (e) {
    console.error('❌ Error loading jars:', e);
    Notify.create({ type: 'negative', message: 'Error cargando cántaros' });
  }
}

async function loadCategoriesTree() {
  try {
    const res = await api.get('/categories/tree');
    const rawNodes = res.data?.data?.nodes || res.data?.nodes || res.data?.data || res.data || [];
    console.log('📊 Categorías cargadas:', rawNodes);
    categoriesTreeNodes.value = rawNodes;
  } catch (e) {
    console.error('Error loading categories tree:', e);
    Notify.create({ type: 'negative', message: 'Error cargando categorías' });
  }
}

// ----- Category event handlers -----
function onCreateCategory(payload: { parent_id: string }) {
  $q.dialog({
    title: 'Nueva categoría',
    message: 'Nombre de la categoría:',
    prompt: { model: '', type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((catName: string) => {
    const parentId = payload.parent_id && payload.parent_id !== 'root' ? payload.parent_id : null;
    void api.post('/categories', {
      name: catName.trim(),
      parent_id: parentId,
      type: 'category',
    }).then((res) => {
      const cat = res.data?.data;
      if (cat?.id) {
        categoriesTreeRef.value?.addCategoryToParent(
          { id: String(cat.id), label: cat.name, type: 'category', icon: cat.icon || null },
          parentId ? String(parentId) : 'root',
        );
        Notify.create({ type: 'positive', message: `Categoría "${catName}" creada` });
      }
    }).catch((e) => {
      console.error('Error creating category:', e);
      Notify.create({ type: 'negative', message: 'Error creando categoría' });
    });
  });
}

function onCreateCategoryFolder(payload: { parent_id: string }) {
  $q.dialog({
    title: 'Nueva carpeta de categorías',
    message: 'Nombre de la carpeta:',
    prompt: { model: '', type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((folderName: string) => {
    const parentId = payload.parent_id && payload.parent_id !== 'root' ? payload.parent_id : null;
    void api.post('/categories', {
      name: folderName.trim(),
      parent_id: parentId,
      type: 'folder',
    }).then((res) => {
      const cat = res.data?.data;
      if (cat?.id) {
        categoriesTreeRef.value?.addCategoryToParent(
          { id: String(cat.id), label: cat.name, type: 'folder' },
          parentId ? String(parentId) : 'root',
        );
        Notify.create({ type: 'positive', message: `Carpeta "${folderName}" creada` });
      }
    }).catch((e) => {
      console.error('Error creating category folder:', e);
      Notify.create({ type: 'negative', message: 'Error creando carpeta de categorías' });
    });
  });
}

async function onMoveCategoryNode(payload: { node_id: string; new_parent_id: string }) {
  try {
    const parentId = payload.new_parent_id === 'root' ? null : payload.new_parent_id;
    await api.patch(`/categories/${payload.node_id}/move`, { parent_id: parentId });
    Notify.create({ type: 'positive', message: 'Categoría movida' });
  } catch (e) {
    console.error('Error moving category:', e);
    Notify.create({ type: 'negative', message: 'Error al mover categoría' });
    void loadCategoriesTree();
  }
}

function onDeleteCategory(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Eliminar categoría',
    message: `¿Eliminar "${payload.label}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void api.delete(`/categories/${payload.id}`).then(() => {
      categoriesTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: `"${payload.label}" eliminada` });
    }).catch((e) => {
      console.error('Error deleting category:', e);
      Notify.create({ type: 'negative', message: 'Error eliminando categoría' });
    });
  });
}

function onEditCategory(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Editar categoría',
    message: 'Nuevo nombre:',
    prompt: { model: payload.label, type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((newName: string) => {
    void api.put(`/categories/${payload.id}`, { name: newName.trim() }).then(() => {
      categoriesTreeRef.value?.updateNodeLabel(payload.id, newName.trim());
      Notify.create({ type: 'positive', message: 'Categoría actualizada' });
    }).catch((e) => {
      console.error('Error updating category:', e);
      Notify.create({ type: 'negative', message: 'Error actualizando categoría' });
    });
  });
}

// ----- Accounts Tree -----
type AccountNode = {
  id: number | string;
  label: string;
  is_folder: boolean;
  children?: AccountNode[];
  [key: string]: unknown;
};

const accountsTreeNodes = ref<AccountNode[]>([]);
const accountsTreeRef = ref<InstanceType<typeof AccountsTree> | null>(null);

async function loadAccountsTree() {
  try {
    // Parallel: tree structure + flat list with balances
    const [treeRes, listRes] = await Promise.all([
      api.get('/accounts/tree'),
      api.get('/accounts'),
    ]);
    const rawNodes = treeRes.data?.data?.nodes || treeRes.data?.nodes || treeRes.data?.data || treeRes.data || [];

    // Build id → { balance, currency_symbol, currency_code, include_in_global_balance } map from flat list
    type AcctInfo = { id: number | string; balance?: number | string | null; currency?: { symbol?: string; code?: string }; include_in_global_balance?: boolean };
    const flatList: AcctInfo[] = Array.isArray(listRes.data?.data) ? (listRes.data.data as AcctInfo[]) : [];
    const balanceMap = new Map<string, { balance: number; currency_symbol: string; currency_code: string; include_in_global_balance: boolean }>();
    for (const a of flatList) {
      balanceMap.set(String(a.id), {
        balance: Number(a.balance ?? 0),
        currency_symbol: a.currency?.symbol ?? '$',
        currency_code: a.currency?.code ?? '',
        include_in_global_balance: a.include_in_global_balance !== false,
      });
    }

    // Recursively merge balance info into tree nodes
    type RawNode = { id: number | string; label?: string; type?: string; balance?: number | string; currency_symbol?: string; currency_code?: string; include_in_global_balance?: boolean; children?: RawNode[] };
    function mergeBalances(nodes: RawNode[]): RawNode[] {
      return nodes.map((n) => {
        const info = n.type === 'account' ? balanceMap.get(String(n.id)) : undefined;
        return {
          ...n,
          ...(info !== undefined ? { balance: info.balance, currency_symbol: info.currency_symbol, currency_code: info.currency_code, include_in_global_balance: info.include_in_global_balance } : {}),
          children: n.children ? mergeBalances(n.children) : [],
        };
      });
    }

    console.log('💳 Cuentas cargadas:', rawNodes);
    accountsTreeNodes.value = mergeBalances(rawNodes as RawNode[]) as unknown as AccountNode[];
  } catch (e) {
    console.error('Error loading accounts tree:', e);
    Notify.create({ type: 'negative', message: 'Error cargando cuentas' });
  }
}

async function onCreateAccountFolder(payload: { name: string; parent_id: string | null }) {
  try {
    const parentId = payload.parent_id && payload.parent_id !== 'root' ? payload.parent_id : null;
    const res = await api.post('/accounts/folders', { name: payload.name, parent_id: parentId });
    const folder = res.data?.data;
    if (folder?.id) {
      const newNode: AccountNode = {
        id: String(folder.id),
        label: payload.name,
        is_folder: true,
        type: 'folder',
        children: [],
      };
      // Actualizar árbol visual
      accountsTreeRef.value?.addFolderToParent(
        { id: String(folder.id), label: payload.name },
        parentId ? String(parentId) : null,
      );
      // Actualizar accountsTreeNodes para que acctFolderOptions se refresque inmediatamente
      if (!parentId) {
        accountsTreeNodes.value = [...accountsTreeNodes.value, newNode];
      } else {
        function insertIntoTree(nodes: AccountNode[]): boolean {
          for (const n of nodes) {
            if (String(n.id) === String(parentId)) {
              n.children = [...(n.children ?? []), newNode];
              return true;
            }
            if (n.children && insertIntoTree(n.children)) return true;
          }
          return false;
        }
        const updated = [...accountsTreeNodes.value];
        insertIntoTree(updated);
        accountsTreeNodes.value = updated;
      }
      Notify.create({ type: 'positive', message: `Carpeta "${payload.name}" creada` });
    }
  } catch (e) {
    console.error('Error creating account folder:', e);
    Notify.create({ type: 'negative', message: 'Error creando carpeta' });
  }
}

async function onReorderAccountFolderSiblings(payload: {
  parent_id: string;
  siblings: { id: string; sort_order: number; node_type: string }[];
}) {
  const folderItems = payload.siblings
    .filter((s) => s.node_type === 'folder' && s.id !== 'root')
    .map((s) => ({ id: s.id, sort_order: s.sort_order }));
  const accountItems = payload.siblings
    .filter((s) => s.node_type === 'account')
    .map((s) => ({ id: s.id, sort_order: s.sort_order }));
  try {
    const calls: Promise<unknown>[] = [];
    if (folderItems.length) calls.push(api.post('/accounts/folders/batch-sort', { items: folderItems }));
    if (accountItems.length) calls.push(api.post('/accounts/batch-sort', { items: accountItems }));
    await Promise.all(calls);
  } catch (e) {
    console.error('Error batch-sorting:', e);
  }
}

async function onMoveAccountNode(payload: { node_id: string; new_parent_id: string; node_type: string; sort_order: number }) {
  try {
    if (payload.node_type === 'account') {
      const folderId = payload.new_parent_id === 'root' ? null : payload.new_parent_id;
      await api.patch(`/accounts/${payload.node_id}/move`, {
        folder_id: folderId,
        sort_order: payload.sort_order,
      });
    } else {
      const parentId = payload.new_parent_id === 'root' ? null : payload.new_parent_id;
      await api.patch(`/accounts/folders/${payload.node_id}/move`, {
        parent_id: parentId,
      });
    }
    Notify.create({ type: 'positive', message: 'Movido correctamente' });
  } catch (e) {
    console.error('Error moving node:', e);
    Notify.create({ type: 'negative', message: 'Error al mover' });
    void loadAccountsTree();
  }
}

function onDeleteAccountFolder(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Eliminar carpeta',
    message: `¿Eliminar la carpeta "${payload.label}"? Las cuentas dentro pasarán a "Sin asignar".`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void api.delete(`/accounts/folders/${payload.id}`).then(() => {
      accountsTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: `Carpeta "${payload.label}" eliminada` });
      void loadAccountsTree();
    }).catch((e) => {
      console.error('Error deleting folder:', e);
      Notify.create({ type: 'negative', message: 'Error eliminando carpeta' });
    });
  });
}

// Find which folder an account belongs to by traversing the tree
function findAccountFolderInTree(accountId: string): string | null {
  function walk(nodes: AccountNode[]): string | null | undefined {
    for (const n of nodes) {
      const isFolder = n.is_folder || (n as Record<string, unknown>).type === 'folder';
      if (isFolder && n.children) {
        for (const child of n.children) {
          const isChildAccount = !child.is_folder && (child as Record<string, unknown>).type !== 'folder';
          if (isChildAccount && String(child.id) === accountId) {
            const fid = String(n.id);
            return fid === 'root' ? null : fid;
          }
        }
        const deeper = walk(n.children);
        if (deeper !== undefined) return deeper;
      }
    }
    return undefined;
  }
  return walk(accountsTreeNodes.value) ?? null;
}

function onCreateAccount() {
  void ensureAccountFormDataLoaded().then(() => {
    acctForm.name = '';
    acctForm.currency_id = 1;
    acctForm.account_type_id = 1;
    acctForm.initial = 0;
    acctForm.balance = 0;
    acctForm._originalBalance = 0;
    acctForm.folder_id = null;
    acctForm._originalFolderId = null;
    acctForm.active = true;
    acctForm.include_in_global_balance = true;
    acctFormMode.value = 'create';
    acctFormEditId.value = null;
    acctFormTitle.value = 'Nueva cuenta';
    showAccountForm.value = true;
  });
}

function onViewAccount(payload: { id: string; label: string }) {
  onEditAccount(payload);
}

function onEditAccount(payload: { id: string; label: string }) {
  void ensureAccountFormDataLoaded().then(() => {
    void api.get(`/accounts/${payload.id}`).then((res) => {
      const acct = res.data?.data;
      if (!acct) return;
      acctForm.name = acct.name || '';
      acctForm.currency_id = acct.currency_id;
      acctForm.account_type_id = acct.account_type_id;
      acctForm.initial = parseFloat(acct.initial) || 0;
      acctForm.balance = parseFloat(acct.balance) || 0;
      acctForm._originalBalance = parseFloat(acct.balance) || 0;
      acctForm.active = !!acct.active;
      acctForm.include_in_global_balance = acct.include_in_global_balance !== false;
      // Determine current folder from tree data
      const currentFolderId = findAccountFolderInTree(String(payload.id));
      acctForm.folder_id = currentFolderId;
      acctForm._originalFolderId = currentFolderId;
      acctFormMode.value = 'edit';
      acctFormEditId.value = payload.id;
      acctFormTitle.value = `Editar: ${acct.name}`;
      showAccountForm.value = true;
    });
  });
}

function onDeleteAccount(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Eliminar cuenta',
    message: `¿Estás seguro de eliminar la cuenta "${payload.label}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' },
  }).onOk(() => {
    void api.delete(`/accounts/${payload.id}`).then(() => {
      accountsTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: `Cuenta "${payload.label}" eliminada` });
    }).catch((e) => {
      console.error('Error deleting account:', e);
      Notify.create({ type: 'negative', message: 'Error eliminando cuenta' });
    });
  });
}

function onRenameAccountFolder(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Renombrar carpeta',
    message: 'Nuevo nombre:',
    prompt: { model: payload.label, type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((newName: string) => {
    void api.put(`/accounts/folders/${payload.id}`, { name: newName.trim() }).then(() => {
      accountsTreeRef.value?.updateNodeLabel(payload.id, newName.trim());
      Notify.create({ type: 'positive', message: `Carpeta renombrada a "${newName.trim()}"` });
    }).catch((e) => {
      console.error('Error renaming folder:', e);
      Notify.create({ type: 'negative', message: 'Error renombrando carpeta' });
    });
  });
}

function onToggleAccountGlobalBalance(payload: { id: string; newValue: boolean }) {
  void api.put(`/accounts/${payload.id}`, {
    include_in_global_balance: payload.newValue,
  }).then(() => {
    accountsTreeRef.value?.updateNodeGlobalBalance(payload.id, payload.newValue);
    const msg = payload.newValue ? 'Cuenta incluida en balance global' : 'Cuenta excluida del balance global';
    Notify.create({ type: 'positive', message: msg });
  }).catch((e) => {
    console.error('Error toggling global balance:', e);
    Notify.create({ type: 'negative', message: 'Error actualizando balance global' });
  });
}

// ----- Account form dialog state -----
type AccountTypeOption = { id: number; name: string };
const accountTypeOptions = ref<AccountTypeOption[]>([]);
const showAccountForm = ref(false);
const acctFormMode = ref<'create' | 'edit'>('create');
const acctFormEditId = ref<string | null>(null);
const acctFormTitle = ref('Nueva cuenta');
const acctForm = reactive({
  name: '',
  currency_id: 1,
  account_type_id: 1,
  initial: 0,
  balance: 0,
  _originalBalance: 0,
  folder_id: null as string | null,
  _originalFolderId: null as string | null,
  active: true,
  include_in_global_balance: true,
});
const acctCurrencyFilterOptions = ref<CurrencyOption[]>([]);

type FolderOption = { id: string | null; name: string };
const acctFolderOptions = computed<FolderOption[]>(() => {
  const opts: FolderOption[] = [{ id: null, name: 'Sin asignar' }];
  function walk(nodes: AccountNode[]) {
    for (const n of nodes) {
      if (n.is_folder || (n as Record<string, unknown>).type === 'folder') {
        const nid = String(n.id);
        if (nid !== 'root') opts.push({ id: nid, name: String(n.label) });
      }
      if (n.children) walk(n.children);
    }
  }
  walk(accountsTreeNodes.value);
  return opts;
});

async function ensureAccountFormDataLoaded() {
  await ensureCurrenciesLoaded();
  acctCurrencyFilterOptions.value = [...allCurrencies.value];
  if (!accountTypeOptions.value.length) {
    try {
      const res = await api.get('/account_types/active');
      const raw = (res.data?.data || res.data) as AccountTypeOption[];
      accountTypeOptions.value = (raw || []).map((t) => ({ id: t.id, name: t.name }));
    } catch {
      Notify.create({ type: 'negative', message: 'Error cargando tipos de cuenta' });
    }
  }
}

function onAcctCurrencyFilter(val: string, update: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  update(() => {
    acctCurrencyFilterOptions.value = !needle
      ? [...allCurrencies.value]
      : allCurrencies.value.filter(
          (o) =>
            (o.name || '').toLowerCase().includes(needle) ||
            (o.code || '').toLowerCase().includes(needle)
        );
  });
}

function onSaveAccountForm() {
  if (!acctForm.name.trim()) return;
  showAccountForm.value = false;
  if (acctFormMode.value === 'create') {
    void api.post('/accounts', {
      name: acctForm.name.trim(),
      currency_id: acctForm.currency_id,
      initial: acctForm.initial,
      account_type_id: acctForm.account_type_id,
      folder_id: acctForm.folder_id || null,
      include_in_global_balance: acctForm.include_in_global_balance,
    }).then((res) => {
      const account = res.data?.data;
      if (account?.id) {
        Notify.create({ type: 'positive', message: `Cuenta "${acctForm.name}" creada` });
        void loadAccountsTree();
      }
    }).catch((e) => {
      console.error('Error creating account:', e);
      Notify.create({ type: 'negative', message: 'Error creando cuenta' });
    });
  } else if (acctFormEditId.value) {
    const editId = acctFormEditId.value;
    const editName = acctForm.name.trim();
    const balanceChanged = Math.abs(acctForm.balance - acctForm._originalBalance) >= 0.01;
    const folderChanged = acctForm.folder_id !== acctForm._originalFolderId;
    // 1) Update account metadata (name, type, currency, active)
    void api.put(`/accounts/${editId}`, {
      name: editName,
      currency_id: acctForm.currency_id,
      account_type_id: acctForm.account_type_id,
      active: acctForm.active,
      include_in_global_balance: acctForm.include_in_global_balance,
    }).then(() => {
      accountsTreeRef.value?.updateNodeLabel(editId, editName);
      const promises: Promise<unknown>[] = [];
      // 2) If balance changed, adjust via dedicated endpoint
      if (balanceChanged) {
        promises.push(api.post(`/accounts/${editId}/adjust-balance`, {
          target_balance: acctForm.balance,
          description: 'Ajuste manual desde configuración',
        }));
      }
      // 3) If folder changed, move account to new folder
      if (folderChanged) {
        promises.push(api.patch(`/accounts/${editId}/move`, {
          folder_id: acctForm.folder_id || null,
        }));
      }
      return promises.length ? Promise.all(promises) : undefined;
    }).then(() => {
      Notify.create({ type: 'positive', message: `Cuenta "${editName}" actualizada` });
      if (folderChanged || balanceChanged) void loadAccountsTree();
    }).catch((e) => {
      console.error('Error updating account:', e);
      Notify.create({ type: 'negative', message: 'Error actualizando cuenta' });
    });
  }
}

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

async function loadFinanceTab() {
  void ensureCurrenciesLoaded();
  await loadUserRates();
  void syncAccountCurrencies();
}

onMounted(async () => {
  // Cargar monedas al entrar a la pestaña perfil o si ya está activa
  if (tab.value === 'profile') void ensureCurrenciesLoaded();
  if (tab.value === 'finance') void loadFinanceTab();
  if (tab.value === 'categories') {
    await loadJars();
    await loadCategoriesTree();
  }
  if (tab.value === 'accounts') void loadAccountsTree();
});
watch(
  () => tab.value,
  async (t) => {
    if (t === 'profile') void ensureCurrenciesLoaded();
    if (t === 'finance') void loadFinanceTab();
    if (t === 'categories') {
      await loadJars();
      await loadCategoriesTree();
    }
    if (t === 'accounts') void loadAccountsTree();
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
