<template>
  <LandingHeroMobile v-if="isMobile" />
  <div v-else>
    <!-- ===================== HERO ===================== -->
    <section class="section" style="padding-top: 72px; padding-bottom: 64px">
      <div class="wrap">
        <div class="split" style="gap: 56px">
          <div class="split-copy reveal">
            <span class="chip brand"><span class="dot" style="background: var(--brand-primary)"></span>OW Finance 2026</span>
            <h1 class="display" style="margin-top: 20px">Tu dinero,<br />en claro.</h1>
            <p class="lede" style="margin-top: 22px; max-width: 480px">
              Reparte cada ingreso en cántaros, ahorra para tus sueños y registra gastos
              en segundos. Una app de finanzas calmada, hecha para que entiendas tu dinero
              de un vistazo.
            </p>
            <div style="display: flex; gap: 12px; margin-top: 30px; flex-wrap: wrap">
              <router-link class="btn btn-primary btn-lg" to="/register">Empieza gratis<span class="material-icons">arrow_forward</span></router-link>
              <router-link class="btn btn-ghost btn-lg" to="/funciones">Ver funciones</router-link>
            </div>
            <p class="t-body-sm" style="margin-top: 18px; color: var(--fg-3)">Sin tarjeta. Funciona en Lite o Pro · USD · EUR · VES</p>
          </div>

          <!-- HERO MOCK -->
          <div class="split-media reveal" style="position: relative">
            <div class="frame">
              <div class="frame-bar">
                <span class="d" style="background: #FF5F57"></span>
                <span class="d" style="background: #FEBC2E"></span>
                <span class="d" style="background: #28C840"></span>
                <span style="margin-left: 12px; font-size: 12px; color: var(--fg-3)">app.owfinance.com</span>
              </div>
              <div class="frame-body" style="display: flex; flex-direction: column; gap: 14px">
                <!-- hero balance -->
                <div class="mock" style="gap: 14px">
                  <div class="mock-hero">
                    <span class="mock-eyebrow">Disponible · <span style="color: var(--fg-2)">USD</span></span>
                    <span class="mock-amount">$ 12,480.50</span>
                    <span class="delta-up"><span class="material-icons">arrow_upward</span>+4.2% vs. mes ant.</span>
                  </div>
                  <div class="mock-kpis">
                    <div class="mock-kpi"><div class="k-lbl">Ingresos</div><div class="k-val income">+ 4,820.00</div></div>
                    <div class="mock-kpi"><div class="k-lbl">Gastos</div><div class="k-val expense">− 2,360.50</div></div>
                    <div class="mock-kpi"><div class="k-lbl">Neto</div><div class="k-val">2,459.50</div></div>
                  </div>
                </div>
                <!-- jars row -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
                  <div class="jar">
                    <div class="jar-top">
                      <span class="jar-ico" style="background: var(--brand-primary-soft); color: var(--brand-primary-fg-soft)"><span class="material-icons">shield</span></span>
                      <div><div class="jar-name">Necesidades</div><div class="jar-sub">55% del ingreso</div></div>
                    </div>
                    <div class="jar-amt">$ 1,815.00</div>
                    <div class="bar"><i style="width: 68%; background: var(--brand-primary)"></i></div>
                    <div class="jar-foot"><span>68% de 2,668</span><span>68% usado</span></div>
                  </div>
                  <div class="jar">
                    <div class="jar-top">
                      <span class="jar-ico" style="background: var(--income-soft); color: var(--income-fg)"><span class="material-icons">savings</span></span>
                      <div><div class="jar-name">Ahorro</div><div class="jar-sub">10% del ingreso</div></div>
                    </div>
                    <div class="jar-amt">$ 2,940.00</div>
                    <div class="bar"><i style="width: 59%; background: var(--income)"></i></div>
                    <div class="jar-foot"><span>100% de 5,000</span><span>Meta 59%</span></div>
                  </div>
                </div>
              </div>
            </div>
            <!-- floating quick-add -->
            <div class="card" style="position: absolute; right: -14px; bottom: -22px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-popover)">
              <span class="jar-ico" style="background: var(--brand-primary); color: #fff; width: 38px; height: 38px; border-radius: 50%"><span class="material-icons">add</span></span>
              <div><div style="font-weight: 600; font-size: 14px">Agregar gasto</div><div style="font-size: 11.5px; color: var(--fg-3)">Escribe, dicta o foto</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TRUST STRIP ===================== -->
    <section class="section-sm surface-alt">
      <div class="wrap reveal">
        <p class="t-eyebrow" style="text-align: center; margin-bottom: 36px">Pensado para tu día a día financiero</p>
        <div class="stats">
          <div class="stat"><div class="num">5</div><div class="lbl">formas de registrar: texto, voz, foto, auto, masiva</div></div>
          <div class="stat"><div class="num">3</div><div class="lbl">monedas en simultáneo: USD · EUR · VES</div></div>
          <div class="stat"><div class="num">2</div><div class="lbl">modos: Lite calmado o Pro con control total</div></div>
          <div class="stat"><div class="num">∞</div><div class="lbl">cántaros y sueños, a tu medida</div></div>
        </div>
      </div>
    </section>

    <!-- ===================== CÓMO FUNCIONA · CÁNTAROS ===================== -->
    <section class="section" id="como-funciona">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 56px">
          <p class="eyebrow">Cómo funciona</p>
          <h2 class="display-sm" style="margin-top: 16px">Cada ingreso se reparte solo,<br />en cántaros con propósito.</h2>
          <p class="lede">En lugar de una cuenta única confusa, tu dinero vive en cántaros: necesidades,
            diversión, ahorro. Cada ingreso se reparte por porcentaje, y cada gasto baja el cántaro al que pertenece.</p>
        </div>

        <div class="split reveal">
          <div class="split-media">
            <div class="card card-pad-lg" style="display: flex; flex-direction: column; gap: 14px">
              <div style="display: flex; align-items: center; justify-content: space-between">
                <span class="t-h3">Cántaros</span>
                <span class="chip cyan">Plantilla 55 / 10 / 10 / 10 / 10</span>
              </div>
              <div class="jar">
                <div class="jar-top">
                  <span class="jar-ico" style="background: var(--brand-primary-soft); color: var(--brand-primary-fg-soft)"><span class="material-icons">shield</span></span>
                  <div style="flex: 1"><div class="jar-name">Necesidades básicas</div><div class="jar-sub">Renta, comida, servicios</div></div>
                  <div class="jar-amt" style="font-size: 18px">$ 1,815.00</div>
                </div>
                <div class="bar"><i style="width: 68%; background: var(--brand-primary)"></i></div>
              </div>
              <div class="jar">
                <div class="jar-top">
                  <span class="jar-ico" style="background: var(--warning-soft); color: var(--warning-fg)"><span class="material-icons">celebration</span></span>
                  <div style="flex: 1"><div class="jar-name">Diversión</div><div class="jar-sub">Salidas, antojos</div></div>
                  <div class="jar-amt" style="font-size: 18px">$ 132.00</div>
                </div>
                <div class="bar"><i style="width: 73%; background: var(--warning)"></i></div>
              </div>
              <div class="jar">
                <div class="jar-top">
                  <span class="jar-ico" style="background: var(--income-soft); color: var(--income-fg)"><span class="material-icons">savings</span></span>
                  <div style="flex: 1"><div class="jar-name">Ahorro</div><div class="jar-sub">Tu colchón</div></div>
                  <div class="jar-amt" style="font-size: 18px">$ 2,940.00</div>
                </div>
                <div class="bar"><i style="width: 59%; background: var(--income)"></i></div>
              </div>
            </div>
          </div>
          <div class="split-copy">
            <p class="eyebrow">Cántaros</p>
            <h2 class="display-sm">Presupuesto de sobres,<br />sin la fricción.</h2>
            <ul class="bullets">
              <li><span class="material-icons">check_circle</span>Reparte el ingreso por porcentaje o monto fijo, automáticamente.</li>
              <li><span class="material-icons">check_circle</span>Empieza con la plantilla 55/10/10/10/10 o crea los tuyos.</li>
              <li><span class="material-icons">check_circle</span>Ponle una meta de ahorro a cualquier cántaro y mira el avance.</li>
              <li><span class="material-icons">check_circle</span>Transfiere entre cántaros cuando la vida cambia de planes.</li>
            </ul>
            <router-link class="link-cyan" style="margin-top: 26px" to="/funciones#cantaros">Conoce los cántaros<span class="material-icons">arrow_forward</span></router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== SUEÑOS ===================== -->
    <section class="section surface-alt">
      <div class="wrap">
        <div class="split reverse reveal">
          <div class="split-media">
            <div class="card card-pad-lg">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px">
                <span class="t-h3">Sueños</span>
                <span class="chip"><span class="material-icons" style="font-size: 15px">flag</span>Meta combinada $ 87,000</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 14px">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px">
                    <span style="font-weight: 600">Casa propia <span style="color: var(--fg-3); font-weight: 400; font-size: 13px">· Caracas</span></span>
                    <span class="tabular" style="font-family: var(--font-money); font-weight: 600">$ 12,400 <span style="color: var(--fg-3); font-weight: 400">/ 60,000</span></span>
                  </div>
                  <div class="bar"><i style="width: 21%; background: var(--brand-primary)"></i></div>
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px">
                    <span style="font-weight: 600">Maestría en Europa <span style="color: var(--fg-3); font-weight: 400; font-size: 13px">· IE Business School</span></span>
                    <span class="tabular" style="font-family: var(--font-money); font-weight: 600">$ 18,500 <span style="color: var(--fg-3); font-weight: 400">/ 27,000</span></span>
                  </div>
                  <div class="bar"><i style="width: 68%; background: #8B5CF6"></i></div>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border-hairline)">
                  <div><div class="k-lbl" style="font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--fg-3)">Total ahorrado</div><div style="font-family: var(--font-money); font-weight: 700; font-size: 24px">$ 30,900</div></div>
                  <div style="text-align: right"><div class="k-lbl" style="font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--fg-3)">Progreso global</div><div style="font-family: var(--font-money); font-weight: 700; font-size: 24px; color: #8B5CF6">36%</div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="split-copy">
            <p class="eyebrow">Sueños</p>
            <h2 class="display-sm">Ahorrar para algo grande,<br />en pasos visibles.</h2>
            <p class="lede" style="margin-top: 16px">Define metas concretas — una casa, un viaje, un posgrado — y deja que
              tu cántaro de ahorro las alimente. Ves el progreso real, sin promesas vagas.</p>
            <ul class="bullets">
              <li><span class="material-icons">check_circle</span>Una meta por sueño, con monto y avance claros.</li>
              <li><span class="material-icons">check_circle</span>Progreso combinado de todos tus sueños en un número.</li>
              <li><span class="material-icons">check_circle</span>Marca tus prioridades y enfoca el ahorro donde importa.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TRANSACCIONES IA ===================== -->
    <section class="section">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 48px">
          <p class="eyebrow">Registrar es el 80% del trabajo</p>
          <h2 class="display-sm" style="margin-top: 16px">Cinco formas de anotar un gasto.<br />Elige la más rápida del momento.</h2>
        </div>
        <div class="feature-grid reveal">
          <div class="feature">
            <span class="feat-ico"><span class="material-icons">edit</span></span>
            <h3>Escribe</h3>
            <p>"Café 4.50 y taxi 12" — lo interpretamos y lo dividimos en sus cántaros.</p>
          </div>
          <div class="feature">
            <span class="feat-ico cyan"><span class="material-icons">mic</span></span>
            <h3>Dicta por voz</h3>
            <p>Habla con naturalidad. Ideal para anotar mientras caminas o manejas.</p>
          </div>
          <div class="feature">
            <span class="feat-ico amber"><span class="material-icons">photo_camera</span></span>
            <h3>Foto del recibo</h3>
            <p>Toma una foto y extraemos comercio, monto, fecha e ítems por línea.</p>
          </div>
          <div class="feature">
            <span class="feat-ico green"><span class="material-icons">bolt</span></span>
            <h3>Automático</h3>
            <p>Recurrentes y reglas que registran lo predecible por ti.</p>
          </div>
          <div class="feature">
            <span class="feat-ico violet"><span class="material-icons">upload_file</span></span>
            <h3>Carga masiva</h3>
            <p>Importa un extracto completo con vista previa antes de confirmar.</p>
          </div>
          <div class="feature" style="background: var(--brand-primary); color: #fff; justify-content: center">
            <h3 style="color: #fff">Una acción primaria, siempre a mano.</h3>
            <p style="color: rgba(255, 255, 255, 0.82)">El botón <b style="color: #fff">Agregar</b> está donde lo necesitas. Sin menús que estorben.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ANÁLISIS ===================== -->
    <section class="section surface-alt">
      <div class="wrap">
        <div class="split reveal">
          <div class="split-copy">
            <p class="eyebrow">Análisis</p>
            <h2 class="display-sm">¿En qué se fue?<br />Respuesta en un vistazo.</h2>
            <p class="lede" style="margin-top: 16px">Un navegador de gastos que reparte tu mes por cántaro,
              contrasta lo gastado contra tu presupuesto y te avisa lo que se pasó — en lenguaje claro.</p>
            <ul class="bullets">
              <li><span class="material-icons">check_circle</span>Distribución por cántaro con donut y leyenda.</li>
              <li><span class="material-icons">check_circle</span>Presupuesto vs. real, resaltando lo sobre-gastado.</li>
              <li><span class="material-icons">check_circle</span>Navega por mes, trimestre o año con un toque.</li>
            </ul>
            <router-link class="link-cyan" style="margin-top: 26px" to="/funciones#analisis">Ver el análisis<span class="material-icons">arrow_forward</span></router-link>
          </div>
          <div class="split-media">
            <div class="card card-pad-lg">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px">
                <span class="t-h3">En junio gastaste</span>
                <span class="chip"><span class="material-icons" style="font-size: 15px">calendar_month</span>Junio 2026</span>
              </div>
              <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap">
                <div class="donut" style="background: conic-gradient(var(--brand-primary) 0 38%, var(--warning) 38% 58%, #8B5CF6 58% 74%, var(--income) 74% 88%, var(--info) 88% 100%)">
                  <div class="donut-center"><span class="d-amt">$ 2,360</span><span class="d-lbl">Gastado</span></div>
                </div>
                <div class="legend" style="flex: 1; min-width: 180px">
                  <div class="legend-row"><span class="dot" style="background: var(--brand-primary)"></span><span class="l-name">Necesidades</span><span class="l-val">$ 897</span></div>
                  <div class="legend-row"><span class="dot" style="background: var(--warning)"></span><span class="l-name">Diversión</span><span class="l-val">$ 472</span></div>
                  <div class="legend-row"><span class="dot" style="background: #8B5CF6"></span><span class="l-name">Transporte</span><span class="l-val">$ 378</span></div>
                  <div class="legend-row"><span class="dot" style="background: var(--income)"></span><span class="l-name">Salud</span><span class="l-val">$ 330</span></div>
                  <div class="legend-row"><span class="dot" style="background: var(--info)"></span><span class="l-name">Otros</span><span class="l-val">$ 283</span></div>
                </div>
              </div>
              <div style="margin-top: 18px; padding: 14px 16px; border-radius: var(--radius-sm); background: var(--warning-soft); display: flex; gap: 10px; align-items: flex-start">
                <span class="material-icons" style="color: var(--warning-fg); font-size: 20px">lightbulb</span>
                <span style="font-size: 13.5px; line-height: 1.5; color: var(--warning-fg)">Vas al 51% de tu presupuesto del mes. Diversión va al 97% — cuídala estas dos semanas.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== MODOS LITE & PRO ===================== -->
    <section class="section" id="modos">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 48px; max-width: 780px">
          <p class="eyebrow">Un producto, dos posturas</p>
          <h2 class="display-sm" style="margin-top: 16px">Lite o Pro. Tú eliges cuánto control.</h2>
          <p class="lede">No son planes ni productos distintos: son <b style="color: var(--fg-1)">modos</b> de la misma app, con tus mismos datos.
            Cambia entre ellos cuando quieras — tu histórico viaja contigo.</p>
        </div>
        <div class="split reveal" style="gap: 24px; align-items: stretch">
          <div class="card card-pad-lg" style="border-top: 3px solid var(--brand-primary); display: flex; flex-direction: column">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px">
              <span class="feat-ico"><span class="material-icons">view_agenda</span></span>
              <span class="t-h2">Lite</span>
            </div>
            <p class="lede" style="font-size: 16px">Calmado y al grano. Mira tu saldo, tus cántaros, registra y listo.
              Mobile-first, una acción a la vez.</p>
            <ul class="bullets" style="margin-top: 20px">
              <li><span class="material-icons">check_circle</span>Cántaros y sueños con saldo y metas</li>
              <li><span class="material-icons">check_circle</span>Registro por texto, voz, foto y masivo</li>
              <li><span class="material-icons">check_circle</span>Home resumido y análisis simple</li>
              <li><span class="material-icons">check_circle</span>Billetera implícita: el dinero, sin cuentas que pensar</li>
            </ul>
            <p class="t-body-sm" style="margin-top: auto; padding-top: 20px; color: var(--fg-3)">Para quien quiere simplicidad y velocidad.</p>
          </div>
          <div class="card card-pad-lg" style="border-top: 3px solid var(--info); display: flex; flex-direction: column">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px">
              <span class="feat-ico cyan"><span class="material-icons">dashboard</span></span>
              <span class="t-h2">Pro</span>
            </div>
            <p class="lede" style="font-size: 16px">Control total y trazabilidad. Multi-cuenta, multimoneda y analítica
              densa, estilo mesa de comando.</p>
            <ul class="bullets" style="margin-top: 20px">
              <li><span class="material-icons" style="color: var(--info-fg)">check_circle</span>Todo lo de Lite, más capas avanzadas</li>
              <li><span class="material-icons" style="color: var(--info-fg)">check_circle</span>Cuentas: banco, tarjeta, efectivo · USD/EUR/VES</li>
              <li><span class="material-icons" style="color: var(--info-fg)">check_circle</span>Transferencias cross-currency e impuestos (IGTF)</li>
              <li><span class="material-icons" style="color: var(--info-fg)">check_circle</span>Análisis con drill-down y presupuesto vs. real</li>
            </ul>
            <p class="t-body-sm" style="margin-top: auto; padding-top: 20px; color: var(--fg-3)">Para quien quiere precisión y trazabilidad.</p>
          </div>
        </div>
        <p style="text-align: center; margin-top: 28px"><router-link class="link-cyan" to="/funciones#comparativa">Ver la comparativa completa<span class="material-icons">arrow_forward</span></router-link></p>
      </div>
    </section>

    <!-- ===================== FEATURES GRID ===================== -->
    <section class="section surface-alt">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 48px">
          <p class="eyebrow">Detalles que se sienten</p>
          <h2 class="display-sm" style="margin-top: 16px">Hecho con cuidado, hasta lo pequeño.</h2>
        </div>
        <div class="feature-grid reveal">
          <div class="feature">
            <span class="feat-ico cyan"><span class="material-icons">currency_exchange</span></span>
            <h3>Multimoneda real</h3>
            <p>USD, EUR y VES en simultáneo, con tasa al vuelo. Pensado para LatAm.</p>
          </div>
          <div class="feature">
            <span class="feat-ico"><span class="material-icons">dark_mode</span></span>
            <h3>Claro y oscuro</h3>
            <p>Mismo diseño, dos temas. La jerarquía nunca se invierte, solo se adapta.</p>
          </div>
          <div class="feature">
            <span class="feat-ico green"><span class="material-icons">visibility_off</span></span>
            <h3>Modo privacidad</h3>
            <p>Oculta los montos con un toque cuando no estás solo frente a la pantalla.</p>
          </div>
          <div class="feature">
            <span class="feat-ico amber"><span class="material-icons">receipt_long</span></span>
            <h3>Ítems por línea</h3>
            <p>En Pro, divide un recibo ítem por ítem y manda cada uno a su cántaro.</p>
          </div>
          <div class="feature">
            <span class="feat-ico"><span class="material-icons">swap_horiz</span></span>
            <h3>Transferencias</h3>
            <p>Entre cántaros y, en Pro, entre cuentas — incluso cambiando de moneda.</p>
          </div>
          <div class="feature">
            <span class="feat-ico cyan"><span class="material-icons">lock</span></span>
            <h3>Tus datos, tuyos</h3>
            <p>Tu histórico viaja entre Lite y Pro sin perder nada. Sin sorpresas.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CTA BAND ===================== -->
    <section class="section">
      <div class="wrap">
        <div class="band-navy reveal" style="text-align: center">
          <p class="eyebrow">Empieza hoy</p>
          <h2 class="display-sm" style="margin-top: 14px; max-width: 680px; margin-left: auto; margin-right: auto">Pon tu dinero en claro este mes.</h2>
          <p class="lede" style="margin: 18px auto 0; max-width: 520px">Crea tu primer cántaro en menos de un minuto. Gratis para empezar, sin tarjeta.</p>
          <div style="display: flex; gap: 12px; justify-content: center; margin-top: 30px; flex-wrap: wrap">
            <router-link class="btn btn-on-navy btn-lg" to="/register">Crear cuenta gratis<span class="material-icons">arrow_forward</span></router-link>
            <router-link class="btn btn-on-navy-ghost btn-lg" to="/planes">Ver planes</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import LandingHeroMobile from './LandingHeroMobile.vue';

const $q = useQuasar();
const isMobile = computed(() => $q.platform.is.mobile || $q.screen.lt.md);
</script>
