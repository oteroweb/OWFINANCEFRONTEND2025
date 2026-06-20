<template>
  <div class="ai-chat">
    <!-- Header -->
    <div class="ai-chat__header">
      <button class="ai-chat__back" @click="$router.back()">
        <q-icon name="arrow_back" size="20px" />
      </button>
      <div class="ai-chat__header-avatar">
        <q-icon name="smart_toy" size="20px" />
      </div>
      <div class="ai-chat__header-info">
        <span class="ai-chat__header-name">{{ aiSettings.advisor_name || 'Asesor IA' }}</span>
        <span class="ai-chat__header-status" :class="{ 'ai-chat__header-status--live': isStreaming }">
          {{ isStreaming ? 'escribiendo…' : 'en línea' }}
        </span>
      </div>
      <button class="ai-chat__icon-btn" :disabled="isStreaming" @click="clearConversation">
        <q-icon name="refresh" size="20px" />
      </button>
      <button class="ai-chat__icon-btn" @click="showSettings = true">
        <q-icon name="tune" size="20px" />
      </button>
    </div>

    <!-- Settings bottom-sheet -->
    <q-dialog v-model="showSettings" position="bottom">
      <div class="ai-settings-sheet">
        <div class="ai-settings-sheet__handle" />
        <div class="ai-settings-sheet__header">
          <span class="ai-settings-sheet__title">Configurar asesor</span>
          <button class="ai-chat__icon-btn" @click="showSettings = false">
            <q-icon name="close" size="20px" />
          </button>
        </div>
        <div class="ai-settings-sheet__body">
          <div class="ai-settings-field">
            <label class="ai-settings-label">Nombre del asesor</label>
            <div class="input-shell">
              <span class="material-icons">smart_toy</span>
              <input v-model="settingsForm.advisor_name" type="text" maxlength="60" placeholder="Asesor IA" />
            </div>
          </div>
          <div class="ai-settings-field">
            <label class="ai-settings-label">Personalidad</label>
            <div class="ai-personality-row">
              <button
                v-for="p in personalities"
                :key="p.value"
                class="ai-personality-btn"
                :class="{ 'ai-personality-btn--active': settingsForm.advisor_personality === p.value }"
                @click="settingsForm.advisor_personality = p.value"
              >
                <q-icon :name="p.icon" size="16px" />
                {{ p.label }}
              </button>
            </div>
            <span class="ai-settings-hint">{{ personalityDesc }}</span>
          </div>
          <div class="ai-settings-toggle-row">
            <span class="ai-settings-label">Asesor activado</span>
            <q-toggle v-model="settingsForm.advisor_enabled" color="primary" />
          </div>
        </div>
        <div class="ai-settings-sheet__footer">
          <button class="ai-save-btn" :disabled="savingSettings" @click="saveSettings">
            {{ savingSettings ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </q-dialog>

    <!-- Messages -->
    <div ref="scrollArea" class="ai-chat__messages">

      <!-- Empty state -->
      <div v-if="messages.length === 0" class="ai-chat__empty">
        <div class="ai-chat__empty-avatar">
          <q-icon name="smart_toy" size="28px" />
        </div>
        <p class="ai-chat__empty-title">Hola, soy {{ aiSettings.advisor_name || 'tu Asesor IA' }}</p>
        <p class="ai-chat__empty-sub">Pregúntame sobre tus finanzas. Estoy aquí para ayudarte.</p>
        <div class="ai-chat__suggestions">
          <button
            v-for="s in suggestions"
            :key="s"
            class="ai-chat__suggestion"
            @click="sendSuggestion(s)"
          >{{ s }}</button>
        </div>
      </div>

      <!-- Message list -->
      <div v-for="(msg, i) in messages" :key="i" class="ai-chat__row" :class="msg.role === 'user' ? 'ai-chat__row--user' : 'ai-chat__row--ai'">
        <div v-if="msg.role === 'assistant'" class="ai-chat__ai-avatar">
          <q-icon name="smart_toy" size="16px" />
        </div>
        <div class="ai-chat__bubble-wrap">
          <div class="ai-chat__bubble">
            <!-- Typing indicator -->
            <div v-if="msg.role === 'assistant' && !msg.content && isStreaming" class="ai-typing">
              <span /><span /><span />
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-else v-html="formatMessageBody(msg.content)" />
          </div>
          <!-- CTA pills below AI bubble -->
          <div v-if="msg.role === 'assistant' && parseCta(msg.content)" class="ai-chat__ctas">
            <button class="ai-cta-pill" @click="sendSuggestion(parseCta(msg.content) ?? '')">
              {{ parseCta(msg.content) }}
            </button>
          </div>
          <span v-if="msg.created_at" class="ai-chat__time">{{ timeAgo(msg.created_at) }}</span>
        </div>
        <button
          v-if="msg.role === 'assistant' && msg.content"
          class="ai-chat__copy"
          @click="copyMessage(msg.content)"
        >
          <q-icon name="content_copy" size="14px" />
        </button>
      </div>
    </div>

    <!-- Error bar -->
    <div v-if="error" class="ai-chat__error">
      <q-icon name="error_outline" size="16px" />
      {{ error }}
      <button @click="retryLastMessage">Reintentar</button>
      <button @click="error = null">OK</button>
    </div>

    <!-- Input -->
    <div class="ai-chat__input-bar">
      <div class="ai-chat__input-wrap">
        <input
          v-model="inputText"
          class="ai-chat__input"
          type="text"
          placeholder="Escribe tu pregunta…"
          :disabled="isStreaming"
          @keyup.enter="handleSend"
        />
        <button
          class="ai-chat__send"
          :class="{ 'ai-chat__send--active': inputText.trim() }"
          :disabled="!inputText.trim() || isStreaming"
          @click="handleSend"
        >
          <q-icon name="send" size="18px" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useAiChat } from 'src/composables/useAiChat'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const { messages, error, isStreaming, sendMessage, clearConversation, retry } = useAiChat()
const inputText = ref('')
const scrollArea = ref<HTMLElement | null>(null)

// ── AI Settings ──────────────────────────────────────────────────────────────
interface AiSettings {
  advisor_name: string
  advisor_personality: 'formal' | 'friendly' | 'coach'
  advisor_enabled: boolean
}

const showSettings = ref(false)
const savingSettings = ref(false)
const aiSettings = ref<AiSettings>({ advisor_name: 'Asesor IA', advisor_personality: 'friendly', advisor_enabled: true })
const settingsForm = ref<AiSettings>({ advisor_name: 'Asesor IA', advisor_personality: 'friendly', advisor_enabled: true })

const personalities = [
  { value: 'friendly', label: 'Amigable', icon: 'emoji_emotions' },
  { value: 'formal',   label: 'Formal',   icon: 'business_center' },
  { value: 'coach',    label: 'Coach',    icon: 'fitness_center' },
] as const

const personalityDesc = computed(() => {
  const map: Record<string, string> = {
    friendly: 'Cálido, directo y empático.',
    formal:   'Profesional y preciso, sin rodeos.',
    coach:    'Te reta y motiva a mejorar.',
  }
  return map[settingsForm.value.advisor_personality] ?? ''
})

watch(showSettings, (open) => {
  if (open) settingsForm.value = { ...aiSettings.value }
})

async function loadSettings() {
  try {
    const res = await api.get('/user/financial-profile')
    const d = res.data?.data
    if (d) {
      aiSettings.value = {
        advisor_name:        d.advisor_name        ?? 'Asesor IA',
        advisor_personality: d.advisor_personality ?? 'friendly',
        advisor_enabled:     d.advisor_enabled     ?? true,
      }
    }
  } catch { /* silencioso */ }
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await api.put('/user/financial-profile', {
      advisor_name:        settingsForm.value.advisor_name,
      advisor_personality: settingsForm.value.advisor_personality,
      advisor_enabled:     settingsForm.value.advisor_enabled,
    })
    aiSettings.value = { ...settingsForm.value }
    showSettings.value = false
    $q.notify({ type: 'positive', message: 'Configuración guardada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' })
  } finally {
    savingSettings.value = false
  }
}

onMounted(loadSettings)

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  return `hace ${Math.floor(diffH / 24)}d`
}

function copyMessage(content: string) {
  void navigator.clipboard.writeText(content)
}

async function retryLastMessage() {
  error.value = null
  await retry()
}

const suggestions = [
  '¿Cuánto gasté este mes?',
  '¿Cómo está mi balance?',
  '¿En qué categoría gasto más?',
  'Dame un resumen financiero',
]

function parseCta(text: string): string | null {
  const match = /\[CTA:\s*(.+?)\]/.exec(text)
  return match ? (match[1] ?? null) : null
}

function formatMessageBody(text: string): string {
  return text
    .replace(/\[CTA:[^\]]*\]/g, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .trim()
}

async function handleSend() {
  if (!inputText.value.trim() || isStreaming.value) return
  const text = inputText.value.trim()
  inputText.value = ''
  await sendMessage(text)
}

function sendSuggestion(text: string) {
  inputText.value = text
  void handleSend()
}

// Auto-scroll on new messages
watch(
  messages,
  async () => {
    await nextTick()
    if (scrollArea.value) {
      scrollArea.value.scrollTop = scrollArea.value.scrollHeight
    }
  },
  { deep: true },
)
</script>

<style scoped lang="scss">
/* ── Chat shell ── */
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--bg-canvas);
  overflow: hidden;
}

/* ── Header ── */
.ai-chat__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  height: 58px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-hairline);
  flex-shrink: 0;
}

.ai-chat__back {
  border: none; background: transparent; cursor: pointer;
  color: var(--fg-2); padding: 6px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  &:hover { background: var(--surface-2); color: var(--fg-1); }
}

.ai-chat__header-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #0EA5E9 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}

.ai-chat__header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ai-chat__header-name {
  font-family: var(--font-display, sans-serif);
  font-size: 14.5px;
  font-weight: 700;
  color: var(--fg-1);
}

.ai-chat__header-status {
  font-size: 11px;
  color: var(--fg-3);
  &--live { color: var(--income-fg); }
}

.ai-chat__icon-btn {
  border: none; background: transparent; cursor: pointer;
  color: var(--fg-3); padding: 8px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  &:hover { background: var(--surface-2); color: var(--fg-1); }
  &:disabled { opacity: 0.4; cursor: default; }
}

/* ── Messages ── */
.ai-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Empty state */
.ai-chat__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  text-align: center;
  margin: auto;
}

.ai-chat__empty-avatar {
  width: 54px; height: 54px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #0EA5E9 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}

.ai-chat__empty-title {
  font-family: var(--font-display, sans-serif);
  font-size: 17px; font-weight: 700; color: var(--fg-1); margin: 0;
}

.ai-chat__empty-sub {
  font-size: 13.5px; color: var(--fg-2); margin: 0; max-width: 260px;
}

.ai-chat__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.ai-chat__suggestion {
  border: 1.5px solid var(--border-hairline);
  background: var(--surface-1);
  border-radius: var(--radius-pill);
  padding: 8px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-primary);
  cursor: pointer;
  transition: background 150ms;
  &:hover { background: var(--surface-2); }
}

/* Message rows */
.ai-chat__row {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  &--user { flex-direction: row-reverse; }
}

.ai-chat__ai-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #0EA5E9 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.ai-chat__bubble-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 78%;
}

.ai-chat__bubble {
  padding: 11px 15px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.55;

  .ai-chat__row--user & {
    background: var(--brand-primary);
    color: #fff;
    border-bottom-right-radius: 5px;
  }

  .ai-chat__row--ai & {
    background: var(--surface-1);
    color: var(--fg-1);
    border-bottom-left-radius: 5px;
    box-shadow: var(--shadow-card);
  }
}

.ai-chat__time {
  font-size: 10.5px;
  color: var(--fg-3);
  padding: 0 4px;
}

.ai-chat__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-cta-pill {
  border: 1.5px solid var(--brand-primary);
  background: transparent;
  border-radius: var(--radius-pill);
  padding: 6px 14px;
  font-family: var(--font-body, sans-serif);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand-primary);
  cursor: pointer;
  transition: background 150ms;
  &:hover { background: color-mix(in srgb, var(--brand-primary) 10%, transparent); }
}

.ai-chat__copy {
  border: none; background: transparent; cursor: pointer;
  color: var(--fg-3); padding: 4px; border-radius: var(--radius-sm);
  opacity: 0; transition: opacity 150ms;
  align-self: center;
  .ai-chat__row:hover & { opacity: 1; }
}

/* Typing dots */
.ai-typing {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;

  span {
    display: inline-block;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--brand-primary);
    animation: ai-bounce 1.2s ease-in-out infinite;
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes ai-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.45; }
  40%            { transform: scale(1);   opacity: 1; }
}

/* ── Error bar ── */
.ai-chat__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--expense-soft);
  color: var(--expense-fg);
  font-size: 13px;
  flex-shrink: 0;

  button {
    border: none; background: transparent; cursor: pointer;
    font-weight: 700; color: inherit; font-size: 12px;
    text-decoration: underline; padding: 0;
  }
}

/* ── Input bar ── */
.ai-chat__input-bar {
  padding: 10px 12px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  background: var(--surface-1);
  border-top: 1px solid var(--border-hairline);
  flex-shrink: 0;
}

.ai-chat__input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
  padding: 0 6px 0 16px;
}

.ai-chat__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--fg-1);
  padding: 12px 0;
  &::placeholder { color: var(--fg-3); }
  &:disabled { opacity: 0.6; }
}

.ai-chat__send {
  width: 38px; height: 38px; border-radius: 50%;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: var(--surface-2);
  color: var(--fg-3);
  transition: background 150ms, color 150ms;

  &--active {
    background: var(--brand-primary);
    color: #fff;
  }

  &:disabled { opacity: 0.4; cursor: default; }
}

/* ── Settings sheet ── */
.ai-settings-sheet {
  background: var(--surface-1);
  border-radius: 22px 22px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);

  &__handle {
    width: 36px; height: 4px; border-radius: 2px;
    background: var(--border-hairline);
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-hairline);
  }

  &__title {
    font-family: var(--font-display, sans-serif);
    font-size: 17px;
    font-weight: 700;
    color: var(--fg-1);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  &__footer {
    padding: 12px 20px 20px;
  }
}

.ai-settings-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-settings-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--fg-2);
  text-transform: uppercase;
  letter-spacing: .05em;
}

.ai-settings-hint { font-size: 12px; color: var(--fg-3); }

.ai-settings-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-personality-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-personality-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-hairline);
  background: var(--surface-2);
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-2);
  cursor: pointer;
  transition: all 150ms;

  &--active {
    border-color: var(--brand-primary);
    background: color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1));
    color: var(--brand-primary);
  }
}

.ai-save-btn {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-pill);
  border: none;
  background: var(--brand-primary);
  color: #fff;
  font-family: var(--font-body, sans-serif);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms;
  &:hover { background: var(--brand-primary-dark, #1D4ED8); }
  &:disabled { opacity: 0.6; cursor: default; }
}

/* Shared input shell */
.input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  border: 1px solid var(--border-hairline);

  .material-icons { color: var(--fg-3); font-size: 18px; }

  input {
    flex: 1; border: none; background: transparent; outline: none;
    font-family: var(--font-body, sans-serif);
    font-size: 14px; color: var(--fg-1);
    &::placeholder { color: var(--fg-3); }
  }
}
</style>
