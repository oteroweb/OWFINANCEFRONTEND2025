<template>
  <q-page class="profile-page">
    <div class="profile-page__container">

      <!-- Header -->
      <div class="profile-page__header">
        <button class="profile-page__back" @click="void router.push('/user/config')">
          <q-icon name="chevron_left" size="18px" />
          Configuración
        </button>
        <span class="t-eyebrow">Cuenta</span>
        <h1 class="t-h1">Perfil</h1>
      </div>

      <!-- Identity card -->
      <div class="profile-page__card">
        <div class="profile-page__identity">
          <div class="profile-page__avatar">
            {{ initial }}
          </div>
          <div class="profile-page__identity-info">
            <div class="profile-page__fullname">{{ form.name || '—' }}</div>
            <div class="profile-page__email">{{ form.email }}</div>
          </div>
          <!-- Completitud -->
          <div class="profile-page__completeness">
            <div class="profile-page__completeness-row">
              <span class="t-body-sm">Completado</span>
              <span class="profile-page__completeness-pct" :style="{ color: pct === 100 ? 'var(--income-fg)' : 'var(--brand-primary)' }">{{ pct }}%</span>
            </div>
            <div class="profile-page__completeness-bar">
              <div class="profile-page__completeness-fill" :style="{ width: pct + '%', background: pct === 100 ? 'var(--income)' : 'var(--brand-primary)' }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Form card -->
      <div class="profile-page__card">
        <div class="profile-page__section-title">Datos personales</div>
        <div class="profile-page__fields">
          <div class="profile-page__field">
            <label class="profile-page__label">Nombre completo</label>
            <q-input v-model="form.name" outlined dense placeholder="Tu nombre" />
          </div>
          <div class="profile-page__field">
            <label class="profile-page__label">Correo electrónico</label>
            <q-input v-model="form.email" type="email" outlined dense placeholder="tu@email.com" />
          </div>
          <div class="profile-page__field">
            <label class="profile-page__label">Teléfono</label>
            <q-input v-model="form.phone" outlined dense placeholder="+58 412 000 0000" />
          </div>
          <div class="profile-page__field">
            <label class="profile-page__label">Ingreso mensual</label>
            <q-input v-model.number="form.monthly_income" type="number" outlined dense prefix="$" min="0" />
          </div>
        </div>
      </div>

      <!-- Password card -->
      <div class="profile-page__card">
        <div class="profile-page__section-title">Cambiar contraseña</div>
        <div class="profile-page__fields">
          <div class="profile-page__field">
            <label class="profile-page__label">Nueva contraseña</label>
            <q-input v-model="form.password" :type="showPwd ? 'text' : 'password'" outlined dense placeholder="Mínimo 6 caracteres">
              <template #append>
                <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPwd = !showPwd" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-page__actions">
        <q-btn flat label="Cancelar" @click="void router.push('/user/config')" />
        <q-btn unelevated color="primary" label="Guardar cambios" :loading="saving" @click="save" />
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'stores/auth';

defineOptions({ name: 'UserProfilePage' });

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();

const saving = ref(false);
const showPwd = ref(false);

const form = ref({
  name: '',
  email: '',
  phone: '',
  monthly_income: 0,
  password: '',
});

const completenessFields = ['name', 'email', 'phone', 'monthly_income'];
const pct = computed(() => {
  const filled = completenessFields.filter(k => {
    const v = form.value[k as keyof typeof form.value];
    return v !== null && v !== '' && v !== 0;
  }).length;
  return Math.round((filled / completenessFields.length) * 100);
});

const initial = computed(() => (form.value.name || auth.user?.name || 'U').trim().charAt(0).toUpperCase());

onMounted(async () => {
  try {
    const { data } = await api.get('/user/profile');
    const u = data.data ?? data;
    form.value.name = u.name ?? '';
    form.value.email = u.email ?? '';
    form.value.phone = u.phone ?? '';
    form.value.monthly_income = u.monthly_income ?? 0;
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar el perfil' });
  }
});

async function save() {
  saving.value = true;
  try {
    const payload: Record<string, unknown> = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      monthly_income: form.value.monthly_income,
    };
    if (form.value.password) payload.password = form.value.password;

    await api.put('/user/profile', payload);
    if (auth.user) auth.user.name = form.value.name;
    form.value.password = '';
    $q.notify({ type: 'positive', message: 'Perfil actualizado' });
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al guardar';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  padding: 0;

  &__container {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    padding: 2px 0;
    margin-bottom: 6px;
  }

  &__card {
    background: var(--surface-1);
    border: 1px solid var(--border-hairline, rgba(0,0,0,.08));
    border-radius: var(--radius-md);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__identity {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--brand-primary);
    color: var(--fg-on-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 26px;
    flex-shrink: 0;
  }

  &__identity-info {
    flex: 1;
    min-width: 120px;
  }

  &__fullname {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    color: var(--fg-1);
  }

  &__email {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--fg-2);
    margin-top: 2px;
  }

  &__completeness {
    min-width: 120px;
  }

  &__completeness-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__completeness-pct {
    font-family: var(--font-money);
    font-size: 12px;
    font-weight: 700;
  }

  &__completeness-bar {
    height: 6px;
    border-radius: 999px;
    background: var(--surface-3);
    overflow: hidden;
  }

  &__completeness-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  &__section-title {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 700;
    color: var(--fg-2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fg-2);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    position: sticky;
    bottom: 16px;
  }
}
</style>
