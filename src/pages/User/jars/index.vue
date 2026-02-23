<template>
  <q-page padding>
    <!-- Panel de ingreso mensual y disponible -->
    <MonthlyIncomePanel
      ref="incomePanelRef"
      v-model:use-real-income="useRealIncome"
      :total-assigned="totalAssignedAmount"
      :month="currentMonth"
      class="q-mb-md"
      @income-updated="handleIncomeUpdated"
    />

    <!-- Resumen mensual de cántaros -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">Resumen del mes</div>
        <div class="text-caption text-grey-7">
          Totales de gasto, asignación y ahorro por cántaro.
        </div>
      </q-card-section>
      <q-separator />

      <!-- KPIs rápidos -->
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <div class="col-6 col-sm-3">
            <div class="text-caption text-grey-7">Total gastado</div>
            <div class="text-h6 text-negative">{{ formatCurrency(summaryTotals.spent) }}</div>
          </div>
          <div class="col-6 col-sm-3">
            <div class="text-caption text-grey-7">Total ajustes</div>
            <div class="text-h6" :class="summaryTotals.adjustment >= 0 ? 'text-positive' : 'text-negative'">
              {{ summaryTotals.adjustment >= 0 ? '+' : '' }}{{ formatCurrency(summaryTotals.adjustment) }}
            </div>
          </div>
          <div class="col-6 col-sm-3">
            <div class="text-caption text-grey-7">No usado en cántaros</div>
            <div class="text-h6">{{ formatCurrency(theoreticalSavings.total_unused) }}</div>
          </div>
          <div class="col-6 col-sm-3">
            <div class="text-caption text-grey-7">Ahorro teórico total</div>
            <div class="text-h6 text-primary">{{ formatCurrency(theoreticalSavings.total_theoretical) }}</div>
            <div class="text-caption text-grey-6">Incluye cuentas de ahorro: {{ formatCurrency(theoreticalSavings.total_savings_accounts) }}</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Tabla desglose por cántaro -->
      <q-card-section class="q-pa-none">
        <div class="summary-table-wrap">
          <table class="summary-table">
            <thead>
              <tr>
                <th class="text-left">Cántaro</th>
                <th v-if="hasAnyAccumulative" class="text-right">
                  Saldo anterior
                  <div class="th-sub text-grey-6">mes previo</div>
                </th>
                <th class="text-right">
                  Asignado
                  <div class="th-sub text-info">esperado</div>
                </th>
                <th class="text-right">
                  Asignado
                  <div class="th-sub text-positive">real</div>
                </th>
                <th v-if="hasAnyAccumulative" class="text-right">
                  Disponible mes
                  <div class="th-sub text-purple-4">anterior + asignado</div>
                </th>
                <th class="text-right">Gastado</th>
                <th class="text-right">Ajuste</th>
                <th class="text-right">Total gasto</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in jarMonthlySummary" :key="row.id">
                <td>
                  <div class="summary-jar-name">
                    <span class="summary-dot" :style="{ background: row.color }"></span>
                    {{ row.name }}
                    <span class="text-caption text-grey-6 q-ml-xs">
                      {{ row.type === 'percent' ? `${row.percent}%` : 'Fijo' }}
                    </span>
                  </div>
                </td>
                <td v-if="hasAnyAccumulative" class="text-right" :class="row.carryOver > 0 ? 'text-positive' : row.carryOver < 0 ? 'text-negative' : 'text-grey-6'">
                  <template v-if="row.isAccumulative && row.carryOver !== 0">
                    <q-icon :name="row.carryOver > 0 ? 'trending_up' : 'trending_down'" size="14px" class="q-mr-xs" />
                    {{ row.carryOver > 0 ? '+' : '' }}{{ formatCurrency(row.carryOver) }}
                    <div class="text-caption" :class="row.carryOver > 0 ? 'text-positive' : 'text-negative'">
                      {{ row.carryOver > 0 ? 'superávit' : 'excedido' }}
                    </div>
                  </template>
                  <template v-else-if="row.isAccumulative">
                    $0.00
                  </template>
                  <template v-else>
                    —
                  </template>
                </td>
                <td class="text-right text-info">{{ formatCurrency(row.assignedExpected) }}</td>
                <td class="text-right text-positive">{{ formatCurrency(row.assignedReal) }}</td>
                <td v-if="hasAnyAccumulative" class="text-right text-weight-bold text-purple-4">
                  {{ row.isAccumulative ? formatCurrency(row.carryOver + row.assignedExpected) : formatCurrency(row.assignedExpected) }}
                </td>
                <td class="text-right text-negative">{{ formatCurrency(row.spent) }}</td>
                <td class="text-right" :class="row.adjustment > 0 ? 'text-positive' : row.adjustment < 0 ? 'text-negative' : ''">
                  {{ row.adjustment !== 0 ? ((row.adjustment > 0 ? '+' : '') + formatCurrency(row.adjustment)) : '—' }}
                </td>
                <td class="text-right text-weight-bold text-negative">
                  {{ formatCurrency(row.spent + Math.abs(Math.min(row.adjustment, 0))) }}
                </td>
                <td class="text-right text-weight-bold" :class="row.balance < 0 ? 'text-negative' : row.balance > 0 ? 'text-positive' : 'text-grey-6'">
                  {{ formatCurrency(row.balance) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-total-row">
                <td class="text-weight-bold">Total</td>
                <td v-if="hasAnyAccumulative" class="text-right text-weight-bold" :class="summaryTotals.carryOver > 0 ? 'text-positive' : summaryTotals.carryOver < 0 ? 'text-negative' : 'text-grey-6'">
                  {{ summaryTotals.carryOver !== 0 ? ((summaryTotals.carryOver > 0 ? '+' : '') + formatCurrency(summaryTotals.carryOver)) : '—' }}
                </td>
                <td class="text-right text-weight-bold text-info">{{ formatCurrency(summaryTotals.assignedExpected) }}</td>
                <td class="text-right text-weight-bold text-positive">{{ formatCurrency(summaryTotals.assignedReal) }}</td>
                <td v-if="hasAnyAccumulative" class="text-right text-weight-bold text-purple-4">
                  {{ formatCurrency(summaryTotals.carryOver + summaryTotals.assignedExpected) }}
                </td>
                <td class="text-right text-weight-bold text-negative">{{ formatCurrency(summaryTotals.spent) }}</td>
                <td class="text-right text-weight-bold" :class="summaryTotals.adjustment >= 0 ? 'text-positive' : 'text-negative'">
                  {{ summaryTotals.adjustment !== 0 ? ((summaryTotals.adjustment > 0 ? '+' : '') + formatCurrency(summaryTotals.adjustment)) : '—' }}
                </td>
                <td class="text-right text-weight-bold text-negative">
                  {{ formatCurrency(summaryTotals.totalSpent) }}
                </td>
                <td class="text-right text-weight-bold" :class="summaryTotals.balance < 0 ? 'text-negative' : 'text-positive'">
                  {{ formatCurrency(summaryTotals.balance) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">Configuración global de cántaros</div>
        <div class="text-caption text-grey-7">
          Define el inicio de contabilidad y valores por defecto.
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-sm-4">
            <q-input
              v-model="jarSettings.global_start_date"
              type="date"
              dense
              filled
              label="Inicio de contabilidad (global)"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-toggle
              v-model="jarSettings.default_allow_negative"
              dense
              color="primary"
              label="Permitir negativos por defecto"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="jarSettings.default_negative_limit"
              type="number"
              dense
              filled
              label="Límite negativo por defecto"
              prefix="$"
              :disable="!jarSettings.default_allow_negative"
              min="0"
              step="0.01"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-select
              v-model="jarSettings.default_reset_cycle"
              :options="resetCycleOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              dense
              filled
              label="Ciclo por defecto"
            />
          </div>
          <div class="col-12 col-sm-4">
            <q-input
              v-model.number="jarSettings.default_reset_cycle_day"
              type="number"
              dense
              filled
              label="Día del ciclo por defecto"
              min="1"
              max="28"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-select
              v-model="jarSettings.leverage_jar_id"
              :options="[
                { label: 'Ninguno', value: null },
                ...jarElements
                  .filter((j) => j.id)
                  .map((j) => ({ label: j.name, value: j.id }))
              ]"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              clearable
              dense
              filled
              label="Cántaro de apalancamiento"
              hint="Se usa para cubrir excesos automáticamente"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-select
              v-model="monthlyLeverageJarId"
              :options="[
                { label: 'Ninguno', value: null },
                ...jarElements
                  .filter((j) => j.id)
                  .map((j) => ({ label: j.name, value: j.id }))
              ]"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              clearable
              dense
              filled
              :label="`Cántaro de apalancamiento (${currentMonth})`"
              hint="Se aplica solo al mes seleccionado"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="header-grid">
        <div class="header-title">
          <div class="text-h6">Mis Cántaros</div>
          <div class="text-caption text-grey-7">
            Distribuye y visualiza tus porcentajes por frascos
          </div>
          <div
            v-if="
              !hasFixedJar &&
              hasActivePercentJars &&
              totalPercentage !== 100 &&
              !isExactlyOnePercent100()
            "
            class="text-caption text-negative q-mt-xs"
          >
            Ajusta los porcentajes al 100% para guardar
          </div>
        </div>
        <!-- barra horizontal centrada -->
        <div class="header-bar-col">
          <div
            class="jar-hbar"
            :class="{ warn: !hasFixedJar && hasActivePercentJars && totalPercentage !== 100 }"
            aria-label="Resumen de porcentajes de cántaros"
          >
            <div class="jar-hbar__bar">
              <div class="jar-hbar__stack">
                <div
                  v-for="seg in hbarSegments"
                  :key="seg.key"
                  :class="['jar-hbar__seg', { empty: seg.key === 'empty' }]"
                  :style="{ width: seg.width + '%', backgroundColor: seg.color }"
                >
                  <q-tooltip>{{ seg.tooltip }}</q-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- acciones a la derecha -->
        <div class="header-actions">
          <q-btn color="primary" icon="add" label="Añadir cántaro" @click="createJar" />
          <q-btn
            class="apply-template-btn"
            color="accent"
            icon="layers"
            label="Aplicar plantilla"
            unelevated
            glossy
            @click="openTemplatesDialog"
          />
          <q-btn
            label="Guardar Cambios"
            color="primary"
            @click="saveChanges"
            :loading="saving"
            :disable="saveDisabled"
          />
          <div
            class="text-subtitle2 q-ml-md"
            :class="{
              'text-negative': !hasFixedJar && totalPercentage > 100,
              'text-warning': !hasFixedJar && totalPercentage < 100,
            }"
          >
            Total: {{ totalPercentage }}%
            <q-tooltip v-if="hasFixedJar"
              >Hay cántaros fijos; la suma de % es informativa.</q-tooltip
            >
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pt-md q-pb-md">
        <div class="content-flex">
          <div class="main-col" :class="{ 'empty-mode': jarElements.length === 0 }">
            <template v-if="jarElements.length > 0">
              <Draggable
                v-model="jarElements"
                group="jars"
                item-key="uid"
                handle=".jar-drag-handle"
                class="jars-grid"
                :animation="180"
                :ghost-class="'drag-ghost'"
                :chosen-class="'drag-chosen'"
                :force-fallback="true"
              >
                <template #item="{ element: jar, index: idx }">
                  <div class="jar-item">
                    <q-card
                      flat
                      class="q-pa-md"
                      :style="{ border: '2px solid ' + getJarColor(jar), borderRadius: '8px' }"
                    >
                      <div class="jar-body-grid">
                        <div class="col">
                          <div class="jar-controls-grid">
                            <q-icon
                              name="drag_indicator"
                              class="jar-drag-handle"
                              size="20px"
                              style="cursor: grab; color: var(--q-grey-6)"
                            />
                            <q-input
                              v-model="jar.name"
                              dense
                              filled
                              placeholder="Nombre del cántaro"
                              :maxlength="60"
                              class="jar-name-input"
                              @blur="() => onJarNameBlur(idx)"
                            />
                            <q-toggle
                              v-model="jar.active"
                              dense
                              color="primary"
                              :label="jar.active ? 'Activo' : 'Inactivo'"
                            />
                            <q-btn-toggle
                              v-model="jar.refresh_mode"
                              :options="refreshModeOptions"
                              dense
                              unelevated
                              toggle-color="secondary"
                              color="grey-4"
                              size="sm"
                            >
                              <q-tooltip>
                                <div class="text-bold">Modo de refresco:</div>
                                <div>• Reset: Empieza de cero cada mes</div>
                                <div>• Acumulativo: Arrastra saldo del mes anterior</div>
                              </q-tooltip>
                            </q-btn-toggle>
                            <q-btn-toggle
                              v-model="jar.type"
                              :options="jarTypeOptions"
                              dense
                              unelevated
                              toggle-color="primary"
                              color="grey-4"
                              @update:model-value="() => onJarTypeChange(idx)"
                            />
                            <q-btn
                              dense
                              flat
                              class="jar-color-btn"
                              :style="{ backgroundColor: getJarColor(jar) }"
                              icon="palette"
                            >
                              <q-menu anchor="bottom left" self="top left" fit>
                                <div class="q-pa-sm" style="width: 280px">
                                  <q-color
                                    v-model="jar.color"
                                    format-model="hex"
                                    default-view="palette"
                                    no-header
                                    no-footer
                                  />
                                  <div class="color-menu q-mt-sm">
                                    <div class="color-suggestions">
                                      <q-btn
                                        v-for="c in suggestedJarColors(jar.name || 'Jar')"
                                        :key="c"
                                        round
                                        dense
                                        flat
                                        size="sm"
                                        :style="{
                                          backgroundColor: c,
                                          width: '22px',
                                          height: '22px',
                                          minWidth: '22px',
                                          border: '1px solid rgba(0,0,0,0.15)',
                                        }"
                                        @click="onPickSuggestedColor(idx, c)"
                                      />
                                    </div>
                                    <div class="color-actions">
                                      <q-btn
                                        flat
                                        dense
                                        round
                                        size="sm"
                                        icon="shuffle"
                                        @click="onJarColorRandom(idx)"
                                      >
                                        <q-tooltip>Aleatorio</q-tooltip>
                                      </q-btn>
                                      <q-btn
                                        flat
                                        dense
                                        round
                                        size="sm"
                                        icon="backspace"
                                        @click="onJarColorClear(idx)"
                                      >
                                        <q-tooltip>Limpiar</q-tooltip>
                                      </q-btn>
                                    </div>
                                  </div>
                                </div>
                              </q-menu>
                            </q-btn>
                            <q-btn
                              flat
                              dense
                              round
                              color="negative"
                              icon="delete"
                              @click="() => deleteJar(idx)"
                              :disable="(jar.categories?.length || 0) === 0 ? false : false"
                            >
                              <q-tooltip>Eliminar cántaro</q-tooltip>
                            </q-btn>
                            <q-btn
                              flat
                              dense
                              round
                              color="primary"
                              :icon="jar.collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
                              @click="jar.collapsed = !jar.collapsed"
                            >
                              <q-tooltip>
                                {{ jar.collapsed ? 'Expandir cántaro' : 'Minimizar cántaro' }}
                              </q-tooltip>
                            </q-btn>
                          </div>
                          <div v-if="jar.collapsed" class="jar-compact-controls q-mt-xs">
                            <template v-if="jar.type === 'percent'">
                              <q-slider
                                v-model.number="jar.percent"
                                :min="0"
                                :max="100"
                                :step="1"
                                color="primary"
                                class="compact-slider"
                                @update:model-value="onPercentChange"
                              />
                              <q-input
                                v-model.number="jar.percent"
                                type="number"
                                dense
                                filled
                                class="compact-percent-input"
                                suffix="%"
                                @update:model-value="onPercentChange"
                              />
                            </template>
                            <template v-else>
                              <q-input
                                v-model.number="jar.fixedAmount"
                                type="number"
                                dense
                                filled
                                class="compact-fixed-input"
                                prefix="$"
                                step="0.01"
                                min="0"
                                @update:model-value="onFixedAmountChange"
                              />
                            </template>
                            <q-select
                              v-model="jar.leverage_from_jar_id"
                              :options="jarElements
                                .filter((j) => j.id && j.id !== jar.id)
                                .map((j) => ({ label: j.name, value: j.id }))"
                              option-label="label"
                              option-value="value"
                              emit-value
                              map-options
                              clearable
                              dense
                              filled
                              class="compact-leverage-select"
                              label="Apalancamiento desde"
                            />
                          </div>
                          <div v-show="!jar.collapsed">
                            <div class="jar-amount-grid q-mt-xs">
                              <template v-if="jar.type === 'percent'">
                                <q-slider
                                  v-model.number="jar.percent"
                                  :min="0"
                                  :max="100"
                                  :step="1"
                                  color="primary"
                                  class="slider-col"
                                  @update:model-value="onPercentChange"
                                />
                                <q-input
                                  v-model.number="jar.percent"
                                  type="number"
                                  dense
                                  filled
                                  class="percent-input"
                                  suffix="%"
                                  @update:model-value="onPercentChange"
                                />
                              </template>
                              <template v-else>
                                <q-input
                                  v-model.number="jar.fixedAmount"
                                  type="number"
                                  dense
                                  filled
                                  class="fixed-input"
                                  prefix="$"
                                  step="0.01"
                                  min="0"
                                  @update:model-value="onFixedAmountChange"
                                />
                              </template>
                            </div>

                            <!-- Balance card (right after config) -->
                            <div v-if="jar.id && jarBalances[jar.id]" class="q-mt-md">
                              <JarCard
                                :jar="jar"
                                :balance="getJarBalanceValue(jar.id)"
                                :loading="getJarLoadingValue(jar.id)"
                                :error="getJarErrorValue(jar.id)"
                                :porcentaje-utilizado="getJarPctValue(jar.id)"
                                :status-balance="getJarStatusValue(jar.id)"
                                :show-leverage="!!(jar.leverage_from_jar_id || jarSettings.leverage_jar_id)"
                                :use-real-income="useRealIncome"
                                :expected-income="expectedIncome"
                                :calculated-income="calculatedIncome"
                                @adjust="openAdjustmentModal(jar.id)"
                                @reset="handleResetAdjustment(jar.id)"
                                @withdraw="openWithdrawalModal(jar.id)"
                                @leverage="applyLeverageNow(jar.id)"
                              />
                            </div>

                            <q-expansion-item
                              dense
                              class="q-mt-sm"
                              label="Opciones avanzadas"
                              header-class="text-caption text-grey-7"
                            >
                              <div class="row q-col-gutter-sm">
                              <div class="col-12 col-md-4">
                                <q-input
                                  v-model="jar.start_date"
                                  type="date"
                                  dense
                                  filled
                                  label="Inicio del cántaro"
                                />
                              </div>
                              <div class="col-12 col-md-4">
                                <q-toggle
                                  v-model="jar.use_global_start_date"
                                  dense
                                  color="primary"
                                  label="Usar fecha global"
                                />
                              </div>
                              <div class="col-12 col-md-4">
                                <q-select
                                  v-model="jar.reset_cycle"
                                  :options="resetCycleOptions"
                                  option-label="label"
                                  option-value="value"
                                  emit-value
                                  map-options
                                  dense
                                  filled
                                  label="Ciclo de reinicio"
                                />
                              </div>
                              <div class="col-12 col-md-4">
                                <q-input
                                  v-model.number="jar.reset_cycle_day"
                                  type="number"
                                  dense
                                  filled
                                  label="Día del ciclo"
                                  min="1"
                                  max="28"
                                />
                              </div>
                              <div class="col-12 col-md-4">
                                <q-toggle
                                  v-model="jar.allow_negative_balance"
                                  dense
                                  color="primary"
                                  label="Permitir negativo"
                                />
                              </div>
                              <div class="col-12 col-md-4">
                                <q-input
                                  v-model.number="jar.negative_limit"
                                  type="number"
                                  dense
                                  filled
                                  label="Límite negativo"
                                  prefix="$"
                                  min="0"
                                  step="0.01"
                                  :disable="!jar.allow_negative_balance"
                                />
                              </div>
                              <div class="col-12 col-md-4">
                                <q-input
                                  v-model.number="jar.target_amount"
                                  type="number"
                                  dense
                                  filled
                                  label="Meta/objetivo"
                                  prefix="$"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div class="col-12 col-md-6">
                                <q-select
                                  v-model="jar.leverage_from_jar_id"
                                  :options="jarElements
                                    .filter((j) => j.id && j.id !== jar.id)
                                    .map((j) => ({ label: j.name, value: j.id }))"
                                  option-label="label"
                                  option-value="value"
                                  emit-value
                                  map-options
                                  clearable
                                  dense
                                  filled
                                  label="Apalancamiento desde"
                                  hint="Si este cántaro queda en negativo, se descuenta de este origen"
                                />
                              </div>
                              </div>
                            </q-expansion-item>

                            <div
                              class="jar-dropzone q-mt-md"
                              :class="{ 'is-drop-target': jarDropOverIndex === idx }"
                              @dragover.prevent="() => onJarDragOver(idx)"
                              @dragleave="() => onJarDragLeave(idx)"
                              @drop.prevent="(ev) => onJarDrop(idx, ev)"
                            >
                              <Draggable
                                v-model="jar.categories"
                                group="categories"
                                item-key="id"
                                class="chip-list"
                                :animation="160"
                                :ghost-class="'drag-ghost'"
                                :chosen-class="'drag-chosen'"
                                handle=".chip-drag-handle"
                                :filter="'.q-chip__icon--remove'"
                                :prevent-on-filter="true"
                                :move="onCategoryMove"
                                @change="onCategoryChange"
                              >
                                <!-- handle=".chip-drag-handle" -->
                                <template #item="{ element: c }">
                                  <q-chip
                                    dense
                                    :key="c.id"
                                    :draggable="false"
                                    removable
                                    remove-icon="close"
                                    @remove="removeCategoryFromJar(idx, c.id)"
                                    v-bind="categoryChipBind(c.label)"
                                    class="q-mr-xs q-mb-xs"
                                  >
                                    <q-icon
                                      name="open_with"
                                      size="14px"
                                      class="chip-drag-handle q-mr-xs"
                                      draggable="true"
                                      @dragstart="onChipDragStart(c, $event)"
                                    />
                                    {{ c.label }}
                                  </q-chip>
                                </template>
                              </Draggable>
                              <div
                                v-if="!jar.categories || jar.categories.length === 0"
                                class="text-caption text-grey-7"
                              >
                                Suelta categorías aquí
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </template>
              </Draggable>
            </template>
            <template v-else>
              <div class="empty-state">
                <div class="text-h6 text-grey-7">No tienes cántaros</div>
                <div class="text-body2 text-grey-6">
                  Crea uno o aplica una plantilla para empezar
                </div>
                <div class="empty-actions">
                  <q-btn color="primary" icon="add" label="Añadir cántaro" @click="createJar" />
                  <q-btn
                    color="accent"
                    icon="layers"
                    label="Aplicar plantilla"
                    @click="openTemplatesDialog"
                  />
                </div>
              </div>
            </template>
          </div>
          <div class="aside-col">
            <div class="sticky-categories">
              <q-card flat bordered class="sticky-categories-card">
                <q-card-section class="q-pt-sm">
                  <div class="text-subtitle2">Categorías</div>
                </q-card-section>
                <q-card-section class="cats-section">
                  <div class="cats-wrap">
                    <CategoriesTree
                      ref="categoriesTreeRef"
                      :readonly="true"
                      :columns="1"
                      :nodes="categoriesPropNodes || []"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
        <q-separator spaced />
        <div class="jar-bottom-bar">
          <div
            class="text-subtitle2"
            :class="{
              'text-negative': !hasFixedJar && totalPercentage > 100,
              'text-warning': !hasFixedJar && totalPercentage < 100,
            }"
          >
            Total: {{ totalPercentage }}%
            <q-tooltip v-if="hasFixedJar"
              >Hay cántaros fijos; la suma de % es informativa.</q-tooltip
            >
          </div>
          <q-btn
            label="Guardar Cambios"
            color="primary"
            @click="saveChanges"
            :loading="saving"
            :disable="saveDisabled"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showTemplates" maximized>
      <q-card class="template-dialog-card" style="min-width: 720px; max-width: 1200px">
        <q-toolbar>
          <q-toolbar-title>Seleccionar plantilla de cántaros</q-toolbar-title>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>
        <q-separator />
        <q-card-section class="template-scroll-section">
          <q-scroll-area class="fit">
            <div class="q-pa-md templates-grid">
              <div class="template-skeleton" v-if="loadingTemplates">
                <q-skeleton type="rect" height="120px" class="q-mb-md" v-for="n in 3" :key="n" />
              </div>
              <template v-else>
                <div v-if="!templates.length" class="text-caption text-grey-7">
                  No hay plantillas disponibles.
                </div>
                <div
                  v-for="tpl in templates"
                  :key="tpl.slug || tpl.id || tpl.name"
                  class="template-item"
                >
                  <q-card bordered class="q-pa-sm">
                    <q-card-section>
                      <div class="text-subtitle1">{{ tpl.name }}</div>
                      <div class="text-caption text-grey-7">{{ tpl.description }}</div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section>
                      <div class="text-caption text-grey-8 q-mb-xs">Jarras</div>
                      <div class="chip-list">
                        <q-chip
                          v-for="j in tpl.jars || []"
                          :key="(j.sort_order || 0) + '-' + (j.name || '')"
                          v-bind="jarChipBind(j)"
                          dense
                          class="q-mr-xs q-mb-xs"
                        >
                          {{ j.name }}
                          <span v-if="j.type === 'percent' && j.percent != null">
                            — {{ j.percent }}%</span
                          >
                          <span v-else-if="j.fixed_amount != null"> — fijo</span>
                        </q-chip>
                      </div>
                      <!-- Categorías sugeridas por jar (si existen) -->
                      <div
                        v-for="j in tpl.jars || []"
                        :key="'cats-' + (j.sort_order || 0) + '-' + (j.name || '')"
                      >
                        <div
                          v-if="Array.isArray(j.categories) && j.categories.length"
                          class="q-mt-sm"
                        >
                          <div class="text-caption text-grey-7 q-mb-xs">
                            Categorías para {{ j.name }}
                          </div>
                          <div class="chip-list">
                            <q-chip
                              v-for="cat in j.categories"
                              :key="typeof cat === 'string' ? cat : cat.id ?? (cat.name || '')"
                              dense
                              v-bind="categoryChipBind(cat)"
                              class="q-mr-xs q-mb-xs"
                            >
                              {{ typeof cat === 'string' ? cat : cat.name || '' }}
                            </q-chip>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-actions align="right">
                      <q-btn
                        color="primary"
                        label="Aplicar"
                        @click="() => confirmApplyTemplate(tpl)"
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </template>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- NUEVO: Adjustment modal -->
    <AdjustmentModal
      v-model="showAdjustmentModal"
      :jar="
        currentJarAdjustment ? jarElements.find((j) => j.id === currentJarAdjustment) ?? null : null
      "
      :current-balance="Math.round(getJarBaseBalance(currentJarAdjustment || -1) * 100) / 100"
      :accounting-balance="Math.round((
        getJarBaseBalance(currentJarAdjustment || -1) +
          (getJarBalanceValue(currentJarAdjustment || -1)?.retiros || 0)
      ) * 100) / 100"
      :assigned-amount="Math.round(getAdjustmentBudgetBase(currentJarAdjustment || -1) * 100) / 100"
      :allow-negative="
        currentJarAdjustment
          ? (jarElements.find((j) => j.id === currentJarAdjustment)?.allow_negative_balance ?? false) ||
            jarElements.find((j) => j.id === currentJarAdjustment)?.refresh_mode === 'accumulative'
          : false
      "
      :negative-limit="
        currentJarAdjustment
          ? jarElements.find((j) => j.id === currentJarAdjustment)?.negative_limit ?? null
          : null
      "
      :previous-adjustment="getJarBalanceValue(currentJarAdjustment || -1)?.ajuste ?? 0"
      @save="handleSaveAdjustment"
      @clear="handleClearAdjustments"
    />

    <q-dialog v-model="showWithdrawalModal">
      <q-card style="min-width: 360px; max-width: 520px">
        <q-card-section>
          <div class="text-h6">Registrar uso del cántaro</div>
          <div class="text-caption text-grey-7">
            Balance actual: {{
              formatCurrency(
                getJarBalanceValue(currentJarWithdrawal || -1)?.balance || 0
              )
            }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="column q-gutter-sm">
            <q-input
              v-model.number="withdrawalForm.amount"
              type="number"
              dense
              filled
              label="Monto a usar"
              prefix="$"
              min="0"
              step="0.01"
            />
            <q-input
              v-model="withdrawalForm.description"
              dense
              filled
              label="Descripción"
              maxlength="255"
            />
            <q-input
              v-model="withdrawalForm.date"
              type="date"
              dense
              filled
              label="Fecha"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="handleSaveWithdrawal" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';
import { usePeriodStore } from 'stores/period';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useJarsStore } from 'stores/jars';
import CategoriesTree from 'components/CategoriesTree.vue';
import Draggable from 'vuedraggable';
import { useJarBalance } from 'src/composables/useJarBalance';
import { useCalculatedIncome } from 'src/composables/useCalculatedIncome';
import JarCard from 'components/JarCard.vue';
import AdjustmentModal from 'components/AdjustmentModal.vue';
import MonthlyIncomePanel from 'components/MonthlyIncomePanel.vue';

defineOptions({ name: 'JarsOverviewPage' });

type Jar = {
  uid: string;
  id?: number;
  name: string;
  // percent jars use percent; fixed jars use fixedAmount
  percent?: number | undefined;
  fixedAmount?: number | undefined;
  type: 'percent' | 'fixed';
  refresh_mode?: 'reset' | 'accumulative';
  allow_negative_balance?: boolean;
  negative_limit?: number | null;
  start_date?: string | null;
  use_global_start_date?: boolean;
  reset_cycle?: 'none' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  reset_cycle_day?: number;
  target_amount?: number | null;
  leverage_from_jar_id?: number | null;
  color?: string | undefined;
  categories?: Array<{ id: string; label: string }>;
  active?: boolean;
  collapsed?: boolean;
};

// API response typing for jars
type JarAPI = {
  id?: number;
  name?: string;
  percent?: number;
  type?: string;
  fixed_amount?: number;
  amount?: number;
  refresh_mode?: string;
  allow_negative_balance?: boolean | null;
  negative_limit?: number | null;
  start_date?: string | null;
  use_global_start_date?: boolean | null;
  reset_cycle?: string | null;
  reset_cycle_day?: number | null;
  target_amount?: number | null;
  categories?: Array<{ id: string | number; name?: string; label?: string }>;
  color?: string | null;
  sort_order?: number | null;
  active?: number | boolean | null;
  is_active?: number | boolean | null;
};

type JarSettings = {
  id?: number;
  user_id?: number;
  global_start_date?: string | null;
  default_allow_negative?: boolean;
  default_negative_limit?: number | null;
  default_reset_cycle?: 'none' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  default_reset_cycle_day?: number;
  leverage_jar_id?: number | null;
};

type CatNodeInput = {
  id: string | number;
  label: string;
  type?: 'folder' | 'category';
  icon?: string | null;
  children?: CatNodeInput[];
};

const $q = useQuasar();
const auth = useAuthStore();
const periodStore = usePeriodStore();
const route = useRoute();
const router = useRouter();
const jarElements = ref<Jar[]>([]);
const jarsStore = useJarsStore();
const serverJarIds = ref<Set<number>>(new Set());
const saving = ref(false);
const useRealIncome = ref(false);
const incomePanelRef = ref<{ refresh: () => Promise<void> } | null>(null);
const jarSettingsLoaded = ref(false);
const jarSettings = ref<JarSettings>({
  global_start_date: null,
  default_allow_negative: false,
  default_negative_limit: null,
  default_reset_cycle: 'none',
  default_reset_cycle_day: 1,
  leverage_jar_id: null,
});
const monthlyLeverageJarId = ref<number | null>(null);

const theoreticalSavings = ref({
  total_unused: 0,
  total_savings_accounts: 0,
  total_theoretical: 0,
});

// Get current month in YYYY-MM format from period store
const currentMonth = computed(() => {
  if (periodStore.state.type === 'month') {
    const anchorDate = new Date(periodStore.state.anchor + 'T00:00:00');
    const year = anchorDate.getFullYear();
    const month = String(anchorDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  // Default to current month if not in month mode
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
});

const validPeriodTypes = new Set([
  'all',
  'year',
  'semester',
  'quarter',
  'month',
  'fortnight',
  'week',
  'day',
  'custom',
]);
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isYearMonth = (value: string) => /^\d{4}-\d{2}$/.test(value);

function applyPeriodFromQuery() {
  const q = route.query;
  const period = typeof q.period === 'string' ? q.period : undefined;
  const anchor = typeof q.anchor === 'string' ? q.anchor : undefined;
  const from = typeof q.from === 'string' ? q.from : undefined;
  const to = typeof q.to === 'string' ? q.to : undefined;
  const month = typeof q.month === 'string' ? q.month : undefined;

  if (month && isYearMonth(month)) {
    periodStore.setType('month');
    periodStore.state.anchor = `${month}-01`;
    return;
  }

  if (period && validPeriodTypes.has(period)) {
    if (period === 'custom') {
      if (from && to && isIsoDate(from) && isIsoDate(to)) {
        periodStore.setCustomRange(from, to);
      }
    } else {
      periodStore.setType(period as typeof periodStore.state.type);
    }
  }

  if (anchor && isIsoDate(anchor)) {
    periodStore.state.anchor = anchor;
  }
}

function syncPeriodToQuery() {
  const type = periodStore.state.type;
  const anchor = periodStore.state.anchor;
  const from = periodStore.state.customFrom;
  const to = periodStore.state.customTo;

  const nextQuery: Record<string, string> = {
    ...(route.query as Record<string, string>),
    period: type,
    anchor,
  };

  if (type === 'month') {
    nextQuery.month = anchor.slice(0, 7);
  } else {
    delete nextQuery.month;
  }

  if (type === 'custom') {
    if (from) nextQuery.from = from;
    if (to) nextQuery.to = to;
  } else {
    delete nextQuery.from;
    delete nextQuery.to;
  }

  const currentQuery = route.query as Record<string, string>;
  const same = Object.keys(nextQuery).every((k) => nextQuery[k] === currentQuery[k]) &&
    Object.keys(currentQuery).every((k) => currentQuery[k] === nextQuery[k]);
  if (!same) {
    void router.replace({ query: nextQuery });
  }
}

// Income composable for calculating suggested amounts
const { expectedIncome, calculatedIncome, fetchCalculatedIncome } = useCalculatedIncome();

// Helper function to calculate suggested amount for a jar
function calculateJarSuggestion(jar: Jar): number {
  if (!jar.active) return 0;

  // Use real income if toggle is on, otherwise use expected
  const income = useRealIncome.value ? calculatedIncome.value : expectedIncome.value;

  if (income === 0) return 0;

  if (jar.type === 'percent') {
    return (income * (jar.percent || 0)) / 100;
  }

  // For fixed amount jars
  return jar.fixedAmount || 0;
}

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Exclusivo solo si existe exactamente un único jar de porcentaje ACTIVO y es 100%
function isExactlyOnePercent100(): boolean {
  const percents = (jarElements.value || []).filter(
    (j) => j.type === 'percent' && (j.active ?? true)
  );
  if (percents.length !== 1) return false;
  const only = percents[0]!;
  return Math.round(Number(only.percent) || 0) === 100;
}
const saveDisabled = computed(
  () =>
    saving.value ||
    (!hasFixedJar.value &&
      hasActivePercentJars.value &&
      totalPercentage.value !== 100 &&
      !isExactlyOnePercent100())
);

// Drag state for per-jar dropzones
const jarDropOverIndex = ref<number | null>(null);
const invalidCategoryDropIndex = ref<number | null>(null);

// Balance management
const jarBalances = ref<Record<number, ReturnType<typeof useJarBalance>>>({});
const showAdjustmentModal = ref(false);
const currentJarAdjustment = ref<number | null>(null);
const loadedBalances = ref<Set<number>>(new Set());
const showWithdrawalModal = ref(false);
const currentJarWithdrawal = ref<number | null>(null);
const withdrawalForm = ref({
  amount: 0,
  description: '',
  date: new Date().toISOString().slice(0, 10),
});


// Tree ref (typed with exposed API) and map of categories for quick lookup on drop
type CategoriesTreeExposed = {
  setTreeFlexible: (
    payload: CatNodeInput[] | { id: string | number; label?: string; children?: CatNodeInput[] }
  ) => void;
  removeNode: (id: string) => void;
  addCategoryToParent: (
    category: {
      id: string;
      label: string;
      type?: 'folder' | 'category';
      icon?: string | null;
      order?: number | undefined;
    },
    parentId?: string | null,
    atIndex?: number
  ) => void;
};
const categoriesTreeRef = ref<CategoriesTreeExposed | null>(null);
type CatInfo = {
  id: string;
  label: string;
  type: 'folder' | 'category';
  children?: string[] | undefined;
  parent?: string | undefined;
  order?: number | undefined;
};
const categoriesMap = ref<Record<string, CatInfo>>({});
// Mapa maestro con TODAS las categorías del árbol original (deduplicado),
// aunque luego filtremos las asignadas de la vista.
const categoriesMasterMap = ref<Record<string, CatInfo>>({});
// Carpeta visible en árbol (para no recrearla y perder hijos)
const visibleFolders = ref<Set<string>>(new Set());
// Provide nodes via prop for CategoriesTree rendering
const categoriesPropNodes = ref<CatNodeInput[] | null>(null);

// Types for draggable category items
type CatItem = { id: string; label: string };
type DragMoveEvent = {
  relatedContext?: { list?: CatItem[]; component?: unknown };
  draggedContext?: { element?: CatItem; list?: CatItem[]; component?: unknown };
};
type DragChangeEvent = {
  added?: { element: CatItem; newIndex: number };
  removed?: { element: CatItem; oldIndex: number };
  moved?: { element: CatItem; newIndex: number; oldIndex: number };
  from?: CatItem[];
  to?: CatItem[];
};

// Simple logger utility to prefix logs for this page
function log(...args: unknown[]) {
  console.log('[Jars][DND]', ...args);
}

// Generador de uid estable para draggable
function genUid(seed?: string | number) {
  const base = seed != null ? String(seed) : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `jar-${base}`;
}

function mkJar(name: string, percent: number, type: 'percent' | 'fixed', id?: number): Jar {
  const j: Jar = {
    uid: genUid(id ?? undefined),
    name,
    percent,
    type,
    refresh_mode: 'reset', // Default to reset mode
    allow_negative_balance: false,
    negative_limit: null,
    start_date: null,
    use_global_start_date: true,
    reset_cycle: 'none',
    reset_cycle_day: 1,
    target_amount: null,
    leverage_from_jar_id: null,
    color: undefined,
    categories: [],
    active: true,
    collapsed: true,
  };
  if (id != null) j.id = id;
  return j;
}

// Plantillas
type TemplateJar = {
  id?: number;
  name: string;
  type: 'percent' | 'fixed';
  percent?: number | null;
  fixed_amount?: number | null;
  base_scope?: string | null;
  color?: string | null;
  sort_order?: number | null;
  // Optional: suggested categories to show in the template selector
  categories?: Array<
    | string
    | {
        id?: string | number;
        name?: string;
        color?: string | null;
      }
  >;
};
type JarTemplate = {
  id?: number;
  name: string;
  slug?: string;
  description?: string | null;
  active?: number | boolean;
  jars?: TemplateJar[];
};
const showTemplates = ref(false);
const loadingTemplates = ref(false);
const templates = ref<JarTemplate[]>([]);

// Helpers for category chip colors (stable per label)
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function hslToHex(h: number, s: number, l: number): string {
  // h: 0-360, s,l: 0-100
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function autoColorForLabel(label: string): string {
  if (!label) return '#6B7280';
  const h = hashString(label) % 360;
  const s = 78; // higher saturation for more contrast
  const l = 38; // a bit darker for stronger contrast
  return hslToHex(h, s, l);
}
function luminance(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return 0;
  const r = parseInt(m[1]!, 16) / 255;
  const g = parseInt(m[2]!, 16) / 255;
  const b = parseInt(m[3]!, 16) / 255;
  const arr = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const [rL, gL, bL] = arr as [number, number, number];
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}
function categoryBgColor(label: string): string {
  return autoColorForLabel(label);
}
//
function contrastTextColor(bgHex: string): 'black' | 'white' {
  return luminance(bgHex) > 0.5 ? 'black' : 'white';
}

// Prefer inline style when color is hex; otherwise use Quasar palette color prop
function isHexColor(val?: string | null): boolean {
  if (!val) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim());
}
function jarChipBind(j: TemplateJar) {
  const bg = j.color || '';
  if (isHexColor(bg)) {
    const text = contrastTextColor(bg);
    return { style: { backgroundColor: bg, color: text } };
  }
  // palette token or empty
  return { color: bg || 'grey-6', textColor: 'white' } as const;
}

function unwrapMaybeRef<T>(val: { value: T } | T | null | undefined): T | null {
  if (val && typeof val === 'object' && 'value' in val) {
    return (val as { value: T }).value;
  }
  return (val as T) ?? null;
}

function getJarBalanceValue(jarId: number) {
  const entry = jarBalances.value[jarId];
  return unwrapMaybeRef(entry?.balance ?? null);
}

function getJarLeverageNet(jarId: number): number {
  const bal = getJarBalanceValue(jarId);
  const leverageIn = bal?.leverage_in ?? 0; // absorbed from others
  const leverageOut = bal?.leverage_out ?? 0; // excess transferred out
  return leverageOut - leverageIn;
}

function getJarBaseBalance(jarId: number): number {
  const bal = getJarBalanceValue(jarId);
  if (!bal) return 0;
  return (bal.balance ?? 0) - (bal.leverage_in ?? 0) + (bal.leverage_out ?? 0);
}

/**
 * For accumulative jars, the budget base = saldo_anterior + asignado.
 * For reset jars, just asignado.
 * This way the "Usado" field in the adjustment modal shows
 * only real spending for the current month, not the carry-over.
 */
function getAdjustmentBudgetBase(jarId: number): number {
  const bal = getJarBalanceValue(jarId);
  if (!bal) return 0;
  const assigned = bal.asignado || 0;
  const jar = jarElements.value.find((j) => j.id === jarId);
  if (jar?.refresh_mode === 'accumulative') {
    return assigned + (bal.saldo_anterior ?? 0);
  }
  return assigned;
}

function getJarLeverageSourceName(jarId: number): string {
  const jar = jarElements.value.find((j) => j.id === jarId);
  const sourceId =
    jar?.leverage_from_jar_id ??
    monthlyLeverageJarId.value ??
    jarSettings.value.leverage_jar_id ??
    null;
  if (!sourceId) return '—';
  return jarElements.value.find((j) => j.id === sourceId)?.name || `#${sourceId}`;
}

function getJarLoadingValue(jarId: number) {
  const entry = jarBalances.value[jarId];
  return unwrapMaybeRef(entry?.loading ?? null) ?? false;
}

function getJarErrorValue(jarId: number) {
  const entry = jarBalances.value[jarId];
  return unwrapMaybeRef(entry?.error ?? null);
}

function getJarPctValue(jarId: number) {
  const entry = jarBalances.value[jarId];
  return unwrapMaybeRef(entry?.porcentajeUtilizado ?? null) ?? 0;
}

function getJarStatusValue(jarId: number) {
  const entry = jarBalances.value[jarId];
  return unwrapMaybeRef(entry?.statusBalance ?? null) ?? 'low';
}
function categoryChipBind(
  cat: string | { id?: string | number; name?: string; color?: string | null }
) {
  const label = typeof cat === 'string' ? cat : cat.name || '';
  const bg = typeof cat === 'string' ? categoryBgColor(label) : cat.color || categoryBgColor(label);
  if (isHexColor(bg)) {
    const text = contrastTextColor(bg);
    return { style: { backgroundColor: bg, color: text } };
  }
  // unlikely path (palette token), but keep consistent
  return { color: bg, textColor: contrastTextColor('#777') } as const;
}

// Color derivation for jars (stable and contrasting): reuse provided color or generate
function getJarBaseColor(j: Jar): string {
  if (j.color && isHexColor(j.color)) return j.color;
  return autoColorForLabel(j.name || 'Jar');
}
function getJarColor(j: Jar): string {
  return getJarBaseColor(j);
}

const totalPercentage = computed(() => {
  const sum = (jarElements.value || [])
    .filter((j) => j.type === 'percent' && (j.active ?? true))
    .reduce((acc, j) => acc + (Number(j.percent) || 0), 0);
  return Math.round(sum * 100) / 100;
});
const hasFixedJar = computed(() =>
  (jarElements.value || []).some((j) => j.type === 'fixed' && (j.active ?? true))
);
const hasActivePercentJars = computed(() =>
  (jarElements.value || []).some((j) => j.type === 'percent' && (j.active ?? true))
);

/**
 * Calcula el total asignado actual a todos los cántaros.
 * Usa el valor del backend si existe; si no, calcula localmente desde porcentaje × ingreso.
 */
const totalAssignedAmount = computed(() => {
  const backendTotal = Object.values(jarBalances.value).reduce((total, balanceComposable) => {
    const assigned = balanceComposable?.balance?.value?.asignado || 0;
    return total + assigned;
  }, 0);

  // Si el backend ya tiene valores, usarlos
  if (backendTotal > 0) return backendTotal;

  // Fallback: calcular localmente desde porcentaje × ingreso activo
  const income = useRealIncome.value ? calculatedIncome.value : expectedIncome.value;
  if (income <= 0) return 0;
  return jarElements.value
    .filter((j) => (j.active ?? true) && j.id)
    .reduce((sum, j) => {
      if (j.type === 'percent') return sum + (income * (j.percent || 0)) / 100;
      return sum + (j.fixedAmount || 0);
    }, 0);
});

/**
 * Resumen mensual por cántaro: nombre, asignado (esperado/real), gastado, ajuste, balance
 */
type JarMonthlySummaryRow = {
  id: number;
  name: string;
  color: string;
  type: 'percent' | 'fixed';
  percent: number;
  isAccumulative: boolean;
  carryOver: number;
  assignedExpected: number;
  assignedReal: number;
  spent: number;
  adjustment: number;
  withdrawals: number;
  transfersIn: number;
  transfersOut: number;
  leverageIn: number;
  leverageOut: number;
  balance: number;
};

const jarMonthlySummary = computed<JarMonthlySummaryRow[]>(() => {
  return jarElements.value
    .filter((j) => j.id && (j.active ?? true))
    .map((j) => {
      const bal = getJarBalanceValue(j.id!);
      const pct = j.percent || 0;
      const isAccum = j.refresh_mode === 'accumulative';
      return {
        id: j.id!,
        name: j.name,
        color: getJarColor(j),
        type: j.type as 'percent' | 'fixed',
        percent: pct,
        isAccumulative: isAccum,
        carryOver: isAccum ? (bal?.saldo_anterior ?? 0) : 0,
        assignedExpected: j.type === 'percent'
          ? (expectedIncome.value * pct) / 100
          : (j.fixedAmount || 0),
        assignedReal: j.type === 'percent'
          ? (calculatedIncome.value * pct) / 100
          : (j.fixedAmount || 0),
        spent: bal?.gastado || 0,
        adjustment: bal?.ajuste || 0,
        withdrawals: bal?.retiros || 0,
        transfersIn: bal?.transfers_in || 0,
        transfersOut: bal?.transfers_out || 0,
        leverageIn: bal?.leverage_in || 0,
        leverageOut: bal?.leverage_out || 0,
        balance: bal?.balance || 0,
      };
    });
});

const hasAnyAccumulative = computed(() =>
  jarMonthlySummary.value.some((r) => r.isAccumulative)
);

const summaryTotals = computed(() => {
  const rows = jarMonthlySummary.value;
  const spent = rows.reduce((s, r) => s + r.spent, 0);
  const adjustment = rows.reduce((s, r) => s + r.adjustment, 0);
  return {
    assignedExpected: rows.reduce((s, r) => s + r.assignedExpected, 0),
    assignedReal: rows.reduce((s, r) => s + r.assignedReal, 0),
    carryOver: rows.reduce((s, r) => s + r.carryOver, 0),
    spent,
    adjustment,
    withdrawals: rows.reduce((s, r) => s + r.withdrawals, 0),
    balance: rows.reduce((s, r) => s + r.balance, 0),
    totalSpent: spent + Math.abs(Math.min(adjustment, 0)),
  };
});

// Segments for horizontal bar: active percent jars, plus empty remainder up to 100%
const hbarSegments = computed(() => {
  const segs = (jarElements.value || [])
    .filter((j) => j.type === 'percent' && (j.active ?? true))
    .map((j) => ({
      key: j.uid,
      width: Math.max(0, Math.min(100, Number(j.percent) || 0)),
      color: getJarColor(j),
      tooltip: `${j.name}: ${Math.round(Number(j.percent) || 0)}%`,
    }));
  // Normalize if sum > 100 to avoid overflow
  const sum = segs.reduce((s, x) => s + x.width, 0);
  if (sum > 100) {
    const k = 100 / sum;
    segs.forEach((s) => (s.width = Math.round(s.width * k * 100) / 100));
  }
  const remainder = Math.max(0, 100 - segs.reduce((s, x) => s + x.width, 0));
  if (remainder >= 0.5) {
    segs.push({
      key: 'empty',
      width: Math.round(remainder * 100) / 100,
      color: 'rgba(0,0,0,0.08)',
      tooltip: `Libre: ${Math.round(remainder)}%`,
    });
  }
  return segs;
});

function onPercentChange() {
  // Clamp between 0-100 and round to int for percent jars only
  jarElements.value = jarElements.value.map((j) =>
    j.type === 'percent'
      ? { ...j, percent: Math.max(0, Math.min(100, Math.round(Number(j.percent) || 0))) }
      : j
  );
}
function onFixedAmountChange() {
  // Ensure non-negative, 2 decimals for fixed jars
  jarElements.value = jarElements.value.map((j) =>
    j.type === 'fixed'
      ? { ...j, fixedAmount: Math.max(0, Number(Number(j.fixedAmount || 0).toFixed(2))) }
      : j
  );
}
const jarTypeOptions: Array<{ label: string; value: 'percent' | 'fixed' }> = [
  { label: '% Porcentaje', value: 'percent' },
  { label: '$ Monto Fijo', value: 'fixed' },
];

const refreshModeOptions: Array<{ label: string; value: 'reset' | 'accumulative'; icon?: string }> = [
  { label: 'Reset', value: 'reset', icon: 'refresh' },
  { label: 'Acumulativo', value: 'accumulative', icon: 'add_circle' },
];

const resetCycleOptions: Array<{
  label: string;
  value: 'none' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
}> = [
  { label: 'Sin reinicio', value: 'none' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Trimestral', value: 'quarterly' },
  { label: 'Semestral', value: 'semiannual' },
  { label: 'Anual', value: 'annual' },
];

function onJarTypeChange(idx: number) {
  const j = jarElements.value[idx];
  if (!j) return;
  if (j.type === 'percent') {
    // initialize percent if missing
    j.percent = Math.max(0, Math.min(100, Math.round(Number(j.percent ?? 0))));
    j.fixedAmount = undefined;
  } else {
    // fixed
    j.fixedAmount = Math.max(0, Number(Number(j.fixedAmount ?? 0).toFixed(2)));
  }
}

function onJarNameBlur(idx: number) {
  const jar = jarElements.value[idx];
  if (!jar) return;
  jar.name = (jar.name || '').trim();
  if (!jar.name) {
    jar.name = `Cántaro ${idx + 1}`;
  }
}

function onJarColorClear(idx: number) {
  const j = jarElements.value[idx];
  if (!j) return;
  j.color = undefined;
}

// Provide a compact set of deterministic, high-contrast color suggestions for the given name
function suggestedJarColors(name: string): string[] {
  const base = hashString(name);
  // Create 6 hues spaced around the wheel, with fixed S/L tuned for contrast
  const hues = [0, 40, 80, 160, 200, 280];
  return hues.map((offset) => {
    const h = Math.floor((base + offset) % 360);
    const s = 72; // strong saturation
    const l = 46; // darker for better contrast on white
    return hslToHex(h, s, l);
  });
}

function onPickSuggestedColor(idx: number, color: string) {
  const j = jarElements.value[idx];
  if (!j) return;
  j.color = color;
}

function onJarColorRandom(idx: number) {
  const j = jarElements.value[idx];
  if (!j) return;
  // Random hue, fixed saturation/lightness for good contrast
  const h = Math.floor(Math.random() * 360);
  const s = 78; // vivid
  const l = 40; // slightly dark for contrast
  j.color = hslToHex(h, s, l);
}

function createJar() {
  const remaining = Math.max(0, 100 - totalPercentage.value);
  const nextIndex = jarElements.value.length + 1;
  jarElements.value.push({
    uid: genUid(),
    name: `Cántaro ${nextIndex}`,
    percent: remaining,
    type: 'percent',
    categories: [],
    active: true,
  });
}

function deleteJar(idx: number) {
  const jar = jarElements.value[idx];
  if (!jar) return;
  const hasCats = (jar.categories?.length || 0) > 0;
  const proceed = () => {
    // Devolver categorías al árbol antes de eliminar
    const cats = [...(jar.categories || [])];
    for (const c of cats) {
      removeCategoryFromJar(idx, c.id);
    }
    jarElements.value.splice(idx, 1);
    $q.notify({ type: 'positive', message: 'Cántaro eliminado' });
  };
  if (!hasCats) return proceed();
  $q.dialog({
    title: 'Eliminar cántaro',
    message:
      'Este cántaro tiene categorías asignadas. Se devolverán al árbol de categorías. ¿Deseas continuar?',
    cancel: true,
    persistent: true,
  }).onOk(proceed);
}

// Nota: función de plantilla por defecto eliminada por no usarse

function openTemplatesDialog() {
  showTemplates.value = true;
  if (templates.value.length === 0) void loadTemplates();
}

async function loadTemplates() {
  loadingTemplates.value = true;
  try {
    const res = await api.get('/jar-templates', { params: { active: 1, per_page: 100 } });
    const top = res.data as unknown;
    const pickArray = (d: unknown): unknown[] => {
      if (Array.isArray(d)) return d as unknown[];
      if (d && typeof d === 'object') {
        const o = d as Record<string, unknown>;
        if (Array.isArray(o.data)) return o.data as unknown[];
        const oData = (o as { data?: unknown }).data;
        if (oData && typeof oData === 'object') {
          const innerData = (oData as { data?: unknown }).data;
          if (Array.isArray(innerData)) return innerData as unknown[];
          // Also check common keys inside nested data
          const innerKeys = ['templates', 'items', 'results', 'records', 'rows'] as const;
          const o2 = oData as Record<string, unknown>;
          for (const k of innerKeys) {
            const v2 = o2[k];
            if (Array.isArray(v2)) return v2 as unknown[];
          }
        }
        const keys = ['templates', 'items', 'results', 'records', 'rows'] as const;
        for (const k of keys) {
          const v = o[k];
          if (Array.isArray(v)) return v as unknown[];
        }
      }
      return [] as unknown[];
    };
    const arr = pickArray(top) as JarTemplate[];
    templates.value = Array.isArray(arr) ? arr : [];
    console.log('[Jars][Templates] loaded', templates.value.length);
  } catch (e) {
    templates.value = [];
    $q.notify({ type: 'warning', message: 'No se pudieron cargar plantillas' });
    console.warn('loadTemplates error', e);
  } finally {
    loadingTemplates.value = false;
  }
}

function confirmApplyTemplate(tpl: JarTemplate) {
  $q.dialog({
    title: 'Aplicar plantilla',
    message:
      'Esto eliminará la configuración actual de cántaros y aplicará la plantilla seleccionada. ¿Deseas continuar?',
    cancel: true,
    persistent: true,
  }).onOk(() => applyTemplate(tpl));
}

function applyTemplate(tpl: JarTemplate) {
  // Construir nuevos jars desde la plantilla (pre-cálculo para validar)
  const source = Array.isArray(tpl.jars) ? tpl.jars.slice() : [];
  const sorted = source.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const incoming = sorted.map((j) => {
    const t: 'percent' | 'fixed' = j.type === 'fixed' ? 'fixed' : 'percent';
    const percent = t === 'percent' && j.percent != null ? Number(j.percent) : 0;
    const jar = mkJar(j.name, percent, t);
    if (t === 'fixed') jar.fixedAmount = Number(j.fixed_amount ?? 0);
    jar.color = j.color || undefined;
    return jar;
  });

  if (incoming.length === 0) {
    $q.notify({ type: 'warning', message: 'La plantilla seleccionada no define jarras' });
    return;
  }

  // Devolver categorías de todos los jars actuales al árbol antes de reemplazar
  for (let i = 0; i < jarElements.value.length; i++) {
    const jar = jarElements.value[i];
    if (!jar) continue;
    while (true) {
      const first = jar.categories?.[0];
      if (!first) break;
      removeCategoryFromJar(i, first.id);
    }
  }

  // Reemplazar con los jars de la plantilla
  jarElements.value = incoming;
  showTemplates.value = false;
  $q.notify({ type: 'positive', message: `Plantilla "${tpl.name}" aplicada` });
}

// jarFillGradient removed (unused)

async function loadJarSettings() {
  try {
    const res = await api.get('/jars/settings');
    const data = res.data?.data || {};
    // Normalize global_start_date: backend may return ISO datetime ("2025-11-01T00:00:00.000000Z")
    // but <q-input type="date"> needs "YYYY-MM-DD"
    let gsd = data.global_start_date ?? null;
    if (gsd && typeof gsd === 'string' && gsd.includes('T')) {
      gsd = gsd.slice(0, 10);
    }
    jarSettings.value = {
      id: data.id,
      user_id: data.user_id,
      global_start_date: gsd,
      default_allow_negative: data.default_allow_negative ?? false,
      default_negative_limit: data.default_negative_limit ?? null,
      default_reset_cycle: data.default_reset_cycle ?? 'none',
      default_reset_cycle_day: data.default_reset_cycle_day ?? 1,
      leverage_jar_id: data.leverage_jar_id ?? null,
    };
    jarSettingsLoaded.value = true;
    await loadMonthlyLeverageSetting(currentMonth.value);
  } catch (e) {
    console.warn('[JarSettings] Error loading settings:', e);
    jarSettingsLoaded.value = false;
  }
}

async function loadMonthlyLeverageSetting(month: string) {
  try {
    const res = await api.get('/jars/settings/monthly', { params: { month } });
    const data = res.data?.data || {};
    monthlyLeverageJarId.value = data.leverage_jar_id ?? null;
    useRealIncome.value = data.use_real_income ?? false;
  } catch (e) {
    console.warn('[JarSettings] Error loading monthly leverage:', e);
    monthlyLeverageJarId.value = null;
    useRealIncome.value = false;
  }
}

async function saveJarSettings() {
  if (!jarSettingsLoaded.value) return;
  const leverageValue =
    jarSettings.value.leverage_jar_id === undefined
      ? null
      : jarSettings.value.leverage_jar_id;
  await api.put('/jars/settings', {
    global_start_date: jarSettings.value.global_start_date || null,
    default_allow_negative: jarSettings.value.default_allow_negative ?? false,
    default_negative_limit: jarSettings.value.default_negative_limit ?? null,
    default_reset_cycle: jarSettings.value.default_reset_cycle ?? 'none',
    default_reset_cycle_day: jarSettings.value.default_reset_cycle_day ?? 1,
    leverage_jar_id: leverageValue ?? null,
  });

  await api.put('/jars/settings/monthly', {
    month: currentMonth.value,
    leverage_jar_id: monthlyLeverageJarId.value ?? null,
    use_real_income: useRealIncome.value ?? false,
  });
}

async function loadTheoreticalSavings() {
  try {
    const balanceDate = `${currentMonth.value}-01`;
    const res = await api.get('/jars/theoretical-savings', { params: { date: balanceDate } });
    const data = res.data?.data || {};
    theoreticalSavings.value = {
      total_unused: Number(data.total_unused || 0),
      total_savings_accounts: Number(data.total_savings_accounts || 0),
      total_theoretical: Number(data.total_theoretical || 0),
    };
  } catch (err) {
    console.warn('[TheoreticalSavings] Error loading data:', err);
    theoreticalSavings.value = {
      total_unused: 0,
      total_savings_accounts: 0,
      total_theoretical: 0,
    };
  }
}

async function loadJarData() {
  try {
    // Backend identifica usuario por token, sin necesidad de userId en URL
    console.log('[JarData] Loading jars...');
    console.log(
      '[JarData] Auth token:',
      auth.token ? `Present (${auth.token.substring(0, 20)}...)` : 'MISSING!'
    );
    console.log('[JarData] Auth logged in:', auth.isLoggedIn);

    const res = await api.get('/jars', { params: { per_page: 100 } });
    console.log('[JarData] Response received:', res.data);

    // Manejar estructura: { status, code, data: [...] } o { status, code, data: { data: [...], ... } }
    type AnyObj = { [k: string]: unknown };
    const apiResponse = res.data as AnyObj;

    // Extraer el array de jars de la respuesta paginada
    let arr: unknown[] = [];

    // Si tiene estructura { data: [...] } (array directo en data)
    if (Array.isArray(apiResponse.data)) {
      arr = apiResponse.data;
      console.log('[JarData] Extracted from direct data array:', arr.length, 'jars');
    }
    // Si tiene estructura { data: { data: [...] } } (paginada con wrapper)
    else if (apiResponse.data && typeof apiResponse.data === 'object') {
      const paginatedData = apiResponse.data as AnyObj;
      if (Array.isArray(paginatedData.data)) {
        arr = paginatedData.data;
        console.log('[JarData] Extracted from nested data.data:', arr.length, 'jars');
      }
    }
    // Si es un array directo (respuesta raíz)
    else if (Array.isArray(apiResponse)) {
      arr = apiResponse;
      console.log('[JarData] Extracted from direct response array:', arr.length, 'jars');
    }

    const rawList: JarAPI[] = (arr as JarAPI[]).slice();
    rawList.sort((a, b) => {
      const aAct =
        (a as { is_active?: unknown; active?: unknown }).is_active === true ||
        (a as { is_active?: unknown; active?: unknown }).active === true ||
        Number((a as { is_active?: unknown; active?: unknown }).is_active) === 1 ||
        Number((a as { is_active?: unknown; active?: unknown }).active) === 1;
      const bAct =
        (b as { is_active?: unknown; active?: unknown }).is_active === true ||
        (b as { is_active?: unknown; active?: unknown }).active === true ||
        Number((b as { is_active?: unknown; active?: unknown }).is_active) === 1 ||
        Number((b as { is_active?: unknown; active?: unknown }).active) === 1;
      if (aAct !== bAct) return bAct ? 1 : -1; // activos primero
      const soA = Number(a.sort_order ?? Number.MAX_SAFE_INTEGER);
      const soB = Number(b.sort_order ?? Number.MAX_SAFE_INTEGER);
      if (soA !== soB) return soA - soB;
      return Number(a.id ?? 0) - Number(b.id ?? 0);
    });
    const mapped: Jar[] = rawList.map((r, i) => {
      const idVal = (r as { id?: number }).id;
      const t: 'percent' | 'fixed' = r.type === 'fixed' ? 'fixed' : 'percent';
      const j = mkJar(
        r.name || `Cántaro ${i + 1}`,
        Math.max(0, Math.min(100, Number(r.percent ?? 0))),
        t,
        idVal
      );
      if (t === 'fixed') j.fixedAmount = Number(r.fixed_amount ?? r.amount ?? 0);
      if (r.color) j.color = r.color || undefined;

      // Set refresh_mode from backend, default to 'reset'
      j.refresh_mode = r.refresh_mode === 'accumulative' ? 'accumulative' : 'reset';

      j.allow_negative_balance = Boolean(r.allow_negative_balance ?? false);
      j.negative_limit = r.negative_limit ?? null;
      j.start_date = r.start_date ?? null;
      j.use_global_start_date = r.use_global_start_date ?? true;
      j.reset_cycle = (r.reset_cycle as Jar['reset_cycle']) ?? 'none';
      j.reset_cycle_day = r.reset_cycle_day ?? 1;
      j.target_amount = r.target_amount ?? null;
      j.leverage_from_jar_id = (r as { leverage_from_jar_id?: number | null }).leverage_from_jar_id ?? null;
      j.collapsed = true;

      const act = (r as { is_active?: unknown }).is_active ?? (r as { active?: unknown }).active;
      if (act != null) j.active = Number(act) === 1 || act === true;
      j.categories = Array.isArray(r.categories)
        ? r.categories.map((c) => ({
            id: String(c.id),
            label: String(c.label ?? c.name ?? 'Categoría'),
          }))
        : [];
      return j;
    });
    console.log('[JarData] Mapped jars:', mapped.length, 'jars');
    console.log(
      '[JarData] jar list:',
      mapped.map((j) => ({ id: j.id, name: j.name }))
    );

    // Track server IDs to detect deletions on save
    serverJarIds.value = new Set<number>(
      rawList
        .map((r) => (typeof r.id === 'number' ? r.id : undefined))
        .filter((x): x is number => typeof x === 'number')
    );
    // Sin datos de muestra: si no hay, queda vacío
    jarElements.value = mapped;
    console.log('[JarData] jarElements.value assigned, length:', jarElements.value.length);
    console.log(
      '[JarData] Load complete - balances will be loaded on-demand when user interacts with jars'
    );

    // Load balances for visible jars for the selected month
    const idsToLoad = mapped.map((j) => j.id).filter((id): id is number => typeof id === 'number');
    await Promise.all(idsToLoad.map((id) => loadJarBalance(id)));
  } catch (e) {
    // Sin demo ni notificación intrusiva
    jarElements.value = [];
    console.error('[JarData] Error loading jars:', e);
    if (e instanceof Error) {
      console.error('[JarData] Error message:', e.message);
      console.error('[JarData] Full error:', JSON.stringify(e));
    }
  }
}

async function loadCategoriesTree() {
  // Cargar árbol real de categorías del usuario (soporta varias formas de payload)
  try {
    type RemoteNode = {
      id: string | number;
      name?: string;
      label?: string;
      type?: 'folder' | 'category';
      icon?: string | null;
      children?: RemoteNode[];
    };
    const res = await api.get('/categories/tree', {
      params: { per_page: 1000 },
    });
    const data = (res.data as { data?: unknown }).data;
    const raw: RemoteNode[] = Array.isArray(data)
      ? (data as RemoteNode[])
      : data && typeof data === 'object' && Array.isArray((data as { nodes?: unknown }).nodes)
      ? ((data as { nodes?: unknown }).nodes as RemoteNode[])
      : (res.data as RemoteNode[]) || [];
    const mapNodes = (nodes: RemoteNode[]): CatNodeInput[] =>
      nodes.map((n) => {
        const kids = n.children ? mapNodes(n.children) : [];
        const type: 'folder' | 'category' = n.type
          ? n.type
          : kids.length > 0
          ? 'folder'
          : 'category';
        return {
          id: n.id,
          label: String(n.label ?? n.name ?? ''),
          type,
          icon: n.icon || null,
          children: kids,
        };
      });
    setCategories(raw.length ? mapNodes(raw) : []);
  } catch (e) {
    $q.notify({ type: 'warning', message: 'No se pudieron cargar tus categorías' });
    setCategories([]);
    console.warn('loadCategoriesTree error', e);
  }
}

/**
 * Maneja la actualización del ingreso esperado desde el panel
 */
async function handleIncomeUpdated() {
  console.log('[Jars] Income updated, refreshing jar data...');

  const month = currentMonth.value;
  const balanceDate = `${month}-01`;

  // Refrescar ingresos calculados
  await fetchCalculatedIncome(month);

  // Refrescar todos los balances de jars que ya fueron cargados
  for (const jarId of loadedBalances.value) {
    const balanceComposable = jarBalances.value[jarId];
    if (balanceComposable) {
      await balanceComposable.cargarTodo(balanceDate);
    }
  }

  await loadTheoreticalSavings();
}

function setCategories(nodes: CatNodeInput[], updateMaster = true) {
  // Carga el árbol en el componente y construye un mapa rápido
  // 1) Deduplicar por id, preservando el primer nodo y fusionando hijos para carpetas
  const dedupeById = (arr: CatNodeInput[]): CatNodeInput[] => {
    const seen: Record<string, CatNodeInput> = {};
    const out: CatNodeInput[] = [];
    for (const n of arr) {
      const key = String(n.id);
      const existing = seen[key];
      if (!existing) {
        // clone shallow; normalize children to array
        const clone: CatNodeInput = {
          id: n.id,
          label: n.label,
          type:
            (n.type as 'folder' | 'category') ||
            (n.children && n.children.length ? 'folder' : 'category'),
          icon: n.icon ?? null,
          children: n.children ? dedupeById(n.children) : [],
        };
        seen[key] = clone;
        out.push(clone);
      } else {
        // merge: if any side has children, merge and dedupe
        const mergedKids = [
          ...((existing.children as CatNodeInput[]) || []),
          ...(n.children ? n.children : []),
        ];
        existing.children = dedupeById(mergedKids);
        // keep label/icon from first occurrence
      }
    }
    return out;
  };
  const safeNodes = Array.isArray(nodes) ? dedupeById(nodes) : [];
  categoriesPropNodes.value = safeNodes;
  const map: Record<string, CatInfo> = {};
  const master: Record<string, CatInfo> = updateMaster ? {} : { ...categoriesMasterMap.value };
  const initialVisible = new Set<string>();
  const collectLeafIds = (arr: CatNodeInput[], acc: string[] = []) => {
    for (const n of arr) {
      const isFolder = !!(n.children && n.children.length);
      if (isFolder && n.children) collectLeafIds(n.children, acc);
      if (!isFolder) acc.push(String(n.id));
    }
    return acc;
  };
  const walk = (arr: CatNodeInput[], parentId?: string) => {
    for (let idx = 0; idx < arr.length; idx++) {
      const n = arr[idx]!;
      const type: 'folder' | 'category' = n.type
        ? n.type
        : n.children && n.children.length
        ? 'folder'
        : 'category';
      const info: CatInfo = {
        id: String(n.id),
        label: String(n.label),
        type,
        children: type === 'folder' ? collectLeafIds(n.children || []) : undefined,
        parent: parentId,
        order: idx,
      };
      map[String(n.id)] = info;
      if (updateMaster) master[String(n.id)] = info;
      if (type === 'folder') initialVisible.add(String(n.id));
      if (n.children?.length) walk(n.children, String(n.id));
    }
  };
  walk(safeNodes);
  categoriesMap.value = map;
  if (updateMaster) categoriesMasterMap.value = master;
  visibleFolders.value = initialVisible;
}

// Elimina del árbol las categorías que ya están asignadas a algún cántaro y
// poda carpetas vacías resultantes, preservando el orden original.
function filterOutAssignedNodes(nodes: CatNodeInput[], assigned: Set<string>): CatNodeInput[] {
  const recur = (arr: CatNodeInput[]): CatNodeInput[] => {
    const out: CatNodeInput[] = [];
    for (const n of arr) {
      const isFolder = !!(n.children && n.children.length);
      if (isFolder) {
        const kids = recur(n.children || []);
        if (kids.length > 0) {
          out.push({
            id: n.id,
            label: n.label,
            type: (n.type as 'folder' | 'category') || 'folder',
            icon: n.icon ?? null,
            children: kids,
          });
        }
      } else {
        if (!assigned.has(String(n.id))) {
          // omitimos 'children' para respetar exactOptionalPropertyTypes
          out.push({
            id: n.id,
            label: n.label,
            type: (n.type as 'folder' | 'category') || 'category',
            icon: n.icon ?? null,
          });
        }
      }
    }
    return out;
  };
  return recur(nodes);
}

/**
 * Carga balance para un jar específico (se llama bajo demanda cuando user interactúa con el jar)
 */
async function loadJarBalance(jarId: number) {
  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }

  try {
    const balanceComposable = jarBalances.value[jarId];
    const balanceDate = `${currentMonth.value}-01`;
    await balanceComposable.cargarTodo(balanceDate);
    loadedBalances.value.add(jarId);
  } catch (err) {
    console.error(`Error loading balance for jar ${jarId}:`, err);
  }
}

/**
 * Abre modal de ajuste para un jar
 */
async function openAdjustmentModal(jarId: number) {
  currentJarAdjustment.value = jarId;

  // Ensure composable exists and load fresh balance + history from backend BEFORE opening modal
  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }

  const balanceComposable = jarBalances.value[jarId];
  try {
    const balanceDate = `${currentMonth.value}-01`;
    console.log('[Jars][AdjustModal] Loading balance', { jarId, balanceDate });
    await balanceComposable.cargarTodo(balanceDate);
    console.log('[Jars][AdjustModal] Balance loaded', {
      jarId,
      balance: balanceComposable.balance?.value,
    });
    if (!balanceComposable.balance?.value) {
      console.warn('[Jars][AdjustModal] Balance missing after load', {
        jarId,
        error: balanceComposable.error?.value,
      });
    }
    loadedBalances.value.add(jarId);
  } catch (err) {
    console.error(`Error cargando balance para modal ajuste (jar ${jarId}):`, err);
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error cargando balance',
    });
  }

  // Open modal AFTER data is loaded so form initializes with fresh values
  showAdjustmentModal.value = true;
}

async function openWithdrawalModal(jarId: number) {
  currentJarWithdrawal.value = jarId;
  withdrawalForm.value = {
    amount: 0,
    description: '',
    date: new Date().toISOString().slice(0, 10),
  };

  // Open modal immediately; load data asynchronously
  showWithdrawalModal.value = true;

  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }

  const balanceComposable = jarBalances.value[jarId];
  try {
    const balanceDate = `${currentMonth.value}-01`;
    await balanceComposable.cargarBalance(balanceDate);
    loadedBalances.value.add(jarId);
  } catch (err) {
    console.error(`Error cargando balance para uso (jar ${jarId}):`, err);
  }
}

async function applyLeverageNow(jarId: number) {
  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }
  try {
    const balanceDate = `${currentMonth.value}-01`;
    const refreshBalance = async (id: number) => {
      if (!jarBalances.value[id]) {
        jarBalances.value[id] = useJarBalance(id);
      }
      await jarBalances.value[id].cargarBalance(balanceDate);
      loadedBalances.value.add(id);
    };
    await refreshBalance(jarId);
    const balance = jarBalances.value[jarId].balance?.value || null;
    const applied = balance?.auto_transfer_applied || null;
    const jar = jarElements.value.find((j) => j.id === jarId) || null;
    const sourceId = jar?.leverage_from_jar_id ?? jarSettings.value.leverage_jar_id ?? null;
    const sourceName = sourceId
      ? jarElements.value.find((j) => j.id === sourceId)?.name || `#${sourceId}`
      : null;

    if (applied?.from_jar_id) {
      await refreshBalance(applied.from_jar_id);
      const appliedSource = jarElements.value.find((j) => j.id === applied.from_jar_id)?.name ||
        `#${applied.from_jar_id}`;
      $q.notify({
        type: 'positive',
        message: `Apalancado desde ${appliedSource} (${formatCurrency(applied.amount)})`,
      });
      return;
    }

    if (!sourceId) {
      $q.notify({
        type: 'warning',
        message: 'Configura “Apalancamiento desde” para este cántaro.',
      });
      return;
    }

    if (sourceId === jarId) {
      $q.notify({
        type: 'warning',
        message: 'El cántaro origen no puede ser el mismo. Elige otro.',
      });
      return;
    }

    const res = await api.post(`/jars/${jarId}/leverage`, { date: balanceDate });
    const result = res.data?.data || {};
    const reason = String(result.reason || 'unknown');
    const transfer = result.transfer || null;

    await refreshBalance(jarId);
    if (sourceId) {
      await refreshBalance(sourceId);
    }

    if (transfer?.from_jar_id) {
      const appliedSource = jarElements.value.find((j) => j.id === transfer.from_jar_id)?.name ||
        `#${transfer.from_jar_id}`;
      $q.notify({
        type: 'positive',
        message: `Apalancado desde ${appliedSource} (${formatCurrency(transfer.amount)})`,
      });
      return;
    }

    if (reason === 'no_source') {
      $q.notify({ type: 'warning', message: 'Configura “Apalancamiento desde” para este cántaro.' });
      return;
    }
    if (reason === 'same_source') {
      $q.notify({ type: 'warning', message: 'El cántaro origen no puede ser el mismo.' });
      return;
    }
    if (reason === 'not_exceeded') {
      const balValue = jarBalances.value[jarId].balance?.value?.balance ?? 0;
      $q.notify({
        type: 'info',
        message: `Sin excedente. El cántaro está en ${formatCurrency(balValue)}.`,
      });
      return;
    }
    if (reason === 'already_applied') {
      $q.notify({ type: 'info', message: 'El apalancamiento ya fue aplicado en este periodo.' });
      return;
    }
    if (reason === 'insufficient_source') {
      const sourceLabel = sourceName || 'origen';
      $q.notify({
        type: 'info',
        message: `No se pudo apalancar desde ${sourceLabel}. Verifica saldo disponible en el origen.`,
      });
      return;
    }

    $q.notify({ type: 'info', message: 'No se pudo apalancar (sin cambios).' });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al apalancar',
    });
  }
}

async function handleSaveAdjustment(data: { valorObjetivo: number; descripcion?: string }) {
  if (currentJarAdjustment.value === null) return;
  const jarId = currentJarAdjustment.value;

  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }

  const balanceComposable = jarBalances.value[jarId];
  if (!balanceComposable) return;

  try {
    const balanceDate = `${currentMonth.value}-01`;
    await balanceComposable.crearAjuste({ ...data, date: balanceDate });

    await balanceComposable.cargarBalance(balanceDate);
    loadedBalances.value.add(jarId);
    console.log('[Jars][AdjustModal] Balance reloaded', {
      jarId: currentJarAdjustment.value,
      balance: balanceComposable.balance?.value,
    });

    $q.notify({
      type: 'positive',
      message: 'Ajuste guardado exitosamente',
    });
    showAdjustmentModal.value = false;
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al guardar ajuste',
    });
  }
}

async function handleClearAdjustments() {
  if (currentJarAdjustment.value === null) return;
  const jarId = currentJarAdjustment.value;

  const confirmed = await new Promise<boolean>((resolve) => {
    $q.dialog({
      title: 'Borrar ajustes del mes',
      message: 'Esto eliminará los ajustes del mes actual para este cántaro. ¿Continuar?',
      cancel: true,
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false));
  });

  if (!confirmed) return;

  if (!jarBalances.value[jarId]) {
    jarBalances.value[jarId] = useJarBalance(jarId);
  }

  const balanceComposable = jarBalances.value[jarId];
  if (!balanceComposable) return;

  try {
    const balanceDate = `${currentMonth.value}-01`;
    await api.delete(`/jars/${jarId}/adjustments`, { params: { date: balanceDate } });

    await balanceComposable.cargarTodo(balanceDate);
    loadedBalances.value.add(jarId);

    $q.notify({
      type: 'positive',
      message: 'Ajustes del mes eliminados',
    });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al borrar ajustes',
    });
  }
}

async function handleSaveWithdrawal() {
  if (currentJarWithdrawal.value === null) return;
  const jarId = currentJarWithdrawal.value;

  const amount = Number(withdrawalForm.value.amount || 0);
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    $q.notify({ type: 'warning', message: 'Ingresa un monto válido' });
    return;
  }

  try {
    await api.post(`/jars/${jarId}/withdraw`, {
      amount,
      description: withdrawalForm.value.description || null,
      date: withdrawalForm.value.date || null,
    });

    const balanceComposable = jarBalances.value[jarId];
    if (balanceComposable) {
      const balanceDate = `${currentMonth.value}-01`;
      await balanceComposable.cargarBalance(balanceDate);
    }

    $q.notify({ type: 'positive', message: 'Uso registrado exitosamente' });
    showWithdrawalModal.value = false;
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err instanceof Error ? err.message : 'Error al registrar uso',
    });
  }
}


/**
 * Resetea el ajuste de un jar con confirmación
 */
function handleResetAdjustment(jarId: number) {
  const balanceComposable = jarBalances.value[jarId];
  if (!balanceComposable) return;

  $q.dialog({
    title: 'Confirmar reset',
    message: '¿Estás seguro de resetear el ajuste de este cántaro?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      balanceComposable
        .resetearAjuste()
        .then(() => {
          $q.notify({
            type: 'positive',
            message: 'Ajuste reseteado',
          });
        })
        .catch((err) => {
          $q.notify({
            type: 'negative',
            message: err instanceof Error ? err.message : 'Error al resetear',
          });
        });
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: err instanceof Error ? err.message : 'Error al resetear',
      });
    }
  });
}

function onJarDragOver(idx: number) {
  log('Jar drag over', { idx, jarName: jarElements.value[idx]?.name });
  jarDropOverIndex.value = idx;
}
function onJarDragLeave(idx: number) {
  log('Jar drag leave', { idx, jarName: jarElements.value[idx]?.name });
  if (jarDropOverIndex.value === idx) jarDropOverIndex.value = null;
}

// Asegura que toda la cadena de carpetas hasta root esté visible y en su posición original
function ensureFolderChainVisible(folderId: string) {
  const folder = categoriesMap.value[folderId] || categoriesMasterMap.value[folderId];
  if (!folder || folder.type !== 'folder') return;
  const parentId = folder.parent || 'root';
  if (folder.parent) ensureFolderChainVisible(folder.parent);
  if (!visibleFolders.value.has(folderId)) {
    const atIndex = typeof folder.order === 'number' ? folder.order : undefined;
    categoriesTreeRef.value?.addCategoryToParent(
      { id: folder.id, label: folder.label, type: 'folder', order: folder.order },
      parentId,
      atIndex
    );
    visibleFolders.value.add(folderId);
    // Ensure categoriesMap knows this folder
    if (!categoriesMap.value[folderId]) {
      categoriesMap.value[folderId] = {
        id: folder.id,
        label: folder.label,
        type: 'folder',
        parent: folder.parent,
        order: folder.order,
        children: folder.children,
      };
    }
  }
}
function onJarDrop(idx: number, ev: DragEvent) {
  log('Jar drop', { idx, jarName: jarElements.value[idx]?.name });
  jarDropOverIndex.value = null;
  // Try JSON first for richer payload
  let payload: { id?: string; label?: string; type?: 'folder' | 'category' } | null = null;
  const json = ev.dataTransfer?.getData('application/json');
  if (json) {
    try {
      const obj = JSON.parse(json);
      payload = obj && typeof obj === 'object' ? obj : null;
    } catch {
      payload = null;
    }
  }
  // Fallback to text/plain which should carry the id
  const text = ev.dataTransfer?.getData('text/plain') || '';
  // In some cases, nested icon text can leak into the payload, e.g., 'open_with "Label"'
  // If that happens, try to extract quoted label and then map back to id by label
  let id = '';
  if (payload?.id) {
    id = String(payload.id);
  } else if (text) {
    // If text contains spaces and quotes, attempt to parse id as the first token matching a known id
    const parts = text.trim().split(/\s+/);
    // Prefer exact match on known ids
    const matchId = parts.find((p) => categoriesMap.value[p]);
    if (matchId) id = matchId;
  }
  // If still no id but we have a label, try to resolve by unique label
  if (!id && payload && payload.label) {
    const lbl = payload.label;
    let byLabel = Object.values(categoriesMap.value).find(
      (n) => n.type === 'category' && n.label === lbl
    );
    if (!byLabel) {
      byLabel = Object.values(categoriesMasterMap.value).find(
        (n) => n.type === 'category' && n.label === lbl
      );
    }
    if (byLabel) id = byLabel.id;
  }
  if (!id) {
    $q.notify({ type: 'warning', message: 'Elemento no válido' });
    log('Drop invalid item id', text || '(empty)', payload);
    return;
  }
  const info = categoriesMap.value[id] || categoriesMasterMap.value[id];
  if (!info) {
    $q.notify({ type: 'warning', message: 'Elemento no válido' });
    log('Drop id not found in categories maps', { id, payload, text });
    return;
  }
  const jar = jarElements.value[idx];
  if (!jar) return;
  jar.categories = jar.categories || [];

  // removed unused helper isAssignedAnywhere

  const addCategoryToJar = (
    catId: string,
    label: string,
    { forceMove }: { forceMove: boolean }
  ) => {
    // Encontrar propietario actual
    let owner: Jar | null = null;
    for (const j of jarElements.value) {
      if ((j.categories || []).some((c) => c.id === catId)) {
        owner = j;
        break;
      }
    }
    if (owner && owner !== jar) {
      if (!forceMove) return; // no mover en drop de carpeta
      owner.categories = (owner.categories || []).filter((c) => c.id !== catId);
    }
    if (!(jar.categories || []).some((c) => c.id === catId)) {
      (jar.categories || (jar.categories = [])).push({ id: catId, label });
    }
    categoriesTreeRef.value?.removeNode(catId);
  };

  if (info.type === 'category') {
    log('Tree drop category', {
      catId: info.id,
      label: info.label,
      toIdx: idx,
      toName: jarElements.value[idx]?.name,
      fromIdx: jarElements.value.findIndex((j) =>
        (j.categories || []).some((c) => c.id === info.id)
      ),
    });
    addCategoryToJar(info.id, info.label, { forceMove: true });
  } else {
    // Carpeta: añadir solo hojas no asignadas aún; no mover las ya asignadas a otro cántaro
    const leafIds = info.children || [];
    if (leafIds.length === 0) return;
    const isAssigned = (catId: string) =>
      jarElements.value.some((j) => (j.categories || []).some((c) => c.id === catId));
    leafIds.forEach((leafId) => {
      const leaf = categoriesMap.value[leafId] || categoriesMasterMap.value[leafId];
      if (!leaf || leaf.type !== 'category') return;
      if (isAssigned(leaf.id)) return; // ya asignada, no mover
      log('Tree drop folder item (unassigned only)', {
        catId: leaf.id,
        label: leaf.label,
        toIdx: idx,
        toName: jarElements.value[idx]?.name,
      });
      addCategoryToJar(leaf.id, leaf.label, { forceMove: false });
    });
    // Si todas las hojas quedan asignadas, ocultar la carpeta; si no, mantenerla
    const allAssigned = leafIds.every((leafId) =>
      jarElements.value.some((j) => (j.categories || []).some((c) => c.id === leafId))
    );
    if (allAssigned) {
      categoriesTreeRef.value?.removeNode(info.id);
      visibleFolders.value.delete(info.id);
    }
  }
}

function removeCategoryFromJar(idx: number, catId: string) {
  log('Remove category from jar', {
    idx,
    jarName: jarElements.value[idx]?.name,
    catId,
  });
  const jar = jarElements.value[idx];
  if (!jar) return;
  jar.categories = (jar.categories || []).filter((c) => c.id !== catId);
  // Reincorporar al árbol (bajo root) para que pueda ser usado en otro cántaro
  const catInfo = categoriesMap.value[catId] || categoriesMasterMap.value[catId];
  if (catInfo && catInfo.type === 'category') {
    // Asegurar que la cadena de carpetas original exista; si no, recrearla en su posición
    const parentId = catInfo.parent || 'root';
    if (catInfo.parent) ensureFolderChainVisible(catInfo.parent);
    const atIndex = typeof catInfo.order === 'number' ? catInfo.order : undefined;
    log('Re-adding category to tree at original position', {
      id: catInfo.id,
      label: catInfo.label,
      parentId,
      atIndex,
    });
    categoriesTreeRef.value?.addCategoryToParent(
      { id: catInfo.id, label: catInfo.label, type: 'category', order: catInfo.order },
      parentId,
      atIndex
    );
    // Update categoriesMap to include the reinserted category metadata
    categoriesMap.value[catInfo.id] = {
      id: catInfo.id,
      label: catInfo.label,
      type: 'category',
      parent: catInfo.parent,
      order: catInfo.order,
    };
  }
}

// Prevent duplicates when moving between jars via Draggable
function onCategoryMove(evt: DragMoveEvent): boolean {
  const dragged = evt?.draggedContext?.element;
  const toList = evt?.relatedContext?.list;
  const fromList = evt?.draggedContext?.list;
  if (!dragged || !toList || !fromList) {
    log('Move check missing context', { dragged, hasTo: !!toList, hasFrom: !!fromList });
    return true;
  }
  // Identify source/target jars by list reference
  const ownerIdx = jarElements.value.findIndex((j) => (j.categories || []) === fromList);
  const targetIdx = jarElements.value.findIndex((j) => (j.categories || []) === toList);
  log('Moving', {
    cat: dragged,
    ownerIdx,
    ownerName: jarElements.value[ownerIdx]?.name,
    targetIdx,
    targetName: jarElements.value[targetIdx]?.name,
  });
  // Allow the move and handle de-duplication in onCategoryChange to avoid false negatives
  invalidCategoryDropIndex.value = null;
  return true;
}

// Reconcile state after a drag between jars to ensure single ownership
function onCategoryChange(evt: DragChangeEvent) {
  log('Change event', evt);
  const added = evt.added?.element;
  const toList = evt.to;
  if (!added || !toList) return;
  // Find target jar by list reference
  const targetIdx = jarElements.value.findIndex((j) => (j.categories || []) === toList);
  log('Change applied', {
    added,
    targetIdx,
    targetName: jarElements.value[targetIdx]?.name,
  });
  if (targetIdx === -1) return;
  const targetJar = jarElements.value[targetIdx];
  if (!targetJar) return;
  // Deduplicate in target just in case vuedraggable inserted a clone
  const beforeLen = (targetJar.categories || []).length;
  targetJar.categories = (targetJar.categories || []).filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  );
  if ((targetJar.categories || []).length !== beforeLen) {
    log('Deduped target list', {
      targetIdx,
      removed: beforeLen - (targetJar.categories || []).length,
    });
  }
  // Remove the element from any other jar that still contains it
  for (let i = 0; i < jarElements.value.length; i++) {
    if (i === targetIdx) continue;
    const jar = jarElements.value[i];
    if (!jar) continue;
    const before = (jar.categories || []).length;
    jar.categories = (jar.categories || []).filter((c) => c.id !== added.id);
    if ((jar.categories || []).length !== before) {
      // removed from previous owner
      log('Removed from previous owner', { fromIdx: i, fromName: jar.name, catId: added.id });
    }
  }
}

// Extra debug for start event to inspect raw lists and element

// When dragging a chip between jars, encode full category info for robust drop handling
function onChipDragStart(cat: { id: string; label: string }, ev: DragEvent) {
  try {
    ev.dataTransfer?.setData(
      'application/json',
      JSON.stringify({
        id: cat.id,
        label: cat.label,
        type: 'category',
      })
    );
  } catch {
    /* no-op: best effort drag payload */
  }
  ev.dataTransfer?.setData('text/plain', cat.id);
}

async function saveChanges() {
  console.log('saveChanges called');
  if (!hasFixedJar.value && totalPercentage.value !== 100 && !isExactlyOnePercent100()) {
    $q.notify({ type: 'warning', message: 'El total debe sumar 100% antes de guardar' });
    return;
  }
  const userId = auth.user?.id;
  if (!userId) {
    $q.notify({ type: 'negative', message: 'Usuario no autenticado' });
    return;
  }
  saving.value = true;
  // Mostrar overlay de carga si el plugin Loading está disponible
  try {
    // guarded by optional chaining at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ($q as any).loading?.show?.({ message: 'Guardando cántaros…' });
  } catch {
    /* noop */
  }
  try {
    await saveJarSettings();

    // Construir payload con todos los jars (el backend sincronizará: crea, actualiza, elimina)
    const jarsPayload = jarElements.value.map((j, idx) => {
      const category_ids = (j.categories || []).map((c) => Number(c.id));

      const payload: Record<string, unknown> = {
        name: j.name,
        type: j.type,
        color: j.color,
        refresh_mode: j.refresh_mode || 'reset', // Incluir modo de refresco
        allow_negative_balance: j.allow_negative_balance ?? false,
        negative_limit: j.negative_limit ?? null,
        start_date: j.start_date ?? null,
        use_global_start_date: j.use_global_start_date ?? true,
        reset_cycle: j.reset_cycle ?? 'none',
        reset_cycle_day: j.reset_cycle_day ?? 1,
        target_amount: j.target_amount ?? null,
        leverage_from_jar_id: j.leverage_from_jar_id ?? null,
        sort_order: idx + 1,
        active: j.active ?? true,
        category_ids, // Categorías asignadas (drag-drop)
      };

      // Incluir ID si existe (para actualización)
      if (j.id) {
        payload.id = j.id;
      }

      // Incluir valores según tipo
      if (j.type === 'percent') {
        payload.percent = Number(j.percent || 0);
      } else if (j.type === 'fixed') {
        payload.fixed_amount = Number(j.fixedAmount || 0);
      }

      return payload;
    });

    // Enviar todo en una sola petición - el backend sincroniza todo
    const res = await api.post('/jars/bulk-sync', { jars: jarsPayload });

    // Actualizar IDs de jars nuevos desde la respuesta
    const returnedJars = res.data?.data?.jars || [];
    if (returnedJars.length === jarElements.value.length) {
      jarElements.value.forEach((j, i) => {
        if (!j.id && returnedJars[i]?.id) {
          j.id = returnedJars[i].id;
        }
      });
    }

    // Refrescar datos desde backend para sincronizar estado completo
    await loadJarData();
    $q.notify({ type: 'positive', message: 'Cántaros guardados correctamente' });
  } catch (e) {
    console.error('saveChanges error', e);
    const errorMsg =
      (e && typeof e === 'object' && 'response' in e &&
       e.response && typeof e.response === 'object' && 'data' in e.response &&
       e.response.data && typeof e.response.data === 'object' && 'message' in e.response.data)
        ? String(e.response.data.message)
        : 'Error al guardar cántaros';
    $q.notify({ type: 'negative', message: errorMsg });
  } finally {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ($q as any).loading?.hide?.();
    } catch {
      /* noop */
    }
    saving.value = false;
  }
}

onMounted(() => {
  applyPeriodFromQuery();
  void Promise.all([
    loadJarSettings(),
    loadJarData(),
    loadCategoriesTree(),
    loadTheoreticalSavings(),
  ]).then(() => {
    // Remueve del árbol las categorías ya asignadas a algún cántaro
    const assigned = new Set<string>();
    for (const j of jarElements.value) {
      for (const c of j.categories || []) assigned.add(c.id);
    }
    if (assigned.size > 0 && Array.isArray(categoriesPropNodes.value)) {
      const filtered = filterOutAssignedNodes(categoriesPropNodes.value, assigned);
      // No actualizar el master map aquí; solo la vista
      setCategories(filtered, false);
    }
    // También ocultar carpetas que están totalmente asignadas
    Object.values(categoriesMap.value).forEach((node) => {
      if (node.type === 'folder') {
        const kids = node.children || [];
        if (kids.length > 0 && kids.every((kid) => assigned.has(kid))) {
          // Igual que arriba: no mutamos el árbol directamente cuando viene por prop
          visibleFolders.value.delete(node.id);
        }
      }
    });
  });
});

// Persist useRealIncome toggle when user changes it
watch(useRealIncome, async (newVal, oldVal) => {
  if (!jarSettingsLoaded.value || newVal === oldVal) return;
  try {
    await api.put('/jars/settings/monthly', {
      month: currentMonth.value,
      leverage_jar_id: monthlyLeverageJarId.value ?? null,
      use_real_income: newVal ?? false,
    });
  } catch (e) {
    console.warn('[JarSettings] Error saving useRealIncome:', e);
  }
});

watch(
  () => jarElements.value,
  () => {
    if (!jarSettingsLoaded.value || jarSettings.value.leverage_jar_id) return;
    const leverage = jarElements.value.find((j) => j.refresh_mode === 'accumulative' && j.id);
    if (leverage?.id) {
      jarSettings.value.leverage_jar_id = leverage.id;
      void saveJarSettings();
    }
  },
  { deep: true }
);

watch(
  () => route.query,
  () => {
    applyPeriodFromQuery();
  }
);

watch(
  () => [
    periodStore.state.type,
    periodStore.state.anchor,
    periodStore.state.customFrom,
    periodStore.state.customTo,
  ],
  () => {
    syncPeriodToQuery();
  }
);

// Watch for period changes to refresh data (only when in month mode)
watch(
  () => periodStore.state.anchor,
  async (newAnchor, oldAnchor) => {
    if (periodStore.state.type !== 'month' || newAnchor === oldAnchor) return;

    const month = currentMonth.value;
    console.log('[Jars] Month changed to:', month);

    // Refresh income data for the selected month
    await fetchCalculatedIncome(month);

    await loadMonthlyLeverageSetting(month);

    // Note: No need to call incomePanelRef.refresh() because the watch on props.month
    // in MonthlyIncomePanel will automatically trigger when :month prop changes

    // Refresh all jar balances for the selected month
    for (const jarId of Object.keys(jarBalances.value)) {
      const id = Number(jarId);
      if (jarBalances.value[id]) {
        const balanceDate = `${month}-01`;
        await jarBalances.value[id].cargarTodo(balanceDate);
      }
    }

    await loadTheoreticalSavings();
  },
  { immediate: false }
);

// keep sidebar jar in sync (exclusive to this view)
watch(
  jarElements,
  (val) => {
    jarsStore.setJars(
      (val || []).map((j) => ({
        uid: j.uid,
        name: j.name,
        type: j.type,
        percent: j.percent,
        fixedAmount: j.fixedAmount,
        color: j.color,
        active: j.active ?? true,
      }))
    );
  },
  { deep: true, immediate: true }
);

// Sincronizar balances con store
watch(
  () =>
    Object.values(jarBalances.value)
      .map((b) => b?.balance?.value)
      .filter((b) => b != null),
  (balances) => {
    balances.forEach((balance) => {
      if (balance && balance.jar_id) {
        jarsStore.setJarBalance(balance.jar_id, balance);
      }
    });
  },
  { deep: true }
);
</script>

<style scoped>
/* ── Summary table ── */
.summary-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  white-space: nowrap;
}
.summary-table th,
.summary-table td {
  padding: 8px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.summary-table thead th {
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.02);
  position: sticky;
  top: 0;
}
.th-sub {
  font-size: 10px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
.summary-total-row td {
  border-top: 2px solid rgba(0, 0, 0, 0.12);
  border-bottom: none;
  background: rgba(0, 0, 0, 0.02);
}
.summary-jar-name {
  display: flex;
  align-items: center;
  gap: 6px;
}
.summary-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Dark mode overrides */
.body--dark .summary-table th {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.03);
}
.body--dark .summary-table td {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}
.body--dark .summary-total-row td {
  border-top-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

/* Layout */
.template-box {
  min-height: 420px;
  border: 2px dashed var(--q-grey-4);
  border-radius: 8px;
}

/* Visual tipo jarra */
.jar-visual {
  width: 60px;
  height: 100px;
  position: relative;
  display: inline-block;
}
.jar-visual--xl {
  width: 110px;
  height: 180px;
}
.jar-visual--sm {
  transform: scale(0.92);
  transform-origin: center;
}
.jar-cap {
  width: 34px;
  height: 10px;
  background: #333;
  border-radius: 4px;
  margin: 0 auto 2px auto;
}
.jar-body {
  position: relative;
  width: 60px;
  height: 88px;
  margin: 0 auto;
  border: 3px solid rgba(0, 0, 0, 0.02); /* match jar background */
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
}
.jar-visual--xl .jar-body {
  width: 110px;
  height: 168px;
}
.jar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: height 200ms ease;
}
.jar-stack {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
}
.jar-segment {
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.jar-segment-empty {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.05),
    rgba(0, 0, 0, 0.05) 6px,
    rgba(0, 0, 0, 0.08) 6px,
    rgba(0, 0, 0, 0.08) 12px
  );
}
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.jar-percent {
  position: absolute;
  bottom: 6px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
.jar-caption {
  line-height: 1.1;
}
.jar-title {
  font-size: 13px;
}
.jar-type {
  font-size: 11px;
}

/* Dropzone categorías */
.jar-dropzone {
  min-height: 64px;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 8px;
}
.jar-dropzone.is-drop-target {
  background: rgba(76, 175, 80, 0.08);
  border-color: rgba(76, 175, 80, 0.8);
}
.invalid-drop {
  outline: 2px dashed rgba(239, 68, 68, 0.6);
  outline-offset: 4px;
}
.chip-drag-handle {
  cursor: grab;
}

.apply-template-btn :deep(.q-btn__content) {
  font-weight: 600;
}

.jar-color-btn {
  border-radius: 6px;
  color: #fff;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.empty-actions {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 8px;
}

/* Header layout */
.header-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(280px, 1fr) auto;
  align-items: center;
  gap: 12px;
}
.header-title {
  min-width: 0;
}
.header-bar-col {
  display: flex;
  justify-content: center;
}
.header-actions {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 8px;
  align-items: center;
}

/* Horizontal jars bar */
.jar-hbar {
  /* center column bar */
  width: 100%;
  max-width: 520px;
}
.jar-hbar.warn .jar-hbar__bar {
  outline: 2px dashed rgba(255, 152, 0, 0.6);
  outline-offset: 2px;
}
.jar-hbar__bar {
  height: 28px; /* thicker bar */
  border-radius: 9999px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.jar-hbar__stack {
  display: flex;
  height: 100%;
}
.jar-hbar__seg {
  height: 100%;
  position: relative;
}
.jar-hbar__seg + .jar-hbar__seg {
  border-left: 1px solid rgba(255, 255, 255, 0.3); /* soft separator */
}
.jar-hbar__seg::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.14) 0px,
    rgba(255, 255, 255, 0.14) 6px,
    rgba(255, 255, 255, 0) 6px,
    rgba(255, 255, 255, 0) 12px
  );
}
.jar-hbar__seg.empty::before {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.08) 0px,
    rgba(0, 0, 0, 0.08) 6px,
    rgba(0, 0, 0, 0) 6px,
    rgba(0, 0, 0, 0) 12px
  );
}

@media (max-width: 1023px) {
  .header-grid {
    grid-template-columns: 1fr;
    grid-row-gap: 8px;
  }
  .header-bar-col {
    order: 2;
  }
  .header-actions {
    order: 3;
    justify-self: start;
  }
}

/* 70/30 grid layout for main (jars) and aside (categories) */
.content-flex {
  display: grid;
  grid-template-columns: 70% 30%;
  gap: 24px;
  align-items: flex-start;
}
.main-col {
  min-width: 0;
}
.aside-col {
  min-width: 0;
}
/* Cards list */
.jars-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.jar-item {
  min-width: 0;
}
.jar-body-grid {
  display: block;
}

.jar-compact-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact-slider {
  flex: 1;
  min-width: 120px;
}

.compact-percent-input,
.compact-fixed-input {
  width: 90px;
}

.compact-leverage-select {
  min-width: 180px;
}

.jar-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: var(--q-card-bg, #fff);
  padding: 8px 0;
  z-index: 20;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.06);
  pointer-events: auto;
}

/* Amount row */
.jar-amount-grid {
  display: grid;
  grid-template-columns: 1fr 88px;
  gap: 8px;
  align-items: center;
}
.slider-col {
  min-width: 0;
}
.percent-input {
  width: 88px;
}
.fixed-input {
  width: 100%;
}
/* Center empty-state within the 70% area */
.main-col.empty-mode {
  display: grid;
  place-items: center;
  min-height: 50vh; /* give it room to center vertically */
}
.main-col.empty-mode .empty-state {
  align-items: center;
  text-align: center;
}
@media (max-width: 1023px) {
  .content-flex {
    grid-template-columns: 1fr;
  }
  .jar-amount-grid {
    grid-template-columns: 1fr 84px;
  }
}

/* Make the jar header controls span full width and adapt */
.jar-controls-grid {
  display: grid;
  grid-template-columns: auto minmax(140px, 1fr) max-content max-content max-content max-content;
  align-items: center;
  gap: 8px;
}
.jar-name-input {
  width: 100%;
}
@media (max-width: 599px) {
  .jar-controls-grid {
    grid-template-columns: auto 1fr;
    grid-auto-flow: row;
    grid-row-gap: 6px;
  }
}

/* Sticky categories column on desktop */
@media (min-width: 1024px) {
  .aside-col {
    /* ensure the aside doesn't create a new stacking/scrolling context */
    overflow: visible;
  }

  .sticky-categories {
    position: -webkit-sticky;
    position: sticky;
    /* leave room for top header + small gap */
    top: 88px;
    align-self: flex-start;
    height: calc(100vh - 96px);
    /* ensure the card fills and its content can scroll */
    z-index: 12;
    will-change: transform;
  }
  .sticky-categories-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .sticky-categories-card .q-card__section:last-child {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    flex: 1 1 auto;
    padding-right: 8px; /* prevent scroll pinch from overlapping content */
  }
}

/* Ensure categories section fills and tree uses full height */
.cats-section {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0; /* allow flex child to shrink */
}
.cats-wrap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
}
.cats-wrap > * {
  flex: 1 1 auto;
  min-height: 0;
}

/* Color picker menu layout */
.color-menu {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}
.color-suggestions {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
}
.color-actions {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
}

/* Template dialog grids */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.template-item {
  min-width: 0;
}
.template-skeleton {
  grid-column: 1 / -1;
}

/* Ensure the templates dialog provides height to the scroll area */
.template-dialog-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.template-scroll-section {
  padding: 0;
  flex: 1 1 auto;
  min-height: 0; /* allow QScrollArea to compute height via .fit */
}

/* Chip list grid */
.chip-list {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: repeat(auto-fit, minmax(120px, max-content));
  gap: 6px;
}

</style>

<style>
/* Unscoped styles for sticky categories sidebar */

/* Ensure q-page allows overflow for sticky positioning */
.q-page {
  overflow: visible !important;
}

@media (min-width: 1024px) {
  /* Sticky positioning for the aside column (parent level) */
  .aside-col {
    position: sticky;
    top: 140px; /* More space to avoid header overlap */
    align-self: flex-start; /* Align to top of flex container */
    max-height: calc(100vh - 156px); /* Account for top gap */
    z-index: 1000; /* High z-index to stay above everything */
  }

  /* Categories container adjusts to parent */
  .sticky-categories {
    height: 100%;
  }

  .sticky-categories-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(100vh - 200px);
  }

  .sticky-categories-card .q-card__section:first-child {
    flex: 0 0 auto; /* Title section doesn't grow */
  }

  .sticky-categories-card .q-card__section:last-child {
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    flex: 1 1 0;
    min-height: 0;
    padding-right: 8px;
  }
}
</style>
