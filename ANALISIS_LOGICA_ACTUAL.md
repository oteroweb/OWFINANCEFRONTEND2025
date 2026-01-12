# Análisis Exhaustivo de la Lógica Actual de Cántaros

## 1. Visión General

La implementación actual del sistema de cántaros es **exclusivamente de CONFIGURACIÓN y CATEGORIZACIÓN**. No existe sistema de balance, ajustes o tracking de transacciones. El sistema está diseñado para:

1. ✅ Crear y configurar cántaros (nombre, tipo, porcentaje/monto)
2. ✅ Asignar categorías a cántaros
3. ✅ Aplicar plantillas predefinidas
4. ✅ Persistir configuración en backend
5. ❌ NO calcula balances
6. ❌ NO registra ajustes
7. ❌ NO muestra historial de transacciones

---

## 2. Estructura de Datos Actual

### 2.1 Tipos TypeScript

```typescript
// Jar local (usado en la UI)
type Jar = {
  uid: string;              // ID único para Draggable (ej: "jar-123")
  id?: number;              // ID en BD (null = nuevo)
  name: string;             // "Ahorros", "Emergencias", etc
  percent?: number;         // Para tipo % (0-100)
  fixedAmount?: number;     // Para tipo fixed ($)
  type: 'percent' | 'fixed'; // Tipo de jar
  color?: string;           // Color hex (#FF5733)
  categories?: Array<{ id: string; label: string }>; // Categorías asignadas
  active?: boolean;         // Actividad (default true)
};

// API response (del backend)
type JarAPI = {
  id?: number;
  name?: string;
  percent?: number;
  type?: string;
  fixed_amount?: number;    // Backend usa snake_case
  amount?: number;          // Campo no usado actualmente
  categories?: Array<{ id: string | number; name?: string; label?: string }>;
  color?: string | null;
  sort_order?: number | null;
  active?: number | boolean | null;
  is_active?: number | boolean | null;
};

// Store (Pinia)
type JarLite = {
  uid: string;
  name: string;
  type: 'percent' | 'fixed';
  percent?: number;
  fixedAmount?: number;
  color?: string;
  active?: boolean;
};
```

### 2.2 Estado en Pinia Store (`stores/jars.ts`)

```typescript
export const useJarsStore = defineStore('jars', {
  state: () => ({
    jars: [] as JarLite[]  // Array simple de cántaros
  }),
  
  getters: {
    totalPercentage(): number {
      return (this.jars || [])
        .filter(j => j.type === 'percent' && (j.active ?? true))
        .reduce((sum, j) => sum + (Number(j.percent) || 0), 0);
    },
    
    hasFixedJar(): boolean {
      return (this.jars || []).some(j => j.type === 'fixed' && (j.active ?? true));
    },
    
    activeJars(): JarLite[] {
      return (this.jars || []).filter(j => j.active ?? true);
    }
  },
  
  actions: {
    setJars(arr: JarLite[]) {
      this.jars = arr;
    }
  }
});
```

**Limitaciones del Store:**
- Sin estado de balance
- Sin estado de ajustes
- Sin historial
- No sincrona con múltiples ventanas
- Sin persistencia local

---

## 3. Página Principal (`src/pages/user/jars/index.vue`)

### 3.1 Flujo de Datos

```
┌─────────────────────────────┐
│   onMounted()               │
├─────────────────────────────┤
│ Promise.all([              │
│   loadJarData(),           │ → GET /users/{id}/jars
│   loadCategoriesTree()     │ → GET /categories/tree
│ ])                         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ jarElements[] poblado       │
│ categoriesPropNodes[] listo │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  Render UI (Draggable)      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Usuario interactúa:         │
│  - Edita nombre             │
│  - Cambia tipo              │
│  - Arrastra categorías      │
│  - Reordena cántaros        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ saveChanges() on click      │ → POST /users/{id}/jars/save
└─────────────────────────────┘
```

### 3.2 Funciones Clave

#### `loadJarData()` (Lines 1000+)
```typescript
async function loadJarData() {
  const userId = auth.user?.id;
  if (!userId) return;
  
  const res = await api.get(`/users/${userId}/jars`);
  const data = res.data as JarAPI[];
  
  jarElements.value = (data || []).map((j) => ({
    uid: genUid(j.id),
    id: j.id,
    name: j.name || '',
    percent: j.percent,
    fixedAmount: j.fixed_amount,  // snake_case → camelCase
    type: j.type as 'percent' | 'fixed',
    color: j.color,
    categories: (j.categories || []).map((c) => ({
      id: String(c.id),
      label: c.label || c.name || ''
    })),
    active: j.active || j.is_active ? true : false
  }));
  
  serverJarIds.value = new Set(data.map(j => j.id).filter(Boolean));
}
```

#### `loadCategoriesTree()` (Lines 1000+)
```typescript
async function loadCategoriesTree() {
  const res = await api.get('/categories/tree');
  setCategories(res.data); // Procesa y construye mapa
}
```

#### `setCategories(nodes, updateMaster)` (Lines 1100+)
```typescript
function setCategories(nodes: CatNodeInput[], updateMaster = true) {
  if (!Array.isArray(nodes)) return;
  
  // Recorre árbol recursivamente
  const traverse = (arr: CatNodeInput[], parent?: string) => {
    (arr || []).forEach(node => {
      categoriesMap.value[node.id] = {
        id: node.id,
        label: node.label,
        type: node.type || 'category',
        parent,
        children: node.children?.map(c => c.id)
      };
      
      if (node.children?.length) {
        traverse(node.children, node.id);
      }
    });
  };
  
  traverse(nodes);
  if (updateMaster) categoriesMasterMap.value = { ...categoriesMap.value };
  categoriesPropNodes.value = nodes;
}
```

#### `saveChanges()` (Lines 1400+)
**Validaciones:**
1. Si hay jars de %, total debe ser 100% (a menos que haya jar fixed)
2. Checkea que usuario esté autenticado

**Payload:**
```typescript
{
  jars: [
    {
      id: number | null,          // null = crear
      name: string,
      type: 'percent' | 'fixed',
      percent: number | undefined,
      fixed_amount: number | undefined,
      color: string,
      sort_order: number,         // Índice + 1
      is_active: 0 | 1,
      category_ids: number[],     // IDs de categorías
      exclusive: boolean?          // Si es único jar % al 100%
    },
    ...
  ]
}
```

**POST:** `POST /users/{userId}/jars/save`

**Respuesta parseada:**
```typescript
// El backend retorna IDs nuevos para jars creados
{
  jars: [
    { temp_index: 0, id: 123 },  // Mapea nuevo ID
    { temp_index: 1, id: 124 },
    ...
  ]
}
// Luego hace reload: loadJarData()
```

### 3.3 Lógica Drag & Drop (Draggable)

#### Nivel 1: Reordenar Cántaros
```vue
<Draggable
  v-model="jarElements"
  group="jars"
  item-key="uid"
>
```
- Usa `uid` como key (stables)
- Actualiza `sort_order` al guardar
- Persiste en array local

#### Nivel 2: Mover Categorías Entre Cántaros
```vue
<Draggable
  v-model="jar.categories"
  group="categories"
  :move="onCategoryMove"
  @change="onCategoryChange"
>
```

##### `onCategoryMove(evt)` (Validación)
```typescript
function onCategoryMove(evt: DragMoveEvent): boolean {
  const { draggedContext, relatedContext } = evt;
  const draggedCat = draggedContext?.element;
  const targetList = relatedContext?.list;
  
  // Permitir si:
  if (!draggedCat) return true;
  
  // 1. Movimiento dentro del mismo jar
  if (draggedContext?.list === targetList) return true;
  
  // 2. Mover a otro jar que NO contenga ya esta categoría
  const alreadyInTarget = (targetList || []).some(c => c.id === draggedCat.id);
  return !alreadyInTarget; // true = permitir, false = bloquear
}
```

##### `onCategoryChange(evt)` (Post-cambio)
```typescript
function onCategoryChange(evt: DragChangeEvent) {
  const { added, removed } = evt;
  
  if (added) {
    // Deduplicar por si Draggable hizo clon
    // Remover de otros jars
    for (let i = 0; i < jarElements.value.length; i++) {
      if (i === targetIdx) continue;
      const jar = jarElements.value[i];
      jar.categories = jar.categories.filter(c => c.id !== added.id);
    }
  }
}
```

#### Nivel 3: Drag & Drop de Árbol → Jar
```vue
<div
  @dragover.prevent="onJarDragOver"
  @dragleave="onJarDragLeave"
  @drop.prevent="onJarDrop"
>
```

##### `onJarDragOver/Leave` (Visual feedback)
```typescript
function onJarDragOver(idx: number) {
  jarDropOverIndex.value = idx; // Resalta borde del jar
}

function onJarDragLeave(idx: number) {
  if (jarDropOverIndex.value === idx) {
    jarDropOverIndex.value = null;
  }
}
```

##### `onJarDrop(idx, ev)` (Soltar categoría en jar)
```typescript
function onJarDrop(idx: number, ev: DragEvent) {
  const data = ev.dataTransfer?.getData('application/json');
  const cat = JSON.parse(data) as { id: string; label: string };
  
  const targetJar = jarElements.value[idx];
  if (!targetJar) return;
  
  // Validar que no esté ya asignada
  const alreadyHas = targetJar.categories.some(c => c.id === cat.id);
  if (alreadyHas) {
    jarDropOverIndex.value = null;
    return;
  }
  
  // Agregar
  targetJar.categories.push(cat);
  
  // Remover de otros jars
  for (let i = 0; i < jarElements.value.length; i++) {
    if (i !== idx) {
      jarElements.value[i].categories = 
        jarElements.value[i].categories.filter(c => c.id !== cat.id);
    }
  }
  
  jarDropOverIndex.value = null;
}
```

### 3.4 Watchers y Computed

#### `totalPercentage` (Getter del Store)
```typescript
get totalPercentage() {
  return this.jars
    .filter(j => j.type === 'percent' && j.active)
    .reduce((sum, j) => sum + j.percent, 0);
}
```

#### `saveDisabled` (Computed)
```typescript
const saveDisabled = computed(() =>
  saving.value ||
  (!hasFixedJar.value &&
   hasActivePercentJars.value &&
   totalPercentage.value !== 100 &&
   !isExactlyOnePercent100())
);
```

#### Sincronización con Store (Watch)
```typescript
watch(jarElements, (val) => {
  jarsStore.setJars(
    (val || []).map(j => ({
      uid: j.uid,
      name: j.name,
      type: j.type,
      percent: j.percent,
      fixedAmount: j.fixedAmount,
      color: j.color,
      active: j.active ?? true
    }))
  );
}, { deep: true, immediate: true });
```

---

## 4. Componentes Relacionados

### 4.1 CategoriesTree (`components/CategoriesTree.vue`)
- **Props:** `nodes`, `readonly`, `columns`
- **Métodos expuestos:** `setTreeFlexible()`, `removeNode()`, `addCategoryToParent()`
- **Uso:** Renderizar árbol jerárquico de categorías (solo lectura en jars)

### 4.2 Draggable
- **Librería:** `vue-draggable-plus`
- **Conceptos:**
  - `group`: Agrupa elementos que pueden intercambiarse
  - `item-key`: ID único para cada item
  - `move(evt)`: Valida si movimiento es permitido
  - `change(evt)`: Se dispara después de cambio
  - `ghost-class`, `chosen-class`: Estilos durante drag

---

## 5. Endpoints API Actuales

| Método | Endpoint | Datos Enviados | Respuesta |
|--------|----------|----------------|-----------|
| GET | `/users/{id}/jars` | - | `JarAPI[]` |
| GET | `/categories/tree` | - | `CatNodeInput[]` |
| POST | `/users/{id}/jars/save` | `{ jars: [...] }` | `{ jars: [{id, temp_index}] }` |

---

## 6. Flujo Completo de Usuario

```
1. Usuario entra a /user/jars
   ↓
2. onMounted: loadJarData() + loadCategoriesTree()
   ↓
3. Renderiza grid de cántaros con controles
   ↓
4. Usuario:
   a) Edita nombre → jar.name cambia local
   b) Cambia tipo → jar.type muta
   c) Ajusta % → jar.percent actualiza
   d) Arrastra categoría entre jars → onCategoryChange()
   e) Reordena jars → jarElements[] reordena
   ↓
5. Hace click en "Guardar" → saveChanges()
   ↓
6. Validaciones:
   - Total % = 100 (si no hay fixed jar)
   - Usuario autenticado
   ↓
7. POST /users/{id}/jars/save con payload completo
   ↓
8. Backend crea/actualiza/elimina jars (bulk upsert)
   ↓
9. Retorna nuevos IDs
   ↓
10. Frontend mapea IDs locales
   ↓
11. loadJarData() para refresh
   ↓
12. q.notify("Cántaros guardados")
```

---

## 7. Variables de Estado Principales

```typescript
// Datos
const jarElements = ref<Jar[]>([]);           // Array de jars editables
const serverJarIds = ref<Set<number>>();     // IDs conocidos en BD
const categoriesPropNodes = ref<CatNodeInput[] | null>(); // Árbol de cats
const categoriesMap = ref<Record<string, CatInfo>>({}); // Lookup map
const categoriesMasterMap = ref<Record<string, CatInfo>>({}); // Master copia
const visibleFolders = ref<Set<string>>(new Set()); // Carpetas expandidas

// UI state
const saving = ref(false);                    // Muestra spinner
const jarDropOverIndex = ref<number | null>(); // Resalta jar en hover
const invalidCategoryDropIndex = ref<number | null>(); // (no usado)
const showTemplates = ref(false);             // Dialog de plantillas abierto
const loadingTemplates = ref(false);          // Carga de plantillas

// Computed
const saveDisabled = computed(...);           // Deshabilita botón guardar
const totalPercentage = computed(...);        // Del Store
const hasFixedJar = computed(...);            // Del Store
const hasActivePercentJars = computed(...);   // Filtra activos
```

---

## 8. Validaciones Actuales

### 8.1 Validación de Porcentajes
```typescript
if (!hasFixedJar.value && 
    hasActivePercentJars.value && 
    totalPercentage.value !== 100 && 
    !isExactlyOnePercent100()) {
  $q.notify({ type: 'warning', message: 'El total debe sumar 100%' });
  return;
}
```

### 8.2 Validación de Duplicados (DND)
- En `onCategoryMove()`: Evita duplicar categoría en mismo jar
- En `onCategoryChange()`: Deduplica por si Draggable clonó

### 8.3 Validación de Usuario
```typescript
const userId = auth.user?.id;
if (!userId) {
  $q.notify({ type: 'negative', message: 'Usuario no autenticado' });
  return;
}
```

---

## 9. Limitaciones y Gaps

### 9.1 Sin Balance
❌ No calcula: `balance = asignado - gastado + ajuste`
❌ No muestra dinero disponible por jar
❌ No integra con sistema de transacciones

### 9.2 Sin Ajustes
❌ No permite crear ajustes manuales
❌ No hay historial de cambios
❌ No hay `jar_adjustments` table

### 9.3 Sin Historiales
❌ No muestra transacciones por jar
❌ No hay breakdown de gastos
❌ No hay refresh mode (reset vs acumulativo)

### 9.4 Errores Potenciales
⚠️ Si backend retorna IDs no mapeables, no actualiza
⚠️ Si red falla durante drag, state queda inconsistente
⚠️ Sin rollback si POST falla

### 9.5 Mobile
✅ Layout responsive (grid 70%/30% → 1 col en <1024px)
❌ Sin balance display en mobile
❌ Controls con muchos inputs pueden no caber

---

## 10. Preparación para Nueva Lógica de Ajustes

### 10.1 Qué Permanece Igual
✅ Endpoint `GET /users/{id}/jars` (agregar campos)
✅ Endpoint `POST /users/{id}/jars/save` (no cambios)
✅ Componente CategoriesTree (reutilizable)
✅ DND para categorías (no afectada)
✅ Store jars.ts (extender, no reemplazar)
✅ Layout y estilos (mantener responsive)

### 10.2 Qué Se Debe Agregar
🔧 Nuevos campos en `Jar` type:
  - `asignado`: Monto asignado (suma de transacciones)
  - `gastado`: Monto gastado (suma de egresos)
  - `ajuste`: Monto de ajuste manual
  - `balance`: Calculado (asignado - gastado + ajuste)

🔧 Nuevos endpoints:
  - `GET /users/{id}/jars/{jarId}/balance`
  - `POST /users/{id}/jars/{jarId}/adjust`
  - `GET /users/{id}/jars/{jarId}/adjustments`
  - `POST /users/{id}/jars/{jarId}/reset-adjustment`

🔧 Nuevas secciones en UI:
  - Balance card por jar
  - Modal de ajustes
  - Historial de ajustes
  - Indicador de balance utilizado (%)

🔧 Nuevos componentes:
  - `JarCard.vue` - Display de balance
  - `AdjustmentModal.vue` - Formulario ajuste
  - `useJarBalance.ts` - Composable para balance

🔧 Extender Store:
  - Estado de balances
  - Estado de ajustes
  - Acciones para cargar balance
  - Acciones para crear ajustes

### 10.3 Puntos de Integración Críticos

#### Integración 1: Al Cargar Jars
```typescript
// Actual
async function loadJarData() {
  const res = await api.get(`/users/${userId}/jars`);
  // Mapear respuesta → jarElements

// Nuevo
async function loadJarData() {
  const res = await api.get(`/users/${userId}/jars`);
  // Mapear respuesta → jarElements
  // AGREGAR: Cargar balance para cada jar
  for (const jar of jarElements.value) {
    const balRes = await api.get(`/users/${userId}/jars/${jar.id}/balance`);
    jar.asignado = balRes.data.asignado;
    jar.gastado = balRes.data.gastado;
    jar.ajuste = balRes.data.ajuste;
    jar.balance = balRes.data.balance;
  }
}
```

#### Integración 2: Guardar Jars
```typescript
// Actual: Solo POST /users/{id}/jars/save
// Nuevo: Mismo endpoint, pero retorno incluye balance
```

#### Integración 3: UI de Balance
```vue
<!-- Nuevo: Debajo de cada control de jar -->
<q-card flat>
  <q-card-section>
    <JarCard :jar="jar" @adjust="openAdjustmentModal(jar)" />
  </q-card-section>
</q-card>
```

#### Integración 4: Modal de Ajustes
```vue
<!-- Nuevo: Dialog flotante -->
<q-dialog v-model="showAdjustmentModal">
  <AdjustmentModal :jar="currentJar" @save="saveAdjustment" />
</q-dialog>
```

---

## 11. Recomendaciones para Implementación

### 11.1 Orden de Cambios
1. ✅ Extender `stores/jars.ts` con balance state
2. ✅ Crear `composables/useJarBalance.ts`
3. ✅ Crear `components/JarCard.vue`
4. ✅ Crear `components/AdjustmentModal.vue`
5. ✅ Actualizar `pages/user/jars/index.vue` (agregar secciones)
6. ✅ Integrar endpoints nuevos
7. ✅ Testing y validación

### 11.2 Testing Points
- ✅ Balance calcula correctamente
- ✅ Ajuste positivo/negativo funciona
- ✅ Reset limpia ajuste
- ✅ Historial muestra cambios
- ✅ Mobile layout mantiene responsividad
- ✅ Validación: no permit ajuste > balance

### 11.3 Breaking Changes
**NONE** - Sistema actual completamente independiente, solo se extiende

---

## 12. Conclusión

La arquitectura actual es **sólida y extensible**. El sistema de configuración de cántaros está bien separado del futuro sistema de balance. El DND funciona correctamente con sus propias validaciones. El Store es minimalista pero funcional.

**Listos para proceder con implementación de sistema de ajustes sin riesgo de regresión.**
