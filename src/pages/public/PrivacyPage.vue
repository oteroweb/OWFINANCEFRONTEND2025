<template>
  <div>
    <section class="section" style="padding-bottom: 0">
      <div class="wrap reveal">
        <p class="eyebrow">Legal</p>
        <h1 class="display-sm" style="margin-top: 16px">Política de Privacidad</h1>
        <p class="lede" style="margin-top: 12px">Última actualización: agosto de 2026</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap legal-doc">
        <p>En OW Finance nos tomamos en serio la privacidad de tus datos financieros. Esta política explica qué información recolectamos, cómo la usamos y qué control tenés sobre ella.</p>

        <h2>1. Qué datos recolectamos</h2>
        <ul>
          <li>Datos de cuenta: nombre, correo electrónico, contraseña (almacenada encriptada).</li>
          <li>Datos financieros que ingresás vos mismo: transacciones, cuentas, cántaros, deudas, sueños, metas y preferencias de moneda.</li>
          <li>Datos de perfil opcionales: ocupación, rango de ingresos y situación financiera, usados para personalizar las recomendaciones del Asesor IA.</li>
          <li>Datos técnicos básicos: tipo de dispositivo y navegador, para mantener el servicio funcionando correctamente.</li>
        </ul>

        <h2>2. Cómo usamos tus datos</h2>
        <p>Usamos tus datos para: operar la Plataforma (mostrar tus movimientos, calcular saldos y proyecciones), generar las sugerencias del Asesor IA, enviarte notificaciones que vos configurás (resumen semanal, alertas de cántaros), y mejorar el producto de forma agregada y anonimizada. No vendemos tus datos financieros a terceros.</p>

        <h2>3. Con quién compartimos información</h2>
        <p>Para generar las respuestas del Asesor IA, tus consultas (y el contexto financiero relevante que autorizás) se envían a proveedores de inteligencia artificial externos bajo acuerdos de procesamiento de datos. No compartimos tu información con anunciantes ni la usamos para publicidad de terceros.</p>

        <h2>4. Seguridad</h2>
        <p>Tu contraseña se almacena con hash, nunca en texto plano. El acceso a la API requiere autenticación por token, y podés activar un PIN de acceso rápido adicional desde Configuración. Trabajamos activamente en mantener la Plataforma protegida contra accesos no autorizados.</p>

        <h2>5. Tus derechos sobre tus datos</h2>
        <p>Podés acceder, corregir o exportar tus datos en cualquier momento desde la app. Podés eliminar tu cuenta y tus datos financieros desde Configuración; al hacerlo, tus registros se eliminan de forma permanente, salvo lo que estemos obligados a conservar por ley.</p>

        <h2>6. Cookies y almacenamiento local</h2>
        <p>Usamos almacenamiento local del navegador (localStorage) para mantener tu sesión iniciada y recordar preferencias de interfaz (tema, moneda). No usamos cookies de rastreo publicitario.</p>

        <h2>7. Cambios a esta política</h2>
        <p>Si hacemos cambios significativos a esta política, te avisaremos dentro de la app o por correo antes de que entren en vigencia.</p>

        <h2>8. Contacto</h2>
        <p>¿Preguntas sobre tu privacidad? Escribinos a <a href="mailto:soporte@owfinance.app">soporte@owfinance.app</a>.</p>
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
.legal-doc p,
.legal-doc li {
  margin-top: 10px;
  color: var(--fg-2, inherit);
}
.legal-doc ul {
  margin-top: 10px;
  padding-left: 22px;
}
</style>
