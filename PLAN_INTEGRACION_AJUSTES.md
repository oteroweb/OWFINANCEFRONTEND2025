# Plan de Integración del Sistema de Ajustes en Página de Jars

## Cambios Necesarios en `/src/pages/user/jars/index.vue`

### 1. Agregar Imports

En la sección `<script setup>`:

```typescript
import { useJarBalance } from 'composables/useJarBalance';
import JarCard from 'components/JarCard.vue';
import AdjustmentModal from 'components/AdjustmentModal.vue';
```

### 2. Agregar Estado para Balance

```typescript
// Balance per jar
const jarBalances = ref<Record<number, ReturnType<typeof useJarBalance>>>({});
const showAdjustmentModal = ref(false);
const currentJarAdjustment = ref<number | null>(null);

// Track which jars have balance loaded
const loadedBalances = ref<Set<number>>(new Set());
```

### 3. Modificar función `loadJarData()`

**Antes:**
```typescript
async function loadJarData() {
  const userId = auth.user?.id;
  if (!userId) return;
  
  const res = await api.get(`/users/${userId}/jars`);
  const data = res.data as JarAPI[];
  
  jarElements.value = (data || []).map((j) => ({
    // ... mapping
  }));
  
  serverJarIds.value = new Set(data.map(j => j.id).filter(Boolean));
}
```

**Después:**
```typescript
async function loadJarData() {
  const userId = auth.user?.id;
  if (!userId) return;
  
  const res = await api.get(`/users/${userId}/jars`);
  const data = res.data as JarAPI[];
  
  jarElements.value = (data || []).map((j) => ({
    // ... mapping existente
  }));
  
  serverJarIds.value = new Set(data.map(j => j.id).filter(Boolean));
  
  // AGREGAR: Cargar balances para cada jar
  for (const jar of jarElements.value) {
    if (jar.id) {
      await loadJarBalance(jar.id);
    }
  }
}

async function loadJarBalance(jarId: number) {
  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }
  
  try {
    const balanceComposable = jarBalances.value[jarId];
    await balanceComposable.cargarTodo(); // Carga balance + historial
    loadedBalances.value.add(jarId);
  } catch (err) {
    console.error(`Error cargando balance para jar ${jarId}:`, err);
  }
}
```

### 4. Agregar Funciones para Modal

```typescript
function openAdjustmentModal(jarId: number) {
  currentJarAdjustment.value = jarId;
  showAdjustmentModal.value = true;
}

async function handleSaveAdjustment(data: { monto: number; descripcion?: string }) {
  if (currentJarAdjustment.value === null) return;
  
  const balanceComposable = jarBalances.value[currentJarAdjustment.value];
  
  try {
    await balanceComposable.crearAjuste(data);
    $q.notify({
      type: 'positive',
      message: 'Ajuste guardado exitosamente'
    });
    showAdjustmentModal.value = false;
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar ajuste'
    });
  }
}

async function handleResetAdjustment(jarId: number) {
  const balanceComposable = jarBalances.value[jarId];
  
  $q.dialog({
    title: 'Confirmar reset',
    message: '¿Estás seguro de resetear el ajuste de este cántaro?',
    cancel: true,
    persistent: true
  })
    .onOk(async () => {
      try {
        await balanceComposable.resetearAjuste();
        $q.notify({
          type: 'positive',
          message: 'Ajuste reseteado'
        });
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: err instanceof Error ? err.message : 'Error al resetear'
        });
      }
    });
}
```

### 5. Actualizar Template

**En la sección de jars (dentro del Draggable), DESPUÉS del cierre del jar-controls-grid:**

```vue
<!-- ANTES: Dropzone de categorías -->
<div
  class="jar-dropzone q-mt-md"
  :class="{ 'is-drop-target': jarDropOverIndex === idx }"
  @dragover.prevent="() => onJarDragOver(idx)"
  @dragleave="() => onJarDragLeave(idx)"
  @drop.prevent="(ev) => onJarDrop(idx, ev)"
>
  <!-- ... Draggable de categorías ... -->
</div>

<!-- NUEVO: Balance card -->
<div v-if="jar.id && jarBalances[jar.id]" class="q-mt-md">
  <JarCard
    :jar="jar"
    :balance="jarBalances[jar.id].balance.value"
    :loading="jarBalances[jar.id].loading.value"
    :error="jarBalances[jar.id].error.value"
    :porcentaje-utilizado="jarBalances[jar.id].porcentajeUtilizado.value"
    :status-balance="jarBalances[jar.id].statusBalance.value"
    @adjust="openAdjustmentModal(jar.id)"
    @reset="handleResetAdjustment(jar.id)"
  />
</div>
```

### 6. Agregar Modal al Cierre del Template

**Antes del cierre de `</q-page>`:**

```vue
<!-- Adjustment modal -->
<AdjustmentModal
  v-model="showAdjustmentModal"
  :jar="currentJarAdjustment ? jarElements.find(j => j.id === currentJarAdjustment) : null"
  :current-balance="jarBalances[currentJarAdjustment || -1]?.balance?.value?.balance || 0"
  :previous-adjustment="jarBalances[currentJarAdjustment || -1]?.balance?.value?.ajuste || 0"
  @save="handleSaveAdjustment"
/>
```

### 7. Actualizar Watch de sincronización con Store

**Agregar en el watch existente o crear nuevo:**

```typescript
watch(
  () => Object.values(jarBalances.value)
    .map(b => b.balance.value)
    .filter(Boolean),
  (balances) => {
    balances.forEach(balance => {
      if (balance) {
        jarsStore.setJarBalance(balance.jar_id, balance);
      }
    });
  },
  { deep: true }
);
```

### 8. Actualizar en `onMounted`

**Cambiar:**
```typescript
onMounted(() => {
  void Promise.all([loadJarData(), loadCategoriesTree()]).then(() => {
    // ... resto del código
  });
});
```

**A:**
```typescript
onMounted(() => {
  void Promise.all([loadJarData(), loadCategoriesTree()]).then(() => {
    // ... resto del código existente
    // Balances ya cargados en loadJarData()
  });
});
```

---

## Estructura de Datos

### Objeto `jar` en template

```typescript
type Jar = {
  uid: string;
  id?: number;              // ← Necesario para balance
  name: string;
  percent?: number;
  fixedAmount?: number;
  type: 'percent' | 'fixed';
  color?: string;
  categories?: Array<{ id: string; label: string }>;
  active?: boolean;
};
```

### Composable useJarBalance retorna

```typescript
{
  // State
  balance: Ref<JarBalance | null>;
  adjustments: Ref<JarAdjustmentRecord[]>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  
  // Computed
  porcentajeUtilizado: Computed<number>;
  statusBalance: Computed<'low' | 'medium' | 'high' | 'full'>;
  
  // Actions
  cargarBalance(): Promise<void>;
  cargarHistorial(): Promise<void>;
  cargarTodo(): Promise<void>;
  crearAjuste(data): Promise<JarAdjustmentRecord>;
  resetearAjuste(): Promise<void>;
  limpiar(): void;
}
```

---

## Validaciones

### En AdjustmentModal

- ✅ Monto no puede ser cero
- ✅ Monto debe ser número válido
- ✅ No puede restar más del balance actual
- ✅ Confirmación para operaciones > $1000
- ✅ Descripción opcional

### En useJarBalance

- ✅ Valida jarId
- ✅ Valida usuario autenticado
- ✅ Valida monto > 0 o < 0 pero <= balance
- ✅ Manejo de errores en todas las acciones

---

## Testing Checklist

- [ ] Jars sin balance visible cargan correctamente
- [ ] Balance card muestra asignado/gastado/ajuste
- [ ] Progress bar calcula % correctamente
- [ ] Botón "Ajustar" abre modal
- [ ] Modal valida monto
- [ ] Modal prevé nuevo balance
- [ ] Submit en modal crea ajuste en backend
- [ ] Botón "Resetear" limpia ajuste
- [ ] Historial de ajustes se muestra
- [ ] Mobile layout mantiene responsividad
- [ ] Error states muestran mensajes
- [ ] Loading states muestran spinner

---

## Notas Importantes

1. **IDs de jars:** Solo jars con `jar.id` (guardados en BD) pueden tener balance
2. **Lazy loading:** Balances se cargan después de jars en `loadJarData()`
3. **Refresco:** El modal cierra automáticamente después de guardar
4. **Errores:** Se notifican con Quasar pero no detienen flujo
5. **Store sync:** Balances se sincronizan con Pinia store automáticamente
