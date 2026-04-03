<template>
  <q-page :class="transactionsPageClasses">
    <div class="row q-col-gutter-lg items-start">
      <div :class="sidebarColumnClasses">
        <q-card flat class="glass-panel transactions-lite__sidebar-card">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="text-overline transactions-lite__eyebrow">Contexto</div>
              <div class="text-subtitle1 text-weight-bold">{{ contextPanelTitle }}</div>
            </div>
            <q-chip dense color="blue-1" text-color="primary" class="text-weight-medium">
              {{ selectedAccountsLabel }}
            </q-chip>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-caption text-grey-7 transactions-lite__sidebar-copy q-mb-md">
              {{ contextPanelCopy }}
            </div>
            <div :class="sidebarWidgetClasses">
              <AccountsSidebarWidget />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div :class="mainColumnClasses">
        <q-card flat class="glass-panel transactions-lite__hero-card">
          <q-card-section class="transactions-lite__hero-section">
            <div class="transactions-lite__hero-copy">
              <div class="row items-center q-col-gutter-sm transactions-lite__hero-heading">
                <div class="col-auto">
                  <div class="text-overline transactions-lite__eyebrow">{{ heroEyebrow }}</div>
                </div>
                <div class="col-auto">
                  <q-chip dense color="white" text-color="primary" class="transactions-lite__mode-chip">
                    {{ activeLayoutModeOption.label }}
                  </q-chip>
                </div>
              </div>
              <div class="text-h4 text-weight-bold">{{ heroTitle }}</div>
              <div class="text-body2 text-grey-7 transactions-lite__hero-text">
                {{ transactionsHeroText }}
              </div>
              <div class="row q-col-gutter-sm q-mt-md transactions-lite__hero-stats">
                <div
                  v-for="stat in heroStats"
                  :key="stat.key"
                  :class="heroStatColumnClasses"
                >
                  <div class="transactions-lite__hero-stat shell-surface shell-surface--subtle">
                    <div class="text-caption text-grey-7">{{ stat.label }}</div>
                    <div
                      class="text-h6 text-weight-bold"
                      :class="{
                        'text-positive': stat.tone === 'positive',
                        'text-negative': stat.tone === 'negative',
                      }"
                    >
                      {{ stat.value }}
                    </div>
                    <div class="text-caption text-grey-7">{{ stat.caption }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="transactions-lite__hero-actions">
              <q-btn
                color="primary"
                icon="add"
                label="Agregar movimiento"
                class="transactions-lite__primary-cta"
                @click="openNewFab"
              />
              <div class="transactions-lite__action-grid">
                <q-btn
                  unelevated
                  color="white"
                  text-color="positive"
                  icon="trending_up"
                  label="Ingreso"
                  @click="ui.openNewTransactionDialog('income')"
                />
                <q-btn
                  unelevated
                  color="white"
                  text-color="negative"
                  icon="trending_down"
                  label="Egreso"
                  @click="ui.openNewTransactionDialog('expense')"
                />
                <q-btn
                  unelevated
                  color="white"
                  text-color="primary"
                  icon="swap_horiz"
                  label="Transferencia"
                  @click="ui.openNewTransactionDialog('transfer')"
                />
                <q-btn
                  outline
                  color="primary"
                  icon="upload_file"
                  label="Carga masiva"
                  @click="showBulkImport = true"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md q-mt-md">
          <div :class="filtersColumnClasses">
            <q-card flat class="glass-panel transactions-lite__filters-card">
              <q-card-section class="row items-start justify-between q-col-gutter-md q-pb-sm">
                <div class="col-12 col-md">
                  <div class="text-subtitle1 text-weight-bold">{{ filtersPanelTitle }}</div>
                  <div class="text-caption text-grey-7">
                    {{ filtersPanelDescription }}
                  </div>
                </div>
                <div class="col-12 col-md-auto row q-gutter-sm transactions-lite__top-actions">
                  <q-btn
                    flat
                    color="primary"
                    icon="tune"
                    label="Ajustar saldo"
                    :disable="!singleAccountSelected"
                    @click="openAdjustTop"
                  />
                  <q-btn
                    flat
                    color="secondary"
                    icon="autorenew"
                    label="Recalcular"
                    :disable="!singleAccountSelected"
                    @click="recalcSingleAccountTop"
                  />
                  <q-btn
                    flat
                    color="secondary"
                    icon="filter_alt_off"
                    label="Limpiar"
                    @click="clearFilters"
                  />
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-md items-start">
                  <div class="col-12 col-md-7">
                    <div class="text-caption q-mb-xs">{{ dictionary.finderLabel }}</div>
                    <q-input
                      v-model="filters.search"
                      dense
                      filled
                      debounce="300"
                      class="full-width"
                      :placeholder="dictionary.finderLabel + ' por concepto, cuenta o tipo'"
                    >
                      <template #append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-5">
                    <div class="text-caption q-mb-xs">Acciones de tabla</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6">
                        <q-btn
                          outline
                          color="primary"
                          icon="download"
                          label="Exportar"
                          class="full-width"
                          :disable="!rows.length"
                          @click="exportCSV"
                        />
                      </div>
                      <div class="col-6">
                        <q-btn
                          outline
                          color="negative"
                          icon="delete_sweep"
                          label="Eliminar"
                          class="full-width"
                          :disable="selectedRows.length === 0"
                          @click="removeSelectedRows"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="activeFilterChips.length" class="q-mt-md">
                  <div class="text-caption text-grey-7 q-mb-xs">Filtros activos</div>
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12">
                      <q-chip
                        v-for="chip in activeFilterChips"
                        :key="chip.key"
                        removable
                        color="blue-1"
                        text-color="primary"
                        class="transactions-lite__filter-chip"
                        @remove="removeFilterChip(chip.key)"
                      >
                        {{ chip.label }}: {{ chip.value }}
                      </q-chip>
                    </div>
                  </div>
                </div>

                <div v-if="categorySpendTags.length" class="q-mt-md">
                  <div class="text-caption text-grey-7 q-mb-xs">Categorias del periodo</div>
                  <div class="transactions-lite__category-row">
                    <q-chip
                      clickable
                      class="category-chip"
                      :style="allCategoryChipStyle"
                      @click="clearCategoryTagFilter"
                    >
                      Todas
                    </q-chip>
                    <q-chip
                      v-for="tag in categorySpendTags"
                      :key="tag.key"
                      clickable
                      class="category-chip"
                      :style="categoryChipStyle(tag)"
                      @click="applyCategoryTagFilter(tag.id)"
                    >
                      {{ tag.name }}: {{ formatMoney(tag.total) }}
                    </q-chip>
                  </div>
                </div>

                <q-expansion-item
                  v-model="filtersExpanded"
                  dense
                  dense-toggle
                  expand-separator
                  icon="tune"
                  label="Filtros avanzados y columnas"
                  header-class="transactions-lite__expansion-header"
                  class="q-mt-md"
                >
                  <div class="q-pt-md">
                    <div class="row q-col-gutter-md items-start">
                      <div
                        v-for="field in dictionary.forms_filter"
                        :key="field.id"
                        :class="`col-12 col-md-${field.col || 12}`"
                      >
                        <component
                          :is="selectComponent(field.type)"
                          v-model="filters[field.vmodel]"
                          class="full-width"
                          v-bind="fieldProps(field)"
                        />
                      </div>
                      <div class="col-12">
                        <q-select
                          v-model="visibleColumnNames"
                          :options="columnVisibilityOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          multiple
                          use-chips
                          dense
                          outlined
                          label="Columnas visibles"
                          class="full-width"
                        />
                      </div>
                    </div>
                  </div>
                </q-expansion-item>
              </q-card-section>
            </q-card>

            <q-card
              v-if="showCompactWorkspaceStrip"
              flat
              class="glass-panel transactions-lite__compact-workspace-card q-mt-md"
            >
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle2 text-weight-bold">Workspace rapido</div>
                <div class="text-caption text-grey-7">
                  El modo Lite condensa el panel secundario en una franja de decision corta.
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="item in compactWorkspaceItems"
                    :key="item.label"
                    class="col-12 col-sm-4"
                  >
                    <div class="transactions-lite__compact-workspace-item shell-surface shell-surface--subtle">
                      <div class="text-caption text-grey-7">{{ item.label }}</div>
                      <div class="text-body1 text-weight-medium">{{ item.value }}</div>
                      <div class="text-caption text-grey-7 q-mt-xs">{{ item.caption }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div v-if="showSecondaryFocusCard" :class="focusColumnClasses">
            <q-card flat class="glass-panel transactions-lite__focus-card full-height">
              <q-card-section class="q-pb-sm">
                <div class="text-subtitle1 text-weight-bold">{{ secondaryPanelTitle }}</div>
                <div class="text-caption text-grey-7">
                  {{ secondaryPanelDescription }}
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none column q-gutter-sm">
                <div class="transactions-lite__focus-item shell-surface shell-surface--subtle">
                  <div class="text-caption text-grey-7">Seleccion</div>
                  <div class="text-body1 text-weight-medium">
                    {{ selectedRows.length ? `${selectedRows.length} filas marcadas` : 'Sin seleccion' }}
                  </div>
                </div>

                <div class="transactions-lite__focus-item shell-surface shell-surface--subtle">
                  <div class="text-caption text-grey-7">Cuenta activa</div>
                  <div class="text-body1 text-weight-medium">{{ selectedAccountDetail }}</div>
                  <div
                    v-if="showRunningBalanceColumn && singleAccountBalance != null"
                    class="text-caption text-grey-7 q-mt-xs"
                  >
                    {{ formatSingleAccountBalanceMain() }}
                  </div>
                  <div
                    v-if="showRunningBalanceColumn && showSecondaryUsdBalance"
                    class="text-caption text-grey-7"
                  >
                    {{ formatSingleAccountBalanceConversionLine() }}
                  </div>
                </div>

                <div class="transactions-lite__focus-item shell-surface shell-surface--subtle">
                  <div class="text-caption text-grey-7">Periodo</div>
                  <div class="text-body1 text-weight-medium">{{ periodStore.label }}</div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    {{ activeFilterChips.length }} filtro(s) activos
                  </div>
                </div>

                <div class="transactions-lite__focus-item shell-surface shell-surface--subtle">
                  <div class="text-caption text-grey-7">Impuesto visible</div>
                  <div class="text-body1 text-weight-medium">{{ formatMoney(summary.impuestos) }}</div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    {{ effectiveVisibleColumnNames.length - 1 }} columnas visibles
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card flat class="glass-panel transactions-lite__table-card q-mt-md">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div>
              <div class="text-subtitle1 text-weight-bold">Lista de movimientos</div>
              <div class="text-caption text-grey-7">
                {{ tablePanelDescription }}
              </div>
            </div>
            <q-chip dense color="grey-2" text-color="dark" class="text-weight-medium">
              {{ rows.length }} en pantalla
            </q-chip>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-table
          :columns="columns"
          :rows="rows"
          :visible-columns="effectiveVisibleColumnNames"
          :loading="loading"
          row-key="id"
          selection="multiple"
          v-model:selected="selectedRows"
          :dense="isLiteLayout"
          flat
          bordered
          class="shadow-1"
          v-model:pagination="pagination"
          @request="onRequest"
            >
          <!--
            Fila ancla superior:
            - Ascendente (oldest→newest): "Saldo anterior" = preListBalance
            - Descendente (newest→oldest): "Saldo actual"  = singleAccountBalance
          -->
          <template
            v-if="showRunningBalanceColumn && (pagination.descending ? singleAccountBalance != null : preListBalance != null)"
            v-slot:top-row="{ cols }"
          >
            <tr :class="pagination.descending ? 'current-balance-row' : 'initial-balance-row'">
              <td
                v-for="col in cols"
                :key="col.name"
                :class="col.align === 'right' ? 'text-right' : 'text-left'"
                style="padding: 4px 8px"
              >
                <template v-if="col.name === 'name'">
                  <span class="text-caption text-grey-7" style="font-style: italic">
                    <q-icon :name="pagination.descending ? 'account_balance' : 'flag'" size="13px" class="q-mr-xs" />
                    {{ pagination.descending ? 'Saldo actual' : 'Saldo anterior' }}
                  </span>
                </template>
                <template v-else-if="col.name === 'running_balance'">
                  <template v-if="pagination.descending && singleAccountBalance != null">
                    <span class="text-weight-bold" :class="singleAccountBalance >= 0 ? 'text-teal-8' : 'text-red-8'">
                      {{ formatWithCodeSuffix(singleAccountCurrencyCode, singleAccountBalance) }}
                    </span>
                  </template>
                  <template v-else-if="!pagination.descending && preListBalance != null">
                    <span class="text-weight-bold" :class="preListBalance >= 0 ? 'text-teal-8' : 'text-red-8'">
                      {{ formatWithCodeSuffix(singleAccountCurrencyCode, preListBalance) }}
                    </span>
                  </template>
                </template>
                <template v-else>
                  <span />
                </template>
              </td>
            </tr>
          </template>
          <!--
            Fila ancla inferior:
            - Ascendente (oldest→newest): "Saldo actual"  = singleAccountBalance
            - Descendente (newest→oldest): "Saldo anterior" = preListBalance
          -->
          <template
            v-if="showRunningBalanceColumn && (pagination.descending ? preListBalance != null : singleAccountBalance != null)"
            v-slot:bottom-row="{ cols }"
          >
            <tr :class="pagination.descending ? 'initial-balance-row' : 'current-balance-row'">
              <td
                v-for="col in cols"
                :key="col.name"
                :class="col.align === 'right' ? 'text-right' : 'text-left'"
                style="padding: 4px 8px"
              >
                <template v-if="col.name === 'name'">
                  <span class="text-caption text-grey-7" style="font-style: italic">
                    <q-icon :name="pagination.descending ? 'flag' : 'account_balance'" size="13px" class="q-mr-xs" />
                    {{ pagination.descending ? 'Saldo anterior' : 'Saldo actual' }}
                  </span>
                </template>
                <template v-else-if="col.name === 'running_balance'">
                  <template v-if="pagination.descending && preListBalance != null">
                    <span class="text-weight-bold" :class="preListBalance >= 0 ? 'text-teal-8' : 'text-red-8'">
                      {{ formatWithCodeSuffix(singleAccountCurrencyCode, preListBalance) }}
                    </span>
                  </template>
                  <template v-else-if="!pagination.descending && singleAccountBalance != null">
                    <span class="text-weight-bold" :class="singleAccountBalance >= 0 ? 'text-teal-8' : 'text-red-8'">
                      {{ formatWithCodeSuffix(singleAccountCurrencyCode, singleAccountBalance) }}
                    </span>
                  </template>
                </template>
                <template v-else>
                  <span />
                </template>
              </td>
            </tr>
          </template>
          <!-- Celda custom: Monto (línea principal: moneda de la cuenta, línea secundaria: moneda por defecto del usuario) -->
          <template v-slot:body-cell-amount="props">
            <q-td :props="props" align="right">
              <div class="amount-main">{{ formatAmountInAccountCurrency(props.row) }}</div>
              <div v-if="showUsdUnderAmounts" class="amount-sub">
                {{ formatAmountConversionLine(props.row) }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-category_summary="props">
            <q-td :props="props">
              {{ categoryLabelForRow(props.row) }}
            </q-td>
          </template>

          <!-- Celda custom: Balance corrido con colores + línea secundaria en moneda por defecto -->
          <template v-slot:body-cell-running_balance="props">
            <q-td :props="props" align="right">
              <div class="balance-stack">
                <div>
                  <span :class="balanceCellClass(props.row)">{{
                    formatRunningBalanceForRow(props.row)
                  }}</span>
                </div>
                <div v-if="showUsdInRunningBalance" class="amount-sub">
                  {{ formatRunningBalanceConversionLine(props.row) }}
                </div>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td align="right">
              <q-btn flat round icon="edit" color="primary" @click="edit(props.row)" />
              <q-btn flat round icon="delete" color="negative" @click="remove(props.row)" />
            </q-td>
          </template>
          <template
            v-for="col in manyToManyColumns"
            :key="col.key"
            v-slot:[`body-cell-${col.key}`]="props"
          >
            <q-td>
              <div>
                <template v-if="col.ownerKey && col.pivotKey">
                  <span
                    v-for="(item, idx) in getOwnedItems(props.row, col)"
                    :key="getItemKey(item, idx)"
                  >
                    {{ getItemLabel(item, col.labelKey) }}
                    <q-badge color="primary" class="q-ml-xs">Owner</q-badge>
                    <span v-if="idx < getOwnedItems(props.row, col).length - 1">, </span>
                  </span>
                </template>
                <template v-else>
                  <span
                    v-for="(item, idx) in props.row[col.key] || []"
                    :key="getItemKey(item, idx)"
                  >
                    {{ getItemLabel(item, col.labelKey) }}
                    <span v-if="idx < props.row[col.key]?.length - 1">, </span>
                  </span>
                </template>
              </div>
            </q-td>
          </template>
          <!-- Celda custom: Cuenta (apilar nombres cuando hay múltiples pagos) -->
          <template v-slot:[`body-cell-account.name`]="props">
            <q-td :props="props">
              <div class="cell-stack">
                <template v-if="props.row && props.row.account && props.row.account.name">
                  <div>{{ props.row.account.name }}</div>
                </template>
                <template v-else>
                  <div v-for="(n, idx) in paymentAccountNames(props.row)" :key="idx">{{ n }}</div>
                </template>
              </div>
            </q-td>
          </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Diálogos: usar genérico solo para EDITAR; para NUEVA transacción se usa TransactionCreateDialog (en UserLayout) -->
    <TransactionFormDialog
      v-model="ui.showDialogEditTransaction"
      :id="ui.editTransactionId ?? null"
    />

    <!-- Diálogo de carga masiva -->
    <TransactionBulkImportDialog
      v-if="showBulkImport"
      @close="showBulkImport = false"
      @imported="handleBulkImported"
    />

    <!-- Dialogo ajustar saldo desde transacciones -->
    <q-dialog v-model="showAdjustTop">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Ajustar saldo de la cuenta</q-card-section>
        <q-card-section>
          <div class="text-subtitle2 q-mb-xs">
            <q-icon name="account_balance" class="q-mr-xs" color="primary" />
            {{ singleAccountName || ('Cuenta #' + (singleAccountId ?? '-')) }}
          </div>
          <div v-if="singleAccountInitial != null" class="text-caption text-grey-7 q-mb-sm">
            Saldo de apertura: <strong>{{ formatWithCodeSuffix(singleAccountCurrencyCode, singleAccountInitial) }}</strong>
          </div>
          <q-input
            v-model="adjustBalanceTop"
            label="Nuevo saldo"
            type="number"
            step="0.01"
            dense
            filled
          />
          <div class="q-mt-sm">
            <q-checkbox v-model="includeInBalanceTop" label="Generar transacción de ajuste" dense />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup :disable="adjustingTop" />
          <q-btn color="primary" label="Guardar" :loading="adjustingTop" @click="submitAdjustTop" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
// --- Helpers and methods required by template ---
function toStringLabel(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
}

const selectOptionsAll = reactive<Record<string, Array<Record<string, unknown>>>>({});
const selectOptionsFiltered = reactive<Record<string, Array<Record<string, unknown>>>>({});
// Imports MUST precede any statements (ESM rule); previously defineOptions was before imports causing vue-tsc errors.
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar, QInput, QCheckbox } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';
import { dictionary as dictionaryDef } from './dictionary';
import { AccountsSidebarWidget, TransactionFormDialog } from 'components';
import TransactionBulkImportDialog from 'components/TransactionBulkImportDialog.vue';
import { useTransactionsStore } from 'stores/transactions';
import { usePeriodStore } from 'stores/period';
import { useUiStore } from 'stores/ui';
import {
  layoutModeOptions,
  normalizeLayoutMode,
  type LayoutModeOption,
  type UserLayoutMode,
} from 'src/utils/layoutMode';
defineOptions({ name: 'user_transactions_page' });

const $q = useQuasar();
const route = useRoute();
const authStore = useAuthStore();
const defaultCurrencyCode = computed(() => authStore.defaultCurrencyCode);
const txStore = useTransactionsStore();
const ui = useUiStore();
const periodStore = usePeriodStore();
const activeLayoutMode = computed<UserLayoutMode>(() => normalizeLayoutMode(authStore.user?.layout_mode));
const fallbackLayoutModeOption: LayoutModeOption = {
  label: 'Pro',
  value: 'pro',
  description: 'Balance general entre densidad, navegacion y visibilidad.',
};
const activeLayoutModeOption = computed<LayoutModeOption>(
  () =>
    layoutModeOptions.find((option) => option.value === activeLayoutMode.value) ||
    fallbackLayoutModeOption
);
const isLegacyLayout = computed(() => activeLayoutMode.value === 'legacy');
const isLiteLayout = computed(() => activeLayoutMode.value === 'lite');
const transactionsPageClasses = computed(() => [
  'transactions-lite',
  'q-pa-md',
  `transactions-page--${activeLayoutMode.value}`,
]);
const sidebarColumnClasses = computed(() =>
  isLiteLayout.value ? 'col-12' : 'col-12 col-lg-4 col-xl-3'
);
const mainColumnClasses = computed(() =>
  isLiteLayout.value ? 'col-12' : 'col-12 col-lg-8 col-xl-9'
);
const filtersColumnClasses = computed(() => {
  if (isLiteLayout.value) return 'col-12';
  if (isLegacyLayout.value) return 'col-12 col-xl-7';
  return 'col-12 col-xl-8';
});
const focusColumnClasses = computed(() =>
  isLegacyLayout.value ? 'col-12 col-xl-5' : 'col-12 col-xl-4'
);
const sidebarWidgetClasses = computed(() => [
  'sticky-sidebar',
  { 'sticky-sidebar--disabled': isLiteLayout.value },
]);
const showSecondaryFocusCard = computed(() => !isLiteLayout.value);
const showCompactWorkspaceStrip = computed(() => isLiteLayout.value);
// (rates chips removed from this page; now shown globally in layout/dashboard)

// Tipos del diccionario para ayuda local
interface CrudField {
  id: number;
  col?: number;
  vmodel: string;
  vmodel_api?: string;
  vmodel_url?: string;
  type: string;
  label: string;
  placeholder?: string;
  value?: string | number | boolean;
  items?: ReadonlyArray<unknown>;
  select_label?: string;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
}
interface CrudColumn {
  name: string;
  key: string;
  type?: string;
  items?: ReadonlyArray<unknown>;
  manyToMany?: boolean;
  pivotKey?: string;
  ownerKey?: string;
  labelKey?: string;
}

// Adaptar diccionario importado (readonly) a tipos locales flexibles
interface CrudDictionary {
  title: string;
  description: string;
  buttonNewLabel: string;
  finderLabel: string;
  url_api: string;
  url_apis: string;
  pagination_params?: {
    page: string;
    per_page: string;
    sort_by: string;
    descending: string;
    search: string;
  };
  forms_filter: ReadonlyArray<CrudField>;
  columns: ReadonlyArray<CrudColumn>;
  buttons: ReadonlyArray<{
    icon: string;
    type_button: string;
    tooltip: string;
    type_action: string;
    action: string;
  }>;
  window_save_title: string;
  button_save_label: string;
  save_description: string;
  forms_save: ReadonlyArray<CrudField>;
  window_update_title: string;
  button_update_label: string;
  update_description: string;
  forms_update: ReadonlyArray<CrudField>;
}

const dictionary = dictionaryDef as unknown as CrudDictionary;

// Estado filtros
type FilterValue = string | number | boolean | null | undefined;
type Filters = Record<string, FilterValue> & { search: string };
const filters = reactive<Filters>({ search: '' });

type ActiveFilterChip = { key: string; label: string; value: string };

// Tabla
type Row = Record<string, unknown>;
const rows = ref<Row[]>([]);
const loading = ref(false);
const selectedRows = ref<Row[]>([]);

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object' && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

// Totalizar cantidad desde item_transactions[].quantity
function getTotalQuantity(row: Row): number {
  const arr = (row as Record<string, unknown>)['item_transactions'];
  if (!Array.isArray(arr)) return 0;
  let sum = 0;
  for (const it of arr) {
    if (it && typeof it === 'object') {
      const q = (it as Record<string, unknown>)['quantity'];
      const n = typeof q === 'number' ? q : toNumeric(q);
      if (typeof n === 'number' && Number.isFinite(n)) sum += n;
    }
  }
  return sum;
}

const baseColumns = (dictionary.columns as CrudColumn[]).map((col) => ({
  name: col.key === 'actions' ? 'actions' : col.key,
  label: col.name,
  field:
    col.key === 'quantity'
      ? (row: Row) => getTotalQuantity(row)
      : col.key.includes('.')
      ? (row: Row) => getByPath(row, col.key)
      : col.key,
  align:
    col.key === 'quantity'
      ? ('right' as const)
      : col.type === 'boolean'
      ? ('center' as const)
      : ('left' as const),
  sortable: col.key !== 'actions',
  // Special display for account column in user list: when account is null, show ALL payment account names
  ...(col.key === 'account.name'
    ? {
        field: (row: Row) => {
          // Try direct account.name if present
          const acc = (row as Record<string, unknown>)['account'];
          if (acc && typeof acc === 'object') {
            const nm = (acc as Record<string, unknown>)['name'];
            if (typeof nm === 'string' && nm.trim()) return nm.trim();
          }
          // Fallback to list all payment_transactions account names
          const pts = (row as Record<string, unknown>)['payment_transactions'];
          if (Array.isArray(pts)) {
            const names = pts
              .map((p: unknown) => {
                if (p && typeof p === 'object') {
                  const pr = p as Record<string, unknown>;
                  const n1 = pr['account_name'];
                  if (typeof n1 === 'string' && n1.trim()) return n1.trim();
                  const acc2 = pr['account'];
                  if (acc2 && typeof acc2 === 'object') {
                    const n2 = (acc2 as Record<string, unknown>)['name'];
                    if (typeof n2 === 'string' && n2.trim()) return n2.trim();
                  }
                }
                return '';
              })
              .filter((s: string) => !!s);
            if (names.length) return names.join(', ');
          }
          return '';
        },
      }
    : {}),
  ...(col.type === 'boolean'
    ? { format: (val: unknown) => (val === true || val === 1 ? 'Sí' : 'No') }
    : {}),
  ...(col.key === 'time'
    ? {
        format: (val: unknown) => {
          const s = typeof val === 'string' ? val : String(val);
          const parts = s.split(':');
          const h = parts[0] ?? '0';
          const m = parts[1] ?? '00';
          const hourNum = Number(h);
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          const hour12 = hourNum % 12 || 12;
          return `${hour12.toString().padStart(2, '0')}:${m.padStart(2, '0')} ${ampm}`;
        },
      }
    : {}),
  ...(col.key === 'date'
    ? {
        format: (val: unknown) => {
          const s = typeof val === 'string' ? val : String(val);
          const iso = s.includes('T') ? s : s.replace(' ', 'T');
          const dt = new Date(iso);
          return dt.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        },
      }
    : {}),
}));

const categorySummaryColumn: ColumnDef = {
  name: 'category_summary',
  label: 'Categoría',
  field: (row: Row) => categoryLabelForRow(row),
  align: 'left' as const,
  sortable: false,
};

// Running balance support
const runningBalanceMap = ref<Record<string | number, number>>({});
const singleAccountSelected = computed(
  () => Array.isArray(txStore.selectedAccountIds) && txStore.selectedAccountIds.length === 1
);
const singleAccountId = computed<number | null>(() => {
  if (!singleAccountSelected.value) return null;
  const raw = txStore.selectedAccountIds[0];
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
});
const singleAccountBalance = ref<number | null>(null);
const singleAccountBalanceLoading = ref(false);
const singleAccountName = ref<string>('');
const singleAccountInitial = ref<number | null>(null);
// Balance calculado ANTES de la primera transacción visible (encadena con running balance)
const preListBalance = ref<number | null>(null);
// Moneda asociada a la cuenta seleccionada
const singleAccountCurrencySymbol = ref<string>('$');
const singleAccountCurrencyAlign = ref<'left' | 'right'>('left');
const singleAccountCurrencyCode = ref<string>('USD');
const singleAccountCurrencyId = ref<number | null>(null);
const singleAccountRate = ref<number | null>(null);
const singleAccountRateLoading = ref(false);
// Helper de redondeo a 2 decimales para evitar f.p. drift
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
// Helper para convertir valores numéricos que llegan como string o number
function toNumeric(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return null;
    // El backend envía números como "351.40"; removemos separadores de miles comunes
    const normalized = s.replace(/\s+/g, '').replace(/,/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
async function fetchSingleAccountBalance(): Promise<void> {
  const id = singleAccountId.value;
  if (!id) {
    singleAccountBalance.value = null;
    singleAccountName.value = '';
    singleAccountInitial.value = null;
    preListBalance.value = null;
    return;
  }
  try {
    singleAccountBalanceLoading.value = true;
    // Algunos endpoints requieren user_id para dar balances correctos
    const resp = await api.get(`/accounts/${id}`, { params: { user_id: authStore.user?.id } });
    const data = (resp.data?.data ?? resp.data) as Record<string, unknown> | undefined;
    let bal: number | null = null;
    if (data && typeof data === 'object') {
      // Fuente principal: objeto raíz o data.account
      const source: Record<string, unknown> =
        data['account'] && typeof data['account'] === 'object'
          ? (data['account'] as Record<string, unknown>)
          : data;
      // Capturar moneda si existe
      if (source['currency'] && typeof source['currency'] === 'object') {
        const cur = source['currency'] as Record<string, unknown>;
        const cid = typeof cur['id'] === 'number' ? cur['id'] : toNumeric(cur['id']);
        singleAccountCurrencyId.value =
          typeof cid === 'number' && Number.isFinite(cid) ? cid : null;
        const sym = typeof cur['symbol'] === 'string' ? cur['symbol'] : '$';
        const alignRaw = typeof cur['align'] === 'string' ? cur['align'].toLowerCase() : 'left';
        singleAccountCurrencySymbol.value = sym || '$';
        singleAccountCurrencyAlign.value = alignRaw === 'right' ? 'right' : 'left';
        const code = typeof cur['code'] === 'string' ? cur['code'] : 'USD';
        singleAccountCurrencyCode.value = code || 'USD';
      }
      // Capturar nombre e initial de la cuenta
      const nameVal = source['name'];
      singleAccountName.value = typeof nameVal === 'string' ? nameVal : '';
      const initVal = toNumeric(source['initial']);
      singleAccountInitial.value = initVal;
      // Preferir balance en vivo por encima del balance_cached
      const candidateKeys = [
        'balance',
        'current_balance',
        'balance_calculado',
        'saldo',
        'balance_cached',
        'initial',
      ];
      for (const k of candidateKeys) {
        if (bal != null) break;
        bal = toNumeric(source[k]);
      }
      // Si todavía no encontramos, intentamos sobre el objeto raíz completo con todas las keys
      if (bal == null && source !== data) {
        for (const k of candidateKeys) {
          if (bal != null) break;
          bal = toNumeric(data[k]);
        }
      }
    }
    singleAccountBalance.value = bal != null ? bal : 0;
  } catch {
    // si falla, no rompas la UI; deja último valor o null
    if (singleAccountBalance.value == null) singleAccountBalance.value = 0;
  } finally {
    singleAccountBalanceLoading.value = false;
  }
}
// Helpers de formato con código de moneda
// (Obsoleto) formatMoneyWith quedado como referencia; sustituido por formatWithCodeSuffix
// Formato con código ISO explícito, p. ej. "3.568,99 VES"
function formatNumberPlain(n: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}
function formatWithCodeSuffix(code: string, amount: number): string {
  return `${formatNumberPlain(amount)} ${code}`;
}
function formatSingleAccountBalanceMain(): string {
  // Mostrar siempre balance en moneda de la cuenta + código ISO explícito
  const code = singleAccountCurrencyCode.value || 'USD';
  const amt = singleAccountBalance.value ?? 0;
  return formatWithCodeSuffix(code, amt);
}
// Mostrar segunda línea del banner cuando la moneda de la cuenta difiere de la moneda por defecto del usuario
const showSecondaryUsdBalance = computed(
  () =>
    singleAccountSelected.value &&
    (singleAccountCurrencyCode.value || 'USD') !== (defaultCurrencyCode.value || 'USD')
);
// Chips de tasas configuradas por el usuario (authStore.user)
// type UserRateChip = {
//   code: string;
//   current_rate: number;
//   is_current?: boolean;
//   is_official?: boolean;
// };
// const userRateChips = computed<UserRateChip[]>(() => {
//   const u = (authStore as unknown as Record<string, unknown>)['user'] as
//     | Record<string, unknown>
//     | undefined;
//   const out: Record<string, UserRateChip> = {};
//   const pushList = (arr: unknown) => {
//     if (!Array.isArray(arr)) return;
//     for (const it of arr) {
//       if (!it || typeof it !== 'object') continue;
//       const obj = it as Record<string, unknown>;
//       const cur = obj['currency'] as Record<string, unknown> | undefined;
//       const codeRaw = cur && typeof cur === 'object' ? cur['code'] : obj['code'];
//       const code = typeof codeRaw === 'string' && codeRaw ? codeRaw.toUpperCase() : null;
//       const rate = Number(obj['current_rate']);
//       if (!code || !Number.isFinite(rate) || rate <= 0) continue;
//       const is_current = obj['is_current'] === true || obj['is_current'] === 1;
//       const is_official = obj['is_official'] === true || obj['is_official'] === 1;
//       out[code] = { code, current_rate: rate, is_current, is_official };
//     }
//   };
//   if (u && typeof u === 'object') {
//     pushList(u['rates']);
//     pushList(u['currency_rates']);
//     pushList(u['current_currency_rates']);
//   }
//   return Object.values(out).sort((a, b) => a.code.localeCompare(b.code));
// });
// Valores base para la fórmula (códigos, montos y tasas)
// const srcCodeDisplay = computed(() => (singleAccountCurrencyCode.value || 'USD').toUpperCase());
// const dstCodeDisplay = computed(() => (defaultCurrencyCode.value || 'USD').toUpperCase());
// const singleAccountBalanceAmount = computed(() => singleAccountBalance.value ?? 0);
// const srcRateDisplay = computed<number | null>(() => getRatePerUsd(srcCodeDisplay.value) ?? null);
// const dstRateDisplay = computed<number | null>(() => getRatePerUsd(dstCodeDisplay.value) ?? null);
// Eliminado isValidRate (ya no se usa; la tasa se resuelve por user rates o endpoint actual)
// Formateo de divisa con símbolo (con fallback si Intl falla)
function formatCurrencyAmount(code: string, amount: number): string {
  const cc = (code || 'USD').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: cc,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback genérico
    return formatWithCodeSuffix(cc, amount);
  }
}
// Helper para determinar un código de moneda de fallback que prioriza la preferencia del usuario
// antes de caer finalmente en 'USD'. Evita repetir '|| "USD"' disperso en la lógica visual.
const fallbackCurrencyCode = () =>
  (defaultCurrencyCode.value || singleAccountCurrencyCode.value || 'USD').toUpperCase();
function formatSingleAccountBalanceConversionLine(): string {
  // Muestra una fórmula clara: <DST>: <SRC amount> / <tasa SRC> [× <tasa DST>] = <DST amount>
  // Caso común: DST = USD => <USD>: <SRC amount> / <tasa SRC> = <USD amount>
  const bal = singleAccountBalance.value ?? 0;
  // Moneda fuente: la de la cuenta seleccionada; si falta, usar fallback (que prioriza default del usuario)
  const srcCode = (singleAccountCurrencyCode.value || fallbackCurrencyCode()).toUpperCase();
  // Moneda destino: siempre la preferida del usuario; si no existe aún, fallback común
  const dstCode = (defaultCurrencyCode.value || fallbackCurrencyCode()).toUpperCase();
  if (srcCode === dstCode) return '';
  const rSrc = getRatePerUsd(srcCode); // unidades SRC por 1 USD
  const rDst = getRatePerUsd(dstCode) ?? 1; // unidades DST por 1 USD (USD=1)
  const fmtRate = (n: number) =>
    n >= 1 ? Number(n.toFixed(2)).toString() : Number(n.toFixed(6)).toString();

  // Si tenemos rSrc, mostramos la división explícita; si no, solo mostramos el resultado convertido.
  const usdAmount = rSrc && rSrc > 0 ? bal / rSrc : bal; // SRC -> USD (si no hay rSrc, asumimos 1)
  const dstAmount = usdAmount * rDst;

  if (rSrc && rSrc > 0) {
    if (dstCode === 'USD') {
      return `${dstCode}: ${formatCurrencyAmount(srcCode, bal)} / ${fmtRate(
        rSrc
      )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
    }
    // General: SRC -> USD -> DST
    return `${dstCode}: ${formatCurrencyAmount(srcCode, bal)} / ${fmtRate(rSrc)} × ${fmtRate(
      rDst
    )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
  }
  // Fallback sin rSrc fiable: mostrar solo el monto convertido (si es posible)
  const converted = convertAmountBetweenCurrencies(bal, srcCode, dstCode);
  return `${dstCode}: ${formatCurrencyAmount(dstCode, converted)}`;
}
// reactivo a selección de cuenta
watch(
  () => singleAccountId.value,
  (id) => {
    if (id) void fetchSingleAccountBalance();
    else singleAccountBalance.value = null;
  },
  { immediate: true }
);
// Resolver tasa del usuario para la moneda de la cuenta seleccionada
// safeObj no longer needed after refactor
// Usar authStore.getCurrentRateForCurrency para obtener la tasa actual del usuario para un código ISO
function getUserRateForCode(code: unknown): number | null {
  const cc = typeof code === 'string' ? code : null;
  if (!cc) return null;
  const storeWithHelper = authStore as unknown as {
    getCurrentRateForCurrency?: (c: string) => number | null;
  };
  if (typeof storeWithHelper.getCurrentRateForCurrency === 'function') {
    const r = storeWithHelper.getCurrentRateForCurrency(cc);
    if (typeof r === 'number' && r > 0) return r;
  }
  // Fallback: buscar en authStore.user.* listas (rates, currency_rates, current_currency_rates)
  const u = (authStore as unknown as Record<string, unknown>)['user'] as
    | Record<string, unknown>
    | undefined;
  const pickFrom = (arr: unknown): number | null => {
    if (!Array.isArray(arr)) return null;
    for (const it of arr) {
      if (!it || typeof it !== 'object') continue;
      const obj = it as Record<string, unknown>;
      const cur = obj['currency'] as Record<string, unknown> | undefined;
      const codeRaw = cur && typeof cur === 'object' ? cur['code'] : obj['code'];
      const codeStr = typeof codeRaw === 'string' ? codeRaw.toUpperCase() : '';
      if (codeStr === cc.toUpperCase()) {
        const n = Number(obj['current_rate']);
        if (Number.isFinite(n) && n > 0) return n;
      }
    }
    return null;
  };
  if (u && typeof u === 'object') {
    // Prioridad: current_currency_rates > rates > currency_rates
    const fromCurrent = pickFrom(u['current_currency_rates']);
    if (fromCurrent) return fromCurrent;
    const fromRates = pickFrom(u['rates']);
    if (fromRates) return fromRates;
    const fromCurrencyRates = pickFrom(u['currency_rates']);
    if (fromCurrencyRates) return fromCurrencyRates;
  }
  return null;
}

// Helpers de conversión entre monedas basadas en tasas del usuario (todas relativas a USD)
function getRatePerUsd(code: string | null | undefined): number | null {
  if (!code) return null;
  const cc = String(code).toUpperCase();
  if (cc === 'USD') return 1;
  const r = getUserRateForCode(cc);
  return typeof r === 'number' && r > 0 ? r : null;
}
function convertAmountBetweenCurrencies(amount: number, srcCode: string, dstCode: string): number {
  if (!Number.isFinite(amount)) return 0;
  const src = (srcCode || 'USD').toUpperCase();
  const dst = (dstCode || 'USD').toUpperCase();
  if (src === dst) return amount;
  const rSrc = getRatePerUsd(src);
  const rDst = getRatePerUsd(dst);
  if (rSrc && rDst) {
    const usd = amount / rSrc; // src -> USD
    return usd * rDst; // USD -> dst
  }
  if (rSrc && dst === 'USD') return amount / rSrc; // src -> USD
  if (src === 'USD' && rDst) return amount * rDst; // USD -> dst
  return amount; // sin tasas disponibles, sin conversión
}
async function fetchUserCurrentRate(currencyId: number | null): Promise<number | null> {
  const uid = authStore.user && typeof authStore.user.id === 'number' ? authStore.user.id : null;
  if (!uid || !currencyId) return null;
  try {
    singleAccountRateLoading.value = true;
    const res = await api.get('/user_currencies', {
      params: { user_id: uid, currency_id: currencyId, is_current: 1, limit: 1 },
    });
    // La API puede devolver directamente un array o un objeto paginado con data.data[]
    const body = res.data as unknown;
    let list: Array<{ current_rate?: number | string }> = [];
    if (Array.isArray(body)) {
      list = body as Array<{ current_rate?: number | string }>;
    } else if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const d1 = obj['data'];
      if (Array.isArray(d1)) {
        list = d1 as Array<{ current_rate?: number | string }>;
      } else if (d1 && typeof d1 === 'object') {
        const inner = d1 as Record<string, unknown>;
        const d2 = inner['data'];
        if (Array.isArray(d2)) list = d2 as Array<{ current_rate?: number | string }>;
      }
    }
    const first = Array.isArray(list) && list.length ? list[0] : null;
    const rateNum = first && first.current_rate != null ? Number(first.current_rate) : NaN;
    if (Number.isFinite(rateNum) && rateNum > 0) return rateNum;
    return null;
  } catch {
    return null;
  } finally {
    singleAccountRateLoading.value = false;
  }
}
async function resolveSingleAccountRate(): Promise<void> {
  // Si la cuenta es USD, no necesitamos tasa
  if ((singleAccountCurrencyCode.value || 'USD') === 'USD') {
    singleAccountRate.value = 1;
    return;
  }
  // Primero intenta de auth.user.rates
  const rAuth = getUserRateForCode(singleAccountCurrencyCode.value);
  if (typeof rAuth === 'number' && rAuth > 0) {
    singleAccountRate.value = rAuth;
    return;
  }
  // Fallback: pedir la tasa actual al backend usando currencyId
  const rateSrv = await fetchUserCurrentRate(singleAccountCurrencyId.value);
  if (typeof rateSrv === 'number' && rateSrv > 0) singleAccountRate.value = rateSrv;
}
watch(
  () => [singleAccountId.value, singleAccountCurrencyCode.value, singleAccountCurrencyId.value],
  () => {
    void resolveSingleAccountRate();
  }
);
const showRunningBalanceColumn = computed(
  () => singleAccountSelected.value && pagination.value.sortBy === 'date'
);
function computeRunningBalances(): void {
  if (!showRunningBalanceColumn.value) {
    runningBalanceMap.value = {};
    preListBalance.value = null;
    return;
  }
  const currentBalance = singleAccountBalance.value;
  if (currentBalance == null) {
    runningBalanceMap.value = {};
    preListBalance.value = null;
    return;
  }
  const list = rows.value.slice();
  // Para una sola cuenta: delta = suma de payments de ESA cuenta (los payments ya tienen el signo correcto)
  const amounts = list.map((r) => {
    if (singleAccountSelected.value) {
      const sumPayments = totalPaymentsForRow(r);
      return sumPayments;
    }
    return parseNumber((r as Record<string, unknown>)['amount']);
  });
  const descending = pagination.value.descending;
  const sortBy = pagination.value.sortBy;
  if (sortBy !== 'date') {
    runningBalanceMap.value = {};
    return;
  }
  const map: Record<string | number, number> = {};
  if (descending) {
    let bal = currentBalance;
    for (let i = 0; i < list.length; i++) {
      const row = list[i] as Record<string, unknown>;
      const id = (row['id'] as string | number | undefined) ?? i;
      map[id] = bal;
      const amt = amounts[i] ?? 0;
      bal = bal - amt;
    }
    // bal ahora = currentBalance - Σ(amounts) = saldo ANTES de la tx más antigua visible
    preListBalance.value = round2(bal);
  } else {
    const total = amounts.reduce((a, b) => a + b, 0);
    const startBal = currentBalance - total;
    preListBalance.value = round2(startBal);
    let bal = startBal;
    for (let i = 0; i < list.length; i++) {
      const row = list[i] as Record<string, unknown>;
      const id = (row['id'] as string | number | undefined) ?? i;
      const amt = amounts[i] ?? 0;
      bal = bal + amt;
      map[id] = bal;
    }
  }
  runningBalanceMap.value = map;
}
interface ColumnDef {
  name: string;
  label: string;
  field: string | ((row: Row) => unknown);
  align: 'left' | 'center' | 'right';
  sortable: boolean;
  format?: (val: unknown) => string;
}
const runningBalanceColumn: ColumnDef = {
  name: 'running_balance',
  label: 'Balance',
  field: (row: Row) => {
    const id = (row as Record<string, unknown>)['id'] as string | number | undefined;
    const key = id ?? rows.value.indexOf(row);
    const val = runningBalanceMap.value[key];
    if (val == null) return '';
    // Mostrar en la moneda de la cuenta cuando hay selección única
    if (singleAccountSelected.value)
      return formatWithCodeSuffix(singleAccountCurrencyCode.value || 'USD', val);
    return formatMoney(val);
  },
  align: 'right' as const,
  sortable: false,
};
const columns = computed<ColumnDef[]>(() => {
  const base = baseColumns as unknown as ColumnDef[];
  const withCategory = [...base];
  if (!withCategory.find((c) => c.name === 'category_summary')) {
    const insertAt = withCategory.findIndex((c) => c.name === 'transaction_type.name');
    if (insertAt >= 0) withCategory.splice(insertAt + 1, 0, categorySummaryColumn);
    else withCategory.splice(Math.min(2, withCategory.length), 0, categorySummaryColumn);
  }
  if (!showRunningBalanceColumn.value) return withCategory;
  const clone = [...withCategory];
  const idx = clone.findIndex((c) => c.name === 'amount');
  if (idx >= 0 && !clone.find((c) => c.name === 'running_balance'))
    clone.splice(idx + 1, 0, runningBalanceColumn);
  else if (!clone.find((c) => c.name === 'running_balance')) clone.push(runningBalanceColumn);
  return clone;
});

type CategorySpendTag = {
  key: string;
  id: number;
  name: string;
  total: number;
  bgColor: string;
  textColor: string;
};

const categorySpendTags = ref<CategorySpendTag[]>([]);
const filtersExpanded = ref(false);
const hasCategoryFilterSelected = computed(() => {
  const raw = (filters as Record<string, FilterValue>)['category_id'];
  return raw !== undefined && raw !== null && String(raw) !== '';
});
const selectedCategoryFilterId = computed<number | null>(() => {
  const raw = (filters as Record<string, FilterValue>)['category_id'];
  if (raw === undefined || raw === null || String(raw) === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
});

const TAG_COLOR_POOL: Array<{ bgColor: string; textColor: string }> = [
  { bgColor: '#B91C1C', textColor: '#FFFFFF' },
  { bgColor: '#C2410C', textColor: '#FFFFFF' },
  { bgColor: '#A16207', textColor: '#FFFFFF' },
  { bgColor: '#15803D', textColor: '#FFFFFF' },
  { bgColor: '#0F766E', textColor: '#FFFFFF' },
  { bgColor: '#0369A1', textColor: '#FFFFFF' },
  { bgColor: '#1D4ED8', textColor: '#FFFFFF' },
  { bgColor: '#6D28D9', textColor: '#FFFFFF' },
  { bgColor: '#BE185D', textColor: '#FFFFFF' },
  { bgColor: '#4338CA', textColor: '#FFFFFF' },
  { bgColor: '#374151', textColor: '#FFFFFF' },
  { bgColor: '#111827', textColor: '#FFFFFF' },
];

const allCategoryChipStyle = computed(() => {
  const selected = !hasCategoryFilterSelected.value;
  return {
    backgroundColor: selected ? '#111827' : '#9CA3AF',
    color: selected ? '#FFFFFF' : '#111827',
    border: selected ? '3px solid #111827' : '3px solid #4B5563',
    opacity: 1,
    fontWeight: selected ? '800' : '700',
    boxShadow: selected ? '0 2px 0 rgba(0,0,0,.28)' : '0 1px 0 rgba(0,0,0,.2)',
  };
});

function categoryChipStyle(tag: CategorySpendTag): Record<string, string> {
  const selected = selectedCategoryFilterId.value === tag.id;
  return {
    backgroundColor: tag.bgColor,
    color: tag.textColor,
    border: selected ? '3px solid #111827' : '2px solid rgba(255,255,255,.4)',
    opacity: '1',
    fontWeight: selected ? '800' : '700',
    boxShadow: selected ? '0 0 0 2px rgba(17,24,39,.3), 0 3px 8px rgba(0,0,0,.35)' : '0 2px 6px rgba(0,0,0,.18)',
    textShadow: '0 1px 1px rgba(0,0,0,.35)',
  };
}

function rowCategoryCandidates(row: Row): Array<{ id: number; name: string }> {
  const out: Array<{ id: number; name: string }> = [];
  const seen = new Set<number>();
  const push = (idRaw: unknown, nameRaw: unknown) => {
    const id = Number(idRaw);
    const name = typeof nameRaw === 'string' ? nameRaw.trim() : '';
    if (!Number.isFinite(id) || id <= 0 || !name || seen.has(id)) return;
    seen.add(id);
    out.push({ id, name });
  };

  const topCategory = (row as AnyRecord)['category'];
  if (topCategory && typeof topCategory === 'object') {
    const cat = topCategory as AnyRecord;
    push(cat['id'], cat['name']);
  }
  push((row as AnyRecord)['category_id'], (row as AnyRecord)['category_name']);

  const items = (row as AnyRecord)['item_transactions'];
  if (Array.isArray(items)) {
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const it = item as AnyRecord;
      const cat = it['category'];
      if (cat && typeof cat === 'object') {
        const c = cat as AnyRecord;
        push(c['id'], c['name']);
      }
      const itemCat = it['item_category'];
      if (itemCat && typeof itemCat === 'object') {
        const ic = itemCat as AnyRecord;
        push(ic['id'], ic['name']);
      }
      push(it['category_id'], it['category_name']);
    }
  }

  return out;
}

function categoryLabelForRow(row: Row): string {
  const labels = rowCategoryCandidates(row).map((c) => c.name);
  if (!labels.length) return 'Sin categoría';
  return labels.join(', ');
}

function buildCategoryStatsParams(): Record<string, unknown> {
  const pmap = dictionary.pagination_params || {
    page: 'page',
    per_page: 'per_page',
    sort_by: 'sort_by',
    descending: 'descending',
    search: 'search',
  };
  const params = buildQueryParams();
  delete params[pmap.page];
  delete params[pmap.per_page];
  delete params[pmap.sort_by];
  delete params[pmap.descending];
  delete params['category_id'];
  params[pmap.page] = 1;
  params[pmap.per_page] = 1000;
  return params;
}

function extractRowsAndTotal(payload: unknown): { list: Row[]; total: number } {
  let list: Row[] = [];
  let total = 0;
  if (Array.isArray(payload)) {
    list = payload as Row[];
    total = list.length;
    return { list, total };
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) list = obj.data as Row[];
    else if (Array.isArray(obj.items)) list = obj.items as Row[];
    else if (Array.isArray(obj.results)) list = obj.results as Row[];
    else if (Array.isArray(obj.rows)) list = obj.rows as Row[];
    else if (Array.isArray(obj.records)) list = obj.records as Row[];
    else if (Array.isArray(obj.transactions)) list = obj.transactions as Row[];
    else if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.data)) list = inner.data as Row[];
      else if (Array.isArray(inner.items)) list = inner.items as Row[];
      else if (Array.isArray(inner.results)) list = inner.results as Row[];
      else if (Array.isArray(inner.rows)) list = inner.rows as Row[];
      else if (Array.isArray(inner.records)) list = inner.records as Row[];
      else if (Array.isArray(inner.transactions)) list = inner.transactions as Row[];
    }
    let rawTotal: unknown =
      (obj.meta && typeof obj.meta === 'object'
        ? (obj.meta as Record<string, unknown>)['total']
        : undefined) ||
      (obj.pagination && typeof obj.pagination === 'object'
        ? (obj.pagination as Record<string, unknown>)['total']
        : undefined) ||
      obj.total;
    if (rawTotal === undefined && obj.data && typeof obj.data === 'object') {
      rawTotal = (obj.data as Record<string, unknown>)['total'];
    }
    if (typeof rawTotal === 'number' && Number.isFinite(rawTotal)) total = rawTotal;
    else if (typeof rawTotal === 'string' && rawTotal.trim() !== '') {
      const n = Number(rawTotal);
      total = Number.isFinite(n) ? n : list.length;
    } else {
      total = list.length;
    }
  }
  return { list, total };
}

function buildCategorySpendTags(rowsInput: Row[]): CategorySpendTag[] {
  const map = new Map<number, CategorySpendTag>();
  const shuffledPool = [...TAG_COLOR_POOL].sort(() => Math.random() - 0.5);
  let colorCursor = 0;
  const nextColor = () => {
    const color = shuffledPool[colorCursor % shuffledPool.length] ?? TAG_COLOR_POOL[0]!;
    colorCursor += 1;
    return color;
  };
  const addSpend = (id: number, name: string, amount: number) => {
    if (!(amount > 0)) return;
    const prev = map.get(id);
    if (prev) {
      prev.total += amount;
      return;
    }
    const c = nextColor();
    map.set(id, {
      key: `cat-${id}`,
      id,
      name,
      total: amount,
      bgColor: c.bgColor,
      textColor: c.textColor,
    });
  };

  for (const row of rowsInput) {
    if (isTransferRow(row)) continue;
    const rowAmount = parseNumber((row as AnyRecord)['amount']);
    const items = (row as AnyRecord)['item_transactions'];

    let usedItemBreakdown = false;
    if (Array.isArray(items) && items.length) {
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const it = item as AnyRecord;
        const amt = parseNumber(it['amount']);
        if (!(amt < 0)) continue;
        const itemRow = { item_transactions: [it] } as unknown as Row;
        const cats = rowCategoryCandidates(itemRow);
        if (!cats.length) continue;
        const spend = Math.abs(amt);
        const perCategory = spend / cats.length;
        for (const cat of cats) addSpend(cat.id, cat.name, perCategory);
        usedItemBreakdown = true;
      }
    }

    if (usedItemBreakdown || !(rowAmount < 0)) continue;
    const cats = rowCategoryCandidates(row);
    if (!cats.length) continue;
    const spend = Math.abs(rowAmount);
    const perCategory = spend / cats.length;
    for (const cat of cats) addSpend(cat.id, cat.name, perCategory);
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

let categoryStatsSignature = '';
async function fetchCategorySpendTags(force = false): Promise<void> {
  const pmap = dictionary.pagination_params || {
    page: 'page',
    per_page: 'per_page',
    sort_by: 'sort_by',
    descending: 'descending',
    search: 'search',
  };
  const params = buildCategoryStatsParams();
  const sig = stableSignature(params);
  if (!force && sig === categoryStatsSignature) return;
  categoryStatsSignature = sig;

  try {
    const collected: Row[] = [];
    const pageKey = pmap.page;
    const perPageKey = pmap.per_page;
    const perPage = 1000;
    const maxPages = 8;
    let page = 1;
    let total = 0;

    while (page <= maxPages) {
      params[pageKey] = page;
      params[perPageKey] = perPage;
      const res = await api.get(`/${dictionary.url_apis}`, { params });
      const parsed = extractRowsAndTotal(res.data);
      if (!parsed.list.length) break;
      collected.push(...parsed.list);
      total = parsed.total;
      if (collected.length >= total) break;
      if (parsed.list.length < perPage) break;
      page += 1;
    }

    categorySpendTags.value = buildCategorySpendTags(collected);
  } catch {
    categorySpendTags.value = [];
  }
}

function applyCategoryTagFilter(categoryId: number): void {
  const current = selectedCategoryFilterId.value;
  (filters as Record<string, FilterValue>)['category_id'] = current === categoryId ? '' : categoryId;
}

function clearCategoryTagFilter(): void {
  (filters as Record<string, FilterValue>)['category_id'] = '';
}

const columnVisibilityOptions = computed(() =>
  columns.value
    .filter((c) => c.name !== 'actions')
    .map((c) => ({ label: c.label, value: c.name }))
);

const visibleColumnNames = ref<string[]>([]);

const selectedAccountsLabel = computed(() => {
  const count = txStore.selectedAccountIds.length;
  if (count === 0) return 'Todas';
  if (count === 1) return '1 cuenta';
  return `${count} cuentas`;
});

const selectedAccountDetail = computed(() => {
  if (!txStore.selectedAccountIds.length) return 'Todas las cuentas';
  if (singleAccountSelected.value) return singleAccountName.value || 'Cuenta seleccionada';
  return `${txStore.selectedAccountIds.length} cuentas combinadas`;
});

const transactionsHeroText = computed(() => {
  if (singleAccountSelected.value) {
    const accountName = singleAccountName.value || 'la cuenta seleccionada';
    return `Sigue el movimiento de ${accountName}, revisa el balance corrido y resuelve ajustes sin salir de la vista principal.`;
  }
  if (txStore.selectedAccountIds.length > 1) {
    return 'Compara varias cuentas a la vez, limpia el ruido con filtros rapidos y deja listas las siguientes acciones.';
  }
  return 'Usa esta lista como centro de control para buscar, depurar y actuar sobre tus movimientos del periodo actual.';
});

const contextPanelTitle = computed(() => {
  if (isLegacyLayout.value) return 'Workspace de cuentas';
  if (isLiteLayout.value) return 'Cuenta en foco';
  return 'Cuentas activas';
});

const contextPanelCopy = computed(() => {
  if (isLegacyLayout.value) {
    return 'Legacy mantiene la cuenta y su lectura operativa visibles para que el balance corrido y los ajustes queden siempre a mano.';
  }
  if (isLiteLayout.value) {
    return 'Lite deja el selector en una franja compacta para entrar rapido al listado y conservar solo el contexto necesario.';
  }
  return 'Selecciona una cuenta para ver balance corrido y habilitar los ajustes rapidos.';
});

const heroEyebrow = computed(() => {
  if (isLegacyLayout.value) return 'Legacy movements';
  if (isLiteLayout.value) return 'Lite movements';
  return 'Pro movements';
});

const heroTitle = computed(() => {
  if (isLegacyLayout.value) return `${dictionary.title} con contexto ampliado`;
  if (isLiteLayout.value) return dictionary.title;
  return `${dictionary.title} en flujo balanceado`;
});

const heroStatColumnClasses = computed(() => {
  if (isLiteLayout.value) return 'col-12 col-sm-6';
  if (isLegacyLayout.value) return 'col-12 col-sm-6 col-xl-3';
  return 'col-12 col-sm-6 col-xl-4';
});

const effectiveVisibleColumnNames = computed(() => {
  const valid = new Set(columns.value.map((c) => c.name));
  const selected = visibleColumnNames.value.filter((name) => valid.has(name));
  if (!selected.length) {
    return columns.value.map((c) => c.name);
  }
  // Siempre mantener acciones visible para editar/eliminar individualmente
  return selected.includes('actions') ? selected : [...selected, 'actions'];
});

// helper para extraer nombres de cuentas de pagos
function paymentAccountNames(row: Record<string, unknown>): string[] {
  if (!row) return [];
  // Si hay account.name directo, retornar solo ese (caso simple)
  const acc = row['account'];
  if (acc && typeof acc === 'object') {
    const nm = (acc as Record<string, unknown>)['name'];
    if (typeof nm === 'string' && nm.trim()) return [nm.trim()];
  }
  const pts = row['payment_transactions'];
  if (Array.isArray(pts)) {
    const names = pts
      .map((p: unknown) => {
        if (p && typeof p === 'object') {
          const pr = p as Record<string, unknown>;
          const n1 = pr['account_name'];
          if (typeof n1 === 'string' && n1.trim()) return n1.trim();
          const acc2 = pr['account'];
          if (acc2 && typeof acc2 === 'object') {
            const n2 = (acc2 as Record<string, unknown>)['name'];
            if (typeof n2 === 'string' && n2.trim()) return n2.trim();
          }
        }
        return '';
      })
      .filter((s: string) => !!s);
    return names;
  }
  return [];
}

// ===== Acciones de saldo (ajustar / recalcular) desde cabecera =====
const showAdjustTop = ref(false);
const showBulkImport = ref(false);
const adjustBalanceTop = ref<string>('');
const adjustingTop = ref(false);
const includeInBalanceTop = ref(false);
function openAdjustTop(): void {
  if (!singleAccountSelected.value) return;
  adjustBalanceTop.value =
    singleAccountBalance.value != null ? singleAccountBalance.value.toFixed(2) : '';
  showAdjustTop.value = true;
}
async function submitAdjustTop(): Promise<void> {
  const id = singleAccountId.value;
  if (!id) return;
  const n = Number(adjustBalanceTop.value);
  if (!Number.isFinite(n)) {
    $q.notify({ type: 'warning', message: 'Ingresa un saldo válido' });
    return;
  }
  try {
    adjustingTop.value = true;
    await api.post(`/accounts/${id}/adjust-balance`, {
      target_balance: n,
      include_in_balance: includeInBalanceTop.value,
    });
    await api.post(`/accounts/${id}/recalculate-account`);
    $q.notify({ type: 'positive', message: 'Saldo ajustado' });
    showAdjustTop.value = false;
    await runFetch(true);
    await fetchSingleAccountBalance();
    window.dispatchEvent(
      new CustomEvent('ow:transactions:changed', { detail: { account_id: id, reason: 'adjust' } })
    );
  } catch {
    $q.notify({ type: 'negative', message: 'Error ajustando saldo' });
  } finally {
    adjustingTop.value = false;
  }
}
async function recalcSingleAccountTop(): Promise<void> {
  const id = singleAccountId.value;
  if (!id) return;
  try {
    $q.loading.show({ message: 'Recalculando saldo...' });
    await api.post(`/accounts/${id}/recalculate-account`);
    $q.notify({ type: 'positive', message: 'Saldo recalculado' });
    await runFetch(true);
    await fetchSingleAccountBalance();
    window.dispatchEvent(
      new CustomEvent('ow:transactions:changed', { detail: { account_id: id, reason: 'recalc' } })
    );
  } catch {
    $q.notify({ type: 'negative', message: 'Error recalculando saldo' });
  } finally {
    $q.loading.hide();
  }
}

// Paginación
const defaultSortKey = dictionary.columns.find((c) => c.key === 'date')
  ? 'date'
  : dictionary.columns[0]?.key || 'id';
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: defaultSortKey,
  descending: true,
  rowsNumber: 0,
});

// ...existing code...

// QTable server-side
type QTablePagination = {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
};
type QTableRequestProps = {
  pagination?: QTablePagination;
  filter?: string;
};

function buildQueryParams(): Record<string, unknown> {
  const pmap = dictionary.pagination_params || {
    page: 'page',
    per_page: 'per_page',
    sort_by: 'sort_by',
    descending: 'descending',
    search: 'search',
  };
  const params: Record<string, unknown> = {
    [pmap.page]: pagination.value.page,
    [pmap.per_page]: pagination.value.rowsPerPage,
    [pmap.sort_by]: pagination.value.sortBy,
    [pmap.descending]: pagination.value.descending,
  };
  if (filters.search) params[pmap.search] = filters.search;
  // Parámetros de periodo (cuando aplique)
  const periodParams = periodStore.queryParams;
  Object.entries(periodParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params[k] = v;
  });
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    const val = (filters as Record<string, FilterValue>)[f.vmodel];
    if (val !== undefined && val !== null && val !== '') {
      params[f.vmodel_api || f.vmodel] = val;
    }
  }
  // Multi-cuenta: si hay más de una cuenta seleccionada en el sidebar,
  // enviar solo payment_account_ids como CSV (p. ej. "1,2,3")
  if (Array.isArray(txStore.selectedAccountIds) && txStore.selectedAccountIds.length > 1) {
    const ids = txStore.selectedAccountIds.map((v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? String(n) : String(v);
    });
    const csv = ids.join(',');
    if (csv) {
      params['payment_account_ids'] = csv;
    }
  }
  return params;
}

async function onRequest(props: QTableRequestProps): Promise<void> {
  if (props.pagination) {
    pagination.value = {
      ...pagination.value,
      page: props.pagination.page,
      rowsPerPage: props.pagination.rowsPerPage,
      sortBy: props.pagination.sortBy,
      descending: props.pagination.descending,
    };
  }
  await runFetch();
}

let currentAbort: AbortController | null = null;
async function fetchData(params?: Record<string, unknown>): Promise<void> {
  if (currentAbort) currentAbort.abort();
  const controller = new AbortController();
  currentAbort = controller;
  loading.value = true;
  try {
    const res = await api.get(`/${dictionary.url_apis}`, {
      params: params || { ...filters },
      signal: controller.signal,
    });
    const parsed = extractRowsAndTotal(res.data);
    rows.value = parsed.list;
    pagination.value.rowsNumber = Number(parsed.total) || 0;
  } catch (err) {
    const e = err as { name?: string } | undefined;
    if ((e && e.name === 'CanceledError') || controller.signal.aborted) return;
    $q.notify({ type: 'negative', message: 'Error cargando datos' });
  } finally {
    loading.value = false;
  }
}

// Scheduler unificado
let fetchDebounceTimer: number | undefined;
let lastParamsSignature = '';
function stableSignature(obj: Record<string, unknown>): string {
  return JSON.stringify(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}
function scheduleFetch(): void {
  if (fetchDebounceTimer) window.clearTimeout(fetchDebounceTimer);
  fetchDebounceTimer = window.setTimeout(() => {
    void runFetch();
  }, 300);
}
async function runFetch(force = false): Promise<void> {
  const params = buildQueryParams();
  const sig = stableSignature(params);
  if (!force && sig === lastParamsSignature) return;
  lastParamsSignature = sig;
  await fetchData(params);
  await fetchCategorySpendTags(force);
  selectedRows.value = [];
  computeRunningBalances();
  if (singleAccountSelected.value) void fetchSingleAccountBalance();
}

// Montaje: cargar selects y datos
onMounted(async () => {
  const initialSearch = (route.query.search as string) || '';
  filters.search = initialSearch;
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    (filters as Record<string, FilterValue>)[f.vmodel] = (f.value as FilterValue) ?? '';
  }
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    const key = f.vmodel_api || f.vmodel;
    const raw = route.query[key];
    if (raw == null) continue;
    let v: FilterValue = Array.isArray(raw) ? raw[0] : raw;
    if (f.type === 'select') {
      const n = Number(v);
      v = Number.isFinite(n) ? n : (v as string);
    } else {
      v = v as string;
    }
    (filters as Record<string, FilterValue>)[f.vmodel] = v;
  }

  const setOptions = (field: CrudField, list: Array<Record<string, unknown>>) => {
    const labelKey = field.select_label || 'name';
    const sorted = [...list].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const laStr = toStringLabel(a[labelKey]).toLowerCase();
      const lbStr = toStringLabel(b[labelKey]).toLowerCase();
      return laStr.localeCompare(lbStr, undefined, { numeric: true });
    });
    selectOptionsAll[field.vmodel] = sorted;
    selectOptionsFiltered[field.vmodel] = sorted;
  };

  const fieldsForSelects: CrudField[] = ([] as CrudField[]).concat(
    dictionary.forms_filter as unknown as CrudField[],
    dictionary.forms_save as unknown as CrudField[],
    dictionary.forms_update as unknown as CrudField[]
  );
  for (const field of fieldsForSelects) {
    if (field.type !== 'select') continue;
    try {
      if (field.vmodel_url) {
        const params: Record<string, unknown> = {};
        if (field.order_by) {
          params.order_by = field.order_by;
          params.order_dir = field.order_dir || 'asc';
        }
        const r = await api.get(`/${field.vmodel_url}`, { params });
        const list = (r.data?.data || r.data || []) as Array<Record<string, unknown>>;
        setOptions(field, Array.isArray(list) ? list : []);
      } else if (Array.isArray(field.items) && field.items.length) {
        setOptions(field, field.items as Array<Record<string, unknown>>);
      } else {
        setOptions(field, []);
      }
    } catch (e) {
      console.error('Error cargando opciones de', field.vmodel_url || field.vmodel, e);
      setOptions(field, []);
    }
  }

  await runFetch(true);
  visibleColumnNames.value = columns.value.filter((c) => c.name !== 'actions').map((c) => c.name);

  // Escuchar cambios en transacciones para refrescar la tabla SIEMPRE;
  // si hay una sola cuenta seleccionada, además refrescamos el saldo/bandera.
  const handler = () => {
    void runFetch(true);
    if (singleAccountSelected.value) void fetchSingleAccountBalance();
  };
  window.addEventListener('ow:transactions:changed', handler);
  // Escuchar selección explícita de cuentas (AccountsTree emite ow:accounts:selected)
  const accountsSelectedHandler = () => {
    // Ejecutar fetch inmediato de saldo para evitar ver 0 hasta que se carguen transacciones
    if (singleAccountSelected.value) void fetchSingleAccountBalance();
    // Forzar carga rápida de transacciones (sin esperar debounce)
    void runFetch(true);
  };
  window.addEventListener('ow:accounts:selected', accountsSelectedHandler);
  onBeforeUnmount(() => {
    window.removeEventListener('ow:transactions:changed', handler);
    window.removeEventListener('ow:accounts:selected', accountsSelectedHandler);
  });
});

watch(
  () => columns.value.map((c) => c.name),
  (names) => {
    const dataNames = names.filter((n) => n !== 'actions');
    if (!visibleColumnNames.value.length) {
      visibleColumnNames.value = dataNames;
      return;
    }
    const set = new Set(dataNames);
    const kept = visibleColumnNames.value.filter((n) => set.has(n));
    const missing = dataNames.filter((n) => !kept.includes(n));
    visibleColumnNames.value = [...kept, ...missing];
  }
);

// Sidebar de cuentas: si hay exactamente una cuenta seleccionada en el widget,
// aplicamos el filtro account_id; en caso contrario quitamos el filtro.
watch(
  () => txStore.selectedAccountIds.slice(),
  (ids) => {
    if (Array.isArray(ids) && ids.length === 1) {
      const raw = ids[0];
      const asNum = Number(raw);
      (filters as Record<string, FilterValue>)['account_id'] = Number.isFinite(asNum)
        ? asNum
        : (String(raw) as FilterValue);
    } else {
      (filters as Record<string, FilterValue>)['account_id'] = '';
    }
    pagination.value.page = 1;
    scheduleFetch();
  },
  { deep: false }
);

// Cuando se cierra el diálogo de nueva transacción (TransactionCreateDialog), refrescar la tabla
watch(
  () => ui.showDialogNewTransaction,
  (open, prev) => {
    if (prev === true && open === false) void runFetch(true);
  }
);

// Si el usuario usa el filtro de "Cuenta" del formulario, reflejamos en el sidebar.
watch(
  () => (filters as Record<string, FilterValue>)['account_id'],
  (val) => {
    // Si hay selección múltiple activa en el sidebar, no sobreescribirla desde el filtro del formulario
    if (Array.isArray(txStore.selectedAccountIds) && txStore.selectedAccountIds.length > 1) {
      return;
    }
    const current = txStore.selectedAccountIds.map(String);
    const desired = val == null || val === '' ? [] : [String(val as unknown as string | number)];
    if (JSON.stringify(current) !== JSON.stringify(desired)) {
      txStore.setSelectedAccountIds(desired);
    }
  }
);

// Filtros internos: usar scheduler unificado
watch(
  () => ({ ...filters }),
  () => {
    pagination.value.page = 1;
    scheduleFetch();
  },
  { deep: true }
);

// Cambios de periodo => refetch
watch(
  () => periodStore.signature,
  () => {
    pagination.value.page = 1;
    scheduleFetch();
  }
);

// Nota multi-cuentas: para >1 cuenta se usa account_ids en CSV y se ignora account_id individual.

const manyToManyColumns = computed(() =>
  (dictionary.columns as unknown as CrudColumn[]).filter((col) => Boolean(col.manyToMany))
);

// Helpers de many-to-many
type AnyRecord = Record<string, unknown>;
function isRecord(v: unknown): v is AnyRecord {
  return !!v && typeof v === 'object';
}
function asArray(v: unknown): AnyRecord[] {
  return Array.isArray(v) ? (v as AnyRecord[]) : [];
}
function getItemLabel(item: AnyRecord, labelKey?: string): string {
  const key = labelKey || 'name';
  const val = isRecord(item) ? item[key] : undefined;
  return toStringLabel(val);
}
function getOwnedItems(row: Row, col: CrudColumn): AnyRecord[] {
  const list = asArray((row as AnyRecord)[col.key]);
  if (!col.pivotKey || !col.ownerKey) return list;
  const pk = col.pivotKey;
  const ok = col.ownerKey;
  return list.filter((u: AnyRecord) => {
    if (!isRecord(u)) return false;
    const pv = u[pk];
    if (!isRecord(pv)) return false;
    const piv = pv as Record<string, unknown>;
    return Boolean(piv[ok]);
  });
}
function getItemKey(item: AnyRecord, idx: number): string | number {
  const id = isRecord(item) ? item['id'] : undefined;
  if (typeof id === 'string' || typeof id === 'number') return id;
  return idx;
}

// ====== Resumen inferior (ingresos/gastos/impuestos) ======
function parseNumber(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return 0;
    // Try standard parse
    const n1 = Number(s);
    if (Number.isFinite(n1)) return n1;
    // Try ES locale with comma decimals ("1.234,56")
    const normalized = s.replace(/\./g, '').replace(/,/g, '.');
    const n2 = Number(normalized);
    return Number.isFinite(n2) ? n2 : 0;
  }
  return 0;
}
function isTransferRow(row: Row): boolean {
  // Prefer explicit type id when available
  const typeId = Number((row as AnyRecord)['transaction_type_id']);
  if (Number.isFinite(typeId) && typeId === 4) return true;
  const tt = (row as AnyRecord)['transaction_type'] as AnyRecord | undefined;
  let name = '';
  let slug = '';
  if (tt && typeof tt === 'object') {
    const tto = tt as Record<string, unknown>;
    const rn = tto['name'];
    const rs = tto['slug'];
    name = typeof rn === 'string' ? rn : '';
    slug = typeof rs === 'string' ? rs : '';
  }
  const low = `${name} ${slug}`.toLowerCase();
  return low.includes('transfer') || low.includes('traspaso') || low.includes('transferencia');
}
const summary = computed(() => {
  let gastos = 0;
  let ingresos = 0;
  let impuestos = 0;
  const count = rows.value.length;
  for (const r of rows.value) {
    const amt = parseNumber((r as AnyRecord)['amount']);
    const tax = parseNumber((r as AnyRecord)['amount_tax']);
    const transfer = isTransferRow(r);
    if (!transfer) {
      if (amt < 0) gastos += Math.abs(amt);
      else if (amt > 0) ingresos += amt;
    }
    // Sum taxes when present; if expense, consider absolute
    if (tax) impuestos += Math.abs(tax);
  }
  const balance = ingresos - gastos;
  return { count, gastos, ingresos, impuestos, balance };
});
function formatMoney(n: number): string {
  const val = Number(n || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
  }).format(val);
}

// ===== Formato de celdas de Cantidad (principal moneda cuenta, secundario USD si difiere) =====
// (Obsoleto) helpers previos shouldConvertToUsd / amountInUsd reemplazados por showUsdUnderAmounts + formatAmountInUsd
// NUEVOS helpers para celda amount (principal = moneda cuenta, secundario USD)
const showUsdUnderAmounts = computed(
  () =>
    singleAccountSelected.value &&
    (singleAccountCurrencyCode.value || 'USD') !== (defaultCurrencyCode.value || 'USD')
);
// Suma de payments en la moneda de la cuenta seleccionada;
// si no hay selección única, retorna 0 (usaremos amount en USD como fallback)
function totalPaymentsForRow(row: Row): number {
  const pts = (row as Record<string, unknown>)['payment_transactions'];
  if (!Array.isArray(pts)) return 0;
  // Cuando no hay una sola cuenta seleccionada, devolvemos la suma simple (signos incluidos)
  if (!singleAccountSelected.value)
    return pts.reduce((acc, p) => acc + (toNumeric((p as AnyRecord)['amount']) ?? 0), 0);
  // Con una sola cuenta: sumar SOLO los payments de esa cuenta, ignorando moneda
  const targetAccountId = Number(singleAccountId.value ?? NaN);
  let sum = 0;
  for (const p of pts) {
    if (!p || typeof p !== 'object') continue;
    const pr = p as Record<string, unknown>;
    const amt = toNumeric(pr['amount']) ?? 0;
    // account_id directo o anidado
    let paId = toNumeric(pr['account_id']);
    if (paId == null) {
      const acc = pr['account'];
      if (acc && typeof acc === 'object') paId = toNumeric((acc as AnyRecord)['id']);
    }
    if (typeof paId === 'number' && Number.isFinite(paId) && paId === targetAccountId) sum += amt;
  }
  return sum;
}
// Formatos de la celda Amount
function formatAmountInAccountCurrency(row: Row): string {
  // Caso 1: una sola cuenta seleccionada -> mostrar suma de sus payments en su propia moneda
  if (singleAccountSelected.value) {
    const code = singleAccountCurrencyCode.value || 'USD';
    const amount = totalPaymentsForRow(row);
    return formatWithCodeSuffix(code, amount);
  }
  // Caso 2: sin cuenta seleccionada o selección múltiple
  //   - Si es transferencia: detectar moneda por defecto del usuario y mostrar el monto del payment con esa moneda
  //   - En otros tipos: mantener el comportamiento previo (amount en USD)
  const isTransfer = isTransferRow(row);
  if (isTransfer) {
    const defCode = (defaultCurrencyCode.value || 'USD').toUpperCase();
    const pts = (row as Record<string, unknown>)['payment_transactions'];
    if (Array.isArray(pts) && pts.length) {
      const match = pts.find((p: unknown) => {
        if (!p || typeof p !== 'object') return false;
        const code = paymentCurrencyCode(p as Record<string, unknown>);
        return (code || '').toUpperCase() === defCode;
      }) as Record<string, unknown> | undefined;
      if (match) {
        const amt = toNumeric(match['amount']) ?? 0;
        return formatWithCodeSuffix(defCode, amt);
      }
    }
  }
  // Fallback general (no transferencia o no se encontró payment con moneda por defecto): usar USD del registro
  const code = 'USD';
  const amount = toNumeric((row as Record<string, unknown>)['amount']) ?? 0; // USD
  return formatWithCodeSuffix(code, amount);
}
// ==== Conversión secundaria del Monto usando tasas internas por payment ====
// Extrae la tasa interna efectiva de un payment (prioridades: rate.current_rate, rate_value, user_currency.current_rate)
function extractInternalRate(payment: Record<string, unknown>): number | null {
  const rateObj = payment['rate'];
  if (rateObj && typeof rateObj === 'object') {
    const r = Number((rateObj as Record<string, unknown>)['current_rate']);
    if (Number.isFinite(r) && r > 0) return r;
  }
  const rateVal = Number(payment['rate_value']);
  if (Number.isFinite(rateVal) && rateVal > 0) return rateVal;
  const userCur = payment['user_currency'];
  if (userCur && typeof userCur === 'object') {
    const r2 = Number((userCur as Record<string, unknown>)['current_rate']);
    if (Number.isFinite(r2) && r2 > 0) return r2;
  }
  return null;
}

// Extrae el código ISO de moneda asociado a un payment
function paymentCurrencyCode(payment: Record<string, unknown>): string | null {
  // 1) Campo directo payment.currency.code
  const cur = payment['currency'];
  if (cur && typeof cur === 'object') {
    const code = (cur as Record<string, unknown>)['code'];
    if (typeof code === 'string' && code.trim()) return code.trim().toUpperCase();
  }
  // 2) payment.currency_code
  const codeDirect = payment['currency_code'];
  if (typeof codeDirect === 'string' && codeDirect.trim()) return codeDirect.trim().toUpperCase();
  // 3) payment.account.currency.code
  const acc = payment['account'];
  if (acc && typeof acc === 'object') {
    const accCur = (acc as Record<string, unknown>)['currency'];
    if (accCur && typeof accCur === 'object') {
      const code = (accCur as Record<string, unknown>)['code'];
      if (typeof code === 'string' && code.trim()) return code.trim().toUpperCase();
    }
  }
  // 4) payment.user_currency.currency.code
  const ucur = payment['user_currency'];
  if (ucur && typeof ucur === 'object') {
    const ucurCur = (ucur as Record<string, unknown>)['currency'];
    if (ucurCur && typeof ucurCur === 'object') {
      const code = (ucurCur as Record<string, unknown>)['code'];
      if (typeof code === 'string' && code.trim()) return code.trim().toUpperCase();
    }
  }
  return null;
}

// Helpers para detectar la posición del payment seleccionado en transferencias
function paymentAccountId(p: Record<string, unknown>): number | null {
  const direct = toNumeric(p['account_id']);
  if (typeof direct === 'number' && Number.isFinite(direct)) return direct;
  const acc = p['account'];
  if (acc && typeof acc === 'object') {
    const id = toNumeric((acc as Record<string, unknown>)['id']);
    if (typeof id === 'number' && Number.isFinite(id)) return id;
  }
  return null;
}
function selectedPaymentIndex(row: Row): number {
  if (!singleAccountSelected.value || !isTransferRow(row)) return -1;
  const pts = (row as Record<string, unknown>)['payment_transactions'];
  if (!Array.isArray(pts)) return -1;
  const selId = singleAccountId.value;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p || typeof p !== 'object') continue;
    const id = paymentAccountId(p as Record<string, unknown>);
    if (id != null && id === selId) return i; // 0 = origen, 1 = destino
  }
  return -1;
}
interface InternalPaymentTerm {
  amount: number;
  rate: number;
}
function collectInternalTerms(row: Row): InternalPaymentTerm[] {
  const out: InternalPaymentTerm[] = [];
  const pts = (row as Record<string, unknown>)['payment_transactions'];
  if (!Array.isArray(pts)) return out;
  const selIdx = selectedPaymentIndex(row);
  const txUsd = parseNumber((row as Record<string, unknown>)['amount']);
  const sign = txUsd < 0 ? -1 : 1; // usado solo cuando NO hay cuenta única
  const targetAccountId = Number(singleAccountId.value ?? NaN);
  for (const p of pts) {
    if (!p || typeof p !== 'object') continue;
    const pr = p as Record<string, unknown>;
    // Filtrar por cuenta cuando hay selección única
    if (singleAccountSelected.value) {
      let paId = toNumeric(pr['account_id']);
      if (paId == null) {
        const acc = pr['account'];
        if (acc && typeof acc === 'object') paId = toNumeric((acc as AnyRecord)['id']);
      }
      if (!(typeof paId === 'number' && Number.isFinite(paId) && paId === targetAccountId))
        continue;
    }
    const amt = toNumeric(pr['amount']) ?? 0;
    let rate = extractInternalRate(pr);
    if (rate && rate > 0) {
      // Lógica especial para transferencias en selección de una sola cuenta:
      // - Si el payment seleccionado es destino (índice 1), invertir la tasa para que
      //   amount / (1/rate) = amount * rate
      if (singleAccountSelected.value && isTransferRow(row) && selIdx === 1) {
        rate = 1 / rate;
      }
      out.push({ amount: singleAccountSelected.value ? amt : sign * amt, rate });
    }
  }
  return out;
}
function formatAmountConversionLine(row: Row): string {
  if (!showUsdUnderAmounts.value) return '';
  const srcCode = (singleAccountCurrencyCode.value || fallbackCurrencyCode()).toUpperCase();
  const dstCode = (defaultCurrencyCode.value || fallbackCurrencyCode()).toUpperCase();
  if (srcCode === dstCode) return '';
  const terms = collectInternalTerms(row);
  const rDst = getRatePerUsd(dstCode) ?? 1;
  const fmtRate = (n: number) =>
    n >= 1 ? Number(n.toFixed(2)).toString() : Number(n.toFixed(6)).toString();

  if (terms.length === 0) {
    // Fallback a lógica previa (usuario) cuando no hay tasas internas
    const srcAmount = totalPaymentsForRow(row);
    const rSrc = getRatePerUsd(srcCode);
    if (rSrc && rSrc > 0) {
      const usdAmount = srcAmount / rSrc;
      const dstAmount = usdAmount * rDst;
      if (dstCode === 'USD') {
        return `${dstCode}: ${formatCurrencyAmount(srcCode, srcAmount)} / ${fmtRate(
          rSrc
        )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
      }
      return `${dstCode}: ${formatCurrencyAmount(srcCode, srcAmount)} / ${fmtRate(
        rSrc
      )} × ${fmtRate(rDst)} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
    }
    const converted = convertAmountBetweenCurrencies(srcAmount, srcCode, dstCode);
    return `${dstCode}: ${formatCurrencyAmount(dstCode, converted)}`;
  }

  // Calcular USD sumando cada término amount/rate
  let usdTotal = 0;
  for (const t of terms) usdTotal += t.amount / t.rate;
  const dstAmount = dstCode === 'USD' ? usdTotal : usdTotal * rDst;

  if (terms.length === 1) {
    const t = terms[0]!; // length checked
    if (dstCode === 'USD') {
      return `${dstCode}: ${formatCurrencyAmount(srcCode, t.amount)} / ${fmtRate(
        t.rate
      )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
    }
    return `${dstCode}: ${formatCurrencyAmount(srcCode, t.amount)} / ${fmtRate(t.rate)} × ${fmtRate(
      rDst
    )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
  }

  // Fórmula abreviada para múltiples tasas: Σ(amt_i / rate_i)
  const termsStr = terms
    .map((t) => `${formatCurrencyAmount(srcCode, t.amount)} / ${fmtRate(t.rate)}`)
    .join(' + ');
  if (dstCode === 'USD') {
    return `${dstCode}: Σ(${termsStr}) = ${formatCurrencyAmount(dstCode, dstAmount)}`;
  }
  return `${dstCode}: Σ(${termsStr}) × ${fmtRate(rDst)} = ${formatCurrencyAmount(
    dstCode,
    dstAmount
  )}`;
}

// Helpers para celda balance corrido sin usar TS en el template
function balanceCellClass(row: Row): Array<string> {
  const amt = parseNumber((row as AnyRecord)['amount']);
  if (isTransferRow(row)) return ['balance-cell', 'balance-transfer'];
  return ['balance-cell', amt >= 0 ? 'balance-positive' : 'balance-negative'];
}
function formatRunningBalanceForRow(row: Row): string {
  const id = (row as AnyRecord)['id'] as string | number | undefined;
  const key = id ?? rows.value.indexOf(row);
  const val = runningBalanceMap.value[key];
  if (val == null) return '';
  // Mostrar siempre en la moneda de la cuenta si hay selección única; de lo contrario USD
  if (singleAccountSelected.value) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: singleAccountCurrencyCode.value || 'USD',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
      }).format(val);
    } catch {
      return `${val.toFixed(2)} ${singleAccountCurrencyCode.value || 'USD'}`;
    }
  }
  return formatMoney(val);
}

// Mostrar USD bajo el balance sólo si hay una cuenta seleccionada y su moneda difiere de la por defecto
const showUsdInRunningBalance = computed(
  () =>
    singleAccountSelected.value &&
    (singleAccountCurrencyCode.value || 'USD') !== (defaultCurrencyCode.value || 'USD')
);
function formatRunningBalanceConversionLine(row: Row): string {
  const id = (row as AnyRecord)['id'] as string | number | undefined;
  const key = id ?? rows.value.indexOf(row);
  const val = runningBalanceMap.value[key];
  if (val == null) return '';
  const srcCode = (singleAccountCurrencyCode.value || fallbackCurrencyCode()).toUpperCase();
  const dstCode = (defaultCurrencyCode.value || fallbackCurrencyCode()).toUpperCase();
  if (srcCode === dstCode) return '';
  // Intento simple: usar la tasa interna SI todos los payments de esta fila comparten la misma rate interna (>0)
  const terms = collectInternalTerms(row);
  const uniqueRates = Array.from(new Set(terms.map((t) => t.rate)));
  const fmtRate = (n: number) =>
    n >= 1 ? Number(n.toFixed(2)).toString() : Number(n.toFixed(6)).toString();
  const rDst = getRatePerUsd(dstCode) ?? 1;

  if (terms.length > 0 && uniqueRates.length === 1) {
    const internalRate = uniqueRates[0]!; // existe por length === 1
    // Convertimos el balance completo usando esa tasa homogénea (aproximación si varió históricamente)
    const usdApprox = val / internalRate;
    const dstAmount = dstCode === 'USD' ? usdApprox : usdApprox * rDst;
    if (dstCode === 'USD') {
      return `${dstCode}: ${formatCurrencyAmount(srcCode, val)} / ${fmtRate(
        internalRate
      )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
    }
    return `${dstCode}: ${formatCurrencyAmount(srcCode, val)} / ${fmtRate(
      internalRate
    )} × ${fmtRate(rDst)} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
  }

  // Fallback a la lógica de tasa de usuario (como antes) si no hay una única tasa interna
  const rSrc = getRatePerUsd(srcCode);
  const usdAmount = rSrc && rSrc > 0 ? val / rSrc : val;
  const dstAmount = dstCode === 'USD' ? usdAmount : usdAmount * rDst;
  if (rSrc && rSrc > 0) {
    if (dstCode === 'USD') {
      return `${dstCode}: ${formatCurrencyAmount(srcCode, val)} / ${fmtRate(
        rSrc
      )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
    }
    return `${dstCode}: ${formatCurrencyAmount(srcCode, val)} / ${fmtRate(rSrc)} × ${fmtRate(
      rDst
    )} = ${formatCurrencyAmount(dstCode, dstAmount)}`;
  }
  const converted = convertAmountBetweenCurrencies(val, srcCode, dstCode);
  return `${dstCode}: ${formatCurrencyAmount(dstCode, converted)}`;
}

// (removido) rateLabelUsed: se reemplazó por formatSingleAccountBalanceConversionLine()

function clearFilters(): void {
  filters.search = '';
  for (const f of dictionary.forms_filter) {
    (filters as Record<string, FilterValue>)[f.vmodel] = '';
  }
  txStore.setSelectedAccountIds([]);
  periodStore.setType('all');
  pagination.value.page = 1;
  void runFetch(true);
}

function getFilterDisplayValue(field: CrudField, value: FilterValue): string {
  if (value == null || value === '') return '';
  if (field.type === 'select') {
    const list = selectOptionsAll[field.vmodel] || [];
    const labelKey = field.select_label || 'name';
    const found = list.find((o) => String(o['id']) === String(value));
    if (found) return toStringLabel(found[labelKey]) || String(value);
  }
  return String(value);
}

const activeFilterChips = computed<ActiveFilterChip[]>(() => {
  const chips: ActiveFilterChip[] = [];
  if (filters.search) {
    chips.push({ key: '__search', label: 'Buscar', value: String(filters.search) });
  }
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    const val = (filters as Record<string, FilterValue>)[f.vmodel];
    if (val === undefined || val === null || val === '') continue;
    chips.push({
      key: f.vmodel,
      label: f.label,
      value: getFilterDisplayValue(f, val),
    });
  }
  if (Array.isArray(txStore.selectedAccountIds) && txStore.selectedAccountIds.length > 1) {
    chips.push({
      key: '__accounts_multi',
      label: 'Cuentas',
      value: `${txStore.selectedAccountIds.length} seleccionadas`,
    });
  }
  if (periodStore.state.type !== 'all') {
    chips.push({ key: '__period', label: 'Periodo', value: periodStore.label });
  }
  return chips;
});

type HeroStat = {
  key: string;
  label: string;
  value: string;
  caption: string;
  tone?: 'positive' | 'negative';
};

const heroStats = computed<HeroStat[]>(() => {
  if (isLegacyLayout.value) {
    return [
      {
        key: 'visible',
        label: 'Movimientos visibles',
        value: String(summary.value.count),
        caption: `${pagination.value.rowsNumber} en el resultado actual`,
      },
      {
        key: 'income',
        label: 'Ingresos',
        value: formatMoney(summary.value.ingresos),
        caption: 'Entradas del filtro actual',
        tone: 'positive',
      },
      {
        key: 'expense',
        label: 'Gastos',
        value: formatMoney(summary.value.gastos),
        caption: 'Incluye impuestos visibles',
        tone: 'negative',
      },
      {
        key: 'balance',
        label: 'Balance neto',
        value: formatMoney(summary.value.balance),
        caption: periodStore.label,
        tone: summary.value.balance >= 0 ? 'positive' : 'negative',
      },
    ];
  }

  if (isLiteLayout.value) {
    return [
      {
        key: 'balance',
        label: 'Balance neto',
        value: formatMoney(summary.value.balance),
        caption: periodStore.label,
        tone: summary.value.balance >= 0 ? 'positive' : 'negative',
      },
      {
        key: 'account',
        label: singleAccountSelected.value ? 'Cuenta activa' : 'Cobertura',
        value: selectedAccountDetail.value,
        caption: `${activeFilterChips.value.length} filtro(s) activos`,
      },
    ];
  }

  return [
    {
      key: 'visible',
      label: 'Movimientos visibles',
      value: String(summary.value.count),
      caption: `${pagination.value.rowsNumber} en el resultado actual`,
    },
    {
      key: 'balance',
      label: 'Balance neto',
      value: formatMoney(summary.value.balance),
      caption: periodStore.label,
      tone: summary.value.balance >= 0 ? 'positive' : 'negative',
    },
    {
      key: 'tax',
      label: 'Impuesto visible',
      value: formatMoney(summary.value.impuestos),
      caption: `${effectiveVisibleColumnNames.value.length - 1} columnas visibles`,
    },
  ];
});

const filtersPanelTitle = computed(() => {
  if (isLegacyLayout.value) return 'Filtros, columnas y workspace auxiliar';
  if (isLiteLayout.value) return 'Filtros compactos';
  return 'Filtros y enfoque rapido';
});

const filtersPanelDescription = computed(() => {
  if (isLegacyLayout.value) {
    return 'Legacy deja mas controles abiertos para operar sin esconder contexto secundario ni balance corrido.';
  }
  if (isLiteLayout.value) {
    return 'Lite resume la parte operativa para buscar, recortar el periodo y saltar a la tabla con menos ruido.';
  }
  return 'Busca, recorta el periodo y ajusta columnas sin salir del flujo principal.';
});

const secondaryPanelTitle = computed(() =>
  isLegacyLayout.value ? 'Panel auxiliar expandido' : 'Estado rapido'
);

const secondaryPanelDescription = computed(() => {
  if (isLegacyLayout.value) {
    return 'Legacy reserva una region lateral fija para mantener el estado operativo sin competir con la tabla principal.';
  }
  return 'Lo esencial para decidir tu siguiente accion desde esta vista.';
});

const compactWorkspaceItems = computed(() => [
  {
    label: 'Seleccion',
    value: selectedRows.value.length ? `${selectedRows.value.length} filas marcadas` : 'Sin seleccion',
    caption: 'Atajo visual para actuar sobre la tabla sin abrir otro panel.',
  },
  {
    label: 'Cuenta activa',
    value: selectedAccountDetail.value,
    caption: showRunningBalanceColumn.value && singleAccountBalance.value != null
      ? formatSingleAccountBalanceMain()
      : 'Sin balance corrido expandido',
  },
  {
    label: 'Periodo',
    value: periodStore.label,
    caption: `${activeFilterChips.value.length} filtro(s) activos en esta vista.`,
  },
]);

const tablePanelDescription = computed(() => {
  if (isLegacyLayout.value) {
    return 'Tabla completa con edicion rapida, balance corrido y un workspace lateral que no desaparece al profundizar.';
  }
  if (isLiteLayout.value) {
    return 'Tabla mas densa y directa para ejecutar acciones sin cargar una composicion secundaria completa.';
  }
  return 'Tabla completa con edicion rapida, balance corrido y exportacion directa.';
});

watch(
  activeLayoutMode,
  (mode) => {
    if (!activeFilterChips.value.length) {
      filtersExpanded.value = mode === 'legacy';
    }
  },
  { immediate: true }
);

function removeFilterChip(key: string): void {
  if (key === '__search') {
    filters.search = '';
  } else if (key === '__accounts_multi') {
    txStore.setSelectedAccountIds([]);
  } else if (key === '__period') {
    periodStore.setType('all');
  } else {
    (filters as Record<string, FilterValue>)[key] = '';
  }
  pagination.value.page = 1;
  void runFetch(true);
}

// ===== Métodos faltantes referenciados en template =====
function openNewFab(): void {
  ui.openNewTransactionDialog();
}
function handleBulkImported(count: number): void {
  showBulkImport.value = false;
  void fetchData();
  $q.notify({
    type: 'positive',
    message: `${count} transacciones importadas exitosamente`,
  });
}
// Selección de componente para filtros dinámicos (solo soportamos select/input/checkbox básicos)
function selectComponent(type: string) {
  switch (type) {
    case 'select':
      return 'q-select';
    case 'checkbox':
      return 'q-checkbox';
    case 'input':
    default:
      return 'q-input';
  }
}
function fieldProps(field: CrudField) {
  const base: Record<string, unknown> = {};
  if (field.type === 'select') {
    base.options = selectOptionsFiltered[field.vmodel] || [];
    base.optionValue = 'id';
    base.optionLabel = field.select_label || 'name';
    base.clearable = true;
    base.dense = true;
    base.filled = true;
    base.emitValue = true;
    base.mapOptions = true;
    base.useInput = true;
    base.inputDebounce = 0;
    base.onFilter = (val: string, done: (cb: () => void) => void) => {
      const list = selectOptionsAll[field.vmodel] || [];
      const needle = (val || '').toLowerCase();
      done(() => {
        selectOptionsFiltered[field.vmodel] = !needle
          ? list
          : list.filter((o) =>
              toStringLabel(o[field.select_label || 'name'])
                .toLowerCase()
                .includes(needle)
            );
      });
    };
  } else if (field.type === 'checkbox') {
    base.dense = true;
  } else {
    base.type = 'text';
    base.dense = true;
    base.filled = true;
    if (field.placeholder) base.placeholder = field.placeholder;
  }
  base.label = field.label;
  return base;
}
function edit(row: Record<string, unknown>) {
  const idRaw = row && row['id'];
  const id = Number(idRaw);
  console.log(id, idRaw);
  if (!Number.isFinite(id)) return;
  ui.openEditTransactionDialog(id);
}
function remove(row: Record<string, unknown>) {
  const idRaw = row && row['id'];
  const id = Number(idRaw);
  if (!Number.isFinite(id)) return;
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar la transacción seleccionada?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Ejecutar asincrónicamente sin retornar promesa al manejador de onOk
    void (async () => {
      try {
        await txStore.deleteTransaction(id);
        $q.notify({ type: 'positive', message: 'Transacción eliminada' });
        void runFetch(true);
        if (singleAccountSelected.value) void fetchSingleAccountBalance();
      } catch {
        $q.notify({ type: 'negative', message: 'Error eliminando transacción' });
      }
    })();
  });
}

function removeSelectedRows() {
  const ids = selectedRows.value
    .map((row) => Number((row as Record<string, unknown>)['id']))
    .filter((id) => Number.isFinite(id));

  if (!ids.length) {
    $q.notify({ type: 'warning', message: 'No hay transacciones seleccionadas' });
    return;
  }

  $q.dialog({
    title: 'Confirmar eliminación masiva',
    message: `¿Eliminar ${ids.length} transacción(es) seleccionada(s)?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      let deleted = 0;
      for (const id of ids) {
        try {
          await txStore.deleteTransaction(id);
          deleted++;
        } catch {
          // Continuar con las demás para evitar abortar toda la operación
        }
      }

      selectedRows.value = [];
      await runFetch(true);
      if (singleAccountSelected.value) void fetchSingleAccountBalance();

      if (deleted === ids.length) {
        $q.notify({ type: 'positive', message: `${deleted} transacciones eliminadas` });
      } else if (deleted > 0) {
        $q.notify({
          type: 'warning',
          message: `Se eliminaron ${deleted} de ${ids.length} transacciones`,
        });
      } else {
        $q.notify({ type: 'negative', message: 'No se pudo eliminar ninguna transacción' });
      }
    })();
  });
}

function exportCSV(): void {
  if (!rows.value?.length) return;
  const allCols = columns.value;
  const visibleSet = new Set(effectiveVisibleColumnNames.value);
  const visibleCols = allCols.filter((c) => c.name !== 'actions' && visibleSet.has(c.name));
  const header = visibleCols.map((c: ColumnDef) => c.label);
  const csv = [header.join(',')]
    .concat(
      rows.value.map((row) =>
        visibleCols
          .map((col: ColumnDef) => {
            let v: unknown;
            if (typeof col.field === 'function') {
              v = col.field(row);
            } else {
              v = row[col.field];
            }
            // aplicar format si existe para que el CSV refleje lo visible
            if (typeof col.format === 'function') {
              try {
                v = col.format(v);
              } catch {
                // ignore
              }
            }
            const val = typeof v === 'boolean' ? (v ? 'Sí' : 'No') : v ?? '';
            return JSON.stringify(val);
          })
          .join(',')
      )
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(dictionary.title || 'export').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>



<style scoped>
.transactions-lite {
  gap: 16px;
}

.transactions-lite__hero-heading {
  margin-bottom: 4px;
}

.transactions-lite__mode-chip {
  font-weight: 700;
}

.transactions-lite__sidebar-card,
.transactions-lite__hero-card,
.transactions-lite__filters-card,
.transactions-lite__compact-workspace-card,
.transactions-lite__focus-card,
.transactions-lite__table-card {
  border-radius: var(--radius-lg) !important;
}

.transactions-lite__eyebrow {
  color: var(--ow-color-primary-strong);
  letter-spacing: 0.06em;
}

.transactions-lite__sidebar-copy,
.transactions-lite__hero-text {
  line-height: 1.6;
}

.transactions-lite__hero-card {
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.22), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.92)) !important;
}

.body--dark .transactions-lite__hero-card {
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.18), transparent 32%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(8, 47, 73, 0.92)) !important;
}

.transactions-lite__hero-section {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
}

.transactions-lite__hero-copy {
  flex: 1 1 auto;
  min-width: 0;
}

.transactions-lite__hero-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  min-width: 260px;
}

.transactions-lite__primary-cta {
  min-height: 50px;
}

.transactions-lite__action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.transactions-lite__hero-stats {
  align-items: stretch;
}

.transactions-lite__hero-stat,
.transactions-lite__compact-workspace-item,
.transactions-lite__focus-item {
  padding: 14px;
  border-radius: var(--radius-md);
  min-height: 100%;
}

.transactions-lite__compact-workspace-card {
  border: 1px solid rgba(14, 165, 233, 0.14);
}

.transactions-lite__top-actions {
  justify-content: flex-end;
}

.transactions-lite__category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.transactions-lite__expansion-header {
  border-radius: var(--radius-md);
}

.transactions-lite__filter-chip {
  margin: 0 8px 8px 0;
}

.transactions-lite__table-card :deep(.q-table__top),
.transactions-lite__table-card :deep(.q-table__bottom) {
  padding-inline: 0;
}

.transactions-lite__table-card :deep(.q-table) {
  border-radius: var(--radius-md);
}

.sticky-sidebar {
  position: sticky;
  top: 12px;
  z-index: 1;
}

.sticky-sidebar--disabled {
  position: static;
  top: auto;
}

.cell-stack > div + div {
  margin-top: 2px;
}
/* Estilos para Balance y Cantidad según requerimiento */
.balance-cell {
  font-size: 14px;
}
.balance-positive {
  color: #2e7d32; /* verde */
  font-weight: 600;
}
.balance-negative {
  color: #c62828; /* rojo */
  font-weight: 600;
}
.balance-transfer {
  color: #000; /* negro */
  font-weight: 700; /* negritas */
}
.amount-main {
  font-variant-numeric: tabular-nums;
}
.amount-sub {
  font-size: 11px;
  opacity: 0.7;
}

.category-chip {
  opacity: 1 !important;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
  min-height: 32px;
  letter-spacing: 0.2px;
}

.category-chip:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}
.balance-main-line {
  line-height: 1.1;
}
.balance-sub-line {
  line-height: 1.1;
  font-size: 12px;
  opacity: 0.9;
}
.balance-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.rate-chip {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 6px;
}

.initial-balance-row td {
  background: rgba(0, 128, 96, 0.06);
  border-bottom: 2px dashed rgba(0, 128, 96, 0.25);
}
.current-balance-row td {
  background: rgba(0, 100, 200, 0.06);
  border-top: 2px dashed rgba(0, 100, 200, 0.25);
}

.transactions-page--legacy {
  gap: 20px;
}

.transactions-page--legacy .transactions-lite__hero-section {
  padding: 28px;
  gap: 28px;
}

.transactions-page--legacy .transactions-lite__hero-actions {
  min-width: 300px;
}

.transactions-page--legacy .transactions-lite__focus-card {
  position: sticky;
  top: 12px;
}

.transactions-page--pro .transactions-lite__focus-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.transactions-page--lite {
  gap: 12px;
}

.transactions-page--lite .transactions-lite__sidebar-card,
.transactions-page--lite .transactions-lite__filters-card,
.transactions-page--lite .transactions-lite__table-card {
  border-radius: var(--radius-md) !important;
}

.transactions-page--lite .transactions-lite__hero-section {
  padding: 18px 18px 16px;
  gap: 18px;
}

.transactions-page--lite .transactions-lite__hero-actions {
  min-width: 0;
}

.transactions-page--lite .transactions-lite__hero-stat,
.transactions-page--lite .transactions-lite__compact-workspace-item {
  padding: 12px;
}

.transactions-page--lite .transactions-lite__table-card :deep(.q-table th),
.transactions-page--lite .transactions-lite__table-card :deep(.q-table td) {
  padding-top: 8px;
  padding-bottom: 8px;
}

@media (max-width: 1439px) {
  .transactions-lite__hero-actions {
    min-width: 220px;
  }

  .transactions-page--legacy .transactions-lite__hero-actions {
    min-width: 260px;
  }
}

@media (max-width: 1023px) {
  .transactions-lite__hero-section {
    flex-direction: column;
  }

  .transactions-lite__hero-actions {
    width: 100%;
    min-width: 0;
  }

  .transactions-lite__top-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 599px) {
  .transactions-lite__action-grid {
    grid-template-columns: 1fr;
  }

  .transactions-lite__hero-section {
    padding: 18px;
  }
}
</style>
