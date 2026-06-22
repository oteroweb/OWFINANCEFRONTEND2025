<template>
  <q-page :class="expenseAnalysisPageClasses">
    <div class="analysis-shell">
      <!-- Pro heading (spec ProAnalisisRoute: "Navegador financiero") -->
      <div v-if="!isLiteLayout" style="padding: 4px 0 18px;">
        <span class="t-eyebrow" style="color: var(--info, #3b82f6);">Analítica de gastos</span>
        <h1 class="t-h1" style="margin: 6px 0 0;">Navegador financiero</h1>
      </div>

      <section class="hero-card">
        <div class="hero-copy">
          <div class="row items-center q-col-gutter-sm q-mb-sm">
            <div class="col-auto">
              <div class="text-overline text-primary">{{ heroEyebrow }}</div>
            </div>
            <div class="col-auto">
              <q-chip dense color="blue-1" text-color="primary" class="text-weight-medium">
                {{ activeLayoutModeOption.label }}
              </q-chip>
            </div>
          </div>

          <!-- Lite mode: big expense hero (redesign pattern) -->
          <template v-if="isLiteLayout">
            <div class="analysis-lead">Tienes <b>{{ filteredRows.length }} movimientos</b>. Gastaste</div>
            <div class="analysis-big">
              <span class="analysis-big__unit">{{ baseCurrencyCode }}</span>
              {{ ui.hideValues ? '••••••' : formatMoney(summary.gastosBase) }}
            </div>
            <div class="row items-center q-gutter-sm">
              <span
                v-if="summary.ingresosBase > 0"
                class="analysis-delta analysis-delta--income"
              >
                <q-icon name="savings" size="15px" />
                Ingresos · {{ ui.hideValues ? '••' : formatMoney(summary.ingresosBase) }}
              </span>
              <span v-if="summary.balanceBase >= 0" class="analysis-delta analysis-delta--ok">
                <q-icon name="trending_up" size="15px" />
                Balance positivo
              </span>
              <span v-else class="analysis-delta analysis-delta--warn">
                <q-icon name="trending_down" size="15px" />
                Balance negativo
              </span>
            </div>
          </template>

          <!-- Pro mode: narrative text (spec ProAnalisisRoute) -->
          <template v-else>
            <div class="analysis-lead" style="font-size:15px;line-height:1.6;color:var(--fg-1)">
              En <b>{{ periodStore.label }}</b> registraste
              <b>{{ filteredRows.length }} movimiento{{ filteredRows.length !== 1 ? 's' : '' }}</b>.
              Gastaste
              <b style="color:var(--expense-fg,#ef4444)">{{ ui.hideValues ? '••••' : formatMoney(summary.gastosBase) }}</b>
              <template v-if="summary.ingresosBase > 0">
                e ingresaste <b style="color:var(--income-fg,#16a34a)">{{ ui.hideValues ? '••••' : formatMoney(summary.ingresosBase) }}</b>.
              </template>
            </div>
          </template>
        </div>
        <div class="hero-actions">
          <q-btn color="primary" icon="add" label="Nueva transaccion" @click="ui.openNewTransactionDialog()" />
          <q-btn flat color="primary" icon="refresh" label="Recargar" :loading="loading" @click="loadData" />
        </div>
      </section>

      <!-- Donut de distribución por cántaro — Lite mode (spec: AnDonutLegend) -->
      <section v-if="isLiteLayout && donutSegments.length" class="an-donut-card">
        <div class="t-h3" style="margin-bottom: 3px;">¿En qué se fue?</div>
        <div style="color: var(--fg-2); font-size: 12.5px; margin-bottom: 18px;">Tu gasto del mes, por cántaro.</div>
        <div class="an-donut-body">
          <div class="an-donut" :style="{ background: donutGradient }" />
          <div class="an-donut-legend">
            <div v-for="s in donutSegments" :key="s.name" class="an-donut-legend__row">
              <span class="an-donut-legend__dot" :style="{ background: s.color }" />
              <span class="an-donut-legend__name">{{ s.name }}</span>
              <span class="an-donut-legend__pct">{{ s.pct }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Jar strip (spec: AnJarStrip) — horizontal scroll de gasto por cántaro -->
      <section v-if="chartRows.length" class="jar-strip">
        <div
          v-for="jar in jarStripRows"
          :key="jar.id"
          class="jar-strip__card"
          :class="{ 'jar-strip__card--active': selectedJarId === jar.id }"
          @click="selectedJarId = selectedJarId === jar.id ? null : jar.id"
        >
          <div class="jar-strip__name-row">
            <span class="jar-strip__dot" :style="{ background: jar.color }" />
            <span class="jar-strip__name">{{ jar.name }}</span>
          </div>
          <div class="jar-strip__amount">-{{ formatMoney(jar.spent) }}</div>
          <div class="jar-strip__bar">
            <div class="jar-strip__bar-fill" :style="{ width: `${jar.pct}%`, background: jar.color }" />
          </div>
        </div>
      </section>

      <section class="metric-grid">
        <q-card v-for="item in metricCards" :key="item.key" flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">{{ item.label }}</div>
            <div class="metric-value" :class="item.toneClass">
              {{ item.value }}
            </div>
            <div class="metric-hint">{{ item.caption }}</div>
          </q-card-section>
        </q-card>
      </section>

      <!-- ─── Pro 3-col layout (spec ProAnalisisRoute) ────────────────── -->
      <template v-if="!isLiteLayout">
        <div class="pro-nav-grid">

          <!-- Left rail: Vista / filtros (280px sticky) -->
          <aside class="pro-nav-grid__rail">
            <div class="pro-card" style="padding: 18px;">
              <div class="t-h3" style="margin-bottom: 2px;">Vista</div>
              <p class="pro-card__desc">Agrupa y filtra como prefieras.</p>

              <div class="pro-field">
                <label class="pro-field__label">Agrupación principal</label>
                <q-select v-model="groupMode" :options="groupModeOptions" emit-value map-options outlined dense />
              </div>

              <div class="pro-field">
                <label class="pro-field__label">Buscar</label>
                <q-input v-model="search" outlined dense clearable placeholder="Concepto, categoría o cuenta">
                  <template #append><q-icon name="search" /></template>
                </q-input>
              </div>

              <div class="pro-field">
                <label class="pro-field__label">Filtrar por cántaro</label>
                <q-select v-model="selectedJarId" :options="jarOptions" emit-value map-options outlined dense clearable />
              </div>

              <div class="pro-field">
                <label class="pro-field__label">Filtrar por categoría</label>
                <q-select v-model="selectedCategory" :options="categoryOptions" emit-value map-options outlined dense clearable />
              </div>

              <div class="pro-field">
                <label class="pro-field__label">Filtrar por cuenta</label>
                <q-select v-model="selectedAccount" :options="accountOptions" emit-value map-options outlined dense clearable />
              </div>

              <div class="pro-field">
                <label class="pro-field__label">Filtrar por tipo</label>
                <q-select v-model="selectedType" :options="typeOptions" emit-value map-options outlined dense clearable />
              </div>

              <div class="pro-card__divider" />
              <button class="pro-clear-btn" @click="clearFilters">
                <q-icon name="filter_alt_off" size="16px" style="color: var(--info, #3b82f6)" />
                Limpiar filtros
              </button>
            </div>
          </aside>

          <!-- Center: Donut + Top list -->
          <div class="pro-nav-grid__center">
            <!-- Donut -->
            <div v-if="donutSegments.length" class="pro-card">
              <div class="pro-card__head">
                <span class="t-h3">Distribución por cántaro</span>
                <span class="pro-card__hint">Gastos · {{ periodStore.label }}</span>
              </div>
              <p class="pro-card__desc">Pasa por la leyenda para enfocar un cántaro.</p>
              <div class="an-donut-body">
                <div class="an-donut" :style="{ background: donutGradient }" />
                <div class="an-donut-legend">
                  <div
                    v-for="s in donutSegments"
                    :key="s.name"
                    class="an-donut-legend__row"
                    style="cursor: pointer"
                    @click="selectedJarId = selectedJarId === (chartRows.find(r => r.name === s.name)?.id ?? null) ? null : (chartRows.find(r => r.name === s.name)?.id ?? null)"
                  >
                    <span class="an-donut-legend__dot" :style="{ background: s.color }" />
                    <span class="an-donut-legend__name">{{ s.name }}</span>
                    <span class="an-donut-legend__pct">{{ s.pct }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top cántaros -->
            <div v-if="jarStripRows.length" class="pro-card">
              <div class="pro-card__head">
                <span class="t-h3">Top cántaros</span>
                <span class="pro-card__hint">Toca para filtrar</span>
              </div>
              <div class="top-list">
                <button
                  v-for="jar in jarStripRows.slice(0, 6)"
                  :key="jar.id"
                  class="top-list__row"
                  :class="{ 'top-list__row--active': selectedJarId === jar.id }"
                  @click="selectedJarId = selectedJarId === jar.id ? null : jar.id"
                >
                  <span class="top-list__dot" :style="{ background: jar.color }" />
                  <span class="top-list__name">{{ jar.name }}</span>
                  <div class="top-list__bar-wrap">
                    <div class="top-list__bar-fill" :style="{ width: jar.pct + '%', background: jar.color }" />
                  </div>
                  <span class="top-list__amount">-{{ ui.hideValues ? '••' : formatMoney(jar.spent) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Budget + Insight -->
          <div class="pro-nav-grid__right">
            <!-- Asignado vs gastado -->
            <div v-if="budgetRows.length" class="pro-card">
              <div class="pro-card__head"><span class="t-h3">Asignado vs gastado</span></div>
              <p class="pro-card__desc">Lo planificado contra lo consumido.</p>
              <div class="budget-list">
                <div v-for="b in budgetRows" :key="b.name" class="budget-row">
                  <div class="budget-row__top">
                    <span class="budget-row__dot" :style="{ background: b.color }" />
                    <span class="budget-row__name">{{ b.name }}</span>
                    <span class="budget-row__pct" :class="{ 'budget-row__pct--over': b.overspent }">{{ b.pct }}%</span>
                  </div>
                  <div class="budget-bar">
                    <div
                      class="budget-bar__fill"
                      :class="{ 'budget-bar__fill--over': b.overspent }"
                      :style="{ width: Math.min(b.pct, 100) + '%', background: b.overspent ? 'var(--expense-fg, #ef4444)' : b.color }"
                    />
                  </div>
                  <div class="budget-row__amounts">
                    <span>{{ ui.hideValues ? '••' : formatMoney(b.spent) }}</span>
                    <span style="color: var(--fg-3)">/ {{ ui.hideValues ? '••' : formatMoney(b.assigned) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Insight card -->
            <div v-if="insightJar" class="pro-insight">
              <q-icon name="warning" size="18px" style="color: var(--expense-fg, #ef4444); flex-shrink: 0; margin-top: 1px;" />
              <div>
                <b>{{ insightJar.name }}</b> superó su presupuesto:
                {{ ui.hideValues ? '••' : formatMoney(insightJar.spent) }} /
                {{ ui.hideValues ? '••' : formatMoney(insightJar.assigned) }}
                ({{ insightJar.pct }}%).
              </div>
            </div>
          </div>
        </div>

        <!-- Detalle agrupado (full width) -->
        <div class="pro-card" style="margin-top: 20px;">
          <div class="pro-card__head">
            <span class="t-h3">Detalle agrupado</span>
            <span class="pro-card__hint">Moneda base: {{ baseCurrencyCode }}</span>
          </div>
          <p class="pro-card__desc">Haz click en cualquier transacción para abrir la edición completa.</p>
          <div v-if="loading" class="q-py-xl flex flex-center">
            <q-spinner color="primary" size="40px" />
          </div>
          <div v-else-if="!groupedRows.length" class="empty-state">
            <q-icon name="insights" size="42px" color="grey-5" />
            <div class="text-subtitle1 q-mt-sm">No hay movimientos para mostrar</div>
            <div class="text-caption text-grey-7">Ajusta filtros o cambia el periodo actual.</div>
          </div>
          <div v-else class="group-stack" style="margin-top: 8px;">
            <q-expansion-item
              v-for="(group, groupIndex) in groupedRows"
              :key="group.key"
              :default-opened="shouldOpenGroup(groupIndex)"
              expand-separator
              class="group-card"
              header-class="group-card__header"
            >
              <template #header>
                <div class="group-head">
                  <div>
                    <div class="text-subtitle2 text-weight-bold">{{ group.label }}</div>
                    <div class="text-caption text-grey-6">{{ group.rows.length }} transacciones</div>
                  </div>
                  <div class="group-totals">
                    <div class="text-caption text-grey-7">Gastos {{ formatMoney(group.summary.gastosBase) }}</div>
                    <div class="text-caption text-grey-7">Ingresos {{ formatMoney(group.summary.ingresosBase) }}</div>
                    <div class="text-caption" :class="group.summary.balanceBase >= 0 ? 'text-positive' : 'text-negative'">
                      Balance {{ formatMoney(group.summary.balanceBase) }}
                    </div>
                  </div>
                </div>
              </template>
              <div v-if="group.children?.length" class="subgroup-stack">
                <q-expansion-item
                  v-for="(child, childIndex) in group.children"
                  :key="child.key"
                  dense
                  :default-opened="shouldOpenSubgroup(childIndex)"
                  expand-separator
                  class="subgroup-card"
                >
                  <template #header>
                    <div class="subgroup-head">
                      <div>
                        <div class="text-body2 text-weight-medium">{{ child.label }}</div>
                        <div class="text-caption text-grey-6">{{ child.rows.length }} transacciones</div>
                      </div>
                      <div class="text-caption text-grey-7">{{ formatMoney(child.summary.balanceBase) }}</div>
                    </div>
                  </template>
                  <div class="rows-list">
                    <button
                      v-for="row in child.rows"
                      :key="row.id"
                      type="button"
                      :class="txRowClasses"
                      @click="openTransaction(row.id)"
                    >
                      <div class="tx-main">
                        <div class="tx-title-row">
                          <span class="text-body2 text-weight-medium">{{ row.name }}</span>
                          <q-badge outline color="primary">{{ row.typeName }}</q-badge>
                        </div>
                        <div class="text-caption text-grey-7">
                          {{ row.dateLabel }} · {{ row.accountLabel }} · {{ row.categoryName || 'Sin categoria' }}
                        </div>
                      </div>
                      <div class="tx-amounts">
                        <div :class="row.amountBase >= 0 ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                          {{ formatMoney(row.amountBase) }}
                        </div>
                      </div>
                    </button>
                  </div>
                </q-expansion-item>
              </div>
              <div v-else class="rows-list rows-list--root">
                <button
                  v-for="row in group.rows"
                  :key="row.id"
                  type="button"
                  :class="txRowClasses"
                  @click="openTransaction(row.id)"
                >
                  <div class="tx-main">
                    <div class="tx-title-row">
                      <span class="text-body2 text-weight-medium">{{ row.name }}</span>
                      <q-badge outline color="primary">{{ row.typeName }}</q-badge>
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ row.dateLabel }} · {{ row.accountLabel }} · {{ row.categoryName || 'Sin categoria' }}
                    </div>
                  </div>
                  <div class="tx-amounts">
                    <div :class="row.amountBase >= 0 ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                      {{ formatMoney(row.amountBase) }}
                    </div>
                  </div>
                </button>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </template>

      <!-- ─── Lite 2-col layout (unchanged) ────────────────────────── -->
      <template v-else>
      <section :class="contentGridClasses">
        <aside :class="filtersPanelClasses">
          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center justify-between q-col-gutter-sm">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">{{ filtersPanelTitle }}</div>
                <div class="text-caption text-grey-7">{{ filtersPanelCopy }}</div>
              </div>
              <div class="col-auto text-caption text-grey-6">
                {{ groupModeHint }}
              </div>
            </q-card-section>
            <q-separator />

            <q-card-section v-if="showInlineFilters">
              <q-select
                v-model="groupMode"
                :options="groupModeOptions"
                emit-value
                map-options
                outlined
                dense
                label="Agrupacion principal"
                class="q-mb-sm"
              />
              <q-input
                v-model="search"
                outlined
                dense
                clearable
                label="Buscar concepto, categoria o cuenta"
                class="q-mb-sm"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-select
                v-model="selectedJarId"
                :options="jarOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por cantaro"
                class="q-mb-sm"
              />
              <q-select
                v-model="selectedCategory"
                :options="categoryOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por categoria"
                class="q-mb-sm"
              />
              <q-select
                v-model="selectedAccount"
                :options="accountOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por cuenta"
                class="q-mb-sm"
              />
              <q-select
                v-model="selectedType"
                :options="typeOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por tipo"
              />
            </q-card-section>

            <q-expansion-item
              v-else
              v-model="liteFiltersExpanded"
              dense
              dense-toggle
              expand-separator
              icon="tune"
              label="Controles y agrupacion"
              header-class="analysis-expansion-header"
            >
              <q-card-section>
                <q-select
                  v-model="groupMode"
                  :options="groupModeOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Agrupacion principal"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="search"
                  outlined
                  dense
                  clearable
                  label="Buscar concepto, categoria o cuenta"
                  class="q-mb-sm"
                >
                  <template #append>
                    <q-icon name="search" />
                  </template>
                </q-input>
                <q-select
                  v-model="selectedJarId"
                  :options="jarOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  label="Filtrar por cantaro"
                  class="q-mb-sm"
                />
                <q-select
                  v-model="selectedCategory"
                  :options="categoryOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  label="Filtrar por categoria"
                  class="q-mb-sm"
                />
                <q-select
                  v-model="selectedAccount"
                  :options="accountOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  label="Filtrar por cuenta"
                  class="q-mb-sm"
                />
                <q-select
                  v-model="selectedType"
                  :options="typeOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  label="Filtrar por tipo"
                />
              </q-card-section>
            </q-expansion-item>

            <q-separator />
            <q-card-section>
              <div class="row items-center justify-between q-col-gutter-sm q-mb-sm">
                <div class="col-auto">
                  <div class="text-subtitle2 text-weight-medium">Filtros activos</div>
                </div>
                <div class="col-auto text-caption text-grey-6">
                  {{ activeFilterCount }} activos
                </div>
              </div>
              <div v-if="activeFilterChips.length" class="chip-stack">
                <q-chip
                  v-for="chip in activeFilterChips"
                  :key="chip.key"
                  removable
                  color="blue-1"
                  text-color="primary"
                  @remove="removeFilter(chip.key)"
                >
                  {{ chip.label }}
                </q-chip>
              </div>
              <div v-else class="text-caption text-grey-6">Sin filtros adicionales.</div>
              <q-btn flat dense color="primary" icon="filter_alt_off" label="Limpiar" class="q-mt-sm" @click="clearFilters" />
            </q-card-section>
          </q-card>
        </aside>

        <div class="analysis-main">
          <ExpenseDistributionChart
            v-if="showInlineChart"
            :rows="chartRows"
            :currency-code="baseCurrencyCode"
            :hide-values="ui.hideValues"
            class="q-mb-md"
          />

          <q-card v-else flat bordered class="panel-card q-mb-md">
            <q-expansion-item
              v-model="liteChartExpanded"
              dense
              dense-toggle
              expand-separator
              icon="donut_large"
              label="Distribucion del periodo"
              header-class="analysis-expansion-header"
            >
              <q-card-section>
                <ExpenseDistributionChart
                  :rows="chartRows"
                  :currency-code="baseCurrencyCode"
                  :hide-values="ui.hideValues"
                />
              </q-card-section>
            </q-expansion-item>
          </q-card>

          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center q-col-gutter-md">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">{{ detailPanelTitle }}</div>
                <div class="text-caption text-grey-7">
                  {{ detailPanelCopy }}
                </div>
              </div>
              <div class="col-auto text-caption text-grey-7 text-right">
                <div>Moneda base: <strong>{{ baseCurrencyCode }}</strong></div>
                <div>{{ groupModeSummary }}</div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="loading" class="q-py-xl flex flex-center">
                <q-spinner color="primary" size="40px" />
              </div>
              <div v-else-if="!groupedRows.length" class="empty-state">
                <q-icon name="insights" size="42px" color="grey-5" />
                <div class="text-subtitle1 q-mt-sm">No hay movimientos para mostrar</div>
                <div class="text-caption text-grey-7">Ajusta filtros o cambia el periodo actual.</div>
              </div>
              <div v-else class="group-stack">
                <q-expansion-item
                  v-for="(group, groupIndex) in groupedRows"
                  :key="group.key"
                  :default-opened="shouldOpenGroup(groupIndex)"
                  expand-separator
                  class="group-card"
                  header-class="group-card__header"
                >
                  <template #header>
                    <div class="group-head">
                      <div>
                        <div class="text-subtitle2 text-weight-bold">{{ group.label }}</div>
                        <div class="text-caption text-grey-6">{{ group.rows.length }} transacciones</div>
                      </div>
                      <div class="group-totals">
                        <template v-if="!isLiteLayout">
                          <div class="text-caption text-grey-7">Gastos {{ formatMoney(group.summary.gastosBase) }}</div>
                          <div class="text-caption text-grey-7">Ingresos {{ formatMoney(group.summary.ingresosBase) }}</div>
                        </template>
                        <div class="text-caption" :class="group.summary.balanceBase >= 0 ? 'text-positive' : 'text-negative'">
                          Balance {{ formatMoney(group.summary.balanceBase) }}
                        </div>
                      </div>
                    </div>
                  </template>

                  <div v-if="group.children?.length" class="subgroup-stack">
                    <q-expansion-item
                      v-for="(child, childIndex) in group.children"
                      :key="child.key"
                      dense
                      :default-opened="shouldOpenSubgroup(childIndex)"
                      expand-separator
                      class="subgroup-card"
                    >
                      <template #header>
                        <div class="subgroup-head">
                          <div>
                            <div class="text-body2 text-weight-medium">{{ child.label }}</div>
                            <div class="text-caption text-grey-6">{{ child.rows.length }} transacciones</div>
                          </div>
                          <div class="text-caption text-grey-7">
                            {{ formatMoney(child.summary.balanceBase) }}
                          </div>
                        </div>
                      </template>
                      <div class="rows-list">
                        <button
                          v-for="row in child.rows"
                          :key="row.id"
                          type="button"
                          :class="txRowClasses"
                          @click="openTransaction(row.id)"
                        >
                          <div class="tx-main">
                            <div class="tx-title-row">
                              <span class="text-body2 text-weight-medium">{{ row.name }}</span>
                              <q-badge outline color="primary">{{ row.typeName }}</q-badge>
                            </div>
                            <div class="text-caption text-grey-7">
                              {{ row.dateLabel }} · {{ row.accountLabel }} · {{ row.categoryName || 'Sin categoria' }}
                            </div>
                            <div class="text-caption text-grey-6 q-mt-xs">
                              {{ row.originalLabel }}
                              <span v-if="row.rateLabel">({{ row.rateLabel }})</span>
                            </div>
                          </div>
                          <div class="tx-amounts">
                            <div :class="row.amountBase >= 0 ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                              {{ formatMoney(row.amountBase) }}
                            </div>
                            <div class="text-caption text-grey-7">{{ row.baseExplain }}</div>
                          </div>
                        </button>
                      </div>
                    </q-expansion-item>
                  </div>

                  <div v-else class="rows-list rows-list--root">
                    <button
                      v-for="row in group.rows"
                      :key="row.id"
                      type="button"
                      :class="txRowClasses"
                      @click="openTransaction(row.id)"
                    >
                      <div class="tx-main">
                        <div class="tx-title-row">
                          <span class="text-body2 text-weight-medium">{{ row.name }}</span>
                          <q-badge outline color="primary">{{ row.typeName }}</q-badge>
                        </div>
                        <div class="text-caption text-grey-7">
                          {{ row.dateLabel }} · {{ row.accountLabel }} · {{ row.categoryName || 'Sin categoria' }}
                        </div>
                        <div class="text-caption text-grey-6 q-mt-xs">
                          {{ row.originalLabel }}
                          <span v-if="row.rateLabel">({{ row.rateLabel }})</span>
                        </div>
                      </div>
                      <div class="tx-amounts">
                        <div :class="row.amountBase >= 0 ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                          {{ formatMoney(row.amountBase) }}
                        </div>
                        <div class="text-caption text-grey-7">{{ row.baseExplain }}</div>
                      </div>
                    </button>
                  </div>
                </q-expansion-item>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>
      </template><!-- end v-else Lite -->
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { api } from '../../../boot/axios';
import { ExpenseDistributionChart } from '../../../components';
import { useUserRates } from '../../../composables/useUserRates';
import { useAuthStore } from '../../../stores/auth';
import { useUiStore } from '../../../stores/ui';
import { computed, onMounted, ref, watch } from 'vue';
import { usePeriodStore } from '../../../stores/period';
import { useRoute } from 'vue-router';
import {
  layoutModeOptions,
  normalizeLayoutMode,
  type LayoutModeOption,
  type UserLayoutMode,
} from '../../../utils/layoutMode';

defineOptions({ name: 'user_expense_analysis_page' });

type JarRecord = {
  id: number;
  name: string;
  color: string;
  categories: Array<{ id: number; label: string }>;
};

type EnrichedTx = {
  id: number;
  name: string;
  amountUsd: number;
  amountBase: number;
  dateLabel: string;
  rawDate: string;
  typeName: string;
  categoryName: string;
  categoryId: number | null;
  jarId: number | null;
  jarName: string;
  jarColor: string;
  accountLabel: string;
  accountKey: string;
  originalLabel: string;
  rateLabel: string;
  baseExplain: string;
};

type Summary = {
  gastosBase: number;
  ingresosBase: number;
  balanceBase: number;
};

type GroupNode = {
  key: string;
  label: string;
  rows: EnrichedTx[];
  summary: Summary;
  children?: GroupNode[];
};

type GroupMode = 'jar' | 'category' | 'account' | 'type';

type MetricCard = {
  key: string;
  label: string;
  value: string;
  caption: string;
  toneClass: string;
};

const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();
const periodStore = usePeriodStore();
const { defaultCurrencyCode, currentRates, toRateLabel } = useUserRates();

const loading = ref(false);
const rows = ref<EnrichedTx[]>([]);
const jars = ref<JarRecord[]>([]);

const fallbackLayoutModeOption: LayoutModeOption = {
  label: 'Pro',
  value: 'pro',
  description: 'Balance general entre densidad, navegacion y visibilidad.',
};

const activeLayoutMode = computed<UserLayoutMode>(() => normalizeLayoutMode(auth.user?.layout_mode));
const activeLayoutModeOption = computed<LayoutModeOption>(
  () =>
    layoutModeOptions.find((option) => option.value === activeLayoutMode.value) ||
    fallbackLayoutModeOption
);
const isLegacyLayout = computed(() => activeLayoutMode.value === 'legacy');
const isLiteLayout = computed(() => activeLayoutMode.value === 'lite');
const expenseAnalysisPageClasses = computed(() => [
  'expense-analysis-page',
  'q-pa-md',
  `expense-analysis-page--${activeLayoutMode.value}`,
]);
const contentGridClasses = computed(() => [
  'content-grid',
  `content-grid--${activeLayoutMode.value}`,
]);
const filtersPanelClasses = computed(() => [
  'filters-panel',
  { 'filters-panel--lite': isLiteLayout.value },
]);
const txRowClasses = computed(() => [
  'tx-row',
  { 'tx-row--compact': isLiteLayout.value },
]);

const groupMode = ref<GroupMode>('jar');
const search = ref('');
const selectedJarId = ref<number | null>(null);
const selectedCategory = ref<string | null>(null);
const selectedAccount = ref<string | null>(null);
const selectedType = ref<string | null>(null);
const liteFiltersExpanded = ref(true);
const liteChartExpanded = ref(true);

const allGroupModeOptions: Array<{ label: string; value: GroupMode }> = [
  { label: 'Cantaro > Categoria > Transacciones', value: 'jar' },
  { label: 'Categoria > Transacciones', value: 'category' },
  { label: 'Cuenta > Transacciones', value: 'account' },
  { label: 'Tipo > Transacciones', value: 'type' },
];

const groupModeOptions = computed(() =>
  isLiteLayout.value
    ? allGroupModeOptions.filter((option) => option.value !== 'jar')
    : allGroupModeOptions
);

const baseCurrencyCode = computed(() => defaultCurrencyCode.value || 'USD');
const showInlineFilters = computed(() => !isLiteLayout.value);
const showInlineChart = computed(() => !isLiteLayout.value);

const heroEyebrow = computed(() => {
  if (isLegacyLayout.value) return 'Analitica expandida';
  if (isLiteLayout.value) return 'En qué se fue';
  return 'Analitica de gastos';
});


function getRatePerUsd(code: string): number {
  const normalized = (code || 'USD').toUpperCase();
  if (normalized === 'USD') return 1;
  const found = currentRates.value.find((rate) => rate.code.toUpperCase() === normalized);
  return found?.rate && found.rate > 0 ? found.rate : 1;
}

function convertUsdToBase(amountUsd: number): number {
  const code = baseCurrencyCode.value.toUpperCase();
  return code === 'USD' ? amountUsd : amountUsd * getRatePerUsd(code);
}

function formatMoney(amount: number): string {
  if (ui.hideValues) return '••••••';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: baseCurrencyCode.value,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${baseCurrencyCode.value}`;
  }
}

function formatRawDate(value: string): string {
  if (!value) return 'Sin fecha';
  const iso = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentList(rawTx: Record<string, unknown>): Array<Record<string, unknown>> {
  const raw = rawTx.payment_transactions;
  return Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
}

function extractPaymentRate(payment: Record<string, unknown>): number | null {
  const directRate = payment.rate;
  if (typeof directRate === 'number' && Number.isFinite(directRate) && directRate > 0) return directRate;
  if (directRate && typeof directRate === 'object') {
    const nested = Number((directRate as Record<string, unknown>).value ?? (directRate as Record<string, unknown>).current_rate ?? 0);
    if (Number.isFinite(nested) && nested > 0) return nested;
  }
  const rateValue = Number(payment.rate_value ?? 0);
  if (Number.isFinite(rateValue) && rateValue > 0) return rateValue;
  const userCurrency = payment.user_currency;
  if (userCurrency && typeof userCurrency === 'object') {
    const currentRate = Number((userCurrency as Record<string, unknown>).current_rate ?? 0);
    if (Number.isFinite(currentRate) && currentRate > 0) return currentRate;
  }
  return null;
}

function extractAccountName(payment: Record<string, unknown>): string {
  if (typeof payment.account_name === 'string' && payment.account_name.trim()) return payment.account_name.trim();
  const account = payment.account;
  if (account && typeof account === 'object') {
    const name = (account as Record<string, unknown>).name;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return 'Cuenta';
}

function buildOriginalLabel(rawTx: Record<string, unknown>): { label: string; rateLabel: string } {
  const payments = getPaymentList(rawTx);
  if (!payments.length) {
    const amount = Number(rawTx.amount ?? 0);
    return {
      label: `Base USD ${amount.toFixed(2)}`,
      rateLabel: '',
    };
  }

  const parts = payments.map((payment) => {
    const accountName = extractAccountName(payment);
    const amount = Number(payment.amount ?? 0);
    return `${accountName}: ${amount.toFixed(2)}`;
  });

  const rates = payments
    .map((payment) => extractPaymentRate(payment))
    .filter((value): value is number => typeof value === 'number' && value > 0);

  const rateLabel = rates.length
    ? rates.length === 1
      ? `tasa ${toRateLabel(rates[0] as number)}`
      : `tasas ${rates.map((rate) => toRateLabel(rate)).join(' / ')}`
    : '';

  return {
    label: parts.join(' · '),
    rateLabel,
  };
}

function buildCategoryToJarMap(): Map<number, JarRecord> {
  const map = new Map<number, JarRecord>();
  jars.value.forEach((jar) => {
    jar.categories.forEach((category) => {
      map.set(category.id, jar);
    });
  });
  return map;
}

function enrichTransaction(rawTx: Record<string, unknown>, categoryToJarMap: Map<number, JarRecord>): EnrichedTx {
  const id = Number(rawTx.id ?? 0);
  const name = typeof rawTx.name === 'string' && rawTx.name.trim() ? rawTx.name.trim() : 'Sin concepto';
  const amountUsd = Number(rawTx.amount ?? 0);
  const amountBase = convertUsdToBase(amountUsd);
  const typeName = typeof (rawTx.transaction_type as Record<string, unknown> | undefined)?.name === 'string'
    ? String((rawTx.transaction_type as Record<string, unknown>).name)
    : 'Sin tipo';
  const categoryIdRaw = rawTx.category_id;
  const categoryId = typeof categoryIdRaw === 'number' ? categoryIdRaw : Number.isFinite(Number(categoryIdRaw)) ? Number(categoryIdRaw) : null;
  const categoryName = typeof (rawTx.category as Record<string, unknown> | undefined)?.name === 'string'
    ? String((rawTx.category as Record<string, unknown>).name)
    : 'Sin categoria';
  const jar = categoryId != null ? categoryToJarMap.get(categoryId) ?? null : null;
  const payments = getPaymentList(rawTx);
  const accountNames = payments.map((payment) => extractAccountName(payment)).filter(Boolean);
  const accountLabel = accountNames.length ? Array.from(new Set(accountNames)).join(' · ') : 'Sin cuenta';
  const original = buildOriginalLabel(rawTx);

  const rawDateValue = typeof rawTx.date === 'string' ? rawTx.date : '';

  return {
    id,
    name,
    amountUsd,
    amountBase,
    dateLabel: formatRawDate(rawDateValue),
    rawDate: rawDateValue,
    typeName,
    categoryName,
    categoryId,
    jarId: jar?.id ?? null,
    jarName: jar?.name ?? 'Sin cantaro',
    jarColor: jar?.color ?? '#94a3b8',
    accountLabel,
    accountKey: accountLabel,
    originalLabel: original.label,
    rateLabel: original.rateLabel,
    baseExplain: `${baseCurrencyCode.value} desde USD`,
  };
}

function computeSummary(items: EnrichedTx[]): Summary {
  const gastosBase = items.filter((row) => row.amountBase < 0).reduce((sum, row) => sum + Math.abs(row.amountBase), 0);
  const ingresosBase = items.filter((row) => row.amountBase > 0).reduce((sum, row) => sum + row.amountBase, 0);
  return {
    gastosBase,
    ingresosBase,
    balanceBase: ingresosBase - gastosBase,
  };
}

function buildGroupNodes(items: EnrichedTx[]): GroupNode[] {
  const groupBy = new Map<string, EnrichedTx[]>();

  const push = (key: string, row: EnrichedTx) => {
    const current = groupBy.get(key) || [];
    current.push(row);
    groupBy.set(key, current);
  };

  items.forEach((row) => {
    if (groupMode.value === 'jar') push(row.jarName || 'Sin cantaro', row);
    if (groupMode.value === 'category') push(row.categoryName || 'Sin categoria', row);
    if (groupMode.value === 'account') push(row.accountKey || 'Sin cuenta', row);
    if (groupMode.value === 'type') push(row.typeName || 'Sin tipo', row);
  });

  return Array.from(groupBy.entries())
    .map(([label, groupRows]) => {
      const sortedRows = [...groupRows].sort((a, b) => String(b.rawDate).localeCompare(String(a.rawDate)));
      if (groupMode.value === 'jar') {
        const categoryGroups = new Map<string, EnrichedTx[]>();
        sortedRows.forEach((row) => {
          const key = row.categoryName || 'Sin categoria';
          const current = categoryGroups.get(key) || [];
          current.push(row);
          categoryGroups.set(key, current);
        });
        const children = Array.from(categoryGroups.entries()).map(([childLabel, childRows]) => ({
          key: `${label}-${childLabel}`,
          label: childLabel,
          rows: childRows,
          summary: computeSummary(childRows),
        }));
        return {
          key: label,
          label,
          rows: sortedRows,
          summary: computeSummary(sortedRows),
          children,
        };
      }
      return {
        key: label,
        label,
        rows: sortedRows,
        summary: computeSummary(sortedRows),
      };
    })
    .sort((a, b) => Math.abs(b.summary.gastosBase) - Math.abs(a.summary.gastosBase));
}

const jarOptions = computed(() => [{ label: 'Todos', value: null }, ...jars.value.map((jar) => ({ label: jar.name, value: jar.id }))]);
const categoryOptions = computed(() => [{ label: 'Todas', value: null }, ...Array.from(new Set(rows.value.map((row) => row.categoryName))).filter(Boolean).sort().map((label) => ({ label, value: label }))]);
const accountOptions = computed(() => [{ label: 'Todas', value: null }, ...Array.from(new Set(rows.value.map((row) => row.accountKey))).filter(Boolean).sort().map((label) => ({ label, value: label }))]);
const typeOptions = computed(() => [{ label: 'Todos', value: null }, ...Array.from(new Set(rows.value.map((row) => row.typeName))).filter(Boolean).sort().map((label) => ({ label, value: label }))]);

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase();
  return rows.value.filter((row) => {
    if (selectedJarId.value != null && row.jarId !== selectedJarId.value) return false;
    if (selectedCategory.value && row.categoryName !== selectedCategory.value) return false;
    if (selectedAccount.value && row.accountKey !== selectedAccount.value) return false;
    if (selectedType.value && row.typeName !== selectedType.value) return false;
    if (!needle) return true;
    const haystack = [row.name, row.categoryName, row.accountLabel, row.typeName, row.jarName].join(' ').toLowerCase();
    return haystack.includes(needle);
  });
});

const summary = computed(() => computeSummary(filteredRows.value));
const groupedRows = computed(() => buildGroupNodes(filteredRows.value));

const chartRows = computed(() => {
  const byJar = new Map<string, { id: number; name: string; color: string; assignedExpected: number; spent: number; balance: number }>();
  filteredRows.value.forEach((row) => {
    const key = row.jarName || 'Sin cantaro';
    const current = byJar.get(key) || {
      id: row.jarId || 0,
      name: row.jarName || 'Sin cantaro',
      color: row.jarColor || '#94a3b8',
      assignedExpected: 0,
      spent: 0,
      balance: 0,
    };
    if (row.amountBase < 0) current.spent += Math.abs(row.amountBase);
    if (row.amountBase > 0) current.balance += row.amountBase;
    current.assignedExpected = current.spent + current.balance;
    byJar.set(key, current);
  });
  return Array.from(byJar.values());
});

const jarStripRows = computed(() => {
  const rows = chartRows.value.filter(j => j.spent > 0).sort((a, b) => b.spent - a.spent);
  const max = rows[0]?.spent ?? 1;
  return rows.map(j => ({ ...j, pct: Math.round((j.spent / max) * 100) }));
});

const donutSegments = computed(() => {
  const rows = chartRows.value.filter(j => j.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, 8);
  const total = rows.reduce((s, r) => s + r.spent, 0);
  if (!total) return [];
  return rows.map(r => ({ name: r.name, color: r.color || '#94a3b8', pct: Math.round((r.spent / total) * 100) }));
});

const donutGradient = computed(() => {
  const segs = donutSegments.value;
  if (!segs.length) return 'var(--surface-3)';
  let cur = 0;
  const parts = segs.map(s => {
    const start = cur;
    cur += s.pct;
    return `${s.color} ${start}% ${cur}%`;
  });
  return `conic-gradient(${parts.join(', ')})`;
});

const budgetRows = computed(() => {
  return chartRows.value
    .filter(j => j.spent > 0 || j.assignedExpected > 0)
    .sort((a, b) => {
      const pctA = a.assignedExpected > 0 ? (a.spent / a.assignedExpected) * 100 : 0;
      const pctB = b.assignedExpected > 0 ? (b.spent / b.assignedExpected) * 100 : 0;
      return pctB - pctA;
    })
    .slice(0, 8)
    .map(j => ({
      name: j.name,
      color: j.color,
      assigned: j.assignedExpected,
      spent: j.spent,
      pct: j.assignedExpected > 0 ? Math.min(Math.round((j.spent / j.assignedExpected) * 100), 200) : 0,
      overspent: j.assignedExpected > 0 && j.spent > j.assignedExpected,
    }));
});

const insightJar = computed(() => budgetRows.value.find(b => b.overspent) ?? null);

const activeFilterChips = computed(() => {
  const chips: Array<{ key: string; label: string }> = [];
  if (search.value.trim()) chips.push({ key: 'search', label: `Buscar: ${search.value.trim()}` });
  if (selectedJarId.value != null) {
    const jar = jars.value.find((item) => item.id === selectedJarId.value);
    chips.push({ key: 'jar', label: `Cantaro: ${jar?.name || selectedJarId.value}` });
  }
  if (selectedCategory.value) chips.push({ key: 'category', label: `Categoria: ${selectedCategory.value}` });
  if (selectedAccount.value) chips.push({ key: 'account', label: `Cuenta: ${selectedAccount.value}` });
  if (selectedType.value) chips.push({ key: 'type', label: `Tipo: ${selectedType.value}` });
  return chips;
});

const activeFilterCount = computed(() => activeFilterChips.value.length);

const metricCards = computed<MetricCard[]>(() => {
  const visibleCard: MetricCard = {
    key: 'visible',
    label: 'Transacciones visibles',
    value: String(filteredRows.value.length),
    caption: `Periodo actual: ${periodStore.label}`,
    toneClass: '',
  };
  const balanceCard: MetricCard = {
    key: 'balance',
    label: 'Balance',
    value: formatMoney(summary.value.balanceBase),
    caption: 'Resultado neto del conjunto filtrado',
    toneClass: summary.value.balanceBase >= 0 ? 'text-positive' : 'text-negative',
  };

  if (isLiteLayout.value) {
    return [
      visibleCard,
      balanceCard,
      {
        key: 'filters',
        label: 'Filtros activos',
        value: String(activeFilterCount.value),
        caption: groupModeSummary.value,
        toneClass: '',
      },
    ];
  }

  return [
    visibleCard,
    {
      key: 'gastos',
      label: 'Gastos',
      value: formatMoney(summary.value.gastosBase),
      caption: `Convertido a ${baseCurrencyCode.value}`,
      toneClass: 'text-negative',
    },
    {
      key: 'ingresos',
      label: 'Ingresos',
      value: formatMoney(summary.value.ingresosBase),
      caption: `Convertido a ${baseCurrencyCode.value}`,
      toneClass: 'text-positive',
    },
    balanceCard,
  ];
});

const filtersPanelTitle = computed(() => {
  if (isLegacyLayout.value) return 'Workspace de filtros';
  if (isLiteLayout.value) return 'Controles compactos';
  return 'Vista';
});

const filtersPanelCopy = computed(() => {
  if (isLegacyLayout.value) return 'Agrupa y filtra sin perder el panel principal ni el chart del periodo.';
  if (isLiteLayout.value) return 'Abre solo los controles necesarios y vuelve rapido al listado.';
  return 'Agrupa y recorre el detalle como prefieras.';
});

const groupModeHint = computed(() => {
  if (isLegacyLayout.value) return 'Jerarquia amplia';
  if (isLiteLayout.value) return 'Menos niveles';
  return 'Modo balanceado';
});

const detailPanelTitle = computed(() => {
  if (isLegacyLayout.value) return 'Detalle expandido';
  if (isLiteLayout.value) return 'Detalle compacto';
  return 'Detalle agrupado';
});

const detailPanelCopy = computed(() => {
  if (isLegacyLayout.value) {
    return 'Abre cada grupo para revisar gastos, ingresos y balance por bloque antes de editar cualquier transaccion.';
  }
  if (isLiteLayout.value) {
    return 'La lista prioriza lectura rapida y un solo nivel principal de navegacion por bloque.';
  }
  return 'Haz click en cualquier transaccion para abrir la edicion completa.';
});

const groupModeSummary = computed(() => {
  const option = groupModeOptions.value.find((item) => item.value === groupMode.value);
  return option ? `Agrupando por ${option.label}` : 'Agrupacion activa';
});

watch(
  groupModeOptions,
  (options) => {
    if (!options.some((option) => option.value === groupMode.value)) {
      groupMode.value = options[0]?.value ?? 'category';
    }
  },
  { immediate: true }
);

function removeFilter(key: string): void {
  if (key === 'search') search.value = '';
  if (key === 'jar') selectedJarId.value = null;
  if (key === 'category') selectedCategory.value = null;
  if (key === 'account') selectedAccount.value = null;
  if (key === 'type') selectedType.value = null;
}

function clearFilters(): void {
  search.value = '';
  selectedJarId.value = null;
  selectedCategory.value = null;
  selectedAccount.value = null;
  selectedType.value = null;
}

function openTransaction(id: number): void {
  ui.openEditTransactionDialog(id);
}

function shouldOpenGroup(index: number): boolean {
  if (isLegacyLayout.value) return true;
  if (isLiteLayout.value) return index === 0;
  return index < 2;
}

function shouldOpenSubgroup(index: number): boolean {
  if (isLegacyLayout.value) return true;
  return index === 0;
}

async function loadJars(): Promise<void> {
  const response = await api.get('/jars', { params: { per_page: 100 } });
  const payload = response.data?.data;
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  jars.value = (list as Array<Record<string, unknown>>).map((jar) => ({
    id: Number(jar.id ?? 0),
    name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
    color: typeof jar.color === 'string' && jar.color ? jar.color : '#94a3b8',
    categories: Array.isArray(jar.categories)
      ? (jar.categories as Array<Record<string, unknown>>).map((category) => ({
          id: Number(category.id ?? 0),
          label: typeof category.label === 'string'
            ? category.label
            : typeof category.name === 'string'
            ? category.name
            : 'Categoria',
        }))
      : [],
  }));
}

async function loadTransactions(): Promise<void> {
  const params: Record<string, unknown> = {
    per_page: 250,
    sort_by: 'date',
    descending: true,
  };
  Object.entries(periodStore.queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params[key] = value;
  });
  const response = await api.get('/transactions', { params });
  const payload = response.data?.data;
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  const categoryToJarMap = buildCategoryToJarMap();
  rows.value = (list as Array<Record<string, unknown>>).map((tx) => enrichTransaction(tx, categoryToJarMap));
}

async function loadData(): Promise<void> {
  loading.value = true;
  try {
    await loadJars();
    await loadTransactions();
  } finally {
    loading.value = false;
  }
}

watch(
  () => periodStore.signature,
  () => {
    void loadData();
  }
);

watch(
  () => route.query.jar,
  (jarQuery) => {
    if (jarQuery == null || jarQuery === '') return;
    const jarId = Number(Array.isArray(jarQuery) ? jarQuery[0] : jarQuery);
    if (Number.isFinite(jarId)) selectedJarId.value = jarId;
  },
  { immediate: true }
);

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.expense-analysis-page {
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.06), transparent 24%),
    #f8fafc;
}

.analysis-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.panel-card,
.metric-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.analysis-lead {
  font-size: 15px;
  color: var(--fg-2);
  margin-bottom: 6px;
  b { color: var(--fg-1); }
}

.analysis-big {
  font-family: var(--font-money, 'DM Sans', system-ui, sans-serif);
  font-weight: 700;
  font-size: 52px;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-bottom: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--expense-fg, #ef4444);
}

.analysis-big__unit {
  color: var(--fg-3);
  font-size: 26px;
  margin-right: 4px;
}

.analysis-delta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.analysis-delta--income {
  background: var(--income-soft, #dcfce7);
  color: var(--income-fg, #15803d);
}

.analysis-delta--ok {
  background: var(--income-soft, #dcfce7);
  color: var(--income-fg, #15803d);
}

.analysis-delta--warn {
  background: var(--expense-soft, #fee2e2);
  color: var(--expense-fg, #ef4444);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
}

.hero-copy {
  max-width: 760px;
}

.hero-copy__body {
  max-width: 760px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.expense-analysis-page--pro .metric-grid {
  grid-template-columns: repeat(4, 1fr);
}

/* ── Jar strip ── */
.jar-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 14px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.jar-strip__card {
  flex: 0 0 auto;
  min-width: 130px;
  padding: 10px 14px;
  border-radius: var(--radius-md, 12px);
  background: var(--surface-1, #fff);
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,.08));
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: border-color 140ms, box-shadow 140ms;

  &--active {
    border-color: var(--brand-primary, #2d4da6);
    box-shadow: 0 0 0 2px rgba(45,77,166,.18);
  }

  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,.12); }
}

.jar-strip__name-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
}

.jar-strip__dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}

.jar-strip__name {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.jar-strip__amount {
  font-family: var(--font-money, monospace);
  font-weight: 700;
  font-size: 14.5px;
  color: var(--expense-fg, #b91c1c);
  font-variant-numeric: tabular-nums;
}

.jar-strip__bar {
  height: 3px;
  border-radius: 2px;
  background: var(--surface-3, #e2e8f0);
  margin-top: 8px;
  overflow: hidden;
}

.jar-strip__bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 400ms ease-out;
}

.metric-label {
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  margin-top: 8px;
}

.metric-hint {
  color: #64748b;
  font-size: 12px;
  margin-top: 6px;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.content-grid--legacy {
  grid-template-columns: 340px minmax(0, 1fr);
}

.content-grid--lite {
  grid-template-columns: minmax(0, 1fr);
}

.filters-panel {
  position: sticky;
  top: 12px;
}

.filters-panel--lite {
  position: static;
}

.analysis-expansion-header {
  min-height: 52px;
}

.chip-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.analysis-main {
  min-width: 0;
}

.empty-state {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.group-stack,
.subgroup-stack,
.rows-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-card,
.subgroup-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 0.96));
}

.group-card__header {
  padding: 12px 14px;
}

.group-head,
.subgroup-head {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.group-totals {
  text-align: right;
}

.tx-row {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: white;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  text-align: left;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.tx-row:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.tx-row--compact {
  padding: 12px;
  gap: 10px;
}

.tx-main,
.tx-amounts {
  min-width: 0;
}

.tx-main {
  flex: 1 1 auto;
}

.tx-title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.tx-amounts {
  flex: 0 0 170px;
  text-align: right;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .filters-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-card,
  .tx-row,
  .group-head,
  .subgroup-head {
    flex-direction: column;
    align-items: stretch;
  }

  .tx-amounts,
  .group-totals {
    text-align: left;
  }
}

/* ── Donut (Lite mode) ──────────────────────────────────────────── */
.an-donut-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg, 14px);
  box-shadow: var(--shadow-card);
  padding: 22px;
  margin-bottom: 18px;
}

.an-donut-body {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.an-donut {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  flex-shrink: 0;
  -webkit-mask: radial-gradient(circle, transparent 52%, black 53%);
  mask: radial-gradient(circle, transparent 52%, black 53%);
}

.an-donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.an-donut-legend__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--fg-1);
}

.an-donut-legend__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.an-donut-legend__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.an-donut-legend__pct {
  color: var(--fg-2);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* ─── Pro 3-col nav grid ──────────────────────────────────────── */
.pro-nav-grid {
  display: grid;
  grid-template-columns: 280px 1fr 340px;
  gap: 16px;
  align-items: start;
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .pro-nav-grid {
    grid-template-columns: 1fr;
  }
}

.pro-nav-grid__rail {
  position: sticky;
  top: 16px;
}

.pro-nav-grid__center,
.pro-nav-grid__right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pro-card {
  background: var(--surface-1);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-card);
  padding: 20px;
}

.pro-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}

.pro-card__desc {
  color: var(--fg-3);
  font-size: 13px;
  margin: 4px 0 16px;
}

.pro-card__hint {
  color: var(--fg-3);
  font-size: 12px;
}

.pro-card__divider {
  border-top: 1px solid var(--border-hairline);
  margin: 14px 0;
}

.pro-field {
  margin-bottom: 14px;
}

.pro-field__label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--fg-3);
  margin-bottom: 5px;
}

.pro-clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--info, #3b82f6);
  font-size: 13px;
  padding: 0;
}

/* Top list */
.top-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.top-list__row {
  display: grid;
  grid-template-columns: 9px 1fr 80px auto;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  text-align: left;
  border-radius: var(--radius-sm, 6px);
  transition: background 0.1s;
}

.top-list__row:hover {
  background: var(--surface-2);
}

.top-list__row--active {
  background: color-mix(in srgb, var(--info, #3b82f6) 10%, transparent);
}

.top-list__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.top-list__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-list__bar-wrap {
  height: 6px;
  background: var(--surface-3, #e2e8f0);
  border-radius: 99px;
  overflow: hidden;
}

.top-list__bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}

.top-list__amount {
  font-size: 12px;
  font-weight: 600;
  color: var(--expense-fg, #ef4444);
  white-space: nowrap;
}

/* Budget list */
.budget-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.budget-row__top {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
}

.budget-row__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.budget-row__name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.budget-row__pct {
  font-size: 12px;
  font-weight: 700;
  color: var(--fg-2);
}

.budget-row__pct--over {
  color: var(--expense-fg, #ef4444);
}

.budget-bar {
  height: 6px;
  background: var(--surface-3, #e2e8f0);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 4px;
}

.budget-bar__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}

.budget-row__amounts {
  display: flex;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--fg-2);
}

/* Insight card */
.pro-insight {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: color-mix(in srgb, var(--expense-fg, #ef4444) 8%, var(--surface-1));
  border: 1px solid color-mix(in srgb, var(--expense-fg, #ef4444) 25%, var(--border-hairline));
  border-radius: var(--radius-lg, 12px);
  padding: 14px 16px;
  font-size: 13px;
  color: var(--fg-1);
  line-height: 1.5;
}
</style>
