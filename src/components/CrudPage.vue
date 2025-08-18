<template>
  <q-page class="q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">{{ dictionary.title }}</div>
      </div>
      <div class="col-auto">
        <div class="row items-center q-gutter-sm">
          <q-btn flat icon="download" color="primary" @click="exportCSV" :disable="!rows.length">
            <q-tooltip>Exportar CSV</q-tooltip>
          </q-btn>
          <q-btn flat icon="filter_alt_off" color="secondary" @click="clearFilters" />
          <q-btn :label="dictionary.buttonNewLabel" color="primary" @click="openDialog" />
        </div>
      </div>
    </div>
    <!-- Búsqueda global -->
    <div class="row q-col-gutter-md items-start q-mb-md">
      <div class="col-4">
        <div class="text-caption q-mb-xs">{{ dictionary.finderLabel }}</div>
        <q-input
          class="full-width"
          dense
          filled
          debounce="300"
          v-model="filters.search"
          :placeholder="dictionary.finderLabel + '...'"
        >
          <template v-slot:append><q-icon name="search" /></template>
        </q-input>
      </div>
    </div>

    <!-- Filtros dinámicos -->
    <div class="q-pa-xs q-mb-md">
      <div class="row q-col-gutter-md items-start">
        <div
          v-for="field in dictionary.forms_filter"
          :key="field.id"
          :class="`col-${field.col || 12}`"
        >
          <component
            :is="selectComponent(field.type)"
            class="full-width"
            v-model="filters[field.vmodel]"
            v-bind="fieldProps(field)"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de datos -->
    <q-table
      :columns="columns"
      :rows="rows"
      :loading="loading"
      row-key="id"
      flat
      bordered
      class="shadow-1"
      v-model:pagination="pagination"
      @request="onRequest"
    >
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
              <span v-for="(item, idx) in props.row[col.key] || []" :key="getItemKey(item, idx)">
                {{ getItemLabel(item, col.labelKey) }}
                <span v-if="idx < props.row[col.key]?.length - 1">, </span>
              </span>
            </template>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo de creación/edición -->
    <q-dialog v-model="showDialog" @keydown.escape="showDialog = false">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ editing ? dictionary.window_update_title : dictionary.window_save_title }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="save">
            <component
              v-for="field in editing ? dictionary.forms_update : dictionary.forms_save"
              :key="field.id"
              :is="formComponent(field.type)"
              v-model="form[field.vmodel]"
              v-bind="fieldProps(field)"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="secondary" v-close-popup />
          <q-btn flat :label="dictionary.button_save_label" color="primary" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useQuasar, QInput, QSelect, QCheckbox } from 'quasar';
import { api } from 'boot/axios';
import type { QSelectProps, QInputProps } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';

// Definición de tipos para el diccionario CRUD
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
interface CrudDictionary {
  title: string;
  description: string;
  buttonNewLabel: string;
  finderLabel: string;
  // Endpoints de la API
  url_api: string;
  url_apis: string;
  // Optional: when present, queries and saves will include current user's id under this param (e.g., 'user_id')
  user_scoped_param?: string;
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

const props = defineProps<{ dictionary: CrudDictionary }>();
const dictionary = props.dictionary;
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Estado
type FilterValue = string | number | boolean | null | undefined;
type Filters = Record<string, FilterValue> & { search: string };
// Estado de filtros dinámicos (inicializa con search)
const filters = reactive<Filters>({ search: '' });
// Registros de la tabla
type Row = Record<string, unknown>;
const rows = ref<Row[]>([]);

// Columnas desde diccionario
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object' && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}
const columns = dictionary.columns.map((col) => ({
  name: col.key === 'actions' ? 'actions' : col.key,
  label: col.name,
  field: col.key.includes('.') ? (row: Row) => getByPath(row, col.key) : col.key,
  align: col.type === 'boolean' ? ('center' as const) : ('left' as const),
  sortable: col.key !== 'actions',
  ...(col.type === 'boolean'
    ? { format: (val: unknown, row: Row) => (val === true || val === 1 ? 'Sí' : 'No') }
    : {}),
  // Custom format for time column to display AM/PM
  ...(col.key === 'time'
    ? {
        format: (val: unknown, row: Row) => {
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
        format: (val: unknown, row: Row) => {
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

const loading = ref(false);
// Pagination: server-side compatible
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

const showDialog = ref(false);
const editing = ref(false);
type FormValue = string | number | boolean | null | undefined;
const form = reactive<Record<string, FormValue>>({});
const selectOptionsAll = reactive<Record<string, Array<Record<string, unknown>>>>({});
const selectOptionsFiltered = reactive<Record<string, Array<Record<string, unknown>>>>({});
const currentRowId = ref<number | null>(null);

// Util: obtener campos activos del formulario según modo
function currentFormFields() {
  return editing.value ? dictionary.forms_update : dictionary.forms_save;
}

// Componentes dinámicos
function selectComponent(type: string) {
  if (type === 'select') return QSelect;
  if (type === 'checkbox') return QCheckbox;
  return QInput;
}
function formComponent(type: string) {
  if (type === 'textarea') return QInput;
  if (type === 'checkbox') return QCheckbox;
  if (type === 'select') return QSelect;
  // por defecto usar QInput; mapear date/time a tipos nativos
  return QInput;
}

function toStringLabel(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
}

function fieldProps(field: CrudField): Partial<QSelectProps & QInputProps> {
  const isSelect = field.type === 'select';
  // Exceptional case: select with no vmodel_api, use static items list
  if (isSelect && !field.vmodel_api) {
    return {
      dense: true,
      filled: true,
      label: field.label,
      options: field.items as Array<Record<string, unknown>>,
      optionValue: 'value',
      optionLabel: 'label',
      emitValue: true,
      mapOptions: true,
      clearable: true,
    } as Partial<QSelectProps>;
  }
  const isTextarea = field.type === 'textarea';
  const isTime = field.type === 'time';
  const propsObj: Record<string, unknown> = {
    dense: true,
    ...(field.type !== 'checkbox' ? { filled: true } : {}),
    label: field.label,
  };
  if (isSelect) {
    propsObj.options = selectOptionsFiltered[field.vmodel] || [];
    propsObj.optionValue = 'id';
    propsObj.optionLabel = field.select_label || 'name';
    propsObj.emitValue = true;
    propsObj.mapOptions = true;
    propsObj.useInput = true;
    propsObj.newValueMode = 'add';
    propsObj.inputClass = 'text-body1';
    propsObj.clearable = true;
    propsObj.inputDebounce = 300;
    propsObj.behavior = 'menu';
    propsObj.popupContentClass = 'q-pa-sm';
    propsObj.behaviorTimeout = 0;
    propsObj.noOptionsLabel = 'Sin resultados';
    propsObj.onFilter = ((val, doneFn) => {
      const labelKey = field.select_label || 'name';
      const all = selectOptionsAll[field.vmodel] || [];
      const needle = String(val || '').toLowerCase();
      doneFn(() => {
        if (!needle) {
          selectOptionsFiltered[field.vmodel] = all;
        } else {
          selectOptionsFiltered[field.vmodel] = all.filter((opt: Record<string, unknown>) => {
            const raw = opt[labelKey];
            const lbl = toStringLabel(raw);
            return lbl.toLowerCase().includes(needle);
          });
        }
      });
    }) as QSelectProps['onFilter'];
  }
  if (field.type === 'date') Object.assign(propsObj, { type: 'date' as const });
  if (field.type === 'datetime') Object.assign(propsObj, { type: 'datetime-local' as const });
  if (isTextarea) Object.assign(propsObj, { type: 'textarea' as const });
  if (isTime) Object.assign(propsObj, { type: 'time' as const });
  return propsObj as Partial<QSelectProps & QInputProps>;
}

// Inicializar formulario con valores por defecto del diccionario
function resetForm(): void {
  Object.keys(form).forEach((k) => delete form[k]);
  for (const field of dictionary.forms_save) {
    form[field.vmodel] = field.value ?? (field.type === 'checkbox' ? false : '');
  }
  // sugerir usuario actual si el formulario tiene user_id
  if (Object.prototype.hasOwnProperty.call(form, 'user_id')) {
    const uid = authStore.user?.id ?? null;
    if (uid) form['user_id'] = uid;
  }
  currentRowId.value = null;
}

// Mapear row -> form para edición (incluye split de fecha/hora como en TransactionsPage)
function loadRowIntoForm(row: Row): void {
  Object.keys(form).forEach((k) => delete form[k]);
  for (const field of dictionary.forms_update) {
    const apiKey = field.vmodel_api || field.vmodel;
    const raw = (row as Record<string, unknown>)[apiKey];
    // Handle datetime-local fields: parse 'YYYY-MM-DD HH:mm:ss' into 'YYYY-MM-DDTHH:mm'
    if (field.type === 'datetime' && typeof raw === 'string') {
      const [datePart, timePart = ''] = raw.split(' ');
      const hhmm = timePart.slice(0, 5);
      form[field.vmodel] = (datePart && hhmm ? `${datePart}T${hhmm}` : datePart) as FormValue;
      continue;
    }
    // Handle checkbox: map 1/0 or boolean to true/false
    if (field.type === 'checkbox') {
      form[field.vmodel] = raw === 1 || raw === true;
      continue;
    }
    // Exceptional select with no vmodel_api: parse JSON string to get its 'value'
    if (field.type === 'select' && !field.vmodel_api && typeof raw === 'string') {
      try {
        const obj = JSON.parse(raw);
        form[field.vmodel] = (obj.value as FormValue) ?? '';
      } catch {
        form[field.vmodel] = '';
      }
      continue;
    }
    // Default mapping
    const fromApi = raw;
    const fromVModel = (row as Record<string, unknown>)[field.vmodel];
    const val: unknown = fromApi ?? fromVModel;
    form[field.vmodel] = (val as FormValue) ?? '';
  }
  const maybeId = (row as Record<string, unknown>)['id'];
  currentRowId.value = typeof maybeId === 'number' ? maybeId : null;
}

function openDialog(): void {
  editing.value = false;
  resetForm();
  showDialog.value = true;
}
function edit(row: Row): void {
  editing.value = true;
  loadRowIntoForm(row);
  showDialog.value = true;
}

// Construir payload usando vmodel_api y uniendo fecha+hora como en TransactionsPage
function buildPayload(): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const fields = currentFormFields();
  for (const field of fields) {
    const apiKey = field.vmodel_api || field.vmodel;
    payload[apiKey] = form[field.vmodel];
  }
  // Convert checkbox boolean values to numeric 1 or 0
  for (const field of fields) {
    if (field.type === 'checkbox') {
      const apiKey = field.vmodel_api || field.vmodel;
      const val = payload[apiKey];
      if (typeof val === 'boolean') {
        payload[apiKey] = val ? 1 : 0;
      }
    }
  }
  // Exceptional select: parse object values to raw value for selects with no vmodel_api
  for (const field of fields) {
    if (field.type === 'select' && !field.vmodel_api) {
      const apiKey = field.vmodel_api || field.vmodel;
      const v = payload[apiKey];
      if (v && typeof v === 'object' && 'value' in (v as Record<string, unknown>)) {
        payload[apiKey] = (v as Record<string, unknown>).value;
      }
    }
  }
  // Special case: ensure 'align' is primitive value
  if ('align' in payload && typeof payload.align === 'object' && payload.align != null) {
    try {
      payload.align = (payload.align as Record<string, unknown>).value;
    } catch {
      // ignore
    }
  }
  // Add seconds to datetime-local values for datetime fields
  for (const field of fields) {
    if (field.type === 'datetime') {
      const apiKey = field.vmodel_api || field.vmodel;
      const val = payload[apiKey];
      if (typeof val === 'string' && !val.endsWith(':00')) {
        payload[apiKey] = `${val}:00`;
      }
    }
  }
  // incluir id en actualizaciones si existe
  if (editing.value && currentRowId.value) {
    payload['id'] = currentRowId.value;
  }
  return payload;
}

function getNumberProp(obj: unknown, key: string): number | undefined {
  if (obj && typeof obj === 'object') {
    const val = (obj as Record<string, unknown>)[key];
    if (typeof val === 'number') return val;
  }
  return undefined;
}

async function remove(row: unknown): Promise<void> {
  try {
    const id = getNumberProp(row, 'id');
    if (!id) {
      $q.notify({ type: 'warning', message: 'ID no válido' });
      return;
    }
    await api.delete(`/${dictionary.url_apis}/${id}`);
    $q.notify({ type: 'negative', message: 'Registro eliminado' });
    await onRequest({ pagination: pagination.value });
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al eliminar' });
  }
}

async function save(): Promise<void> {
  try {
    // Validaciones mínimas según diccionario actual
    const required: string[] = [];
    const vmKeys = (editing.value ? dictionary.forms_update : dictionary.forms_save).map(
      (f) => f.vmodel
    );
    // reglas básicas para este CRUD
    if (vmKeys.includes('name') && !form['name']) required.push('Nombre');
    if (vmKeys.includes('amount') && (form['amount'] === '' || form['amount'] === null))
      required.push('Cantidad');
    if (vmKeys.includes('date') && !form['date']) required.push('Fecha');
    if (vmKeys.includes('time') && !form['time']) required.push('Hora');
    if (required.length) {
      $q.notify({ type: 'warning', message: `Faltan: ${required.join(', ')}` });
      return;
    }
    const payload = buildPayload();
    // Ensure user scoping in payload if requested by dictionary
    if (dictionary.user_scoped_param) {
      const key = dictionary.user_scoped_param;
      if (authStore.user?.id && (payload[key] == null || payload[key] === '')) {
        payload[key] = authStore.user.id;
      }
    }
    let res;
    if (editing.value && currentRowId.value) {
      res = await api.put(`/${dictionary.url_apis}/${currentRowId.value}`, payload);
      $q.notify({ type: 'positive', message: 'Actualizado correctamente' });
    } else {
      res = await api.post(`/${dictionary.url_apis}`, payload);
      $q.notify({ type: 'positive', message: 'Creado correctamente' });
    }
    showDialog.value = false;
    await onRequest({ pagination: pagination.value });
  } catch (err: unknown) {
    let message = 'Error al guardar';
    if (err && typeof err === 'object') {
      const maybe = err as { message?: unknown };
      if (typeof maybe.message === 'string') message = maybe.message;
    }
    $q.notify({ type: 'negative', message });
  }
}

// onRequest: copia de la lógica de TransactionsPage adaptada al diccionario
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
  // Apply user scoping if configured
  if (dictionary.user_scoped_param && authStore.user?.id) {
    params[dictionary.user_scoped_param] = authStore.user.id;
  }

  // Añadir filtros mapeando vmodel -> vmodel_api
  for (const f of dictionary.forms_filter) {
    const val = (filters as Record<string, FilterValue>)[f.vmodel];
    if (val !== undefined && val !== null && val !== '') {
      params[f.vmodel_api || f.vmodel] = val;
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
  await fetchData(buildQueryParams());
}

// Función genérica para cargar datos (ahora acepta params y actualiza rowsNumber)
async function fetchData(params?: Record<string, unknown>): Promise<void> {
  loading.value = true;
  try {
    const res = await api.get(`/${dictionary.url_apis}`, { params: params || { ...filters } });
    const data: unknown = res.data;
    let arr: Row[] = [];
    if (Array.isArray(data)) {
      arr = data as Row[];
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      // Direct common keys
      if (Array.isArray(obj.data)) arr = obj.data as Row[];
      else if (Array.isArray(obj.items)) arr = obj.items as Row[];
      else if (Array.isArray(obj.results)) arr = obj.results as Row[];
      else if (Array.isArray(obj.rows)) arr = obj.rows as Row[];
      else if (Array.isArray(obj.records)) arr = obj.records as Row[];
      else if (Array.isArray(obj.transactions)) arr = obj.transactions as Row[];
      // Nested under data: { data: { data: [...] } }
      else if (obj.data && typeof obj.data === 'object') {
        const inner = obj.data as Record<string, unknown>;
        if (Array.isArray(inner.data)) arr = inner.data as Row[];
        else if (Array.isArray(inner.items)) arr = inner.items as Row[];
        else if (Array.isArray(inner.results)) arr = inner.results as Row[];
        else if (Array.isArray(inner.rows)) arr = inner.rows as Row[];
        else if (Array.isArray(inner.records)) arr = inner.records as Row[];
        else if (Array.isArray(inner.transactions)) arr = inner.transactions as Row[];
      }
    }
    rows.value = arr;
    // intentar hallar total de forma segura
    let total = arr.length;
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      const meta = (obj['meta'] as Record<string, unknown> | undefined) || undefined;
      const paginationObj = (obj['pagination'] as Record<string, unknown> | undefined) || undefined;
      let rawTotal =
        (meta ? meta['total'] : undefined) ??
        (paginationObj ? paginationObj['total'] : undefined) ??
        obj['total'];
      // also check nested data.total
      if (rawTotal === undefined && obj.data && typeof obj.data === 'object') {
        const inner = obj.data as Record<string, unknown>;
        rawTotal = inner['total'];
      }
      if (typeof rawTotal === 'number') total = rawTotal;
      else if (typeof rawTotal === 'string' && rawTotal.trim() !== '') {
        const n = Number(rawTotal);
        if (Number.isFinite(n)) total = n;
      }
    }
    pagination.value.rowsNumber = Number(total) || 0;
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error cargando datos' });
  } finally {
    loading.value = false;
  }
}

// Petición inicial y carga de selects
onMounted(async () => {
  // inicializar buscador desde la URL
  const initialSearch = (route.query.search as string) || '';
  filters.search = initialSearch;
  // inicializar filtros con valores por defecto del diccionario
  for (const f of dictionary.forms_filter) {
    (filters as Record<string, FilterValue>)[f.vmodel] = (f.value as FilterValue) ?? '';
  }
  // aplicar valores de la URL a filtros (si existen en query)
  for (const f of dictionary.forms_filter) {
    const key = f.vmodel_api || f.vmodel;
    const raw = route.query[key];
    if (raw == null) continue;
    let v: FilterValue = Array.isArray(raw) ? raw[0] : raw;
    if (f.type === 'checkbox') {
      const s = String(v).toLowerCase();
      v = s === 'true' || s === '1';
    } else if (f.type === 'select') {
      // intentar convertir ID numérico
      const n = Number(v);
      v = Number.isFinite(n) ? n : (v as string);
    } else {
      v = v as string;
    }
    (filters as Record<string, FilterValue>)[f.vmodel] = v;
  }
  // helper para ordenar y setear opciones (alfabéticamente por select_label/name)
  const setOptions = (field: CrudField, list: Array<Record<string, unknown>>) => {
    const labelKey = field.select_label || 'name';
    const sorted = [...list].sort((a, b) => {
      const la = toStringLabel(a[labelKey]).toLowerCase();
      const lb = toStringLabel(b[labelKey]).toLowerCase();
      return la.localeCompare(lb, undefined, { numeric: true });
    });
    selectOptionsAll[field.vmodel] = sorted;
    selectOptionsFiltered[field.vmodel] = sorted;
  };

  // cargar opciones para selects de filtros y formularios
  for (const field of dictionary.forms_filter.concat(
    dictionary.forms_save,
    dictionary.forms_update
  )) {
    if (field.type !== 'select') continue;
    try {
      if (field.vmodel_url) {
        const params: Record<string, unknown> = {};
        if (field.order_by) {
          params.order_by = field.order_by;
          params.order_dir = field.order_dir || 'asc';
        }
        // Apply user scoping to select options if configured
        if (dictionary.user_scoped_param && authStore.user?.id) {
          params[dictionary.user_scoped_param] = authStore.user.id;
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
  // inicializar tabla con server request
  await onRequest({ pagination: pagination.value });
});

// Re-fetch y sincronizar filtros (incluye search) con la URL
watch(
  () => ({ ...filters }),
  (vals) => {
    // actualizar ruta con filtros no vacíos
    const nextQuery: Record<string, string> = {};
    if (vals.search) nextQuery.search = String(vals.search);
    for (const f of dictionary.forms_filter) {
      const val = (vals as Record<string, FilterValue>)[f.vmodel];
      if (val !== undefined && val !== null && val !== '') {
        const key = f.vmodel_api || f.vmodel;
        nextQuery[key] = String(val);
      }
    }
    void router.replace({ query: nextQuery });

    // refrescar tabla
    pagination.value.page = 1;
    void onRequest({ pagination: pagination.value });
  },
  { deep: true }
);

const manyToManyColumns = computed(() => dictionary.columns.filter((col) => col.manyToMany));

// Helpers for many-to-many rendering with type guards
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

function clearFilters(): void {
  // limpiar buscador y filtros select
  filters.search = '';
  for (const f of dictionary.forms_filter) {
    (filters as Record<string, FilterValue>)[f.vmodel] = '';
  }
  pagination.value.page = 1;
  void onRequest({ pagination: pagination.value });
}

function exportCSV(): void {
  if (!rows.value?.length) return;
  const visibleCols = columns.filter((c) => c.name !== 'actions');
  const header = visibleCols.map((c) => c.label);
  const csv = [header.join(',')]
    .concat(
      rows.value.map((row) =>
        visibleCols
          .map((col) => {
            let v: unknown;
            if (typeof col.field === 'function') {
              v = col.field(row);
            } else {
              v = row[col.field];
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

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'CrudPage' });
</script>
