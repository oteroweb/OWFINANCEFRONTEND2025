<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">🎤 Registrar por Voz</q-card-section>

      <q-card-section class="text-center">
        <!-- Recording state -->
        <div v-if="!result">
          <!-- Waveform while recording, button otherwise -->
          <div v-if="isRecording" class="waveform-container q-mb-sm" @click="stopRecording">
            <span v-for="n in 4" :key="n" :class="`bar bar-${n}`" />
          </div>
          <q-btn
            v-else
            round
            size="xl"
            color="primary"
            icon="mic"
            @click="startRecording"
          />

          <!-- Recording timer -->
          <p v-if="isRecording" class="text-caption text-negative q-mt-xs">
            {{ timerDisplay }} / 0:30 — toca para parar
          </p>
          <p v-else class="q-mt-md text-body2 text-grey-7">Toca para hablar</p>

          <p v-if="transcript" class="text-body1 q-mt-sm">"{{ transcript }}"</p>

          <!-- Analyzing skeleton -->
          <div v-if="aiLoading" class="q-mt-md">
            <q-skeleton type="text" width="60%" class="q-mx-auto" />
            <q-skeleton type="text" width="40%" class="q-mx-auto q-mt-xs" />
            <p class="text-body2 text-grey-7 q-mt-xs">Analizando...</p>
          </div>
        </div>

        <!-- Extraction result confirmation -->
        <div v-if="result">
          <q-icon name="check_circle" color="positive" size="3rem" />
          <p class="text-h6 q-mt-sm">¿Confirmas esta transacción?</p>

          <!-- Low confidence warning -->
          <q-banner
            v-if="(result.data.confidence ?? 1) < 0.7"
            dense
            class="bg-orange-2 text-orange-9 q-mb-sm"
            rounded
          >
            <template #avatar>
              <q-icon name="warning" color="orange" />
            </template>
            Baja confianza — verifica los datos
          </q-banner>

          <q-list bordered rounded class="q-mt-md text-left">
            <q-item>
              <q-item-section>
                <q-item-label caption>Tipo</q-item-label>
                <q-item-label>{{ typeLabel }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Monto</q-item-label>
                <q-item-label>{{ result.data.currency }} {{ result.data.amount?.toFixed(2) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="result.data.description">
              <q-item-section>
                <q-item-label caption>Descripción</q-item-label>
                <q-item-label>{{ result.data.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <p class="text-caption text-grey-6 q-mt-xs">
            Confianza: {{ Math.round((result.data.confidence ?? 0) * 100) }}%
          </p>
        </div>

        <p v-if="voiceError || aiError" class="text-negative q-mt-sm">
          {{ voiceError || aiError }}
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="handleCancel" />
        <q-btn
          v-if="result"
          color="primary"
          label="Confirmar"
          @click="handleConfirm"
        />
        <q-btn
          v-if="!result && !isRecording && transcript"
          color="secondary"
          label="Reintentar IA"
          :loading="aiLoading"
          @click="runExtraction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useVoiceInput } from 'src/composables/useVoiceInput'
import { useAiExtraction, type ExtractionResult } from 'src/composables/useAiExtraction'

const MAX_RECORDING_SECONDS = 30

const open = defineModel<boolean>('modelValue', { default: false })
const emit = defineEmits<{ extracted: [result: ExtractionResult] }>()

const { transcript, isRecording, error: voiceError, start, stop } = useVoiceInput()
const { loading: aiLoading, error: aiError, extractFromText } = useAiExtraction()
const result = ref<ExtractionResult | null>(null)

// Timer
const elapsedSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const timerDisplay = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

function startTimer() {
  elapsedSeconds.value = 0
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    if (elapsedSeconds.value >= MAX_RECORDING_SECONDS) {
      stopRecording()
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onUnmounted(stopTimer)

const typeLabel = computed(() => {
  const map: Record<string, string> = { expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia' }
  return map[result.value?.data.type ?? ''] ?? 'Desconocido'
})

function startRecording() {
  result.value = null
  navigator.vibrate?.(50)
  start()
  startTimer()
}

function stopRecording() {
  navigator.vibrate?.(50)
  stop()
  stopTimer()
  setTimeout(() => {
    if (transcript.value) void runExtraction()
  }, 300)
}

async function runExtraction() {
  if (!transcript.value) return
  result.value = await extractFromText('voice', transcript.value)
}

function handleConfirm() {
  if (result.value) {
    emit('extracted', result.value)
    open.value = false
  }
}

function handleCancel() {
  stop()
  stopTimer()
  result.value = null
  open.value = false
}
</script>

<style scoped>
/* Waveform animation */
.waveform-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 56px;
  cursor: pointer;
}

.bar {
  display: inline-block;
  width: 6px;
  border-radius: 3px;
  background: var(--q-negative, #c10015);
  animation: bounce 0.8s ease-in-out infinite;
}

.bar-1 { height: 20px; animation-delay: 0s; }
.bar-2 { height: 35px; animation-delay: 0.15s; }
.bar-3 { height: 28px; animation-delay: 0.3s; }
.bar-4 { height: 16px; animation-delay: 0.45s; }

@keyframes bounce {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.8); }
}
</style>
