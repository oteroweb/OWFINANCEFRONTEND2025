<template>
  <q-dialog
    v-model="showDialog"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    maximized
  >
    <q-card class="column" style="height: 100%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Carga Masiva de Transacciones</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="col">
        <!-- Selector de Cuenta Única -->
        <div class="q-mb-md">
          <div class="row items-center gap-md">
            <div class="col-12 col-sm-auto">
              <q-select
                v-model="selectedAccountId"
                :options="filteredAccounts"
                option-label="name"
                option-value="id"
                outlined
                dense
                emit-value
                map-options
                use-input
                input-debounce="300"
                @filter="filterAccounts"
                label="Cuenta (aplica a todas las filas) *"
                hint="Requerido - todas las filas usarán esta cuenta"
                class="min-w-xs"
                :rules="[val => !!val || 'Debe seleccionar una cuenta']"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance_wallet" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Sin resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div v-if="selectedAccount && needsRateForSelectedAccount" class="col-12 col-sm-auto">
              <q-chip
                removable
                color="warning"
                text-color="dark"
                class="text-caption"
              >
                ⚠️ Moneda: {{ selectedAccount?.currencyCode }} (requerirá TASA en cada fila)
              </q-chip>
            </div>
          </div>
        </div>
        
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="table" label="Tabla" />
          <q-tab name="excel" label="Excel" />
          <q-tab name="text" label="Texto" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="q-mt-md">
          <!-- TAB: Tabla -->
          <q-tab-panel name="table">
            <p class="text-caption text-grey-7">
              Agrega filas manualmente usando el botón de abajo.
            </p>
            <q-btn
              color="primary"
              label="Agregar Fila"
              icon="add"
              @click="addTableRow"
              class="q-mb-md"
            />
            <div v-if="tableRows.length > 0" class="q-mt-md" style="max-height: 400px; overflow-y: auto">
              <q-markup-table dense flat bordered>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th v-if="needsRateForSelectedAccount">Tasa</th>
                    <th>Categoría</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in tableRows" :key="idx">
                    <td>
                      <q-input v-model="row.date" dense type="date" />
                    </td>
                    <td>
                      <q-input v-model="row.name" dense placeholder="Concepto" />
                    </td>
                    <td>
                      <q-select
                        v-model="row.type"
                        :options="filteredTypes"
                        option-label="label"
                        option-value="value"
                        dense
                        emit-value
                        map-options
                        use-input
                        input-debounce="0"
                        @filter="filterTypes"
                      >
                        <template v-slot:prepend>
                          <q-icon name="swap_horiz" size="xs" />
                        </template>
                      </q-select>
                    </td>
                    <td>
                      <q-input v-model.number="row.amount" dense type="number" step="0.01" />
                    </td>
                    <td v-if="needsRateForSelectedAccount">
                      <q-input v-model.number="row.rate" dense type="number" step="0.0001" placeholder="1.0" />
                    </td>
                    <td>
                      <q-select
                        v-model="row.category_id"
                        :options="filteredCategories"
                        dense
                        option-value="id"
                        option-label="name"
                        emit-value
                        map-options
                        clearable
                        use-input
                        input-debounce="300"
                        @filter="filterCategories"
                      >
                        <template v-slot:prepend>
                          <q-icon name="category" size="xs" />
                        </template>
                      </q-select>
                    </td>
                    <td>
                      <q-btn
                        icon="delete"
                        flat
                        dense
                        color="negative"
                        size="sm"
                        @click="removeTableRow(idx)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-tab-panel>

          <!-- TAB: Excel -->
          <q-tab-panel name="excel">
            <p class="text-caption text-grey-7">
              Sube un archivo .xlsx. Se esperan columnas: Fecha, Concepto, Tipo, Monto, Cuenta, Categoría.
            </p>
            <q-file
              v-model="excelFile"
              label="Seleccionar archivo Excel"
              accept=".xlsx,.xls"
              @update:model-value="handleExcelFile"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div v-if="excelParsedRows.length > 0" class="q-mt-md">
              <p class="text-body2">
                <strong>{{ excelParsedRows.length }}</strong> filas detectadas.
              </p>
              <div style="height: 400px; overflow: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                <q-markup-table dense flat bordered>
                  <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                    <tr>
                      <th v-for="(col, idx) in excelDetectedColumns" :key="idx" :style="getColumnHeaderStyle(col)">
                        <span class="text-weight-bold">({{ idx + 1 }}) {{ col }}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in excelRawRows.slice(0, 100)" :key="idx">
                      <td v-for="col in excelDetectedColumns" :key="col" class="text-body2" style="min-width: 100px; word-break: break-word;" :style="getColumnBodyStyle(col)">
                        {{ row[col] }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </q-tab-panel>

          <!-- TAB: Texto -->
          <q-tab-panel name="text">
            <div class="row wrap gap-md items-center q-mb-md">
              <div>
                <p class="text-caption text-grey-7 q-mb-sm">
                  Pega texto separado por el delimitador elegido y nuevas líneas. <br />
                  Formato sugerido: <code>fecha{sep}concepto{sep}tipo{sep}monto{sep}tasa{sep}categoría</code>
                </p>
              </div>
              <q-select
                v-model="textSeparator"
                :options="separatorOptions"
                option-label="label"
                option-value="value"
                outlined
                dense
                emit-value
                map-options
                label="Delimitador"
                style="min-width: 180px"
              >
                <template v-slot:prepend>
                  <q-icon name="more_vert" />
                </template>
              </q-select>
            </div>
            <q-input
              v-model="textInput"
              type="textarea"
              rows="10"
              filled
              placeholder="Pega aquí tu texto..."
              @update:model-value="handleTextInput"
            />
            <div v-if="textParsedRows.length > 0" class="q-mt-md">
              <p class="text-body2">
                <strong>{{ textParsedRows.length }}</strong> filas parseadas (delimitador: <code>{{ textSeparator === "\t" ? 'TAB' : textSeparator }}</code>).
              </p>
              <div style="height: 300px; overflow: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                <q-markup-table dense flat bordered>
                  <thead style="position: sticky; top: 0; background: white; z-index: 1;">
                    <tr>
                      <th v-for="(idx) in (textRawRows[0]?.length || 0)" :key="idx" :style="getColumnHeaderStyleByIndex(idx - 1)">
                        <span class="text-weight-bold">Columna {{ idx }}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, ridx) in textRawRows.slice(0, 100)" :key="ridx">
                      <td v-for="(cell, cidx) in row" :key="cidx" class="text-body2" style="min-width: 100px; word-break: break-word;" :style="getColumnBodyStyleByIndex(cidx)">
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <div v-if="showAdjustments" class="q-mt-lg q-pa-md bg-grey-1" style="border-radius: 8px;">
          <div class="text-h6 q-mb-md">Paso 2: Ajustes antes de importar</div>

          <!-- Mapeo de columnas -->
          <q-card v-if="activeTab !== 'table'" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">📋 Mapeo de columnas</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.date" 
                    :options="columnMappingOptions" 
                    label="📅 Fecha *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_today" />
                    </template>
                    <template v-slot:hint>
                      Selecciona 1 columna (fecha solamente)
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.name" 
                    :options="columnMappingOptions" 
                    label="📝 Concepto *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" />
                    </template>
                    <template v-slot:hint>
                      Puedes seleccionar múltiples para concatenar
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.type" 
                    :options="columnMappingOptions" 
                    label="🏷️ Tipo *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" />
                    </template>
                    <template v-slot:hint>
                      income, expense, transfer
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.amount" 
                    :options="columnMappingOptions" 
                    label="💰 Monto *" 
                    outlined 
                    dense 
                    emit-value 
                    map-options
                    use-input
                    input-debounce="0"
                    multiple
                    :rules="[val => (val && val.length > 0) || 'Requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" />
                    </template>
                    <template v-slot:hint>
                      Selecciona 1 columna (número solamente)
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.rate" 
                    :options="columnMappingOptions" 
                    label="💱 Tasa" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" />
                    </template>
                    <template v-slot:hint>
                      Opcional - necesario si hay transfer o moneda diferente
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.category" 
                    :options="columnMappingOptions" 
                    label="🗂️ Categoría" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="folder" />
                    </template>
                    <template v-slot:hint>
                      Opcional - puedes concatenar múltiples columnas
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.account" 
                    :options="columnMappingOptions" 
                    label="🏦 Cuenta" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_balance" />
                    </template>
                    <template v-slot:hint>
                      Opcional - nombre de cuenta (si no se mapea, usa la seleccionada arriba)
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.from_account" 
                    :options="columnMappingOptions" 
                    label="↗️ Cuenta origen (transfer)" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="arrow_upward" />
                    </template>
                    <template v-slot:hint>
                      Solo para transferencias - cuenta de donde sale el dinero
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <q-select 
                    v-model="columnMapping.to_account" 
                    :options="columnMappingOptions" 
                    label="↘️ Cuenta destino (transfer)" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    use-input
                    input-debounce="0"
                    multiple
                  >
                    <template v-slot:prepend>
                      <q-icon name="arrow_downward" />
                    </template>
                    <template v-slot:hint>
                      Solo para transferencias - cuenta a donde llega el dinero
                    </template>
                  </q-select>
                </div>
              </div>
              <div class="q-mt-md">
                <q-btn color="secondary" unelevated icon="sync" label="Aplicar mapeo" @click="applyColumnMapping" />
              </div>
            </q-card-section>
          </q-card>

          <!-- Reglas opcionales de tipo -->
          <q-card v-if="activeTab !== 'table'" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">⚙️ Reglas opcionales de tipo</div>
              <q-toggle
                v-model="enableTypeMappingRules"
                color="primary"
                label="Usar reglas personalizadas de tipo"
              />
              <div v-if="enableTypeMappingRules" class="q-mt-sm">
                <div
                  v-for="(rule, idx) in typeMappingRules"
                  :key="`type-rule-${idx}`"
                  class="row q-col-gutter-md items-center q-mb-sm"
                >
                  <div class="col-12 col-sm-5">
                    <q-input
                      v-model="rule.match"
                      outlined
                      dense
                      label="Si valor es (ej: -, +, DEBITO)"
                    />
                  </div>
                  <div class="col-12 col-sm-5">
                    <q-select
                      v-model="rule.target"
                      :options="typeOptions"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                      outlined
                      dense
                      label="Mapear a"
                    />
                  </div>
                  <div class="col-12 col-sm-2">
                    <q-btn
                      icon="delete"
                      flat
                      round
                      color="negative"
                      :disable="typeMappingRules.length === 1"
                      @click="removeTypeRule(idx)"
                    />
                  </div>
                </div>
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Agregar regla"
                  @click="addTypeRule"
                />
              </div>
              <div class="q-mt-md">
                <q-btn
                  color="secondary"
                  unelevated
                  icon="rule"
                  label="Aplicar reglas de tipo a vista previa"
                  @click="applyTypeRulesToRows"
                  :disable="parsedRowsForPreview.length === 0"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Vista previa editable -->
          <q-card v-if="parsedRowsForPreview.length > 0" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1">👁️ Vista previa editable ({{ parsedRowsForPreview.length }} filas)</div>
                <q-badge color="info" :label="`${parsedRowsForPreview.length} filas cargadas`" />
              </div>
              <div style="max-height: 500px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px;">
                <table class="full-width" style="border-collapse: collapse;">
                  <thead style="position: sticky; top: 0; background: #f5f5f5; z-index: 1;">
                    <tr>
                      <th style="width: 40px; padding: 8px; text-align: center; border: 1px solid #ddd;">#</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 100px;">1. Fecha</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 150px;">2. Concepto</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 120px;">3. Tipo</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 100px;">4. Monto</th>
                      <th v-if="needsRateForSelectedAccount" style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 80px;">5. Tasa</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 180px;">6. Conversión</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 180px;">7. Cuenta aplicada</th>
                      <th style="padding: 8px; border: 1px solid #ddd; text-align: left; min-width: 120px;">8. Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in parsedRowsForPreview.slice(0, 50)" :key="`prev-${idx}`" style="border-bottom: 1px solid #ddd;">
                      <td style="padding: 4px; text-align: center; border: 1px solid #ddd;">
                        <q-btn 
                          icon="delete" 
                          flat 
                          dense 
                          size="sm" 
                          color="negative" 
                          @click="removeRowFromPreview(idx)"
                        >
                          <q-tooltip>Eliminar fila</q-tooltip>
                        </q-btn>
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-input 
                          :model-value="String(getRowValue(row, 'date') || '')" 
                          @update:model-value="(val) => setRowValue(row, 'date', val)" 
                          dense outlined type="date" style="width: 100%;" 
                        />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-input 
                          :model-value="String(getRowValue(row, 'name') || '')" 
                          @update:model-value="(val) => setRowValue(row, 'name', val)" 
                          dense outlined style="width: 100%;" 
                        />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-select 
                          :model-value="String(getRowValue(row, 'type') || 'expense')" 
                          @update:model-value="(val) => setRowValue(row, 'type', val)" 
                          :options="['income', 'expense', 'transfer']" 
                          dense 
                          outlined 
                          emit-value 
                          style="width: 100%;"
                        />
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <q-input 
                          :model-value="Number(getRowValue(row, 'amount') || 0)" 
                          @update:model-value="(val) => setRowValue(row, 'amount', Number(val))" 
                          dense outlined type="number" step="0.01" style="width: 100%;" 
                        />
                      </td>
                      <td v-if="needsRateForSelectedAccount" style="padding: 6px; border: 1px solid #ddd;">
                        <q-input 
                          :model-value="Number(getRowValue(row, 'rate') || defaultRate)" 
                          @update:model-value="(val) => setRowValue(row, 'rate', Number(val))" 
                          dense outlined type="number" step="0.0001" style="width: 100%;" 
                        >
                          <template v-slot:append>
                            <q-btn
                              v-if="Number(getRowValue(row, 'rate') || 0) !== defaultRate && defaultRate > 0"
                              flat dense icon="restore" size="sm" color="info"
                              @click="setRowValue(row, 'rate', defaultRate)"
                            >
                              <q-tooltip>Restaurar a tasa default</q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <div v-if="String(getRowValue(row, 'type') || '') === 'transfer'" class="text-caption text-primary">
                          {{ getConversionPreview(row) }}
                        </div>
                        <div v-else class="text-caption text-grey-6" style="font-style: italic; text-align: center;">-</div>
                      </td>
                      <td style="padding: 6px; border: 1px solid #ddd;">
                        <div class="text-caption text-weight-medium">
                          {{ selectedAccount?.name || 'Cuenta no seleccionada' }}
                        </div>
                      </td>
                      <td v-if="String(getRowValue(row, 'type') || '') !== 'transfer'" style="padding: 6px; border: 1px solid #ddd;">
                        <q-select 
                          :model-value="getRowValue(row, 'category_id')" 
                          @update:model-value="(val) => setRowValue(row, 'category_id', val)" 
                          :options="filteredCategories" 
                          option-value="id" 
                          option-label="name" 
                          dense 
                          outlined 
                          emit-value 
                          map-options 
                          use-input
                          input-debounce="300"
                          @filter="filterCategories"
                          clearable
                          style="width: 100%;"
                        >
                          <template v-slot:prepend>
                            <q-icon name="category" size="xs" />
                          </template>
                        </q-select>
                      </td>
                      <td v-else style="padding: 6px; border: 1px solid #ddd; background: #f5f5f5;">
                        <div class="text-caption text-grey-6" style="text-align: center; font-style: italic;">No aplica</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tasa por defecto -->
          <q-card v-if="needsRateForSelectedAccount" flat bordered class="q-mb-md bg-warning-1">
            <q-card-section>
              <div class="row items-start q-col-gutter-md">
                <div class="col-auto">
                  <q-icon name="info" size="lg" color="warning" />
                </div>
                <div class="col">
                  <div class="text-subtitle1 q-mb-md">💱 Tasa de cambio {{ selectedAccount?.currencyCode }} a USD</div>
                  <p class="text-caption text-grey-7 q-mb-md">
                    La cuenta <strong>{{ selectedAccount?.name }}</strong> está en <strong>{{ selectedAccount?.currencyCode }}</strong>. 
                    Debes especificar la tasa de cambio para convertir a USD.
                  </p>
                  <div class="row items-center q-col-gutter-md">
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-input 
                        v-model.number="defaultRate" 
                        type="number" 
                        step="0.0001" 
                        outlined 
                        dense 
                        label="Tasa (ej: 40.5)"
                        hint="Se aplicará a todas las filas sin tasa"
                        class="full-width"
                      >
                        <template v-slot:prepend>
                          <q-icon name="currency_exchange" />
                        </template>
                      </q-input>
                    </div>
                    <div v-if="defaultRate === 1" class="col-12 col-sm-6 col-md-auto">
                      <q-chip
                        removable
                        color="negative"
                        text-color="white"
                        class="text-weight-bold"
                        icon="warning"
                      >
                        ⚠️ Tasa en 1.0 = conversión 1:1 (probablemente incorrigible)
                      </q-chip>
                    </div>
                    <div v-else class="col-12 col-sm-6 col-md-auto">
                      <q-chip
                        color="positive"
                        text-color="white"
                        icon="check_circle"
                      >
                        ✓ Se aplicará automáticamente
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Asignación de categorías -->
          <q-card v-if="detectedCategoryNames.length > 0" flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">🗂️ Asignación de categorías</div>
              <q-toggle
                v-model="autoApplyCategoryMappings"
                color="primary"
                label="Aplicar estas asignaciones automáticamente al presionar 'Aplicar mapeo'"
                class="q-mb-md"
              />
              <div v-for="catName in detectedCategoryNames" :key="`map-cat-${catName}`" class="q-mb-md">
                <div class="row q-col-gutter-md items-center">
                  <div class="col-12 col-sm-5">
                    <q-input 
                      :model-value="catName" 
                      dense 
                      outlined 
                      readonly 
                      label="Categoría detectada"
                    >
                      <template v-slot:prepend>
                        <q-icon name="label" color="orange" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-1 text-center">
                    <q-icon name="arrow_forward" size="sm" color="grey-6" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="categoryMappings[catName]"
                      :options="filteredCategories"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      dense
                      outlined
                      clearable
                      use-input
                      input-debounce="300"
                      @filter="filterCategories"
                      label="Asignar a"
                      placeholder="Buscar categoría..."
                    >
                      <template v-slot:prepend>
                        <q-icon name="folder" color="primary" />
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Sin resultados
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>
              <div class="q-mt-md">
                <q-btn 
                  color="secondary" 
                  unelevated 
                  icon="check_circle" 
                  label="Aplicar categorías" 
                  @click="applyCategoryMappings" 
                />
              </div>

              <q-separator class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm">Reglas por texto (opcional)</div>
              <q-toggle
                v-model="enableCategoryKeywordRules"
                color="primary"
                label="Mapear categorías por coincidencia parcial (ej: social)"
                class="q-mb-sm"
              />
              <div v-if="enableCategoryKeywordRules">
                <div
                  v-for="(rule, idx) in categoryKeywordRules"
                  :key="`cat-rule-${idx}`"
                  class="row q-col-gutter-md items-center q-mb-sm"
                >
                  <div class="col-12 col-sm-5">
                    <q-input
                      v-model="rule.keyword"
                      outlined
                      dense
                      label="Si texto contiene"
                      placeholder="social"
                    />
                  </div>
                  <div class="col-12 col-sm-5">
                    <q-select
                      v-model="rule.categoryId"
                      :options="filteredCategories"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      use-input
                      input-debounce="300"
                      @filter="filterCategories"
                      dense
                      outlined
                      clearable
                      label="Mapear a categoría"
                    />
                  </div>
                  <div class="col-12 col-sm-2">
                    <q-btn
                      icon="delete"
                      flat
                      round
                      color="negative"
                      :disable="categoryKeywordRules.length === 1"
                      @click="removeCategoryKeywordRule(idx)"
                    />
                  </div>
                </div>
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Agregar regla"
                  @click="addCategoryKeywordRule"
                  class="q-mr-sm"
                />
                <q-btn
                  color="secondary"
                  unelevated
                  icon="rule"
                  label="Aplicar reglas por texto"
                  @click="applyCategoryKeywordRules"
                />
              </div>

              <q-separator class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm">Mapear columna TIPO a categorías (opcional)</div>
              <p class="text-caption text-grey-7">
                Ej: si en la columna TIPO aparece "debito" → asignar categoría "Gastos Varios"
              </p>
              <q-toggle
                v-model="enableTypeValueToCategoryRules"
                color="primary"
                label="Mapear valores de TIPO a categorías específicas"
                class="q-mb-sm"
              />
              <div v-if="enableTypeValueToCategoryRules">
                <div
                  v-for="(rule, idx) in typeValueToCategoryRules"
                  :key="`type-cat-rule-${idx}`"
                  class="row q-col-gutter-md items-center q-mb-sm"
                >
                  <div class="col-12 col-sm-5">
                    <q-input
                      v-model="rule.typeValue"
                      outlined
                      dense
                      label="Si columna TIPO = "
                      placeholder="debito, egreso, pago..."
                    />
                  </div>
                  <div class="col-12 col-sm-5">
                    <q-select
                      v-model="rule.categoryId"
                      :options="filteredCategories"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      use-input
                      input-debounce="300"
                      @filter="filterCategories"
                      dense
                      outlined
                      clearable
                      label="Mapear a categoría"
                    />
                  </div>
                  <div class="col-12 col-sm-2">
                    <q-btn
                      icon="delete"
                      flat
                      round
                      color="negative"
                      :disable="typeValueToCategoryRules.length === 1"
                      @click="removeTypeValueToCategoryRule(idx)"
                    />
                  </div>
                </div>
                <q-btn
                  flat
                  color="primary"
                  icon="add"
                  label="Agregar regla"
                  @click="addTypeValueToCategoryRule"
                  class="q-mr-sm"
                />
                <q-btn
                  color="secondary"
                  unelevated
                  icon="rule"
                  label="Aplicar mapeo tipo→categoría"
                  @click="applyTypeValueToCategoryRules"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Espacio para evitar superposición de dropdowns con botones -->
          <div class="q-mb-xl" style="height: 200px;"></div>
        </div>
      </q-card-section>

      <q-separator />

      <div class="q-px-md q-pt-sm">
        <q-toggle
          v-model="browserNotificationsEnabled"
          color="primary"
          label="Notificar al finalizar (navegador)"
          @update:model-value="handleBrowserNotificationsToggle"
        />
      </div>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          v-if="hasData && !showAdjustments"
          color="secondary"
          outline
          label="Siguiente: Ajustes"
          @click="goToAdjustments"
        />
        <q-btn
          color="primary"
          label="Vista Previa (Dry Run)"
          @click="handleDryRun"
          :loading="processingDryRun"
          :disable="!hasData || !showAdjustments"
        />
        <q-btn
          color="positive"
          label="Importar Ahora"
          @click="handleImport"
          :loading="processingImport"
          :disable="!hasData || !showAdjustments"
        />
      </q-card-actions>

      <!-- Results Dialog -->
      <q-dialog v-model="showResults" persistent>
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">Resultado de la Importación</div>
          </q-card-section>
          <q-card-section>
            <div v-if="bulkResult">
              <p>
                <strong>Total:</strong> {{ bulkResult.total }} <br />
                <strong>Creadas:</strong>
                <span class="text-positive">{{ bulkResult.created }}</span> <br />
                <strong>Fallidas:</strong>
                <span class="text-negative">{{ bulkResult.failed }}</span>
              </p>
              <div v-if="bulkResult.failed > 0" class="q-mt-md">
                <p class="text-body2 text-negative">Errores:</p>
                <q-list dense bordered separator>
                  <q-item v-for="(res, idx) in failedResults" :key="`error-${idx}`">
                    <q-item-section>
                      <q-item-label overline>
                        Fila {{ res.index + 1 }} ({{ res.client_row_id || 'sin id' }})
                      </q-item-label>
                      <template v-if="res.errors">
                        <q-item-label caption v-for="(errs, field) in res.errors" :key="`err-${idx}-${String(field)}`">
                          <strong>{{ field }}:</strong> {{ formatFieldErrors(errs) }}
                        </q-item-label>
                        </template>
                      </q-item-section>
                    </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" v-close-popup @click="closeResults" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionsStore } from '../stores/transactions'
import { useTransactionForm } from 'src/composables/useTransactionForm'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'boot/axios'
import { read as xlsxRead, utils as xlsxUtils } from 'xlsx'
import { Notify } from 'quasar'

interface BulkResult {
  total: number
  created: number
  failed: number
  results: Array<{
    index: number
    client_row_id: string
    ok: boolean
    transaction_id?: number
    errors?: unknown
  }>
}

interface BulkFailedResult {
  index: number
  client_row_id: string | undefined
  ok: boolean
  errors: Record<string, unknown> | undefined
}

interface TransactionBulkRow {
  name: string
  date: string
  transaction_type_id?: number | null
  provider_id?: number | null
  category_id?: number | null
  include_in_balance?: boolean
  amount?: number | null
  description?: string | null
  items: Array<{
    name: string
    amount: number
    item_category_id?: number | null
    quantity?: number
  }>
  payments: Array<{
    account_id: number
    amount: number
    rate?: number | null
    is_current?: boolean | null
    is_official?: boolean | null
  }>
  client_row_id?: string
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'imported', count: number): void
}>()

const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()

// Get accounts from composable
const { allAccounts, ensureAccountsLoaded } = useTransactionForm()

// Categories - load manually
type CategoryOption = { id: number; name: string }
const allCategories = ref<CategoryOption[]>([])
let categoriesLoaded = false

async function ensureCategoriesLoaded() {
  if (categoriesLoaded) return
  try {
    const res = await api.get('/categories', {
      params: { order_by: 'name', order_dir: 'asc' }
    })
    const data = (res.data?.data || res.data) as CategoryOption[]
    allCategories.value = data || []
    categoriesLoaded = true
  } catch (err) {
    console.warn('Error loading categories', err)
    categoriesLoaded = false
  }
}

// Load accounts and categories on mount
onMounted(async () => {
  await ensureAccountsLoaded()
  await ensureCategoriesLoaded()
  await authStore.refreshUserCurrencies()
  if (browserNotificationsEnabled.value && typeof Notification !== 'undefined' && Notification.permission === 'default') {
    void Notification.requestPermission()
  }
})

const showDialog = ref(true)
const activeTab = ref<'table' | 'excel' | 'text'>('table')
const showAdjustments = ref(false)
const browserNotificationsEnabled = ref<boolean>(localStorage.getItem('bulkImportBrowserNotifications') !== '0')

// Account selection
const selectedAccountId = ref<number | null>(null)
const selectedAccount = computed(() => {
  if (!selectedAccountId.value) return null
  return allAccounts.value.find((a: { id: number; name: string; currencyCode?: string; currencyId?: number | null }) => a.id === selectedAccountId.value)
})
const needsRateForSelectedAccount = computed(() => {
  // Check if account currency is not the default user currency
  // For now, we assume any non-default is cross-currency
  // In a real implementation, we'd check user.default_currency_id or user.currency_code
  return selectedAccount.value && (selectedAccount.value.currencyCode !== 'USD' && selectedAccount.value.currencyCode !== 'ARS')
})

function getCurrentRateForSelectedAccount(): number {
  const code = selectedAccount.value?.currencyCode
  if (!code) return 1
  const rate = authStore.getCurrentRateForCurrency(code)
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0 ? rate : 1
}

// Cargar tasa current desde el perfil local al seleccionar cuenta
watch(selectedAccountId, () => {
  if (!selectedAccountId.value || !selectedAccount.value) return
  defaultRate.value = getCurrentRateForSelectedAccount()
})

// Table mode
const tableRows = ref<Array<{
  date: string
  name: string
  type: string
  amount: number
  rate: number | null
  category_id: number | null
  account_name?: string
  from_account_name?: string
  to_account_name?: string
}>>([])

// Excel mode
const excelFile = ref<File | null>(null)
const excelParsedRows = ref<Array<Record<string, unknown>>>([])
const excelRawRows = ref<Array<Record<string, unknown>>>([])
const excelDetectedColumns = ref<string[]>([])

// Text mode
const textInput = ref('')
const textSeparator = ref<string>(';')
const textParsedRows = ref<Array<Record<string, unknown>>>([])
const textRawRows = ref<string[][]>([])

const defaultRate = ref<number>(1)
const categoryMappings = ref<Record<string, number | null>>({})
const autoApplyCategoryMappings = ref<boolean>(false)
const enableTypeMappingRules = ref<boolean>(true)
const typeMappingRules = ref<Array<{ match: string; target: 'expense' | 'income' | 'transfer' }>>([
  { match: '-', target: 'expense' },
  { match: '+', target: 'income' }
])
const enableCategoryKeywordRules = ref<boolean>(false)
const categoryKeywordRules = ref<Array<{ keyword: string; categoryId: number | null }>>([
  { keyword: '', categoryId: null }
])
const enableTypeValueToCategoryRules = ref<boolean>(false)
const typeValueToCategoryRules = ref<Array<{ typeValue: string; categoryId: number | null }>>([
  { typeValue: '', categoryId: null }
])
const columnMapping = ref<{
  date: string[]
  name: string[]
  type: string[]
  amount: string[]
  rate: string[]
  category: string[]
  account: string[]
  from_account: string[]
  to_account: string[]
}>({
  date: [],
  name: [],
  type: [],
  amount: [],
  rate: [],
  category: [],
  account: [],
  from_account: [],
  to_account: []
})

// Results
const processingDryRun = ref(false)
const processingImport = ref(false)
const showResults = ref(false)
const bulkResult = ref<BulkResult | null>(null)

function safeText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function handleBrowserNotificationsToggle(enabled: boolean | null) {
  const value = !!enabled
  browserNotificationsEnabled.value = value
  localStorage.setItem('bulkImportBrowserNotifications', value ? '1' : '0')
  if (!value) return
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

function notifyCompletion(title: string, body: string) {
  if (!browserNotificationsEnabled.value) return
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    const notification = new Notification(title, {
      body,
      tag: 'bulk-import-completion'
    })
    setTimeout(() => notification.close(), 10000)
  } catch (err) {
    console.warn('Browser notification error', err)
  }
}

function getRowValue(row: unknown, key: string): unknown {
  if (typeof row === 'object' && row !== null) {
    return (row as Record<string, unknown>)[key]
  }
  return undefined
}

function setRowValue(row: unknown, key: string, value: unknown): void {
  if (typeof row === 'object' && row !== null) {
    ;(row as Record<string, unknown>)[key] = value
  }
}

function getConversionPreview(row: unknown): string {
  if (typeof row !== 'object' || row === null) return ''

  if (!selectedAccount.value) return 'Selecciona una cuenta'

  const rowObj = row as Record<string, unknown>

  const amount = Math.abs(Number(rowObj.amount || 0))
  const rate = Number(rowObj.rate || defaultRate.value || 1)
  if (!Number.isFinite(amount) || amount <= 0) return '-'
  if (!Number.isFinite(rate) || rate <= 0) return 'Tasa inválida'

  const fromCurrency = selectedAccount.value.currencyCode || selectedAccount.value.currencySymbol || ''
  const userAmount = amount / rate

  return `${fromCurrency}${amount.toFixed(2)} -> USD${userAmount.toFixed(2)} (÷ ${rate})`
}

function toIsoDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeDateValue(value: unknown): string {
  const todayIso = toIsoDateString(new Date())

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDateString(value)
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 59) {
      const excelEpoch = Date.UTC(1899, 11, 30)
      const ms = excelEpoch + Math.round(value * 86400000)
      const parsed = new Date(ms)
      if (!Number.isNaN(parsed.getTime())) return toIsoDateString(parsed)
    }
  }

  const raw = safeText(value).trim()
  if (!raw) return todayIso

  const yyyyMmDd = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (yyyyMmDd) {
    return `${yyyyMmDd[1]}-${yyyyMmDd[2]}-${yyyyMmDd[3]}`
  }

  const ddMmYyyy = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (ddMmYyyy) {
    const a = Number(ddMmYyyy[1])
    const b = Number(ddMmYyyy[2])
    const y = Number(ddMmYyyy[3])
    if (a >= 1 && a <= 31 && b >= 1 && b <= 12) {
      return `${String(y)}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`
    }
  }

  const jsParsed = new Date(raw)
  if (!Number.isNaN(jsParsed.getTime())) {
    return toIsoDateString(jsParsed)
  }

  return todayIso
}

function normalizeTypeValue(value: unknown): 'income' | 'expense' | 'transfer' {
  const raw = safeText(value).trim().toLowerCase()

  if (enableTypeMappingRules.value) {
    const explicitRule = typeMappingRules.value.find((rule) => safeText(rule.match).trim().toLowerCase() === raw)
    if (explicitRule) return explicitRule.target
  }

  if (raw === '-' || raw === 'expense' || raw === 'egreso' || raw === 'gasto' || raw === 'outcome' || raw === 'outflow' || raw === 'debit' || raw === 'debito') {
    return 'expense'
  }
  if (raw === '+' || raw === 'income' || raw === 'ingreso' || raw === 'abono' || raw === 'credito' || raw === 'credit') {
    return 'income'
  }
  if (raw === 'transfer' || raw === 'transferencia' || raw === 'trf') {
    return 'transfer'
  }

  return 'expense'
}

function applyCategoryMappingsToRows(rows: Array<Record<string, unknown>>) {
  rows.forEach((row) => {
    const text = safeText(row.category_name).trim()
    if (!text) return

    const exactMappedCategoryId = categoryMappings.value[text]
    if (exactMappedCategoryId) {
      row.category_id = exactMappedCategoryId
      const selected = allCategories.value.find((c) => c.id === exactMappedCategoryId)
      if (selected) row.category_name = selected.name
      return
    }

    if (enableCategoryKeywordRules.value) {
      const normalizedText = text.toLowerCase()
      const keywordRule = categoryKeywordRules.value.find((rule) => {
        const keyword = safeText(rule.keyword).trim().toLowerCase()
        return keyword.length > 0 && rule.categoryId && normalizedText.includes(keyword)
      })
      if (keywordRule?.categoryId) {
        row.category_id = keywordRule.categoryId
        const selected = allCategories.value.find((c) => c.id === keywordRule.categoryId)
        if (selected) row.category_name = selected.name
      }
    }
  })
}

function addTypeRule() {
  typeMappingRules.value.push({ match: '', target: 'expense' })
}

function removeTypeRule(index: number) {
  if (typeMappingRules.value.length <= 1) return
  typeMappingRules.value.splice(index, 1)
}

function addCategoryKeywordRule() {
  categoryKeywordRules.value.push({ keyword: '', categoryId: null })
}

function removeCategoryKeywordRule(index: number) {
  if (categoryKeywordRules.value.length <= 1) return
  categoryKeywordRules.value.splice(index, 1)
}

function applyCategoryKeywordRules() {
  if (!enableCategoryKeywordRules.value) {
    Notify.create({ type: 'warning', message: 'Activa las reglas por texto para aplicarlas' })
    return
  }

  const rows = activeTab.value === 'excel' ? excelParsedRows.value : textParsedRows.value
  if (!rows.length) {
    Notify.create({ type: 'warning', message: 'No hay filas para aplicar reglas de categoría' })
    return
  }

  applyCategoryMappingsToRows(rows)
  Notify.create({ type: 'positive', message: 'Reglas de categoría por texto aplicadas' })
}

function addTypeValueToCategoryRule() {
  typeValueToCategoryRules.value.push({ typeValue: '', categoryId: null })
}

function removeTypeValueToCategoryRule(index: number) {
  if (typeValueToCategoryRules.value.length <= 1) return
  typeValueToCategoryRules.value.splice(index, 1)
}

function applyTypeValueToCategoryRules() {
  if (!enableTypeValueToCategoryRules.value) {
    Notify.create({ type: 'warning', message: 'Activa el mapeo tipo→categoría para aplicarlo' })
    return
  }

  const rows = activeTab.value === 'excel' ? excelParsedRows.value : textParsedRows.value
  if (!rows.length) {
    Notify.create({ type: 'warning', message: 'No hay filas para aplicar reglas' })
    return
  }

  let changed = 0
  rows.forEach((row) => {
    const typeValue = safeText(getRowValue(row, 'type')).trim().toLowerCase()
    if (!typeValue) return

    const matchingRule = typeValueToCategoryRules.value.find((rule) =>
      rule.typeValue && safeText(rule.typeValue).trim().toLowerCase() === typeValue
    )

    if (matchingRule && matchingRule.categoryId) {
      const existing = getRowValue(row, 'category_id')
      if (!existing || !Number.isFinite(Number(existing))) {
        setRowValue(row, 'category_id', matchingRule.categoryId)
        const selected = allCategories.value.find((c) => c.id === matchingRule.categoryId)
        if (selected) setRowValue(row, 'category_name', selected.name)
        changed++
      }
    }
  })

  Notify.create({ type: 'positive', message: `Mapeo tipo→categoría aplicado. ${changed} filas actualizadas` })
}

function applyTypeRulesToRows() {
  const rows = activeTab.value === 'table'
    ? (tableRows.value as unknown as Array<Record<string, unknown>>)
    : activeTab.value === 'excel'
      ? excelParsedRows.value
      : textParsedRows.value

  rows.forEach((row) => {
    row.type = normalizeTypeValue(row.type)
  })

  Notify.create({ type: 'positive', message: 'Reglas de tipo aplicadas' })
}

function formatFieldErrors(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((entry) => safeText(entry)).filter(Boolean).join(', ')
  }
  return safeText(value)
}

const failedResults = computed<BulkFailedResult[]>(() => {
  if (!bulkResult.value?.results) return []
  return bulkResult.value.results
    .filter((res) => !res.ok)
    .map((res) => ({
      index: res.index,
      client_row_id: res.client_row_id,
      ok: res.ok,
      errors: typeof res.errors === 'object' && res.errors !== null ? (res.errors as Record<string, unknown>) : undefined
    }))
})

// Separator options for text mode
const separatorOptions = [
  { label: 'Punto y coma (;)', value: ';' },
  { label: 'Tabulador (TAB)', value: "\t" },
  { label: 'Coma (,)', value: ',' },
  { label: 'Pipe (|)', value: '|' }
]

// Options for select dropdowns
const accountOptions = computed(() => {
  return allAccounts.value.map((a: { id: number; name: string }) => ({ id: a.id, name: a.name }))
})
const categoryOptions = computed(() => {
  return allCategories.value.map((c: { id: number; name: string }) => ({ id: c.id, name: c.name }))
})

const columnMappingOptions = computed(() => {
  if (activeTab.value === 'excel') {
    return excelDetectedColumns.value.map((col, idx) => ({ label: `(${idx + 1}) ${col}`, value: col }))
  }
  if (activeTab.value === 'text') {
    const maxLen = textRawRows.value.reduce((acc, row) => Math.max(acc, row.length), 0)
    return Array.from({ length: maxLen }, (_, i) => ({ label: `Columna ${i + 1}`, value: String(i) }))
  }
  return []
})

const detectedCategoryNames = computed(() => {
  const sourceRows = activeTab.value === 'excel' ? excelParsedRows.value : activeTab.value === 'text' ? textParsedRows.value : []
  const names = sourceRows
    .map((row) => safeText(row.category_name).trim())
    .filter((name) => name.length > 0)
  return Array.from(new Set(names))
})

const parsedRowsForPreview = computed(() => {
  if (activeTab.value === 'table') return tableRows.value
  if (activeTab.value === 'excel') return excelParsedRows.value
  if (activeTab.value === 'text') return textParsedRows.value
  return []
})

const hasData = computed(() => {
  if (activeTab.value === 'table') return tableRows.value.length > 0
  if (activeTab.value === 'excel') return excelParsedRows.value.length > 0
  if (activeTab.value === 'text') return textParsedRows.value.length > 0
  return false
})

// Helper: Remove row from preview
function removeRowFromPreview(index: number) {
  if (activeTab.value === 'table') {
    tableRows.value.splice(index, 1)
  } else if (activeTab.value === 'excel') {
    excelParsedRows.value.splice(index, 1)
    excelRawRows.value.splice(index, 1)
  } else if (activeTab.value === 'text') {
    textParsedRows.value.splice(index, 1)
    textRawRows.value.splice(index, 1)
  }
  Notify.create({ type: 'info', message: `Fila ${index + 1} eliminada` })
}


// Helper: Get column color based on mapping
function getColumnColor(colValue: string): { bg: string; text: string; color: string } {
  if (columnMapping.value.date.includes(colValue)) return { bg: '#E3F2FD', text: '#1976D2', color: 'blue' }
  if (columnMapping.value.name.includes(colValue)) return { bg: '#F0F4C3', text: '#F57F17', color: 'orange' }
  if (columnMapping.value.type.includes(colValue)) return { bg: '#FCE4EC', text: '#C2185B', color: 'red' }
  if (columnMapping.value.amount.includes(colValue)) return { bg: '#E8F5E9', text: '#388E3C', color: 'green' }
  if (columnMapping.value.rate.includes(colValue)) return { bg: '#F3E5F5', text: '#7B1FA2', color: 'purple' }
  if (columnMapping.value.category.includes(colValue)) return { bg: '#F5F5F5', text: '#616161', color: 'grey' }
  return { bg: 'transparent', text: 'inherit', color: '' }
}

function getColumnColorByIndex(idx: number): { bg: string; text: string; color: string } {
  const colStr = String(idx)
  if (columnMapping.value.date.includes(colStr)) return { bg: '#E3F2FD', text: '#1976D2', color: 'blue' }
  if (columnMapping.value.name.includes(colStr)) return { bg: '#F0F4C3', text: '#F57F17', color: 'orange' }
  if (columnMapping.value.type.includes(colStr)) return { bg: '#FCE4EC', text: '#C2185B', color: 'red' }
  if (columnMapping.value.amount.includes(colStr)) return { bg: '#E8F5E9', text: '#388E3C', color: 'green' }
  if (columnMapping.value.rate.includes(colStr)) return { bg: '#F3E5F5', text: '#7B1FA2', color: 'purple' }
  if (columnMapping.value.category.includes(colStr)) return { bg: '#F5F5F5', text: '#616161', color: 'grey' }
  return { bg: 'transparent', text: 'inherit', color: '' }
}

function getColumnHeaderStyle(col: string): string {
  const colors = getColumnColor(col)
  return `background-color: ${colors.bg}; color: ${colors.text}; font-weight: bold;`
}

function getColumnBodyStyle(col: string): string {
  const colors = getColumnColor(col)
  return `background-color: ${colors.bg};`
}

function getColumnHeaderStyleByIndex(idx: number): string {
  const colors = getColumnColorByIndex(idx)
  return `background-color: ${colors.bg}; color: ${colors.text}; font-weight: bold;`
}

function getColumnBodyStyleByIndex(idx: number): string {
  const colors = getColumnColorByIndex(idx)
  return `background-color: ${colors.bg};`
}

watch(activeTab, () => {
  showAdjustments.value = false
})

// Table functions
function addTableRow() {
  const today = new Date().toISOString()
  tableRows.value.push({
    date: today.split('T')[0] || today,
    name: '',
    type: 'expense',
    amount: 0,
    rate: needsRateForSelectedAccount.value ? 1 : null,
    category_id: null,
    account_name: '',
    from_account_name: '',
    to_account_name: ''
  })
}

function removeTableRow(idx: number) {
  tableRows.value.splice(idx, 1)
}

// Excel parser
function handleExcelFile(file: File | null) {
  if (!file) {
    excelParsedRows.value = []
    excelRawRows.value = []
    excelDetectedColumns.value = []
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const workbook = xlsxRead(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0] || workbook.SheetNames[0]
      if (!sheetName) {
        Notify.create({ type: 'warning', message: 'No se encontraron hojas en el archivo Excel' })
        return
      }
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) {
        Notify.create({ type: 'warning', message: 'La hoja no contiene datos' })
        return
      }
      const json = xlsxUtils.sheet_to_json(sheet)

      excelRawRows.value = json as Array<Record<string, unknown>>
      const columns = new Set<string>()
      excelRawRows.value.forEach((row) => {
        Object.keys(row).forEach((key) => columns.add(String(key)))
      })
      excelDetectedColumns.value = Array.from(columns)
      initColumnMappingDefaults()
      applyColumnMapping()
      showAdjustments.value = false
    } catch (err) {
      console.error('Error parsing Excel', err)
      Notify.create({ type: 'negative', message: 'Error al parsear Excel' })
    }
  }
  reader.readAsBinaryString(file)
}

// Text parser
function handleTextInput(value: string | number | null) {
  const strValue = value != null ? String(value) : ''
  if (!strValue.trim()) {
    textParsedRows.value = []
    textRawRows.value = []
    return
  }
  const lines = strValue.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const sep = textSeparator.value
  textRawRows.value = lines.map((line) => line.split(sep).map(p => p.trim()))
  initColumnMappingDefaults()
  applyColumnMapping()
  showAdjustments.value = false
}

function initColumnMappingDefaults() {
  if (activeTab.value === 'excel') {
    const findCol = (candidates: string[]): string[] => {
      const lowered = excelDetectedColumns.value.map((c) => ({ raw: c, norm: c.toLowerCase() }))
      const found = lowered.find((c) => candidates.includes(c.norm))
      return found ? [found.raw] : []
    }
    columnMapping.value = {
      date: findCol(['fecha', 'date']),
      name: findCol(['concepto', 'name']),
      type: findCol(['tipo', 'type']),
      amount: findCol(['monto', 'amount']),
      rate: findCol(['tasa', 'rate']),
      category: findCol(['categoria', 'categoría', 'category']),
      account: findCol(['cuenta', 'account']),
      from_account: findCol(['cuentaorigen', 'cuenta origen', 'from_account', 'fromaccount', 'origen']),
      to_account: findCol(['cuentadestino', 'cuenta destino', 'to_account', 'toaccount', 'destino'])
    }
    return
  }

  if (activeTab.value === 'text') {
    columnMapping.value = {
      date: ['0'],
      name: ['1'],
      type: ['2'],
      amount: ['3'],
      rate: ['4'],
      category: ['5'],
      account: [],
      from_account: [],
      to_account: []
    }
  }
}

function applyColumnMapping() {
  // Helper: concatenar múltiples columnas
  const concatColumns = (row: Record<string, unknown>, colNames: string[]): string => {
    return colNames
      .map((col) => safeText(row[col]).trim())
      .filter((val) => val.length > 0)
      .join(' ')
  }

  const concatColumnsText = (parts: string[], indices: number[]): string => {
    return indices
      .filter((idx) => idx >= 0 && idx < parts.length)
      .map((idx) => safeText(parts[idx]).trim())
      .filter((val) => val.length > 0)
      .join(' ')
  }

  if (activeTab.value === 'excel') {
    excelParsedRows.value = excelRawRows.value.map((row, idx) => {
      const mapped: Record<string, unknown> = {
        Fecha: columnMapping.value.date.length > 0 ? concatColumns(row, columnMapping.value.date) : '',
        Concepto: columnMapping.value.name.length > 0 ? concatColumns(row, columnMapping.value.name) : '',
        Tipo: columnMapping.value.type.length > 0 ? concatColumns(row, columnMapping.value.type) : '',
        Monto: columnMapping.value.amount.length > 0 ? concatColumns(row, columnMapping.value.amount) : '',
        Tasa: columnMapping.value.rate.length > 0 ? concatColumns(row, columnMapping.value.rate) || null : null,
        Categoría: columnMapping.value.category.length > 0 ? concatColumns(row, columnMapping.value.category) : '',
        Cuenta: columnMapping.value.account.length > 0 ? concatColumns(row, columnMapping.value.account) : '',
        CuentaOrigen: columnMapping.value.from_account.length > 0 ? concatColumns(row, columnMapping.value.from_account) : '',
        CuentaDestino: columnMapping.value.to_account.length > 0 ? concatColumns(row, columnMapping.value.to_account) : ''
      }
      return normalizeRow(mapped, `excel-${idx}`)
    })
    if (autoApplyCategoryMappings.value) {
      applyCategoryMappingsToRows(excelParsedRows.value)
    }
    Notify.create({ type: 'positive', message: 'Mapeo aplicado a filas Excel' })
    return
  }

  if (activeTab.value === 'text') {
    const safeIndex = (value: string) => {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : -1
    }

    const idxDate = columnMapping.value.date.map(safeIndex)
    const idxName = columnMapping.value.name.map(safeIndex)
    const idxType = columnMapping.value.type.map(safeIndex)
    const idxAmount = columnMapping.value.amount.map(safeIndex)
    const idxRate = columnMapping.value.rate.map(safeIndex)
    const idxCategory = columnMapping.value.category.map(safeIndex)
    const idxAccount = columnMapping.value.account.map(safeIndex)
    const idxFromAccount = columnMapping.value.from_account.map(safeIndex)
    const idxToAccount = columnMapping.value.to_account.map(safeIndex)

    textParsedRows.value = textRawRows.value.map((parts, idx) => {
      const mapped: Record<string, unknown> = {
        Fecha: concatColumnsText(parts, idxDate),
        Concepto: concatColumnsText(parts, idxName),
        Tipo: concatColumnsText(parts, idxType),
        Monto: concatColumnsText(parts, idxAmount),
        Tasa: concatColumnsText(parts, idxRate) || null,
        Categoría: concatColumnsText(parts, idxCategory),
        Cuenta: concatColumnsText(parts, idxAccount),
        CuentaOrigen: concatColumnsText(parts, idxFromAccount),
        CuentaDestino: concatColumnsText(parts, idxToAccount)
      }
      return normalizeRow(mapped, `text-${idx}`)
    })
    if (autoApplyCategoryMappings.value) {
      applyCategoryMappingsToRows(textParsedRows.value)
    }
    Notify.create({ type: 'positive', message: 'Mapeo aplicado a filas de texto' })
  }
}

function applyCategoryMappings() {
  if (activeTab.value !== 'excel' && activeTab.value !== 'text') {
    return
  }

  const rows = activeTab.value === 'excel' ? excelParsedRows.value : textParsedRows.value
  applyCategoryMappingsToRows(rows)

  Notify.create({ type: 'positive', message: 'Categorías aplicadas a filas detectadas' })
}

function goToAdjustments() {
  if (!hasData.value) return
  showAdjustments.value = true
  defaultRate.value = defaultRate.value > 0 ? defaultRate.value : 1
  detectedCategoryNames.value.forEach((name) => {
    if (!(name in categoryMappings.value)) {
      categoryMappings.value[name] = null
    }
  })
}

// Normalize row from different sources
function normalizeRow(row: Record<string, unknown>, clientId: string) {
  const dateRaw = row.Fecha || row.fecha || row.Date || row.date
  const date = normalizeDateValue(dateRaw)
  const nameRaw = row.Concepto || row.concepto || row.Name || row.name
  const name = typeof nameRaw === 'string' || typeof nameRaw === 'number' ? String(nameRaw) : ''
  const typeRaw = row.Tipo || row.tipo || row.Type || row.type
  const type = normalizeTypeValue(typeRaw)
  const amountRaw = row.Monto || row.monto || row.Amount || row.amount
  const amountStr = typeof amountRaw === 'string' ? amountRaw : (typeof amountRaw === 'number' ? String(amountRaw) : '0')
  const amount = parseFloat(amountStr.replace(',', '.'))
  const categoryNameRaw = row.Categoría || row.categoria || row.Category || row.category
  const categoryName = typeof categoryNameRaw === 'string' || typeof categoryNameRaw === 'number' ? String(categoryNameRaw) : ''
  const rateRaw = row.Tasa || row.tasa || row.Rate || row.rate
  const rate = typeof rateRaw === 'string' || typeof rateRaw === 'number' ? parseFloat(String(rateRaw)) : null
  const accountNameRaw = row.Cuenta || row.cuenta || row.Account || row.account
  const accountName = typeof accountNameRaw === 'string' || typeof accountNameRaw === 'number' ? String(accountNameRaw) : ''
  const fromAccountNameRaw = row.CuentaOrigen || row.cuentaOrigen || row.FromAccount || row.from_account
  const fromAccountName = typeof fromAccountNameRaw === 'string' || typeof fromAccountNameRaw === 'number' ? String(fromAccountNameRaw) : ''
  const toAccountNameRaw = row.CuentaDestino || row.cuentaDestino || row.ToAccount || row.to_account
  const toAccountName = typeof toAccountNameRaw === 'string' || typeof toAccountNameRaw === 'number' ? String(toAccountNameRaw) : ''
  
  return {
    date,
    name,
    type,
    amount,
    category_name: categoryName,
    rate,
    account_name: accountName,
    from_account_name: fromAccountName,
    to_account_name: toAccountName,
    client_row_id: clientId
  }
}

// Build payload
function buildPayload(dryRun: boolean) {
  if (!selectedAccountId.value) {
    throw new Error('Debes seleccionar una cuenta')
  }
  
  // Auto-apply default rate if needed and not already applied
  if (needsRateForSelectedAccount.value && defaultRate.value > 0) {
    const applyDefaultRateIfMissing = (rows: Array<Record<string, unknown>>) => {
      rows.forEach((row) => {
        const current = Number(row.rate)
        // Only apply if rate is missing or invalid
        if (!Number.isFinite(current) || current <= 0) {
          row.rate = Number(defaultRate.value)
        }
      })
    }
    
    if (activeTab.value === 'table') {
      applyDefaultRateIfMissing(tableRows.value as unknown as Array<Record<string, unknown>>)
    } else if (activeTab.value === 'excel') {
      applyDefaultRateIfMissing(excelParsedRows.value)
    } else if (activeTab.value === 'text') {
      applyDefaultRateIfMissing(textParsedRows.value)
    }
  }
  
  let rows: Array<TransactionBulkRow> = []
  
  if (activeTab.value === 'table') {
    rows = tableRows.value.map((row, idx) => buildRowPayload(row, `table-${idx}`))
  } else if (activeTab.value === 'excel') {
    rows = excelParsedRows.value.map((row) => buildRowPayloadFromNormalized(row))
  } else if (activeTab.value === 'text') {
    rows = textParsedRows.value.map((row) => buildRowPayloadFromNormalized(row))
  }
  
  return {
    mode: activeTab.value,
    dry_run: dryRun,
    rows
  }
}

function buildRowPayload(row: Record<string, unknown>, clientId: string): TransactionBulkRow {
  const normalizedType = normalizeTypeValue(row.type)
  const isExpense = normalizedType === 'expense'
  const amount = isExpense ? -Math.abs(Number(row.amount)) : Math.abs(Number(row.amount))
  const nameValue = typeof row.name === 'string' || typeof row.name === 'number' ? String(row.name) : ''
  const rate = row.rate !== null && row.rate !== undefined ? Number(row.rate) : 1
  const normalizedDate = normalizeDateValue(row.date)
  const accountId = selectedAccountId.value as number
  const payments: Array<{ account_id: number; amount: number; rate: number }> = [
    { account_id: accountId, amount, rate }
  ]
  
  return {
    name: nameValue,
    date: normalizedDate + ' 12:00:00',
    category_id: row.category_id as number | null,
    include_in_balance: true,
    items: [
      {
        name: nameValue,
        amount: amount
      }
    ],
    payments,
    client_row_id: clientId
  }
}

function buildRowPayloadFromNormalized(row: Record<string, unknown>): TransactionBulkRow {
  const normalizedType = normalizeTypeValue(row.type)
  const isExpense = normalizedType === 'expense'
  const amount = isExpense ? -Math.abs(Number(row.amount)) : Math.abs(Number(row.amount))
  const nameValue = typeof row.name === 'string' || typeof row.name === 'number' ? String(row.name) : ''
  const clientRowId = typeof row.client_row_id === 'string' || typeof row.client_row_id === 'number' ? String(row.client_row_id) : ''
  const rate = row.rate !== null && row.rate !== undefined ? Number(row.rate) : 1
  const normalizedDate = normalizeDateValue(row.date)
  
  const explicitCategoryId = Number(row.category_id)
  const hasExplicitCategoryId = Number.isFinite(explicitCategoryId) && explicitCategoryId > 0
  const category = allCategories.value.find((c: { id: number; name: string }) =>
    c.name.toLowerCase() === String(row.category_name).toLowerCase()
  )

  const accountId = selectedAccountId.value as number
  const payments: Array<{ account_id: number; amount: number; rate: number }> = [
    { account_id: accountId, amount, rate }
  ]
  
  return {
    name: nameValue,
    date: normalizedDate + ' 12:00:00',
    category_id: hasExplicitCategoryId ? explicitCategoryId : (category?.id || null),
    include_in_balance: true,
    items: [
      {
        name: nameValue,
        amount: amount
      }
    ],
    payments,
    client_row_id: clientRowId
  }
}

// Handlers
async function handleDryRun() {
  processingDryRun.value = true
  try {
    // Notify if auto-applying rate
    if (needsRateForSelectedAccount.value && defaultRate.value > 0) {
      Notify.create({
        type: 'info',
        message: `📊 Tasa de cambio ${defaultRate.value} aplicada automáticamente a filas sin tasa`,
        position: 'top'
      })
    }
    
    const payload = buildPayload(true)
    const response = await transactionsStore.bulkAddTransactions(payload)
    bulkResult.value = response.data?.data
    showResults.value = true
    if (bulkResult.value) {
      notifyCompletion(
        'Vista previa de carga masiva lista',
        `Total: ${bulkResult.value.total}, válidas: ${bulkResult.value.created}, con error: ${bulkResult.value.failed}`
      )
    }
  } catch (err: unknown) {
    console.error('Dry run error', err)
    const error = err as { response?: { data?: { message?: string } } }
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error en vista previa'
    })
  } finally {
    processingDryRun.value = false
  }
}

async function handleImport() {
  processingImport.value = true
  try {
    // Notify if auto-applying rate
    if (needsRateForSelectedAccount.value && defaultRate.value > 0) {
      Notify.create({
        type: 'info',
        message: `📊 Tasa de cambio ${defaultRate.value} aplicada automáticamente a filas sin tasa`,
        position: 'top'
      })
    }
    
    const payload = buildPayload(false)
    const response = await transactionsStore.bulkAddTransactions(payload)
    bulkResult.value = response.data?.data
    showResults.value = true
    
    if (bulkResult.value?.created && Number(bulkResult.value.created) > 0) {
      const created = Number(bulkResult.value.created)
      Notify.create({
        type: 'positive',
        message: `${created} transacciones creadas exitosamente`
      })
      emit('imported', created)
    }

    if (bulkResult.value) {
      notifyCompletion(
        'Importación masiva finalizada',
        `Creadas: ${bulkResult.value.created}, fallidas: ${bulkResult.value.failed}, total: ${bulkResult.value.total}`
      )
    }
  } catch (err: unknown) {
    console.error('Import error', err)
    const error = err as { response?: { data?: { message?: string } } }
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Error al importar'
    })
  } finally {
    processingImport.value = false
  }
}

function closeResults() {
  if (bulkResult.value?.created && bulkResult.value.created > 0) {
    // Close main dialog on success
    showDialog.value = false
    emit('close')
  }
}

// Filter functions for select inputs
const filteredAccounts = ref(accountOptions.value)
const filteredCategories = ref(categoryOptions.value)

const typeOptions = [
  { label: 'Ingreso', value: 'income' },
  { label: 'Egreso', value: 'expense' },
  { label: 'Transferencia', value: 'transfer' }
]
const filteredTypes = ref(typeOptions)

function filterAccounts(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredAccounts.value = needle
      ? accountOptions.value.filter((v: { name: string }) => v.name.toLowerCase().includes(needle))
      : accountOptions.value
  })
}

function filterTypes(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredTypes.value = needle
      ? typeOptions.filter((v) => v.label.toLowerCase().includes(needle))
      : typeOptions
  })
}

function filterCategories(val: string, update: (fn: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    filteredCategories.value = needle
      ? categoryOptions.value.filter((v: { name: string }) => v.name.toLowerCase().includes(needle))
      : categoryOptions.value
  })
}

// Watch para actualizar filtros cuando cambien las opciones
watch(accountOptions, () => { filteredAccounts.value = accountOptions.value })
watch(categoryOptions, () => { filteredCategories.value = categoryOptions.value })
</script>
