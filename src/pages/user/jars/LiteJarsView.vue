<template>
  <q-page class="lite-page">
    <div class="lite-page__container">
      <!-- Header -->
      <div class="jars-page-header">
        <div>
          <span class="t-eyebrow">Cántaros</span>
          <h1 class="t-h1" style="margin: 6px 0 0">Tu dinero, repartido</h1>
        </div>
        <button class="add-btn" @click="openAddSheet">
          <q-icon name="add" size="18px" /> Nuevo
        </button>
      </div>

      <!-- Hero card with distribution strip -->
      <div class="hero-card">
        <div class="hero-card__top">
          <div>
            <span class="t-eyebrow">Total en cántaros · USD</span>
            <span class="t-hero-amount" style="display:block;margin-top:4px">
              {{ isHidden ? '$ ••••••' : formatMoney(totalBalance) }}
            </span>
          </div>
          <div class="hero-card__meta">
            <span class="hero-card__stat">{{ activeJars.length }} activos</span>
          </div>
        </div>

        <!-- Distribution strip -->
        <div v-if="activeJars.length" class="dist-strip">
          <div
            v-for="jar in activeJars"
            :key="jar.id"
            class="dist-strip__segment"
            :style="{ flex: jar.allocated || jar.percent || 1, background: jar.color || 'var(--info)' }"
            :title="`${jar.name}: ${jar.percent}%`"
          />
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="jarsLoading" class="jars-list">
        <div v-for="i in 4" :key="i" class="skeleton-row" />
      </div>

      <!-- Empty state -->
      <div v-else-if="activeJars.length === 0" class="entry-gate">
        <q-icon name="water" size="48px" style="color: var(--brand-primary); opacity: 0.4;" />
        <h2>Tus cántaros están vacíos</h2>
        <p>Registra un ingreso para distribuirlo entre tus cántaros.</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
          <button class="add-btn" @click="ui.openSmartModal('write', 'income')">+ Registrar ingreso</button>
          <button class="ghost-btn" @click="openAddSheet">Crear cántaro</button>
        </div>
      </div>

      <!-- Jar list (spec: vertical rows) -->
      <div v-else class="jars-list">
        <div
          v-for="jar in activeJars"
          :key="jar.id"
          class="jar-row"
          @click="openDetail(jar)"
        >
          <!-- Color icon -->
          <div class="jar-row__icon" :style="{ background: jar.color || 'var(--info)' }">
            <q-icon name="savings" size="18px" color="white" />
          </div>

          <!-- Info -->
          <div class="jar-row__info">
            <div class="jar-row__name">{{ jar.name }}</div>
            <div class="jar-row__bar">
              <div class="jar-row__bar-fill"
                :style="{ width: `${Math.min(100, jar.progress)}%`, background: jar.color || 'var(--info)' }" />
            </div>
          </div>

          <!-- Right column: percent + balance + attention indicator -->
          <div class="jar-row__right">
            <span class="jar-row__percent">{{ jar.percent }}%</span>
            <span class="jar-row__balance">
              {{ isHidden ? '••••' : formatMoney(jar.balance) }}
            </span>
            <span v-if="jar.balance < 0 || jar.progress > 100" class="jar-row__attention" title="Requiere atención">
              <q-icon name="warning" size="14px" />
            </span>
          </div>

          <q-icon v-if="jar.balance >= 0 && jar.progress <= 100" name="chevron_right" size="20px" color="grey-4" />
        </div>
      </div>

      <!-- Jar detail bottom sheet -->
      <q-dialog v-model="showDetail" position="bottom">
        <div v-if="detailJar" class="jar-detail-sheet">
          <div class="jar-detail-sheet__handle" />

          <!-- Hero -->
          <div class="jar-detail-sheet__hero">
            <div class="jar-detail-sheet__icon" :style="{ background: detailJar.color || 'var(--info)' }">
              <q-icon name="savings" size="26px" color="white" />
            </div>
            <div class="jar-detail-sheet__name">{{ detailJar.name }}</div>
            <div class="jar-detail-sheet__balance">
              {{ isHidden ? '$ ••••••' : formatMoney(detailJar.balance) }}
            </div>
          </div>

          <!-- Stats grid -->
          <div class="jar-detail-sheet__stats">
            <div class="jar-stat">
              <span class="jar-stat__label">Porcentaje</span>
              <span class="jar-stat__value">{{ detailJar.percent }}%</span>
            </div>
            <div class="jar-stat">
              <span class="jar-stat__label">Asignado</span>
              <span class="jar-stat__value">{{ formatMoney(detailJar.allocated) }}</span>
            </div>
            <div class="jar-stat">
              <span class="jar-stat__label">Disponible</span>
              <span class="jar-stat__value">{{ formatMoney(detailJar.balance) }}</span>
            </div>
            <div class="jar-stat">
              <span class="jar-stat__label">Uso</span>
              <span class="jar-stat__value">{{ Math.round(detailJar.progress) }}%</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="jar-detail-sheet__progress-wrap">
            <div class="jar-detail-sheet__progress-fill"
              :style="{ width: `${Math.min(100, detailJar.progress)}%`, background: detailJar.color || 'var(--info)' }" />
          </div>

          <!-- Footer actions -->
          <div class="jar-detail-sheet__footer" style="flex-wrap:wrap;gap:8px;">
            <button class="jd-btn jd-btn--ghost" style="color:var(--expense-fg,#ef4444)" @click="confirmDeleteJar(detailJar)">
              <q-icon name="delete_outline" size="17px" /> Eliminar
            </button>
            <button class="jd-btn jd-btn--ghost" @click="showDetail = false">Cerrar</button>
            <button class="jd-btn jd-btn--primary" @click="openEditSheet(detailJar)">
              <q-icon name="edit" size="17px" /> Editar
            </button>
          </div>
        </div>
      </q-dialog>

      <!-- Edit jar sheet -->
      <q-dialog v-model="showEditSheet" position="bottom">
        <div v-if="editJar" class="jar-detail-sheet">
          <div class="jar-detail-sheet__handle" />
          <div style="padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 14px;">
            <div class="jar-detail-sheet__name" style="font-size:17px">Editar cántaro</div>
            <div class="jf-field">
              <label class="jf-label">Nombre *</label>
              <input v-model="editJar.name" class="jf-input" placeholder="Nombre del cántaro" />
            </div>
            <div class="jf-field">
              <label class="jf-label">Porcentaje (%)</label>
              <input v-model.number="editJar.percent" type="number" min="1" max="100" class="jf-input" />
            </div>
            <div class="jf-field">
              <label class="jf-label">Color</label>
              <div class="jf-colors">
                <button v-for="c in colorPalette" :key="c"
                  class="jf-color-btn"
                  :class="{ 'jf-color-btn--active': editJar.color === c }"
                  :style="{ background: c }"
                  @click="editJar.color = c"
                />
              </div>
            </div>
            <div class="jar-detail-sheet__footer">
              <button class="jd-btn jd-btn--ghost" @click="showEditSheet = false">Cancelar</button>
              <button class="jd-btn jd-btn--primary" :disabled="editSaving || !editJar.name" @click="saveEditJar">
                <q-spinner v-if="editSaving" size="15px" color="white" />
                <q-icon v-else name="check" size="17px" />
                {{ editSaving ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </q-dialog>

      <!-- Add jar sheet (simple) -->
      <q-dialog v-model="showAddSheet" position="bottom">
        <div class="jar-detail-sheet">
          <div class="jar-detail-sheet__handle" />
          <div style="padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 14px;">
            <div class="jar-detail-sheet__name" style="font-size:17px">Nuevo cántaro</div>
            <div class="jf-field">
              <label class="jf-label">Nombre *</label>
              <input v-model="newJar.name" class="jf-input" placeholder="Ej: Vacaciones, Emergencias…" />
            </div>
            <div class="jf-field">
              <label class="jf-label">Porcentaje (%)</label>
              <input v-model.number="newJar.percent" type="number" min="1" max="100" class="jf-input" placeholder="10" />
            </div>
            <div class="jf-field">
              <label class="jf-label">Color</label>
              <div class="jf-colors">
                <button v-for="c in colorPalette" :key="c"
                  class="jf-color-btn"
                  :class="{ 'jf-color-btn--active': newJar.color === c }"
                  :style="{ background: c }"
                  @click="newJar.color = c"
                />
              </div>
            </div>
            <div v-if="addError" style="font-size:13px;color:#b91c1c;padding:8px 12px;background:rgba(239,68,68,.1);border-radius:8px">
              {{ addError }}
            </div>
            <div class="jar-detail-sheet__footer">
              <button class="jd-btn jd-btn--ghost" @click="showAddSheet = false">Cancelar</button>
              <button class="jd-btn jd-btn--primary" :disabled="addSaving || !newJar.name" @click="saveNewJar">
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

const activeJars    = ref<JarItem[]>([]);
const jarsLoading   = ref(false);
const totalBalance  = computed(() => activeJars.value.reduce((s, j) => s + j.balance, 0));

// ── Detail ────────────────────────────────────────────────────────────────
const showDetail = ref(false);
const detailJar  = ref<JarItem | null>(null);

function openDetail(jar: JarItem) {
  detailJar.value = jar;
  showDetail.value = true;
}

// ── Edit ──────────────────────────────────────────────────────────────────
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

// ── Delete ────────────────────────────────────────────────────────────────
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

// ── Add ───────────────────────────────────────────────────────────────────
const showAddSheet = ref(false);
const addSaving    = ref(false);
const addError     = ref<string | null>(null);

const colorPalette = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#0EA5E9','#F97316'];

const blankJar = () => ({ name: '', percent: 10, color: '#3B82F6' });
const newJar   = ref(blankJar());

function openAddSheet() {
  newJar.value = blankJar();
  addError.value = null;
  showAddSheet.value = true;
}

async function saveNewJar() {
  if (!newJar.value.name) return;
  addSaving.value = true;
  addError.value  = null;
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

// ── Helpers ───────────────────────────────────────────────────────────────
function formatMoney(n: number): string {
  return `$ ${Math.abs(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Data loading ──────────────────────────────────────────────────────────
async function loadJars() {
  jarsLoading.value = true;
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData: Record<string, unknown>[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? (raw.data as Record<string, unknown>[]) : [];
    const now = new Date();
    const balDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const results = await Promise.all(
      jarsData.map(async (jar): Promise<JarItem | null> => {
        try {
          const jarId = Number(jar.id);
          const balRes = await api.get(`/jars/${jarId}/balance`, { params: { date: balDate } });
          const bal = balRes.data?.data || {};
          const assigned = Number(bal.allocated_amount || 0);
          const balance  = Number(bal.available_balance || 0);
          const progress = assigned > 0 ? Math.min(100, Math.round((assigned - balance) / assigned * 100)) : 0;
          return {
            id: jarId,
            name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
            balance,
            allocated: assigned,
            progress,
            percent: Number(jar.percent ?? 0),
            color: (jar.color as string) || 'var(--info)',
          };
        } catch { return null; }
      })
    );

    activeJars.value = results.filter((j): j is JarItem => j !== null);

    const totalAllocated   = activeJars.value.reduce((acc, j) => acc + Math.max(0, j.allocated), 0);
    const totalAvailable   = activeJars.value.reduce((acc, j) => acc + Math.max(0, j.balance), 0);
    const availabilityPct  = totalAllocated > 0 ? (totalAvailable / totalAllocated) * 100 : 0;

    ui.setJarStatus({
      totalAllocated,
      totalAvailable,
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

onMounted(() => { void loadJars(); });
</script>

<style scoped lang="scss">
.lite-page {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__container {
    max-width: var(--container-max, 860px);
    margin: 0 auto;
    padding: 24px 32px 140px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

// ── Page header ──
.jars-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-pill, 999px);
  background: var(--brand-primary, #2d4da6);
  color: #fff;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(45,77,166,.28);
  &:hover { opacity: .9; }
}

// ── Hero card ──
.hero-card {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  padding: 24px 28px 20px;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,.08));
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  &__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }

  &__stat {
    font-size: 12px;
    color: var(--fg-2, #64748b);
    background: var(--surface-2, #f1f4f6);
    padding: 4px 10px;
    border-radius: 999px;
  }
}

// ── Distribution strip ──
.dist-strip {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  gap: 2px;

  &__segment {
    min-width: 4px;
    border-radius: 999px;
    transition: flex 400ms ease;
  }
}

// ── Jar rows ──
.jars-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jar-row {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 14px 16px;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,.08));
  display: flex;
  align-items: center;
  gap: 13px;
  cursor: pointer;
  transition: box-shadow 150ms;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,.12); }

  &__icon {
    width: 38px; height: 38px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  &__name {
    font-family: var(--font-display, 'DM Sans', sans-serif);
    font-size: 14px;
    font-weight: 600;
    color: var(--fg-1, #0f172a);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__bar {
    height: 4px;
    border-radius: 3px;
    background: var(--surface-2, #f1f4f6);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 500ms ease-out;
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }

  &__attention {
    color: var(--expense-fg, #ef4444);
    display: inline-flex;
    align-items: center;
  }

  &__percent {
    font-size: 11px;
    font-weight: 700;
    color: var(--fg-2, #64748b);
    background: var(--surface-2, #f1f4f6);
    padding: 2px 8px;
    border-radius: 999px;
  }

  &__balance {
    font-family: var(--font-money, monospace);
    font-size: 14.5px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
  }
}

// ── Empty / Entry gate ──
.empty-card {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-card);
}

.entry-gate {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-card);

  h2 {
    font-family: var(--font-display, 'DM Sans', sans-serif);
    font-size: 1.25rem;
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
}

.ghost-btn {
  border: 0; background: transparent; cursor: pointer;
  font-family: var(--font-body, sans-serif);
  font-size: 13px; font-weight: 700;
  color: var(--brand-primary, #2d4da6);
  padding: 8px 14px;
  border-radius: var(--radius-sm, 8px);
  &:hover { background: rgba(45,77,166,.08); }
}

// ── Skeleton ──
.skeleton-row {
  height: 68px;
  border-radius: var(--radius-lg, 16px);
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: sk 1.5s infinite;
}

@keyframes sk {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ── Jar detail sheet ──
.jar-detail-sheet {
  background: var(--surface-1, #fff);
  border-radius: 22px 22px 0 0;
  min-width: min(520px, 100vw);
  display: flex;
  flex-direction: column;

  &__handle {
    width: 40px; height: 4px;
    background: var(--surface-3, #e2e8f0);
    border-radius: 999px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 22px 24px 16px;
  }

  &__icon {
    width: 56px; height: 56px; border-radius: 28px;
    display: flex; align-items: center; justify-content: center;
  }

  &__name {
    font-family: var(--font-display, sans-serif);
    font-size: 18px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
  }

  &__balance {
    font-family: var(--font-money, monospace);
    font-size: 30px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
  }

  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--border-hairline, #e2e8f0);
    border-top: 1px solid var(--border-hairline);
    border-bottom: 1px solid var(--border-hairline);
  }

  &__progress-wrap {
    height: 6px;
    background: var(--surface-2, #f1f4f6);
    margin: 0 20px 8px;
    border-radius: 3px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 500ms ease-out;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px 20px;
  }
}

.jar-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  background: var(--surface-1, #fff);

  &__label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-3, #94a3b8);
  }

  &__value {
    font-family: var(--font-money, monospace);
    font-size: 16px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
    font-variant-numeric: tabular-nums;
  }
}

.jd-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px; font-weight: 700; cursor: pointer;
  padding: 10px 18px; transition: opacity 140ms;

  &--primary {
    background: var(--brand-primary, #2d4da6); color: #fff;
    box-shadow: 0 3px 10px rgba(45,77,166,.28);
    &:hover:not(:disabled) { opacity: .9; }
    &:disabled { opacity: .5; cursor: not-allowed; }
  }
  &--ghost {
    background: var(--surface-2, #f1f4f6); color: var(--fg-2);
    &:hover { background: var(--surface-3); }
  }
}

// ── Add form ──
.jf-field { display: flex; flex-direction: column; gap: 5px; }
.jf-label { font-size: 11.5px; font-weight: 600; color: var(--fg-2, #64748b); }
.jf-input {
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: 8px; padding: 10px 13px;
  font-family: var(--font-body, sans-serif); font-size: 14px;
  color: var(--fg-1, #0f172a); background: var(--surface-2, #f8fafc);
  outline: none; box-sizing: border-box; width: 100%;
  &:focus { border-color: var(--brand-primary); }
  &::placeholder { color: var(--fg-3); }
}
.jf-colors {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.jf-color-btn {
  width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent;
  cursor: pointer; transition: transform 120ms;
  &--active { border-color: var(--fg-1); transform: scale(1.2); }
  &:hover { transform: scale(1.15); }
}

// ── Mobile ──
@media (max-width: 768px) {
  .lite-page__container {
    padding: 16px 16px 120px;
    gap: 18px;
  }
}
</style>
