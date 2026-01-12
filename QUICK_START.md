# QUICK START: Integración del Sistema de Ajustes

## ⚡ Resumen en 2 Minutos

Se han creado **3 componentes nuevos** listos para usar. Solo necesitas:

1. ✅ Importarlos en `pages/user/jars/index.vue`
2. ✅ Agregar 4 refs de estado
3. ✅ Crear 3 funciones
4. ✅ Actualizar template en 2 lugares

**Tiempo total:** 30-45 minutos

---

## 📦 Archivos Nuevos

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `src/components/JarCard.vue` | Component | 335 | Muestra balance del cántaro |
| `src/components/AdjustmentModal.vue` | Component | 420 | Modal para crear ajustes |
| `src/composables/useJarBalance.ts` | Composable | 125 | Lógica de balance + API |
| `src/stores/jars.ts` | Store | 160 | Extendido (backward compatible) |

---

## 🔧 Integración en 4 Pasos

### PASO 1: Imports (3 líneas)

En `src/pages/user/jars/index.vue`, en la sección `<script setup>`:

```typescript
import { useJarBalance } from 'composables/useJarBalance';
import JarCard from 'components/JarCard.vue';
import AdjustmentModal from 'components/AdjustmentModal.vue';
```

---

### PASO 2: Estado (4 refs)

Despues de los imports, antes de `defineOptions`:

```typescript
// Balance management
const jarBalances = ref<Record<number, ReturnType<typeof useJarBalance>>>({});
const showAdjustmentModal = ref(false);
const currentJarAdjustment = ref<number | null>(null);
const loadedBalances = ref<Set<number>>(new Set());
```

---

### PASO 3: Funciones (3 funciones)

Agregar estas 3 funciones al script:

```typescript
/**
 * Carga balance para un jar específico
 */
async function loadJarBalance(jarId: number) {
  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }
  
  try {
    const balanceComposable = jarBalances.value[jarId];
    await balanceComposable.cargarTodo();
    loadedBalances.value.add(jarId);
  } catch (err) {
    console.error(`Error loading balance for jar ${jarId}:`, err);
  }
}

/**
 * Abre modal de ajuste para un jar
 */
function openAdjustmentModal(jarId: number) {
  currentJarAdjustment.value = jarId;
  showAdjustmentModal.value = true;
}

/**
 * Guarda un ajuste y actualiza el balance
 */
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

/**
 * Resetea el ajuste de un jar con confirmación
 */
async function handleResetAdjustment(jarId: number) {
  const balanceComposable = jarBalances.value[jarId];
  
  $q.dialog({
    title: 'Confirmar reset',
    message: '¿Estás seguro de resetear el ajuste?',
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

---

### PASO 4: Template (2 cambios)

#### 4A. Dentro del Draggable, después del dropzone de categorías

Localiza esta línea (alrededor de línea 235):

```vue
                          </div>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </template>
```

Luego agrega esto ANTES del cierre de `</q-card>`:

```vue
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
                        </div>
                      </div>
                    </q-card>
                  </div>
                </template>
```

#### 4B. Antes del cierre de `</q-page>`

Al final del template, justo antes de `</q-page>`, agrega:

```vue
    <!-- NUEVO: Adjustment modal -->
    <AdjustmentModal
      v-model="showAdjustmentModal"
      :jar="currentJarAdjustment ? jarElements.find(j => j.id === currentJarAdjustment) : undefined"
      :current-balance="jarBalances[currentJarAdjustment || -1]?.balance?.value?.balance || 0"
      :previous-adjustment="jarBalances[currentJarAdjustment || -1]?.balance?.value?.ajuste || 0"
      @save="handleSaveAdjustment"
    />
```

---

### PASO 5: Actualizar loadJarData()

Encontra la función `loadJarData()` y modifica el final:

**ANTES:**
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

**DESPUÉS:**
```typescript
async function loadJarData() {
  const userId = auth.user?.id;
  if (!userId) return;
  
  const res = await api.get(`/users/${userId}/jars`);
  const data = res.data as JarAPI[];
  
  jarElements.value = (data || []).map((j) => ({
    // ... mapping (sin cambios)
  }));
  
  serverJarIds.value = new Set(data.map(j => j.id).filter(Boolean));
  
  // NUEVO: Cargar balances para cada jar
  for (const jar of jarElements.value) {
    if (jar.id) {
      await loadJarBalance(jar.id);
    }
  }
}
```

---

## ✅ Checklist de Integración

```
[ ] Imports agregados (JarCard, AdjustmentModal, useJarBalance)
[ ] 4 refs de estado agregados
[ ] 4 funciones creadas (loadJarBalance, openAdjustmentModal, handleSaveAdjustment, handleResetAdjustment)
[ ] JarCard agregado en template (dentro del jar loop)
[ ] AdjustmentModal agregado en template (antes de </q-page>)
[ ] loadJarData() actualizado
[ ] Sin errores de TypeScript
[ ] Sin errores de compilación
[ ] Jars cargan correctamente
[ ] Balance muestra valores
[ ] Modal se abre al click
[ ] Ajuste se guarda
[ ] Reset funciona
[ ] Mobile responsive
```

---

## 🧪 Testing Básico

```typescript
// En console del navegador:

// Ver que los balances se cargaron
jarBalances.value
// Debería tener un objeto con jarId como key

// Ver el balance de un jar específico
jarBalances.value[1].balance.value
// { asignado: 5000, gastado: 1250, ajuste: 0, balance: 3750, ... }

// Ver ajustes de un jar
jarBalances.value[1].adjustments.value
// [{ id: 1, monto: 100, ... }, ...]
```

---

## ⚠️ Problemas Comunes

### Problema: "JarCard is not defined"
**Solución:** Revisar que el import está en el script setup
```typescript
import JarCard from 'components/JarCard.vue';
```

### Problema: "Cannot read property 'balance' of undefined"
**Solución:** Asegurar que `jar.id` existe antes de renderizar JarCard
```vue
<div v-if="jar.id && jarBalances[jar.id]">
  <JarCard ... />
</div>
```

### Problema: Modal no se abre
**Solución:** Revisar que `showAdjustmentModal` es un ref
```typescript
const showAdjustmentModal = ref(false); // ← ref, no variable
```

### Problema: Balance no carga
**Solución:** Verificar endpoints en backend:
- `GET /users/{id}/jars/{jarId}/balance` ✅
- `GET /users/{id}/jars/{jarId}/adjustments` ✅
- `POST /users/{id}/jars/{jarId}/adjust` ✅
- `POST /users/{id}/jars/{jarId}/reset-adjustment` ✅

---

## 📱 Mobile Responsive

El componente JarCard es fully responsive:

- **Desktop:** Grid 2 cols para botones
- **Mobile:** Stack vertical de botones
- **Layout:** Se adapta automáticamente

No hay cambios adicionales necesarios.

---

## 🎨 Personalización (Opcional)

### Cambiar colores del Progress Bar

En `JarCard.vue`:
```typescript
const progressColor = computed(() => {
  switch (props.statusBalance) {
    case 'full': return 'negative'; // Rojo
    case 'high': return 'warning';  // Naranja
    case 'medium': return 'info';   // Azul
    default: return 'positive';     // Verde
  }
});
```

### Cambiar tamaño del modal

En `AdjustmentModal.vue`, cambiar:
```vue
<q-card style="min-width: 400px; max-width: 500px">
```

---

## 🚀 Después de Integrar

### Testing Recomendado

1. **Funcional:**
   - Carga de jars + balance
   - Crear ajuste (positivo y negativo)
   - Reset ajuste
   - Historial se actualiza

2. **Validaciones:**
   - Rechaza monto = 0
   - Rechaza restar > balance actual
   - Muestra errores si falla API

3. **Mobile:**
   - Layout responsive
   - Botones accesibles
   - Modal legible

### Mejoras Futuras

- [ ] Agregar gráficas de balance en tiempo
- [ ] Historial con filtros
- [ ] Exportar a CSV
- [ ] Alertas de balance bajo
- [ ] Ajustes automáticos por reglas

---

## 📞 Ayuda

Si algo no funciona, revisar:

1. **Imports:** ¿Están correctos los paths?
2. **Refs:** ¿Están dentro de `<script setup>`?
3. **Template:** ¿Está bien indentado el HTML?
4. **API:** ¿Los 4 endpoints están implementados?
5. **Console:** ¿Hay errores de TypeScript?

Buscar en:
- `ANALISIS_LOGICA_ACTUAL.md` - Arquitectura
- `PLAN_INTEGRACION_AJUSTES.md` - Detalles técnicos
- `RESUMEN_IMPLEMENTACION.md` - Conceptos generales

---

**Tiempo estimado:** ⏱️ 30-45 minutos  
**Dificultad:** ⭐ Fácil (copy-paste)  
**Riesgo de regresión:** 🟢 Cero (código independiente)

¡Listo para integrar! 🚀
