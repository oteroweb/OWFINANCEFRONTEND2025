<template>
  <q-page class="dreams-page">
    <div class="dreams-page__container">

      <!-- Page heading -->
      <div class="dreams-page__heading">
        <span class="t-eyebrow">Sueños</span>
        <h1 class="t-h1">Lo que estás construyendo</h1>
      </div>

      <!-- Hero card -->
      <div class="dreams-hero">
        <div class="dreams-hero__left">
          <span class="t-eyebrow">Total acumulado · USD</span>
          <div class="dreams-hero__amount">{{ ui.hideValues ? '$ ••••••' : fmt(meta?.total_saved ?? 0) }}</div>
          <p class="t-body-sm" style="color:var(--fg-2);margin:0">
            {{ store.dreams.length }} sueños activos
            <template v-if="meta?.total_target"> · meta combinada
              <strong class="tabular" style="color:var(--fg-1)">${{ (meta.total_target).toLocaleString('en-US') }}</strong>
            </template>
            <template v-if="meta?.global_progress">
              · <span style="color:#8B5CF6;font-weight:600">{{ meta.global_progress }}% del camino</span>
            </template>
          </p>
        </div>
        <button class="dreams-hero__btn" @click="openCreate">
          <q-icon name="add" size="18px" />Nuevo sueño
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="dreams-loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <!-- Empty -->
      <div v-else-if="!store.dreams.length" class="dreams-empty">
        <q-icon name="auto_awesome" size="40px" color="grey-4" />
        <h3 class="t-h2" style="margin:0">Aún no tienes sueños</h3>
        <p class="t-body-sm" style="color:var(--fg-2);margin:0">Define una meta — una casa, un viaje, un posgrado — y rastrea tu avance aquí.</p>
        <button class="dreams-hero__btn" @click="openCreate">
          <q-icon name="add" size="18px" />Crear primer sueño
        </button>
      </div>

      <!-- Dreams grid -->
      <div v-else class="dreams-grid">
        <div
          v-for="dream in store.active"
          :key="dream.id"
          class="dc"
          :style="dream.color ? `--dc-accent: ${dream.color}` : ''"
        >
          <div class="dc__header">
            <div class="dc__ico" :style="dream.color ? `background:${dream.color}22;color:${dream.color}` : ''">
              <span v-if="dream.emoji" style="font-size:18px">{{ dream.emoji }}</span>
              <q-icon v-else name="auto_awesome" size="18px" />
            </div>
            <div class="dc__meta">
              <span class="dc__name">{{ dream.name }}</span>
              <span v-if="dream.description" class="dc__desc">{{ dream.description }}</span>
            </div>
            <span class="dc__pct" :style="dream.color ? `color:${dream.color}` : ''">{{ dream.progress }}%</span>
            <button class="dc__menu-btn" @click="openMenu(dream)">
              <q-icon name="more_vert" size="18px" />
            </button>
          </div>

          <div class="dc__amounts">
            <span class="dc__saved" :style="dream.color ? `color:${dream.color}` : ''">{{ fmt(dream.saved_amount) }}</span>
            <span class="dc__target"> / {{ fmt(dream.target_amount) }}</span>
          </div>

          <div class="dc__bar-track">
            <div class="dc__bar-fill" :style="`width:${Math.min(dream.progress, 100)}%;background:${dream.color ?? '#8B5CF6'}`" />
          </div>

          <div class="dc__actions">
            <button class="dc__action-btn" @click="openDeposit(dream)">
              <q-icon name="savings" size="16px" />Aportar
            </button>
            <button class="dc__action-btn" @click="openEdit(dream)">
              <q-icon name="edit" size="16px" />Editar
            </button>
          </div>
        </div>
      </div>

      <!-- Completed section -->
      <div v-if="store.completed.length" class="dreams-completed">
        <div class="dreams-completed__label">
          <q-icon name="check_circle" size="16px" style="color:var(--income-fg)" />
          Completados ({{ store.completed.length }})
        </div>
        <div class="dreams-grid">
          <div
            v-for="dream in store.completed"
            :key="dream.id"
            class="dc dc--done"
          >
            <div class="dc__header">
              <div class="dc__ico dc__ico--done">
                <span v-if="dream.emoji" style="font-size:18px">{{ dream.emoji }}</span>
                <q-icon v-else name="check_circle" size="18px" />
              </div>
              <div class="dc__meta">
                <span class="dc__name">{{ dream.name }}</span>
                <span class="dc__desc" style="color:var(--income-fg)">¡Completado! {{ fmt(dream.saved_amount) }}</span>
              </div>
              <button class="dc__menu-btn" @click="openMenu(dream)">
                <q-icon name="more_vert" size="18px" />
              </button>
            </div>
            <div class="dc__bar-track">
              <div class="dc__bar-fill" style="width:100%;background:var(--income)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT DIALOG -->
    <q-dialog v-model="showForm" position="bottom" full-width>
      <q-card class="dialog-card">
        <div class="dialog-handle"></div>
        <div class="dialog-header">
          <h3 class="t-h3">{{ editTarget ? 'Editar sueño' : 'Nuevo sueño' }}</h3>
          <button class="icon-btn" @click="showForm = false">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="dialog-body">
          <div class="field">
            <label>Nombre</label>
            <div class="input-shell">
              <span class="material-icons">auto_awesome</span>
              <input v-model="form.name" type="text" placeholder="Casa propia, maestría, viaje..." maxlength="100" />
            </div>
          </div>

          <div class="field-row">
            <div class="field" style="flex:0 0 72px">
              <label>Emoji</label>
              <div class="input-shell">
                <input v-model="form.emoji" type="text" placeholder="🏠" maxlength="4" style="text-align:center;font-size:20px" />
              </div>
            </div>
            <div class="field" style="flex:1">
              <label>Color</label>
              <div class="color-row">
                <button
                  v-for="c in COLORS"
                  :key="c"
                  class="color-swatch"
                  :class="{ active: form.color === c }"
                  :style="`background:${c}`"
                  @click="form.color = form.color === c ? null : c"
                ></button>
              </div>
            </div>
          </div>

          <div class="field">
            <label>Descripción (opcional)</label>
            <div class="input-shell">
              <span class="material-icons">notes</span>
              <input v-model="form.description" type="text" placeholder="Por qué es importante para ti..." maxlength="200" />
            </div>
          </div>

          <div class="field-row">
            <div class="field" style="flex:1">
              <label>Meta ($)</label>
              <div class="input-shell">
                <span class="material-icons">flag</span>
                <input v-model.number="form.target_amount" type="number" placeholder="0.00" min="1" step="0.01" />
              </div>
            </div>
            <div class="field" style="flex:1">
              <label>Ahorrado ($)</label>
              <div class="input-shell">
                <span class="material-icons">savings</span>
                <input v-model.number="form.saved_amount" type="number" placeholder="0.00" min="0" step="0.01" />
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-ghost" @click="showForm = false">Cancelar</button>
          <button class="btn btn-primary" :disabled="formLoading || !form.name || !form.target_amount" @click="submitForm">
            {{ formLoading ? 'Guardando...' : (editTarget ? 'Guardar cambios' : 'Crear sueño') }}
          </button>
        </div>
      </q-card>
    </q-dialog>

    <!-- DEPOSIT DIALOG -->
    <q-dialog v-model="showDeposit" position="bottom" full-width>
      <q-card class="dialog-card">
        <div class="dialog-handle"></div>
        <div class="dialog-header">
          <h3 class="t-h3">Aportar a «{{ depositTarget?.name }}»</h3>
          <button class="icon-btn" @click="showDeposit = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="dialog-body">
          <div v-if="depositTarget" class="deposit-progress">
            <div class="bar"><i :style="`width:${Math.min(depositTarget.progress,100)}%;background:${depositTarget.color ?? 'var(--brand-primary)'}`"></i></div>
            <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:13px;color:var(--fg-2)">
              <span>{{ fmt(depositTarget.saved_amount) }} ahorrado</span>
              <span>Meta {{ fmt(depositTarget.target_amount) }}</span>
            </div>
          </div>
          <div class="field" style="margin-top:16px">
            <label>Monto a aportar ($)</label>
            <div class="input-shell">
              <span class="material-icons">attach_money</span>
              <input v-model.number="depositAmount" type="number" placeholder="0.00" min="0.01" step="0.01" />
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-ghost" @click="showDeposit = false">Cancelar</button>
          <button class="btn btn-primary" :disabled="depositLoading || !depositAmount" @click="submitDeposit">
            {{ depositLoading ? 'Aportando...' : 'Aportar' }}
          </button>
        </div>
      </q-card>
    </q-dialog>

    <!-- MENU DIALOG -->
    <q-dialog v-model="showMenu" position="bottom" full-width>
      <q-card class="dialog-card">
        <div class="dialog-handle"></div>
        <div class="dialog-body" style="padding-top:8px">
          <button class="menu-item" @click="onMenuEdit">
            <span class="material-icons">edit</span>Editar sueño
          </button>
          <button class="menu-item" @click="onMenuDeposit">
            <span class="material-icons">savings</span>Aportar
          </button>
          <button v-if="menuTarget && !menuTarget.is_completed" class="menu-item" @click="onMenuComplete">
            <span class="material-icons" style="color:var(--income-fg)">check_circle</span>Marcar como completado
          </button>
          <button v-else-if="menuTarget?.is_completed" class="menu-item" @click="onMenuReopen">
            <span class="material-icons">replay</span>Reabrir sueño
          </button>
          <button class="menu-item menu-item--danger" @click="onMenuDelete">
            <span class="material-icons">delete</span>Eliminar sueño
          </button>
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useDreamsStore, type Dream } from 'src/stores/dreams'
import { useUiStore } from 'stores/ui'

defineOptions({ name: 'DreamsPage' })

const $q = useQuasar()
const store = useDreamsStore()
const ui = useUiStore()

const COLORS = ['#2D4DA6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316']

const meta = store.$state.meta ? ref(store.$state.meta) : ref(null as null | typeof store.meta)

onMounted(async () => {
  await store.fetchAll()
  meta.value = store.meta
})

// ── Format ──────────────────────────────────────────────
function fmt(v: number) {
  return '$ ' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Form (create / edit) ─────────────────────────────────
const showForm = ref(false)
const editTarget = ref<Dream | null>(null)
const formLoading = ref(false)

const form = reactive({
  name: '',
  emoji: '' as string | null,
  description: '' as string | null,
  target_amount: 0,
  saved_amount: 0,
  color: null as string | null,
})

function resetForm() {
  form.name = ''
  form.emoji = null
  form.description = null
  form.target_amount = 0
  form.saved_amount = 0
  form.color = null
}

function openCreate() {
  editTarget.value = null
  resetForm()
  showForm.value = true
}

function openEdit(dream: Dream) {
  editTarget.value = dream
  form.name = dream.name
  form.emoji = dream.emoji
  form.description = dream.description
  form.target_amount = dream.target_amount
  form.saved_amount = dream.saved_amount
  form.color = dream.color
  showForm.value = true
  showMenu.value = false
}

async function submitForm() {
  if (!form.name || !form.target_amount) return
  formLoading.value = true
  try {
    if (editTarget.value) {
      await store.update(editTarget.value.id, { ...form, emoji: form.emoji || null, description: form.description || null })
      $q.notify({ type: 'positive', message: 'Sueño actualizado' })
    } else {
      await store.create({ ...form, emoji: form.emoji || null, description: form.description || null })
      $q.notify({ type: 'positive', message: '¡Sueño creado!' })
    }
    meta.value = store.meta
    showForm.value = false
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar el sueño' })
  } finally {
    formLoading.value = false
  }
}

// ── Deposit ──────────────────────────────────────────────
const showDeposit = ref(false)
const depositTarget = ref<Dream | null>(null)
const depositAmount = ref(0)
const depositLoading = ref(false)

function openDeposit(dream: Dream) {
  depositTarget.value = dream
  depositAmount.value = 0
  showDeposit.value = true
  showMenu.value = false
}

async function submitDeposit() {
  if (!depositTarget.value || !depositAmount.value) return
  depositLoading.value = true
  try {
    const updated = await store.deposit(depositTarget.value.id, depositAmount.value)
    meta.value = store.meta
    if (updated.is_completed) {
      $q.notify({ type: 'positive', message: `🎉 ¡Sueño "${updated.name}" completado!`, timeout: 4000 })
    } else {
      $q.notify({ type: 'positive', message: `Aporte registrado — ${updated.progress}% completado` })
    }
    showDeposit.value = false
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar el aporte' })
  } finally {
    depositLoading.value = false
  }
}

// ── Context Menu ─────────────────────────────────────────
const showMenu = ref(false)
const menuTarget = ref<Dream | null>(null)

function openMenu(dream: Dream) {
  menuTarget.value = dream
  showMenu.value = true
}

function onMenuEdit() { if (menuTarget.value) openEdit(menuTarget.value) }
function onMenuDeposit() { if (menuTarget.value) openDeposit(menuTarget.value) }

async function onMenuComplete() {
  if (!menuTarget.value) return
  try {
    await store.update(menuTarget.value.id, { is_completed: true })
    meta.value = store.meta
    $q.notify({ type: 'positive', message: '¡Sueño marcado como completado!' })
  } catch { /* ignore */ }
  showMenu.value = false
}

async function onMenuReopen() {
  if (!menuTarget.value) return
  try {
    await store.update(menuTarget.value.id, { is_completed: false })
    meta.value = store.meta
  } catch { /* ignore */ }
  showMenu.value = false
}

function onMenuDelete() {
  if (!menuTarget.value) return
  const name = menuTarget.value.name
  const id = menuTarget.value.id
  showMenu.value = false
  $q.dialog({
    title: 'Eliminar sueño',
    message: `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
    cancel: 'Cancelar',
    ok: { label: 'Eliminar', color: 'negative' },
  }).onOk(() => {
    void store.remove(id).then(() => {
      meta.value = store.meta
      $q.notify({ type: 'positive', message: 'Sueño eliminado' })
    }).catch(() => {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    })
  })
}
</script>

<style scoped lang="scss">
.dreams-page {
  padding: 0 0 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Page layout ──
.dreams-page {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 24px 32px 120px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .t-h1 { margin: 6px 0 0; }
  }
}

// ── Hero card ──
.dreams-hero {
  background: linear-gradient(135deg, rgba(139,92,246,.06) 0%, rgba(236,72,153,.06) 100%);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-xl);
  padding: 28px 32px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;

  &__left {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__amount {
    font-family: var(--font-money, monospace);
    font-size: clamp(32px, 4vw, 44px);
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #8B5CF6;
    font-variant-numeric: tabular-nums;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: var(--radius-pill);
    border: none;
    cursor: pointer;
    font-family: var(--font-body, sans-serif);
    font-size: 14px;
    font-weight: 700;
    background: #8B5CF6;
    color: #fff;
    box-shadow: 0 2px 10px rgba(139,92,246,.3);
    transition: background 150ms, box-shadow 150ms;
    white-space: nowrap;
    &:hover { background: #7C3AED; box-shadow: 0 4px 16px rgba(139,92,246,.4); }
    &:active { transform: scale(.97); }
  }
}

// ── Loading / empty ──
.dreams-loading {
  display: flex;
  justify-content: center;
  padding: 48px;
}

.dreams-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 56px 24px;
  text-align: center;
}

// ── Dreams grid ──
.dreams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

// ── Dream card ──
.dc {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 150ms;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }

  &--done { opacity: 0.72; }

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__ico {
    width: 38px; height: 38px; border-radius: var(--radius-md);
    background: rgba(139,92,246,.12); color: #8B5CF6;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;

    &--done { background: var(--income-soft); color: var(--income-fg); }
  }

  &__meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }

  &__name {
    font-family: var(--font-display, sans-serif);
    font-size: 14.5px;
    font-weight: 700;
    color: var(--fg-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    font-size: 12px;
    color: var(--fg-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__pct {
    font-family: var(--font-money, monospace);
    font-size: 15px;
    font-weight: 800;
    color: #8B5CF6;
    flex-shrink: 0;
  }

  &__menu-btn {
    border: none; background: transparent; cursor: pointer;
    color: var(--fg-3); padding: 2px;
    border-radius: var(--radius-sm);
    &:hover { background: var(--surface-2); color: var(--fg-1); }
  }

  &__amounts {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-variant-numeric: tabular-nums;
  }

  &__saved {
    font-family: var(--font-money, monospace);
    font-size: 19px;
    font-weight: 800;
    color: #8B5CF6;
  }

  &__target { font-size: 13px; color: var(--fg-3); }

  &__bar-track {
    height: 6px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 600ms ease-out;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-hairline);
    background: transparent;
    cursor: pointer;
    font-family: var(--font-body, sans-serif);
    font-size: 13px;
    font-weight: 600;
    color: var(--fg-2);
    transition: background 150ms, color 150ms;
    &:hover { background: var(--surface-2); color: var(--fg-1); }
  }
}

// ── Completed section ──
.dreams-completed {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: var(--fg-3);
  }
}

// ── Dialog ──
.dialog-card {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
  background: var(--surface-1) !important;
  max-height: 90vh;
  overflow-y: auto;
}
.dialog-handle {
  width: 36px; height: 4px;
  border-radius: 2px; background: var(--border-hairline);
  margin: 12px auto 0;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}
.dialog-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
.dialog-footer {
  padding: 12px 20px 24px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 500; color: var(--fg-2); }
.field-row { display: flex; gap: 12px; }

.color-row { display: flex; gap: 8px; flex-wrap: wrap; padding: 8px 0; }
.color-swatch {
  width: 26px; height: 26px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer;
  transition: transform .15s, border-color .15s;
  &.active { border-color: var(--fg-1); transform: scale(1.2); }
  &:hover { transform: scale(1.1); }
}

.deposit-progress { margin-bottom: 4px; }

// ── Menu dialog ──
.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  font-size: 15px;
  color: var(--fg-1);
  text-align: left;
  border-radius: var(--radius-sm);
  &:hover { background: var(--surface-2); }
  &--danger { color: var(--danger, #ef4444); margin-top: 4px; }
}

@media (max-width: 768px) {
  .dreams-page__container { padding: 16px 16px 100px; gap: 20px; }
  .dreams-hero { padding: 20px; }
  .dreams-grid { grid-template-columns: 1fr; }
}
</style>
