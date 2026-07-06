<template>
  <div class="entry-gate">
    <div class="entry-gate__body">
      <div class="entry-gate__logo">
        <span class="material-icons">savings</span>
      </div>

      <h1 class="entry-gate__title">Tu dinero,<br />con un plan claro.</h1>
      <p class="entry-gate__lede">
        OW Finance organiza tu ingreso en cántaros y te acompaña para que cada
        decisión sea fácil.
      </p>

      <div class="entry-gate__bullets">
        <div v-for="b in bullets" :key="b.text" class="entry-gate__bullet">
          <span class="entry-gate__bullet-icon">
            <span class="material-icons">{{ b.icon }}</span>
          </span>
          <span class="entry-gate__bullet-text">{{ b.text }}</span>
        </div>
      </div>
    </div>

    <div class="entry-gate__actions">
      <router-link class="btn btn-primary btn-lg btn-block" to="/register">
        Crear mi cuenta<span class="material-icons">arrow_forward</span>
      </router-link>
      <router-link class="entry-gate__login-link" to="/login">
        Ya tengo cuenta · <span class="entry-gate__login-link-strong">Iniciar sesión</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const bullets = [
  { icon: 'savings', text: 'Reparte tu ingreso en cántaros con propósito' },
  { icon: 'auto_awesome', text: 'Un asesor con IA que aprende de ti' },
  { icon: 'insights', text: 'Mira a dónde va tu dinero, sin hojas de cálculo' },
];
</script>

<style scoped>
.entry-gate {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--bg-canvas);
  padding: env(safe-area-inset-top) 26px env(safe-area-inset-bottom);
}

.entry-gate__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 40px;
}

.entry-gate__logo {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(150deg, var(--brand-primary), var(--brand-primary-hover));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-float);
  margin-bottom: 26px;
}

.entry-gate__logo .material-icons {
  font-size: 34px;
  color: #fff;
}

.entry-gate__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  line-height: 1.12;
  color: var(--fg-1);
  margin: 0;
  letter-spacing: -0.02em;
}

.entry-gate__lede {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.5;
  margin: 14px 0 28px;
}

.entry-gate__bullets {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.entry-gate__bullet {
  display: flex;
  align-items: center;
  gap: 13px;
}

.entry-gate__bullet-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
}

.entry-gate__bullet-icon .material-icons {
  font-size: 20px;
}

.entry-gate__bullet-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--fg-1);
  line-height: 1.35;
}

.entry-gate__actions {
  flex-shrink: 0;
  padding: 14px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.entry-gate__login-link {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--fg-2);
  padding: 6px;
  text-align: center;
  text-decoration: none;
}

.entry-gate__login-link-strong {
  color: var(--brand-primary);
  font-weight: 600;
}
</style>
