<template>
  <q-dialog v-model="open" persistent>
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">📷 Escanear Ticket</q-card-section>

      <q-card-section class="text-center">
        <div v-if="!result">
          <!-- Image preview -->
          <img
            v-if="imagePreview"
            :src="imagePreview"
            style="max-width: 100%; max-height: 200px; border-radius: 8px"
            class="q-mb-md"
          />

          <div class="q-gutter-sm">
            <q-btn color="primary" icon="camera_alt" label="Tomar foto" @click="triggerCamera" />
            <q-btn outline icon="photo_library" label="Galería" @click="triggerGallery" />
          </div>

          <!-- Hidden file inputs -->
          <input
            ref="cameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden"
            @change="handleFile"
          />
          <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFile"
          />

          <q-linear-progress v-if="compressing || aiLoading" indeterminate color="primary" class="q-mt-md" />
          <p v-if="compressing" class="text-body2 text-grey-7 q-mt-xs">Comprimiendo imagen...</p>
          <p v-else-if="aiLoading" class="text-body2 text-grey-7 q-mt-xs">Analizando ticket con IA...</p>
        </div>

        <div v-if="result">
          <q-icon name="receipt_long" color="positive" size="3rem" />
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

        <p v-if="aiError" class="text-negative q-mt-sm">{{ aiError }}</p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="handleCancel" />
        <q-btn v-if="result" color="primary" label="Confirmar" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAiExtraction, type ExtractionResult } from 'src/composables/useAiExtraction'
import { useImageCompressor } from 'src/composables/useImageCompressor'

const open = defineModel<boolean>('modelValue', { default: false })
const emit = defineEmits<{ extracted: [result: ExtractionResult] }>()

const { loading: aiLoading, error: aiError, extractFromText } = useAiExtraction()
const { compress } = useImageCompressor()
const result = ref<ExtractionResult | null>(null)
const imagePreview = ref<string | null>(null)
const compressing = ref(false)
const cameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

const typeLabel = computed(() => {
  const map: Record<string, string> = { expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia' }
  return map[result.value?.data.type ?? ''] ?? 'Desconocido'
})

function triggerCamera() {
  cameraInput.value?.click()
}

function triggerGallery() {
  galleryInput.value?.click()
}

async function handleFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Show original size in dev console for reference
  console.debug(`[OCR] Original size: ${(file.size / 1024).toFixed(1)} KB`)

  compressing.value = true
  let base64: string
  try {
    base64 = await compress(file)
    const compressedBytes = Math.round((base64.length * 3) / 4)
    console.debug(`[OCR] Compressed size: ~${(compressedBytes / 1024).toFixed(1)} KB`)
  } catch {
    // Fallback to FileReader if compression fails
    const reader = new FileReader()
    await new Promise<void>((resolve, reject) => {
      reader.onload = () => resolve()
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const base64Full = reader.result as string
    imagePreview.value = base64Full
    base64 = base64Full.split(',')[1] ?? ''
  } finally {
    compressing.value = false
  }

  // Set preview using the compressed base64
  imagePreview.value = `data:image/jpeg;base64,${base64}`
  result.value = await extractFromText('ocr', 'Extraer datos del ticket', base64)
}

function handleConfirm() {
  if (result.value) {
    emit('extracted', result.value)
    open.value = false
  }
}

function handleCancel() {
  result.value = null
  imagePreview.value = null
  open.value = false
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
