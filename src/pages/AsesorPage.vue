<template>
  <q-page class="flex column asesor-page">
    <!-- Header -->
    <q-toolbar class="bg-primary text-white">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <q-avatar size="32px" class="q-mr-sm">
        <q-icon name="smart_toy" color="white" />
      </q-avatar>
      <q-toolbar-title>{{ aiSettings.advisor_name || 'Asesor IA' }}</q-toolbar-title>
      <q-btn flat round icon="refresh" :disable="isStreaming" @click="clearConversation" />
      <q-btn flat round icon="tune" @click="showSettings = true" />
    </q-toolbar>

    <!-- Settings dialog -->
    <q-dialog v-model="showSettings" position="bottom">
      <q-card style="width: 100%; max-width: 480px; border-radius: 20px 20px 0 0;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Configurar Asesor IA</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="settingsForm.advisor_name"
            label="Nombre del asesor"
            outlined
            dense
            :maxlength="60"
            hint="Cómo se llamará tu asesor"
          />

          <div>
            <div class="text-caption text-grey-7 q-mb-xs">Personalidad</div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="p in personalities"
                :key="p.value"
                :label="p.label"
                :icon="p.icon"
                unelevated
                :color="settingsForm.advisor_personality === p.value ? 'primary' : 'grey-3'"
                :text-color="settingsForm.advisor_personality === p.value ? 'white' : 'dark'"
                size="sm"
                @click="settingsForm.advisor_personality = p.value"
              />
            </div>
            <div class="text-caption text-grey-5 q-mt-xs">{{ personalityDesc }}</div>
          </div>

          <q-toggle
            v-model="settingsForm.advisor_enabled"
            label="Asesor activado"
            color="primary"
          />
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            label="Guardar"
            color="primary"
            unelevated
            class="full-width"
            :loading="savingSettings"
            @click="saveSettings"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Messages area -->
    <q-scroll-area ref="scrollArea" class="col asesor-scroll">
      <div class="q-pa-md q-gutter-y-sm">
        <!-- Empty state -->
        <div v-if="messages.length === 0" class="text-center q-mt-xl">
          <q-icon name="smart_toy" size="4rem" color="grey-4" />
          <p class="text-h6 text-grey-6 q-mt-md">Hola, soy tu Asesor IA</p>
          <p class="text-body2 text-grey-5">Pregúntame sobre tus finanzas</p>
          <div class="q-mt-lg q-gutter-sm">
            <q-chip
              v-for="suggestion in suggestions"
              :key="suggestion"
              clickable
              color="primary"
              text-color="white"
              size="sm"
              @click="sendSuggestion(suggestion)"
            >{{ suggestion }}</q-chip>
          </div>
        </div>

        <!-- Message list -->
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['message-bubble', msg.role === 'user' ? 'user-msg' : 'assistant-msg']"
        >
          <q-avatar
            v-if="msg.role === 'assistant'"
            size="28px"
            class="q-mr-xs"
            color="primary"
            text-color="white"
          >
            <q-icon name="smart_toy" size="18px" />
          </q-avatar>
          <div class="bubble-content">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="formatMessage(msg.content)" />
            <!-- CSS typing animation while streaming -->
            <div
              v-if="msg.role === 'assistant' && !msg.content && isStreaming"
              class="typing-dots"
            >
              <span /><span /><span />
            </div>
            <!-- Message timestamp -->
            <div v-if="msg.created_at" class="text-caption text-grey-5 q-mt-xs">
              {{ timeAgo(msg.created_at) }}
            </div>
          </div>
          <!-- Copy button for assistant messages -->
          <q-btn
            v-if="msg.role === 'assistant' && msg.content"
            flat
            round
            dense
            size="xs"
            icon="content_copy"
            color="grey-5"
            class="copy-btn q-ml-xs"
            @click="copyMessage(msg.content)"
          />
        </div>
      </div>
    </q-scroll-area>

    <!-- Error banner -->
    <q-banner v-if="error" dense class="bg-negative text-white q-px-md">
      {{ error }}
      <template #action>
        <q-btn flat dense label="Reintentar" @click="retryLastMessage" />
        <q-btn flat dense label="OK" @click="error = null" />
      </template>
    </q-banner>

    <!-- Input area -->
    <div class="q-pa-sm bg-white asesor-input-bar">
      <div class="row items-center q-gutter-xs">
        <q-input
          v-model="inputText"
          outlined
          dense
          class="col"
          placeholder="Escribe tu pregunta..."
          :disable="isStreaming"
          @keyup.enter="handleSend"
        />
        <q-btn
          round
          color="primary"
          icon="send"
          :loading="isStreaming"
          :disable="!inputText.trim()"
          @click="handleSend"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useAiChat } from 'src/composables/useAiChat'
import { useQuasar } from 'quasar'
import type { QScrollArea } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const { messages, error, isStreaming, sendMessage, clearConversation, retry } = useAiChat()
const inputText = ref('')
const scrollArea = ref<QScrollArea | null>(null)

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

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
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
    scrollArea.value?.setScrollPercentage('vertical', 1)
  },
  { deep: true },
)
</script>

<style scoped>
.asesor-page {
  height: 100dvh;
}

.asesor-scroll {
  flex: 1;
}

.asesor-input-bar {
  border-top: 1px solid #e0e0e0;
}

.message-bubble {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}

.user-msg {
  flex-direction: row-reverse;
}

.bubble-content {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
}

.user-msg .bubble-content {
  background: #1976d2;
  color: white;
  border-bottom-right-radius: 4px;
}

.assistant-msg .bubble-content {
  background: #f5f5f5;
  color: #212121;
  border-bottom-left-radius: 4px;
}

/* CSS 3-dot typing animation */
.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.typing-dots span {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1976d2;
  animation: typing-bounce 1.2s ease-in-out infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Copy button — show on bubble hover */
.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .copy-btn {
  opacity: 1;
}
</style>
