<template>
  <div>
    <!-- HERO -->
    <section class="section" style="padding-bottom: 48px; text-align: center">
      <div class="wrap reveal">
        <p class="eyebrow">Funciones</p>
        <h1 class="display-sm" style="margin-top: 16px">Todo lo que OW Finance<br />hace por tu dinero.</h1>
        <p class="lede" style="margin: 18px auto 0; max-width: 560px">Cántaros, sueños, registro inteligente y análisis claro.
          Lo esencial en Lite; el control total en Pro.</p>
        <div class="anchor-nav">
          <a href="#cantaros">Cántaros</a>
          <a href="#suenos">Sueños</a>
          <a href="#transacciones">Transacciones</a>
          <a href="#analisis">Análisis</a>
          <a href="#cuentas">Cuentas &amp; monedas</a>
          <a href="#comparativa">Lite vs Pro</a>
        </div>
      </div>
    </section>

    <!-- CÁNTAROS -->
    <section class="section surface-alt" id="cantaros" style="scroll-margin-top: 84px">
      <div class="wrap">
        <div class="split reveal">
          <div class="split-copy">
            <span class="feat-ico"><span class="material-icons">savings</span></span>
            <h2 class="display-sm" style="margin-top: 18px">Cántaros</h2>
            <p class="lede" style="margin-top: 16px">Tu dinero vive en cántaros con propósito en vez de una cuenta única.
              Cada ingreso se reparte automáticamente; cada gasto baja el cántaro que le toca.</p>
            <ul class="bullets">
              <li><span class="material-icons">check_circle</span>Reparto por porcentaje o monto fijo</li>
              <li><span class="material-icons">check_circle</span>Plantilla rápida 55 / 10 / 10 / 10 / 10</li>
              <li><span class="material-icons">check_circle</span>Meta de ahorro por cántaro con avance visible</li>
              <li><span class="material-icons">check_circle</span>Transferencias entre cántaros cuando cambian los planes</li>
              <li><span class="material-icons">check_circle</span>En Pro: ajustes manuales, apalancamiento e histórico por ciclos</li>
            </ul>
            <router-link class="link-cyan" style="margin-top: 26px" to="/">Ver cántaros en acción<span class="material-icons">arrow_forward</span></router-link>
          </div>
          <div class="split-media">
            <div class="card card-pad-lg" style="display: flex; flex-direction: column; gap: 14px">
              <div class="jar">
                <div class="jar-top">
                  <span class="jar-ico" style="background: var(--brand-primary-soft); color: var(--brand-primary-fg-soft)"><span class="material-icons">shield</span></span>
                  <div style="flex: 1"><div class="jar-name">Necesidades básicas</div><div class="jar-sub">55%</div></div>
                  <div class="jar-amt" style="font-size: 18px">$ 1,815.00</div>
                </div>
                <div class="bar"><i style="width: 68%; background: var(--brand-primary)"></i></div>
              </div>
              <div class="jar">
                <div class="jar-top">
                  <span class="jar-ico" style="background: var(--warning-soft); color: var(--warning-fg)"><span class="material-icons">celebration</span></span>
                  <div style="flex: 1"><div class="jar-name">Diversión</div><div class="jar-sub">10%</div></div>
                  <div class="jar-amt" style="font-size: 18px">$ 132.00</div>
                </div>
                <div class="bar"><i style="width: 73%; background: var(--warning)"></i></div>
              </div>
              <div class="jar">
                <div class="jar-top">
                  <span class="jar-ico" style="background: var(--income-soft); color: var(--income-fg)"><span class="material-icons">savings</span></span>
                  <div style="flex: 1"><div class="jar-name">Ahorro</div><div class="jar-sub">10%</div></div>
                  <div class="jar-amt" style="font-size: 18px">$ 2,940.00</div>
                </div>
                <div class="bar"><i style="width: 59%; background: var(--income)"></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SUEÑOS -->
    <section class="section" id="suenos" style="scroll-margin-top: 84px">
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
                    <span style="font-weight: 600">Casa propia</span>
                    <span class="tabular" style="font-family: var(--font-money); font-weight: 600">$ 12,400 <span style="color: var(--fg-3); font-weight: 400">/ 60,000</span></span>
                  </div>
                  <div class="bar"><i style="width: 21%; background: var(--brand-primary)"></i></div>
                </div>
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px">
                    <span style="font-weight: 600">Maestría en Europa</span>
                    <span class="tabular" style="font-family: var(--font-money); font-weight: 600">$ 18,500 <span style="color: var(--fg-3); font-weight: 400">/ 27,000</span></span>
                  </div>
                  <div class="bar"><i style="width: 68%; background: #8B5CF6"></i></div>
                </div>
              </div>
            </div>
          </div>
          <div class="split-copy">
            <span class="feat-ico violet"><span class="material-icons">flag</span></span>
            <h2 class="display-sm" style="margin-top: 18px">Sueños</h2>
            <p class="lede" style="margin-top: 16px">Define metas concretas — una casa, un viaje, un posgrado — y deja que
              tu cántaro de ahorro las alimente.</p>
            <ul class="bullets">
              <li><span class="material-icons">check_circle</span>Una meta por sueño, con monto y avance claros.</li>
              <li><span class="material-icons">check_circle</span>Progreso combinado de todos tus sueños.</li>
              <li><span class="material-icons">check_circle</span>Marca prioridades y enfoca el ahorro.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- TRANSACCIONES -->
    <section class="section surface-alt" id="transacciones" style="scroll-margin-top: 84px">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 48px">
          <p class="eyebrow">Transacciones</p>
          <h2 class="display-sm" style="margin-top: 16px">Cinco formas de registrar.<br />Una acción primaria.</h2>
        </div>
        <div class="feature-grid reveal">
          <div class="feature">
            <span class="feat-ico"><span class="material-icons">edit</span></span>
            <h3>Escribe</h3>
            <p>"Café 4.50 y taxi 12" — lo interpretamos y lo dividimos en cántaros.</p>
          </div>
          <div class="feature">
            <span class="feat-ico cyan"><span class="material-icons">mic</span></span>
            <h3>Dicta por voz</h3>
            <p>Habla con naturalidad. Ideal para anotar mientras caminas.</p>
          </div>
          <div class="feature">
            <span class="feat-ico amber"><span class="material-icons">photo_camera</span></span>
            <h3>Foto del recibo</h3>
            <p>Toma una foto y extraemos comercio, monto, fecha e ítems.</p>
          </div>
          <div class="feature">
            <span class="feat-ico green"><span class="material-icons">bolt</span></span>
            <h3>Automático</h3>
            <p>Recurrentes y reglas que registran lo predecible por ti.</p>
          </div>
          <div class="feature">
            <span class="feat-ico violet"><span class="material-icons">upload_file</span></span>
            <h3>Carga masiva</h3>
            <p>Importa un extracto completo con vista previa.</p>
          </div>
          <div class="feature">
            <span class="feat-ico"><span class="material-icons">receipt_long</span></span>
            <h3>Ítems &amp; impuestos</h3>
            <p>En Pro: divide por ítem, aplica IGTF 3% y reparte cada línea a su cántaro.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ANÁLISIS -->
    <section class="section" id="analisis" style="scroll-margin-top: 84px">
      <div class="wrap">
        <div class="split reveal">
          <div class="split-copy">
            <span class="feat-ico cyan"><span class="material-icons">bar_chart</span></span>
            <h2 class="display-sm" style="margin-top: 18px">Análisis</h2>
            <p class="lede" style="margin-top: 16px">¿En qué se fue? Respuesta en un vistazo. Navegador de gastos que reparte tu mes por cántaro,
              contrasta lo gastado contra tu presupuesto y te avisa lo que se pasó.</p>
            <ul class="bullets">
              <li><span class="material-icons">check_circle</span>Distribución por cántaro con donut y leyenda.</li>
              <li><span class="material-icons">check_circle</span>Presupuesto vs. real, resaltando sobre-gastos.</li>
              <li><span class="material-icons">check_circle</span>Navega por mes, trimestre o año con un toque.</li>
            </ul>
          </div>
          <div class="split-media">
            <div class="card card-pad-lg">
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
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CUENTAS Y MONEDAS -->
    <section class="section surface-alt" id="cuentas" style="scroll-margin-top: 84px">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 44px">
          <span class="feat-ico cyan"><span class="material-icons">account_balance</span></span>
          <h2 class="display-sm" style="margin-top: 18px">Cuentas y monedas <span class="chip cyan" style="vertical-align: middle; font-size: 12px">Pro</span></h2>
          <p class="lede">Cuando necesitas trazabilidad total, Pro suma una capa de cuentas reales y multimoneda
            — sin perder la simplicidad de los cántaros.</p>
        </div>
        <div class="feature-grid reveal">
          <div class="feature"><span class="feat-ico cyan"><span class="material-icons">account_balance_wallet</span></span><h3>Multi-cuenta</h3><p>Banco, tarjeta, efectivo y más, organizadas en carpetas.</p></div>
          <div class="feature"><span class="feat-ico"><span class="material-icons">currency_exchange</span></span><h3>Multimoneda</h3><p>USD, EUR y VES en simultáneo, con tasa al vuelo al registrar.</p></div>
          <div class="feature"><span class="feat-ico amber"><span class="material-icons">swap_horiz</span></span><h3>Transferencias</h3><p>Entre cuentas, incluso cross-currency, con su tasa registrada.</p></div>
          <div class="feature"><span class="feat-ico green"><span class="material-icons">groups</span></span><h3>Cuentas compartidas</h3><p>Para una casa o equipo, con saldo inicial e impuestos por cuenta.</p></div>
          <div class="feature"><span class="feat-ico violet"><span class="material-icons">percent</span></span><h3>Impuestos</h3><p>IGTF 3%, Pago Móvil y reglas fiscales por cuenta.</p></div>
          <div class="feature"><span class="feat-ico"><span class="material-icons">call_split</span></span><h3>Pago múltiple</h3><p>Divide un pago en varias cuentas en una sola transacción.</p></div>
        </div>
      </div>
    </section>

    <!-- COMPARATIVA LITE VS PRO -->
    <section class="section" id="comparativa" style="scroll-margin-top: 84px">
      <div class="wrap">
        <div class="section-head reveal" style="margin-bottom: 48px">
          <p class="eyebrow">Comparativa</p>
          <h2 class="display-sm" style="margin-top: 16px">Lite vs Pro. Mismo producto, más capas.</h2>
        </div>
        <div class="cmp reveal">
          <table>
            <thead>
              <tr>
                <th>Característica</th>
                <th class="mode"><span class="m-tag"><span class="material-icons">view_agenda</span>Lite</span></th>
                <th class="mode"><span class="m-tag"><span class="material-icons">dashboard</span>Pro</span></th>
              </tr>
            </thead>
            <tbody>
              <tr class="grp"><td colspan="3">Cántaros</td></tr>
              <tr><td class="cap">Reparto automático</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Metas de ahorro</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Transferencias entre cántaros</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>

              <tr class="grp"><td colspan="3">Transacciones</td></tr>
              <tr><td class="cap">Registro por texto</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Registro por voz</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Foto de recibo (OCR)</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Automático / recurrentes</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Carga masiva</td><td class="mark part"><span class="material-icons">remove</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Ítems por línea</td><td class="mark no"><span class="material-icons">close</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>

              <tr class="grp"><td colspan="3">Cuentas &amp; Monedas</td></tr>
              <tr><td class="cap">Multi-moneda (USD/EUR/VES)</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Múltiples cuentas (banco, tarjeta, efectivo)</td><td class="mark no"><span class="material-icons">close</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Transferencias cross-currency</td><td class="mark no"><span class="material-icons">close</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Impuestos (IGTF)</td><td class="mark no"><span class="material-icons">close</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>

              <tr class="grp"><td colspan="3">Análisis</td></tr>
              <tr><td class="cap">Distribución por cántaro</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Presupuesto vs. real</td><td class="mark yes"><span class="material-icons">check</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Drill-down por categoría / cuenta</td><td class="mark no"><span class="material-icons">close</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
              <tr><td class="cap">Insights con IA</td><td class="mark no"><span class="material-icons">close</span></td><td class="mark yes"><span class="material-icons">check</span></td></tr>
            </tbody>
          </table>
        </div>
        <div class="cmp-legend">
          <span><span class="material-icons yes">check</span>Disponible</span>
          <span><span class="material-icons part">remove</span>Simplificado</span>
          <span><span class="material-icons no">close</span>No disponible</span>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section surface-alt">
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
// FeaturesPage — static marketing page
</script>
