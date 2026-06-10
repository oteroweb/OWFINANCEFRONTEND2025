<template>
  <div>
    <!-- HERO -->
    <section class="section" style="padding-bottom: 40px; text-align: center">
      <div class="wrap reveal">
        <p class="eyebrow">Planes</p>
        <h1 class="display-sm" style="margin-top: 16px">Un precio simple para<br />cada etapa de tu dinero.</h1>
        <p class="lede" style="margin: 18px auto 0; max-width: 560px">Empieza gratis y crece cuando lo necesites.
          Los precios son de referencia y los iremos ajustando — sin letra chica.</p>
        <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 30px">
          <div class="bill-toggle">
            <button :class="{ active: billing === 'm' }" @click="billing = 'm'">Mensual</button>
            <button :class="{ active: billing === 'a' }" @click="billing = 'a'">Anual <span class="save-tag">−20%</span></button>
          </div>
        </div>
      </div>
    </section>

    <!-- PLANS GRID -->
    <section class="section surface-alt" style="padding-top: 0">
      <div class="wrap">
        <div class="price-grid reveal">
          <!-- Free -->
          <div class="plan">
            <div class="plan-name">Gratis</div>
            <div class="plan-desc">Para empezar sin compromiso. Todo lo esencial.</div>
            <div class="plan-price">
              <span class="amt">$0</span>
              <span class="per">/ mes</span>
            </div>
            <div class="plan-note">Siempre gratis</div>
            <router-link class="btn btn-ghost btn-block" to="/register">Crear cuenta</router-link>
            <ul class="plan-feats">
              <li><span class="material-icons">check</span>Cántaros y sueños</li>
              <li><span class="material-icons">check</span>Registro texto, voz, foto</li>
              <li><span class="material-icons">check</span>Análisis básico</li>
              <li><span class="material-icons">check</span>1 moneda (USD)</li>
              <li class="muted"><span class="material-icons">close</span>Multi-moneda</li>
              <li class="muted"><span class="material-icons">close</span>Multi-cuenta</li>
              <li class="muted"><span class="material-icons">close</span>Carga masiva</li>
            </ul>
          </div>

          <!-- Plus (Featured) -->
          <div class="plan featured">
            <div class="plan-badge">Recomendado</div>
            <div class="plan-name">Plus</div>
            <div class="plan-desc">Control total para quien quiere precisión.</div>
            <div class="plan-price">
              <span class="amt">${{ billing === 'm' ? '4.99' : '3.99' }}</span>
              <span class="per">/ mes</span>
            </div>
            <div class="plan-note">{{ billing === 'm' ? 'Pago mensual' : 'Facturado anualmente' }}</div>
            <router-link class="btn btn-primary btn-block" to="/register">Empezar con Plus</router-link>
            <p class="feats-head">Todo lo de Gratis, más:</p>
            <ul class="plan-feats">
              <li><span class="material-icons">check</span>Multi-moneda (USD/EUR/VES)</li>
              <li><span class="material-icons">check</span>Multi-cuenta</li>
              <li><span class="material-icons">check</span>Carga masiva</li>
              <li><span class="material-icons">check</span>Ítems por línea</li>
              <li><span class="material-icons">check</span>Análisis avanzado</li>
              <li><span class="material-icons">check</span>Transferencias cross-currency</li>
            </ul>
          </div>

          <!-- Pro -->
          <div class="plan">
            <div class="plan-name">Pro</div>
            <div class="plan-desc">Para equipos o familias que comparten finanzas.</div>
            <div class="plan-price">
              <span class="amt">${{ billing === 'm' ? '9.99' : '7.99' }}</span>
              <span class="per">/ mes</span>
            </div>
            <div class="plan-note">{{ billing === 'm' ? 'Pago mensual' : 'Facturado anualmente' }}</div>
            <router-link class="btn btn-ghost btn-block" to="/register">Empezar con Pro</router-link>
            <p class="feats-head">Todo lo de Plus, más:</p>
            <ul class="plan-feats">
              <li><span class="material-icons">check</span>Usuarios adicionales</li>
              <li><span class="material-icons">check</span>Reportes personalizados</li>
              <li><span class="material-icons">check</span>Exportación (CSV, PDF)</li>
              <li><span class="material-icons">check</span>Soporte prioritario</li>
            </ul>
          </div>
        </div>

        <!-- Modes note -->
        <div class="modes-note reveal" style="margin-top: 40px">
          <span class="material-icons">info</span>
          <p><b>Lite y Pro son modos, no planes.</b> Todos los planes incluyen ambos modos.
            Lite es calmado y directo; Pro es denso y analítico. Cambia cuando quieras.</p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 48px">
          <p class="eyebrow">Preguntas frecuentes</p>
          <h2 class="display-sm" style="margin-top: 16px">Lo que suele preguntarse.</h2>
        </div>
        <div class="faq reveal">
          <details>
            <summary>¿Puedo cambiar de plan después?<span class="material-icons">add</span></summary>
            <p>Sí, subes o bajas de plan cuando quieras. Los cambios se aplican al siguiente ciclo de facturación.</p>
          </details>
          <details>
            <summary>¿Hay prueba gratis?<span class="material-icons">add</span></summary>
            <p>El plan Gratis es tu prueba permanente. Usa todo lo esencial sin tarjeta y sin límite de tiempo.</p>
          </details>
          <details>
            <summary>¿Qué pasa si cancelo?<span class="material-icons">add</span></summary>
            <p>Tus datos quedan guardados. Si vuelves, retomas exactamente donde lo dejaste.</p>
          </details>
          <details>
            <summary>¿Lite y Pro cuestan lo mismo?<span class="material-icons">add</span></summary>
            <p>Sí: son modos de la misma app, no productos distintos. El plan determina las funciones; el modo determina la densidad de la interfaz.</p>
          </details>
          <details>
            <summary>¿Puedo pagar en VES?<span class="material-icons">add</span></summary>
            <p>Pronto. Hoy aceptamos USD y EUR. Estamos trabajando en pasarelas locales para LatAm.</p>
          </details>
          <details>
            <summary>¿Hay descuento para estudiantes?<span class="material-icons">add</span></summary>
            <p>Contacta a soporte con tu correo institucional. Tenemos descuentos para educación y ONGs.</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const billing = ref<'m' | 'a'>('m')
</script>
