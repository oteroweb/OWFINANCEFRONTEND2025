<template>
  <q-dialog
    v-model="showDialog"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    maximized
  >
    <q-card class="column" style="height: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Carga Masiva de Transacciones</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="col">
        <!-- Selector de Cuenta Única -->
        <div class="q-mb-md">
          <div class="row items-center gap-md">
            <div class="col-12 col-sm-auto">
              <q-select
                v-model="selectedAccountId"
                :options="accountOptions"
                option-label="name"
                option-value="id"
                outlined
                dense
                emit-value
                map-options
                use-input
                input-debounce="300"
                @filter="filterAccounts"
                label="Cuenta (aplica a todas las filas) *"
                hint="Requerido - todas las filas usarán esta cuenta"
                class="min-w-xs"
                :rules="[val => !!val || 'Debe seleccionar una cuenta']"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance_wallet" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sin resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div v-if="selectedAccount && needsRateForSelectedAccount" class="col-12 col-sm-auto">
              <q-chip
                removable
                color="warning"
                text-color="dark"
                class="text-caption"
              >
                ⚠️ Moneda: {{ selectedAccount?.currencyCode }} (requerirá TASA en cada fila)
              </q-chip>
            </div>
          </div>
        </div>
        
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="table" label="Tabla" />
          <q-tab name="excel" label="Excel" />
          <q-tab name="text" label="Texto" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="q-mt-md">
          <!-- TAB: Tabla -->
          <q-tab-panel name="table">
            <p class="text-caption text-grey-7">
              Agrega filas manualmente usando el botón de abajo.
            </p>
            <q-btn
              color="primary"
              label="Agregar Fila"
              icon="add"
              @click="addTableRow"
              class="q-mb-md"
            />
            <div v-if="tableRows.length > 0" class="q-mt-md" style="max-height: 400px; overflow-y: auto">
              <q-markup-table dense flat bordered>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th v-if="needsRateForSelectedAccount">Tasa</th>
                    <th>Categoría</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in tableRows" :key="idx">
                    <td>
                      <q-input v-model="row.date" dense type="date" />
                    </td>
                    <td>
                      <q-input v-model="row.name" dense placeholder="Concepto" />
                    </td>
                    <td>
                      <q-select
                        v-model="row.type"
                        :options="typeOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        emit-value
                        map-options
                        use-input
                        input-debounce="0"
                        @filter="filterTypes"
                      >
                        <template v-slot:prepend>
                          <q-icon name="swap_horiz" size="xs" />
                        </template>
                      </q-select>
                    </td>
                    <td>
                      <q-input v-model.number="row.amount" dense type="number" step="0.01" />
                    </td>
                    <td v-if="needsRateForSelectedAccount">
                      <q-input v-model.number="row.rate" dense type="number" step="0.0001" placeholder="1.0" />
                    </td>
                    <td>
                      <q-select
                        v-model="row.category_id"
                        :options="categoryOptions"
                        dense
                        option-value="id"
                        option-label="name"
                        emit-value
                        map-options
                        clearable
                        use-input
                        input-debounce="300"
                        @filter="filterCategories"
                      >
                        <template v-slot:prepend>
                          <q-icon name="category" size="xs" />
                        </template>
                      </q-select>
                    </td>
                    <td>
                      <q-btn
                        icon="delete"
                        flat
                        dense
                        color="negative"
                        size="sm"
                        @click="removeTableRow(idx)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-tab-panel>

          <!-- TAB: Excel -->
          <q-tab-panel name="excel">
            <p class="text-caption text-grey-7">
              Sube un archivo .xlsx. Se esperan columnas: Fecha, Concepto, Tipo, Monto, Cuenta, Categoría.
            </p>
            <q-file
              v-model="excelFile"
              label="Seleccionar archivo Excel"
              accept=".xlsx,.xls"
              @update:model-value="handleExcelFile"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div v-if="excelParsedRows.length > 0" class="q-mt-md">
              <p class="text-body2">
                <strong>{{ excelParsedRows.length }}</strong> filas detectadas.
              </p>
              <div style="height: 400px; overflow: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                <q-markup-table dense flat bordered>
                  <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                    <tr>
                      <th v-for="(col, idx) in excelDetectedColumns" :key="idx" :style="getColumnHeaderStyle(col)">
                        <span class="text-weight-bold">({{ idx + 1 }}) {{ col }}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in excelRawRows.slice(0, 100)" :key="idx">
                      <td v-for="col in excelDetectedColumns" :key="col" class="text-body2" style="min-width: 100px; word-break: break-word;" :style="getColumnBodyStyle(col)">
                        {{ row[col] }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </q-tab-panel>

          <!-- TAB: Texto -->
          <q-tab-panel name="text">
            <div class="row wrap gap-md items-center q-mb-md">
              <div>
                <p class="text-caption text-grey-7 q-mb-sm">
                  Pega texto separado por el delimitador elegido y nuevas líneas. <br />
                  Formato sugerido: <code>fecha{sep}concepto{sep}tipo{sep}monto{sep}tasa{sep}categoría</code>
                </p>
              </div>
              <q-select
                v-model="textSeparator"
                :options="separatorOptions"
                option-label="label"
                option-value="value"
                outlined
                dense
                emit-value
                map-options
                label="Delimitador"
                style="min-width: 180px"
              >
                <template v-slot:prepend>
                  <q-icon name="more_vert" />
                </template>
              </q-select>
            </div>
            <q-input
              v-model="textInput"
              type="textarea"
              rows="10"
              filled
              placeholder="Pega aquí tu texto..."
              @update:model-value="handleTextInput"
            />
            <div v-if="textParsedRows.length > 0" class="q-mt-md">
              <p class="text-body2">
                <strong>{{ textParsedRows.length }}</strong> filas parseadas (delimitador: <code>{{ textSeparator === "\t" ? 'TAB' : textSeparator }}</code>).
              </p>
              <div style="height: 300px; overflow: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                <q-markup-table dense flat bordered>
                  <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                    <tr>
                      <th v-for="(idx) in (textRawRows[0]?.length || 0)" :key="idx" :style="getColumnHeaderStyleByIndex(idx - 1)">
                        <span class="text-weight-bold">Columna {{ idx }}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, ridx) in textRawRows.slice(0, 100)" :key="ridx">
                      <td v-for="(cell, cidx) in row" :key="cidx" class="text-body2" style="min-width: 100px; word-break: break-word;" :style="getColumnBodyStyleByIndex(cidx)">
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <div v-if="showAdjustments" class="q-mt-lg q-pa-md bg-grey-1" style="border-radius: 8px;">
          <div class="text-h6 q-mb-md">Paso 2: Ajustes antes de importar</div>

          <!-- Mapeo de columnas -->
          <q-card v-if="activeTab !== 'table'" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">📋 Mapeo de columnas</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.date" 
                    :options="columnMappingOptions" 
                    label="📅 Fecha *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_today" />
                    </template>
                    <template v-slot:hint>
                      Selecciona 1 columna (fecha solamente)
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.name" 
                    :options="columnMappingOptions" 
                    label="📝 Concepto *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                    <template v-slot:hint>
                      Puedes seleccionar múltiples para concatenar
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.type" 
                    :options="columnMappingOptions" 
                    label="🏷️ Tipo *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" />
                    </template>
                    <template v-slot:hint>
                      income, expense, transfer
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.amount" 
                    :options="columnMappingOptions" 
                    label="💰 Monto *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" />
                    </template>
                    <template v-slot:hint>
                      Selecciona 1 columna (número solamente)
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.rate" 
                    :options="columnMappingOptions" 
                    label="💱 Tasa" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" />
                    </template>
                    <template v-slot:hint>
                      Opcional - necesario si hay transfer o moneda diferente
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.category" 
                    :options="columnMappingOptions" 
                    label="🗂️ Categoría" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="folder" />
                    </template>
                    <template v-slot:hint>
                      Opcional - puedes concatenar múltiples columnas
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="q-mt-md">
                <q-btn color="secondary" unelevated icon="sync" label="Aplicar mapeo" @click="applyColumnMapping" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Vista previa editable -->
          <q-card v-if="parsedRowsForPreview.length > 0" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1">👁️ Vista previa editable ({{ parsedRowsForPreview.length }} filas)</div>
                <q-badge color="info" :label="`${parsedRowsForPreview.length} filas cargadas`" />
              </div>
              <div style="max-height: 500px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                <table class="full-width" style="border-collapse: collapse;">
                  <thead style="position: sticky; top: 0; background: #f5f5f5; z-index: 1;">
                    <tr>
                      <th style="width: 40px; padding: 8px; text-align: center; border: 1px solid #ddd;"></th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 100px;">Fecha</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 150px;">Concepto</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 120px;">Tipo</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 100px;">Monto</th>
                      <th v-if="needsRateForSelectedAccount" style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 80px;">Tasa</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 120px;">Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in parsedRowsForPreview.slice(0, 50)" :key="`prev-${idx}`" style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 4px; text-align: center; border: 1px solid #ddd;">
                        <q-btn 
                          icon="delete" 
                          flat 
                          dense 
                          size="sm" 
                          color="negative" 
                          @click="removeRowFromPreview(idx)"
                        >
                          <q-tooltip>Eliminar fila</q-tooltip>
                        </q-btn>
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-input v-model="row.date" dense outlined type="date" style="width: 100%;" />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-input v-model="row.name" dense outlined style="width: 100%;" />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-select 
                          v-model="row.type" 
                          :options="['income', 'expense', 'transfer']" 
                          dense 
                          outlined 
                          emit-value 
                          style="width: 100%;"
                        />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-input v-model.number="row.amount" dense outlined type="number" step="0.01" style="width: 100%;" />
                      </td>
                      <td v-if="needsRateForSelectedAccount" style="padding: 6px; border: 1px solid #ddd;">
                        <q-input v-model.number="row.rate" dense outlined type="number" step="0.0001" style="width: 100%;" />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-select 
                          v-model="row.category_id" 
                          :options="categoryOptions" 
                          option-value="id" 
                          option-label="name" 
                          dense 
                          outlined 
                          emit-value 
                          map-options 
                          use-input
                          style="width: 100%;"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tasa por defecto -->
          <q-card v-if="needsRateForSelectedAccount" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">💱 Tasa por defecto (actual)</div>
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-input 
                    v-model.number="defaultRate" 
                    type="number" 
                    step="0.0001" 
                    outlined 
                    dense 
                    label="Tasa"
                  >
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6 col-md-auto">
                  <q-btn 
                    color="secondary" 
                    unelevated 
                    icon="refresh" 
                    label="Aplicar tasa a filas sin tasa" 
                    @click="applyDefaultRateToRows" 
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Asignación de categorías -->
          <q-card v-if="detectedCategoryNames.length > 0" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">🗂️ Asignación de categorías</div>
              <div v-for="catName in detectedCategoryNames" :key="`map-cat-${catName}`" class="q-mb-md">
                <div class="row q-col-gutter-md items-center">
                  <div class="col-12 col-sm-5">
                    <q-input 
                      :model-value="catName" 
                      dense 
                      outlined 
                      readonly 
                      label="Categoría detectada"
                    >
                      <template v-slot:prepend>
                        <q-icon name="label" color="orange" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-1 text-center">
                    <q-icon name="arrow_forward" size="sm" color="grey-6" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="categoryMappings[catName]"
                      :options="categoryOptions"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      dense
                      outlined
                      clearable
                      use-input
                      input-debounce="300"
                      @filter="filterCategories"
                      label="Asignar a"
                      placeholder="Buscar categoría..."
                    >
                      <template v-slot:prepend>
                        <q-icon name="folder" color="primary" />
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sin resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>
              <div class="q-mt-md">
                <q-btn 
                  color="secondary" 
                  unelevated 
                  icon="check_circle" 
                  label="Aplicar categorías" 
                  @click="applyCategoryMappings" 
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Espacio para evitar superposición de dropdowns con botones -->
          <div class="q-mb-xl" style="height: 200px;"></div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          v-if="hasData && !showAdjustments"
          color="secondary"
          outline
          label="Siguiente: Ajustes"
          @click="goToAdjustments"
        />
        <q-btn
          color="primary"
          label="Vista Previa (Dry Run)"
          @click="handleDryRun"
          :loading="processingDryRun"
          :disable="!hasData || !showAdjustments"
        />
        <q-btn
          color="positive"
          label="Importar Ahora"
          @click="handleImport"
          :loading="processingImport"
          :disable="!hasData || !showAdjustments"
        />
      </q-card-actions>

      <!-- Results Dialog -->
      <q-dialog v-model="showResults" persistent>
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">Resultado de la Importación</div>
          </q-card-section>
          <q-card-section>
            <div v-if="bulkResult">
              <p>
                <strong>Total:</strong> {{ bulkResult.total }} <br />
                <strong>Creadas:</strong>
                <span class="text-positive">{{ bulkResult.created }}</span> <br />
                <strong>Fallidas:</strong>
                <span class="text-negative">{{ bulkResult.failed }}</span>
              </p>
              <div v-if="bulkResult.failed > 0" class="q-mt-md">
                <p class="text-body2 text-negative">Errores:</p>
                <q-list dense bordered separator>
                  <q-item v-for="(res, idx) in failedResults" :key="`error-${idx}`">
                    <q-item-section>
                      <q-item-label overline>
                        Fila {{ res.index + 1 }} ({{ res.client_row_id || 'sin id' }})
                      </q-item-label>
                      <template v-if="res.errors">
                        <q-item-label caption v-for="(errs, field) in res.errors" :key="`err-${idx}-${String(field)}`">
                          <strong>{{ field }}:</strong> {{ formatFieldErrors(errs) }}
                        </q-item-label>
                        </template>
                      </q-item-section>
                    </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" v-close-popup @click="closeResults" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionsStore } from '../stores/transactions'
import { useTransactionForm } from 'src/composables/useTransactionForm'
import { api } from 'boot/axios'
import { read as xlsxRead, utils as xlsxUtils } from 'xlsx'
import { Notify } from 'quasar'

interface BulkResult {
  total: number
  created: number
  failed: number
  results: Array<{
    index: number
    client_row_id: string
    ok: boolean
    transaction_id?: number
    errors?: unknown
  }>
}

interface BulkFailedResult {
  index: number
  client_row_id: string | undefined
  ok: boolean
  errors: Record<string, unknown> | undefined
}

interface TransactionBulkRow {
  name: string
  date: string
  transaction_type_id?: number | null
  provider_id?: number | null
  category_id?: number | null
  include_in_balance?: boolean
  amount?: number | null
  description?: string | null
  items: Array<{
    name: string
    amount: number
    item_category_id?: number | null
    quantity?: number
  }>
  payments: Array<{
    account_id: number
    amount: number
    rate?: number | null
    is_current?: boolean | null
    is_official?: boolean | null
  }>
  client_row_id?: string
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', count: number): void
}>()

const transactionsStore = useTransactionsStore()

// Get accounts from composable
const { allAccounts, ensureAccountsLoaded } = useTransactionForm()

// Categories - load manually
type CategoryOption = { id: number; name: string }
const allCategories = ref<CategoryOption[]>([])
let categoriesLoaded = false

async function ensureCategoriesLoaded() {
  if (categoriesLoaded) return
  try {
    const res = await api.get('/categories', {
      params: { order_by: 'name', order_dir: 'asc' }
    })
    const data = (res.data?.data || res.data) as CategoryOption[]
    allCategories.value = data || []
    categoriesLoaded = true
  } catch (err) {
    console.warn('Error loading categories', err)
    categoriesLoaded = false
  }
}

// Load accounts and categories on mount
onMounted(async () => {
  await ensureAccountsLoaded()
  await ensureCategoriesLoaded()
})

const showDialog = ref(true)
const activeTab = ref<'table' | 'excel' | 'text'>('table')
const showAdjustments = ref(false)

// Account selection
const selectedAccountId = ref<number | null>(null)
const selectedAccount = computed(() => {
  if (!selectedAccountId.value) return null
  return allAccounts.value.find((a: { id: number; name: string; currencyCode?: string; currencyId?: number | null }) => a.id === selectedAccountId.value)
})
const needsRateForSelectedAccount = computed(() => {
  // Check if account currency is not the default user currency
  // For now, we assume any non-default is cross-currency
  // In a real implementation, we'd check user.default_currency_id or user.currency_code
  return selectedAccount.value && (selectedAccount.value.currencyCode !== 'USD' && selectedAccount.value.currencyCode !== 'ARS')
})

// Table mode
const tableRows = ref<Array<{
  date: string
  name: string
  type: string
  amount: number
  rate: number | null
  category_id: number | null
}>>([])

// Excel mode
const excelFile = ref<File | null>(null)
const excelParsedRows = ref<Array<Record<string, unknown>>>([])
const excelRawRows = ref<Array<Record<string, unknown>>>([])
const excelDetectedColumns = ref<string[]>([])

// Text mode
const textInput = ref('')
const textSeparator = ref<string>(';')
const textParsedRows = ref<Array<Record<string, unknown>>>([])
const textRawRows = ref<string[][]>([])

const defaultRate = ref<number>(1)
const categoryMappings = ref<Record<string, number | null>>({})
const columnMapping = ref<{
  date: string[]
  name: string[]
  type: string[]
  amount: string[]
  rate: string[]
  category: string[]
}>({
  date: [],
  name: [],
  type: [],
  amount: [],
  rate: [],
  category: []
})

// Results
const processingDryRun = ref(false)
const processingImport = ref(false)
const showResults = ref(false)
const bulkResult = ref<BulkResult | null>(null)

function safeText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function formatFieldErrors(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => safeText(entry)).filter(Boolean).join(', ')
  }
  return safeText(value)
}

const failedResults = computed<BulkFailedResult[]>(() => {
  if (!bulkResult.value?.results) return []
  return bulkResult.value.results
    .filter((res) => !res.ok)
    .map((res) => ({
      index: res.index,
      client_row_id: res.client_row_id,
      ok: res.ok,
      errors: typeof res.errors === 'object' && res.errors !== null ? (res.errors as Record<string, unknown>) : undefined
    }))
})

// Separator options for text mode
const separatorOptions = [
  { label: 'Punto y coma (;)', value: ';' },
  { label: 'Tabulador (TAB)', value: "\t" },
  { label: 'Coma (,)', value: ',' },
  { label: 'Pipe (|)', value: '|' }
]

// Options for select dropdowns
const accountOptions = computed(() => {
  return allAccounts.value.map((a: { id: number; name: string }) => ({ id: a.id, name: a.name }))
})
const categoryOptions = computed(() => {
  return allCategories.value.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }))
})

const columnMappingOptions = computed(() => {
  if (activeTab.value === 'excel') {
    return excelDetectedColumns.value.map((col, idx) => ({ label: `(${idx + 1}) ${col}`, value: col }))
  }
  if (activeTab.value === 'text') {
    const maxLen = textRawRows.value.reduce((acc, row) => Math.max(acc, row.length), 0)
    return Array.from({ length: maxLen }, (_, i) => ({ label: `Columna ${i + 1}`, value: String(i) }))
  }
  return []
})

const detectedCategoryNames = computed(() => {
  const sourceRows = activeTab.value === 'excel' ? excelParsedRows.value : activeTab.value === 'text' ? textParsedRows.value : []
  const names = sourceRows
    .map((row) => safeText(row.category_name).trim())
    .filter((name) => name.length > 0)
  return Array.from(new Set(names))
})

const parsedRowsForPreview = computed(() => {
  if (activeTab.value === 'table') return tableRows.value
  if (activeTab.value === 'excel') return excelParsedRows.value
  if (activeTab.value === 'text') return textParsedRows.value
  return []
})

const hasData = computed(() => {
  if (activeTab.value === 'table') return tableRows.value.length > 0
  if (activeTab.value === 'excel') return excelParsedRows.value.length > 0
  if (activeTab.value === 'text') return textParsedRows.value.length > 0
  return false
})

// Helper: Remove row from preview
function removeRowFromPreview(index: number) {
  if (activeTab.value === 'table') {
    tableRows.value.splice(index, 1)
  } else if (activeTab.value === 'excel') {
    excelParsedRows.value.splice(index, 1)
    excelRawRows.value.splice(index, 1)
  } else if (activeTab.value === 'text') {
    textParsedRows.value.splice(index, 1)
    textRawRows.value.splice(index, 1)
  }
  Notify.create({ type: 'info', message: `Fila ${index + 1} eliminada` })
}

// Helper: Get category display name
function getCategoryDisplay(row: Record<string, unknown> | { date: string; name: string; type: string; amount: number; rate: number | null; category_id: number | null }): string {
  if ('category_name' in row && row.category_name) {
    return safeText(row.category_name)
  }
  if ('category_id' in row && row.category_id) {
    const cat = allCategories.value.find((c) => c.id === row.category_id)
    return cat ? cat.name : ''
  }
  return ''
}

// Helper: Get column color based on mapping
function getColumnColor(colValue: string): { bg: string; text: string; color: string } {
  if (columnMapping.value.date.includes(colValue)) return { bg: '#E3F2FD', text: '#1976D2', color: 'blue' }
  if (columnMapping.value.name.includes(colValue)) return { bg: '#F0F4C3', text: '#F57F17', color: 'orange' }
  if (columnMapping.value.type.includes(colValue)) return { bg: '#FCE4EC', text: '#C2185B', color: 'red' }
  if (columnMapping.value.amount.includes(colValue)) return { bg: '#E8F5E9', text: '#388E3C', color: 'green' }
  if (columnMapping.value.rate.includes(colValue)) return { bg: '#F3E5F5', text: '#7B1FA2', color: 'purple' }
  if (columnMapping.value.category.includes(colValue)) return { bg: '#F5F5F5', text: '#616161', color: 'grey' }
  return { bg: 'transparent', text: 'inherit', color: '' }
}

function getColumnColorByIndex(idx: number): { bg: string; text: string; color: string } {
  const colStr = String(idx)
  if (columnMapping.value.date.includes(colStr)) return { bg: '#E3F2FD', text: '#1976D2', color: 'blue' }
  if (columnMapping.value.name.includes(colStr)) return { bg: '#F0F4C3', text: '#F57F17', color: 'orange' }
  if (columnMapping.value.type.includes(colStr)) return { bg: '#FCE4EC', text: '#C2185B', color: 'red' }
  if (columnMapping.value.amount.includes(colStr)) return { bg: '#E8F5E9', text: '#388E3C', color: 'green' }
  if (columnMapping.value.rate.includes(colStr)) return { bg: '#F3E5F5', text: '#7B1FA2', color: 'purple' }
  if (columnMapping.value.category.includes(colStr)) return { bg: '#F5F5F5', text: '#616161', color: 'grey' }
  return { bg: 'transparent', text: 'inherit', color: '' }
}

function getColumnHeaderStyle(col: string): string {
  const colors = getColumnColor(col)
  return `background-color: ${colors.bg}; color: ${colors.text}; font-weight: bold;`
}

function getColumnBodyStyle(col: string): string {
  const colors = getColumnColor(col)
  return `background-color: ${colors.bg};`
}

function getColumnHeaderStyleByIndex(idx: number): string {
  const colors = getColumnColorByIndex(idx)
  return `background-color: ${colors.bg}; color: ${colors.text}; font-weight: bold;`
}

function getColumnBodyStyleByIndex(idx: number): string {
  const colors = getColumnColorByIndex(idx)
  return `background-color: ${colors.bg};`
}

watch(activeTab, () => {
  showAdjustments.value = false
})

// Table functions
function addTableRow() {
  const today = new Date().toISOString()
  tableRows.value.push({
    date: today.split('T')[0] || today,
    name: '',
    type: 'expense',
    amount: 0,
    rate: needsRateForSelectedAccount.value ? 1 : null,
    category_id: null
  })
}

function removeTableRow(idx: number) {
  tableRows.value.splice(idx, 1)
}

// Excel parser
function handleExcelFile(file: File | null) {
  if (!file) {
    excelParsedRows.value = []
    excelRawRows.value = []
    excelDetectedColumns.value = []
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const workbook = xlsxRead(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0] || workbook.SheetNames[0]
      if (!sheetName) {
        Notify.create({ type: 'warning', message: 'No se encontraron hojas en el archivo Excel' })
        return
      }
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) {
        Notify.create({ type: 'warning', message: 'La hoja no contiene datos' })
        return
      }
      const json = xlsxUtils.sheet_to_json(sheet)

      excelRawRows.value = json as Array<Record<string, unknown>>
      const columns = new Set<string>()
      excelRawRows.value.forEach((row) => {
        Object.keys(row).forEach((key) => columns.add(String(key)))
      })
      excelDetectedColumns.value = Array.from(columns)
      initColumnMappingDefaults()
      applyColumnMapping()
      showAdjustments.value = false
    } catch (err) {
      console.error('Error parsing Excel', err)
      Notify.create({ type: 'negative', message: 'Error al parsear Excel' })
    }
  }
  reader.readAsBinaryString(file)
}

// Text parser
function handleTextInput(value: string | number | null) {
  const strValue = value != null ? String(value) : ''
  if (!strValue.trim()) {
    textParsedRows.value = []
    textRawRows.value = []
    return
  }
  const lines = strValue.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const sep = textSeparator.value
  textRawRows.value = lines.map((line) => line.split(sep).map(p => p.trim()))
  initColumnMappingDefaults()
  applyColumnMapping()
  showAdjustments.value = false
}

function initColumnMappingDefaults() {
  if (activeTab.value === 'excel') {
    const findCol = (candidates: string[]): string[] => {
      const lowered = excelDetectedColumns.value.map((c) => ({ raw: c, norm: c.toLowerCase() }))
      const found = lowered.find((c) => candidates.includes(c.norm))
      return found ? [found.raw] : []
    }
    columnMapping.value = {
      date: findCol(['fecha', 'date']),
      name: findCol(['concepto', 'name']),
      type: findCol(['tipo', 'type']),
      amount: findCol(['monto', 'amount']),
      rate: findCol(['tasa', 'rate']),
      category: findCol(['categoria', 'categoría', 'category'])
    }
    return
  }

  if (activeTab.value === 'text') {
    columnMapping.value = {
      date: ['0'],
      name: ['1'],
      type: ['2'],
      amount: ['3'],
      rate: ['4'],
      category: ['5']
    }
  }
}

function applyColumnMapping() {
  // Helper: concatenar múltiples columnas
  const concatColumns = (row: Record<string, unknown>, colNames: string[]): string => {
    return colNames
      .map((col) => safeText(row[col]).trim())
      .filter((val) => val.length > 0)
      .join(' ')
  }

  const concatColumnsText = (parts: string[], indices: number[]): string => {
    return indices
      .filter((idx) => idx >= 0 && idx < parts.length)
      .map((idx) => safeText(parts[idx]).trim())
      .filter((val) => val.length > 0)
      .join(' ')
  }

  if (activeTab.value === 'excel') {
    excelParsedRows.value = excelRawRows.value.map((row, idx) => {
      const mapped: Record<string, unknown> = {
        Fecha: columnMapping.value.date.length > 0 ? concatColumns(row, columnMapping.value.date) : '',
        Concepto: columnMapping.value.name.length > 0 ? concatColumns(row, columnMapping.value.name) : '',
        Tipo: columnMapping.value.type.length > 0 ? concatColumns(row, columnMapping.value.type) : '',
        Monto: columnMapping.value.amount.length > 0 ? concatColumns(row, columnMapping.value.amount) : '',
        Tasa: columnMapping.value.rate.length > 0 ? concatColumns(row, columnMapping.value.rate) || null : null,
        Categoría: columnMapping.value.category.length > 0 ? concatColumns(row, columnMapping.value.category) : ''
      }
      return normalizeRow(mapped, `excel-${idx}`)
    })
    Notify.create({ type: 'positive', message: 'Mapeo aplicado a filas Excel' })
    return
  }

  if (activeTab.value === 'text') {
    const safeIndex = (value: string) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : -1
    }

    const idxDate = columnMapping.value.date.map(safeIndex)
    const idxName = columnMapping.value.name.map(safeIndex)
    const idxType = columnMapping.value.type.map(safeIndex)
    const idxAmount = columnMapping.value.amount.map(safeIndex)
    const idxRate = columnMapping.value.rate.map(safeIndex)
    const idxCategory = columnMapping.value.category.map(safeIndex)

    textParsedRows.value = textRawRows.value.map((parts, idx) => {
      const mapped: Record<string, unknown> = {
        Fecha: concatColumnsText(parts, idxDate),
        Concepto: concatColumnsText(parts, idxName),
        Tipo: concatColumnsText(parts, idxType),
        Monto: concatColumnsText(parts, idxAmount),
        Tasa: concatColumnsText(parts, idxRate) || null,
        Categoría: concatColumnsText(parts, idxCategory)
      }
      return normalizeRow(mapped, `text-${idx}`)
    })
    Notify.create({ type: 'positive', message: 'Mapeo aplicado a filas de texto' })
  }
}

function applyDefaultRateToRows() {
  if (!defaultRate.value || Number(defaultRate.value) <= 0) {
    Notify.create({ type: 'warning', message: 'La tasa por defecto debe ser mayor a 0' })
    return
  }

  const applyTo = (rows: Array<Record<string, unknown>>) => {
    rows.forEach((row) => {
      const current = Number(row.rate)
      if (!Number.isFinite(current) || current <= 0) {
        row.rate = Number(defaultRate.value)
      }
    })
  }

  if (activeTab.value === 'table') applyTo(tableRows.value as unknown as Array<Record<string, unknown>>)
  if (activeTab.value === 'excel') applyTo(excelParsedRows.value)
  if (activeTab.value === 'text') applyTo(textParsedRows.value)

  Notify.create({ type: 'positive', message: 'Tasa por defecto aplicada a filas sin tasa' })
}

function applyCategoryMappings() {
  if (activeTab.value !== 'excel' && activeTab.value !== 'text') {
    return
  }

  const rows = activeTab.value === 'excel' ? excelParsedRows.value : textParsedRows.value
  rows.forEach((row) => {
    const key = safeText(row.category_name).trim()
    if (!key) return
    const mappedCategoryId = categoryMappings.value[key]
    if (mappedCategoryId) {
      row.category_id = mappedCategoryId
      const selected = allCategories.value.find((c) => c.id === mappedCategoryId)
      if (selected) row.category_name = selected.name
    }
  })

  Notify.create({ type: 'positive', message: 'Categorías aplicadas a filas detectadas' })
}

function goToAdjustments() {
  if (!hasData.value) return
  showAdjustments.value = true
  defaultRate.value = defaultRate.value > 0 ? defaultRate.value : 1
  detectedCategoryNames.value.forEach((name) => {
    if (!(name in categoryMappings.value)) {
      categoryMappings.value[name] = null
    }
  })
}

// Normalize row from different sources
function normalizeRow(row: Record<string, unknown>, clientId: string) {
  const dateRaw = row.Fecha || row.fecha || row.Date || row.date
  const date = typeof dateRaw === 'string' || typeof dateRaw === 'number' ? String(dateRaw) : ''
  const nameRaw = row.Concepto || row.concepto || row.Name || row.name
  const name = typeof nameRaw === 'string' || typeof nameRaw === 'number' ? String(nameRaw) : ''
  const typeRaw = row.Tipo || row.tipo || row.Type || row.type
  let type = ''
  if (typeof typeRaw === 'string') {
    type = typeRaw.toLowerCase()
  } else if (typeof typeRaw === 'number') {
    type = String(typeRaw)
  }
  const amountRaw = row.Monto || row.monto || row.Amount || row.amount
  const amountStr = typeof amountRaw === 'string' ? amountRaw : (typeof amountRaw === 'number' ? String(amountRaw) : '0')
  const amount = parseFloat(amountStr.replace(',', '.'))
  const categoryNameRaw = row.Categoría || row.categoria || row.Category || row.category
  const categoryName = typeof categoryNameRaw === 'string' || typeof categoryNameRaw === 'number' ? String(categoryNameRaw) : ''
  const rateRaw = row.Tasa || row.tasa || row.Rate || row.rate
  const rate = typeof rateRaw === 'string' || typeof rateRaw === 'number' ? parseFloat(String(rateRaw)) : null
  
  return {
    date,
    name,
    type,
    amount,
    category_name: categoryName,
    rate,
    client_row_id: clientId
  }
}

// Build payload
function buildPayload(dryRun: boolean) {
  if (!selectedAccountId.value) {
    throw new Error('Debes seleccionar una cuenta')
  }
  
  let rows: Array<TransactionBulkRow> = []
  
  if (activeTab.value === 'table') {
    rows = tableRows.value.map((row, idx) => buildRowPayload(row, `table-${idx}`))
  } else if (activeTab.value === 'excel') {
    rows = excelParsedRows.value.map((row) => buildRowPayloadFromNormalized(row))
  } else if (activeTab.value === 'text') {
    rows = textParsedRows.value.map((row) => buildRowPayloadFromNormalized(row))
  }
  
  return {
    mode: activeTab.value,
    dry_run: dryRun,
    rows
  }
}

function buildRowPayload(row: Record<string, unknown>, clientId: string): TransactionBulkRow {
  const isExpense = row.type === 'expense'
  const amount = isExpense ? -Math.abs(Number(row.amount)) : Math.abs(Number(row.amount))
  const nameValue = typeof row.name === 'string' || typeof row.name === 'number' ? String(row.name) : ''
  const rate = row.rate !== null && row.rate !== undefined ? Number(row.rate) : 1
  
  return {
    name: nameValue,
    date: String(row.date) + ' 12:00:00',
    category_id: row.category_id as number | null,
    include_in_balance: true,
    items: [
      {
        name: nameValue,
        amount: amount
      }
    ],
    payments: [
      {
        account_id: selectedAccountId.value as number,
        amount: amount,
        rate: rate
      }
    ],
    client_row_id: clientId
  }
}

function buildRowPayloadFromNormalized(row: Record<string, unknown>): TransactionBulkRow {
  const isExpense = String(row.type) === 'expense' || String(row.type) === 'egreso' || String(row.type) === 'gasto'
  const amount = isExpense ? -Math.abs(Number(row.amount)) : Math.abs(Number(row.amount))
  const nameValue = typeof row.name === 'string' || typeof row.name === 'number' ? String(row.name) : ''
  const clientRowId = typeof row.client_row_id === 'string' || typeof row.client_row_id === 'number' ? String(row.client_row_id) : ''
  const rate = row.rate !== null && row.rate !== undefined ? Number(row.rate) : 1
  
  const explicitCategoryId = Number(row.category_id)
  const hasExplicitCategoryId = Number.isFinite(explicitCategoryId) && explicitCategoryId > 0
  const category = allCategories.value.find((c: { id: number; name: string }) =>
    c.name.toLowerCase() === String(row.category_name).toLowerCase()
  )
  
  return {
    name: nameValue,
    date: String(row.date) + ' 12:00:00',
    category_id: hasExplicitCategoryId ? explicitCategoryId : (category?.id || null),
    include_in_balance: true,
    items: [
      {
        name: nameValue,
        amount: amount
      }
    ],
    payments: [
      {
        account_id: selectedAccountId.value as number,
        amount: amount,
        rate: rate
      }
    ],
    client_row_id: clientRowId
  }
}

// Handlers
async function handleDryRun() {
  processingDryRun.value = true
  try {
    const payload = buildPayload(true)
    const response = await transactionsStore.bulkAddTransactions(payload)
    bulkResult.value = response.data?.data
    showResults.value = true
  } catch (err: unknown) {
    console.error('Dry run error', err)
    const error = err as { response?: { data?: { message?: string } } }
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error en vista previa'
    })
  } finally {
    processingDryRun.value = false
  }
}

async function handleImport() {
  processingImport.value = true
  try {
    const payload = buildPayload(false)
    const response = await transactionsStore.bulkAddTransactions(payload)
    bulkResult.value = response.data?.data
    showResults.value = true
    
    if (bulkResult.value?.created && Number(bulkResult.value.created) > 0) {
      const created = Number(bulkResult.value.created)
      Notify.create({
        type: 'positive',
        message: `${created} transacciones creadas exitosamente`
      })
      emit('imported', created)
    }
  } catch (err: unknown) {
    console.error('Import error', err)
    const error = err as { response?: { data?: { message?: string } } }
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al importar'
    })
  } finally {
    processingImport.value = false
  }
}

function closeResults() {
  if (bulkResult.value?.created && bulkResult.value.created > 0) {
    // Close main dialog on success
    showDialog.value = false
    emit('close')
  }
}

// Filter functions for select inputs
const filteredAccounts = ref(accountOptions.value)
const filteredCategories = ref(categoryOptions.value)

const typeOptions = [
  { label: 'Ingreso', value: 'income' },
  { label: 'Egreso', value: 'expense' },
  { label: 'Transferencia', value: 'transfer' }
]
const filteredTypes = ref(typeOptions)

function filterAccounts(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredAccounts.value = needle
      ? accountOptions.value.filter((v: { name: string }) => v.name.toLowerCase().includes(needle))
      : accountOptions.value
  })
}

function filterTypes(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredTypes.value = needle
      ? typeOptions.filter((v) => v.label.toLowerCase().includes(needle))
      : typeOptions
  })
}

function filterCategories(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredCategories.value = needle
      ? categoryOptions.value.filter((v: { name: string }) => v.name.toLowerCase().includes(needle))
      : categoryOptions.value
  })
}

// Watch para actualizar filtros cuando cambien las opciones
watch(accountOptions, () => { filteredAccounts.value = accountOptions.value })
watch(categoryOptions, () => { filteredCategories.value = categoryOptions.value })
</script>
