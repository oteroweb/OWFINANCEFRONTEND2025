<template>
  <div>
    <!-- HERO -->
    <section class="section" style="padding-bottom: 48px; text-align: center">
      <div class="wrap reveal">
        <p class="eyebrow">OWFINANCE 2026 · Producto</p>
        <h1 class="display-sm" style="margin-top: 16px">Matriz de funcionalidades · LITE vs PRO</h1>
        <p class="lede" style="margin: 18px auto 0; max-width: 720px">Mismo design system, misma base de datos. <b>PRO = LITE + capas</b> de cuentas,
          transacciones avanzadas y analítica. LITE es un subconjunto de PRO, no un producto distinto.</p>
      </div>
    </section>

    <!-- PHILOSOPHY CARDS -->
    <section class="section surface-alt" style="padding-top: 0">
      <div class="wrap">
        <div class="phil reveal">
          <div class="card lite">
            <div class="tag lite"><span class="material-icons">view_agenda</span>LITE</div>
            <p>Para quien quiere <b>simplicidad y velocidad</b>. Mobile-first. Mental model:
              "tengo cántaros con saldo". Billetera implícita única — el dinero "dónde está" es lo de menos.</p>
            <div class="meta">Prioridad: <b>facilidad de registro</b> · Forma: compacta, táctil</div>
          </div>
          <div class="card pro">
            <div class="tag pro"><span class="material-icons">dashboard</span>PRO</div>
            <p>Para quien quiere <b>control total y trazabilidad</b>. Desktop denso, analítico.
              Mental model: "tengo cuentas y cántaros, y trackeo todo" (multi-cuenta, multimoneda).</p>
            <div class="meta">Prioridad: <b>precisión</b> · Forma: densa, productividad</div>
          </div>
        </div>

        <div class="legend">
          <span><span class="badge yes"><span class="material-icons">check</span></span>Disponible</span>
          <span><span class="badge part"><span class="material-icons">remove</span></span>Simplificado</span>
          <span><span class="badge no"><span class="material-icons">close</span></span>No disponible</span>
        </div>

        <!-- TABLE -->
        <div class="cmp reveal" style="margin-top: 40px">
          <table>
            <thead>
              <tr>
                <th>Funcionalidad</th>
                <th class="mode" style="text-align: center">LITE</th>
                <th class="mode" style="text-align: center">PRO</th>
              </tr>
            </thead>
            <tbody>
              <tr class="grp"><td colspan="3">Cántaros</td></tr>
              <tr><td class="cap">Reparto automático</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Metas de ahorro</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Transferencias entre cántaros</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>

              <tr class="grp"><td colspan="3">Transacciones</td></tr>
              <tr><td class="cap">Registro por texto</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Registro por voz</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Foto de recibo (OCR)</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Automático / recurrentes</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Carga masiva</td><td class="mode"><span class="badge part"><span class="material-icons">remove</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Ítems por línea</td><td class="mode"><span class="badge no"><span class="material-icons">close</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>

              <tr class="grp"><td colspan="3">Cuentas &amp; Monedas</td></tr>
              <tr><td class="cap">Multi-moneda (USD/EUR/VES)</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Múltiples cuentas</td><td class="mode"><span class="badge no"><span class="material-icons">close</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Transferencias cross-currency</td><td class="mode"><span class="badge no"><span class="material-icons">close</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Impuestos (IGTF)</td><td class="mode"><span class="badge no"><span class="material-icons">close</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>

              <tr class="grp"><td colspan="3">Análisis</td></tr>
              <tr><td class="cap">Distribución por cántaro</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Presupuesto vs. real</td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Drill-down por categoría</td><td class="mode"><span class="badge no"><span class="material-icons">close</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
              <tr><td class="cap">Insights con IA</td><td class="mode"><span class="badge no"><span class="material-icons">close</span></span></td><td class="mode"><span class="badge yes"><span class="material-icons">check</span></span></td></tr>
            </tbody>
          </table>
        </div>

        <div class="note reveal" style="margin-top: 32px">
          <b>Nota:</b> Lite y Pro comparten la misma base de datos. Cambiar de modo no altera tus datos;
          solo cambia qué funciones se muestran y la densidad de la interfaz.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// MatrixPage — static feature comparison
</script>

<style scoped>
.phil {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 48px;
}
@media (max-width: 760px) {
  .phil {
    grid-template-columns: 1fr;
  }
}
.phil .card {
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
  background: var(--surface-1);
}
.phil .card.lite {
  border-top: 3px solid var(--brand-primary);
}
.phil .card.pro {
  border-top: 3px solid var(--info);
}
.phil .tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 6px;
}
.phil .tag.lite {
  color: var(--brand-primary);
}
.phil .tag.pro {
  color: var(--info);
}
.phil p {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.55;
  color: var(--fg-2);
  margin: 8px 0 0;
}
.phil .meta {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--fg-1);
  margin-top: 14px;
}
.phil .meta b {
  color: var(--fg-1);
}

.legend {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 4px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--fg-2);
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.badge .material-icons {
  font-size: 14px;
}
.yes {
  background: var(--income-soft);
  color: var(--income-fg);
}
.no {
  background: var(--surface-2);
  color: var(--fg-3);
}
.part {
  background: var(--warning-soft);
  color: var(--warning-fg);
}

.cmp {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
.cmp table {
  width: 100%;
  border-collapse: collapse;
}
.cmp thead th {
  text-align: left;
  padding: 20px 24px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--fg-1);
  background: var(--surface-2);
}
.cmp thead th.mode {
  text-align: center;
  width: 130px;
}
.cmp .grp td {
  padding: 14px 24px 8px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  font-weight: 600;
  background: var(--bg-canvas);
}
.cmp tbody td {
  padding: 13px 24px;
  font-size: 14px;
  color: var(--fg-1);
  border-top: 1px solid var(--border-hairline);
}
.cmp tbody td.cap {
  color: var(--fg-1);
}
.cmp td.mode {
  text-align: center;
}

.note {
  padding: 18px 20px;
  border-radius: var(--radius-md);
  background: var(--brand-primary-soft);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.6;
  color: var(--fg-1);
}
.note b {
  color: var(--brand-primary-fg-soft);
}
</style>
