<template>
  <q-dialog :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)">
    <div class="asd">
      <div class="asd__header">
        <div class="asd__header-text">
          <div class="asd__title">Compartir con mi grupo familiar</div>
          <div class="asd__label">{{ account?.name }}</div>
        </div>
        <button class="asd__close" aria-label="Cerrar" @click="close">
          <q-icon name="close" size="22px" />
        </button>
      </div>

      <!-- ── Sin grupo familiar ─────────────────────────────────────────── -->
      <div v-if="!loading && members.length === 0" class="asd__empty">
        <q-icon name="group_off" size="22px" color="grey-5" />
        <div class="asd__empty-text">
          <div class="asd__empty-title">Todavía no tenés grupo familiar</div>
          <p class="asd__label asd__empty-desc">
            Una cuenta solo se comparte con miembros de tu grupo familiar. Creá el grupo primero.
          </p>
          <q-btn size="sm" unelevated rounded color="primary" icon="group_add" label="Ir a grupo familiar" @click="goToFamilyGroup" />
        </div>
      </div>

      <template v-else>
        <!-- Dueño — owner no es una opción seleccionable -->
        <div class="asd__owner">
          <q-avatar size="32px" color="grey-3" text-color="grey-8">{{ ownerInitial }}</q-avatar>
          <div class="asd__owner-text">{{ ownerName }} · <span class="asd__owner-role">dueño de la cuenta</span></div>
          <q-icon name="verified_user" size="18px" color="grey-5" />
        </div>

        <!-- Un miembro por fila, 4 niveles siempre visibles -->
        <div class="asd__members">
          <div v-for="m in members" :key="m.user_id" class="asd__member" :style="{ opacity: m.status === 'invited' ? 0.55 : 1 }">
            <div class="asd__member-head">
              <q-avatar size="28px" color="grey-3" text-color="grey-8">{{ m.name.charAt(0).toUpperCase() }}</q-avatar>
              <span class="asd__member-name">{{ m.name }}</span>
              <span v-if="m.status === 'invited'" class="asd__label">— esperando que acepte la invitación</span>
            </div>
            <div class="asd__perm-grid">
              <button
                v-for="p in OWF_PERMISSIONS"
                :key="p.id"
                class="asd__perm-btn"
                :class="{ 'asd__perm-btn--on': perms[m.user_id] === p.id }"
                :disabled="m.status === 'invited'"
                :title="p.desc"
                :style="permStyle(p, perms[m.user_id] === p.id)"
                @click="pick(m.user_id, p.id)"
              >
                <q-icon :name="p.icon" size="17px" />
                <span class="asd__perm-label">{{ p.id === 'none' ? 'Sin acceso' : p.badge }}</span>
              </button>
            </div>
            <p v-if="perms[m.user_id] !== 'none' && m.status !== 'invited'" class="asd__label asd__perm-desc">
              {{ owfPermission(perms[m.user_id]).desc }}
            </p>
          </div>
        </div>

        <div class="asd__footer">
          <p class="asd__label asd__footer-text">
            {{ grantedCount === 0 ? 'Nadie tiene acceso a esta cuenta.' : `${grantedCount} ${grantedCount === 1 ? 'persona con acceso' : 'personas con acceso'}. Podés cambiarlo o quitarlo cuando quieras.` }}
          </p>
          <q-btn flat rounded label="Cancelar" @click="close" />
          <q-btn unelevated rounded color="primary" label="Guardar acceso" :loading="saving" @click="onSave" />
        </div>
      </template>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';
import { useFamilyGroupStore } from 'stores/familyGroup';
import { OWF_PERMISSIONS, owfPermission, owfPermTint, type OwfPermissionId, type OwfPermissionDef } from 'src/utils/familyPermissions';

defineOptions({ name: 'AccountShareDialog' });

const props = defineProps<{
  modelValue: boolean;
  account: { id: number; name: string } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const store = useFamilyGroupStore();

const loading = ref(false);
const saving = ref(false);

interface ShareMember { user_id: number; name: string; status: 'active' | 'invited' }

const members = ref<ShareMember[]>([]);
const perms = ref<Record<number, OwfPermissionId>>({});
const originalPerms = ref<Record<number, OwfPermissionId>>({});
const ownerName = ref('Vos');

const ownerInitial = computed(() => (ownerName.value || 'V').charAt(0).toUpperCase());
const grantedCount = computed(() => Object.values(perms.value).filter((p) => p !== 'none').length);

function permStyle(p: OwfPermissionDef, on: boolean) {
  const tint = owfPermTint(p.weight, on);
  return {
    background: tint.background,
    color: tint.color,
    borderColor: on ? 'var(--brand-primary)' : 'var(--border-hairline)',
  };
}

function pick(userId: number, permId: OwfPermissionId) {
  perms.value = { ...perms.value, [userId]: permId };
}

function close() {
  emit('update:modelValue', false);
}

function goToFamilyGroup() {
  close();
  void router.push('/user/config');
}

async function load() {
  if (!props.account) return;
  loading.value = true;
  try {
    const [groups, accountRes] = await Promise.all([
      store.fetchGroups(),
      api.get(`/accounts/${props.account.id}`),
    ]);

    const myId = auth.user?.id;
    const dedup = new Map<number, ShareMember>();
    for (const group of groups) {
      for (const m of group.members) {
        if (m.user_id === myId) continue;
        if (!dedup.has(m.user_id) || m.status === 'active') {
          dedup.set(m.user_id, { user_id: m.user_id, name: m.user?.name ?? 'Miembro', status: m.status });
        }
      }
    }
    members.value = Array.from(dedup.values());

    type PivotUser = { id: number; name: string; is_owner?: number | boolean; permission?: OwfPermissionId | null };
    const accountData = accountRes.data?.data;
    const users: PivotUser[] = Array.isArray(accountData?.users) ? accountData.users : [];
    const owner = users.find((u) => Number(u.is_owner) === 1);
    ownerName.value = owner?.name ?? auth.user?.name ?? 'Vos';

    const initial: Record<number, OwfPermissionId> = {};
    for (const m of members.value) {
      const existing = users.find((u) => u.id === m.user_id && !u.is_owner);
      initial[m.user_id] = (existing?.permission as OwfPermissionId) ?? 'none';
    }
    perms.value = initial;
    originalPerms.value = { ...initial };
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar la información de compartir' });
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  if (!props.account) return;
  saving.value = true;
  try {
    const accountId = props.account.id;
    const ops: Promise<unknown>[] = [];
    for (const [uidStr, permission] of Object.entries(perms.value)) {
      const userId = Number(uidStr);
      const before = originalPerms.value[userId] ?? 'none';
      if (before === permission) continue;
      if (permission === 'none') {
        if (before !== 'none') ops.push(store.unshareAccount(accountId, userId));
      } else {
        ops.push(store.shareAccount(accountId, userId, permission));
      }
    }
    await Promise.all(ops);
    $q.notify({ type: 'positive', message: 'Acceso actualizado' });
    emit('saved');
    close();
  } catch (e: unknown) {
    const msg = (e as { api?: { message?: string } })?.api?.message ?? 'No se pudo guardar el acceso';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.modelValue, props.account?.id],
  ([open]) => {
    if (open) void load();
  },
);
</script>

<style scoped>
.asd { background: var(--surface-1); border-radius: var(--radius-lg); box-shadow: var(--shadow-float); padding: 26px; width: 560px; max-width: 92vw; }
.asd__header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
.asd__header-text { min-width: 0; flex: 1; }
.asd__title { font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--fg-1); }
.asd__label { font-family: var(--font-body); font-size: 13px; color: var(--fg-2); margin-top: 3px; }
.asd__close { border: 0; background: transparent; cursor: pointer; color: var(--fg-2); display: flex; padding: 2px; }

.asd__empty { display: flex; gap: 14px; padding: 18px; border-radius: var(--radius-lg); background: var(--surface-2); }
.asd__empty-text { min-width: 0; }
.asd__empty-title { font-family: var(--font-body); font-weight: 600; font-size: 14px; color: var(--fg-1); }
.asd__empty-desc { font-size: 12.5px; line-height: 1.55; margin: 6px 0 14px; }

.asd__owner { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-lg); background: var(--surface-2); margin-bottom: 16px; }
.asd__owner-text { flex: 1; min-width: 0; font-family: var(--font-body); font-size: 13.5px; color: var(--fg-1); }
.asd__owner-role { color: var(--fg-2); }

.asd__members { display: flex; flex-direction: column; gap: 16px; }
.asd__member-head { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.asd__member-name { font-family: var(--font-body); font-weight: 600; font-size: 14px; color: var(--fg-1); }
.asd__perm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.asd__perm-btn {
  display: flex; flex-direction: column; align-items: flex-start; gap: 5px;
  border: 1px solid var(--border-hairline); border-radius: 12px; padding: 10px 11px;
  cursor: pointer; text-align: left; transition: background 140ms, border-color 140ms;
  font-family: inherit;
}
.asd__perm-btn:disabled { cursor: default; }
.asd__perm-label { font-family: var(--font-body); font-weight: 600; font-size: 11.5px; line-height: 1.25; }
.asd__perm-desc { font-size: 12.5px; line-height: 1.5; margin-top: 8px; }

.asd__footer { display: flex; align-items: center; gap: 12px; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--border-hairline); }
.asd__footer-text { flex: 1; font-size: 12.5px; line-height: 1.45; margin: 0; }
</style>
