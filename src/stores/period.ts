import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// Tipos de periodo soportados
export type PeriodType =
	| 'all'
	| 'year'
	| 'semester'
	| 'quarter'
	| 'month'
	| 'fortnight'
	| 'week'
	| 'day'
	| 'custom';

interface PeriodStateSnapshot {
	type: PeriodType;
	anchor: string; // ISO date (YYYY-MM-DD) base para cálculo
	customFrom: string | null;
	customTo: string | null;
}

function formatDate(d: Date): string {
	return d.toISOString().slice(0, 10);
}

function startOfWeekISO(d: Date): Date {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const day = date.getUTCDay();
	const diff = (day === 0 ? -6 : 1) - day; // Monday=1
	date.setUTCDate(date.getUTCDate() + diff);
	return date;
}

export const usePeriodStore = defineStore('period', () => {
	const now = new Date();
	const state = ref<PeriodStateSnapshot>({
		type: 'month',
		anchor: formatDate(now),
		customFrom: null,
		customTo: null,
	});

	function setType(t: PeriodType) {
		state.value.type = t;
		if (t !== 'custom') {
			state.value.customFrom = null;
			state.value.customTo = null;
		}
	}

	function setCustomRange(from: string, to: string) {
		state.value.type = 'custom';
		state.value.customFrom = from;
		state.value.customTo = to;
	}

	function shift(delta: number) {
		const anchorDate = new Date(state.value.anchor + 'T00:00:00');
		switch (state.value.type) {
			case 'year':
				anchorDate.setFullYear(anchorDate.getFullYear() + delta);
				break;
			case 'semester':
				anchorDate.setMonth(anchorDate.getMonth() + 6 * delta);
				break;
			case 'quarter':
				anchorDate.setMonth(anchorDate.getMonth() + 3 * delta);
				break;
			case 'month':
			case 'fortnight':
				anchorDate.setMonth(anchorDate.getMonth() + delta);
				break;
			case 'week': {
				anchorDate.setDate(anchorDate.getDate() + 7 * delta);
				break;
			}
			case 'day':
				anchorDate.setDate(anchorDate.getDate() + delta);
				break;
			case 'all':
			case 'custom':
			default:
				break;
		}
		state.value.anchor = formatDate(anchorDate);
	}

	const parts = computed(() => {
		const anchorDate = new Date(state.value.anchor + 'T00:00:00');
		const year = anchorDate.getFullYear();
		const month = anchorDate.getMonth() + 1; // 1-12
		const day = anchorDate.getDate();
		const quarter = Math.floor((month - 1) / 3) + 1;
		const semester = month <= 6 ? 1 : 2;
		const fortnight = day <= 15 ? 1 : 2;
		const monday = startOfWeekISO(anchorDate);
		const weekYearStart = new Date(Date.UTC(anchorDate.getFullYear(), 0, 1));
		const daysBetween = Math.floor(
			(monday.getTime() - startOfWeekISO(weekYearStart).getTime()) / 86400000
		);
		const week = Math.floor(daysBetween / 7) + 1;
		return { year, month, quarter, semester, fortnight, week };
	});

	const label = computed(() => {
		const p = parts.value;
		switch (state.value.type) {
			case 'all':
				return 'Todo';
			case 'year':
				return `Año ${p.year}`;
			case 'semester':
				return `Semestre ${p.semester} ${p.year}`;
			case 'quarter':
				return `Trimestre ${p.quarter} ${p.year}`;
			case 'month': {
				const date = new Date(state.value.anchor + 'T00:00:00');
				return date.toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
				});
			}
			case 'fortnight':
				return `Quincena ${parts.value.fortnight} ${p.month}/${p.year}`;
			case 'week':
				return `Semana ${p.week} ${p.year}`;
			case 'day':
				return state.value.anchor;
			case 'custom':
				return `${state.value.customFrom || '?'} → ${state.value.customTo || '?'}`;
			default:
				return '';
		}
	});

	// Parámetros GET para backend
	const queryParams = computed(() => {
		const p: Record<string, string | number> = {};
		const prt = state.value.type;
		if (prt === 'all') return p; // sin restricciones
		if (prt === 'custom') {
			if (state.value.customFrom && state.value.customTo) {
				p.date_from = state.value.customFrom + ' 00:00:00';
				p.date_to = state.value.customTo + ' 23:59:59';
			}
			return p;
		}
		p.period_type = prt;
		const ps = parts.value;
		switch (prt) {
			case 'year':
				p.year = ps.year;
				break;
			case 'semester':
				p.semester = ps.semester;
				p.year = ps.year;
				break;
			case 'quarter':
				p.quarter = ps.quarter;
				p.year = ps.year;
				break;
			case 'month':
				p.month = ps.month;
				p.year = ps.year;
				break;
			case 'fortnight':
				p.fortnight = ps.fortnight;
				p.month = ps.month;
				p.year = ps.year;
				break;
			case 'week':
				p.week = ps.week;
				p.year = ps.year;
				break;
			case 'day':
				p.date_from = state.value.anchor + ' 00:00:00';
				p.date_to = state.value.anchor + ' 23:59:59';
				break;
			default:
				break;
		}
		return p;
	});

	const signature = computed(
		() => `${state.value.type}|${state.value.anchor}|${state.value.customFrom}|${state.value.customTo}`
	);

	return {
		state,
		setType,
		setCustomRange,
		shift,
		label,
		queryParams,
		signature,
	};
});

export type PeriodStore = ReturnType<typeof usePeriodStore>;
