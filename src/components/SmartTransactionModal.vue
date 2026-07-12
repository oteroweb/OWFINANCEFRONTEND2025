<template>
  <q-dialog v-model="show" @hide="onHide" @show="onShow"
    :maximized="$q.screen.lt.md"
    transition-show="slide-up" transition-hide="slide-down">
    <div class="stm-wrap" :class="{ 'stm-wrap--mobile': $q.screen.lt.md }">

      <!-- Grab handle (mobile) -->
      <div v-if="$q.screen.lt.md" class="stm-handle" />

      <!-- Header -->
      <div class="stm-header">
        <div>
          <div class="stm-eyebrow">Nuevo movimiento · {{ isProMode ? 'Pro' : 'Lite' }}</div>
          <div class="stm-title">{{ tab === 'write' ? '¿Qué pasó con tu dinero?' : tabConfig[tab].title }}</div>
        </div>
        <button class="stm-close" @click="show = false" aria-label="Cerrar">
          <q-icon name="close" size="22px" />
        </button>
      </div>

      <!-- Method tabs -->
      <div class="stm-tabs">
        <button v-for="m in methods" :key="m.id"
          class="stm-tab" :class="{ 'stm-tab--active': tab === m.id }"
          @click="selectMethod(m.id)">
          <q-icon :name="m.icon" size="16px" />
          {{ m.label }}
        </button>
      </div>

      <!-- AI prefill banner -->
      <div v-if="tab === 'write' && aiSource" class="stm-ai-banner">
        <q-icon name="auto_awesome" size="18px" color="purple" />
        <span>Pre-rellenado desde <strong>{{ aiSource }}</strong> · revisa y confirma</span>
        <button class="stm-ai-banner__clear" @click="aiPrefill = null; aiSource = null">
          <q-icon name="close" size="15px" />
        </button>
      </div>

      <!-- ── ESCRIBIR tab: inline form ── -->
      <div v-if="tab === 'write'" class="stm-body">

        <!-- Type selector -->
        <div class="stm-type-row">
          <button v-for="t in types" :key="t.id"
            class="stm-type-btn" :class="[`stm-type-btn--${t.id}`, { 'stm-type-btn--active': form.type === t.id }]"
            @click="form.type = t.id">
            <q-icon :name="t.icon" size="18px" />
            {{ t.label }}
          </button>
        </div>

        <!-- OWF-186/256/257/258: Ajuste — Cuenta a ajustar + Saldo objetivo + Se creará un ajuste + Motivo -->
        <template v-if="form.type === 'ajuste'">
          <div class="stm-field">
            <label class="stm-label">Cuenta a ajustar</label>
            <q-select v-model="form.account_id" :options="accountOptions" emit-value map-options dense outlined
              placeholder="Seleccionar…" />
          </div>
          <div class="stm-field">
            <label class="stm-label">Saldo objetivo</label>
            <input v-model.number="adjusteTargetBalance" type="number" step="0.01"
              placeholder="0.00" class="stm-amount-input" />
          </div>
          <div v-if="adjusteTargetBalance != null && form.account_id" class="stm-ai-banner">
            <q-icon :name="adjusteDiff >= 0 ? 'trending_up' : 'trending_down'" size="16px" />
            <span>
              Saldo actual: {{ adjusteCurrencySymbol }}{{ Number(adjusteCurrentBalance).toFixed(2) }} →
              Se creará un ajuste de <strong>{{ adjusteDiff >= 0 ? '+' : '' }}{{ adjusteDiff.toFixed(2) }}</strong>
            </span>
          </div>
          <div class="stm-field">
            <label class="stm-label">Motivo</label>
            <input v-model="adjusteMotivo" type="text" placeholder="Ej: Corrección, cuadre de caja…"
              class="stm-text-input" />
          </div>
        </template>

        <!-- Transfer: Desde → Hacia -->
        <template v-else-if="form.type === 'transfer'">
          <!-- OWF-280: Amount hero con currency pills -->
          <div class="stm-amount-field">
            <span class="stm-amount-sym">$</span>
            <input v-model.number="form.amount" type="number" step="0.01" min="0"
              placeholder="0.00" class="stm-amount-hero" />
            <div v-if="currencyOptions.length > 1" class="stm-currency-pills">
              <button v-for="c in currencyOptions" :key="c.value" type="button"
                class="stm-currency-pill"
                :class="{ 'stm-currency-pill--active': form.currency === c.value }"
                @click="form.account_from_id ? undefined : (form.currency = c.value)">
                {{ c.value }}
              </button>
            </div>
          </div>
          <!-- OWF-281: Desde → Hacia side-by-side con flecha -->
          <div class="stm-transfer-accounts">
            <div class="stm-field">
              <label class="stm-label">Desde (origen) <span class="stm-label--req">*</span></label>
              <q-select v-model="form.account_from_id" :options="accountOptions" emit-value map-options dense outlined
                placeholder="Cuenta origen…">
                <template v-slot:prepend><q-icon name="arrow_upward" color="negative" /></template>
              </q-select>
            </div>
            <div class="stm-transfer-arrow">
              <q-icon name="arrow_forward" size="20px" />
            </div>
            <div class="stm-field">
              <label class="stm-label">Hacia (destino) <span class="stm-label--req">*</span></label>
              <q-select v-model="form.account_to_id" :options="accountToOptions" emit-value map-options dense outlined
                placeholder="Cuenta destino…">
                <template v-slot:prepend><q-icon name="arrow_downward" color="positive" /></template>
              </q-select>
            </div>
          </div>
          <!-- OWF-185/250/251: panel de cruce de monedas si origen y destino difieren -->
          <div v-if="transferIsCrossCurrency" class="stm-cross-currency-panel">
            <div class="row items-center q-gutter-xs">
              <q-icon name="currency_exchange" size="16px" />
              <span class="text-caption text-weight-medium">
                Cruce de moneda · {{ transferFromCurrency }} → {{ transferToCurrency }}
              </span>
            </div>
            <div class="stm-field" style="margin-top:8px">
              <label class="stm-label">Tasa ({{ transferFromCurrency }}/{{ transferToCurrency }})</label>
              <input v-model.number="transferRate" type="number" step="0.0001" min="0"
                placeholder="0.0000" class="stm-text-input" />
            </div>
            <div v-if="transferRate && form.amount" class="stm-comm-result">
              <span>Envías {{ transferFromCurrency }} {{ formatMoney(form.amount) }}</span>
              <span>Llega {{ transferToCurrency }} {{ formatMoney(transferConvertedAmount) }}</span>
            </div>
          </div>
        </template>

        <!-- Gasto / Ingreso -->
        <template v-else>
          <!-- Cuenta primero: define la moneda del movimiento (ya no se elige a mano) -->
          <div class="stm-field" v-if="!splitOn">
            <label class="stm-label">Cuenta de origen <span class="stm-label--req">*</span></label>
            <q-select v-model="form.account_id" :options="accountOptions" emit-value map-options dense outlined
              placeholder="Seleccionar…" />
          </div>

          <!-- OWF-280: Amount hero -->
          <div v-if="!itemsOn" class="stm-amount-field">
            <span class="stm-amount-sym">$</span>
            <input v-model.number="form.amount" type="number" step="0.01" min="0"
              placeholder="0.00" class="stm-amount-hero" />
          </div>
          <div v-else class="stm-items-total-banner">
            <span class="stm-label">Total (suma de ítems)</span>
            <span class="stm-items-total-banner__amount">{{ formatMoney(itemsTotal) }}</span>
          </div>

          <!-- OWF-179/259: tasa paralelo (actual) + tasa oficial (BCV) lado a lado + equiv USD -->
          <div v-if="showDualRates" class="stm-row-2">
            <div class="stm-field">
              <label class="stm-label">Tasa paralelo (actual)</label>
              <input v-model.number="rateParalelo" type="number" step="0.0001" min="0"
                placeholder="0.0000" class="stm-text-input" />
              <span v-if="rateParalelo && rateParalelo > 0 && form.amount" class="stm-rate-equiv">
                ≈ ${{ ((form.amount ?? 0) / rateParalelo).toFixed(2) }} USD
              </span>
            </div>
            <div class="stm-field">
              <label class="stm-label">
                Tasa oficial (BCV)
                <span class="stm-badge-hoy">hoy</span>
              </label>
              <input v-model.number="rateOficial" type="number" step="0.0001" min="0"
                placeholder="0.0000" class="stm-text-input" />
              <span v-if="rateOficial && rateOficial > 0 && form.amount" class="stm-rate-equiv">
                ≈ ${{ ((form.amount ?? 0) / rateOficial).toFixed(2) }} USD
              </span>
            </div>
          </div>

          <!-- Concept -->
          <div class="stm-field">
            <label class="stm-label">Concepto</label>
            <input v-model="form.name" type="text" placeholder="Ej: Mercado, Transporte, Nómina…"
              class="stm-text-input" />
          </div>
        </template>

        <!-- OWF-188/244/266: Categoría + Cántaro lado a lado (ocultos en modo Items: se gestionan por línea) -->
        <div v-if="form.type !== 'ajuste' && form.type !== 'transfer' && !itemsOn" class="stm-row-2">
          <div class="stm-field">
            <label class="stm-label">Categoría <span class="stm-label--opt">(opcional)</span></label>
            <CategorySelector v-model="form.category_id" allow-null placeholder="Sin categoría" />
          </div>
          <div class="stm-field">
            <label class="stm-label">Cántaro</label>
            <AnchoredJarChip :category-id="form.category_id" class="stm-jar-chip" />
          </div>
        </div>
        <div v-if="isLiteLayout && form.type === 'income' && !itemsOn" class="stm-field">
          <label class="stm-label">Fecha</label>
          <q-select
            :model-value="dateShortcut"
            :options="dateShortcutOptions"
            emit-value map-options dense outlined
            @update:model-value="onDateShortcutChange"
          >
            <template v-slot:prepend><q-icon :name="dateShortcutOptions.find(o => o.value === dateShortcut)?.icon" /></template>
          </q-select>
          <input v-if="dateShortcut === 'custom'" v-model="form.date" type="datetime-local" class="stm-text-input" style="margin-top:6px" />
        </div>

        <!-- OWF-187: reparto automático por cántaros porcentuales (Lite + Ingreso) -->
        <JarPercentSplitInfo v-if="isLiteLayout && form.type === 'income'" />

        <!-- OWF-181: Proveedor + Fecha comparten fila (excepto Lite+Ingreso, donde Fecha ya se muestra junto a Categoría — OWF-188) -->
        <div v-if="form.type !== 'ajuste' && form.type !== 'transfer'"
          :class="(isLiteLayout && form.type === 'income') ? '' : 'stm-row-2'">
          <div class="stm-field">
            <label class="stm-label">Proveedor / Comercio <span class="stm-label--opt">(opcional)</span></label>
            <q-select
              v-model="form.provider_id"
              :options="providerOptions"
              emit-value map-options
              use-input
              clearable
              dense outlined
              placeholder="Buscar proveedor…"
              option-value="id"
              option-label="name"
              @filter="filterProviders"
            >
              <template v-slot:prepend><q-icon name="storefront" /></template>
            </q-select>
          </div>
          <div v-if="!(isLiteLayout && form.type === 'income')" class="stm-field">
            <label class="stm-label">Fecha</label>
            <q-select
              :model-value="dateShortcut"
              :options="dateShortcutOptions"
              emit-value map-options dense outlined
              @update:model-value="onDateShortcutChange"
            >
              <template v-slot:prepend><q-icon :name="dateShortcutOptions.find(o => o.value === dateShortcut)?.icon" /></template>
            </q-select>
            <input v-if="dateShortcut === 'custom'" v-model="form.date" type="datetime-local" class="stm-text-input" style="margin-top:6px" />
          </div>
        </div>

        <!-- Transfer / Ajuste: fecha en fila propia -->
        <div class="stm-field" v-if="form.type === 'transfer'">
          <label class="stm-label">Fecha</label>
          <q-select
            :model-value="dateShortcut"
            :options="dateShortcutOptions"
            emit-value map-options dense outlined
            @update:model-value="onDateShortcutChange"
          >
            <template v-slot:prepend><q-icon :name="dateShortcutOptions.find(o => o.value === dateShortcut)?.icon" /></template>
          </q-select>
          <input v-if="dateShortcut === 'custom'" v-model="form.date" type="datetime-local" class="stm-text-input" style="margin-top:6px" />
        </div>

        <!-- Etiquetas -->
        <div class="stm-field">
          <label class="stm-label">Etiquetas <span class="stm-label--opt">(opcional)</span></label>
          <div class="stm-tags-row">
            <button
              v-for="tag in visibleTags"
              :key="tag.id"
              type="button"
              class="stm-tag-chip"
              :class="{ 'stm-tag-chip--active': form.tags.includes(tag.id) }"
              :style="form.tags.includes(tag.id)
                ? { background: `color-mix(in srgb, ${tag.color} 18%, transparent)`, borderColor: tag.color, color: tag.color }
                : {}"
              @click="toggleTag(tag.id)"
            >
              <span class="material-icons" style="font-size:14px">{{ tag.icon }}</span>
              {{ tag.name }}
            </button>
            <button
              v-if="!showNewTagForm"
              type="button"
              class="stm-tag-chip stm-tag-chip--add"
              @click="showNewTagForm = true"
            >
              <span class="material-icons" style="font-size:14px">add</span>
              Nueva etiqueta
            </button>
            <div v-if="showNewTagForm" class="stm-new-tag-form">
              <input v-model="newTagName" class="stm-text-input stm-text-input--flex" placeholder="Nombre de etiqueta" @keydown.enter.prevent="createTag" />
              <button type="button" class="stm-btn stm-btn--primary stm-btn--xs" :disabled="!newTagName.trim()" @click="createTag">
                <q-icon name="check" size="14px" />
              </button>
              <button type="button" class="stm-btn stm-btn--ghost stm-btn--xs" @click="showNewTagForm = false; newTagName = ''">
                <q-icon name="close" size="14px" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pro features (solo layout_mode=pro) -->
        <template v-if="isProMode && form.type !== 'ajuste'">
          <!-- OWF-253/286: card-row toggles — fila en desktop (rowDir='row' en rediseno), columna en mobile -->
          <div v-if="form.type !== 'transfer'" class="stm-pro-card-toggles">
            <button type="button"
              class="stm-pro-card-toggle" :class="{ 'stm-pro-card-toggle--on': proPanel === 'split' }"
              @click="toggleProPanel(proPanel === 'split' ? null : 'split')">
              <span class="stm-pro-card-toggle__icon"><q-icon name="call_split" size="18px" /></span>
              <span class="stm-pro-card-toggle__texts">
                <span class="stm-pro-card-toggle__label">Pago múltiple</span>
                <span class="stm-pro-card-toggle__sub">Varias cuentas</span>
              </span>
              <q-toggle :model-value="proPanel === 'split'" color="primary" dense @click.stop
                @update:model-value="(v) => toggleProPanel(v ? 'split' : null)" />
            </button>
            <button type="button"
              class="stm-pro-card-toggle" :class="{ 'stm-pro-card-toggle--on': proPanel === 'items' }"
              @click="toggleProPanel(proPanel === 'items' ? null : 'items')">
              <span class="stm-pro-card-toggle__icon"><q-icon name="receipt_long" size="18px" /></span>
              <span class="stm-pro-card-toggle__texts">
                <span class="stm-pro-card-toggle__label">Detalle / factura</span>
                <span class="stm-pro-card-toggle__sub">Ítems + impuestos</span>
              </span>
              <q-toggle :model-value="proPanel === 'items'" color="primary" dense @click.stop
                @update:model-value="(v) => toggleProPanel(v ? 'items' : null)" />
            </button>
            <button type="button"
              class="stm-pro-card-toggle" :class="{ 'stm-pro-card-toggle--on': proPanel === 'shared' }"
              @click="toggleProPanel(proPanel === 'shared' ? null : 'shared')">
              <span class="stm-pro-card-toggle__icon"><q-icon name="pie_chart_outline" size="18px" /></span>
              <span class="stm-pro-card-toggle__texts">
                <span class="stm-pro-card-toggle__label">Gasto compartido</span>
                <span class="stm-pro-card-toggle__sub">Divide entre categorías</span>
              </span>
              <q-toggle :model-value="proPanel === 'shared'" color="primary" dense @click.stop
                @update:model-value="(v) => toggleProPanel(v ? 'shared' : null)" />
            </button>
          </div>

          <!-- OWF-286: Cobrar comisión — separado del grupo de 3, siempre su propia fila (matches TfCommission en rediseno) -->
          <button type="button"
            class="stm-pro-card-toggle" :class="{ 'stm-pro-card-toggle--on': proPanel === 'comision' }"
            @click="toggleProPanel(proPanel === 'comision' ? null : 'comision')">
            <span class="stm-pro-card-toggle__icon"><q-icon name="percent" size="18px" /></span>
            <span class="stm-pro-card-toggle__texts">
              <span class="stm-pro-card-toggle__label">Cobrar comisión</span>
              <span class="stm-pro-card-toggle__sub">Pago móvil, fija o porcentaje</span>
            </span>
            <q-toggle :model-value="proPanel === 'comision'" color="primary" dense @click.stop
              @update:model-value="(v) => toggleProPanel(v ? 'comision' : null)" />
          </button>

          <!-- Comisión panel -->
          <div v-if="proPanel === 'comision'" class="stm-pro-panel">
            <div class="stm-comm-types">
              <button v-for="ct in comisionTipos" :key="ct.value"
                class="stm-comm-type" :class="{ 'stm-comm-type--active': comision.tipo === ct.value }"
                @click="comision.tipo = ct.value">
                <span class="material-icons">{{ ct.icon }}</span>
                <span>{{ ct.label }}</span>
              </button>
            </div>
            <div v-if="comision.tipo === 'fijo'" class="stm-comm-input-row">
              <span class="stm-comm-sym">$</span>
              <input v-model.number="comision.valor" type="number" inputmode="decimal" class="stm-text-input stm-text-input--money" min="0" placeholder="0.00" />
              <span class="stm-comm-hint">monto fijo</span>
            </div>
            <div v-else-if="comision.tipo === 'porcentaje'" class="stm-comm-input-row">
              <input v-model.number="comision.valor" type="number" inputmode="decimal" class="stm-text-input stm-text-input--money" min="0" placeholder="1.50" />
              <span class="stm-comm-sym">%</span>
            </div>
            <div v-else class="stm-comm-pagomovil">
              <span class="material-icons" style="font-size:17px;color:var(--info-fg)">smartphone</span>
              <span>Tarifa P2P <strong>0.30%</strong> · mín. Bs 2 · BCV</span>
            </div>
            <div v-if="comisionCalculada > 0" class="stm-comm-result">
              <span>Comisión ≈ <strong>{{ formatMoney(comisionCalculada) }}</strong></span>
              <span>Total <strong>{{ formatMoney((form.amount ?? 0) + comisionCalculada) }}</strong></span>
            </div>
          </div>

          <!-- Split panel -->
          <div v-if="proPanel === 'split'" class="stm-pro-panel">
            <div v-for="(pago, i) in splitPagos" :key="i" class="stm-split-row">
              <div class="stm-split-row__fields">
                <div class="stm-field" style="flex:2">
                  <label class="stm-label">Cuenta {{ i + 1 }}</label>
                  <q-select v-model="pago.account_id" :options="accountOptions" emit-value map-options dense outlined clearable placeholder="Seleccionar…" />
                </div>
                <div class="stm-field" style="flex:1">
                  <label class="stm-label">Monto</label>
                  <input v-model.number="pago.amount" type="number" class="stm-text-input" min="0" />
                </div>
                <button v-if="splitPagos.length > 2" class="stm-pro-rm" style="margin-top:20px" @click="splitPagos.splice(i, 1)">
                  <span class="material-icons" style="font-size:16px">close</span>
                </button>
              </div>
              <div v-if="splitAccountCurrency(pago.account_id) && splitAccountCurrency(pago.account_id) !== 'USD'" class="stm-split-rate">
                <span class="material-icons" style="font-size:14px;color:var(--fg-3)">currency_exchange</span>
                <span class="stm-label" style="margin:0">Tasa {{ splitAccountCurrency(pago.account_id) }}/USD</span>
                <input v-model.number="pago.rate" type="number" inputmode="decimal" class="stm-text-input stm-text-input--rate" min="0" step="0.01" placeholder="1.00" />
                <span v-if="pago.rate && pago.amount" class="stm-split-rate__equiv">
                  ≈ {{ formatMoney(pago.amount / pago.rate) }} USD
                </span>
              </div>
            </div>
            <div class="stm-pro-summary">
              Suma: <strong>{{ formatMoney(splitTotal) }}</strong>
              <span :style="{ color: Math.abs(splitTotal - (form.amount ?? 0)) < 0.01 ? '#10b981' : '#ef4444' }">
                / {{ formatMoney(form.amount ?? 0) }}
              </span>
            </div>
            <button class="stm-pro-add" @click="splitPagos.push({ account_id: null, amount: 0, rate: 1 })">
              <span class="material-icons" style="font-size:15px">add</span> Agregar cuenta
            </button>
          </div>

          <!-- Items/factura panel -->
          <div v-if="proPanel === 'items'" class="stm-pro-panel">
            <div v-for="(item, i) in facturaItems" :key="i" class="stm-items-block">
              <div class="stm-items-row">
                <input v-model="item.name" class="stm-text-input stm-text-input--flex" placeholder="Artículo" />
                <input v-model.number="item.quantity" type="number" class="stm-text-input stm-text-input--qty" min="1" placeholder="Qty" />
                <input v-model.number="item.price" type="number" class="stm-text-input stm-text-input--price" min="0" placeholder="Precio" />
                <input v-model.number="item.tax" type="number" class="stm-text-input stm-text-input--tax" min="0" max="100" placeholder="IVA%" title="Impuesto %" />
                <button class="stm-pro-rm" @click="facturaItems.splice(i, 1)">
                  <span class="material-icons" style="font-size:16px">close</span>
                </button>
              </div>
              <div class="stm-items-cat">
                <CategorySelector v-model="item.category_id" allow-null placeholder="Categoría del artículo…" />
                <AnchoredJarChip :category-id="item.category_id" />
              </div>
            </div>
            <div class="stm-pro-summary">
              Total artículos: <strong>{{ formatMoney(itemsTotal) }}</strong>
            </div>
            <button class="stm-pro-add" @click="facturaItems.push({ name: '', quantity: 1, price: 0, tax: 0, category_id: null })">
              <span class="material-icons" style="font-size:15px">add</span> Agregar artículo
            </button>
          </div>

          <!-- Gasto compartido panel -->
          <div v-if="proPanel === 'shared'" class="stm-pro-panel">
            <div v-for="(sc, i) in sharedCats" :key="i" class="stm-split-row__fields" style="margin-bottom:8px">
              <div class="stm-field" style="flex:2">
                <label class="stm-label">Categoría {{ i + 1 }}</label>
                <CategorySelector v-model="sc.category_id" allow-null placeholder="Sin categoría" />
              </div>
              <div class="stm-field" style="flex:1">
                <label class="stm-label">Monto</label>
                <input v-model.number="sc.amount" type="number" class="stm-text-input" min="0" placeholder="0.00" />
              </div>
              <button v-if="sharedCats.length > 2" class="stm-pro-rm" style="margin-top:20px" @click="sharedCats.splice(i, 1)">
                <span class="material-icons" style="font-size:16px">close</span>
              </button>
            </div>
            <div class="stm-pro-summary">
              Suma: <strong>{{ formatMoney(sharedTotal) }}</strong>
              <span :style="{ color: Math.abs(sharedTotal - (form.amount ?? 0)) < 0.01 ? '#10b981' : '#ef4444' }">
                / {{ formatMoney(form.amount ?? 0) }}
              </span>
            </div>
            <button class="stm-pro-add" @click="sharedCats.push({ category_id: null, amount: 0 })">
              <span class="material-icons" style="font-size:15px">add</span> Agregar categoría
            </button>
          </div>
        </template>

        <!-- OWF-248: Concepto de Transferencia al fondo (después de Pro features) -->
        <div v-if="form.type === 'transfer'" class="stm-field">
          <label class="stm-label">Concepto <span class="stm-label--opt">(opcional)</span></label>
          <input v-model="form.name" type="text" placeholder="Ej: Ahorro del mes…" class="stm-text-input" />
        </div>

        <!-- OWF-254/263: Afecta el saldo — card con subtítulo, al fondo -->
        <button type="button"
          class="stm-pro-card-toggle stm-pro-card-toggle--balance"
          :class="{ 'stm-pro-card-toggle--on': includeInBalance }"
          @click="includeInBalance = !includeInBalance">
          <span class="stm-pro-card-toggle__icon">
            <q-icon name="account_balance_wallet" size="18px" />
          </span>
          <span class="stm-pro-card-toggle__texts">
            <span class="stm-pro-card-toggle__label">Afecta el saldo</span>
            <span class="stm-pro-card-toggle__sub">Desactiva para movimientos informativos</span>
          </span>
          <q-toggle v-model="includeInBalance" color="primary" dense @click.stop />
        </button>

        <!-- Adjuntar foto / soporte (recibo, comprobante) — UI-only, ver OWF-283 para wiring de subida real -->
        <div v-if="form.type === 'expense' || form.type === 'income'">
          <label class="stm-label">Foto / soporte <span class="stm-label--opt">(opcional)</span></label>
          <input ref="attachmentInput" type="file" accept="image/*,.pdf" class="stm-attachment-input-hidden"
            @change="onAttachmentPicked" />
          <button v-if="!attachment" type="button" class="stm-attachment-picker" @click="attachmentInput?.click()">
            <q-icon name="add_a_photo" size="19px" />
            Adjuntar foto o comprobante
          </button>
          <div v-else class="stm-attachment-preview">
            <img v-if="attachment.url" :src="attachment.url" :alt="attachment.name" />
            <span class="stm-attachment-preview__name">{{ attachment.name }}</span>
            <button type="button" @click="attachmentInput?.click()" title="Cambiar"><q-icon name="edit" size="18px" /></button>
            <button type="button" @click="attachment = null" title="Quitar"><q-icon name="close" size="18px" /></button>
          </div>
        </div>

        <!-- OWF-184: preview en lenguaje natural + validaciones + estados draft/valid/error -->
        <TfReviewCard
          :type-label="typeLabelForReview"
          :is-adjuste="form.type === 'ajuste'"
          :is-transfer="form.type === 'transfer'"
          :amount="form.type === 'ajuste' ? adjusteDiff : form.amount"
          :name="form.name"
          :category-name="categoryName"
          :account-name="accountName"
          :from-account-name="fromAccountName"
          :to-account-name="toAccountName"
          :datetime="form.date"
          :adjuste-account-name="accountName"
          :adjuste-target-balance="adjusteTargetBalance"
          :adjuste-motivo="adjusteMotivo"
          :validation-errors="reviewValidationErrors"
          :debug-payload="debugPayloadPreview"
        />

        <!-- Error -->
        <div v-if="saveError" class="stm-error">{{ saveError }}</div>

        <!-- Actions -->
        <div class="stm-footer">
          <button class="stm-btn stm-btn--ghost" @click="show = false">Cancelar</button>
          <button class="stm-btn stm-btn--primary" :class="{ 'stm-btn--success': savedFlash }" :disabled="saving || !canSave || savedFlash" @click="save">
            <q-spinner v-if="saving" size="16px" color="white" />
            <q-icon v-else-if="savedFlash" name="check_circle" size="18px" />
            <q-icon v-else name="check" size="18px" />
            {{ saving ? 'Guardando…' : savedFlash ? 'Registrado' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- ── VOZ tab ── -->
      <div v-else-if="tab === 'voice'" class="stm-body stm-body--centered">
        <div v-if="!voiceResult" class="stm-voice-area">
          <div v-if="voiceRecording" class="stm-voice-pulse" @click="stopVoice">
            <q-icon name="mic" size="38px" color="negative" />
          </div>
          <button v-else class="stm-voice-btn" @click="startVoice">
            <q-icon name="mic" size="38px" color="white" />
          </button>
          <span class="stm-voice-label">{{ voiceRecording ? 'Escuchando… (toca para parar)' : 'Toca para dictar' }}</span>
          <span class="stm-voice-sub">Ej: "Gasté 45 dólares en Whole Foods con BofA"</span>
          <div v-if="voiceTranscript" class="stm-voice-transcript">"{{ voiceTranscript }}"</div>
          <div v-if="voiceLoading" class="stm-voice-analyzing">
            <q-spinner size="20px" color="primary" /> Analizando…
          </div>
          <div v-if="voiceError" class="stm-error">{{ voiceError }}</div>
        </div>
        <div v-else class="stm-ai-result">
          <q-icon name="check_circle" size="40px" color="positive" />
          <div class="stm-ai-result__amount">{{ voiceResult.data.currency }} {{ voiceResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ voiceResult.data.description }}</div>
          <div class="stm-ai-result__conf">Confianza: {{ Math.round((voiceResult.data.confidence ?? 0) * 100) }}%</div>
          <div class="stm-footer">
            <button class="stm-btn stm-btn--ghost" @click="voiceResult = null; voiceTranscript = ''">Reintentar</button>
            <button class="stm-btn stm-btn--primary" @click="applyAiResult(voiceResult, 'voz')">
              <q-icon name="edit_note" size="18px" /> Editar y guardar
            </button>
          </div>
        </div>
      </div>

      <!-- ── FOTO tab ── -->
      <div v-else-if="tab === 'photo'" class="stm-body stm-body--centered">
        <div v-if="!ocrResult">
          <label class="stm-photo-drop" :class="{ 'stm-photo-drop--hover': photoDragOver }"
            @dragover.prevent="photoDragOver = true" @dragleave="photoDragOver = false"
            @drop.prevent="onPhotoDrop">
            <input type="file" accept="image/*,application/pdf" class="stm-file-input" @change="onPhotoSelect" />
            <q-icon name="receipt_long" size="48px" class="stm-photo-icon" />
            <span class="stm-photo-label">Sube o arrastra un comprobante</span>
            <span class="stm-photo-sub">La IA extrae monto, comercio y fecha</span>
            <div class="stm-photo-tags">
              <span v-for="tag in ['Monto', 'Comercio', 'IVA', 'Fecha']" :key="tag" class="stm-photo-tag">{{ tag }}</span>
            </div>
          </label>
          <div v-if="ocrLoading" class="stm-voice-analyzing" style="margin-top:12px">
            <q-spinner size="20px" color="primary" /> Procesando imagen…
          </div>
          <div v-if="ocrError" class="stm-error" style="margin-top:8px">{{ ocrError }}</div>
        </div>
        <div v-else class="stm-ai-result">
          <q-icon name="check_circle" size="40px" color="positive" />
          <div class="stm-ai-result__amount">{{ ocrResult.data.currency }} {{ ocrResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ ocrResult.data.description }}</div>
          <div class="stm-footer">
            <button class="stm-btn stm-btn--ghost" @click="ocrResult = null">Otra foto</button>
            <button class="stm-btn stm-btn--primary" @click="applyAiResult(ocrResult, 'foto de factura')">
              <q-icon name="edit_note" size="18px" /> Editar y guardar
            </button>
          </div>
        </div>
      </div>

      <!-- ── AUTO IA tab ── -->
      <div v-else-if="tab === 'autoai'" class="stm-body">
        <textarea v-model="aiText" rows="4" class="stm-textarea"
          placeholder="Describe o pega texto: 'Pagué $730 en VES a 40.5, mercado del mes con Mercantil, categoría supermercado'" />
        <div v-if="aiError" class="stm-error">{{ aiError }}</div>
        <div v-if="aiTextResult" class="stm-ai-result">
          <q-icon name="auto_awesome" size="32px" color="purple" />
          <div class="stm-ai-result__amount">{{ aiTextResult.data.currency }} {{ aiTextResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ aiTextResult.data.description }}</div>
        </div>
        <div class="stm-footer">
          <button class="stm-btn stm-btn--ghost" @click="show = false">Cancelar</button>
          <button v-if="aiTextResult" class="stm-btn stm-btn--primary" @click="applyAiResult(aiTextResult, 'texto libre')">
            <q-icon name="edit_note" size="18px" /> Editar y guardar
          </button>
          <button v-else class="stm-btn stm-btn--ai" :disabled="aiLoading || !aiText.trim()" @click="runTextAi">
            <q-spinner v-if="aiLoading" size="16px" color="white" />
            <q-icon v-else name="auto_awesome" size="18px" />
            {{ aiLoading ? 'Analizando…' : 'Analizar con IA' }}
          </button>
        </div>
      </div>

    </div>
  </q-dialog>

  <!-- OWF-275: Carga masiva — overlay independiente (el dialog legacy no emite 'close'
       de forma confiable desde su propio botón X, así que no se anida como tab-content). -->
  <TransactionBulkImportDialog
    v-if="showBulkImport"
    @close="showBulkImport = false"
    @imported="onBulkImported"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUiStore } from 'stores/ui';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import { api } from 'src/boot/axios';
import { useTransactionTypesStore } from 'stores/transactionTypes';
import { useTagsStore } from 'stores/tags';
import { useVoiceInput } from 'src/composables/useVoiceInput';
import { useAiExtraction, type ExtractionResult } from 'src/composables/useAiExtraction';
import AnchoredJarChip from 'src/components/AnchoredJarChip.vue';
import CategorySelector from 'src/components/CategorySelector.vue';
import TfReviewCard from 'src/components/TfReviewCard.vue';
import JarPercentSplitInfo from 'src/components/JarPercentSplitInfo.vue';
import TransactionBulkImportDialog from 'src/components/TransactionBulkImportDialog.vue';
import { useUserRates } from 'src/composables/useUserRates';
import { jarForCategory, getCachedJars, loadCategoriesWithJars, loadUserJars } from 'src/utils/txCatalog';

defineOptions({ name: 'SmartTransactionModal' });

const emit = defineEmits<{ saved: [] }>();

const $q = useQuasar();
const ui = useUiStore();
const auth = useAuthStore();
const txStore = useTransactionsStore();
const ttypes = useTransactionTypesStore();
const tagsStore = useTagsStore();

const show = computed({
  get: () => ui.showSmartModal,
  set: (v) => { if (!v) ui.closeSmartModal(); },
});

const tab = ref<'write' | 'voice' | 'photo' | 'autoai'>('write');

const methods = [
  { id: 'write'  as const, icon: 'edit_note',    label: 'Escribir' },
  { id: 'voice'  as const, icon: 'mic',           label: 'Voz' },
  { id: 'photo'  as const, icon: 'receipt_long',  label: 'Foto' },
  { id: 'autoai' as const, icon: 'auto_awesome',  label: 'Auto IA' },
  { id: 'bulk'   as const, icon: 'upload_file',   label: 'Carga masiva' },
];

const tabConfig = {
  voice:  { title: 'Dicta tu movimiento' },
  photo:  { title: 'Sube un comprobante' },
  autoai: { title: 'Describe con texto libre' },
};

// OWF-275: "Carga masiva" delega en TransactionBulkImportDialog como overlay
// independiente (no como tab-content — ver nota junto al template).
const showBulkImport = ref(false);
function selectMethod(id: typeof methods[number]['id']) {
  if (id === 'bulk') {
    openBulkImport();
    return;
  }
  tab.value = id;
  aiPrefill.value = null;
  aiSource.value = null;
}
function openBulkImport() {
  show.value = false;
  showBulkImport.value = true;
}
function onBulkImported() {
  showBulkImport.value = false;
  emit('saved');
}

const types = [
  { id: 'expense'  as const, label: 'Gasto',      icon: 'arrow_outward'  },
  { id: 'income'   as const, label: 'Ingreso',     icon: 'arrow_downward' },
  { id: 'transfer' as const, label: 'Transferir',  icon: 'swap_horiz'     },
  { id: 'ajuste'   as const, label: 'Ajuste',      icon: 'tune'           },
];

// ── Form state ────────────────────────────────────────────────────────────
const aiPrefill = ref<ExtractionResult | null>(null);
const aiSource  = ref<string | null>(null);

const now = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
};

// OWF-247/276: atajo de fecha (Hoy/Ayer/Otra fecha…) como UN solo Picker (q-select),
// igual estilo que el resto de los selects del formulario — no chips separados.
function localDateTimeString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
type DateShortcut = 'today' | 'yesterday' | 'custom';
const dateShortcut = ref<DateShortcut>('today');
const dateShortcutOptions: { label: string; value: DateShortcut; icon: string }[] = [
  { label: 'Hoy', value: 'today', icon: 'today' },
  { label: 'Ayer', value: 'yesterday', icon: 'history' },
  { label: 'Otra fecha…', value: 'custom', icon: 'calendar_month' },
];
function onDateShortcutChange(value: DateShortcut) {
  dateShortcut.value = value;
  if (value === 'custom') return;
  const d = new Date();
  d.setDate(d.getDate() + (value === 'yesterday' ? -1 : 0));
  form.value.date = localDateTimeString(d);
}

const form = ref({
  type: 'expense' as 'expense' | 'income' | 'transfer' | 'ajuste',
  amount: null as number | null,
  currency: auth.user?.currency?.code ?? 'USD',
  name: '',
  account_id: null as number | null,
  account_from_id: null as number | null,
  account_to_id: null as number | null,
  category_id: null as number | null,
  date: now(),
  provider_id: null as number | null,
  tags: [] as number[],
});

const saving     = ref(false);
const savedFlash = ref(false);
const saveError  = ref<string | null>(null);

function emitSavedWithFlash() {
  savedFlash.value = true;
  emit('saved');
  setTimeout(() => {
    savedFlash.value = false;
    ui.closeSmartModal();
  }, 800);
}

// OWF-183: si la transacción afecta o no el saldo agregado de la cuenta
const includeInBalance = ref(true);

// OWF-283: adjunto de foto/soporte — UI-only por ahora, sin endpoint de subida real
const attachmentInput = ref<HTMLInputElement | null>(null);
const attachment = ref<{ name: string; url: string } | null>(null);
function onAttachmentPicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  attachment.value = { name: file.name, url: URL.createObjectURL(file) };
}

// ── Provider search ──────────────────────────────────────────────────────────
interface Provider { id: number; name: string }
const providerOptions = ref<Provider[]>([])

async function filterProviders(val: string, update: (fn: () => void) => void) {
  if (!val.trim()) {
    update(() => { providerOptions.value = [] })
    return
  }
  try {
    const res = await api.get<Provider[] | { data: Provider[] }>('/providers', { params: { search: val } })
    const raw = res.data
    const list = Array.isArray(raw) ? raw : ((raw as { data: Provider[] }).data ?? [])
    update(() => { providerOptions.value = list })
  } catch {
    update(() => { providerOptions.value = [] })
  }
}

// ── Tags ──────────────────────────────────────────────────────────────────────
const LITE_TAG_SLUGS = ['impulso', 'planificado', 'recurrente']

const isLiteLayout = computed(() =>
  (auth.settings?.layout_mode ?? auth.user?.layout_mode) !== 'pro'
)

const visibleTags = computed(() =>
  isLiteLayout.value
    ? tagsStore.tags.filter(t => LITE_TAG_SLUGS.includes(t.slug))
    : tagsStore.tags
)

function toggleTag(id: number) {
  const idx = form.value.tags.indexOf(id)
  if (idx === -1) form.value.tags.push(id)
  else form.value.tags.splice(idx, 1)
}

const showNewTagForm = ref(false)
const newTagName = ref('')

async function createTag() {
  if (!newTagName.value.trim()) return
  await tagsStore.createTag(newTagName.value.trim())
  newTagName.value = ''
  showNewTagForm.value = false
}

// ── Pro mode features ──────────────────────────────────────────────────────
const isProMode = computed(() =>
  (auth.settings?.layout_mode ?? auth.user?.layout_mode) === 'pro'
);

type ProPanel = 'comision' | 'split' | 'items' | 'shared' | null;
const proPanel = ref<ProPanel>(null);

function toggleProPanel(panel: ProPanel) {
  proPanel.value = proPanel.value === panel ? null : panel;
}

// OWF-243/244: items (factura) reemplaza monto+categoría principales por su propio detalle.
const itemsOn = computed(() => isProMode.value && proPanel.value === 'items');
// OWF-242: split reemplaza la cuenta simple por el editor multi-cuenta.
const splitOn = computed(() => isProMode.value && proPanel.value === 'split');

// OWF-246: split/items/shared no aplican en Transferencia — solo Comisión.
watch(() => form.value.type, (type) => {
  if (type === 'transfer' && (proPanel.value === 'split' || proPanel.value === 'items' || proPanel.value === 'shared')) {
    proPanel.value = null;
  }
});

// Comisión
const comisionTipos = [
  { label: 'Pago móvil', value: 'pagomovil', icon: 'smartphone' },
  { label: 'Porcentaje', value: 'porcentaje', icon: 'percent' },
  { label: 'Monto fijo', value: 'fijo',       icon: 'attach_money' },
];
const comision = ref({ tipo: 'pagomovil', valor: 0 });
const PAGOMOVIL_PCT = 0.30;
const comisionCalculada = computed(() => {
  const base = Math.abs(form.value.amount ?? 0);
  if (comision.value.tipo === 'fijo')       return comision.value.valor;
  if (comision.value.tipo === 'porcentaje') return (base * comision.value.valor) / 100;
  if (comision.value.tipo === 'pagomovil')  return (base * PAGOMOVIL_PCT) / 100;
  return 0;
});

// Split
const splitPagos = ref<{ account_id: number | null; amount: number; rate: number }[]>([
  { account_id: null, amount: 0, rate: 1 },
  { account_id: null, amount: 0, rate: 1 },
]);
const splitTotal = computed(() => splitPagos.value.reduce((s, p) => s + (p.amount ?? 0), 0));

// Items / factura
const facturaItems = ref<{ name: string; quantity: number; price: number; tax: number; category_id: number | null }[]>([
  { name: '', quantity: 1, price: 0, tax: 0, category_id: null },
]);
const itemsTotal = computed(() =>
  facturaItems.value.reduce((s, it) => s + (it.quantity ?? 0) * (it.price ?? 0) * (1 + (it.tax ?? 0) / 100), 0)
);

// Gasto compartido (divide entre categorías)
const sharedCats = ref<{ category_id: number | null; amount: number }[]>([
  { category_id: null, amount: 0 },
  { category_id: null, amount: 0 },
]);
const sharedTotal = computed(() => sharedCats.value.reduce((s, c) => s + (c.amount ?? 0), 0));

function formatMoney(n: number) {
  return `$ ${Math.abs(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Currency options from user accounts ──────────────────────────────────
const currencyOptions = computed(() => {
  const codes = new Set<string>();
  codes.add(auth.user?.currency?.code ?? 'USD');
  (auth.user?.accounts ?? []).forEach((a: { currency?: { code?: string } }) => {
    if (a.currency?.code) codes.add(a.currency.code);
  });
  return [...codes].map(c => ({ label: c, value: c }));
});

// ── Account options ───────────────────────────────────────────────────────
interface UserAccount {
  id: number;
  name: string;
  balance?: number;
  balance_cached?: number;
  currency?: { id?: number; code?: string; symbol?: string };
}
function allUserAccounts(): UserAccount[] {
  return (auth.user?.accounts ?? []) as unknown as UserAccount[];
}
function findAccountById(id: number | null | undefined): UserAccount | undefined {
  if (!id) return undefined;
  return allUserAccounts().find(a => a.id === id);
}
const accountOptions = computed(() =>
  allUserAccounts().map((a) => ({
    label: `${a.name}${a.currency?.code ? ` (${a.currency.code})` : ''}`,
    value: a.id,
  }))
);

// OWF-241: "Hacia" no debe ofrecer la misma cuenta ya elegida como "Desde".
const accountToOptions = computed(() =>
  accountOptions.value.filter((o) => o.value !== form.value.account_from_id)
);
watch(() => form.value.account_from_id, (fromId) => {
  if (fromId != null && form.value.account_to_id === fromId) {
    form.value.account_to_id = null;
  }
});

// Devuelve la moneda de una cuenta del split (para mostrar campo tasa).
function splitAccountCurrency(accountId: number | null): string | null {
  return findAccountById(accountId)?.currency?.code ?? null;
}

// La moneda del monto queda fija a la moneda de la cuenta seleccionada.
watch(() => form.value.account_id, (accountId) => {
  if (!accountId) return;
  const acc = findAccountById(accountId);
  if (acc?.currency?.code) form.value.currency = acc.currency.code;
});

// ── OWF-186: Ajuste — Cuenta + Saldo objetivo + diferencia + Motivo ───────
const adjusteTargetBalance = ref<number | null>(null);
const adjusteMotivo = ref('');
const adjusteCurrentBalance = computed(() => {
  const acc = findAccountById(form.value.account_id);
  return Number(acc?.balance ?? acc?.balance_cached ?? 0);
});
const adjusteCurrencySymbol = computed(() => findAccountById(form.value.account_id)?.currency?.symbol ?? '');
const adjusteDiff = computed(() => {
  if (adjusteTargetBalance.value == null) return 0;
  return Number((Number(adjusteTargetBalance.value) - adjusteCurrentBalance.value).toFixed(2));
});

// ── OWF-179: tasa paralelo (actual) + tasa oficial (BCV) lado a lado ──────
const { currentRates } = useUserRates();
const rateParalelo = ref<number | null>(null);
const rateOficial = ref<number | null>(null);
const showDualRates = computed(() => {
  if (form.value.type === 'transfer' || form.value.type === 'ajuste') return false;
  if (splitOn.value || itemsOn.value) return false; // OWF-245: no aplica con split/items activos
  const code = (findAccountById(form.value.account_id)?.currency?.code || form.value.currency || '').toUpperCase();
  return !!code && code !== 'USD';
});
watch(showDualRates, (show) => {
  if (!show) return;
  const code = (findAccountById(form.value.account_id)?.currency?.code || form.value.currency || '').toUpperCase();
  const chip = currentRates.value.find(r => r.code.toUpperCase() === code);
  if (chip && rateParalelo.value == null) rateParalelo.value = chip.rate;
});

// Persiste la tasa oficial/BCV reutilizando el endpoint existente de user_currencies,
// para que quede disponible como referencia en próximas transacciones (sin nueva integración externa).
async function persistOfficialRateIfNeeded() {
  const val = Number(rateOficial.value || 0);
  if (!(val > 0)) return;
  const acc = findAccountById(form.value.account_id);
  const currencyId = acc?.currency?.id;
  const uid = (auth.user as unknown as { id?: number })?.id;
  if (!currencyId || !uid) return;
  try {
    await api.post('/user_currencies', {
      user_id: uid,
      currency_id: currencyId,
      current_rate: val,
      is_official: true,
    });
  } catch {
    // Silencioso: no bloquear el guardado de la transacción por esto.
  }
}

// ── OWF-185: Transfer — cruce de monedas Desde → Hacia ────────────────────
const transferRate = ref<number | null>(null);
const transferFromCurrency = computed(() => findAccountById(form.value.account_from_id)?.currency?.code ?? '');
const transferToCurrency = computed(() => findAccountById(form.value.account_to_id)?.currency?.code ?? '');
const transferIsCrossCurrency = computed(() =>
  !!transferFromCurrency.value && !!transferToCurrency.value && transferFromCurrency.value !== transferToCurrency.value
);
const transferConvertedAmount = computed(() => {
  const amt = Number(form.value.amount || 0);
  const r = Number(transferRate.value || 0);
  if (!r) return amt;
  // Rate is always "non-USD per 1 USD" (e.g. 737 VES/USD).
  // FROM=VES → TO=USD: divide by rate (18430 / 737 = 25)
  // FROM=USD → TO=VES: multiply by rate (25 * 737 = 18430)
  const fromIsUSD = (transferFromCurrency.value || '').toUpperCase() === 'USD';
  return fromIsUSD ? amt * r : amt / r;
});

// ── Categories ────────────────────────────────────────────────────────────
interface Category { id: number; name: string }
const categories       = ref<Category[]>([]);
const loadingCategories = ref(false);

async function loadCategories() {
  if (categories.value.length) return;
  loadingCategories.value = true;
  try {
    const res = await api.get<{ data: Category[] }>('/categories');
    categories.value = res.data?.data ?? (res.data as unknown as Category[]) ?? [];
  } catch { /* silent */ }
  finally { loadingCategories.value = false; }
}

// ── Transaction type id mapping ───────────────────────────────────────────
const typeIdFor = computed(() => {
  const map: Record<string, string | null> = { expense: null, income: null, transfer: null, ajuste: null };
  for (const t of ttypes.types) {
    const s = (t.slug ?? '').toLowerCase();
    if (s.includes('gasto') || s.includes('expense')) map.expense = t.id;
    else if (s.includes('ingreso') || s.includes('income')) map.income = t.id;
    else if (s.includes('transfer')) map.transfer = t.id;
    else if (s.includes('ajuste') || s.includes('adjust')) map.ajuste = t.id;
  }
  return map;
});

// ── OWF-184: TfReviewCard — helpers de preview y validación ───────────────
const typeLabelForReview = computed(() => types.find(t => t.id === form.value.type)?.label ?? '');
const debugPayloadPreview = computed(() => ({
  type: form.value.type,
  amount: form.value.amount,
  name: form.value.name,
  category_id: form.value.category_id,
  account_id: form.value.account_id,
  account_from_id: form.value.account_from_id,
  account_to_id: form.value.account_to_id,
  date: form.value.date,
  tags: form.value.tags,
}));
const categoryName = computed(() => categories.value.find(c => c.id === form.value.category_id)?.name ?? null);
const accountName = computed(() => findAccountById(form.value.account_id)?.name ?? null);
const fromAccountName = computed(() => findAccountById(form.value.account_from_id)?.name ?? null);
const toAccountName = computed(() => findAccountById(form.value.account_to_id)?.name ?? null);

const reviewValidationErrors = computed<string[]>(() => {
  const errs: string[] = [];
  if (form.value.type === 'ajuste') {
    if (!form.value.account_id) errs.push('Selecciona la cuenta a ajustar.');
    if (adjusteTargetBalance.value == null) errs.push('Ingresa el saldo objetivo.');
    if (!adjusteMotivo.value.trim()) errs.push('Ingresa un motivo para el ajuste.');
    return errs;
  }
  if (form.value.type === 'transfer') {
    if (!form.value.account_from_id) errs.push('Selecciona la cuenta de origen.');
    if (!form.value.account_to_id) errs.push('Selecciona la cuenta de destino.');
    if (form.value.account_from_id && form.value.account_to_id && form.value.account_from_id === form.value.account_to_id) {
      errs.push('Origen y destino deben ser cuentas distintas.');
    }
    if (!form.value.amount || form.value.amount <= 0) errs.push('El monto debe ser mayor a cero.');
    if (transferIsCrossCurrency.value && !(Number(transferRate.value || 0) > 0)) errs.push('Ingresa la tasa de cambio.');
    return errs;
  }
  if (!form.value.name.trim()) errs.push('Ingresa un concepto.');
  if (!form.value.amount || form.value.amount <= 0) errs.push('El monto debe ser mayor a cero.');
  if (!form.value.account_id) errs.push('Selecciona una cuenta.');
  if (isProMode.value && proPanel.value === 'split' && Math.abs(splitTotal.value - (form.value.amount ?? 0)) > 0.01) {
    errs.push('La suma del pago múltiple no coincide con el monto total.');
  }
  return errs;
});

const canSave = computed(() => {
  if (form.value.type === 'ajuste') {
    return !!form.value.account_id && adjusteTargetBalance.value != null && !!adjusteMotivo.value.trim();
  }
  if (form.value.type === 'transfer') {
    return !!form.value.account_from_id && !!form.value.account_to_id
      && form.value.account_from_id !== form.value.account_to_id
      && !!form.value.amount && form.value.amount > 0
      && (!transferIsCrossCurrency.value || Number(transferRate.value || 0) > 0);
  }
  return !!form.value.name.trim() && !!form.value.amount && form.value.amount > 0 && !!form.value.account_id;
});

// OWF-186: Ajuste usa el endpoint dedicado POST /accounts/{id}/adjust-balance (no crea una transacción normal)
async function saveAdjuste() {
  const id = form.value.account_id;
  if (!id || adjusteTargetBalance.value == null) return;
  await api.post(`/accounts/${id}/adjust-balance`, {
    target_balance: Number(adjusteTargetBalance.value),
    include_in_balance: includeInBalance.value,
    description: adjusteMotivo.value.trim(),
  });
}

async function save() {
  if (!canSave.value || saving.value) return;
  saving.value = true;
  saveError.value = null;

  try {
    if (form.value.type === 'ajuste') {
      await saveAdjuste();
      $q.notify({ type: 'positive', message: 'Saldo ajustado' });
      emitSavedWithFlash();
      return;
    }

    const typeId = typeIdFor.value[form.value.type] ?? null;
    // OWF-243: en modo items el monto real es la suma de las líneas, no el campo Monto (oculto).
    const rawAmt = itemsOn.value ? itemsTotal.value : (form.value.amount ?? 0);
    const amount = form.value.type === 'expense' ? -Math.abs(rawAmt) : Math.abs(rawAmt);

    const derivedJar = jarForCategory(form.value.category_id ?? null, getCachedJars());

    const payload: Record<string, unknown> = {
      name: form.value.name.trim(),
      date: form.value.date.replace('T', ' ') + ':00',
      transaction_type_id: typeId,
      provider_id: form.value.provider_id ?? null,
      tags: form.value.tags,
      include_in_balance: includeInBalance.value ? 1 : 0,
    };

    if (form.value.type === 'transfer') {
      const tRate = Number(transferRate.value || 1);
      const fromAmt = Math.abs(rawAmt); // amount in FROM account's currency
      const fromIsUSD = (transferFromCurrency.value || '').toUpperCase() === 'USD';
      // transactions.amount is always the USD equivalent
      const usdAmt = (transferIsCrossCurrency.value && tRate > 0)
        ? (fromIsUSD ? fromAmt : fromAmt / tRate)
        : fromAmt;
      // TO payment amount in TO account's currency
      const toAmt = (transferIsCrossCurrency.value && tRate > 0)
        ? (fromIsUSD ? fromAmt * tRate : fromAmt / tRate)
        : fromAmt;
      payload.amount = usdAmt;
      payload.payments = [
        { account_id: form.value.account_from_id, amount: -fromAmt, rate: tRate },
        { account_id: form.value.account_to_id,   amount:  toAmt,   rate: tRate },
      ];
      if (transferIsCrossCurrency.value) payload.rate = transferRate.value;
    } else {
      // Pro: determinar payments (split o pago simple)
      let payments: { account_id: number | null; amount: number }[];
      if (isProMode.value && proPanel.value === 'split' && splitPagos.value.some(p => p.account_id)) {
        payments = splitPagos.value
          .filter(p => p.account_id && p.amount)
          .map(p => ({ account_id: p.account_id, amount: p.amount, rate: p.rate ?? 1 }));
      } else {
        payments = [{ account_id: form.value.account_id, amount }];
      }

      // Pro: items de factura
      const items = (isProMode.value && proPanel.value === 'items')
        ? facturaItems.value.filter(it => it.name && it.price > 0).map(it => {
            const itemJar = jarForCategory(it.category_id ?? null, getCachedJars());
            return {
              name: it.name,
              quantity: it.quantity,
              amount: it.quantity * it.price * (1 + (it.tax ?? 0) / 100),
              tax_rate: it.tax ?? 0,
              category_id: it.category_id ?? null,
              jar_id: itemJar?.id ?? null,
            };
          })
        : undefined;

      // Pro: monto final — items suma sus líneas, comisión se suma al monto base
      const finalAmount = itemsOn.value
        ? itemsTotal.value
        : (isProMode.value && proPanel.value === 'comision' && comisionCalculada.value > 0)
          ? (form.value.amount ?? 0) + comisionCalculada.value
          : form.value.amount;

      payload.amount = finalAmount;
      payload.category_id = form.value.category_id ?? null;
      payload.jar_id = derivedJar?.id ?? null;
      payload.payments = payments;
      if (items?.length) payload.items = items;
      // OWF-179: tasas paralela/oficial capturadas cuando la moneda de la cuenta != USD
      if (showDualRates.value) {
        if (rateParalelo.value != null) payload.rate = rateParalelo.value;
        if (rateOficial.value != null) payload.rate_official = rateOficial.value;
      }
    }

    await api.post('/transactions', payload);
    if (form.value.type !== 'transfer' && showDualRates.value) {
      await persistOfficialRateIfNeeded();
    }
    $q.notify({ type: 'positive', message: 'Movimiento guardado' });
    emitSavedWithFlash();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    saveError.value = e?.response?.data?.message ?? 'Error al guardar. Intenta de nuevo.';
  } finally {
    saving.value = false;
  }
}

// ── Voice ─────────────────────────────────────────────────────────────────
const { transcript: voiceTranscript, isRecording: voiceRecording, error: voiceInputError, start: startVoiceRec, stop: stopVoiceRec } = useVoiceInput();
const { loading: voiceLoading, error: voiceAiError, extractFromText } = useAiExtraction();
const voiceResult = ref<ExtractionResult | null>(null);
const voiceError  = computed(() => voiceInputError.value ?? voiceAiError.value);

function startVoice() {
  voiceResult.value = null;
  navigator.vibrate?.(50);
  startVoiceRec();
}

async function stopVoice() {
  navigator.vibrate?.(50);
  stopVoiceRec();
  await new Promise(r => setTimeout(r, 300));
  if (voiceTranscript.value) {
    voiceResult.value = await extractFromText('voice', voiceTranscript.value);
  }
}

// ── OCR / Photo ───────────────────────────────────────────────────────────
const { loading: ocrLoading, error: ocrError, extractFromText: extractFromImage } = useAiExtraction();
const ocrResult    = ref<ExtractionResult | null>(null);
const photoDragOver = ref(false);

function processPhoto(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = (e.target?.result as string)?.split(',')[1] ?? '';
    void extractFromImage('ocr', file.name, base64).then(r => { ocrResult.value = r; });
  };
  reader.readAsDataURL(file);
}

function onPhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) void processPhoto(file);
}

function onPhotoDrop(e: DragEvent) {
  photoDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) void processPhoto(file);
}

// ── Auto IA text ──────────────────────────────────────────────────────────
const { loading: aiLoading, error: aiError, extractFromText: extractText } = useAiExtraction();
const aiText       = ref('');
const aiTextResult = ref<ExtractionResult | null>(null);

async function runTextAi() {
  aiTextResult.value = null;
  aiTextResult.value = await extractText('auto', aiText.value);
}

// ── Apply AI result to form ───────────────────────────────────────────────
function applyAiResult(result: ExtractionResult, source: string) {
  aiPrefill.value = result;
  aiSource.value  = source;

  const d = result.data;
  if (d.type) {
    const map: Record<string, 'expense' | 'income' | 'transfer'> = { expense: 'expense', income: 'income', transfer: 'transfer' };
    form.value.type = map[d.type] ?? 'expense';
  }
  if (d.amount) form.value.amount = d.amount;
  if (d.currency) form.value.currency = d.currency;
  if (d.description) form.value.name = d.description;
  if (d.date) form.value.date = d.date.slice(0, 16);

  // OWF-129 — Resolver sugerencia de categoría al ID real del usuario
  if (d.category_suggestion && categories.value.length) {
    const suggestion = d.category_suggestion.toLowerCase().trim();
    const match = categories.value.find(c => {
      const name = c.name.toLowerCase();
      return name === suggestion || name.includes(suggestion) || suggestion.includes(name);
    });
    if (match) form.value.category_id = match.id;
  }

  tab.value = 'write';
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
function onShow() {
  tab.value = ui.smartModalTab;
  form.value.type = ui.smartModalType;
  form.value.date = now();
  form.value.amount = null;
  form.value.name = '';
  form.value.category_id = null;
  form.value.provider_id = null;
  form.value.tags = [];
  form.value.account_from_id = null;
  form.value.account_to_id = null;
  showNewTagForm.value = false;
  newTagName.value = '';
  aiPrefill.value = null;
  aiSource.value  = null;
  voiceResult.value = null;
  ocrResult.value   = null;
  aiTextResult.value = null;
  aiText.value = '';
  saveError.value = null;
  includeInBalance.value = true;
  adjusteTargetBalance.value = null;
  adjusteMotivo.value = '';
  rateParalelo.value = null;
  rateOficial.value = null;
  transferRate.value = null;
  proPanel.value = null;
  sharedCats.value = [{ category_id: null, amount: 0 }, { category_id: null, amount: 0 }];

  if (!form.value.account_id && accountOptions.value.length) {
    const selectedIds = txStore.selectedAccountIds;
    const filteredAccountId = Array.isArray(selectedIds) && selectedIds.length === 1
      ? Number(selectedIds[0])
      : null;
    const matchesOption = filteredAccountId !== null
      && accountOptions.value.some(o => o.value === filteredAccountId);
    form.value.account_id = matchesOption ? filteredAccountId : accountOptions.value[0]!.value;
  }

  void ttypes.fetchTransactionTypes();
  void loadCategories();
  void tagsStore.fetchTags();
  void Promise.all([loadCategoriesWithJars(), loadUserJars()]);
}

function onHide() {
  if (voiceRecording.value) stopVoiceRec();
}

watch(() => ui.showSmartModal, (v) => { if (!v) onHide(); });
</script>

<style scoped lang="scss">
// OWF-277: campos tipo-select (Cuenta/Categoría/Proveedor/Fecha) con look "filled"
// (ícono+valor+chevron, sin borde visible) más cercano al diseño que el outlined default de Quasar.
:deep(.stm-body .q-field--outlined .q-field__control) {
  background: var(--surface-2, #f1f5f9);
  border-radius: var(--radius-md, 12px);

  &:before {
    border: none;
  }
  &:after {
    border: none;
  }
}
:deep(.stm-body .q-field--outlined.q-field--focused .q-field__control) {
  background: var(--surface-1, #fff);

  &:before {
    border: 1px solid var(--brand-primary, #3b82f6);
  }
}

.stm-wrap {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;

  &--mobile {
    border-radius: 22px 22px 0 0;
    max-width: none;
    height: auto;
    max-height: 92vh;
    overflow-y: auto;
  }
}

.stm-handle {
  width: 40px; height: 4px;
  border-radius: 999px;
  background: var(--surface-3, #e2e8f0);
  margin: 12px auto 0;
  flex-shrink: 0;
}

.stm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 22px 12px;
  flex-shrink: 0;
}

.stm-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--fg-3, #94a3b8);
  margin-bottom: 3px;
}

.stm-title {
  font-family: var(--font-display, 'DM Sans', sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--fg-1, #0f172a);
}

.stm-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--fg-3, #94a3b8);
  display: flex;
  padding: 4px;
  border-radius: 8px;
  &:hover { background: var(--surface-2, #f1f4f6); }
}

// ── Tabs ──
.stm-tabs {
  display: flex;
  gap: 5px;
  padding: 0 22px 14px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.stm-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: var(--surface-2, #f1f4f6);
  color: var(--fg-2, #64748b);
  transition: all 140ms ease;

  &--active {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    font-weight: 700;
  }
}

// ── AI prefill banner ──
.stm-ai-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 22px 10px;
  padding: 10px 13px;
  border-radius: var(--radius-sm, 8px);
  background: linear-gradient(90deg, rgba(124,58,237,.08), rgba(14,165,233,.08));
  font-size: 12.5px;
  color: var(--fg-1, #0f172a);

  &__clear {
    border: none; background: transparent; cursor: pointer;
    color: var(--fg-3); display: flex; margin-left: auto;
  }
}

// ── Body ──
.stm-body {
  padding: 0 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;

  &--centered {
    align-items: center;
    text-align: center;
    padding-top: 8px;
  }
}

// ── Type row ──
.stm-type-row {
  display: flex;
  gap: 6px;
  background: var(--surface-2, #f1f4f6);
  border-radius: 999px;
  padding: 4px;
}

.stm-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 999px;
  padding: 9px 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--fg-2, #64748b);
  transition: all 150ms ease;

  &--active { background: var(--surface-1, #fff); box-shadow: 0 1px 4px rgba(0,0,0,.1); }

  &--expense.stm-type-btn--active  { color: #ef4444; }
  &--income.stm-type-btn--active   { color: #10b981; }
  &--transfer.stm-type-btn--active { color: #8b5cf6; }
  &--ajuste.stm-type-btn--active   { color: #f59e0b; }
}

// ── Fields ──
.stm-label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  margin-bottom: 5px;
  &--opt { font-weight: 400; color: var(--fg-3, #94a3b8); }
  &--req { color: var(--expense, #ef4444); font-weight: 700; }
}

.stm-rate-equiv {
  font-size: 11px;
  color: var(--fg-3, #94a3b8);
  margin-top: 3px;
  display: block;
}

.stm-badge-hoy {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  background: var(--income-soft, rgba(16,185,129,.15));
  color: var(--income-fg, #059669);
  border-radius: 4px;
  padding: 1px 5px;
  margin-left: 4px;
  vertical-align: middle;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

// ── OWF-280: Amount hero con currency pills ──
.stm-amount-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-sm, 8px);
  background: var(--surface-2, #f8fafc);
  transition: border-color 140ms, background 140ms;

  &:focus-within {
    border-color: var(--brand-primary, #2d4da6);
    background: var(--surface-1, #fff);
  }
}

.stm-amount-sym {
  font-size: 28px;
  font-weight: 700;
  color: var(--fg-2, #64748b);
  flex-shrink: 0;
  line-height: 1;
}

.stm-amount-hero {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-body, sans-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--fg-1, #0f172a);
  line-height: 1;
  padding: 0;

  &::placeholder { color: var(--fg-3, #94a3b8); }
}

.stm-currency-pills {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.stm-currency-pill {
  padding: 5px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  color: var(--fg-2, #64748b);
  transition: all 140ms;
  line-height: 1;

  &--active {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
  }

  &:hover:not(.stm-currency-pill--active) {
    background: var(--surface-3, #e2e8f0);
  }
}

// ── OWF-281: Transfer Desde → Hacia side-by-side ──
.stm-transfer-accounts {
  display: flex;
  align-items: flex-end;
  gap: 6px;

  > .stm-field { flex: 1; min-width: 0; }
}

.stm-transfer-arrow {
  flex-shrink: 0;
  padding-bottom: 10px;
  color: var(--fg-3, #94a3b8);
}

@media (max-width: 480px) {
  .stm-transfer-accounts {
    flex-direction: column;
    .stm-transfer-arrow { display: none; }
  }
}

// ── Legacy (kept for items-total-banner usage) ──
.stm-amount-row {
  display: flex;
  gap: 6px;
  align-items: stretch;
}

.stm-amount-input, .stm-text-input {
  flex: 1;
  width: 100%;
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-sm, 8px);
  padding: 10px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: 15px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-2, #f8fafc);
  outline: none;
  transition: border-color 140ms;
  box-sizing: border-box;

  &:focus { border-color: var(--brand-primary, #2d4da6); background: var(--surface-1, #fff); }
  &::placeholder { color: var(--fg-3, #94a3b8); }
}

.stm-amount-input { font-size: 32px; font-weight: 700; line-height: 1.1; }

.stm-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stm-field--toggle-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.stm-textarea {
  width: 100%;
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-sm, 8px);
  padding: 12px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-2, #f8fafc);
  resize: none;
  outline: none;
  line-height: 1.55;
  box-sizing: border-box;
  &:focus { border-color: var(--brand-primary); background: var(--surface-1, #fff); }
  &::placeholder { color: var(--fg-3, #94a3b8); }
}

// ── Adjunto foto/soporte ──
.stm-attachment-input-hidden { display: none; }
.stm-attachment-picker {
  display: flex; align-items: center; gap: 9px; width: 100%;
  padding: 13px 15px; border-radius: var(--radius-md, 10px);
  border: 1px dashed var(--border-hairline, #cbd5e1);
  background: var(--surface-2, #f8fafc); cursor: pointer;
  color: var(--fg-2, #475569); font-size: 12.5px; font-weight: 600;
  &:hover { background: var(--surface-1, #fff); }
}
.stm-attachment-preview {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: var(--radius-md, 10px);
  border: 1px solid var(--border-hairline, #cbd5e1);
  background: var(--surface-1, #fff);
  img { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: var(--surface-2, #f8fafc); }
  &__name { flex: 1; min-width: 0; font-size: 12.5px; color: var(--fg-1, #1e293b); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  button { border: 0; background: transparent; cursor: pointer; color: var(--fg-3, #94a3b8); display: flex; }
}

// ── Error ──
.stm-error {
  padding: 10px 13px;
  border-radius: var(--radius-sm, 8px);
  background: rgba(239,68,68,.1);
  color: #b91c1c;
  font-size: 13px;
}

// ── Footer buttons ──
.stm-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.stm-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 140ms ease;

  &--ghost {
    background: var(--surface-2, #f1f4f6);
    color: var(--fg-2, #64748b);
    &:hover { background: var(--surface-3, #e2e8f0); }
  }

  &--primary {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    box-shadow: 0 4px 14px rgba(45,77,166,.3);
    &:hover:not(:disabled) { opacity: .9; }
    &:disabled { opacity: .5; cursor: not-allowed; }
  }

  &--ai {
    background: linear-gradient(90deg, #7c3aed, #2563eb);
    color: #fff;
    &:disabled { opacity: .5; cursor: not-allowed; }
  }

  &--success {
    background: var(--income, #10b981) !important;
    box-shadow: 0 4px 14px rgba(16,185,129,.3) !important;
  }
}

// ── Voice ──
.stm-voice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: var(--surface-2, #f8fafc);
  border-radius: var(--radius-lg, 16px);
  width: 100%;
}

.stm-voice-btn {
  width: 72px; height: 72px; border-radius: 36px;
  background: var(--brand-primary, #2d4da6);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 22px rgba(45,77,166,.35);
  transition: transform 140ms;
  &:active { transform: scale(0.94); }
}

.stm-voice-pulse {
  width: 72px; height: 72px; border-radius: 36px;
  background: rgba(239,68,68,.12);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  animation: stmPulse 1s ease-in-out infinite;
}

@keyframes stmPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stm-voice-label { font-size: 14px; font-weight: 600; color: var(--fg-1); }
.stm-voice-sub   { font-size: 12px; color: var(--fg-2); text-align: center; }
.stm-voice-transcript {
  font-size: 13px; font-style: italic; color: var(--fg-1);
  background: var(--surface-1, #fff);
  padding: 8px 14px; border-radius: 8px; max-width: 100%;
}
.stm-voice-analyzing {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--fg-2);
}

// ── AI result ──
.stm-ai-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: var(--surface-2, #f8fafc);
  border-radius: var(--radius-lg, 16px);
  width: 100%;
  text-align: center;

  &__amount { font-family: var(--font-money, monospace); font-size: 22px; font-weight: 700; color: var(--fg-1); }
  &__desc   { font-size: 13px; color: var(--fg-2); }
  &__conf   { font-size: 11px; color: var(--fg-3); }
}

// ── Photo drop ──
.stm-photo-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 2px dashed var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-lg, 16px);
  padding: 36px 20px;
  cursor: pointer;
  background: var(--surface-2, #f8fafc);
  transition: border-color 150ms;
  width: 100%;
  box-sizing: border-box;
  &--hover { border-color: var(--brand-primary); }
}

.stm-file-input { display: none; }
.stm-photo-icon { color: var(--fg-3, #94a3b8); }
.stm-photo-label { font-size: 14px; font-weight: 600; color: var(--fg-1); }
.stm-photo-sub   { font-size: 12px; color: var(--fg-2); text-align: center; }
.stm-photo-tags  { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
.stm-photo-tag {
  font-size: 11px; font-weight: 600;
  padding: 3px 9px; border-radius: 999px;
  background: var(--surface-1, #fff);
  color: var(--fg-2, #64748b);
  border: 1px solid var(--border-hairline, #e2e8f0);
}

// ── Pro features ────────────────────────────────────────────────────────────
// OWF-286: fila en desktop (3 columnas, como rowDir='row' en rediseno), columna en mobile
.stm-pro-card-toggles {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;

  .stm-wrap--mobile & { flex-direction: column; flex-wrap: nowrap; }
}

.stm-pro-card-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;

  .stm-pro-card-toggles & {
    flex: 1 1 140px;
    width: auto;
  }
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-md, 12px);
  background: var(--surface-1, #fff);
  cursor: pointer;
  text-align: left;
  transition: all 140ms ease;

  &:hover { background: var(--surface-2, #f8fafc); }

  &--on {
    border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
    background: color-mix(in srgb, var(--brand-primary) 4%, var(--surface-1));
  }

  &--balance {
    border-color: var(--border-hairline, #e2e8f0);
    &.stm-pro-card-toggle--on {
      border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
      background: color-mix(in srgb, var(--brand-primary) 4%, var(--surface-1));
    }
  }

  &__icon {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm, 8px);
    background: var(--surface-2, #f1f5f9);
    color: var(--fg-2, #64748b);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 140ms;
  }

  &--on &__icon {
    background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
    color: var(--brand-primary);
  }

  &__texts {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  &__label {
    font-family: var(--font-body, sans-serif);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--fg-1, #0f172a);
    line-height: 1.3;
  }

  &__sub {
    font-family: var(--font-body, sans-serif);
    font-size: 11.5px;
    color: var(--fg-3, #94a3b8);
  }
}

.stm-pro-panel {
  padding: 12px;
  background: var(--surface-2, #f8fafc);
  border-radius: 10px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stm-cross-currency-panel {
  padding: 12px;
  background: color-mix(in srgb, #8B5CF6 8%, var(--surface-1, #fff));
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, #8B5CF6 30%, transparent);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .text-caption { color: #8B5CF6; font-weight: 600; }
  .stm-label { color: color-mix(in srgb, #8B5CF6 70%, var(--fg-2, #64748b)); }
}

.stm-pro-summary {
  font-size: 12.5px;
  color: var(--fg-2, #64748b);
  padding: 6px 8px;
  background: var(--surface-1, #fff);
  border-radius: 6px;
  border: 1px solid var(--border-hairline, #e2e8f0);
}

.stm-pro-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-primary, #2d4da6);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
}

.stm-pro-rm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(239,68,68,.25);
  color: #ef4444;
  background: rgba(239,68,68,.06);
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 2px;
}

/* Comisión cards */
.stm-comm-types {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.stm-comm-type {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border: 1px solid var(--stm-border);
  border-radius: 10px;
  background: var(--surface-1);
  color: var(--fg-2);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
  .material-icons { font-size: 19px; }
  &:hover { background: var(--surface-2); }
}
.stm-comm-type--active {
  border-color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 10%, var(--surface-1));
  color: var(--brand-primary);
  font-weight: 700;
}
.stm-comm-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  background: var(--surface-1);
  border: 1px solid var(--stm-border);
  border-radius: 8px;
  margin-bottom: 10px;
}
.stm-comm-sym {
  font-family: var(--font-money, monospace);
  font-weight: 700;
  font-size: 16px;
  color: var(--fg-3);
}
.stm-comm-hint {
  font-size: 11px;
  color: var(--fg-3);
  white-space: nowrap;
}
.stm-text-input--money {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  font-family: var(--font-money, monospace);
  color: var(--fg-1);
  min-width: 0;
}
.stm-comm-pagomovil {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border-radius: 8px;
  background: var(--info-soft, #EFF6FF);
  color: var(--fg-1);
  font-size: 13px;
  margin-bottom: 10px;
}
.stm-comm-result {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--fg-2);
  border-top: 1px solid var(--stm-border);
  padding-top: 10px;
  strong { font-family: var(--font-money, monospace); color: var(--fg-1); }
}

/* Split con tasa cross-currency */
.stm-split-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--stm-border) 50%, transparent);
  &:last-of-type { border-bottom: none; }
}
.stm-split-row__fields {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.stm-split-rate {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 6%, var(--surface-1));
  border: 1px dashed color-mix(in srgb, var(--brand-primary) 25%, transparent);
  font-size: 12px;
  color: var(--fg-2);
}
.stm-text-input--rate {
  width: 80px;
  flex-shrink: 0;
}
.stm-split-rate__equiv {
  font-size: 11.5px;
  font-family: var(--font-money, monospace);
  color: var(--brand-primary);
  margin-left: auto;
  white-space: nowrap;
}

.stm-items-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--stm-border) 50%, transparent);
  &:last-of-type { border-bottom: none; }
}
.stm-items-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.stm-items-cat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 2px;
}

.stm-text-input--flex  { flex: 1; min-width: 0; }
.stm-text-input--qty   { width: 56px; flex-shrink: 0; }
.stm-text-input--price { width: 80px; flex-shrink: 0; }
.stm-text-input--tax   { width: 58px; flex-shrink: 0; }

.stm-jar-chip { margin-top: 8px; }

// ── Tags ────────────────────────────────────────────────────────────────────
.stm-tags-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  align-items: center;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 2px;
}

.stm-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  cursor: pointer;
  transition: all 120ms;

  &--active { font-weight: 700; }
  &--add { color: var(--fg-3, #94a3b8); border-style: dashed; }
  &--add:hover { color: var(--fg-2); border-color: var(--fg-3); }
}

.stm-new-tag-form {
  display: flex;
  gap: 4px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.stm-btn--xs {
  padding: 4px 8px;
  font-size: 12px;
  min-height: unset;
}

// OWF-243: total de ítems en lugar del campo Monto
.stm-items-total-banner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-md, 12px);
  background: var(--surface-2, #f1f5f9);

  &__amount {
    font-family: var(--font-money, inherit);
    font-weight: 700;
    font-size: 22px;
    color: var(--fg-1, #0f172a);
  }
}
</style>
