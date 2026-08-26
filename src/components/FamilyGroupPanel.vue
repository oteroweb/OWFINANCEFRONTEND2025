<template>
  <div class="fgp">
    <!-- ── Sin grupos ─────────────────────────────────────────────────── -->
    <div v-if="!loading && groups.length === 0" class="fgp__card">
      <div class="fgp__head">
        <div class="fgp__head-icon">
          <q-icon name="group" size="22px" />
        </div>
        <div class="fgp__head-text">
          <div class="fgp__title">Grupo familiar</div>
          <div class="fgp__label">Compartir cuentas con quien vive tu economía.</div>
        </div>
      </div>

      <div class="fgp__empty">
        <q-icon name="group_add" size="34px" color="grey-5" />
        <div class="fgp__empty-title">Todavía no tenés un grupo familiar</div>
        <p class="fgp__label fgp__empty-desc">
          Creás el grupo, invitás a alguien por correo y esa persona acepta. Solo después de eso
          podés compartirle una cuenta, con el nivel de acceso que elijas.
        </p>

        <div v-if="view === 'create'" class="fgp__create-form">
          <div class="fgp__field">
            <span class="fgp__label">Nombre del grupo</span>
            <input v-model="createName" class="fgp__input" placeholder="Familia Otero" />
          </div>
          <div class="fgp__row-gap">
            <q-btn unelevated rounded color="primary" label="Crear grupo" :loading="creating" @click="onCreateGroup" />
            <q-btn flat rounded label="Cancelar" @click="view = 'list'" />
          </div>
        </div>
        <q-btn v-else unelevated rounded color="primary" icon="add" label="Crear grupo familiar" @click="view = 'create'" />
      </div>
    </div>

    <!-- ── Con grupo(s) ───────────────────────────────────────────────── -->
    <template v-else>
      <div v-for="group in groups" :key="group.id" class="fgp__card">
        <div class="fgp__head">
          <div class="fgp__head-icon">
            <q-icon name="group" size="22px" />
          </div>
          <div class="fgp__head-text">
            <div class="fgp__title">Grupo familiar</div>
            <div class="fgp__label">{{ group.name }} · {{ activeCount(group) }} {{ activeCount(group) === 1 ? 'miembro' : 'miembros' }}</div>
          </div>
        </div>

        <div class="fgp__members">
          <div v-for="(m, i) in group.members" :key="m.id" class="fgp__member" :class="{ 'fgp__member--first': i === 0 }">
            <q-avatar size="40px" color="grey-3" text-color="grey-8">{{ memberInitial(m) }}</q-avatar>
            <div class="fgp__member-text">
              <div class="fgp__member-row">
                <span class="fgp__member-name" :class="{ 'fgp__member-name--pending': m.status === 'invited' }">{{ memberName(m) }}</span>
                <span class="fgp__badge" :class="badgeClass(group, m)">{{ badgeLabel(group, m) }}</span>
              </div>
              <div class="fgp__label fgp__member-email">{{ memberEmail(m) }}</div>
            </div>
            <div v-if="m.status === 'invited'" class="fgp__row-gap">
              <q-btn size="sm" flat rounded label="Reenviar" @click="onResend(group, m)" />
              <q-btn size="sm" flat rounded color="negative" label="Cancelar" @click="onCancelInvite(group, m)" />
            </div>
          </div>
        </div>

        <div v-if="inviteGroupId === group.id" class="fgp__panel">
          <div class="fgp__field">
            <span class="fgp__label">Correo de la persona</span>
            <input v-model="inviteEmail" type="email" class="fgp__input fgp__input--surface1" placeholder="nombre@ejemplo.com" />
          </div>
          <p class="fgp__label fgp__hint">Recibe una invitación por correo. Hasta que la acepte no puede ver nada tuyo.</p>
          <div class="fgp__row-gap">
            <q-btn size="sm" unelevated rounded color="primary" label="Enviar invitación" :loading="inviting" @click="onSendInvite(group)" />
            <q-btn size="sm" flat rounded label="Cancelar" @click="inviteGroupId = null" />
          </div>
        </div>

        <div v-if="leaveGroupId === group.id" class="fgp__panel fgp__panel--danger">
          <div class="fgp__panel-title">Salir de {{ group.name }}</div>
          <p class="fgp__panel-desc">
            Dejás de ver las cuentas que te compartieron dentro de este grupo, y las cuentas que vos
            compartiste dejan de verse del otro lado. Tus movimientos y tus cuentas no se borran.
          </p>
          <div class="fgp__row-gap">
            <q-btn size="sm" unelevated rounded color="negative" label="Salir del grupo" :loading="leaving" @click="onLeaveGroup(group)" />
            <q-btn size="sm" flat rounded label="Quedarme" @click="leaveGroupId = null" />
          </div>
        </div>

        <div class="fgp__footer">
          <q-btn unelevated rounded color="primary" icon="person_add" label="Invitar a alguien" @click="toggleInvite(group)" />
          <q-space />
          <q-btn flat rounded label="Salir del grupo" @click="toggleLeave(group)" />
        </div>
      </div>

      <!-- Crear otro grupo (un usuario puede pertenecer a varios) -->
      <div v-if="view === 'create'" class="fgp__card">
        <div class="fgp__field">
          <span class="fgp__label">Nombre del nuevo grupo</span>
          <input v-model="createName" class="fgp__input" placeholder="Familia de mis padres" />
        </div>
        <div class="fgp__row-gap" style="margin-top: 12px">
          <q-btn unelevated rounded color="primary" label="Crear grupo" :loading="creating" @click="onCreateGroup" />
          <q-btn flat rounded label="Cancelar" @click="view = 'list'" />
        </div>
      </div>
      <div v-else class="fgp__add-more">
        <q-btn flat rounded icon="add" label="Crear otro grupo familiar" @click="view = 'create'" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';
import { useFamilyGroupStore, type FamilyGroup, type FamilyGroupMember } from 'stores/familyGroup';

defineOptions({ name: 'FamilyGroupPanel' });

const $q = useQuasar();
const auth = useAuthStore();
const store = useFamilyGroupStore();

const loading = ref(false);
const view = ref<'list' | 'create'>('list');
const createName = ref('');
const creating = ref(false);

const inviteGroupId = ref<number | null>(null);
const inviteEmail = ref('');
const inviting = ref(false);

const leaveGroupId = ref<number | null>(null);
const leaving = ref(false);

const groups = ref<FamilyGroup[]>([]);

async function reload() {
  loading.value = true;
  try {
    groups.value = await store.fetchGroups();
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar tu grupo familiar' });
  } finally {
    loading.value = false;
  }
}

function activeCount(group: FamilyGroup) {
  return group.members.filter((m) => m.status === 'active').length;
}

function memberName(m: FamilyGroupMember) {
  return m.user?.name ?? 'Miembro';
}

function memberEmail(m: FamilyGroupMember) {
  return m.user?.email ?? '';
}

function memberInitial(m: FamilyGroupMember) {
  return (m.user?.name || '?').charAt(0).toUpperCase();
}

function isYou(m: FamilyGroupMember) {
  return m.user_id === auth.user?.id;
}

function badgeLabel(group: FamilyGroup, m: FamilyGroupMember) {
  if (m.status === 'invited') return 'Invitación enviada';
  return isYou(m) ? 'Vos' : 'Miembro';
}

function badgeClass(group: FamilyGroup, m: FamilyGroupMember) {
  if (m.status === 'invited') return 'fgp__badge--pending';
  return isYou(m) ? 'fgp__badge--you' : 'fgp__badge--member';
}

async function onCreateGroup() {
  if (!createName.value.trim()) return;
  creating.value = true;
  try {
    await store.createGroup(createName.value.trim());
    createName.value = '';
    view.value = 'list';
    await reload();
    $q.notify({ type: 'positive', message: 'Grupo familiar creado' });
  } catch (e: unknown) {
    const msg = (e as { api?: { message?: string } })?.api?.message ?? 'No se pudo crear el grupo';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    creating.value = false;
  }
}

function toggleInvite(group: FamilyGroup) {
  inviteGroupId.value = inviteGroupId.value === group.id ? null : group.id;
  inviteEmail.value = '';
}

async function onSendInvite(group: FamilyGroup) {
  if (!inviteEmail.value.trim()) return;
  inviting.value = true;
  try {
    await store.inviteToGroup(group.id, inviteEmail.value.trim());
    inviteGroupId.value = null;
    inviteEmail.value = '';
    await reload();
    $q.notify({ type: 'positive', message: 'Invitación enviada' });
  } catch (e: unknown) {
    const msg = (e as { api?: { message?: string } })?.api?.message ?? 'No se pudo enviar la invitación';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    inviting.value = false;
  }
}

function onResend(group: FamilyGroup, m: FamilyGroupMember) {
  // Backend no expone reenviar como acción separada — re-invita al mismo correo.
  if (!m.user?.email) return;
  void store.inviteToGroup(group.id, m.user.email)
    .then(() => $q.notify({ type: 'positive', message: 'Invitación reenviada' }))
    .catch(() => $q.notify({ type: 'negative', message: 'No se pudo reenviar la invitación' }));
}

function onCancelInvite(group: FamilyGroup, m: FamilyGroupMember) {
  $q.dialog({
    title: 'Cancelar invitación',
    message: `¿Cancelar la invitación a ${memberName(m)}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void store.removeMember(group.id, m.user_id)
      .then(() => reload())
      .then(() => $q.notify({ type: 'positive', message: 'Invitación cancelada' }))
      .catch(() => $q.notify({ type: 'negative', message: 'No se pudo cancelar la invitación' }));
  });
}

function toggleLeave(group: FamilyGroup) {
  leaveGroupId.value = leaveGroupId.value === group.id ? null : group.id;
}

async function onLeaveGroup(group: FamilyGroup) {
  if (!auth.user?.id) return;
  leaving.value = true;
  try {
    await store.leaveGroup(group.id, auth.user.id);
    leaveGroupId.value = null;
    await reload();
    $q.notify({ type: 'positive', message: 'Saliste del grupo familiar' });
  } catch (e: unknown) {
    const msg = (e as { api?: { message?: string } })?.api?.message ?? 'No se pudo salir del grupo';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    leaving.value = false;
  }
}

onMounted(reload);
</script>

<style scoped>
.fgp { display: flex; flex-direction: column; gap: 16px; max-width: 620px; }
.fgp__card { background: var(--surface-1); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 28px; }
.fgp__head { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.fgp__head-icon {
  width: 42px; height: 42px; border-radius: var(--radius-pill);
  background: var(--brand-primary-soft); color: var(--brand-primary-fg-soft);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.fgp__head-text { min-width: 0; }
.fgp__title { font-family: var(--font-display); font-weight: 700; font-size: 19px; color: var(--fg-1); }
.fgp__label { font-family: var(--font-body); font-size: 13px; color: var(--fg-2); margin-top: 2px; }

.fgp__empty { border: 1px dashed var(--border-hairline); border-radius: var(--radius-lg); padding: 34px 28px; text-align: center; }
.fgp__empty-title { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--fg-1); margin-top: 12px; }
.fgp__empty-desc { max-width: 380px; margin: 8px auto 20px; line-height: 1.55; }
.fgp__create-form { display: flex; flex-direction: column; gap: 12px; max-width: 340px; margin: 0 auto; text-align: left; }

.fgp__field { display: flex; flex-direction: column; gap: 6px; }
.fgp__input {
  width: 100%; border: 1px solid var(--border-hairline); border-radius: 12px;
  background: var(--surface-2); color: var(--fg-1); padding: 12px 14px;
  font-family: var(--font-body); font-size: 14px; outline: none; box-sizing: border-box;
}
.fgp__input--surface1 { background: var(--surface-1); }
.fgp__row-gap { display: flex; gap: 10px; align-items: center; }

.fgp__members { display: flex; flex-direction: column; }
.fgp__member { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid var(--border-hairline); }
.fgp__member--first { border-top: none; }
.fgp__member-text { flex: 1; min-width: 0; }
.fgp__member-row { display: flex; align-items: center; gap: 8px; }
.fgp__member-name { font-family: var(--font-body); font-weight: 600; font-size: 14.5px; color: var(--fg-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fgp__member-name--pending { color: var(--fg-2); }
.fgp__member-email { font-size: 12.5px; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fgp__badge {
  font-family: var(--font-body); font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: var(--radius-pill);
}
.fgp__badge--pending { background: var(--warning-soft); color: var(--warning-fg); }
.fgp__badge--you { background: var(--brand-primary-soft); color: var(--brand-primary-fg-soft); }
.fgp__badge--member { background: var(--surface-2); color: var(--fg-2); }

.fgp__panel { margin-top: 18px; padding: 18px; border-radius: var(--radius-lg); background: var(--surface-2); display: flex; flex-direction: column; gap: 12px; }
.fgp__panel--danger { background: var(--expense-soft); gap: 10px; }
.fgp__panel-title { font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--expense-fg); }
.fgp__panel-desc { font-family: var(--font-body); font-size: 13px; line-height: 1.55; color: var(--expense-fg); margin: 0; }
.fgp__hint { font-size: 12.5px; line-height: 1.5; }

.fgp__footer { display: flex; align-items: center; gap: 10px; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--border-hairline); }
.fgp__add-more { display: flex; justify-content: center; }
</style>
