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
          <div class="stm-eyebrow">{{ isEditMode ? 'Editar movimiento' : 'Nuevo movimiento' }} · {{ isProMode ? 'Pro' : 'Lite' }}</div>
          <div class="stm-title">{{ isEditMode ? 'Editar' : (tab === 'write' ? '¿Qué pasó con tu dinero?' : tabConfig[tab].title) }}</div>
        </div>
        <button class="stm-close" @click="show = false" aria-label="Cerrar">
          <q-icon name="close" size="22px" />
        </button>
      </div>

      <!-- Method tabs (Voz/Foto/Auto IA/Carga masiva no aplican en modo edición: la
           edición reutiliza únicamente el formulario "Escribir", prellenado) -->
      <div v-if="!isEditMode" class="stm-tabs">
        <div class="stm-method-grid">
          <button v-for="m in primaryMethods" :key="m.id"
            class="stm-method-tile" :class="{ 'stm-method-tile--active': tab === m.id }"
            @click="selectMethod(m.id)">
            <q-icon :name="m.icon" size="20px" />
            {{ m.label }}
          </button>
        </div>
        <button class="stm-bulk-link" @click="selectMethod('bulk')">
          <q-icon name="upload_file" size="15px" />
          Carga masiva
        </button>
      </div>

      <!-- Loading spinner while fetching the transaction being edited -->
      <div v-if="isEditMode && loadingEditTx" class="stm-body stm-body--centered">
        <q-spinner size="28px" color="primary" />
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
      <div v-if="tab === 'write' && !(isEditMode && loadingEditTx)" class="stm-body">

        <!-- Type selector -->
        <div class="stm-type-row">
          <button v-for="t in types" :key="t.id"
            class="stm-type-btn" :class="[`stm-type-btn--${t.id}`, { 'stm-type-btn--active': form.type === t.id }]"
            @click="form.type = t.id">
            <q-icon :name="t.icon" size="18px" />
            {{ t.label }}
          </button>
        </div>

        <!-- OWF-312: atajos rápidos (solo desktop) — reubicados desde el pre-modal eliminado -->
        <div v-if="!isEditMode && !$q.screen.lt.md" class="stm-quicklinks">
          <button v-for="l in QUICK_LINKS" :key="l.id" class="stm-quicklink" @click="goQuickLink(l)">
            <q-icon :name="l.icon" size="14px" />
            {{ l.label }}
          </button>
          <button class="stm-quicklink stm-quicklink--ai" @click="goAdvisor">
            <q-icon name="psychology" size="14px" />
            Hablar con Asesor IA
          </button>
        </div>

        <!-- OWF-186/256/257/258: Ajuste — Cuenta a ajustar + Saldo objetivo + Se creará un ajuste + Motivo -->
        <template v-if="form.type === 'ajuste'">
          <div class="stm-field">
            <label class="stm-label">Cuenta a ajustar</label>
            <q-select v-model="form.account_id" :options="filteredAccountOptions" emit-value map-options dense outlined
              use-input input-debounce="0" @filter="filterAccounts"
              class="stm-acct-select" :class="{ 'stm-acct-select--open': openAcctSelect === 'ajuste' }"
              @popup-show="openAcctSelect = 'ajuste'" @popup-hide="openAcctSelect = null"
              placeholder="Seleccionar…">
              <template v-slot:no-option>
                <q-item><q-item-section class="stm-no-results">Sin resultados</q-item-section></q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span class="stm-acct-line">
                  <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                  <span class="stm-acct-name">{{ scope.opt.label }}<template v-if="scope.opt.currencyCode"> · {{ scope.opt.currencyCode }}</template></span>
                  <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                </span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section side>
                    <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.currencyCode }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
              <q-select v-model="form.account_from_id" :options="filteredAccountOptions" emit-value map-options dense outlined
                use-input input-debounce="0" @filter="filterAccounts"
                class="stm-acct-select" :class="{ 'stm-acct-select--open': openAcctSelect === 'from' }"
                @popup-show="openAcctSelect = 'from'" @popup-hide="openAcctSelect = null"
                placeholder="Cuenta origen…">
                <template v-slot:prepend><q-icon name="arrow_upward" color="negative" /></template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="stm-no-results">Sin resultados</q-item-section></q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <span class="stm-acct-line">
                    <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                    <span class="stm-acct-name">{{ scope.opt.label }}<template v-if="scope.opt.currencyCode"> · {{ scope.opt.currencyCode }}</template></span>
                    <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                  </span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section side>
                      <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.currencyCode }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="stm-transfer-arrow">
              <q-icon name="arrow_forward" size="20px" />
            </div>
            <div class="stm-field">
              <label class="stm-label">Hacia (destino) <span class="stm-label--req">*</span></label>
              <q-select v-model="form.account_to_id" :options="filteredAccountToOptions" emit-value map-options dense outlined
                use-input input-debounce="0" @filter="filterAccounts"
                class="stm-acct-select" :class="{ 'stm-acct-select--open': openAcctSelect === 'to' }"
                @popup-show="openAcctSelect = 'to'" @popup-hide="openAcctSelect = null"
                placeholder="Cuenta destino…">
                <template v-slot:prepend><q-icon name="arrow_downward" color="positive" /></template>
                <template v-slot:no-option>
                  <q-item><q-item-section class="stm-no-results">Sin resultados</q-item-section></q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <span class="stm-acct-line">
                    <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                    <span class="stm-acct-name">{{ scope.opt.label }}<template v-if="scope.opt.currencyCode"> · {{ scope.opt.currencyCode }}</template></span>
                    <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                  </span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section side>
                      <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.currencyCode }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                    </q-item-section>
                  </q-item>
                </template>
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
          <!-- OWF-296: punto de color + nombre · moneda + saldo a la derecha (como Picker del rediseño) -->
          <div class="stm-field" v-if="!splitOn">
            <label class="stm-label">Cuenta de origen <span class="stm-label--req">*</span></label>
            <q-select v-model="form.account_id" :options="filteredAccountOptions" emit-value map-options dense outlined
              use-input input-debounce="0" @filter="filterAccounts"
              class="stm-acct-select" :class="{ 'stm-acct-select--open': openAcctSelect === 'main' }"
              @popup-show="openAcctSelect = 'main'" @popup-hide="openAcctSelect = null"
              placeholder="Seleccionar…">
              <template v-slot:no-option>
                <q-item><q-item-section class="stm-no-results">Sin resultados</q-item-section></q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span class="stm-acct-line">
                  <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                  <span class="stm-acct-name">{{ scope.opt.label }}<template v-if="scope.opt.currencyCode"> · {{ scope.opt.currencyCode }}</template></span>
                  <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                </span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section side>
                    <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.currencyCode }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
            <CategorySelector v-model="form.category_id" allow-null placeholder="Sin categoría"
              :kind="form.type === 'income' ? 'income' : 'expense'" />
          </div>
          <div class="stm-field">
            <label class="stm-label">Cántaro</label>
            <AnchoredJarChip :category-id="form.category_id" class="stm-jar-chip" />
            <!-- OWF-296: hint como en el rediseño (Field hint="Anclado a la categoría") -->
            <span class="stm-hint">Anclado a la categoría</span>
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
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section side><q-icon :name="scope.opt.icon" size="18px" /></q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
          <input v-if="dateShortcut === 'custom'" v-model="form.date" type="datetime-local" class="stm-text-input" style="margin-top:6px" />
        </div>

        <!-- OWF-187: reparto automático por cántaros porcentuales (Lite + Ingreso) -->
        <JarPercentSplitInfo v-if="isLiteLayout && form.type === 'income'" />

        <!-- OWF-181: Proveedor + Fecha comparten fila (excepto Lite+Ingreso, donde Fecha ya se muestra junto a Categoría — OWF-188) -->
        <div v-if="form.type !== 'ajuste' && form.type !== 'transfer'"
          :class="(isLiteLayout && form.type === 'income') ? '' : 'stm-row-2'">
          <div class="stm-field">
            <div class="stm-field__head">
              <label class="stm-label">Proveedor / Comercio <span class="stm-label--opt">(opcional)</span></label>
              <button v-if="!showNewProviderForm" type="button" class="stm-inline-add" @click="showNewProviderForm = true; newProviderName = providerSearchTerm">
                <q-icon name="add" size="13px" /> Nuevo proveedor
              </button>
            </div>
            <!-- OWF-296: "Sin proveedor" como valor default visible (rediseño: provOpts[0] = { value:null, label:'Sin proveedor', icon:'block' }) -->
            <q-select
              v-if="!showNewProviderForm"
              v-model="form.provider_id"
              :options="providerOptions"
              emit-value map-options
              use-input input-debounce="0"
              clearable
              dense outlined
              :display-value="providerDisplayValue"
              option-value="id"
              option-label="name"
              @filter="filterProviders"
            >
              <template v-slot:prepend><q-icon :name="form.provider_id != null ? 'storefront' : 'block'" /></template>
              <template v-slot:no-option>
                <q-item v-if="providerSearchTerm.trim()"><q-item-section class="stm-no-results">Sin resultados</q-item-section></q-item>
              </template>
            </q-select>
            <div v-else class="stm-new-tag-form">
              <input v-model="newProviderName" class="stm-text-input stm-text-input--flex" placeholder="Nombre del proveedor" @keydown.enter.prevent="createProvider" />
              <button type="button" class="stm-btn stm-btn--primary stm-btn--xs" :disabled="!newProviderName.trim() || creatingProvider" @click="createProvider">
                <q-spinner v-if="creatingProvider" size="13px" color="white" />
                <q-icon v-else name="check" size="14px" />
              </button>
              <button type="button" class="stm-btn stm-btn--ghost stm-btn--xs" @click="showNewProviderForm = false; newProviderName = ''">
                <q-icon name="close" size="14px" />
              </button>
            </div>
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
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section side><q-icon :name="scope.opt.icon" size="18px" /></q-item-section>
                  <q-item-section>{{ scope.opt.label }}</q-item-section>
                </q-item>
              </template>
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
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section side><q-icon :name="scope.opt.icon" size="18px" /></q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
          <input v-if="dateShortcut === 'custom'" v-model="form.date" type="datetime-local" class="stm-text-input" style="margin-top:6px" />
        </div>

        <!-- Etiquetas — OWF-296: header "ETIQUETAS" + hint contextual + chips con color semántico
             siempre visible (rediseño TfTags: borde color-mix 34%, fondo 7%, activo = fondo pleno) -->
        <div class="stm-field">
          <div class="stm-tags-head">
            <label class="stm-label stm-label--tags">Etiquetas</label>
            <span class="stm-tags-hint">{{ tagsHint }}</span>
          </div>
          <div class="stm-tags-row">
            <button
              v-for="tag in visibleTags"
              :key="tag.id"
              type="button"
              :title="tag.description ?? ''"
              class="stm-tag-chip"
              :class="{ 'stm-tag-chip--active': form.tags.includes(tag.id) }"
              :style="tagChipStyle(tag)"
              @click="toggleTag(tag.id)"
              @mouseenter="hoveredTagId = tag.id"
              @mouseleave="hoveredTagId = null"
              @focus="hoveredTagId = tag.id"
              @blur="hoveredTagId = null"
            >
              <span class="material-icons" style="font-size:15px" :style="{ color: form.tags.includes(tag.id) ? '#fff' : tagColor(tag) }">{{ tag.icon }}</span>
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
          </div>
          <div v-if="showNewTagForm" class="stm-new-tag-form">
            <div class="stm-new-tag-form__row">
              <span class="stm-new-tag-form__preview" :style="{ background: newTagColor }">
                <span class="material-icons" style="font-size:16px; color:#fff">sell</span>
              </span>
              <input v-model="newTagName" class="stm-text-input stm-text-input--flex" placeholder="Nombre de la etiqueta" autofocus @keydown.enter.prevent="createTag" />
            </div>
            <input v-model="newTagDescription" class="stm-text-input" placeholder="Descripción (ej. Viaje relacionado con viaje)" @keydown.enter.prevent="createTag" />
            <div class="stm-new-tag-form__swatches">
              <button
                v-for="c in tagPalette"
                :key="c"
                type="button"
                class="stm-new-tag-form__swatch"
                :class="{ 'stm-new-tag-form__swatch--active': newTagColor === c }"
                :style="{ background: c }"
                :title="c"
                @click="newTagColor = c"
              />
              <button type="button" class="stm-new-tag-form__swatch stm-new-tag-form__swatch--random" title="Color al azar" @click="newTagColor = tagPalette[Math.floor(Math.random() * tagPalette.length)]">
                <span class="material-icons" style="font-size:14px">casino</span>
              </button>
              <label class="stm-new-tag-form__swatch stm-new-tag-form__swatch--wheel" title="Elegir cualquier color">
                <input v-model="newTagColor" type="color" />
              </label>
              <span class="stm-new-tag-form__spacer" />
              <button type="button" class="stm-new-tag-form__cancel" @click="showNewTagForm = false; newTagName = ''; newTagDescription = ''; newTagColor = tagPalette[3]">Cancelar</button>
              <button type="button" class="stm-new-tag-form__submit" :disabled="!newTagName.trim()" @click="createTag">
                <q-icon name="add" size="15px" />Crear etiqueta
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
                  <q-select v-model="pago.account_id" :options="filteredAccountOptions" emit-value map-options dense outlined clearable
                    use-input input-debounce="0" @filter="filterAccounts"
                    class="stm-acct-select" :class="{ 'stm-acct-select--open': openAcctSelect === `split-${i}` }"
                    @popup-show="openAcctSelect = `split-${i}`" @popup-hide="openAcctSelect = null"
                    placeholder="Seleccionar…">
                    <template v-slot:no-option>
                      <q-item><q-item-section class="stm-no-results">Sin resultados</q-item-section></q-item>
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section side>
                          <span class="stm-acct-dot" :style="{ background: scope.opt.color || 'var(--brand-primary)' }" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.label }}</q-item-label>
                          <q-item-label caption>{{ scope.opt.currencyCode }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <span class="stm-acct-balance">{{ scope.opt.balanceLabel }}</span>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
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
                <CategorySelector v-model="item.category_id" allow-null placeholder="Categoría del artículo…"
                  :kind="form.type === 'income' ? 'income' : 'expense'" />
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
                <CategorySelector v-model="sc.category_id" allow-null placeholder="Sin categoría"
                  :kind="form.type === 'income' ? 'income' : 'expense'" />
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

        <!-- OWF-184: preview en lenguaje natural + validaciones + estados draft/valid/error
             OWF-296: look del rediseño (ojo + eyebrow "VAS A REGISTRAR" + fraseo de tx-summary.js) -->
        <TfReviewCard
          :type-label="typeLabelForReview"
          :is-adjuste="form.type === 'ajuste'"
          :is-transfer="form.type === 'transfer'"
          :amount="form.type === 'ajuste' ? adjusteDiff : amountWithCommission"
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
          :accent="typeAccent"
          :currency-symbol="reviewCurrencySymbol"
          :jar-name="jarNameForReview"
          :cross-arrives-amount="form.type === 'transfer' && transferIsCrossCurrency && transferRate ? transferConvertedAmount : null"
          :to-currency-symbol="toAccountCurrencySymbol"
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
            {{ saving ? 'Guardando…' : savedFlash ? 'Registrado' : (isEditMode ? 'Guardar cambios' : 'Guardar') }}
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
          <span class="stm-voice-label">{{ voiceRecording ? 'Grabando… (toca para parar)' : 'Toca para dictar' }}</span>
          <span class="stm-voice-sub">Ej: "Gasté 45 dólares en Whole Foods con BofA"</span>
          <div v-if="voiceLoading" class="stm-voice-analyzing">
            <q-spinner size="20px" color="primary" /> Transcribiendo y analizando…
          </div>
          <div v-if="voiceTranscript && !voiceLoading" class="stm-voice-transcript">"{{ voiceTranscript }}"</div>
          <div v-if="voiceError" class="stm-error">{{ voiceError }}</div>
        </div>
        <div v-else class="stm-ai-result">
          <q-icon name="check_circle" size="40px" color="positive" />
          <div class="stm-ai-result__amount">{{ voiceResult.data.currency }} {{ voiceResult.data.amount?.toFixed(2) }}</div>
          <div class="stm-ai-result__desc">{{ voiceResult.data.description }}</div>
          <div v-if="bcvLabel(voiceResult.data)" class="stm-ai-result__bcv">{{ bcvLabel(voiceResult.data) }}</div>
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
          <div v-if="bcvLabel(ocrResult.data)" class="stm-ai-result__bcv">{{ bcvLabel(ocrResult.data) }}</div>
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
          <div v-if="bcvLabel(aiTextResult.data)" class="stm-ai-result__bcv">{{ bcvLabel(aiTextResult.data) }}</div>
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
import { useRouter } from 'vue-router';
import { useQuasar, type QSelect } from 'quasar';
import { useUiStore } from 'stores/ui';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import { api } from 'src/boot/axios';
import { useTransactionTypesStore } from 'stores/transactionTypes';
import { useTagsStore } from 'stores/tags';
import { useAudioRecorder } from 'src/composables/useAudioRecorder';
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
const router = useRouter();
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

// Las 4 formas de ingreso principales, en bloque 2x2 — "Carga masiva" queda
// aparte (no es una forma de ingresar UN movimiento, dispara otro dialog).
const primaryMethods = methods.filter((m) => m.id !== 'bulk');

const tabConfig = {
  voice:  { title: 'Dicta tu movimiento' },
  photo:  { title: 'Sube un comprobante' },
  autoai: { title: 'Describe con texto libre' },
};

// OWF-312: atajos que antes vivían en el pre-modal de escritorio (DesktopQuickModal,
// eliminado por ser redundante con este formulario). Solo desktop, solo tab "Escribir".
const QUICK_LINKS: { id: string; label: string; icon: string; path: string; query: Record<string, string> }[] = [
  { id: 'debt',  label: 'Pago de deuda',   icon: 'credit_card',  path: '/user/debts',  query: { quickAction: 'pay' } },
  { id: 'dream', label: 'Aporte a sueño',  icon: 'auto_awesome', path: '/user/dreams', query: { quickAction: 'contribute' } },
  { id: 'jar',   label: 'Aporte a jar',    icon: 'savings',      path: '/user/jars',   query: { quickAction: 'deposit' } },
];

async function goQuickLink(link: typeof QUICK_LINKS[number]) {
  show.value = false;
  await router.push({ path: link.path, query: link.query });
}

async function goAdvisor() {
  show.value = false;
  await router.push('/user/asesor');
}

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

const allTypes = [
  { id: 'expense'  as const, label: 'Gasto',      icon: 'arrow_outward'  },
  { id: 'income'   as const, label: 'Ingreso',     icon: 'arrow_downward' },
  { id: 'transfer' as const, label: 'Transferir',  icon: 'swap_horiz'     },
  { id: 'ajuste'   as const, label: 'Ajuste',      icon: 'tune'           },
];
// OWF-312: "Ajuste" crea un movimiento especial vía POST /accounts/{id}/adjust-balance
// (no es una transacción PUT-eable) — no tiene sentido ofrecerlo al editar una transacción existente.
const types = computed(() => isEditMode.value ? allTypes.filter(t => t.id !== 'ajuste') : allTypes);

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

// OWF-312: modo edición — reutiliza este mismo form (prellenado) para editar una
// transacción existente en vez del mini-form separado que tenía LiteTransactionsView.
const isEditMode   = computed(() => ui.editingTransactionId != null);
const loadingEditTx = ref(false);

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
const providerSearchTerm = ref('')

async function filterProviders(val: string, update: (fn: () => void) => void) {
  providerSearchTerm.value = val
  try {
    const params = val.trim() ? { search: val } : {}
    const res = await api.get<Provider[] | { data: Provider[] }>('/providers', { params })
    const raw = res.data
    const list = Array.isArray(raw) ? raw : ((raw as { data: Provider[] }).data ?? [])
    update(() => { providerOptions.value = list })
  } catch {
    update(() => { providerOptions.value = [] })
  }
}

// OWF-296: "Sin proveedor" como valor default visible (rediseño). Se cachea el nombre
// del proveedor elegido porque providerOptions se vacía entre búsquedas.
const selectedProviderName = ref<string | null>(null)
watch(() => form.value.provider_id, (id) => {
  if (id == null) { selectedProviderName.value = null; return }
  const p = providerOptions.value.find(pp => pp.id === id)
  if (p) selectedProviderName.value = p.name
})
const providerDisplayValue = computed(() => selectedProviderName.value ?? 'Sin proveedor')

// OWF-264: crear proveedor nuevo directamente desde el formulario.
const showNewProviderForm = ref(false)
const newProviderName = ref('')
const creatingProvider = ref(false)

async function createProvider() {
  const name = newProviderName.value.trim()
  if (!name || creatingProvider.value) return
  creatingProvider.value = true
  try {
    const res = await api.post<{ data: Provider }>('/providers', { name })
    const created = res.data.data
    providerOptions.value = [created, ...providerOptions.value]
    form.value.provider_id = created.id
    newProviderName.value = ''
    showNewProviderForm.value = false
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo crear el proveedor. Intenta de nuevo.' })
  } finally {
    creatingProvider.value = false
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

// OWF-296: chips con color semántico + hint contextual (rediseño TfTags)
const hoveredTagId = ref<number | null>(null)

function tagColor(tag: { color?: string | null }) {
  return tag.color || 'var(--brand-primary)'
}

function tagChipStyle(tag: { id: number; color?: string | null }) {
  const c = tagColor(tag)
  return form.value.tags.includes(tag.id)
    ? { background: c, borderColor: c, color: '#fff' }
    : {
        background: `color-mix(in srgb, ${c} 7%, var(--surface-1))`,
        borderColor: `color-mix(in srgb, ${c} 34%, var(--border-hairline))`,
        color: 'var(--fg-1)',
      }
}

const tagsHint = computed(() => {
  const hovered = visibleTags.value.find(t => t.id === hoveredTagId.value)
  if (hovered?.description) return hovered.description
  const n = form.value.tags.length
  if (n) return `${n} ${n === 1 ? 'seleccionada' : 'seleccionadas'}`
  return 'Toca para clasificar el movimiento'
})

const tagPalette = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6']
const showNewTagForm = ref(false)
const newTagName = ref('')
const newTagDescription = ref('')
const newTagColor = ref(tagPalette[3])

async function createTag() {
  const name = newTagName.value.trim()
  if (!name) return
  const description = newTagDescription.value.trim() || undefined
  const tag = await tagsStore.createTag(name, newTagColor.value, description)
  newTagName.value = ''
  newTagDescription.value = ''
  newTagColor.value = tagPalette[3]
  showNewTagForm.value = false
  if (tag) toggleTag(tag.id)
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
// OWF: monto base + comisión cuando el panel "Cobrar comisión" está activo — usado tanto
// para el preview (TfReviewCard) como para el guardado, para que ambos coincidan en TODOS
// los tipos (antes solo se aplicaba al guardar Gasto/Ingreso; Transferir lo ignoraba por
// completo pese a mostrar "Total" con comisión en el panel).
const commissionActive = computed(() => isProMode.value && proPanel.value === 'comision' && comisionCalculada.value > 0);
const amountWithCommission = computed(() => {
  // OWF: en modo Items el monto real es itemsTotal (el Monto hero queda oculto) — usar
  // form.amount aquí hacía que el preview "Vas a registrar" mostrara siempre $0.00.
  const base = itemsOn.value ? itemsTotal.value : (form.value.amount ?? 0);
  return base + (commissionActive.value ? comisionCalculada.value : 0);
});

// Split
const splitPagos = ref<{ account_id: number | null; amount: number; rate: number }[]>([
  { account_id: null, amount: 0, rate: 1 },
  { account_id: null, amount: 0, rate: 1 },
]);
// OWF: cada fila puede estar en una moneda distinta a USD (con su propia tasa) — sumar el
// monto crudo sin convertir mezclaba unidades (ej. 20 USD + 1500 VES = "1520", cuando el
// equivalente real es 20 + 10 = 30 USD). El equivalente por fila ya se mostraba bien junto al
// campo Tasa (`pago.amount / pago.rate`); `splitTotal` ahora usa la misma conversión, ya que
// se compara contra `form.amount` (USD) tanto en la UI ("Suma") como en la validación de guardado.
const splitTotal = computed(() => splitPagos.value.reduce((s, p) => {
  const currency = splitAccountCurrency(p.account_id);
  const rate = p.rate || 1;
  const usdEquiv = (currency && currency !== 'USD' && rate > 0) ? (p.amount ?? 0) / rate : (p.amount ?? 0);
  return s + usdEquiv;
}, 0));

// Items / factura
const facturaItems = ref<{ name: string; quantity: number; price: number; tax: number; category_id: number | null }[]>([
  { name: '', quantity: 1, price: 0, tax: 0, category_id: null },
]);
const itemsTotal = computed(() =>
  facturaItems.value.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0) * (1 + (Number(it.tax) || 0) / 100), 0)
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
  color?: string | null;
  currency?: { id?: number; code?: string; symbol?: string };
}
function allUserAccounts(): UserAccount[] {
  return (auth.user?.accounts ?? []) as unknown as UserAccount[];
}
function findAccountById(id: number | null | undefined): UserAccount | undefined {
  if (!id) return undefined;
  return allUserAccounts().find(a => a.id === id);
}
// OWF-296: saldo formateado como tfMoney del rediseño (NBSP entre símbolo y cifra)
function formatBalance(n: number, sym: string) {
  return `${sym}\u00A0${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
// OWF-296: opciones enriquecidas (color + moneda + saldo) para el selector estilo Picker del rediseño.
// Nota: `accounts` no tiene columna color en el backend hoy — fallback var(--brand-primary),
// mismo patrón que AccountFilterWidget (`acct.color || 'var(--brand-primary)'`).
const accountOptions = computed(() =>
  allUserAccounts().map((a) => ({
    label: a.name,
    value: a.id,
    color: a.color || null,
    currencyCode: a.currency?.code ?? '',
    balanceLabel: formatBalance(Number(a.balance ?? a.balance_cached ?? 0), a.currency?.symbol || '$'),
  }))
);

// OWF-241: "Hacia" no debe ofrecer la misma cuenta ya elegida como "Desde".
const accountToOptions = computed(() =>
  accountOptions.value.filter((o) => o.value !== form.value.account_from_id)
);

// OWF-297: búsqueda en los selectores de cuenta (rediseño: TODOS los Picker de cuenta
// llevan `searchable` — FormControls.jsx filtra por label, Enter elige el primero).
// La needle es compartida: Quasar dispara @filter('') al abrir cada select, así que se
// resetea sola al cambiar de selector.
const accountNeedle = ref('');
// Qué selector de cuenta tiene el menú abierto ('ajuste' | 'from' | 'to' | 'main' | 'split-N'):
// mientras está abierto se oculta el dot+saldo y se expande el input de búsqueda (CSS).
const openAcctSelect = ref<string | null>(null);
function filterAccounts(
  val: string,
  update: (fn: () => void, after?: (ref: QSelect) => void) => void,
) {
  update(
    () => {
      accountNeedle.value = val.toLowerCase().trim();
    },
    (ref) => {
      // Como el Picker del rediseño: al filtrar, el primer resultado queda
      // resaltado y Enter lo selecciona.
      if (val !== '' && filteredAccountOptions.value.length > 0) {
        ref.setOptionIndex(-1);
        ref.moveOptionSelection(1, true);
      }
    },
  );
}
function applyAccountNeedle<T extends { label: string }>(opts: T[]): T[] {
  const q = accountNeedle.value;
  return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
}
const filteredAccountOptions = computed(() => applyAccountNeedle(accountOptions.value));
const filteredAccountToOptions = computed(() => applyAccountNeedle(accountToOptions.value));
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
const typeLabelForReview = computed(() => allTypes.find(t => t.id === form.value.type)?.label ?? '');
// OWF-296: accent por tipo (mismos colores que .stm-type-btn--active) + datos para el
// fraseo de tx-summary.js del rediseño (símbolo real de la cuenta + cántaro anclado).
const typeAccent = computed(() => (
  { expense: '#ef4444', income: '#10b981', transfer: '#8b5cf6', ajuste: '#f59e0b' }[form.value.type]
));
const reviewCurrencySymbol = computed(() => {
  const acc = form.value.type === 'transfer'
    ? findAccountById(form.value.account_from_id)
    : findAccountById(form.value.account_id);
  return acc?.currency?.symbol || '$';
});
const toAccountCurrencySymbol = computed(() => findAccountById(form.value.account_to_id)?.currency?.symbol || '$');
const jarNameForReview = computed(() => jarForCategory(form.value.category_id ?? null, getCachedJars())?.name ?? null);
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
  // OWF: en modo Items el monto real es la suma de las líneas (itemsTotal) — el campo
  // Monto hero queda oculto y nunca se completa, así que validar contra form.amount
  // directo bloqueaba el guardado SIEMPRE que el panel Items estuviera activo.
  const effectiveAmount = itemsOn.value ? itemsTotal.value : form.value.amount;
  if (!effectiveAmount || effectiveAmount <= 0) errs.push('El monto debe ser mayor a cero.');
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
  const effectiveAmount = itemsOn.value ? itemsTotal.value : form.value.amount;
  return !!form.value.name.trim() && !!effectiveAmount && effectiveAmount > 0 && !!form.value.account_id;
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
    // OWF-312: "Ajuste" no existe en modo edición (ver filtro de `types`), pero por
    // seguridad nunca pasa por el endpoint de ajuste si venimos editando una transacción.
    if (form.value.type === 'ajuste' && !isEditMode.value) {
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
      const baseAmt = Math.abs(rawAmt); // monto ingresado, en la moneda de la cuenta origen
      // OWF: la comisión (si el panel "Cobrar comisión" está activo) se descuenta de la
      // cuenta origen igual que en Gasto/Ingreso, pero NO infla lo que recibe la cuenta
      // destino — es un cargo del banco/plataforma sobre la transferencia, no parte del
      // monto transferido. Antes se ignoraba por completo en Transferir.
      const fromAmt = commissionActive.value ? baseAmt + comisionCalculada.value : baseAmt; // amount in FROM account's currency
      const fromIsUSD = (transferFromCurrency.value || '').toUpperCase() === 'USD';
      // transactions.amount is always the USD equivalent
      const usdAmt = (transferIsCrossCurrency.value && tRate > 0)
        ? (fromIsUSD ? fromAmt : fromAmt / tRate)
        : fromAmt;
      // TO payment amount in TO account's currency — basado en el monto SIN comisión
      const toAmt = (transferIsCrossCurrency.value && tRate > 0)
        ? (fromIsUSD ? baseAmt * tRate : baseAmt / tRate)
        : baseAmt;
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
              amount: (Number(it.quantity) || 0) * (Number(it.price) || 0) * (1 + (Number(it.tax) || 0) / 100),
              tax_rate: Number(it.tax) || 0,
              category_id: it.category_id ?? null,
              jar_id: itemJar?.id ?? null,
            };
          })
        : undefined;

      // Pro: monto final — items suma sus líneas, comisión se suma al monto base
      const finalAmount = itemsOn.value
        ? itemsTotal.value
        : amountWithCommission.value;

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

    if (isEditMode.value && ui.editingTransactionId != null) {
      // OWF-312: reusa la acción del store (PUT /transactions/:id — la misma que ya usa
      // el resto de la app) en vez de duplicar la llamada aquí. Antes LiteTransactionsView
      // y TxDetailModal usaban api.patch(), que no coincide con la ruta real del backend
      // (sólo PUT existe para /transactions/:id).
      await txStore.updateTransaction({ id: ui.editingTransactionId, ...payload });
      if (form.value.type !== 'transfer' && showDualRates.value) {
        await persistOfficialRateIfNeeded();
      }
      $q.notify({ type: 'positive', message: 'Movimiento actualizado' });
      emitSavedWithFlash();
      return;
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
// OWF-311: graba audio con MediaRecorder (estándar web, funciona en Brave/Safari/iOS) y lo
// manda al servidor para transcribir (Groq Whisper) — reemplaza SpeechRecognition del
// navegador, que no es confiable cross-browser (Brave la bloquea, iOS Safari nunca la tuvo).
const { isRecording: voiceRecording, mimeType: voiceMime, error: voiceInputError, start: startVoiceRec, stop: stopVoiceRec } = useAudioRecorder();
const { loading: voiceLoading, error: voiceAiError, extractFromAudio } = useAiExtraction();
const voiceResult = ref<ExtractionResult | null>(null);
const voiceTranscript = ref('');
const voiceError  = computed(() => voiceInputError.value ?? voiceAiError.value);

function startVoice() {
  voiceResult.value = null;
  voiceTranscript.value = '';
  navigator.vibrate?.(50);
  void startVoiceRec();
}

async function stopVoice() {
  navigator.vibrate?.(50);
  const audio = await stopVoiceRec();
  if (audio) {
    const result = await extractFromAudio(audio, voiceMime.value);
    voiceResult.value = result;
    voiceTranscript.value = result?.transcript ?? '';
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

// OWF-317: equivalente en bolívares a la tasa oficial (BCV) del usuario, ya calculado
// determinísticamente por el backend (no por la IA) — solo viene presente cuando el monto
// extraído está en USD y el usuario tiene una tasa oficial configurada.
function bcvLabel(d: ExtractionResult['data']): string | null {
  if (!d.bcv_equivalent || !d.bcv_currency_code) return null;
  const amount = d.bcv_equivalent.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `≈ ${d.bcv_currency_code} ${amount} a la tasa BCV${d.bcv_rate ? ` (${d.bcv_rate})` : ''}`;
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

  // OWF-316 — El backend ya resolvió el "merchant" transcrito (ej. "Vanesco") contra un
  // provider real del usuario por similitud (ej. "Banesco") — se aplica directo, sin volver
  // a intentar un match acá (el q-select se prellena con el nombre real, no el transcrito).
  if (d.provider_id_suggestion) {
    form.value.provider_id = d.provider_id_suggestion;
    selectedProviderName.value = d.provider_name_suggestion ?? null;
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
  newTagDescription.value = '';
  newTagColor.value = tagPalette[3];
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
  // OWF: los selectores de cuenta leen `auth.user.accounts`, un snapshot cargado una sola vez
  // al iniciar sesión — tras crear transacciones en la misma sesión mostraba saldos viejos
  // (hallazgo Ronda 2 QA_TRANSACTIONS_TEST_MATRIX.md). Refresca el perfil (incluye accounts
  // con balance actualizado) cada vez que se abre el modal, sin bloquear el render.
  void auth.refreshProfile();

  // OWF-312: modo edición — sobrescribe los defaults de "crear" con los datos reales
  // de la transacción (async, llega después del reset de arriba).
  if (isEditMode.value && ui.editingTransactionId != null) {
    void loadTransactionForEdit(ui.editingTransactionId);
  }
}

// OWF-312: infiere el tipo lógico (expense/income/transfer) de una transacción cruda del
// backend igual que lo hace LiteTransactionsView para la lista — "ajuste" se colapsa a
// income/expense según el signo porque el modo edición no ofrece esa opción (ver `types`).
function deriveTypeFromTx(raw: Record<string, unknown>): 'expense' | 'income' | 'transfer' {
  const rawType = raw.transaction_type as Record<string, unknown> | undefined;
  const slug = typeof rawType?.slug === 'string' ? rawType.slug.toLowerCase() : '';
  const name = typeof rawType?.name === 'string' ? rawType.name.toLowerCase() : '';
  const text = `${slug} ${name}`;
  const amount = Number(raw.amount ?? 0);
  if (text.includes('transfer') || text.includes('traspaso')) return 'transfer';
  if (text.includes('income') || text.includes('ingreso')) return 'income';
  if (text.includes('expense') || text.includes('gasto')) return 'expense';
  return amount >= 0 ? 'income' : 'expense';
}

async function loadTransactionForEdit(id: number) {
  loadingEditTx.value = true;
  try {
    const res = await api.get<{ data: Record<string, unknown> } | Record<string, unknown>>(`/transactions/${id}`);
    const body = res.data as { data?: Record<string, unknown> };
    const raw: Record<string, unknown> = body?.data ?? (res.data as Record<string, unknown>);

    const txType = deriveTypeFromTx(raw);
    form.value.type = txType;
    form.value.name = typeof raw.name === 'string' ? raw.name : '';
    form.value.date = typeof raw.date === 'string' ? raw.date.replace(' ', 'T').slice(0, 16) : now();
    dateShortcut.value = 'custom';

    const cat = raw.category as { id?: number } | null | undefined;
    form.value.category_id = cat?.id ?? (typeof raw.category_id === 'number' ? raw.category_id : null);
    form.value.provider_id = typeof raw.provider_id === 'number' ? raw.provider_id : null;
    form.value.tags = Array.isArray(raw.tags)
      ? (raw.tags as { id: number }[]).map(t => t.id).filter((n): n is number => typeof n === 'number')
      : [];

    const payments = Array.isArray(raw.payment_transactions)
      ? (raw.payment_transactions as { account_id: number | null; amount: number | string }[])
      : [];
    const amount = Number(raw.amount ?? 0);

    if (txType === 'transfer') {
      const from = payments.find(p => Number(p.amount) < 0);
      const to = payments.find(p => Number(p.amount) > 0);
      form.value.account_from_id = from?.account_id ?? null;
      form.value.account_to_id = to?.account_id ?? null;
      form.value.amount = from ? Math.abs(Number(from.amount)) : Math.abs(amount);
    } else {
      form.value.account_id = payments[0]?.account_id ?? form.value.account_id;
      form.value.amount = Math.abs(amount);
    }
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar la transacción para editar.' });
    ui.closeSmartModal();
  } finally {
    loadingEditTx.value = false;
  }
}

function onHide() {
  if (voiceRecording.value) void stopVoiceRec();
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
  flex-direction: column;
  gap: 10px;
  padding: 0 22px 14px;
  flex-shrink: 0;
}

.stm-method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stm-method-tile {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 13px 14px;
  border: none;
  border-radius: var(--radius-md, 12px);
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
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

.stm-bulk-link {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  border: none;
  background: transparent;
  font-family: var(--font-body, sans-serif);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--fg-3, #94a3b8);
  cursor: pointer;

  &:hover { color: var(--fg-2, #64748b); }
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

// OWF-312: fila de atajos secundarios (pago de deuda / aporte sueño / aporte jar / asesor IA)
.stm-quicklinks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.stm-quicklink {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: 999px;
  padding: 5px 10px;
  background: transparent;
  color: var(--fg-2, #64748b);
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    background: var(--surface-2, #f1f4f6);
    color: var(--fg-1, #0f172a);
  }

  &--ai {
    color: var(--brand-primary, #7c3aed);
    border-color: var(--brand-primary, #7c3aed);
  }
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

// OWF-264: header de field con acción "+ Nuevo proveedor" inline
.stm-field__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;

  .stm-label { margin-bottom: 5px; }
}

.stm-inline-add {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--brand-primary, #3b82f6);
  white-space: nowrap;
}

.stm-rate-equiv {
  font-size: 11px;
  color: var(--fg-3, #94a3b8);
  margin-top: 3px;
  display: block;
}

// OWF-296: hint bajo un campo (rediseño: Field hint)
.stm-hint {
  display: block;
  font-size: 11.5px;
  color: var(--fg-3, #94a3b8);
  margin-top: 4px;
}

// OWF-296: selector de cuenta estilo Picker del rediseño (dot 9px radius 3 + saldo tabular a la derecha)
.stm-acct-dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
  display: inline-block;
}

.stm-acct-line {
  display: flex;
  align-items: center;
  gap: 9px;
  // OWF-297: flex en vez de width:100% para que el input de búsqueda (use-input)
  // conviva en la misma fila con el dot+saldo sin quedar a ancho cero.
  flex: 1 1 auto;
  min-width: 0;
}

// OWF-297: con el menú cerrado y una cuenta elegida (q-field--float), el input de
// búsqueda (use-input) queda colapsado para que el dot+saldo siga alineado a la
// derecha; al abrir el menú se oculta la selección y el input toma todo el ancho.
.stm-acct-select:not(.stm-acct-select--open).q-field--float :deep(.q-field__input) {
  flex: 0 0 auto;
  width: 0;
  // Quasar trae `.q-select .q-field__input { min-width: 50px !important }`
  min-width: 0 !important;
  padding: 0;
}
.stm-acct-select--open :deep(.stm-acct-line) {
  display: none;
}

.stm-no-results {
  font-size: 12.5px;
  color: var(--fg-3, #94a3b8);
  text-align: center;
}

.stm-acct-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fg-1, #0f172a);
}

.stm-acct-balance {
  font-family: var(--font-money, monospace);
  font-size: 12px;
  color: var(--fg-2, #64748b);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
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
  &__bcv    { font-size: 12px; font-weight: 600; color: var(--brand-primary, #2d4da6); }
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
// OWF-286/296: SIEMPRE 3 columnas en desktop (rowDir='row' en rediseno). Con flex
// `1 1 140px` el min-content de cada card (icono + q-toggle) superaba el ancho
// disponible y la fila se partía en 2+1 — grid con minmax(0,1fr) fuerza 3 columnas.
.stm-pro-card-toggles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;

  .stm-wrap--mobile & { display: flex; flex-direction: column; }
}

.stm-pro-card-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;

  .stm-pro-card-toggles & {
    width: auto;
    min-width: 0;
    gap: 8px;
    padding: 10px 10px;

    .stm-pro-card-toggle__icon { width: 28px; height: 28px; }
    .stm-pro-card-toggle__sub {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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

// ── Tags — OWF-296: look del rediseño TfTags ────────────────────────────────
.stm-tags-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.stm-label--tags {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--fg-3, #94a3b8);
}

.stm-tags-hint {
  font-size: 11.5px;
  color: var(--fg-3, #94a3b8);
  min-height: 15px;
  text-align: right;
  text-wrap: pretty;
}

.stm-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 2px 0 5px;
}

.stm-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 7px 13px 7px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-hairline, #e2e8f0);
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--fg-1, #0f172a);
  cursor: pointer;
  transition: background 140ms, border-color 140ms, color 140ms;

  &--active { font-weight: 700; }
  &--add { color: var(--fg-3, #94a3b8); border-style: dashed; padding: 7px 13px; font-weight: 600; }
  &--add:hover { color: var(--fg-2); border-color: var(--fg-3); }
}

.stm-new-tag-form {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 13px;
  margin-top: 8px;
  border-radius: var(--radius-md, 12px);
  background: var(--surface-2, #f1f5f9);
  border: 1px solid var(--border-hairline, #e2e8f0);

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__preview {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    flex-shrink: 0;
  }

  &__swatches {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  &__swatch {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &--active { border-color: var(--fg-1, #0f172a); box-shadow: 0 0 0 2px var(--surface-2, #f1f5f9); }
    &--random { background: var(--surface-1, #fff); border: 1px dashed var(--border-hairline, #e2e8f0); color: var(--fg-2, #475569); }
    &--wheel {
      position: relative;
      overflow: hidden;
      background: conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red);

      input[type="color"] {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: 0;
        padding: 0;
      }
    }
  }

  &__spacer { flex: 1; }

  &__cancel {
    border: 0;
    background: transparent;
    cursor: pointer;
    color: var(--fg-3, #94a3b8);
    font-size: 12.5px;
    font-weight: 600;
    padding: 7px 10px;
  }

  &__submit {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 0;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    font-size: 12.5px;
    font-weight: 700;

    &:disabled {
      cursor: not-allowed;
      background: var(--surface-3, #e2e8f0);
      color: var(--fg-3, #94a3b8);
    }
  }
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
