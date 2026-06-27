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
          <!-- Avatar with upload button -->
          <div class="profile-page__avatar-wrap">
            <div class="profile-page__avatar">{{ initial }}</div>
            <button
              class="profile-page__avatar-cam"
              title="Cambiar foto"
              @click="$q.notify({ type: 'info', message: 'Subida de foto próximamente' })"
            >
              <q-icon name="photo_camera" size="14px" />
            </button>
          </div>

          <div class="profile-page__identity-info">
            <div class="profile-page__fullname">{{ form.name || '—' }}</div>
            <div class="profile-page__email-row">
              <span class="profile-page__email">{{ form.email }}</span>
              <span v-if="auth.user?.email_verified_at" class="profile-page__verified-badge">
                <q-icon name="verified" size="13px" />
                Verificado
              </span>
            </div>
          </div>

          <!-- Completitud -->
          <div class="profile-page__completeness">
            <div class="profile-page__completeness-row">
              <span class="profile-page__completeness-label">Completado</span>
              <span
                class="profile-page__completeness-pct"
                :style="{ color: pct === 100 ? 'var(--income-fg)' : 'var(--brand-primary)' }"
              >{{ pct }}%</span>
            </div>
            <div class="profile-page__completeness-bar">
              <div
                class="profile-page__completeness-fill"
                :style="{ width: pct + '%', background: pct === 100 ? 'var(--income)' : 'var(--brand-primary)' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Datos personales card -->
      <div class="profile-page__card">
        <div class="profile-page__section-title">Datos personales</div>
        <div class="profile-page__fields">
          <div class="profile-page__fields-row">
            <div class="profile-page__field">
              <label class="profile-page__label">Nombre completo</label>
              <q-input v-model="form.name" outlined dense placeholder="Tu nombre completo" />
            </div>
            <div class="profile-page__field">
              <label class="profile-page__label">Ocupación</label>
              <q-input v-model="form.occupation" outlined dense placeholder="Ej: Diseñador, Ingeniero…" />
            </div>
          </div>
          <div class="profile-page__fields-row">
            <div class="profile-page__field">
              <label class="profile-page__label">Fecha de nacimiento</label>
              <q-input v-model="form.birthdate" type="date" outlined dense />
            </div>
            <div class="profile-page__field">
              <label class="profile-page__label">Ingreso mensual</label>
              <q-input v-model.number="form.monthly_income" type="number" outlined dense prefix="$" min="0" />
            </div>
          </div>
        </div>
      </div>

      <!-- Contacto card -->
      <div class="profile-page__card">
        <div class="profile-page__section-title">Contacto</div>
        <div class="profile-page__fields">
          <div class="profile-page__field">
            <label class="profile-page__label">Correo electrónico</label>
            <q-input v-model="form.email" type="email" outlined dense placeholder="tu@email.com" />
          </div>
          <div class="profile-page__field">
            <label class="profile-page__label">Teléfono</label>
            <q-input v-model="form.phone" outlined dense placeholder="+58 412 000 0000" />
          </div>
        </div>
      </div>

      <!-- Ubicación card -->
      <div class="profile-page__card">
        <div class="profile-page__section-title">Ubicación</div>
        <div class="profile-page__fields">
          <div class="profile-page__fields-row">
            <div class="profile-page__field">
              <label class="profile-page__label">País</label>
              <q-select
                v-model="form.country"
                :options="countryOptions"
                emit-value map-options
                outlined dense
              />
            </div>
            <div class="profile-page__field">
              <label class="profile-page__label">Ciudad</label>
              <q-input v-model="form.city" outlined dense placeholder="Caracas, Bogotá…" />
            </div>
          </div>
        </div>
      </div>

      <!-- Seguridad card -->
      <div class="profile-page__card">
        <div class="profile-page__section-title">Seguridad</div>
        <div class="profile-page__fields">
          <div class="profile-page__field">
            <label class="profile-page__label">Nueva contraseña</label>
            <q-input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              outlined dense
              placeholder="Dejar vacío para no cambiar"
            >
              <template #append>
                <q-icon
                  :name="showPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- Financial profile link -->
      <button type="button" class="profile-page__fp-link" @click="void router.push('/user/financial-profile')">
        <q-icon name="insights" size="18px" />
        Ir a mi perfil financiero
      </button>

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

const countryOptions = [
  { value: 'VE', label: '🇻🇪 Venezuela' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'ES', label: '🇪🇸 España' },
];

const form = ref({
  name: '',
  email: '',
  phone: '',
  occupation: '',
  city: '',
  country: '',
  monthly_income: 0,
  birthdate: '',
  password: '',
});

// 8-field completeness bar matching spec (name, email, phone, occupation, city, country, birthdate, monthly_income)
const completenessFields = ['name', 'email', 'phone', 'occupation', 'city', 'country', 'birthdate', 'monthly_income'] as const;
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
    form.value.occupation = u.occupation ?? '';
    form.value.city = u.city ?? '';
    form.value.country = u.country ?? '';
    form.value.monthly_income = u.monthly_income ?? 0;
    form.value.birthdate = u.birthdate ?? '';
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
      occupation: form.value.occupation,
      city: form.value.city,
      country: form.value.country,
      monthly_income: form.value.monthly_income,
      birthdate: form.value.birthdate || null,
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
    border-radius: var(--radius-xl, var(--radius-md));
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__identity {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }

  &__avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  &__avatar {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: var(--brand-primary);
    color: var(--fg-on-brand, #fff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 32px;
  }

  &__avatar-cam {
    position: absolute;
    right: -2px;
    bottom: -2px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--surface-1);
    background: var(--surface-3);
    color: var(--fg-1);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    &:hover { background: var(--surface-2); }
  }

  &__identity-info {
    flex: 1;
    min-width: 180px;
  }

  &__fullname {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    color: var(--fg-1);
  }

  &__email-row {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 3px;
    flex-wrap: wrap;
  }

  &__email {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--fg-2);
  }

  &__verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    color: var(--income-fg, #16a34a);
    background: var(--income-soft, rgba(22,163,74,.1));
    padding: 2px 8px;
    border-radius: var(--radius-pill, 999px);
  }

  &__completeness {
    min-width: 130px;
    width: 130px;
  }

  &__completeness-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  &__completeness-label {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--fg-2);
  }

  &__completeness-pct {
    font-family: var(--font-money);
    font-size: 12px;
    font-weight: 700;
  }

  &__completeness-bar {
    height: 7px;
    border-radius: var(--radius-pill, 999px);
    background: var(--surface-3);
    overflow: hidden;
  }

  &__completeness-fill {
    height: 100%;
    border-radius: var(--radius-pill, 999px);
    transition: width var(--dur-base, 0.3s) var(--ease-out, ease);
  }

  &__section-title {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-2);
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__fields-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;

    > .profile-page__field {
      flex: 1 1 200px;
    }
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

  &__fp-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--brand-primary);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    padding: 4px 0;
    align-self: flex-start;
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
