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
                label="Cuenta (aplica a todas las filas)"
                class="min-w-xs"
              />
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
                        :options="['income', 'expense', 'transfer']"
                        dense
                        map-options
                        emit-value
                      />
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
                      />
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
              <div style="max-height: 400px; overflow-y: auto">
                <q-markup-table dense flat bordered>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th v-if="needsRateForSelectedAccount">Tasa</th>
                      <th>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in excelParsedRows.slice(0, 50)" :key="idx">
                      <td>{{ row.date }}</td>
                      <td>{{ row.name }}</td>
                      <td>{{ row.type }}</td>
                      <td>{{ row.amount }}</td>
                      <td v-if="needsRateForSelectedAccount">{{ row.rate ?? 1 }}</td>
                      <td>{{ row.category_name }}</td>
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
                  Formato: <code>fecha{sep}concepto{sep}tipo{sep}monto{sep}cuenta{sep}categoría</code>
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
                style="min-width: 180px"
              />
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
              <div style="max-height: 300px; overflow-y: auto">
                <q-markup-table dense flat bordered>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th v-if="needsRateForSelectedAccount">Tasa</th>
                      <th>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in textParsedRows.slice(0, 50)" :key="idx">
                      <td>{{ row.date }}</td>
                      <td>{{ row.name }}</td>
                      <td>{{ row.type }}</td>
                      <td>{{ row.amount }}</td>
                      <td v-if="needsRateForSelectedAccount">{{ row.rate ?? 1 }}</td>
                      <td>{{ row.category_name }}</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          color="primary"
          label="Vista Previa (Dry Run)"
          @click="handleDryRun"
          :loading="processingDryRun"
          :disable="!hasData"
        />
        <q-btn
          color="positive"
          label="Importar Ahora"
          @click="handleImport"
          :loading="processingImport"
          :disable="!hasData"
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
                  <q-item v-for="(res, idx) in bulkResult.results.filter((r: any) => !r.ok)" :key="`error-${idx}`">
                    <q-item-section>
                      <q-item-label overline>
                        Fila {{ res.index + 1 }} ({{ res.client_row_id || 'sin id' }})
                      </q-item-label>
                      <template v-if="res.errors">
                        <q-item-label caption v-for="(errs, field) in res.errors" :key="`err-${idx}-${String(field)}`">
                          <strong>{{ field }}:</strong> {{ Array.isArray(errs) ? errs.join(', ') : String(errs) }}
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
import { ref, computed, onMounted } from 'vue'
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

// Account selection
const selectedAccountId = ref<number | null>(null)
const selectedAccount = computed(() => {
  if (!selectedAccountId.value) return null
  return allAccounts.value.find((a: { id: number; name: string; currencyCode?: string; currencyId?: number }) => a.id === selectedAccountId.value)
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

// Text mode
const textInput = ref('')
const textSeparator = ref<string>(';')
const textParsedRows = ref<Array<Record<string, unknown>>>([])

// Results
const processingDryRun = ref(false)
const processingImport = ref(false)
const showResults = ref(false)
const bulkResult = ref<BulkResult | null>(null)

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

const hasData = computed(() => {
  if (activeTab.value === 'table') return tableRows.value.length > 0
  if (activeTab.value === 'excel') return excelParsedRows.value.length > 0
  if (activeTab.value === 'text') return textParsedRows.value.length > 0
  return false
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
      
      // Parse and normalize
      excelParsedRows.value = (json as Array<Record<string, unknown>>).map((row, idx) => {
        return normalizeRow(row, `excel-${idx}`)
      })
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
    return
  }
  const lines = strValue.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const sep = textSeparator.value
  textParsedRows.value = lines.map((line, idx) => {
    const parts = line.split(sep).map(p => p.trim())
    if (parts.length < 4) return null
    return normalizeRow({
      Fecha: parts[0] || '',
      Concepto: parts[1] || '',
      Tipo: parts[2] || '',
      Monto: parts[3] || '',
      Tasa: parts[4] || null,
      Categoría: parts[5] || '',
    }, `text-${idx}`)
  }).filter(r => r !== null)
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
  
  // Find category by name
  const category = allCategories.value.find((c: { id: number; name: string }) => 
    c.name.toLowerCase() === String(row.category_name).toLowerCase()
  )
  
  return {
    name: nameValue,
    date: String(row.date) + ' 12:00:00',
    category_id: category?.id || null,
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
</script>
