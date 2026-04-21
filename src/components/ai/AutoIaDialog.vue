<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">🤖 Auto IA</q-card-section>

      <q-card-section>
        <p class="text-body2 text-grey-7">Describe la transacción en lenguaje natural:</p>

        <!-- Suggestion chips -->
        <div class="q-mb-sm q-gutter-xs">
          <q-chip
            v-for="chip in suggestionChips"
            :key="chip"
            clickable
            color="grey-3"
            text-color="grey-8"
            size="sm"
            @click="userInput = chip"
          >{{ chip }}</q-chip>
        </div>

        <q-input
          v-model="userInput"
          outlined
          autofocus
          label="Ej: Gasté 50 en el supermercado ayer"
          hint="La IA extraerá los datos automáticamente"
          maxlength="2000"
          @keyup.enter="runExtraction"
        />
        <div class="text-caption text-right text-grey-6 q-mt-xs">
          {{ userInput.length }}/2000
        </div>
        <q-linear-progress v-if="aiLoading" indeterminate color="primary" class="q-mt-sm" />
      </q-card-section>

      <q-card-section v-if="result">
        <q-separator class="q-mb-md" />
        <p class="text-subtitle2">Resultado:</p>
        <q-list bordered rounded>
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
      </q-card-section>

      <p v-if="aiError" class="text-negative q-px-md q-pb-sm">{{ aiError }}</p>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="handleCancel" />
        <q-btn
          v-if="!result"
          color="primary"
          label="Analizar"
          :loading="aiLoading"
          :disable="!userInput.trim() || aiLoading"
          @click="runExtraction"
        />
        <q-btn v-if="result" flat label="Re-analizar" @click="result = null" />
        <q-btn v-if="result" color="primary" label="Confirmar" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAiExtraction, type ExtractionResult } from 'src/composables/useAiExtraction'

const open = defineModel<boolean>('modelValue', { default: false })
const emit = defineEmits<{ extracted: [result: ExtractionResult] }>()

const { loading: aiLoading, error: aiError, extractFromText } = useAiExtraction()
const result = ref<ExtractionResult | null>(null)
const userInput = ref('')

const suggestionChips = [
  'Gasté 50 en el super',
  'Cobré 5000 de salario',
  'Pagué luz 200',
]

const typeLabel = computed(() => {
  const map: Record<string, string> = { expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia' }
  return map[result.value?.data.type ?? ''] ?? 'Desconocido'
})

async function runExtraction() {
  if (!userInput.value.trim()) return
  result.value = null
  result.value = await extractFromText('auto', userInput.value.trim())
}

function handleConfirm() {
  if (result.value) {
    emit('extracted', result.value)
    open.value = false
  }
}

function handleCancel() {
  result.value = null
  userInput.value = ''
  open.value = false
}
</script>
