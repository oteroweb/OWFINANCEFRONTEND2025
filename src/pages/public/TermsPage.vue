<template>
  <div>
    <section class="section" style="padding-bottom: 0">
      <div class="wrap reveal">
        <p class="eyebrow">Legal</p>
        <h1 class="display-sm" style="margin-top: 16px">Términos de Servicio</h1>
        <p class="lede" style="margin-top: 12px">Última actualización: agosto de 2026</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap legal-doc">
        <p>Estos Términos de Servicio ("Términos") regulan el uso de OW Finance (la "Plataforma", "nosotros"). Al crear una cuenta o usar la Plataforma aceptas estos Términos. Si no estás de acuerdo, no uses el servicio.</p>

        <h2>1. Descripción del servicio</h2>
        <p>OW Finance es una herramienta de organización financiera personal: registro de transacciones, cántaros de presupuesto, seguimiento de deudas y sueños, y un asesor con inteligencia artificial que da sugerencias basadas en los datos que ingresás. No somos una entidad bancaria, no custodiamos dinero real ni ejecutamos movimientos en cuentas bancarias — todos los saldos y transacciones que ves en la Plataforma son registros que vos mismo ingresás o conectás manualmente.</p>

        <h2>2. Cuentas de usuario</h2>
        <p>Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta. Notificanos de inmediato si sospechás un uso no autorizado. Debés dar información veraz al registrarte y mantenerla actualizada.</p>

        <h2>3. Planes Lite y Pro</h2>
        <p>Ofrecemos un plan gratuito ("Lite") y un plan pago con funciones adicionales ("Pro"). Los precios y funciones de cada plan se detallan en <router-link to="/planes">la página de Planes</router-link> y pueden cambiar con aviso previo razonable. Podés cancelar tu suscripción Pro en cualquier momento desde Configuración; el acceso Pro se mantiene hasta el final del período ya pagado.</p>

        <h2>4. Uso aceptable</h2>
        <p>No está permitido: usar la Plataforma para actividades ilegales, intentar acceder a cuentas de otros usuarios, realizar ingeniería inversa del servicio, ni sobrecargar deliberadamente nuestra infraestructura. Nos reservamos el derecho de suspender cuentas que violen estas reglas.</p>

        <h2>5. El Asesor IA</h2>
        <p>Las sugerencias del Asesor IA se generan automáticamente a partir de los datos que ingresás y no constituyen asesoría financiera, legal ni de inversión profesional. Son un apoyo informativo — las decisiones sobre tu dinero son enteramente tuyas.</p>

        <h2>6. Propiedad intelectual</h2>
        <p>El software, diseño, marca y contenidos de OW Finance nos pertenecen o están licenciados a nosotros. Tus propios datos financieros (transacciones, cántaros, notas) te pertenecen a vos; podés exportarlos o eliminar tu cuenta cuando quieras.</p>

        <h2>7. Limitación de responsabilidad</h2>
        <p>La Plataforma se ofrece "tal cual". No garantizamos que esté libre de errores en todo momento. En la medida permitida por la ley, no somos responsables por decisiones financieras que tomes basándote en la información de la Plataforma, incluidas las sugerencias del Asesor IA.</p>

        <h2>8. Cambios a estos Términos</h2>
        <p>Podemos actualizar estos Términos. Si el cambio es significativo, te avisaremos dentro de la app o por correo antes de que entre en vigencia.</p>

        <h2>9. Contacto</h2>
        <p>¿Preguntas sobre estos Términos? Escribinos a <a href="mailto:soporte@owfinance.app">soporte@owfinance.app</a>.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Contenido base — revisar con asesoría legal antes de tratarlo como definitivo.
</script>

<style scoped>
.legal-doc {
  max-width: 720px;
  line-height: 1.7;
}
.legal-doc h2 {
  margin-top: 32px;
  font-size: 1.15rem;
}
.legal-doc p {
  margin-top: 10px;
  color: var(--fg-2, inherit);
}
</style>
