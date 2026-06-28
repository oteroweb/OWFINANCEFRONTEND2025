<template>
  <q-page class="cm-page">
    <div class="cm-container">
      <!-- ── Header con totales ── -->
      <header class="cm-header">
        <div class="cm-header__titles">
          <span class="cm-eyebrow">Cántaros</span>
          <h1 class="cm-header__title">Mis cántaros</h1>
          <p class="cm-header__sub">Distribuye tu dinero por frascos</p>
        </div>
        <button class="cm-add-btn" @click="openAddSheet">
          <q-icon name="add" size="18px" /> Añadir
        </button>
      </header>

      <!-- ── Card resumen: total + distribución ── -->
      <section class="cm-summary">
        <div class="cm-summary__row">
          <span class="cm-summary__label">Total en cántaros · USD</span>
          <span class="cm-summary__total" :class="{ 'is-over': anyOver }">
            {{ isHidden ? '$ ••••••' : formatMoney(totalBalance) }}
          </span>
        </div>

        <!-- Barra de distribución -->
        <div v-if="activeJars.length" class="cm-dist">
          <div
            v-for="jar in activeJars"
            :key="jar.id"
            class="cm-dist__seg"
            :style="{ flex: Math.max(jar.allocated, 1), background: jar.color || 'var(--info)' }"
            :title="`${jar.name}: ${formatMoney(jar.allocated)}`"
          />
        </div>

        <div class="cm-summary__stats">
          <div class="cm-stat">
            <span class="cm-stat__k">Activos</span>
            <span class="cm-stat__v">{{ activeJars.length }}</span>
          </div>
          <div class="cm-stat">
            <span class="cm-stat__k">Asignado</span>
            <span class="cm-stat__v">{{ isHidden ? '••••' : formatMoney(totalAllocated) }}</span>
          </div>
          <div class="cm-stat">
            <span class="cm-stat__k">Uso global</span>
            <span class="cm-stat__v" :class="{ 'is-over': anyOver }">{{ Math.round(globalUsePct) }}%</span>
          </div>
        </div>
      </section>

      <!-- ── Skeleton ── -->
      <div v-if="jarsLoading" class="cm-list">
        <div v-for="i in 4" :key="i" class="cm-skeleton" />
      </div>

      <!-- ── Empty state ── -->
      <div v-else-if="activeJars.length === 0" class="cm-empty">
        <q-icon name="water_drop" size="48px" style="color: var(--brand-primary); opacity: 0.4;" />
        <h2>Tus cántaros están vacíos</h2>
        <p>Registra un ingreso para distribuirlo, o crea tu primer cántaro.</p>
        <div class="cm-empty__actions">
          <button class="cm-add-btn" @click="ui.openNewTransactionDialog('income')">+ Registrar ingreso</button>
          <button class="cm-ghost-btn" @click="openAddSheet">Crear cántaro</button>
        </div>
      </div>

      <!-- ── Lista de cántaros (cards) ── -->
      <div v-else class="cm-list">
        <button
          v-for="jar in activeJars"
          :key="jar.id"
          type="button"
          class="cm-jar"
          @click="openDetail(jar)"
        >
          <div class="cm-jar__head">
            <span class="cm-jar__icon" :style="{ background: jar.color || 'var(--info)' }">
              <q-icon name="savings" size="18px" color="white" />
            </span>
            <div class="cm-jar__name-wrap">
              <span class="cm-jar__name">{{ jar.name }}</span>
              <div class="cm-jar__tags">
                <span class="cm-tag">{{ jar.percent }}%</span>
                <span v-if="jar.balance < 0" class="cm-tag cm-tag--over">
                  <q-icon name="error" size="12px" /> Excedido
                </span>
                <span v-else-if="jar.progress >= 100" class="cm-tag cm-tag--full">Lleno</span>
              </div>
            </div>
            <div class="cm-jar__value">
              <span class="cm-jar__amount" :class="{ 'is-over': jar.balance < 0 }">
                {{ isHidden ? '$ ••••' : formatMoney(jar.balance) }}
              </span>
              <q-icon name="chevron_right" size="20px" class="cm-jar__chevron" />
            </div>
          </div>

          <!-- Barra de uso fina -->
          <div class="cm-jar__bar">
            <div
              class="cm-jar__bar-fill"
              :style="{
                width: `${Math.min(100, jar.progress)}%`,
                background: barColor(jar),
              }"
            />
          </div>
          <div class="cm-jar__foot">
            <span :class="{ 'is-over': jar.balance < 0 }">{{ Math.round(jar.progress) }}% utilizado</span>
            <span>de {{ isHidden ? '••••' : formatMoney(jar.allocated) }}</span>
          </div>
        </button>
      </div>

      <!-- espaciador para FAB -->
      <div style="height: 84px"></div>

      <!-- ── FAB ── -->
      <button class="cm-fab" aria-label="Crear cántaro" @click="openAddSheet">
        <q-icon name="add" size="26px" color="white" />
      </button>

      <!-- ── Bottom-sheet: detalle ── -->
      <q-dialog v-model="showDetail" position="bottom">
        <div v-if="detailJar" class="cm-sheet">
          <div class="cm-sheet__handle" />

          <header class="cm-sheet__hero">
            <span class="cm-sheet__icon" :style="{ background: detailJar.color || 'var(--info)' }">
              <q-icon name="savings" size="26px" color="white" />
            </span>
            <div class="cm-sheet__title">{{ detailJar.name }}</div>
            <div class="cm-sheet__balance" :class="{ 'is-over': detailJar.balance < 0 }">
              {{ isHidden ? '$ ••••••' : formatMoney(detailJar.balance) }}
            </div>
            <div class="cm-sheet__balance-sub">disponible</div>
          </header>

          <!-- Barra de progreso -->
          <div class="cm-sheet__progress">
            <div
              class="cm-sheet__progress-fill"
              :style="{ width: `${Math.min(100, detailJar.progress)}%`, background: barColor(detailJar) }"
            />
          </div>

          <!-- Stats grid -->
          <div class="cm-sheet__stats">
            <div class="cm-stat2">
              <span class="cm-stat2__k">Porcentaje</span>
              <span class="cm-stat2__v">{{ detailJar.percent }}%</span>
            </div>
            <div class="cm-stat2">
              <span class="cm-stat2__k">Asignado</span>
              <span class="cm-stat2__v">{{ isHidden ? '••••' : formatMoney(detailJar.allocated) }}</span>
            </div>
            <div class="cm-stat2">
              <span class="cm-stat2__k">Utilizado</span>
              <span class="cm-stat2__v">{{ Math.round(detailJar.progress) }}%</span>
            </div>
            <div class="cm-stat2">
              <span class="cm-stat2__k">Disponible</span>
              <span class="cm-stat2__v" :class="{ 'is-over': detailJar.balance < 0 }">
                {{ isHidden ? '••••' : formatMoney(detailJar.balance) }}
              </span>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="cm-sheet__quick">
            <button class="cm-quick-btn cm-quick-btn--income" @click="quickAction('income')">
              <q-icon name="south_west" size="18px" /> Agregar
            </button>
            <button class="cm-quick-btn cm-quick-btn--expense" @click="quickAction('expense')">
              <q-icon name="north_east" size="18px" /> Retirar
            </button>
          </div>

          <!-- Acciones secundarias -->
          <div class="cm-sheet__footer">
            <button class="cm-btn cm-btn--danger" @click="confirmDeleteJar(detailJar)">
              <q-icon name="delete_outline" size="17px" /> Eliminar
            </button>
            <button class="cm-btn cm-btn--ghost" @click="showDetail = false">Cerrar</button>
            <button class="cm-btn cm-btn--primary" @click="openEditSheet(detailJar)">
              <q-icon name="edit" size="17px" /> Editar
            </button>
          </div>
        </div>
      </q-dialog>

      <!-- ── Bottom-sheet: editar ── -->
      <q-dialog v-model="showEditSheet" position="bottom">
        <div v-if="editJar" class="cm-sheet">
          <div class="cm-sheet__handle" />
          <div class="cm-form">
            <div class="cm-sheet__title" style="font-size: 17px">Editar cántaro</div>
            <div class="cm-field">
              <label class="cm-field__label">Nombre *</label>
              <input v-model="editJar.name" class="cm-input" placeholder="Nombre del cántaro" />
            </div>
            <div class="cm-field">
              <label class="cm-field__label">Porcentaje (%)</label>
              <input v-model.number="editJar.percent" type="number" min="1" max="100" class="cm-input" />
            </div>
            <div class="cm-field">
              <label class="cm-field__label">Color</label>
              <div class="cm-colors">
                <button
                  v-for="c in colorPalette"
                  :key="c"
                  type="button"
                  class="cm-color"
                  :class="{ 'is-active': editJar.color === c }"
                  :style="{ background: c }"
                  @click="editJar.color = c"
                />
              </div>
            </div>
            <div class="cm-sheet__footer">
              <button class="cm-btn cm-btn--ghost" @click="showEditSheet = false">Cancelar</button>
              <button class="cm-btn cm-btn--primary" :disabled="editSaving || !editJar.name" @click="saveEditJar">
                <q-spinner v-if="editSaving" size="15px" color="white" />
                <q-icon v-else name="check" size="17px" />
                {{ editSaving ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- ── Bottom-sheet: nuevo ── -->
      <q-dialog v-model="showAddSheet" position="bottom">
        <div class="cm-sheet">
          <div class="cm-sheet__handle" />
          <div class="cm-form">
            <div class="cm-sheet__title" style="font-size: 17px">Nuevo cántaro</div>
            <div class="cm-field">
              <label class="cm-field__label">Nombre *</label>
              <input v-model="newJar.name" class="cm-input" placeholder="Ej: Vacaciones, Emergencias…" />
            </div>
            <div class="cm-field">
              <label class="cm-field__label">Porcentaje (%)</label>
              <input v-model.number="newJar.percent" type="number" min="1" max="100" class="cm-input" placeholder="10" />
            </div>
            <div class="cm-field">
              <label class="cm-field__label">Color</label>
              <div class="cm-colors">
                <button
                  v-for="c in colorPalette"
                  :key="c"
                  type="button"
                  class="cm-color"
                  :class="{ 'is-active': newJar.color === c }"
                  :style="{ background: c }"
                  @click="newJar.color = c"
                />
              </div>
            </div>
            <div v-if="addError" class="cm-error">{{ addError }}</div>
            <div class="cm-sheet__footer">
              <button class="cm-btn cm-btn--ghost" @click="showAddSheet = false">Cancelar</button>
              <button class="cm-btn cm-btn--primary" :disabled="addSaving || !newJar.name" @click="saveNewJar">
                <q-spinner v-if="addSaving" size="15px" color="white" />
                <q-icon v-else name="check" size="17px" />
                {{ addSaving ? 'Guardando…' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';

defineOptions({ name: 'LiteJarsView' });

const $q = useQuasar();
const ui = useUiStore();
const isHidden = computed(() => ui.hideValues);

interface JarItem {
  id: number;
  name: string;
  balance: number;
  allocated: number;
  progress: number;
  percent: number;
  color?: string;
}

const activeJars = ref<JarItem[]>([]);
const jarsLoading = ref(false);

const totalBalance = computed(() => activeJars.value.reduce((s, j) => s + j.balance, 0));
const totalAllocated = computed(() => activeJars.value.reduce((s, j) => s + Math.max(0, j.allocated), 0));
const anyOver = computed(() => activeJars.value.some((j) => j.balance < 0));
const globalUsePct = computed(() => {
  const alloc = totalAllocated.value;
  if (alloc <= 0) return 0;
  const used = activeJars.value.reduce((s, j) => s + Math.max(0, j.allocated - j.balance), 0);
  return Math.max(0, Math.min(100, (used / alloc) * 100));
});

// ── Detail ─────────────────────────────────────────────────────────────────
const showDetail = ref(false);
const detailJar = ref<JarItem | null>(null);

function openDetail(jar: JarItem) {
  detailJar.value = jar;
  showDetail.value = true;
}

// Acción rápida: abre el modal global de transacción con el tipo prefijado
function quickAction(kind: 'income' | 'expense') {
  showDetail.value = false;
  ui.openNewTransactionDialog(kind);
}

// ── Edit ─────────────────────────────────────────────────────────────────────
const showEditSheet = ref(false);
const editJar = ref<{ id: number; name: string; percent: number; color: string } | null>(null);
const editSaving = ref(false);

function openEditSheet(jar: JarItem) {
  editJar.value = { id: jar.id, name: jar.name, percent: jar.percent, color: jar.color || '#3B82F6' };
  showDetail.value = false;
  showEditSheet.value = true;
}

async function saveEditJar() {
  if (!editJar.value) return;
  editSaving.value = true;
  try {
    await api.put(`/jars/${editJar.value.id}`, {
      name: editJar.value.name,
      percent: editJar.value.percent,
      color: editJar.value.color,
    });
    showEditSheet.value = false;
    await loadJars();
    $q.notify({ type: 'positive', message: 'Cántaro actualizado' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al actualizar el cántaro' });
  } finally {
    editSaving.value = false;
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
function confirmDeleteJar(jar: JarItem | null) {
  if (!jar) return;
  $q.dialog({
    title: 'Eliminar cántaro',
    message: `¿Eliminar "${jar.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative', unelevated: true },
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/jars/${jar.id}`);
        showDetail.value = false;
        await loadJars();
        $q.notify({ type: 'positive', message: 'Cántaro eliminado' });
      } catch {
        $q.notify({ type: 'negative', message: 'Error al eliminar' });
      }
    })();
  });
}

// ── Add ──────────────────────────────────────────────────────────────────────
const showAddSheet = ref(false);
const addSaving = ref(false);
const addError = ref<string | null>(null);

const colorPalette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0EA5E9', '#F97316'];

const blankJar = () => ({ name: '', percent: 10, color: '#3B82F6' });
const newJar = ref(blankJar());

function openAddSheet() {
  newJar.value = blankJar();
  addError.value = null;
  showAddSheet.value = true;
}

async function saveNewJar() {
  if (!newJar.value.name) return;
  addSaving.value = true;
  addError.value = null;
  try {
    await api.post('/jars', {
      name: newJar.value.name.trim(),
      percent: newJar.value.percent ?? 10,
      color: newJar.value.color,
    });
    $q.notify({ type: 'positive', message: 'Cántaro creado' });
    showAddSheet.value = false;
    void loadJars();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    addError.value = e?.response?.data?.message ?? 'Error al crear el cántaro';
  } finally {
    addSaving.value = false;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(n: number): string {
  return `$ ${Math.abs(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function barColor(jar: JarItem): string {
  if (jar.balance < 0) return 'var(--expense)';
  if (jar.progress > 85) return 'var(--warning)';
  return jar.color || 'var(--info)';
}

// ── Data loading ─────────────────────────────────────────────────────────────
async function loadJars() {
  jarsLoading.value = true;
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData: Record<string, unknown>[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? (raw.data as Record<string, unknown>[])
        : [];
    const now = new Date();
    const balDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const results = await Promise.all(
      jarsData.map(async (jar): Promise<JarItem | null> => {
        try {
          const jarId = Number(jar.id);
          const balRes = await api.get(`/jars/${jarId}/balance`, { params: { date: balDate } });
          const bal = balRes.data?.data || {};
          const assigned = Number(bal.allocated_amount || 0);
          const balance = Number(bal.available_balance || 0);
          const progress = assigned > 0 ? Math.min(100, Math.round(((assigned - balance) / assigned) * 100)) : 0;
          return {
            id: jarId,
            name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
            balance,
            allocated: assigned,
            progress,
            percent: Number(jar.percent ?? 0),
            color: (jar.color as string) || 'var(--info)',
          };
        } catch {
          return null;
        }
      }),
    );

    activeJars.value = results.filter((j): j is JarItem => j !== null);

    const totAllocated = activeJars.value.reduce((acc, j) => acc + Math.max(0, j.allocated), 0);
    const totAvailable = activeJars.value.reduce((acc, j) => acc + Math.max(0, j.balance), 0);
    const availabilityPct = totAllocated > 0 ? (totAvailable / totAllocated) * 100 : 0;

    ui.setJarStatus({
      totalAllocated: totAllocated,
      totalAvailable: totAvailable,
      availabilityPercent: Math.max(0, Math.min(100, availabilityPct)),
      usedPercent: Math.max(0, Math.min(100, 100 - availabilityPct)),
      jarCount: activeJars.value.length,
    });
  } catch (err) {
    console.warn('[LiteJars] error:', err);
  } finally {
    jarsLoading.value = false;
  }
}

onMounted(() => {
  void loadJars();
});
</script>

<style scoped lang="scss">
.cm-page {
  background: var(--bg-canvas);
  min-height: 100vh;
}

.cm-container {
  max-width: var(--container-max, 480px);
  margin: 0 auto;
  padding: 20px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

// ── Header ──
.cm-eyebrow {
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-2, #64748b);
}

.cm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  &__title {
    font-family: var(--font-display, sans-serif);
    font-size: 22px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    margin: 4px 0 0;
  }

  &__sub {
    font-family: var(--font-body, sans-serif);
    font-size: 12.5px;
    color: var(--fg-2, #64748b);
    margin: 2px 0 0;
  }
}

.cm-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 9px 15px;
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-pill, 999px);
  background: var(--brand-primary, #2d4da6);
  color: #fff;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(45, 77, 166, 0.28);
  &:hover {
    opacity: 0.9;
  }
}

// ── Summary card ──
.cm-summary {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  padding: 18px 18px 16px;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0, 0, 0, 0.08));
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label {
    font-family: var(--font-body, sans-serif);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--fg-2, #64748b);
  }

  &__total {
    font-family: var(--font-money, monospace);
    font-size: 28px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
    line-height: 1.05;
    &.is-over {
      color: var(--expense-fg, #ef4444);
    }
  }

  &__stats {
    display: flex;
    gap: 22px;
  }
}

.cm-dist {
  display: flex;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  gap: 2px;

  &__seg {
    min-width: 4px;
    border-radius: 999px;
    transition: flex 400ms var(--ease-out, ease);
  }
}

.cm-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__k {
    font-family: var(--font-body, sans-serif);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--fg-2, #64748b);
  }

  &__v {
    font-family: var(--font-money, monospace);
    font-size: 15px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
    &.is-over {
      color: var(--expense-fg, #ef4444);
    }
  }
}

// ── Jar list ──
.cm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cm-jar {
  width: 100%;
  text-align: left;
  border: 1.5px solid transparent;
  background: var(--surface-1, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 13px 14px;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0, 0, 0, 0.08));
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 11px;
  transition: box-shadow 150ms, border-color 120ms;
  &:hover {
    box-shadow: var(--shadow-hover, 0 3px 12px rgba(0, 0, 0, 0.13));
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  &__icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__name {
    font-family: var(--font-display, sans-serif);
    font-size: 15px;
    font-weight: 600;
    color: var(--fg-1, #0f172a);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }

  &__value {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  &__amount {
    font-family: var(--font-money, monospace);
    font-size: 17px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
    &.is-over {
      color: var(--expense-fg, #ef4444);
    }
  }

  &__chevron {
    color: var(--fg-3, #94a3b8);
  }

  &__bar {
    height: 5px;
    border-radius: 3px;
    background: var(--surface-2, #f1f4f6);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 400ms var(--ease-out, ease);
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    font-family: var(--font-body, sans-serif);
    font-size: 11.5px;
    color: var(--fg-2, #64748b);
    .is-over {
      color: var(--expense-fg, #ef4444);
    }
  }
}

.cm-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-2, #f1f4f6);
  color: var(--fg-2, #64748b);
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 600;

  &--over {
    background: var(--expense-soft, #fee2e2);
    color: var(--expense-fg, #ef4444);
  }

  &--full {
    background: var(--income-soft, #dcfce7);
    color: var(--income-fg, #16a34a);
  }
}

// ── FAB ──
.cm-fab {
  position: fixed;
  right: 20px;
  bottom: calc(84px + env(safe-area-inset-bottom));
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border: 0;
  cursor: pointer;
  background: var(--brand-primary, #2d4da6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(45, 77, 166, 0.42);
  z-index: 30;
  transition: transform 120ms, box-shadow 160ms;
  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.96);
  }
}

// ── Empty ──
.cm-empty {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  padding: 44px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-card);

  h2 {
    font-family: var(--font-display, sans-serif);
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    color: var(--fg-1, #0f172a);
  }

  p {
    color: var(--fg-2, #64748b);
    margin: 0;
    max-width: 280px;
    font-size: 14px;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.cm-ghost-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-primary, #2d4da6);
  padding: 9px 15px;
  border-radius: var(--radius-sm, 8px);
  &:hover {
    background: rgba(45, 77, 166, 0.08);
  }
}

// ── Skeleton ──
.cm-skeleton {
  height: 78px;
  border-radius: var(--radius-lg, 16px);
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: cm-sk 1.5s infinite;
}

@keyframes cm-sk {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// ── Bottom-sheet ──
.cm-sheet {
  background: var(--surface-1, #fff);
  border-radius: 22px 22px 0 0;
  min-width: min(480px, 100vw);
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);

  &__handle {
    width: 40px;
    height: 4px;
    background: var(--surface-3, #e2e8f0);
    border-radius: 999px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 20px 24px 10px;
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  &__title {
    font-family: var(--font-display, sans-serif);
    font-size: 18px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
  }

  &__balance {
    font-family: var(--font-money, monospace);
    font-size: 30px;
    font-weight: 700;
    color: var(--income-fg, #16a34a);
    font-variant-numeric: tabular-nums;
    line-height: 1.05;
    &.is-over {
      color: var(--expense-fg, #ef4444);
    }
  }

  &__balance-sub {
    font-family: var(--font-body, sans-serif);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-3, #94a3b8);
  }

  &__progress {
    height: 7px;
    background: var(--surface-2, #f1f4f6);
    margin: 8px 20px 0;
    border-radius: 4px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 400ms var(--ease-out, ease);
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border-hairline, #e2e8f0);
    margin: 16px 0 0;
    border-top: 1px solid var(--border-hairline);
    border-bottom: 1px solid var(--border-hairline);
  }

  &__quick {
    display: flex;
    gap: 10px;
    padding: 16px 20px 4px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px 20px;
    flex-wrap: wrap;
  }
}

.cm-stat2 {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  background: var(--surface-1, #fff);

  &__k {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-3, #94a3b8);
  }

  &__v {
    font-family: var(--font-money, monospace);
    font-size: 16px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
    &.is-over {
      color: var(--expense-fg, #ef4444);
    }
  }
}

.cm-quick-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-md, 12px);
  padding: 12px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 700;
  transition: opacity 140ms;
  &:hover {
    opacity: 0.88;
  }

  &--income {
    background: var(--income-soft, #dcfce7);
    color: var(--income-fg, #16a34a);
  }

  &--expense {
    background: var(--expense-soft, #fee2e2);
    color: var(--expense-fg, #ef4444);
  }
}

.cm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 18px;
  transition: opacity 140ms, background 140ms;

  &--primary {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    box-shadow: 0 3px 10px rgba(45, 77, 166, 0.28);
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &--ghost {
    background: var(--surface-2, #f1f4f6);
    color: var(--fg-2);
    &:hover {
      background: var(--surface-3);
    }
  }

  &--danger {
    background: var(--expense-soft, #fee2e2);
    color: var(--expense-fg, #ef4444);
    margin-right: auto;
  }
}

// ── Forms ──
.cm-form {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cm-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cm-field__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
}

.cm-input {
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: 8px;
  padding: 10px 13px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-2, #f8fafc);
  outline: none;
  box-sizing: border-box;
  width: 100%;
  &:focus {
    border-color: var(--brand-primary);
  }
  &::placeholder {
    color: var(--fg-3);
  }
}

.cm-colors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cm-color {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 120ms;
  &.is-active {
    border-color: var(--fg-1);
    transform: scale(1.2);
  }
  &:hover {
    transform: scale(1.15);
  }
}

.cm-error {
  font-size: 13px;
  color: var(--expense-fg, #b91c1c);
  padding: 8px 12px;
  background: var(--expense-soft, rgba(239, 68, 68, 0.1));
  border-radius: 8px;
}
</style>
