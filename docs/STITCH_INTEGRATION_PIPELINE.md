# Stitch → OWFINANCE Integration Pipeline

**Versión:** 1.0
**Última actualización:** 2026-04-05
**Stack:** Vue 3 + Quasar 2, Laravel 12 API (Sanctum Auth), Glassmorphism Design

---

## 1. Flujo General del Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DISEÑO & ESPECIFICACIÓN (Equipo de Diseño)               │
│    - Define requisitos visuales                             │
│    - Crea especificación Figma/documento                    │
│    - Identifica: layout, componentes, data points           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. GENERACIÓN CON STITCH (Sub-agent)                        │
│    - Prompt reutilizable precompilado                       │
│    - Stitch genera: HTML limpio + Tailwind CSS              │
│    - Output: HTML estático responsivo                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. IMPLEMENTACIÓN EN VUE (Programador)                      │
│    - Convierte HTML → componente Vue                        │
│    - Añade: data binding, props, métodos                    │
│    - Integra: auth, API calls, state management             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. TESTING & VALIDACIÓN (QA)                               │
│    - Verifica: responsive, a11y, data binding               │
│    - Prueba: error states, API failures                     │
│    - Checklist de aceptación                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. MERGE & DEPLOYMENT (Git + CI/CD)                         │
│    - Code review                                            │
│    - GitHub Actions → LiteSpeed server                      │
│    - A/B testing con layout_mode (lite/legacy)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Template de Prompt Reusable para Stitch

### 2.1 Estructura General

El prompt tiene 4 secciones que se combinan cada vez:

```
[CONTEXTO_APP] ← Precompilado una sola vez
[DISEÑO_SISTEMA] ← Precompilado, reutilizable
[VISTA_A_GENERAR] ← Variable, cambia por cada vista
[INSTRUCCIONES] ← Constante
```

### 2.2 CONTEXTO_APP (precompilado, REUTILIZABLE)

Salva este bloque y úsalo en todos los prompts:

```markdown
# CONTEXTO DE LA APLICACIÓN OWFINANCE2026

## Propósito General
OWFINANCE es una aplicación de gestión financiera personal con arquitectura de múltiples layouts:
- **Lite**: Interfaz simplificada, enfoque móvil, vistas modernas
- **Legacy**: Sistema completo heredado con funcionalidad extendida
- **Pro**: Planeado para futuro (no implementado aún)

## Información de Usuario
- Autenticación: Laravel Sanctum (Bearer tokens)
- Datos persistentes: user.id, user.name, user.email, user.role
- Ajustes: user.layout_mode ('lite' o 'legacy'), user.currency_id

## Entidades Principales
1. **Transactions**: movimientos financieros (ingresos/gastos)
   - Campos: id, name, amount, datetime, provider_id, account_id, type
2. **Accounts**: cuentas bancarias/de ahorro
   - Campos: id, name, currency_id, balance, type
3. **Jars**: "cántaros" o goals (ahorros específicos)
   - Campos: id, name, target_amount, current_amount, icon, color
4. **Categories**: categorización de movimientos
   - Estructura: árbol (padre-hijo)

## Endpoints API Disponibles
```
POST   /api/v1/login                    (auth)
GET    /api/v1/user                     (perfil actual)
GET    /api/v1/transactions             (lista, paginada)
POST   /api/v1/transactions             (crear)
GET    /api/v1/accounts                 (todas)
GET    /api/v1/jars                     (cántaros del usuario)
POST   /api/v1/jars                     (crear)
GET    /api/v1/dashboard                (datos agregados)
PUT    /api/v1/user/settings            (actualizar layout_mode, etc)
```

## Stack Técnico
- **Frontend**: Vue 3 Composition API + TypeScript
- **UI Framework**: Quasar 2
- **HTTP Client**: Axios (configurado en boot/axios.ts)
- **State Management**: Pinia (stores/)
- **Styling**: SCSS + CSS tokens, Glassmorphism
- **Herramientas Build**: Vite
```

### 2.3 DISEÑO_SISTEMA (precompilado, REUTILIZABLE)

Salva este bloque y úsalo en todos los prompts:

```markdown
# SISTEMA DE DISEÑO OWFINANCE

## Paleta de Colores
| Nombre | Valor | Uso |
|--------|-------|-----|
| Deep Ocean | #001F3F | Fondos oscuros, énfasis premium |
| Gold | #FFB700 | Acentos, CTAs principales |
| Background App | #F8FAFC | Fondo de página general |
| Surface Card | #FFFFFF | Cards, modales |
| Surface Glass | rgba(255,255,255,0.72) | Glassmorphism (backdrop blur) |
| Text Strong | #0F172A | Títulos, texto principal |
| Text Muted | #64748B | Labels, texto secundario |
| State Success | #10B981 | Ingresos, estados positivos |
| State Danger | #EF4444 | Gastos, errores |
| State Warning | #F59E0B | Alertas |
| State Info | #0EA5E9 | Información |
| Border Soft | #E2E8F0 | Divisores, bordes |

## Tipografía
- **Font**: Outfit (sans-serif)
- **Títulos (H1-H3)**: 600-700 weight, 28-16px
- **Body**: 400 weight, 14-16px
- **Labels**: 500 weight, 12-14px

## Componentes Recurrentes
1. **Glass Card**: Card con glassmorphism, shadow subtle, border rgba(255,255,255,0.2)
2. **Balance Display**: Número grande (#001F3F), etiqueta pequeña (#64748B)
3. **List Item**: Flex row, icon + text + value, hover bg-soft
4. **Button Primary**: Gold bg, text white, rounded-md, shadow
5. **Button Secondary**: Transparent, text #001F3F, border soft
6. **Filter Pill**: Pequeño botón toggle, active: Gold bg, inactive: Border soft

## Principios
- **Mobile-first**: Layout se expande en desktop
- **Accesibilidad**: Contrast >= 4.5:1, interactive elements >= 44x44px
- **Responsive**: Breakpoints: 320px, 768px, 1024px, 1440px
- **Glassmorphism**: Blur 12px, opacity 72%, visible layer depth
```

### 2.4 VISTA_A_GENERAR (VARIABLE, cambia por cada vista)

Plantilla para cada solicitud:

```markdown
# VISTA A GENERAR: [NOMBRE_VISTA]

## Especificación
- **Nombre**: [ej: Dashboard Home / Transactions List / Jars Overview]
- **Ruta**: [ej: /user/home, /user/transactions]
- **Audiencia**: [Usuario logueado / Admin]
- **Responsividad**: Mobile first (320px → 768px → 1024px)

## Layout & Estructura
[Describe la jerarquía visual: qué va arriba, cómo fluye el contenido]

Ejemplo:
- Header (estilo glassmorphism con saludo)
- Main balance card (grande, resaltado)
- Sección de "Mis Cántaros" (grid 2 cols mobile, 4 cols desktop)
- Sección de "Últimos Movimientos" (lista scrollable)

## Data Points Esperados
[Lista variables que la vista mostrará, sin implementar binding aún]

Ejemplo:
- user.name
- globalBalance (número)
- incomeTotal, expenseTotal
- jars: [ { name, amount, icon, progress } ]
- transactions: [ { id, name, date, amount, icon } ]

## Interacciones Principales
[Qué hace el usuario: clicks, navegación, filtros]

Ejemplo:
- Click en "Ver todos" → navega a lista completa
- Click en cántaro → abre detalle/modal
- Seleccionar filtro (Mensual/Semanal/Anual) → actualiza datos

## Notas de Diseño
[Restricciones, estilos especiales, diferencias de otros layouts]

Ejemplo:
- Usar paleta gold/deep-ocean (no azul genérico)
- Cards con glassmorphism, sombra sutil
- Animaciones suaves en transiciones
```

### 2.5 INSTRUCCIONES (CONSTANTE)

```markdown
# INSTRUCCIONES PARA STITCH

## Output Deseado
Genera **HTML limpio, válido, y estructurado** que:
1. Sea convertible a componente Vue 3 sin modificaciones estructurales
2. Use clases CSS descriptivas (BEM o similar)
3. Incluya atributos `aria-*` para accesibilidad
4. Sea responsive (mobile-first, breakpoints claros)
5. Respete la paleta y tipografía del sistema de diseño

## Estructura HTML Esperada
```html
<div class="vista-nombre">
  <!-- Secciones claramente delimitadas -->
  <section class="section-header">
    <!-- contenido -->
  </section>
  <section class="section-main">
    <!-- contenido -->
  </section>
</div>
```

## CSS Output
- Incluir **estilos inline en <style scoped>** o separado en CSS
- Usar **CSS Variables** para colores (--brand-primary, --state-success, etc)
- Implementar **media queries** para mobile/tablet/desktop
- Glassmorphism: `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.72)`
- Uso de Grid/Flexbox para layout responsivo

## Qué NO Incluir
- Lógica JavaScript compleja (métodos, event handlers)
- API calls (fetch/axios)
- State management (ref, reactive, computed)
- Condicionales de negocio (v-if con lógica)

## Placeholders para Binding
Usa **comentarios Vue** para marcar dónde irá el binding:
```html
<!-- v-for: transaction in transactions -->
<div class="tx-item">
  <p>{{ transaction.name }}</p>
  <p>{{ transaction.amount }}</p>
</div>

<!-- v-bind: :class="{ active: isSelected }" -->
<button :class="{ active: activeFilter === 'monthly' }">
  Monthly
</button>
```

## Validación
Antes de devolver, verifica:
- [ ] HTML válido (sin etiquetas sin cerrar)
- [ ] Todas las secciones tienen aria-label o role
- [ ] Responsive en 320px, 768px, 1024px+
- [ ] Colores cumplen contrast AA (>= 4.5:1)
- [ ] Buttons/inputs >= 44x44px en móvil
- [ ] Glassmorphism aplicado donde corresponda
```

### 2.6 EJEMPLO COMPLETO: Solicitud de Dashboard Home

```markdown
# SOLICITUD STITCH: Dashboard Home (Lite Layout)

## [CONTEXTO_APP]
[Pega la sección precompilada 2.2]

## [DISEÑO_SISTEMA]
[Pega la sección precompilada 2.3]

## [VISTA_A_GENERAR]

### Vista: Dashboard Home (Lite)
- **Nombre**: Home Dashboard - Lite Layout
- **Ruta**: /user/home (con layout_mode=lite)
- **Audiencia**: Usuario logueado
- **Responsividad**: Mobile-first (320px base)

### Layout & Estructura
```
┌─────────────────────────────────────┐
│  HEADER: Saludo + Hora              │ (sticky top, glassmorphism)
├─────────────────────────────────────┤
│  BALANCE CARD                       │ (hero section, grande)
│  - Total balance                    │
│  - Ingresos | Gastos (pills)        │
│  - Filtros: Mensual/Semanal/Anual  │
├─────────────────────────────────────┤
│  MIS CÁNTAROS                       │ (grid 2 cols)
│  [Jar 1] [Jar 2]                    │ (ring progress visual)
│  [Jar 3] [Jar 4]                    │
│  Ver todos →                        │
├─────────────────────────────────────┤
│  ÚLTIMOS MOVIMIENTOS                │ (scrollable list)
│  - [Icon] Concepto | Monto          │ (repeated items)
│  - [Icon] Concepto | Monto          │
└─────────────────────────────────────┘
```

### Data Points
- user.name → "Hola, [name]!"
- globalBalance → "$12,450.50" (en divisa del usuario)
- incomeTotal → "$3,200" (este período)
- expenseTotal → "$1,850"
- jars: [ { name, amount, target, icon, color, progress } ]
- transactions: [ { id, name, date, amount, type, icon } ]
- activeFilter: 'Mensual' | 'Semanal' | 'Anual'

### Interacciones
1. Click en "Ver todos" (cántaros) → navegación a /user/jars
2. Click en cántaro → modal con detalles y opción de agregar dinero
3. Seleccionar filtro → re-fetch datos del período
4. Click en transacción → detalle de movimiento (modal)
5. Scroll transacciones → lazy load más items

### Notas de Diseño
- Header con glassmorphism, degradado sutil
- Balance card: Gold accent, shadow 0 8px 32px rgba(0,31,63,0.1)
- Cántaros: SVG circular progress rings con colores distintos
- Transacciones: Icons de Quasar (q-icon), color según tipo (income/expense)
- Espaciado: 16px gutters móvil, 24px desktop

## [INSTRUCCIONES]
[Pega la sección precompilada 2.5]
```

---

## 3. Checklist de Implementación Vue

Una vez que Stitch genera el HTML, sigue este proceso paso a paso:

### 3.1 Paso 1: Crear estructura del componente

```vue
<template>
  <!-- Pega aquí el HTML generado por Stitch -->
</template>

<script setup lang="ts">
// Importaciones
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'

// Tu componente aquí
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'TuComponente' })
</script>

<style lang="scss" scoped>
/* Estilos generados por Stitch van aquí */
</style>
```

### 3.2 Paso 2: Definir Props e Interfaces

```typescript
interface DataPointName {
  id: number
  name: string
  amount: number
  // ... otros campos
}

const props = withDefaults(
  defineProps<{
    // Props que recibe del padre (si aplica)
    initialFilter?: string
    showHeader?: boolean
  }>(),
  {
    initialFilter: 'Mensual',
    showHeader: true
  }
)

const emit = defineEmits<{
  // Eventos que emite hacia el padre
  'item-selected': [itemId: number]
  'filter-changed': [filter: string]
}>()
```

### 3.3 Paso 3: Declarar Estado Reactivo

```typescript
const auth = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeFilter = ref(props.initialFilter)

// Data del componente
const globalBalance = ref<number>(0)
const transactions = ref<Transaction[]>([])
const jars = ref<Jar[]>([])

// Computed properties para formateo y lógica
const formattedBalance = computed(() =>
  formatCurrency(globalBalance.value, auth.user?.currency_id)
)
```

### 3.4 Paso 4: Métodos de Datos y API Calls

```typescript
// Función para cargar datos
async function loadData() {
  isLoading.value = true
  error.value = null
  try {
    // Endpoint puede variar según tu API
    const response = await api.get('/dashboard', {
      params: { filter: activeFilter.value }
    })

    globalBalance.value = response.data.data.balance
    transactions.value = response.data.data.transactions
    jars.value = response.data.data.jars
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error cargando datos'
    console.error('Failed to load dashboard', err)
  } finally {
    isLoading.value = false
  }
}

// Función para cambiar filtro
function handleFilterChange(filter: string) {
  activeFilter.value = filter
  emit('filter-changed', filter)
  loadData()
}

// Función para item clickeado
function handleItemSelect(itemId: number) {
  emit('item-selected', itemId)
  // Navegar o abrir modal según lógica
}
```

### 3.5 Paso 5: Lifecycle Hooks

```typescript
onMounted(() => {
  // Validar que usuario está autenticado
  if (!auth.token) {
    router.push('/login')
    return
  }

  // Cargar datos iniciales
  loadData()
})

// Opcional: watch para cambios en props
watch(
  () => props.initialFilter,
  (newFilter) => {
    activeFilter.value = newFilter
    loadData()
  }
)
```

### 3.6 Ejemplo Completo: Componente Dashboard

```vue
<template>
  <q-page class="lite-home">
    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading">
      <q-spinner />
    </div>

    <!-- Error -->
    <q-banner
      v-if="error"
      class="bg-negative text-white"
      dense
      dismissible
      @click="error = null"
    >
      {{ error }}
    </q-banner>

    <!-- Contenido normal (generado por Stitch) -->
    <div v-if="!isLoading" class="lite-home__content">

      <!-- Hero Balance Card -->
      <section class="balance-card">
        <div class="balance-card__header">
          <div>
            <p class="balance-card__label">BALANCE TOTAL</p>
            <h2 class="balance-card__amount">{{ formattedBalance }}</h2>
          </div>
          <div class="balance-card__currency-pill">
            {{ auth.user?.currency?.symbol || 'USD' }}
          </div>
        </div>
        <div class="balance-card__pills">
          <div class="balance-pill">
            <q-icon name="arrow_upward" size="14px" class="income-color" />
            <span>{{ formatCurrency(incomeTotal) }}</span>
          </div>
          <div class="balance-pill">
            <q-icon name="arrow_downward" size="14px" class="expense-color" />
            <span>{{ formatCurrency(expenseTotal) }}</span>
          </div>
        </div>
        <div class="balance-card__filters">
          <button
            v-for="f in filters"
            :key="f"
            class="balance-filter"
            :class="{ 'balance-filter--active': activeFilter === f }"
            @click="handleFilterChange(f)"
          >
            {{ f }}
          </button>
        </div>
      </section>

      <!-- Mis Cántaros -->
      <section class="jars-section">
        <div class="section-header">
          <h3 class="section-title">Mis Cántaros</h3>
          <router-link to="/user/jars" class="section-link">
            Ver todos
          </router-link>
        </div>
        <div class="jars-grid">
          <div
            v-for="jar in jars"
            :key="jar.id"
            class="jar-card"
            @click="handleJarSelect(jar.id)"
          >
            <div class="jar-card__top">
              <div class="jar-card__icon-wrap" :style="{ background: jar.icon_bg }">
                <q-icon
                  :name="jar.icon"
                  size="20px"
                  :style="{ color: jar.icon_color }"
                />
              </div>
              <div class="jar-card__ring-wrap">
                <svg viewBox="0 0 36 36" class="jar-ring">
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" stroke-width="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="transparent"
                    :stroke="jar.color" stroke-width="3"
                    stroke-linecap="round"
                    :stroke-dasharray="`${jar.progressPercent * 0.88} 88`"
                    stroke-dashoffset="22"
                  />
                </svg>
              </div>
            </div>
            <p class="jar-card__name">{{ jar.name }}</p>
            <p class="jar-card__amount">{{ formatCurrency(jar.current_amount) }}</p>
          </div>
        </div>
      </section>

      <!-- Últimos Movimientos -->
      <section class="tx-section">
        <h3 class="section-title">Últimos Movimientos</h3>
        <div v-if="transactions.length === 0" class="empty-state">
          <p>No hay movimientos registrados</p>
        </div>
        <div v-else class="tx-list">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="tx-item"
            @click="handleTransactionSelect(tx.id)"
          >
            <div class="tx-item__icon">
              <q-icon :name="getTransactionIcon(tx)" size="22px" />
            </div>
            <div class="tx-item__info">
              <p class="tx-item__name">{{ tx.name }}</p>
              <p class="tx-item__date">
                {{ formatDate(tx.datetime) }}
              </p>
            </div>
            <p
              class="tx-item__amount"
              :class="tx.amount > 0 ? 'income-color' : 'expense-color'"
            >
              {{ tx.amount > 0 ? '+' : '' }}{{ formatCurrency(Math.abs(tx.amount)) }}
            </p>
          </div>
        </div>
      </section>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'
import { formatCurrency, formatDate, getTransactionIcon } from 'src/composables/formatters'

interface Transaction {
  id: number
  name: string
  amount: number
  datetime: string
  type: 'income' | 'expense'
}

interface Jar {
  id: number
  name: string
  current_amount: number
  target_amount: number
  icon: string
  icon_color: string
  icon_bg: string
  color: string
  progressPercent: number
}

const router = useRouter()
const auth = useAuthStore()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeFilter = ref('Mensual')
const filters = ['Mensual', 'Semanal', 'Anual']

const globalBalance = ref<number>(0)
const incomeTotal = ref<number>(0)
const expenseTotal = ref<number>(0)
const transactions = ref<Transaction[]>([])
const jars = ref<Jar[]>([])

// Computed
const formattedBalance = computed(() =>
  formatCurrency(globalBalance.value, auth.user?.currency_id)
)

// Methods
async function loadData() {
  // Verificar autenticación
  if (!auth.token || !auth.user?.id) {
    router.push('/login')
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await api.get('/dashboard', {
      params: {
        filter: activeFilter.value.toLowerCase()
      }
    })

    const data = response.data.data
    globalBalance.value = data.balance || 0
    incomeTotal.value = data.income_total || 0
    expenseTotal.value = data.expense_total || 0
    transactions.value = data.transactions || []
    jars.value = (data.jars || []).map((jar: any) => ({
      ...jar,
      progressPercent: jar.current_amount / jar.target_amount * 100
    }))
  } catch (err: any) {
    console.error('Failed to load dashboard:', err)

    // Manejo de errores comunes
    if (err.response?.status === 401) {
      // Token expirado
      auth.logout()
      router.push('/login')
    } else {
      error.value = err.response?.data?.message || 'Error cargando dashboard'
    }
  } finally {
    isLoading.value = false
  }
}

function handleFilterChange(filter: string) {
  activeFilter.value = filter
  loadData()
}

function handleJarSelect(jarId: number) {
  router.push(`/user/jars/${jarId}`)
}

function handleTransactionSelect(txId: number) {
  router.push(`/user/transactions/${txId}`)
}

// Lifecycle
onMounted(() => {
  loadData()
})

// Watchers
watch(
  () => auth.user?.layout_mode,
  () => {
    // Si el usuario cambia de layout en otra pestaña, recargar
    loadData()
  }
)
</script>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'LiteHomePage' })
</script>

<style lang="scss" scoped>
@import 'src/css/tokens.css';

.lite-home {
  background-color: var(--bg-app);
  padding-bottom: 80px; // Espacio para bottom nav

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 16px;

    @media (min-width: 768px) {
      padding: 24px;
      gap: 32px;
    }
  }
}

// Balance Card
.balance-card {
  background: var(--surface-glass);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 31, 63, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    margin: 0;
    letter-spacing: 0.5px;
  }

  &__amount {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-strong);
    margin: 4px 0 0;
    font-family: 'Outfit', sans-serif;
  }

  &__currency-pill {
    background: var(--brand-primary);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  &__pills {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__filters {
    display: flex;
    gap: 8px;
  }
}

.balance-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  background: var(--surface-soft);
  border-radius: 8px;

  .income-color {
    color: var(--state-success);
  }

  .expense-color {
    color: var(--state-danger);
  }
}

.balance-filter {
  padding: 8px 16px;
  border: 1px solid var(--border-soft);
  background: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-strong);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--brand-primary);
  }

  &--active {
    background: #ffb700;
    color: white;
    border-color: #ffb700;
  }
}

// Jars Section
.jars-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
}

.section-link {
  font-size: 14px;
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.jars-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.jar-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 31, 63, 0.1);
    transform: translateY(-2px);
  }

  &__top {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
    height: 60px;
  }

  &__icon-wrap {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  &__ring-wrap {
    width: 60px;
    height: 60px;
  }

  &__name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    margin: 0;
  }

  &__amount {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-strong);
    margin: 4px 0 0;
  }
}

// Transactions Section
.tx-section {
  .section-title {
    margin-bottom: 16px;
  }
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.tx-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--surface-soft);
  }

  &__icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-soft);
    border-radius: 50%;
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-strong);
    margin: 0;
  }

  &__date {
    font-size: 12px;
    color: var(--text-muted);
    margin: 4px 0 0;
  }

  &__amount {
    font-size: 14px;
    font-weight: 600;

    &.income-color {
      color: var(--state-success);
    }

    &.expense-color {
      color: var(--state-danger);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
```

---

## 4. Data Binding Patterns

### 4.1 Patrón: De Mocks a Datos Reales

**Fase 1: Desarrollo con Mocks**

```typescript
// Durante desarrollo, usa mocks locales
const mockTransactions = [
  { id: 1, name: 'Salario', amount: 2500, datetime: '2026-04-01', type: 'income' },
  { id: 2, name: 'Supermercado', amount: -85, datetime: '2026-04-02', type: 'expense' }
]

// Variable de desarrollo
const IS_MOCK_MODE = true

// En loadData():
if (IS_MOCK_MODE) {
  transactions.value = mockTransactions
  // ... otros mocks
} else {
  // await api.get(...)
}
```

**Fase 2: Switching a Datos Reales**

```typescript
// Simplemente cambiar la variable
const IS_MOCK_MODE = false

// O usar variable de entorno
const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCKS === 'true'
```

### 4.2 Patrón: API Calls Seguros

```typescript
// 1. Siempre validar autenticación ANTES de hacer calls
async function loadData() {
  if (!auth.token) {
    router.push('/login')
    return
  }

  try {
    const response = await api.get('/endpoint')
    // Validar estructura de respuesta
    if (!response.data?.data) {
      throw new Error('Invalid response structure')
    }
    // Tipado fuerte
    const data: MyDataType = response.data.data
  } catch (err) {
    handleError(err)
  }
}

// 2. Centralizar manejo de errores
function handleError(err: any) {
  if (err.response?.status === 401) {
    // Token expirado → logout
    auth.logout()
    router.push('/login')
  } else if (err.response?.status === 403) {
    // Permiso denegado
    router.push('/forbidden')
  } else if (err.response?.status >= 500) {
    // Error servidor
    error.value = 'Error del servidor. Intenta más tarde.'
  } else {
    // Error genérico
    error.value = err.response?.data?.message || 'Error desconocido'
  }
}

// 3. Implementar retry logic para conexiones inestables
async function apiCallWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err: any) {
      if (i === maxRetries - 1) throw err
      // Esperar progresivamente más tiempo
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 4.3 Patrón: Validación de Datos Recibidos

```typescript
// Usar Zod o una solución similar
import { z } from 'zod'

const TransactionSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  amount: z.number(),
  datetime: z.string().datetime(),
  type: z.enum(['income', 'expense'])
})

type Transaction = z.infer<typeof TransactionSchema>

// Validar respuesta de API
async function loadTransactions() {
  try {
    const response = await api.get('/transactions')
    const data = TransactionSchema.array().parse(response.data.data)
    transactions.value = data
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Invalid data structure:', err.issues)
      error.value = 'Datos inválidos del servidor'
    }
  }
}
```

### 4.4 Patrón: Formateo Consistente

```typescript
// composables/formatters.ts
export function formatCurrency(
  amount: number,
  currencyId?: number
): string {
  // Buscar divisa del usuario
  const currency = getCurrencyById(currencyId)
  const symbol = currency?.symbol || '$'

  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency?.code || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return formatted
}

export function formatDate(dateString: string, format = 'short'): string {
  const date = new Date(dateString)

  if (format === 'short') {
    return new Intl.DateTimeFormat('es-AR', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Usar en templates
<p>{{ formatCurrency(amount, user.currency_id) }}</p>
<p>{{ formatDate(transaction.datetime, 'short') }}</p>
```

---

## 5. Matriz de Decisión: Qué Stitch Puede/No Puede Hacer

| Funcionalidad | Stitch | Programador | Notas |
|---|---|---|---|
| **HTML/CSS responsivo** | ✅ 100% | - | Stitch genera código limpio y mobile-first |
| **Glassmorphism styling** | ✅ Sí | - | Blueprints con backdrop-filter |
| **Layout grid/flexbox** | ✅ Sí | - | Breakpoints móvil/tablet/desktop |
| **Accessibility (ARIA)** | ✅ Básico | ⚠️ Revisar | Stitch agrega roles y labels, pero validar AA |
| **Animaciones CSS** | ✅ Sí | ✅ Refinamiento | Transiciones suaves entre estados |
| **Componentes Quasar** | ❌ No | ✅ 100% | Stitch no conoce q-*, usa HTML nativo, luego convertir |
| **Data binding (v-bind)** | ❌ No | ✅ 100% | Stitch genera placeholders, programador implementa |
| **v-for loops** | ❌ No | ✅ 100% | Stitch genera un item template, repetir manualmente |
| **Event handlers (@click)** | ❌ No | ✅ 100% | Stitch genera estructura, programador añade lógica |
| **Conditional rendering (v-if)** | ❌ No | ✅ 100% | Necesaria para error states, loading, etc |
| **API calls (fetch/axios)** | ❌ No | ✅ 100% | Bloque de script setup |
| **State management (ref/reactive)** | ❌ No | ✅ 100% | Bloque de script setup |
| **Validación de formularios** | ❌ No | ✅ 100% | Usar Vee-Validate o solución custom |
| **Internacionalización (i18n)** | ❌ No | ✅ 100% | Textos en inglés/español con traductor |
| **Performance (lazy loading)** | ⚠️ Parcial | ✅ 100% | Stitch optimiza CSS, programador optimiza JS |
| **Theming dinámico** | ❌ No | ✅ 100% | CSS variables ya existen, JavaScript maneja switch |

---

## 6. Gotchas & Anti-Patterns

### 6.1 Errores Comunes

#### ❌ Anti-Patrón 1: No validar autenticación

```typescript
// ❌ MALO
onMounted(() => {
  loadData() // ¿Qué si el token expiró?
})

// ✅ BUENO
onMounted(() => {
  if (!auth.token || !auth.user?.id) {
    router.push('/login')
    return
  }
  loadData()
})
```

#### ❌ Anti-Patrón 2: No manejar errores de API

```typescript
// ❌ MALO
async function loadData() {
  const response = await api.get('/data')
  data.value = response.data.data // ¿Y si hay error?
}

// ✅ BUENO
async function loadData() {
  try {
    const response = await api.get('/data')
    data.value = response.data.data
  } catch (err) {
    console.error('Error:', err)
    error.value = 'No se pudieron cargar los datos'
  }
}
```

#### ❌ Anti-Patrón 3: Data binding sin validación de estructura

```typescript
// ❌ MALO
transactions.value = response.data.transactions
// ¿Qué si transactions es undefined? ¿Qué si es null?

// ✅ BUENO
transactions.value = response.data?.data?.transactions || []
// Fallback a array vacío si falta la estructura
```

#### ❌ Anti-Patrón 4: No implementar loading state

```vue
<!-- ❌ MALO -->
<div class="list">
  <div v-for="item in items">{{ item }}</div>
</div>

<!-- ✅ BUENO -->
<div v-if="isLoading" class="loading">
  <q-spinner />
</div>
<div v-else-if="error" class="error">{{ error }}</div>
<div v-else class="list">
  <div v-for="item in items">{{ item }}</div>
</div>
```

### 6.2 Limitaciones de Stitch

1. **No entiende lógica Vue**: Stitch genera HTML/CSS. Vue logic va en `<script setup>`
2. **No conoce tus APIs**: Tienes que documentar endpoints en el prompt
3. **No genera componentes reutilizables automáticamente**: Si necesitas componentes pequeños (Badge, Button), hazlos manual o usa Quasar
4. **CSS puede necesitar ajustes**: El CSS generado puede ser 95% correcto, pero ajustes de spacing/colores son normales
5. **No maneja states de UI complejos**: Loading, error, empty states requieren lógica manual

### 6.3 Buenas Prácticas

✅ **DO**
- Validar siempre `auth.token` antes de hacer API calls
- Usar tipos TypeScript para todas las respuestas de API
- Implementar error handling en todos los async functions
- Mostrar loading state mientras se cargan datos
- Reutilizar composables para formateo (currency, dates)
- Usar CSS variables para consistencia visual
- Documentar props y emits en los componentes

❌ **DON'T**
- Hardcodear valores que vienen de la API
- Hacer API calls en templates
- Ignorar errores (try-catch sin console.error)
- Asumir que la estructura de respuesta es siempre igual
- Dejar console.logs en producción
- Cambiar colores manualmente en componentes (usar vars)
- Crear componentes gigantes (>500 líneas)

---

## 7. Referencia: Scripts & Commands

### 7.1 Comando para Generar Vista con Stitch

```bash
# (Manual en Claude)
# 1. Abrir conversación con Stitch
# 2. Pegue el prompt COMPLETO (CONTEXTO + DISEÑO + VISTA + INSTRUCCIONES)
# 3. Copie el HTML generado

# Ejemplo de prompt file (stitch-prompts/dashboard-home.md)
# [CONTEXTO_APP]
# [DISEÑO_SISTEMA]
# [VISTA_A_GENERAR]
# [INSTRUCCIONES]
```

### 7.2 Template para Componente Nuevo

Crear archivo:
```bash
# Touch del archivo
touch src/components/views/TuComponente.vue
```

Luego usar template de 3.1

### 7.3 Testing Checklist

```bash
# Antes de hacer PR:

# 1. Visual testing (todos los breakpoints)
npm run dev
# Abrir DevTools, probar 320px, 768px, 1024px

# 2. TypeScript check
npm run type-check

# 3. Linting
npm run lint

# 4. Unit tests (si existen)
npm run test:unit

# 5. E2E tests (si existen)
npm run test:e2e
```

### 7.4 Deployment

```bash
# Automático por GitHub Actions
# Los cambios en `src/` triggerean:
# - Build (Vite)
# - Tests
# - Deploy a LiteSpeed server

# Manual si needed:
# Comunica con DevOps para trigger de re-deploy
```

---

## 8. Ejemplo End-to-End: Transactions List

### Solicitud a Stitch

```markdown
# SOLICITUD STITCH: Transactions List

## [CONTEXTO_APP]
[... pegar sección 2.2 ...]

## [DISEÑO_SISTEMA]
[... pegar sección 2.3 ...]

## [VISTA_A_GENERAR]

### Vista: Transactions List
- **Nombre**: Transactions Page
- **Ruta**: /user/transactions
- **Audiencia**: Usuario logueado
- **Responsividad**: Mobile-first

### Layout & Estructura
```
Header (sticky)
├── Título "Movimientos"
├── Botones: Filtrar, Exportar
├── Buscador (search por concepto)

Main List
├── Filtros activos (chip pills removibles)
├── Lista de transacciones (infinite scroll)
│   ├── [Icon] Concepto | Categoría | Monto
│   ├── Separador por fecha
│   └── [Icon] Concepto | Categoría | Monto

Fab Button
└── + Nuevo movimiento
```

### Data Points
- user.currency
- filters: { category, type, dateRange, account }
- transactions: [ { id, name, category, amount, date, type } ]
- totalCount (para pagination)

### Interacciones
- Click en transacción → detalle/modal
- Seleccionar filtro → refetch
- Scroll al final → load más items (infinite scroll)
- Click "+" → ir a /user/transactions/create

## [INSTRUCCIONES]
[... pegar sección 2.5 ...]
```

### Output de Stitch

[HTML con estructura de lista, filtros, etc]

### Implementación Vue

```vue
<template>
  <q-page class="transactions-page">
    <!-- Header -->
    <q-toolbar class="transactions-header">
      <q-toolbar-title>Movimientos</q-toolbar-title>
      <q-btn flat round icon="search" @click="showSearch = true" />
      <q-btn flat round icon="more_vert" />
    </q-toolbar>

    <!-- Search Dialog -->
    <q-input
      v-model="searchQuery"
      placeholder="Buscar concepto..."
      outlined
      dense
      @update:model-value="searchTransactions"
    />

    <!-- Filters -->
    <div class="filters-bar">
      <q-chip
        v-for="(filter, key) in activeFilters"
        :key="key"
        removable
        @remove="removeFilter(key)"
      >
        {{ filter }}
      </q-chip>
      <q-btn flat size="sm" icon="add" @click="showFilters = true">
        Filtrar
      </q-btn>
    </div>

    <!-- Loading State -->
    <q-linear-progress
      v-if="isLoading && !transactions.length"
      indeterminate
      color="primary"
    />

    <!-- Transactions List -->
    <div
      v-if="transactions.length"
      class="tx-list"
      @scroll="handleScroll"
    >
      <template v-for="(group, date) in groupedTransactions" :key="date">
        <div class="tx-date-separator">
          {{ formatDate(date) }}
        </div>
        <div
          v-for="tx in group"
          :key="tx.id"
          class="tx-list-item"
          @click="selectTransaction(tx.id)"
        >
          <q-icon :name="getTxIcon(tx)" />
          <div class="tx-info">
            <p class="tx-name">{{ tx.name }}</p>
            <p class="tx-category">{{ tx.category?.name }}</p>
          </div>
          <p :class="tx.amount > 0 ? 'income' : 'expense'">
            {{ formatCurrency(tx.amount) }}
          </p>
        </div>
      </template>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="empty-state">
      <q-icon name="inbox" size="64px" />
      <p>No hay movimientos</p>
    </div>

    <!-- Load More Indicator -->
    <div v-if="isLoadingMore" class="load-more">
      <q-spinner />
    </div>

    <!-- Filters Dialog -->
    <q-dialog v-model="showFilters">
      <q-card style="min-width: 300px">
        <!-- Filter options -->
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { api } from 'boot/axios'

// ... tipos, state, methods
</script>
```

---

## 9. Checklist Pre-Merge

Antes de hacer PR, verifica:

- [ ] HTML generado por Stitch está en `<template>` sin modificaciones estructurales
- [ ] Todos los props están documentados con `withDefaults` y tipos
- [ ] Manejo de autenticación: `if (!auth.token)` antes de API calls
- [ ] Error handling: try-catch en todos los async functions
- [ ] Loading state: muestra spinner mientras se cargan datos
- [ ] Data validation: estructura de respuesta validada (Zod o type guard)
- [ ] Empty states: "No hay datos" message cuando lista está vacía
- [ ] Responsive: probado en 320px, 768px, 1024px+
- [ ] Accesibilidad: aria-labels, contraste >= 4.5:1, botones >= 44x44px
- [ ] No hay console.logs en código producción
- [ ] CSS variables usados, no colores hardcodeados
- [ ] TypeScript: sin `any` types (excepto casos justificados)
- [ ] Formato: código pasa linter sin errores
- [ ] Tests: if applicable, tests pasan
- [ ] Documentación: JSDoc comments en functions no obvias

---

## 10. FAQ & Troubleshooting

### P: ¿Stitch genera siempre código perfecto?
**R:** No. Stitch genera 90-95% del código correcto. Esperamos ajustes en colores, espaciado, y responsive tunning. Eso es normal.

### P: ¿Cómo cambio el layout_mode después de implementar?
**R:** Es transparente para el componente. El padre (`DynamicHomePage.vue`) maneja el switch. Simplemente importa tu nuevo componente en la lista.

### P: ¿Qué hago si la API cambia su respuesta?
**R:** Actualiza la TypeScript interface y el parsing en `loadData()`. Si es breaking change, comunica con el equipo backend.

### P: ¿Puedo reutilizar componentes de Stitch?
**R:** Depende. Si una vista es genérica (ej: ListaTabla), extrae a componente reutilizable. Si es específica (Home, Dashboard), déjalo inline.

### P: ¿Cómo testeo esto en desarrollo?
**R:** `npm run dev` y usa DevTools para simular móvil. Para testing de autenticación, usa un token fake en localStorage.

---

## 11. Próximos Pasos

1. **Crear vista piloto**: Usa este pipeline para una vista pequeña (ej: Settings)
2. **Obtener feedback**: ¿El proceso es smooth? ¿El código generado es mantenible?
3. **Iterar template**: Refina el prompt template con aprendizajes
4. **Documentar convenciones**: Actualiza este documento con lo aprendido
5. **Escalar**: Usar pipeline para todas las nuevas vistas

---

**Documento vivo**: Este pipeline se actualizará con cada experiencia con Stitch. Contribuciones bienvenidas.

**Mantener**: Revisa este doc cada 2 semanas y actualiza con gotchas nuevos, cambios en API, mejoras de proceso.
