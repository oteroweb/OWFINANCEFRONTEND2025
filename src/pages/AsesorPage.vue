<template>
  <q-page class="flex column asesor-page">
    <!-- Header -->
    <q-toolbar class="bg-primary text-white">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <q-avatar size="32px" class="q-mr-sm">
        <q-icon name="smart_toy" color="white" />
      </q-avatar>
      <q-toolbar-title>Asesor IA</q-toolbar-title>
      <q-btn flat round icon="refresh" :disable="isStreaming" @click="clearConversation" />
    </q-toolbar>

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
import { ref, watch, nextTick } from 'vue'
import { useAiChat } from 'src/composables/useAiChat'
import type { QScrollArea } from 'quasar'

const { messages, error, isStreaming, sendMessage, clearConversation, retry } = useAiChat()
const inputText = ref('')
const scrollArea = ref<QScrollArea | null>(null)

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
