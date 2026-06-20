<template>
  <div class="dreams-page">

    <!-- GLOBAL SUMMARY -->
    <div v-if="meta" class="dreams-summary card card-pad-lg">
      <div class="summary-main">
        <div>
          <div class="ds-lbl">Total ahorrado</div>
          <div class="ds-amount">{{ fmt(meta.total_saved) }}</div>
          <div class="ds-sub">de {{ fmt(meta.total_target) }} en metas</div>
        </div>
        <div class="ds-donut-wrap">
          <div
            class="ds-donut"
            :style="`background: conic-gradient(var(--brand-primary) 0 ${meta.global_progress}%, var(--surface-2) ${meta.global_progress}% 100%)`"
          >
            <div class="ds-donut-inner">
              <span class="ds-pct">{{ meta.global_progress }}%</span>
              <span class="ds-pct-lbl">global</span>
            </div>
          </div>
        </div>
      </div>
      <div class="summary-chips">
        <span class="chip"><span class="material-icons" style="font-size:14px">flag</span>{{ meta.count }} sueños</span>
        <span v-if="meta.completed_count" class="chip" style="background:var(--income-soft);color:var(--income-fg)">
          <span class="material-icons" style="font-size:14px">check_circle</span>{{ meta.completed_count }} completados
        </span>
      </div>
    </div>

    <!-- PAGE HEADER -->
    <div class="dreams-header">
      <h1 class="t-h2">Mis sueños</h1>
      <button class="btn btn-primary" @click="openCreate">
        <span class="material-icons">add</span>Nuevo sueño
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="store.loading" class="dreams-empty">
      <span class="material-icons spin">autorenew</span>
      <p>Cargando sueños...</p>
    </div>

    <!-- EMPTY -->
    <div v-else-if="!store.dreams.length" class="dreams-empty">
      <span class="material-icons empty-ico">auto_awesome</span>
      <h3>Aún no tienes sueños</h3>
      <p>Define una meta — una casa, un viaje, un posgrado — y rastrea tu avance aquí.</p>
      <button class="btn btn-primary" @click="openCreate">
        <span class="material-icons">add</span>Crear primer sueño
      </button>
    </div>

    <!-- ACTIVE DREAMS -->
    <div v-else class="dreams-list">
      <div
        v-for="dream in store.active"
        :key="dream.id"
        class="dream-card card card-pad-lg"
        :style="dream.color ? `--dream-accent: ${dream.color}` : ''"
      >
        <div class="dc-top">
          <div class="dc-ico" :style="dream.color ? `background:${dream.color}22;color:${dream.color}` : ''">
            <span v-if="dream.emoji" class="dc-emoji">{{ dream.emoji }}</span>
            <span v-else class="material-icons">auto_awesome</span>
          </div>
          <div class="dc-info">
            <div class="dc-name">{{ dream.name }}</div>
            <div v-if="dream.description" class="dc-desc">{{ dream.description }}</div>
          </div>
          <div class="dc-pct">{{ dream.progress }}%</div>
          <button class="icon-btn dc-menu" @click="openMenu(dream)">
            <span class="material-icons">more_vert</span>
          </button>
        </div>

        <div class="dc-amounts">
          <span class="dc-saved">{{ fmt(dream.saved_amount) }}</span>
          <span class="dc-target">/ {{ fmt(dream.target_amount) }}</span>
        </div>

        <div class="bar dc-bar">
          <i
            :style="`width:${Math.min(dream.progress, 100)}%;background:${dream.color ?? 'var(--brand-primary)'}`"
          ></i>
        </div>

        <div class="dc-actions">
          <button class="btn btn-ghost btn-sm" @click="openDeposit(dream)">
            <span class="material-icons">savings</span>Aportar
          </button>
          <button class="btn btn-ghost btn-sm" @click="openEdit(dream)">
            <span class="material-icons">edit</span>Editar
          </button>
        </div>
      </div>

      <!-- COMPLETED -->
      <div v-if="store.completed.length" class="completed-section">
        <div class="completed-title">
          <span class="material-icons" style="color:var(--income-fg)">check_circle</span>
          Completados ({{ store.completed.length }})
        </div>
        <div
          v-for="dream in store.completed"
          :key="dream.id"
          class="dream-card dream-card--done card card-pad-lg"
        >
          <div class="dc-top">
            <div class="dc-ico done-ico">
              <span v-if="dream.emoji" class="dc-emoji">{{ dream.emoji }}</span>
              <span v-else class="material-icons">check_circle</span>
            </div>
            <div class="dc-info">
              <div class="dc-name">{{ dream.name }}</div>
              <div class="dc-desc" style="color:var(--income-fg)">¡Completado! {{ fmt(dream.saved_amount) }}</div>
            </div>
            <button class="icon-btn" @click="openMenu(dream)">
              <span class="material-icons">more_vert</span>
            </button>
          </div>
          <div class="bar dc-bar">
            <i style="width:100%;background:var(--income)"></i>
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

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useDreamsStore, type Dream } from 'src/stores/dreams'

defineOptions({ name: 'DreamsPage' })

const $q = useQuasar()
const store = useDreamsStore()

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

async function onMenuDelete() {
  if (!menuTarget.value) return
  const name = menuTarget.value.name
  showMenu.value = false
  $q.dialog({
    title: 'Eliminar sueño',
    message: `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
    cancel: 'Cancelar',
    ok: { label: 'Eliminar', color: 'negative' },
  }).onOk(async () => {
    try {
      await store.remove(menuTarget.value!.id)
      meta.value = store.meta
      $q.notify({ type: 'positive', message: 'Sueño eliminado' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
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

// Summary card
.dreams-summary {
  .summary-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  .ds-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--fg-3); font-weight: 600; }
  .ds-amount { font-family: var(--font-money); font-weight: 700; font-size: 28px; letter-spacing: -0.02em; margin-top: 4px; }
  .ds-sub { font-size: 13px; color: var(--fg-2); margin-top: 2px; }
  .ds-donut-wrap { flex-shrink: 0; }
  .ds-donut {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .ds-donut-inner {
    width: 52px; height: 52px; border-radius: 50%; background: var(--surface-1);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .ds-pct { font-family: var(--font-money); font-weight: 700; font-size: 14px; line-height: 1; }
  .ds-pct-lbl { font-size: 9px; color: var(--fg-3); text-transform: uppercase; }
  .summary-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
}

// Header
.dreams-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

// Empty / loading
.dreams-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--fg-2);
  .empty-ico { font-size: 48px; color: var(--fg-3); }
  h3 { font-family: var(--font-display); font-size: 18px; margin: 0; color: var(--fg-1); }
  p { font-size: 14px; max-width: 280px; margin: 0; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
}

// Dream cards list
.dreams-list { display: flex; flex-direction: column; gap: 14px; }

.dream-card {
  &--done { opacity: 0.72; }

  .dc-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .dc-ico {
    width: 40px; height: 40px; border-radius: var(--radius-md);
    background: var(--brand-primary-soft); color: var(--brand-primary-fg-soft);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    font-size: 20px;
  }
  .done-ico { background: var(--income-soft); color: var(--income-fg); }
  .dc-emoji { font-size: 22px; line-height: 1; }
  .dc-info { flex: 1; min-width: 0; }
  .dc-name { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dc-desc { font-size: 12px; color: var(--fg-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dc-pct { font-family: var(--font-money); font-weight: 700; font-size: 16px; color: var(--fg-1); flex-shrink: 0; }
  .dc-menu { margin-left: -4px; }
  .dc-amounts {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-top: 12px;
  }
  .dc-saved { font-family: var(--font-money); font-weight: 700; font-size: 18px; }
  .dc-target { font-size: 13px; color: var(--fg-3); }
  .dc-bar { margin-top: 8px; }
  .dc-actions {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }
}

.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-sm .material-icons { font-size: 16px; }

// Completed section
.completed-section { margin-top: 8px; }
.completed-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--fg-3);
  margin-bottom: 10px;
}

// Dialog
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

// Menu dialog
.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--fg-1);
  text-align: left;
  border-radius: var(--radius-sm);
  &:hover { background: var(--surface-2); }
  &--danger { color: var(--danger, #ef4444); margin-top: 4px; }
  .material-icons { font-size: 22px; color: var(--fg-2); }
  &--danger .material-icons { color: inherit; }
}
</style>
