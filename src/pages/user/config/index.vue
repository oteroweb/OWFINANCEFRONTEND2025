<template>
  <q-page :class="isLiteLayout ? 'q-pa-md lite-config' : 'pro-config'">
    <template v-if="!isLiteLayout">
      <div class="pro-config__heading">
        <span class="t-eyebrow">Sistema</span>
        <h1 class="t-h1" style="margin: 4px 0 20px;">Configuración</h1>
      </div>

      <!-- ── Aplicación (unificado con Lite) ─────────────────────── -->
      <div class="q-gutter-md q-mb-lg">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-md">
            <q-icon name="tune" class="q-mr-sm" />
            Aplicación
          </div>
          <div class="row q-col-gutter-md items-center q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="text-body2">Modo de la app</div>
              <div class="text-caption text-grey-7">Pro · panel completo multi-cuenta</div>
            </div>
            <div class="col-12 col-sm-6 row justify-end">
              <q-btn-toggle
                :model-value="activeLayoutMode"
                toggle-color="primary"
                :options="[{ label: 'Lite', value: 'lite' }, { label: 'Pro', value: 'pro' }]"
                @update:model-value="switchMode"
              />
            </div>
          </div>
          <q-separator class="q-mb-md" />
          <div class="row q-col-gutter-md items-center q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="text-body2">Idioma</div>
              <div class="text-caption text-grey-7">Interfaz y formatos</div>
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="appLang"
                :options="langOptions"
                emit-value
                map-options
                dense
                outlined
                @update:model-value="onLangChange"
              />
            </div>
          </div>
          <q-separator class="q-mb-md" />
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-body2">Ocultar saldos por defecto</div>
              <div class="text-caption text-grey-7">{{ ui.hideValues ? 'Activado' : 'Desactivado' }}</div>
            </div>
            <q-toggle :model-value="ui.hideValues" color="primary" @update:model-value="ui.toggleHideValues()" />
          </div>
          <q-separator class="q-mb-md" />
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-body2">Tema</div>
              <div class="text-caption text-grey-7">{{ isDark ? 'Oscuro' : 'Claro' }}</div>
            </div>
            <q-toggle :model-value="isDark" color="primary" @update:model-value="toggleTheme()" />
          </div>
          <q-separator class="q-mb-md" />
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-body2">Presupuesto estricto</div>
              <div class="text-caption text-grey-7">Alertas cuando superas el límite del cántaro</div>
            </div>
            <q-toggle :model-value="notifPrefs.overBudget" color="primary" @update:model-value="toggleNotif('overBudget')" />
          </div>
          <q-separator class="q-mb-md" />
          <div class="row items-center justify-between" style="cursor:pointer" @click="router.push('/user/accounts')">
            <div>
              <div class="text-body2">Divisa predeterminada</div>
              <div class="text-caption text-grey-7">Gestionar en Cuentas</div>
            </div>
            <q-icon name="chevron_right" size="18px" color="grey-7" />
          </div>
        </q-card>

        <!-- ── Seguridad (unificado con Lite) ─────────────────────── -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-md">
            <q-icon name="shield" class="q-mr-sm" />
            Seguridad
          </div>
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-body2">Pedir confirmación para ver saldos</div>
              <div class="text-caption text-grey-7">
                {{ ui.privacyLockEnabled ? 'Pide huella/rostro/contraseña (o PIN) para revelar montos' : 'Desactivado' }}
              </div>
            </div>
            <q-toggle v-model="ui.privacyLockEnabled" color="primary" @update:model-value="ui.togglePrivacyLock()" />
          </div>
          <q-separator class="q-mb-md" />
          <div class="row items-center justify-between">
            <div>
              <div class="text-body2">PIN de acceso rápido</div>
              <div class="text-caption text-grey-7">
                {{ hasPinConfigured ? 'Configurado — alternativa rápida a tu contraseña' : 'No configurado' }}
              </div>
            </div>
            <div class="q-gutter-sm">
              <q-btn
                outline
                color="primary"
                :label="hasPinConfigured ? 'Cambiar PIN' : 'Configurar PIN'"
                @click="openPinDialog"
              />
              <q-btn v-if="hasPinConfigured" flat color="negative" label="Eliminar" @click="promptRemovePin" />
            </div>
          </div>
        </q-card>

        <!-- ── Notificaciones (Pro) ──────────────────────────────────── -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-md">
            <q-icon name="notifications" class="q-mr-sm" />
            Notificaciones
          </div>
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-body2">Resumen semanal</div>
              <div class="text-caption text-grey-7">Un email cada lunes con tu balance</div>
            </div>
            <q-toggle :model-value="notifPrefs.weekDigest" color="primary" @update:model-value="toggleNotif('weekDigest')" />
          </div>
          <q-separator class="q-mb-md" />
          <div class="row items-center justify-between">
            <div>
              <div class="text-body2">Alertas de dinero ocioso</div>
              <div class="text-caption text-grey-7">Cuando un cántaro no se mueve</div>
            </div>
            <q-toggle :model-value="notifPrefs.idleAlerts" color="primary" @update:model-value="toggleNotif('idleAlerts')" />
          </div>
        </q-card>

        <!-- ── Perfil financiero (Pro) ──────────────────────────────── -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-md">
            <q-icon name="insights" class="q-mr-sm" />
            Perfil financiero
          </div>
          <div class="row items-center justify-between" style="cursor:pointer" @click="router.push('/user/financial-profile')">
            <div>
              <div class="text-body2">Mi perfil financiero</div>
              <div class="text-caption text-grey-7">Ingresos, metas, deudas y cántaros</div>
            </div>
            <q-icon name="chevron_right" size="18px" color="grey-7" />
          </div>
        </q-card>

        <!-- ── Tasas de Cambio (Pro) ───────────────────────────────── -->
        <div>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <span class="t-eyebrow">Tasas de cambio</span>
            <span class="text-caption text-grey-7" style="font-style: italic">
              · BCV oficial + tasa del momento · se aplican en todo Pro
            </span>
          </div>
          <q-card flat bordered>
            <ExchangeRatesTable />
          </q-card>
        </div>
      </div>

      <!-- ── Cerrar sesión (Pro) ────────────────────────────────────── -->
      <div class="row justify-end q-mt-sm">
        <q-btn flat color="negative" icon="logout" label="Cerrar sesión" @click="handleLogout" />
      </div>
    </template>
    <template v-else>
      <div class="lite-config__header">
        <span class="t-eyebrow">Configuración</span>
        <h1 class="t-h1" style="margin: 6px 0 16px;">Preferencias</h1>
      </div>
      <!-- ── App Prefs: modo + idioma + dispositivo + tema ───────── -->
      <div class="apref">
        <span class="t-eyebrow apref__label">Aplicación</span>
        <div class="apref__mode-row">
          <button
            class="apref__mode-btn"
            :class="{ 'apref__mode-btn--active': activeLayoutMode === 'lite' }"
            @click="switchMode('lite')"
          >
            <span class="material-icons">phone_iphone</span>
            <span>Lite</span>
            <span class="apref__mode-sub">Simple y rápido</span>
          </button>
          <button
            class="apref__mode-btn"
            :class="{ 'apref__mode-btn--active': activeLayoutMode === 'pro' }"
            @click="switchMode('pro')"
          >
            <span class="material-icons">desktop_mac</span>
            <span>Pro</span>
            <span class="apref__mode-sub">Sidebar + análisis</span>
          </button>
        </div>

        <div class="apref__row" @click="toggleTheme">
          <span class="material-icons apref__row-icon">{{ isDark ? 'dark_mode' : 'light_mode' }}</span>
          <div class="apref__row-text">
            <span>Tema</span>
            <span class="apref__row-hint">{{ isDark ? 'Oscuro' : 'Claro' }}</span>
          </div>
          <div class="apref__toggle" :class="{ 'apref__toggle--on': isDark }" />
        </div>

        <div class="apref__row" @click="ui.toggleHideValues()">
          <span class="material-icons apref__row-icon">visibility_off</span>
          <div class="apref__row-text">
            <span>Ocultar saldos por defecto</span>
            <span class="apref__row-hint">{{ ui.hideValues ? 'Activado' : 'Desactivado' }}</span>
          </div>
          <div class="apref__toggle" :class="{ 'apref__toggle--on': ui.hideValues }" />
        </div>

        <div class="apref__row" @click="toggleNotif('overBudget')">
          <span class="material-icons apref__row-icon">account_balance_wallet</span>
          <div class="apref__row-text">
            <span>Presupuesto estricto</span>
            <span class="apref__row-hint">Alertas cuando superas el límite del cántaro</span>
          </div>
          <div class="apref__toggle" :class="{ 'apref__toggle--on': notifPrefs.overBudget }" />
        </div>

        <div class="apref__row" style="cursor:pointer" @click="router.push('/user/accounts')">
          <span class="material-icons apref__row-icon">payments</span>
          <div class="apref__row-text">
            <span>Divisa predeterminada</span>
            <span class="apref__row-hint">{{ auth.defaultCurrencyCode }} · gestionar en Cuentas</span>
          </div>
          <span class="material-icons" style="font-size:18px;color:var(--fg-3)">chevron_right</span>
        </div>

        <!-- Idioma (spec: Aplicación > Idioma dropdown) -->
        <div class="apref__row">
          <span class="material-icons apref__row-icon">language</span>
          <div class="apref__row-text">
            <span>Idioma</span>
            <span class="apref__row-hint">Interfaz y formatos</span>
          </div>
          <q-select
            v-model="appLang"
            :options="langOptions"
            emit-value
            map-options
            dense
            outlined
            style="min-width:120px;font-size:13px"
            @update:model-value="onLangChange"
          />
        </div>

        <!-- Vista previa / Pantalla de inicio (spec: Aplicación > Vista previa) -->
        <div class="apref__row" style="cursor:pointer" @click="router.push('/user/home')">
          <span class="material-icons apref__row-icon">home</span>
          <div class="apref__row-text">
            <span>Pantalla de inicio</span>
            <span class="apref__row-hint">Inicio</span>
          </div>
          <span class="material-icons" style="font-size:18px;color:var(--fg-3)">chevron_right</span>
        </div>
      </div>

      <!-- ── Nav items ───────────────────────────────────────────── -->
      <div class="lite-config__section-label">Cuenta</div>
      <div class="lite-config__nav">
        <button
          v-for="item in configNav"
          :key="item.name"
          class="lite-config__nav-item"
          :class="{ 'lite-config__nav-item--active': !item.route && tab === item.name }"
          @click="handleNavItem(item)"
        >
          <q-icon :name="item.icon" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">{{ item.label }}</span>
            <span class="lite-config__nav-hint">{{ item.hint }}</span>
          </div>
          <q-icon name="chevron_right" size="18px" />
        </button>
        <!-- Repetir onboarding -->
        <button class="lite-config__nav-item" @click="showOnboarding = true">
          <q-icon name="restart_alt" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">Repetir configuración inicial</span>
            <span class="lite-config__nav-hint">Vuelve a ver el asistente de bienvenida</span>
          </div>
          <q-icon name="chevron_right" size="18px" />
        </button>
        <!-- Exportar datos -->
        <button class="lite-config__nav-item" @click="$q.notify({ message: 'Exportación próximamente', color: 'info' })">
          <q-icon name="receipt_long" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">Exportar datos</span>
            <span class="lite-config__nav-hint">CSV, PDF</span>
          </div>
          <q-icon name="chevron_right" size="18px" />
        </button>
      </div>

      <!-- ── Notificaciones ───────────────────────────────────────── -->
      <div class="lite-config__section-label">Notificaciones</div>
      <div class="lite-config__nav">
        <div class="lite-config__nav-item lite-config__nav-item--toggle" @click="toggleNotif('weekDigest')">
          <q-icon name="notifications" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">Resumen semanal</span>
            <span class="lite-config__nav-hint">Un email cada lunes con tu balance</span>
          </div>
          <div class="apref__toggle" :class="{ 'apref__toggle--on': notifPrefs.weekDigest }" />
        </div>
        <div class="lite-config__nav-item lite-config__nav-item--toggle" @click="toggleNotif('idleAlerts')">
          <q-icon name="notifications" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">Alertas de dinero ocioso</span>
            <span class="lite-config__nav-hint">Cuando un cántaro no se mueve</span>
          </div>
          <div class="apref__toggle" :class="{ 'apref__toggle--on': notifPrefs.idleAlerts }" />
        </div>
      </div>

      <!-- ── Seguridad ────────────────────────────────────────────── -->
      <div class="lite-config__section-label">Seguridad</div>
      <div class="lite-config__nav">
        <button class="lite-config__nav-item" @click="void router.push('/user/profile')">
          <q-icon name="lock" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">Contraseña</span>
            <span class="lite-config__nav-hint">Cambiar tu contraseña de acceso</span>
          </div>
          <q-icon name="chevron_right" size="18px" />
        </button>
        <div class="lite-config__nav-item lite-config__nav-item--toggle" @click="ui.togglePrivacyLock()">
          <q-icon name="shield" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">Pedir confirmación para ver saldos</span>
            <span class="lite-config__nav-hint">{{ ui.privacyLockEnabled ? 'Huella/rostro/contraseña o PIN' : 'Desactivado' }}</span>
          </div>
          <div class="apref__toggle" :class="{ 'apref__toggle--on': ui.privacyLockEnabled }" />
        </div>
        <button class="lite-config__nav-item" @click="openPinDialog">
          <q-icon name="pin" size="20px" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label">{{ hasPinConfigured ? 'Cambiar PIN' : 'Configurar PIN' }}</span>
            <span class="lite-config__nav-hint">{{ hasPinConfigured ? 'Configurado — alternativa rápida a tu contraseña' : 'Desbloqueo rápido sin escribir tu contraseña' }}</span>
          </div>
          <q-icon name="chevron_right" size="18px" />
        </button>
        <button v-if="hasPinConfigured" class="lite-config__nav-item" @click="promptRemovePin">
          <q-icon name="pin_off" size="20px" color="negative" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label" style="color: var(--expense-fg, #b91c1c)">Eliminar PIN</span>
            <span class="lite-config__nav-hint">Quita el desbloqueo rápido</span>
          </div>
        </button>
      </div>

      <!-- ── Cerrar sesión ────────────────────────────────────────── -->
      <div class="lite-config__nav lite-config__nav--danger">
        <button class="lite-config__nav-item lite-config__nav-item--danger" @click="handleLogout">
          <q-icon name="logout" size="20px" color="negative" />
          <div class="lite-config__nav-text">
            <span class="lite-config__nav-label" style="color: var(--expense-fg, #b91c1c)">Cerrar sesión</span>
            <span class="lite-config__nav-hint">{{ auth.user?.email }}</span>
          </div>
        </button>
      </div>

      <OnboardingFlow v-model="showOnboarding" />
    </template>

    <!-- Diálogo compartido: configurar/cambiar PIN de seguridad -->
    <q-dialog v-model="showPinDialog" persistent>
      <q-card style="min-width: 320px; max-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ hasPinConfigured ? 'Cambiar PIN' : 'Configurar PIN' }}</div>
          <div class="text-caption text-grey-7">
            El PIN es una alternativa rápida a tu contraseña para revelar saldos.
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="pinDialogPassword"
            type="password"
            label="Tu contraseña actual"
            outlined
            dense
            autocomplete="current-password"
          />
          <q-input
            v-model="pinDialogPin"
            type="password"
            inputmode="numeric"
            maxlength="6"
            label="Nuevo PIN (4-6 dígitos)"
            outlined
            dense
          />
          <q-input
            v-model="pinDialogPinConfirm"
            type="password"
            inputmode="numeric"
            maxlength="6"
            label="Confirmar PIN"
            outlined
            dense
          />
          <q-banner v-if="pinDialogError" class="bg-red-1 text-red-9" dense rounded>
            {{ pinDialogError }}
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="showPinDialog = false" />
          <q-btn color="primary" label="Guardar" :loading="pinDialogSaving" @click="submitPinDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-card flat :bordered="false" :class="isLiteLayout ? 'lite-config__card' : 'pro-config__card'">
      <q-tabs v-if="!isLiteLayout" v-model="tab" dense class="text-primary" align="left" inline-label>
        <q-tab name="profile" icon="person" label="Perfil" />
        <q-tab name="finance" icon="account_balance" label="Finanzas" />
        <q-tab name="categories" icon="category" label="Categorías" />
        <q-tab name="accounts" icon="account_balance_wallet" label="Cuentas" />
        <q-tab name="taxes" icon="percent" label="Impuestos" />
      </q-tabs>
      <q-separator v-if="!isLiteLayout" />
      <q-tab-panels v-model="tab" :animated="!isLiteLayout">
        <q-tab-panel name="profile">
          <div class="q-gutter-md">
            <!-- Avatar y datos básicos -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-md">
                <q-icon name="person" class="q-mr-sm" />
                Información Personal
              </div>
              <div class="row q-col-gutter-md items-center q-mb-md">
                <div class="col-auto">
                  <q-avatar size="96px">
                    <img :src="avatarPreview || avatarUrl" alt="avatar" />
                  </q-avatar>
                </div>
                <div class="col-auto">
                  <q-btn color="primary" label="Cambiar foto" @click="pickAvatar" />
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onFileChange"
                  />
                  <div class="text-caption text-grey-7 q-mt-xs">Formatos: JPG, PNG (máx. 2MB)</div>
                </div>
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="name"
                    label="Nombre completo"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'El nombre es requerido']"
                  >
                    <template #prepend>
                      <q-icon name="badge" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="email"
                    label="Correo electrónico"
                    type="email"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'El correo es requerido']"
                  >
                    <template #prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card>

            <!-- Seguridad -->
            <ChangePasswordCard />

            <!-- Botón de guardar -->
            <div class="row justify-end q-gutter-sm">
              <q-btn outline color="grey-7" label="Cancelar" @click="resetForm" />
              <q-btn
                color="primary"
                :loading="saving"
                label="Guardar cambios"
                icon-right="save"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Pestaña Finanzas -->
        <q-tab-panel name="finance">
          <div class="q-gutter-md">
            <!-- Información general de finanzas -->
            <q-card flat bordered class="q-pa-md bg-blue-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="account_balance" size="48px" color="blue-7" />
                <div>
                  <div class="text-h6 text-blue-9">Configuración Financiera</div>
                  <div class="text-body2 text-blue-8">
                    Administra tu ingreso mensual y configuración monetaria para optimizar la
                    distribución en tus cántaros
                  </div>
                </div>
              </div>
            </q-card>

            <!-- Moneda por defecto -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="attach_money" class="q-mr-sm" />
                Moneda por Defecto
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Selecciona la moneda en la que deseas visualizar todas las cantidades en la
                aplicación
              </div>
              <q-select
                v-model="selectedCurrencyId"
                :options="currencyOptions"
                :loading="currencyLoading"
                option-label="nameLabel"
                option-value="id"
                emit-value
                map-options
                use-input
                input-debounce="300"
                label="Moneda"
                outlined
                dense
                @focus="ensureCurrenciesLoaded"
                @filter="onCurrencyFilter"
              >
                <template #prepend>
                  <q-icon name="payments" />
                </template>
              </q-select>
            </q-card>

            <!-- Ingreso mensual -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="trending_up" class="q-mr-sm" />
                Ingreso Mensual Esperado
              </div>
              <div class="text-caption text-grey-7 q-mb-md">
                Define tu ingreso mensual esperado. Este valor es la base para calcular las
                sugerencias de distribución en tus cántaros según porcentajes
              </div>
              <q-input
                v-model.number="monthlyIncome"
                type="number"
                label="Ingreso mensual esperado"
                outlined
                step="0.01"
                min="0"
                prefix="$"
                class="q-mb-md"
              >
                <template #prepend>
                  <q-icon name="paid" />
                </template>
              </q-input>

              <!-- Info boxes sobre el ingreso mensual -->
              <q-banner v-if="monthlyIncome > 0" class="bg-blue-1 text-blue-9" dense rounded>
                <template #avatar>
                  <q-icon name="info" color="blue" />
                </template>
                <div class="text-body2">
                  <div class="text-weight-bold q-mb-sm">✅ Sistema Híbrido Activado</div>
                  <p class="q-mb-sm">
                    Con un ingreso mensual de
                    <strong>${{ monthlyIncome.toFixed(2) }}</strong> configurado, verás dos tipos de
                    sugerencias en cada cántaro:
                  </p>
                  <ul class="q-my-sm q-pl-md">
                    <li class="q-mb-xs">
                      <strong>💰 Sugerido (Esperado):</strong> Calculado en base a tu ingreso
                      mensual esperado de ${{ monthlyIncome.toFixed(2) }}. Ideal para planificación
                      y presupuestos.
                    </li>
                    <li>
                      <strong>📊 Sugerido (Real):</strong> Calculado dinámicamente desde tus
                      transacciones de ingreso del mes actual. Te muestra la realidad de tus
                      ingresos.
                    </li>
                  </ul>
                  <div class="q-mt-sm text-caption">
                    <q-icon name="lightbulb" size="14px" />
                    <strong>Tip:</strong> Compara ambas sugerencias para ver si estás cumpliendo tus
                    metas de ingreso y ajusta tu presupuesto en consecuencia.
                  </div>
                </div>
              </q-banner>
              <q-banner v-else class="bg-orange-1 text-orange-9" dense rounded>
                <template #avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                <div class="text-body2">
                  <strong>⚠️ Configura tu ingreso mensual</strong>
                  <p class="q-my-sm">
                    Sin un ingreso mensual configurado, solo verás los montos reales basados en tus
                    transacciones. Configúralo para obtener sugerencias de distribución por
                    porcentajes en tus cántaros.
                  </p>
                </div>
              </q-banner>
            </q-card>

            <!-- Cómo funciona -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 q-mb-sm">
                <q-icon name="help_outline" class="q-mr-sm" />
                ¿Cómo Funciona?
              </div>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_one" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Configura tu ingreso mensual esperado</q-item-label>
                    <q-item-label caption>Define cuánto esperas ganar cada mes</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_two" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Asigna porcentajes a tus cántaros</q-item-label>
                    <q-item-label caption
                      >Ejemplo: 50% necesidades, 30% ahorros, 20% ocio</q-item-label
                    >
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_3" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Registra tus ingresos reales</q-item-label>
                    <q-item-label caption
                      >Agrega transacciones de ingreso para ver cálculos reales</q-item-label
                    >
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="looks_4" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Compara y ajusta</q-item-label>
                    <q-item-label caption
                      >Ve la diferencia entre lo esperado y lo real en tiempo real</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>

            <!-- Botón de guardar -->
            <div class="row justify-end q-gutter-sm">
              <q-btn outline color="grey-7" label="Cancelar" @click="resetForm" />
              <q-btn
                color="primary"
                :loading="saving"
                label="Guardar cambios"
                icon-right="save"
                @click="saveProfile"
              />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="categories">
          <div class="q-gutter-md">
            <q-card flat bordered class="q-pa-md bg-purple-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="category" size="48px" color="purple-7" />
                <div>
                  <div class="text-h6 text-purple-9">Gestión de Categorías</div>
                  <div class="text-body2 text-purple-8">
                    Administra tus categorías y organízalas en carpetas jerárquicas para clasificar tus transacciones y cantaros
                  </div>
                </div>
              </div>
            </q-card>

            <q-card flat bordered style="min-height: 500px; height: 600px; display: flex; flex-direction: column;">
              <CategoriesTree
                :readonly="false"
                :nodes="categoriesTreeNodes"
                :category-jar-map="categoryToJarMap"
                ref="categoriesTreeRef"
                style="flex: 1; height: 100%;"
                @create-category="onCreateCategory"
                @create-folder="onCreateCategoryFolder"
                @move-node="onMoveCategoryNode"
                @delete-category="onDeleteCategory"
                @edit-category="onEditCategory"
              />
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="accounts">
          <div class="q-gutter-md">
            <q-card flat bordered class="q-pa-md bg-orange-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="account_balance_wallet" size="48px" color="orange-7" />
                <div>
                  <div class="text-h6 text-orange-9">Gestión de Cuentas</div>
                  <div class="text-body2 text-orange-8">
                    Administra tus cuentas bancarias, tarjetas y otros medios de pago en forma de árbol organizado
                  </div>
                </div>
              </div>
            </q-card>

            <q-card flat bordered style="min-height: 500px;">
              <AccountsTree
                ref="accountsTreeRef"
                :tree="accountsTreeNodes"
                :can-delete-folder="true"
                @create-account="onCreateAccount"
                @create-folder="onCreateAccountFolder"
                @move-node="onMoveAccountNode"
                @reorder-siblings="onReorderAccountFolderSiblings"
                @delete-folder="onDeleteAccountFolder"
                @view-account="onViewAccount"
                @edit-account="onEditAccount"
                @delete-account="onDeleteAccount"
                @rename-folder="onRenameAccountFolder"
                @toggle-global-balance="onToggleAccountGlobalBalance"
              />
            </q-card>
          </div>
        </q-tab-panel>

        <q-tab-panel name="taxes">
          <CrudPage :dictionary="taxesDictionary" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Account create/edit dialog -->
    <q-dialog v-model="showAccountForm" persistent>
      <q-card style="min-width: 400px; max-width: 480px;">
        <q-card-section>
          <div class="text-h6">{{ acctFormTitle }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="acctForm.name" label="Nombre de la cuenta" dense outlined autofocus />
          <q-select
            v-model="acctForm.account_type_id"
            :options="accountTypeOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Tipo de cuenta"
            dense
            outlined
          />
          <q-select
            v-model="acctForm.currency_id"
            :options="acctCurrencyFilterOptions"
            option-value="id"
            option-label="nameLabel"
            emit-value
            map-options
            label="Moneda"
            dense
            outlined
            use-input
            @filter="onAcctCurrencyFilter"
          />
          <q-select
            v-model="acctForm.folder_id"
            :options="acctFolderOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Carpeta"
            dense
            outlined
          />
          <q-input v-if="acctFormMode === 'create'" v-model.number="acctForm.initial" label="Balance inicial" type="number" dense outlined />
          <q-input v-if="acctFormMode === 'edit'" v-model.number="acctForm.balance" label="Saldo actual" type="number" dense outlined />
          <q-toggle v-if="acctFormMode === 'edit'" v-model="acctForm.active" label="Cuenta activa" />
          <q-toggle v-model="acctForm.include_in_global_balance" color="teal" label="Incluir en balance global">
            <q-tooltip>Si está activo, el saldo de esta cuenta se sumará al balance global configurado</q-tooltip>
          </q-toggle>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            :label="acctFormMode === 'create' ? 'Crear' : 'Guardar'"
            color="primary"
            :disable="!acctForm.name.trim()"
            @click="onSaveAccountForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo editar categoría con selector de cántaro -->
    <q-dialog v-model="showEditCatDialog" persistent>
      <q-card style="min-width: 360px">
        <q-card-section class="text-subtitle1">Editar categoría</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="editCatForm.name" label="Nombre" dense outlined autofocus />
          <q-select
            v-model="editCatForm.jar_id"
            :options="jarOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            label="Cántaro"
            dense
            outlined
            clearable
            hint="Asignar a un cántaro (opcional)"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn flat label="Guardar" color="primary" :loading="editCatSaving" @click="onSubmitEditCat" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';
import OnboardingFlow from 'src/components/OnboardingFlow.vue';
import ChangePasswordCard from 'src/components/ChangePasswordCard.vue';
import CrudPage from 'components/CrudPage.vue';
import CategoriesTree from 'components/CategoriesTree.vue';
import AccountsTree from 'components/AccountsTree.vue';
import ExchangeRatesTable from 'components/ExchangeRatesTable.vue';
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import { defaultAvatarUrl } from '../config';
import { dictionary as taxesDictionary } from '../taxes/dictionary';
import { api } from 'boot/axios';
import { Notify, useQuasar } from 'quasar';
import {
  normalizeLayoutMode,
  type UserLayoutMode,
} from 'src/utils/layoutMode';

defineOptions({ name: 'user_config_page' });

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();
const showOnboarding = ref(false);
const tab = ref<'profile' | 'finance' | 'categories' | 'accounts' | 'taxes'>('profile');

const activeLayoutMode = computed<UserLayoutMode>(() => normalizeLayoutMode(auth.settings?.layout_mode ?? auth.user?.layout_mode));
const isLiteLayout = computed(() => activeLayoutMode.value === 'lite');
const isDark = computed(() => $q.dark.isActive);

async function switchMode(mode: 'lite' | 'pro') {
  auth.updateLayoutMode(mode);
  await auth.updateSettings({ layout_mode: mode });
}

function toggleTheme() {
  $q.dark.toggle();
  try { localStorage.setItem('ow-theme', $q.dark.isActive ? 'dark' : 'light'); } catch { /* noop */ }
}

// ── Language preference ──────────────────────────────────────────────────
const langOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];
const appLang = ref<string>(
  (auth.settings?.preferences as Record<string, unknown>)?.lang as string || 'es'
);
async function onLangChange(lang: string) {
  appLang.value = lang;
  try {
    const existing = (auth.settings?.preferences as Record<string, unknown>) ?? {};
    await api.put('/user/settings', { preferences: { ...existing, lang } });
  } catch { /* silent */ }
}

// ── Notification preferences ──────────────────────────────────────────────
type NotifPrefs = { weekDigest: boolean; idleAlerts: boolean; overBudget: boolean };

const notifPrefs = reactive<NotifPrefs>({ weekDigest: true, idleAlerts: true, overBudget: false });

function loadNotifPrefs() {
  const raw = auth.settings?.preferences as Record<string, unknown>;
  if (raw?.notifications && typeof raw.notifications === 'object') {
    const n = raw.notifications as Partial<NotifPrefs>;
    notifPrefs.weekDigest  = n.weekDigest  ?? true;
    notifPrefs.idleAlerts  = n.idleAlerts  ?? true;
    notifPrefs.overBudget  = n.overBudget  ?? false;
  }
}

async function toggleNotif(key: keyof NotifPrefs) {
  notifPrefs[key] = !notifPrefs[key];
  try {
    const existing = (auth.settings?.preferences as Record<string, unknown>) ?? {};
    await api.put('/user/settings', {
      preferences: { ...existing, notifications: { ...notifPrefs } },
    });
  } catch { /* silent */ }
}

// ── Logout ────────────────────────────────────────────────────────────────
async function handleLogout() {
  try { await api.post('/auth/logout'); } catch { /* best-effort */ }
  auth.logout();
  await router.replace('/login');
}

type ConfigNavItem = {
  name: 'profile' | 'finance' | 'categories' | 'accounts' | 'taxes';
  label: string;
  hint: string;
  icon: string;
  route?: string;
  action?: () => void;
};

const ALL_CONFIG_NAV: ConfigNavItem[] = [
  { name: 'profile', label: 'Perfil', hint: 'Nombre, correo y contraseña', icon: 'person', route: '/user/profile' },
  { name: 'finance', label: 'Mi perfil financiero', hint: 'Ingresos, metas y asesor IA', icon: 'insights', route: '/user/financial-profile' },
  { name: 'accounts', label: 'Cuentas vinculadas', hint: 'Bancos, tarjetas y medios de pago', icon: 'account_balance_wallet', route: '/user/accounts' },
  { name: 'categories', label: 'Categorías', hint: 'Organiza tus categorías de gasto', icon: 'category' },
  { name: 'taxes', label: 'Impuestos', hint: 'Configuración de impuestos', icon: 'percent' },
];
// Lite: single generic account — no account management needed
const configNav = computed<ConfigNavItem[]>(() =>
  isLiteLayout.value ? ALL_CONFIG_NAV.filter(i => i.name !== 'accounts') : ALL_CONFIG_NAV
);

function handleNavItem(item: ConfigNavItem) {
  if (item.route) { void router.push(item.route); return; }
  if (item.action) { item.action(); return; }
  tab.value = item.name;
}

// ----- Tasas de Cambio del Usuario -----
type UserRate = {
  id: number;
  currency_id: number;
  currency?: { id: number; name: string; code: string; symbol?: string };
  current_rate: number;
  is_current: boolean;
  is_official: boolean;
  updated_at?: string;
};
const userRates = ref<UserRate[]>([]);
const userRatesLoading = ref(false);

async function loadUserRates() {
  userRatesLoading.value = true;
  try {
    const res = await api.get('/user_currencies', { params: { user_id: auth.user?.id, per_page: 100 } });
    const raw = res.data?.data?.data || res.data?.data || res.data || [];
    userRates.value = Array.isArray(raw) ? raw as UserRate[] : [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error cargando tasas' });
  } finally {
    userRatesLoading.value = false;
  }
}

/**
 * Detecta monedas usadas en cuentas del usuario que no tengan tasa configurada
 * y las crea automáticamente con tasa 1 (para que el usuario las corrija).
 */
async function syncAccountCurrencies() {
  if (!auth.user?.id) return;
  try {
    const res = await api.get('/accounts');
    type RawAcct = { currency?: { id?: number; name?: string; code?: string }; currency_id?: number };
    const flat: RawAcct[] = Array.isArray(res.data?.data) ? (res.data.data as RawAcct[]) : [];

    // Recopilar monedas únicas de las cuentas (omitir la moneda base del usuario)
    const defaultCurrId = auth.user?.currency_id;
    const seen = new Set<number>();
    const accountCurrencies: Array<{ id: number; code: string }> = [];
    for (const acc of flat) {
      const cid = acc.currency?.id || acc.currency_id;
      const ccode = acc.currency?.code || '';
      if (!cid || seen.has(cid) || cid === defaultCurrId) continue;
      seen.add(cid);
      accountCurrencies.push({ id: cid, code: ccode });
    }

    // Comparar con las tasas ya configuradas
    const configuredIds = new Set(userRates.value.map((r) => r.currency_id));
    const missing = accountCurrencies.filter((c) => !configuredIds.has(c.id));
    if (!missing.length) return;

    // Crear automáticamente con tasa 1
    for (const curr of missing) {
      await api.post('/user_currencies', {
        user_id: auth.user?.id,
        currency_id: curr.id,
        current_rate: 1,
        is_current: true,
        is_official: false,
      });
    }

    // Recargar lista y notificar
    await loadUserRates();
    await auth.refreshUserCurrencies();
    const names = missing.map((c) => c.code).join(', ');
    Notify.create({
      type: 'info',
      icon: 'info',
      message: `Se detectaron monedas sin tasa configurada: ${names}. Se crearon con valor 1. Por favor, actualiza las tasas reales.`,
      multiLine: true,
      timeout: 7000,
    });
  } catch {
    // Silencioso — no interrumpir el flujo normal
  }
}

const name = ref(auth.user?.name || '');
const email = ref(auth.user?.email || '');
const monthlyIncome = ref(auth.user?.monthly_income || 0);

const fileInput = ref<HTMLInputElement | null>(null);
const avatarUrl = computed(() => defaultAvatarUrl);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);

const saving = ref(false);

// ----- Seguridad: PIN de acceso rápido -----
const hasPinConfigured = ref<boolean | null>(null);
const showPinDialog = ref(false);
const pinDialogPassword = ref('');
const pinDialogPin = ref('');
const pinDialogPinConfirm = ref('');
const pinDialogSaving = ref(false);
const pinDialogError = ref('');

async function refreshPinStatus() {
  hasPinConfigured.value = await ui.refreshPinStatus();
}

function openPinDialog() {
  pinDialogPassword.value = '';
  pinDialogPin.value = '';
  pinDialogPinConfirm.value = '';
  pinDialogError.value = '';
  showPinDialog.value = true;
}

async function submitPinDialog() {
  pinDialogError.value = '';
  if (!/^[0-9]{4,6}$/.test(pinDialogPin.value)) {
    pinDialogError.value = 'El PIN debe tener entre 4 y 6 dígitos.';
    return;
  }
  if (pinDialogPin.value !== pinDialogPinConfirm.value) {
    pinDialogError.value = 'Los PIN no coinciden.';
    return;
  }
  pinDialogSaving.value = true;
  try {
    const { setPin } = await import('src/composables/useSecurityPin');
    await setPin(pinDialogPin.value, pinDialogPassword.value);
    showPinDialog.value = false;
    await refreshPinStatus();
    $q.notify({ message: 'PIN configurado correctamente', color: 'positive' });
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    pinDialogError.value = e.response?.data?.message ?? 'No se pudo configurar el PIN.';
  } finally {
    pinDialogSaving.value = false;
  }
}

function promptRemovePin() {
  $q.dialog({
    title: 'Eliminar PIN',
    message: 'Ingresá tu contraseña para eliminar el PIN de seguridad.',
    prompt: { model: '', type: 'password', isValid: (v: string) => v.length > 0 },
    cancel: true,
    persistent: true,
  }).onOk((pwd: string) => {
    void (async () => {
      try {
        const { removePin } = await import('src/composables/useSecurityPin');
        await removePin(pwd);
        await refreshPinStatus();
        $q.notify({ message: 'PIN eliminado', color: 'positive' });
      } catch {
        $q.notify({ message: 'No se pudo eliminar el PIN. Verificá tu contraseña.', color: 'negative' });
      }
    })();
  });
}

// ----- Categories Tree -----
type CategoryNode = {
  id: number | string;
  label: string;
  is_folder: boolean;
  children?: CategoryNode[];
  [key: string]: unknown;
};

type Jar = {
  id: number;
  name: string;
  categories?: { id: string | number; name: string }[];
};

const categoriesTreeNodes = ref<CategoryNode[]>([]);
const categoriesTreeRef = ref<InstanceType<typeof CategoriesTree> | null>(null);
const jars = ref<Jar[]>([]);
const categoryToJarMap = ref<Record<string | number, string>>({});

async function loadJars() {
  try {
    console.log('🔄 Iniciando carga de jars...');
    const res = await api.get('/jars', { params: { per_page: 100 } });
    console.log('📦 Respuesta de /jars:', res.data);
    const rawJars = res.data?.data || res.data || [];
    jars.value = rawJars;

    // Crear mapa de categoría a jar
    const map: Record<string | number, string> = {};
    for (const jar of rawJars) {
      console.log('🏺 Procesando jar:', jar.name, 'categorías:', jar.categories);
      if (jar.categories && Array.isArray(jar.categories)) {
        for (const cat of jar.categories) {
          map[cat.id] = jar.name;
        }
      }
    }
    categoryToJarMap.value = map;
    console.log('✅ Jars cargados:', rawJars.length, 'jars. Mapa de categorías:', map);
  } catch (e) {
    console.error('❌ Error loading jars:', e);
    Notify.create({ type: 'negative', message: 'Error cargando cántaros' });
  }
}

async function loadCategoriesTree() {
  try {
    const res = await api.get('/categories/tree');
    const rawNodes = res.data?.data?.nodes || res.data?.nodes || res.data?.data || res.data || [];
    console.log('📊 Categorías cargadas:', rawNodes);
    categoriesTreeNodes.value = rawNodes;
  } catch (e) {
    console.error('Error loading categories tree:', e);
    Notify.create({ type: 'negative', message: 'Error cargando categorías' });
  }
}

// ----- Category event handlers -----
function onCreateCategory(payload: { parent_id: string }) {
  $q.dialog({
    title: 'Nueva categoría',
    message: 'Nombre de la categoría:',
    prompt: { model: '', type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((catName: string) => {
    const parentId = payload.parent_id && payload.parent_id !== 'root' ? payload.parent_id : null;
    void api.post('/categories', {
      name: catName.trim(),
      parent_id: parentId,
      type: 'category',
    }).then((res) => {
      const cat = res.data?.data;
      if (cat?.id) {
        categoriesTreeRef.value?.addCategoryToParent(
          { id: String(cat.id), label: cat.name, type: 'category', icon: cat.icon || null },
          parentId ? String(parentId) : 'root',
        );
        Notify.create({ type: 'positive', message: `Categoría "${catName}" creada` });
      }
    }).catch((e) => {
      console.error('Error creating category:', e);
      Notify.create({ type: 'negative', message: 'Error creando categoría' });
    });
  });
}

function onCreateCategoryFolder(payload: { parent_id: string }) {
  $q.dialog({
    title: 'Nueva carpeta de categorías',
    message: 'Nombre de la carpeta:',
    prompt: { model: '', type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((folderName: string) => {
    const parentId = payload.parent_id && payload.parent_id !== 'root' ? payload.parent_id : null;
    void api.post('/categories', {
      name: folderName.trim(),
      parent_id: parentId,
      type: 'folder',
    }).then((res) => {
      const cat = res.data?.data;
      if (cat?.id) {
        categoriesTreeRef.value?.addCategoryToParent(
          { id: String(cat.id), label: cat.name, type: 'folder' },
          parentId ? String(parentId) : 'root',
        );
        Notify.create({ type: 'positive', message: `Carpeta "${folderName}" creada` });
      }
    }).catch((e) => {
      console.error('Error creating category folder:', e);
      Notify.create({ type: 'negative', message: 'Error creando carpeta de categorías' });
    });
  });
}

async function onMoveCategoryNode(payload: { node_id: string; new_parent_id: string }) {
  try {
    const parentId = payload.new_parent_id === 'root' ? null : payload.new_parent_id;
    await api.patch(`/categories/${payload.node_id}/move`, { parent_id: parentId });
    Notify.create({ type: 'positive', message: 'Categoría movida' });
  } catch (e) {
    console.error('Error moving category:', e);
    Notify.create({ type: 'negative', message: 'Error al mover categoría' });
    void loadCategoriesTree();
  }
}

function onDeleteCategory(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Eliminar categoría',
    message: `¿Eliminar "${payload.label}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void api.delete(`/categories/${payload.id}`).then(() => {
      categoriesTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: `"${payload.label}" eliminada` });
    }).catch((e) => {
      console.error('Error deleting category:', e);
      Notify.create({ type: 'negative', message: 'Error eliminando categoría' });
    });
  });
}

const showEditCatDialog = ref(false);
const editCatSaving = ref(false);
const editCatForm = ref<{ id: string; name: string; jar_id: number | null }>({ id: '', name: '', jar_id: null });
const jarOptions = computed(() => jars.value.map((j) => ({ id: j.id, name: j.name })));

function currentJarIdForCategory(catId: string | number): number | null {
  for (const jar of jars.value) {
    if (jar.categories?.some((c) => String(c.id) === String(catId))) return jar.id;
  }
  return null;
}

async function onEditCategory(payload: { id: string; label: string }) {
  if (jars.value.length === 0) await loadJars();
  editCatForm.value = {
    id: payload.id,
    name: payload.label,
    jar_id: currentJarIdForCategory(payload.id),
  };
  showEditCatDialog.value = true;
}

async function onSubmitEditCat() {
  if (!editCatForm.value.name.trim()) {
    Notify.create({ type: 'warning', message: 'El nombre es requerido' });
    return;
  }
  editCatSaving.value = true;
  try {
    const catId = editCatForm.value.id;
    await api.put(`/categories/${catId}`, { name: editCatForm.value.name.trim() });
    categoriesTreeRef.value?.updateNodeLabel(catId, editCatForm.value.name.trim());

    const userId = auth.user?.id;
    if (userId) {
      const oldJarId = currentJarIdForCategory(catId);
      const newJarId = editCatForm.value.jar_id ?? null;
      if (oldJarId !== newJarId) {
        if (oldJarId) {
          const oldJar = jars.value.find((j) => j.id === oldJarId);
          const remaining = (oldJar?.categories || [])
            .filter((c) => String(c.id) !== String(catId))
            .map((c) => Number(c.id));
          await api.put(`/users/${userId}/jars/${oldJarId}/categories`, { category_ids: remaining });
        }
        if (newJarId) {
          const newJar = jars.value.find((j) => j.id === newJarId);
          const existing = (newJar?.categories || []).map((c) => Number(c.id));
          if (!existing.includes(Number(catId))) existing.push(Number(catId));
          await api.put(`/users/${userId}/jars/${newJarId}/categories`, { category_ids: existing });
        }
        await loadJars();
      }
    }
    Notify.create({ type: 'positive', message: 'Categoría actualizada' });
    showEditCatDialog.value = false;
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error actualizando categoría';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    editCatSaving.value = false;
  }
}

// ----- Accounts Tree -----
type AccountNode = {
  id: number | string;
  label: string;
  is_folder: boolean;
  children?: AccountNode[];
  [key: string]: unknown;
};

const accountsTreeNodes = ref<AccountNode[]>([]);
const accountsTreeRef = ref<InstanceType<typeof AccountsTree> | null>(null);

async function loadAccountsTree() {
  try {
    // Parallel: tree structure + flat list with balances
    const [treeRes, listRes] = await Promise.all([
      api.get('/accounts/tree'),
      api.get('/accounts'),
    ]);
    const rawNodes = treeRes.data?.data?.nodes || treeRes.data?.nodes || treeRes.data?.data || treeRes.data || [];

    // Build id → { balance, currency_symbol, currency_code, include_in_global_balance } map from flat list
    type AcctInfo = { id: number | string; balance?: number | string | null; currency?: { symbol?: string; code?: string }; include_in_global_balance?: boolean };
    const flatList: AcctInfo[] = Array.isArray(listRes.data?.data) ? (listRes.data.data as AcctInfo[]) : [];
    const balanceMap = new Map<string, { balance: number; currency_symbol: string; currency_code: string; include_in_global_balance: boolean }>();
    for (const a of flatList) {
      balanceMap.set(String(a.id), {
        balance: Number(a.balance ?? 0),
        currency_symbol: a.currency?.symbol ?? '$',
        currency_code: a.currency?.code ?? '',
        include_in_global_balance: a.include_in_global_balance !== false,
      });
    }

    // Recursively merge balance info into tree nodes
    type RawNode = { id: number | string; label?: string; type?: string; balance?: number | string; currency_symbol?: string; currency_code?: string; include_in_global_balance?: boolean; children?: RawNode[] };
    function mergeBalances(nodes: RawNode[]): RawNode[] {
      return nodes.map((n) => {
        const info = n.type === 'account' ? balanceMap.get(String(n.id)) : undefined;
        return {
          ...n,
          ...(info !== undefined ? { balance: info.balance, currency_symbol: info.currency_symbol, currency_code: info.currency_code, include_in_global_balance: info.include_in_global_balance } : {}),
          children: n.children ? mergeBalances(n.children) : [],
        };
      });
    }

    console.log('💳 Cuentas cargadas:', rawNodes);
    accountsTreeNodes.value = mergeBalances(rawNodes as RawNode[]) as unknown as AccountNode[];
  } catch (e) {
    console.error('Error loading accounts tree:', e);
    Notify.create({ type: 'negative', message: 'Error cargando cuentas' });
  }
}

async function onCreateAccountFolder(payload: { name: string; parent_id: string | null }) {
  try {
    const parentId = payload.parent_id && payload.parent_id !== 'root' ? payload.parent_id : null;
    const res = await api.post('/accounts/folders', { name: payload.name, parent_id: parentId });
    const folder = res.data?.data;
    if (folder?.id) {
      const newNode: AccountNode = {
        id: String(folder.id),
        label: payload.name,
        is_folder: true,
        type: 'folder',
        children: [],
      };
      // Actualizar árbol visual
      accountsTreeRef.value?.addFolderToParent(
        { id: String(folder.id), label: payload.name },
        parentId ? String(parentId) : null,
      );
      // Actualizar accountsTreeNodes para que acctFolderOptions se refresque inmediatamente
      if (!parentId) {
        accountsTreeNodes.value = [...accountsTreeNodes.value, newNode];
      } else {
        function insertIntoTree(nodes: AccountNode[]): boolean {
          for (const n of nodes) {
            if (String(n.id) === String(parentId)) {
              n.children = [...(n.children ?? []), newNode];
              return true;
            }
            if (n.children && insertIntoTree(n.children)) return true;
          }
          return false;
        }
        const updated = [...accountsTreeNodes.value];
        insertIntoTree(updated);
        accountsTreeNodes.value = updated;
      }
      Notify.create({ type: 'positive', message: `Carpeta "${payload.name}" creada` });
    }
  } catch (e) {
    console.error('Error creating account folder:', e);
    Notify.create({ type: 'negative', message: 'Error creando carpeta' });
  }
}

async function onReorderAccountFolderSiblings(payload: {
  parent_id: string;
  siblings: { id: string; sort_order: number; node_type: string }[];
}) {
  const folderItems = payload.siblings
    .filter((s) => s.node_type === 'folder' && s.id !== 'root')
    .map((s) => ({ id: s.id, sort_order: s.sort_order }));
  const accountItems = payload.siblings
    .filter((s) => s.node_type === 'account')
    .map((s) => ({ id: s.id, sort_order: s.sort_order }));
  try {
    const calls: Promise<unknown>[] = [];
    if (folderItems.length) calls.push(api.post('/accounts/folders/batch-sort', { items: folderItems }));
    if (accountItems.length) calls.push(api.post('/accounts/batch-sort', { items: accountItems }));
    await Promise.all(calls);
  } catch (e) {
    console.error('Error batch-sorting:', e);
  }
}

async function onMoveAccountNode(payload: { node_id: string; new_parent_id: string; node_type: string; sort_order: number }) {
  try {
    if (payload.node_type === 'account') {
      const folderId = payload.new_parent_id === 'root' ? null : payload.new_parent_id;
      await api.patch(`/accounts/${payload.node_id}/move`, {
        folder_id: folderId,
        sort_order: payload.sort_order,
      });
    } else {
      const parentId = payload.new_parent_id === 'root' ? null : payload.new_parent_id;
      await api.patch(`/accounts/folders/${payload.node_id}/move`, {
        parent_id: parentId,
      });
    }
    Notify.create({ type: 'positive', message: 'Movido correctamente' });
  } catch (e) {
    console.error('Error moving node:', e);
    Notify.create({ type: 'negative', message: 'Error al mover' });
    void loadAccountsTree();
  }
}

function onDeleteAccountFolder(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Eliminar carpeta',
    message: `¿Eliminar la carpeta "${payload.label}"? Las cuentas dentro pasarán a "Sin asignar".`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void api.delete(`/accounts/folders/${payload.id}`).then(() => {
      accountsTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: `Carpeta "${payload.label}" eliminada` });
      void loadAccountsTree();
    }).catch((e) => {
      console.error('Error deleting folder:', e);
      Notify.create({ type: 'negative', message: 'Error eliminando carpeta' });
    });
  });
}

// Find which folder an account belongs to by traversing the tree
function findAccountFolderInTree(accountId: string): string | null {
  function walk(nodes: AccountNode[]): string | null | undefined {
    for (const n of nodes) {
      const isFolder = n.is_folder || (n as Record<string, unknown>).type === 'folder';
      if (isFolder && n.children) {
        for (const child of n.children) {
          const isChildAccount = !child.is_folder && (child as Record<string, unknown>).type !== 'folder';
          if (isChildAccount && String(child.id) === accountId) {
            const fid = String(n.id);
            return fid === 'root' ? null : fid;
          }
        }
        const deeper = walk(n.children);
        if (deeper !== undefined) return deeper;
      }
    }
    return undefined;
  }
  return walk(accountsTreeNodes.value) ?? null;
}

function onCreateAccount() {
  void ensureAccountFormDataLoaded().then(() => {
    acctForm.name = '';
    acctForm.currency_id = 1;
    acctForm.account_type_id = 1;
    acctForm.initial = 0;
    acctForm.balance = 0;
    acctForm._originalBalance = 0;
    acctForm.folder_id = null;
    acctForm._originalFolderId = null;
    acctForm.active = true;
    acctForm.include_in_global_balance = true;
    acctFormMode.value = 'create';
    acctFormEditId.value = null;
    acctFormTitle.value = 'Nueva cuenta';
    showAccountForm.value = true;
  });
}

function onViewAccount(payload: { id: string; label: string }) {
  onEditAccount(payload);
}

function onEditAccount(payload: { id: string; label: string }) {
  void ensureAccountFormDataLoaded().then(() => {
    void api.get(`/accounts/${payload.id}`).then((res) => {
      const acct = res.data?.data;
      if (!acct) return;
      acctForm.name = acct.name || '';
      acctForm.currency_id = acct.currency_id;
      acctForm.account_type_id = acct.account_type_id;
      acctForm.initial = parseFloat(acct.initial) || 0;
      acctForm.balance = parseFloat(acct.balance) || 0;
      acctForm._originalBalance = parseFloat(acct.balance) || 0;
      acctForm.active = !!acct.active;
      acctForm.include_in_global_balance = acct.include_in_global_balance !== false;
      // Determine current folder from tree data
      const currentFolderId = findAccountFolderInTree(String(payload.id));
      acctForm.folder_id = currentFolderId;
      acctForm._originalFolderId = currentFolderId;
      acctFormMode.value = 'edit';
      acctFormEditId.value = payload.id;
      acctFormTitle.value = `Editar: ${acct.name}`;
      showAccountForm.value = true;
    });
  });
}

function onDeleteAccount(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Eliminar cuenta',
    message: `¿Estás seguro de eliminar la cuenta "${payload.label}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative' },
  }).onOk(() => {
    void api.delete(`/accounts/${payload.id}`).then(() => {
      accountsTreeRef.value?.removeNode(payload.id);
      Notify.create({ type: 'positive', message: `Cuenta "${payload.label}" eliminada` });
    }).catch((e) => {
      console.error('Error deleting account:', e);
      Notify.create({ type: 'negative', message: 'Error eliminando cuenta' });
    });
  });
}

function onRenameAccountFolder(payload: { id: string; label: string }) {
  $q.dialog({
    title: 'Renombrar carpeta',
    message: 'Nuevo nombre:',
    prompt: { model: payload.label, type: 'text', isValid: (v: string) => v.trim().length > 0 },
    cancel: true,
  }).onOk((newName: string) => {
    void api.put(`/accounts/folders/${payload.id}`, { name: newName.trim() }).then(() => {
      accountsTreeRef.value?.updateNodeLabel(payload.id, newName.trim());
      Notify.create({ type: 'positive', message: `Carpeta renombrada a "${newName.trim()}"` });
    }).catch((e) => {
      console.error('Error renaming folder:', e);
      Notify.create({ type: 'negative', message: 'Error renombrando carpeta' });
    });
  });
}

function onToggleAccountGlobalBalance(payload: { id: string; newValue: boolean }) {
  void api.put(`/accounts/${payload.id}`, {
    include_in_global_balance: payload.newValue,
  }).then(() => {
    accountsTreeRef.value?.updateNodeGlobalBalance(payload.id, payload.newValue);
    const msg = payload.newValue ? 'Cuenta incluida en balance global' : 'Cuenta excluida del balance global';
    Notify.create({ type: 'positive', message: msg });
  }).catch((e) => {
    console.error('Error toggling global balance:', e);
    Notify.create({ type: 'negative', message: 'Error actualizando balance global' });
  });
}

// ----- Account form dialog state -----
type AccountTypeOption = { id: number; name: string };
const accountTypeOptions = ref<AccountTypeOption[]>([]);
const showAccountForm = ref(false);
const acctFormMode = ref<'create' | 'edit'>('create');
const acctFormEditId = ref<string | null>(null);
const acctFormTitle = ref('Nueva cuenta');
const acctForm = reactive({
  name: '',
  currency_id: 1,
  account_type_id: 1,
  initial: 0,
  balance: 0,
  _originalBalance: 0,
  folder_id: null as string | null,
  _originalFolderId: null as string | null,
  active: true,
  include_in_global_balance: true,
});
const acctCurrencyFilterOptions = ref<CurrencyOption[]>([]);

type FolderOption = { id: string | null; name: string };
const acctFolderOptions = computed<FolderOption[]>(() => {
  const opts: FolderOption[] = [{ id: null, name: 'Sin asignar' }];
  function walk(nodes: AccountNode[]) {
    for (const n of nodes) {
      if (n.is_folder || (n as Record<string, unknown>).type === 'folder') {
        const nid = String(n.id);
        if (nid !== 'root') opts.push({ id: nid, name: String(n.label) });
      }
      if (n.children) walk(n.children);
    }
  }
  walk(accountsTreeNodes.value);
  return opts;
});

async function ensureAccountFormDataLoaded() {
  await ensureCurrenciesLoaded();
  acctCurrencyFilterOptions.value = [...allCurrencies.value];
  if (!accountTypeOptions.value.length) {
    try {
      const res = await api.get('/account_types/active');
      const raw = (res.data?.data || res.data) as AccountTypeOption[];
      accountTypeOptions.value = (raw || []).map((t) => ({ id: t.id, name: t.name }));
    } catch {
      Notify.create({ type: 'negative', message: 'Error cargando tipos de cuenta' });
    }
  }
}

function onAcctCurrencyFilter(val: string, update: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  update(() => {
    acctCurrencyFilterOptions.value = !needle
      ? [...allCurrencies.value]
      : allCurrencies.value.filter(
          (o) =>
            (o.name || '').toLowerCase().includes(needle) ||
            (o.code || '').toLowerCase().includes(needle)
        );
  });
}

function onSaveAccountForm() {
  if (!acctForm.name.trim()) return;
  showAccountForm.value = false;
  if (acctFormMode.value === 'create') {
    void api.post('/accounts', {
      name: acctForm.name.trim(),
      currency_id: acctForm.currency_id,
      initial: acctForm.initial,
      account_type_id: acctForm.account_type_id,
      folder_id: acctForm.folder_id || null,
      include_in_global_balance: acctForm.include_in_global_balance,
    }).then((res) => {
      const account = res.data?.data;
      if (account?.id) {
        Notify.create({ type: 'positive', message: `Cuenta "${acctForm.name}" creada` });
        void loadAccountsTree();
      }
    }).catch((e) => {
      console.error('Error creating account:', e);
      Notify.create({ type: 'negative', message: 'Error creando cuenta' });
    });
  } else if (acctFormEditId.value) {
    const editId = acctFormEditId.value;
    const editName = acctForm.name.trim();
    const balanceChanged = Math.abs(acctForm.balance - acctForm._originalBalance) >= 0.01;
    const folderChanged = acctForm.folder_id !== acctForm._originalFolderId;
    // 1) Update account metadata (name, type, currency, active)
    void api.put(`/accounts/${editId}`, {
      name: editName,
      currency_id: acctForm.currency_id,
      account_type_id: acctForm.account_type_id,
      active: acctForm.active,
      include_in_global_balance: acctForm.include_in_global_balance,
    }).then(() => {
      accountsTreeRef.value?.updateNodeLabel(editId, editName);
      const promises: Promise<unknown>[] = [];
      // 2) If balance changed, adjust via dedicated endpoint
      if (balanceChanged) {
        promises.push(api.post(`/accounts/${editId}/adjust-balance`, {
          target_balance: acctForm.balance,
          description: 'Ajuste manual desde configuración',
        }));
      }
      // 3) If folder changed, move account to new folder
      if (folderChanged) {
        promises.push(api.patch(`/accounts/${editId}/move`, {
          folder_id: acctForm.folder_id || null,
        }));
      }
      return promises.length ? Promise.all(promises) : undefined;
    }).then(() => {
      Notify.create({ type: 'positive', message: `Cuenta "${editName}" actualizada` });
      if (folderChanged || balanceChanged) void loadAccountsTree();
    }).catch((e) => {
      console.error('Error updating account:', e);
      Notify.create({ type: 'negative', message: 'Error actualizando cuenta' });
    });
  }
}

// ----- Moneda por defecto -----
type CurrencyOption = {
  id: number;
  name: string;
  code?: string | undefined;
  symbol?: string | undefined;
  nameLabel: string;
};
const currencyOptions = ref<CurrencyOption[]>([]);
const allCurrencies = ref<CurrencyOption[]>([]);
const currencyLoading = ref(false);
type LooseUser = {
  currency?: {
    id?: number | null;
    code?: string | null;
    symbol?: string | null;
    name?: string | null;
  } | null;
  currency_id?: number | null;
};
function getInitialCurrencyId(): number | null {
  const u = (auth.user as unknown as LooseUser) || null;
  const id = u?.currency?.id ?? u?.currency_id ?? null;
  return typeof id === 'number' ? id : null;
}
const selectedCurrencyId = ref<number | null>(getInitialCurrencyId());

async function ensureCurrenciesLoaded() {
  if (allCurrencies.value.length) return;
  currencyLoading.value = true;
  try {
    const res = await api.get('/currencies', { params: { order_by: 'name', order_dir: 'asc' } });
    const raw = (res.data?.data || res.data) as Array<{
      id: number;
      name: string;
      symbol?: string;
      code?: string;
    }>;
    const mapped: CurrencyOption[] = (raw || []).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol ?? undefined,
      code: c.code ?? undefined,
      nameLabel: c.symbol ? `${c.name} (${c.symbol})` : c.name,
    }));
    allCurrencies.value = mapped;
    currencyOptions.value = mapped;
    // Prefijar si no hay seleccionado e info en usuario
    if (selectedCurrencyId.value == null) {
      const uid = getInitialCurrencyId();
      selectedCurrencyId.value = typeof uid === 'number' ? uid : null;
    }
  } catch (e) {
    console.error('[config] Error cargando monedas:', e);
    Notify.create({ type: 'negative', message: 'Error cargando monedas' });
  } finally {
    currencyLoading.value = false;
  }
}

function onCurrencyFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    currencyOptions.value = !needle
      ? allCurrencies.value
      : allCurrencies.value.filter(
          (o) =>
            (o.name || '').toLowerCase().includes(needle) ||
            (o.code || '').toLowerCase().includes(needle)
        );
  });
}

async function loadFinanceTab() {
  void ensureCurrenciesLoaded();
  await loadUserRates();
  void syncAccountCurrencies();
}

onMounted(async () => {
  loadNotifPrefs();
  void refreshPinStatus();
  // Cargar monedas al entrar a la pestaña perfil o si ya está activa
  if (tab.value === 'profile') void ensureCurrenciesLoaded();
  if (tab.value === 'finance') void loadFinanceTab();
  if (tab.value === 'categories') {
    await loadJars();
    await loadCategoriesTree();
  }
  if (tab.value === 'accounts') void loadAccountsTree();
});
watch(
  () => tab.value,
  async (t) => {
    if (t === 'profile') void ensureCurrenciesLoaded();
    if (t === 'finance') void loadFinanceTab();
    if (t === 'categories') {
      await loadJars();
      await loadCategoriesTree();
    }
    if (t === 'accounts') void loadAccountsTree();
  }
);

function pickAvatar() {
  fileInput.value?.click();
}

function onFileChange(evt: Event) {
  const target = evt.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  avatarFile.value = file;
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      avatarPreview.value = typeof res === 'string' ? res : '';
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.value = null;
  }
}

function resetForm() {
  name.value = auth.user?.name || '';
  email.value = auth.user?.email || '';
  monthlyIncome.value = auth.user?.monthly_income || 0;
  avatarFile.value = null;
  avatarPreview.value = null;
  selectedCurrencyId.value = getInitialCurrencyId();
}

async function saveProfile() {
  try {
    if (!name.value || !email.value) {
      Notify.create({ type: 'warning', message: 'Nombre y correo son requeridos' });
      return;
    }
    saving.value = true;

    // Update profile basic data
    await api.put('/user/profile', {
      name: name.value,
      email: email.value,
      monthly_income: monthlyIncome.value || 0,
      ...(typeof selectedCurrencyId.value === 'number'
        ? { currency_id: selectedCurrencyId.value }
        : {}),
    });

    // Upload avatar if selected
    if (avatarFile.value) {
      const form = new FormData();
      form.append('avatar', avatarFile.value);
      await api.post('/user/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Refresh local auth store (incluye moneda por defecto)
    if (auth.user) {
      auth.user.name = name.value;
      auth.user.email = email.value;
      auth.user.monthly_income = monthlyIncome.value || 0;
      const cid = typeof selectedCurrencyId.value === 'number' ? selectedCurrencyId.value : null;
      if (cid) {
        (auth.user as unknown as LooseUser).currency_id = cid;
        const cur = allCurrencies.value.find((c) => c.id === cid);
        if (cur) {
          (auth.user as unknown as LooseUser).currency = {
            id: cur.id,
            name: cur.name,
            code: cur.code ?? null,
            symbol: cur.symbol ?? null,
          };
        }
      }
      localStorage.setItem('user', JSON.stringify(auth.user));
    }

    Notify.create({ type: 'positive', message: 'Perfil actualizado' });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || 'Error al guardar';
    Notify.create({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}

/* Lite Config Styles */
.lite-config {
  background: var(--bg-canvas);
  min-height: 100vh;
}

.lite-config__header {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 32px 16px;
}

.lite-config__nav {
  max-width: 800px;
  margin: 0 auto 16px;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lite-config__nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--surface-1);
  color: var(--fg-2);
  cursor: pointer;
  text-align: left;
  box-shadow: var(--shadow-card);
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}

.lite-config__nav-item:hover {
  background: var(--surface-2);
  color: var(--fg-1);
}

.lite-config__nav-item--active {
  background: color-mix(in srgb, var(--brand-primary) 10%, var(--surface-1));
  color: var(--brand-primary);
}

.lite-config__nav-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lite-config__nav-label {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-1);
}

.lite-config__nav-hint {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--fg-2);
}

.lite-config__section-label {
  max-width: 800px;
  margin: 4px auto 4px;
  padding: 0 40px;
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-3, #94a3b8);
}

.lite-config__nav-item--toggle {
  cursor: pointer;
  user-select: none;
}

.lite-config__nav--danger {
  margin-top: 8px;
}

.lite-config__nav-item--danger {
  color: var(--expense-fg, #b91c1c);
  &:hover { background: rgba(239,68,68,.07); }
}

.lite-config__card {
  max-width: 800px;
  margin: 0 auto;
  background: transparent;
  box-shadow: none;
}

@media (max-width: 640px) {
  .lite-config__header {
    padding: 16px 16px 12px;
  }
  .lite-config__nav {
    padding: 0 16px;
  }
}

/* ── AppPrefs ────────────────────────────────────────────────── */
.apref {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 24px 16px;
  max-width: 640px;
}
.apref__label {
  display: block;
  margin-bottom: 4px;
}
.apref__mode-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 4px;
}
.apref__mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border: 2px solid var(--border-hairline, #e2e8f0);
  border-radius: 16px;
  background: var(--surface-1, #fff);
  cursor: pointer;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  transition: all 150ms;
  text-align: center;
}
.apref__mode-btn .material-icons {
  font-size: 28px;
  color: var(--fg-2, #64748b);
}
.apref__mode-btn--active {
  border-color: var(--brand-primary, #1e3a8a);
  background: rgba(30, 58, 138, 0.07);
  color: var(--brand-primary, #1e3a8a);
}
.apref__mode-btn--active .material-icons {
  color: var(--brand-primary, #1e3a8a);
}
.apref__mode-sub {
  font-size: 11px;
  font-weight: 400;
  color: var(--fg-2, #64748b);
}
.apref__row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--surface-1, #fff);
  cursor: pointer;
  transition: background 150ms;
}
.apref__row:hover { background: var(--surface-2, #f1f5f9); }
.apref__row-icon {
  font-size: 20px;
  color: var(--fg-2, #64748b);
  flex-shrink: 0;
}
.apref__row-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-1, #0f172a);
}
.apref__row-hint {
  font-size: 12px;
  color: var(--fg-2, #64748b);
  font-weight: 400;
}
.apref__toggle {
  width: 44px;
  height: 24px;
  border-radius: 99px;
  background: var(--surface-2, #e2e8f0);
  position: relative;
  transition: background 200ms;
  flex-shrink: 0;
}
.apref__toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--fg-2, #94a3b8);
  transition: transform 200ms, background 200ms;
}
.apref__toggle--on {
  background: var(--brand-primary, #1e3a8a);
}
.apref__toggle--on::after {
  transform: translateX(20px);
  background: white;
}
@media (max-width: 480px) {
  .apref { padding: 0 16px 16px; }
}

/* ── Pro Config ──────────────────────────────────────────────── */
.pro-config {
  padding: 32px 40px;
  max-width: 960px;
  margin: 0 auto;
}

.pro-config__heading {
  margin-bottom: 16px;
}

.pro-config__card {
  background: transparent;
  box-shadow: none;
}

@media (max-width: 860px) {
  .pro-config { padding: 24px 20px; }
}
</style>
