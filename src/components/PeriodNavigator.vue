<template>
  <div class="pnav" :class="{ 'pnav--compact': compact }">

    <!-- Grain selector -->
    <div class="pnav__grain" ref="grainEl">
      <button class="pnav__pill pnav__grain-btn" @click.stop="toggleGrain">
        <q-icon :name="grainMeta.icon" size="18px" class="pnav__accent-icon" />
        <span>{{ grainMeta.name }}</span>
        <q-icon :name="grainOpen ? 'expand_less' : 'expand_more'" size="18px" class="pnav__muted-icon" />
      </button>
      <div v-if="grainOpen" class="pnav__menu pnav__grain-menu">
        <div v-for="grp in GROUPS" :key="grp">
          <div class="pnav__group-label">{{ grp }}</div>
          <button
            v-for="g in grainsByGroup(grp)"
            :key="g.id"
            class="pnav__menu-item"
            :class="{ 'pnav__menu-item--active': g.id === period.state.type }"
            @click.stop="selectGrain(g.id as PeriodType)"
          >
            <q-icon :name="g.icon" size="18px" />
            <span class="pnav__menu-item-label">{{ g.name }}</span>
            <q-icon v-if="g.id === period.state.type" name="check" size="17px" class="pnav__check-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Prev -->
    <button class="pnav__step" :disabled="!canStep" @click="period.shift(-1)">
      <q-icon name="chevron_left" size="20px" />
    </button>

    <!-- Label pill / picker -->
    <div class="pnav__picker-wrap" ref="pickEl">
      <button
        class="pnav__pill pnav__label-pill"
        :style="{ cursor: canStep ? 'pointer' : 'default' }"
        @click.stop="canStep && (pickOpen = !pickOpen)"
      >
        <q-icon :name="grainMeta.icon" size="19px" class="pnav__accent-icon" />
        <span class="pnav__label-text">{{ period.label }}</span>
        <q-icon v-if="canStep" :name="pickOpen ? 'expand_less' : 'expand_more'" size="19px" class="pnav__muted-icon" />
      </button>

      <div v-if="pickOpen && canStep" class="pnav__menu pnav__picker-menu">
        <!-- Month / Fortnight: grid de meses -->
        <template v-if="period.state.type === 'month' || period.state.type === 'fortnight'">
          <div class="pnav__picker-year-nav">
            <button @click.stop="pickerYear -= 1"><q-icon name="chevron_left" size="18px" /></button>
            <span class="pnav__picker-year-label">{{ pickerYear }}</span>
            <button @click.stop="pickerYear += 1"><q-icon name="chevron_right" size="18px" /></button>
          </div>
          <div class="pnav__month-grid">
            <button
              v-for="(mn, i) in MONTH_ABBR"
              :key="i"
              class="pnav__month-cell"
              :class="{ 'pnav__month-cell--active': isMonthActive(i) }"
              @click.stop="pickMonth(i)"
            >{{ mn }}</button>
          </div>
        </template>

        <!-- Quarter -->
        <template v-else-if="period.state.type === 'quarter'">
          <div class="pnav__picker-year-nav">
            <button @click.stop="pickerYear -= 1"><q-icon name="chevron_left" size="18px" /></button>
            <span class="pnav__picker-year-label">{{ pickerYear }}</span>
            <button @click.stop="pickerYear += 1"><q-icon name="chevron_right" size="18px" /></button>
          </div>
          <div class="pnav__quarter-grid">
            <button
              v-for="q in [1,2,3,4]"
              :key="q"
              class="pnav__quarter-cell"
              :class="{ 'pnav__month-cell--active': isQuarterActive(q) }"
              @click.stop="pickQuarter(q)"
            >
              <span class="pnav__q-label">T{{ q }}</span>
              <span class="pnav__q-sub">{{ QUARTER_RANGES[q - 1] }}</span>
            </button>
          </div>
        </template>

        <!-- Semester -->
        <template v-else-if="period.state.type === 'semester'">
          <div class="pnav__picker-year-nav">
            <button @click.stop="pickerYear -= 1"><q-icon name="chevron_left" size="18px" /></button>
            <span class="pnav__picker-year-label">{{ pickerYear }}</span>
            <button @click.stop="pickerYear += 1"><q-icon name="chevron_right" size="18px" /></button>
          </div>
          <div class="pnav__quarter-grid">
            <button
              v-for="s in [1,2]"
              :key="s"
              class="pnav__quarter-cell"
              :class="{ 'pnav__month-cell--active': isSemesterActive(s) }"
              @click.stop="pickSemester(s)"
            >
              <span class="pnav__q-label">S{{ s }}</span>
              <span class="pnav__q-sub">{{ s === 1 ? 'Ene–Jun' : 'Jul–Dic' }}</span>
            </button>
          </div>
        </template>

        <!-- Year: grid de años -->
        <template v-else-if="period.state.type === 'year'">
          <div class="pnav__month-grid">
            <button
              v-for="yr in yearRange"
              :key="yr"
              class="pnav__month-cell"
              :class="{ 'pnav__month-cell--active': anchorYear === yr }"
              @click.stop="pickYear(yr)"
            >{{ yr }}</button>
          </div>
        </template>

        <!-- Day / Week: date input -->
        <template v-else>
          <div class="pnav__date-input-wrap">
            <input
              type="date"
              :value="period.state.anchor"
              class="pnav__date-input"
              @change="(e: Event) => pickDate((e.target as HTMLInputElement).value)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Next -->
    <button class="pnav__step" :disabled="!canStep" @click="period.shift(1)">
      <q-icon name="chevron_right" size="20px" />
    </button>

    <!-- Hoy -->
    <button v-if="!isToday && canStep" class="pnav__today" @click="goToday">
      <q-icon name="today" size="17px" />
      <span>Hoy</span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { usePeriodStore, type PeriodType } from 'stores/period';

defineProps<{ compact?: boolean }>();

const period = usePeriodStore();
const grainEl = ref<HTMLElement | null>(null);
const pickEl  = ref<HTMLElement | null>(null);
const grainOpen = ref(false);
const pickOpen  = ref(false);
const pickerYear = ref(new Date().getFullYear());

const MONTH_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const QUARTER_RANGES = ['Ene–Mar','Abr–Jun','Jul–Sep','Oct–Dic'];
const GROUPS = ['Cortos','Estándar','Largos','Especiales'] as const;

const GRAINS = [
  { id: 'day',       name: 'Día',        icon: 'today',               group: 'Cortos' },
  { id: 'week',      name: 'Semana',     icon: 'date_range',          group: 'Cortos' },
  { id: 'fortnight', name: 'Quincena',   icon: 'splitscreen',         group: 'Cortos' },
  { id: 'month',     name: 'Mes',        icon: 'calendar_view_month', group: 'Estándar' },
  { id: 'quarter',   name: 'Trimestre',  icon: 'event_note',          group: 'Estándar' },
  { id: 'semester',  name: 'Semestre',   icon: 'calendar_month',      group: 'Estándar' },
  { id: 'year',      name: 'Año',        icon: 'calendar_today',      group: 'Largos' },
  { id: 'all',       name: 'Todo',       icon: 'all_inclusive',       group: 'Especiales' },
];

const grainMeta = computed(() => GRAINS.find(g => g.id === period.state.type) ?? GRAINS[3]!);
const canStep   = computed(() => period.state.type !== 'all' && period.state.type !== 'custom');

const anchorDate = computed(() => new Date(period.state.anchor + 'T00:00:00'));
const anchorYear = computed(() => anchorDate.value.getFullYear());
const anchorMonth = computed(() => anchorDate.value.getMonth()); // 0-based

const now = new Date();
const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

const isToday = computed(() => {
  const t = period.state.type;
  if (t === 'month') return anchorDate.value.getMonth() === now.getMonth() && anchorDate.value.getFullYear() === now.getFullYear();
  if (t === 'year')  return anchorDate.value.getFullYear() === now.getFullYear();
  if (t === 'quarter') return Math.ceil((anchorDate.value.getMonth()+1)/3) === Math.ceil((now.getMonth()+1)/3) && anchorDate.value.getFullYear() === now.getFullYear();
  if (t === 'semester') return (anchorDate.value.getMonth() < 6 ? 1 : 2) === (now.getMonth() < 6 ? 1 : 2) && anchorDate.value.getFullYear() === now.getFullYear();
  return period.state.anchor === todayStr;
});

const yearRange = computed(() => {
  const base = anchorYear.value - 4;
  return Array.from({ length: 9 }, (_, i) => base + i);
});

function grainsByGroup(grp: string) {
  return GRAINS.filter(g => g.group === grp);
}

function toggleGrain() { grainOpen.value = !grainOpen.value; pickOpen.value = false; }

function selectGrain(id: PeriodType) {
  period.setType(id);
  grainOpen.value = false;
  // sync pickerYear to anchor
  pickerYear.value = anchorDate.value.getFullYear();
}

// Picker helpers
function isMonthActive(mo: number) {
  return pickerYear.value === anchorYear.value && mo === anchorMonth.value;
}
function isQuarterActive(q: number) {
  return pickerYear.value === anchorYear.value && Math.ceil((anchorMonth.value+1)/3) === q;
}
function isSemesterActive(s: number) {
  return pickerYear.value === anchorYear.value && (anchorMonth.value < 6 ? 1 : 2) === s;
}

function pickMonth(mo: number) {
  period.setAnchor(`${pickerYear.value}-${String(mo+1).padStart(2,'0')}-01`);
  pickOpen.value = false;
}
function pickQuarter(q: number) {
  const mo = (q - 1) * 3;
  period.setAnchor(`${pickerYear.value}-${String(mo+1).padStart(2,'0')}-01`);
  pickOpen.value = false;
}
function pickSemester(s: number) {
  const mo = s === 1 ? 0 : 6;
  period.setAnchor(`${pickerYear.value}-${String(mo+1).padStart(2,'0')}-01`);
  pickOpen.value = false;
}
function pickYear(yr: number) {
  period.setAnchor(`${yr}-01-01`);
  pickOpen.value = false;
}
function pickDate(iso: string) {
  if (iso) { period.setAnchor(iso); pickOpen.value = false; }
}

function goToday() {
  period.setAnchor(todayStr);
}

// Click-outside to close dropdowns
function onDocClick(e: MouseEvent) {
  if (grainEl.value && !grainEl.value.contains(e.target as Node)) grainOpen.value = false;
  if (pickEl.value  && !pickEl.value.contains(e.target as Node))  pickOpen.value  = false;
}
onMounted(() => {
  document.addEventListener('click', onDocClick);
  pickerYear.value = anchorDate.value.getFullYear();
});
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<style scoped lang="scss">
.pnav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 22px;

  &--compact { margin-bottom: 16px; }
}

/* Shared pill style */
.pnav__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  cursor: pointer;
  color: var(--fg-1);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13.5px;
  transition: background 150ms, border-color 150ms;
  white-space: nowrap;

  &:hover { background: var(--surface-2); }
}

.pnav__label-pill {
  min-width: 180px;
  justify-content: center;
  box-shadow: var(--shadow-card);
}

.pnav__label-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.01em;
  flex: 1;
  text-align: center;
}

.pnav__accent-icon { color: var(--brand-primary); }
.pnav__muted-icon  { color: var(--fg-3); }

/* Step buttons */
.pnav__step {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-pill);
  background: var(--surface-1);
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--fg-1);
  transition: background 150ms, border-color 150ms;

  &:hover:not(:disabled) { background: var(--surface-2); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

/* Today button */
.pnav__today {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 2px;
  padding: 8px 14px;
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1));
  color: var(--brand-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  transition: background 150ms;

  &:hover { background: color-mix(in srgb, var(--brand-primary) 20%, var(--surface-1)); }
}

/* Dropdown menus */
.pnav__menu {
  position: absolute;
  z-index: 80;
  background: var(--surface-1);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-lg);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.22);
  padding: 6px;
  margin-top: 8px;
}

.pnav__grain { position: relative; }
.pnav__grain-menu { width: 230px; }

.pnav__picker-wrap { position: relative; }
.pnav__picker-menu {
  width: 280px;
  padding: 14px;
  left: 50%;
  transform: translateX(-50%);
}

/* Grain menu */
.pnav__group-label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  padding: 8px 10px 4px;
}

.pnav__menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: 0;
  cursor: pointer;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--fg-2);
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 500;
  transition: background 120ms, color 120ms;

  &:hover:not(.pnav__menu-item--active) { background: var(--surface-2); color: var(--fg-1); }

  &--active {
    background: color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1));
    color: var(--brand-primary);
    font-weight: 700;
  }
}

.pnav__menu-item-label { flex: 1; }
.pnav__check-icon { color: var(--brand-primary); margin-left: auto; }

/* Picker grids */
.pnav__picker-year-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  button {
    width: 30px;
    height: 30px;
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-pill);
    background: var(--surface-1);
    cursor: pointer;
    display: grid;
    place-items: center;
    color: var(--fg-1);
  }
}

.pnav__picker-year-label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: var(--fg-1);
}

.pnav__month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.pnav__quarter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.pnav__month-cell {
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-md);
  padding: 10px 0;
  background: transparent;
  color: var(--fg-1);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  transition: background 120ms;

  &:hover { background: var(--surface-2); }

  &--active {
    background: var(--brand-primary);
    color: #fff;
    font-weight: 700;
  }
}

.pnav__quarter-cell {
  border: 0;
  cursor: pointer;
  border-radius: var(--radius-md);
  padding: 14px 4px;
  background: transparent;
  color: var(--fg-1);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background 120ms;

  &:hover { background: var(--surface-2); }

  &.pnav__month-cell--active {
    background: var(--brand-primary);
    color: #fff;
    font-weight: 700;
  }
}

.pnav__q-label { font-weight: 700; }
.pnav__q-sub   { font-size: 10.5px; opacity: 0.7; }

/* Date input */
.pnav__date-input-wrap { padding: 8px; }
.pnav__date-input {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-body);
  font-size: 13px;
  padding: 7px 10px;
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  background: var(--surface-2);
  color: var(--fg-1);
  outline: none;
}
</style>
