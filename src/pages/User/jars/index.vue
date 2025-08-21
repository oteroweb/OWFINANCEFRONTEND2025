<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">Tipo de Cántaro: {{ jarType }}</div>
        <div v-if="jarElements.length === 0" class="text-warning">
          No hay elementos para mostrar.
        </div>
      </q-card-section>

      <q-card-section v-if="jarElements.length > 0">
        <q-table :rows="jarElements" :columns="columns" row-key="name" flat>
          <template v-slot:body-cell-percent="props">
            <q-input
              v-model="props.row.percent"
              type="number"
              @input="validatePercentages"
              dense
              outlined
            />
          </template>
        </q-table>
      </q-card-section>

      <q-card-section>
        <div class="text-body1">Porcentaje Total: {{ totalPercentage }}%</div>
        <div v-if="totalPercentage > 100" class="text-negative">¡Has excedido el 100%!</div>
        <div v-else-if="totalPercentage < 100" class="text-warning">
          Te faltan {{ 100 - totalPercentage }}% para llegar al 100%.
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Guardar Cambios" color="primary" @click="saveChanges" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const jarType = ref('');
const jarElements = ref<{ name: string; percent: number; type: string }[]>([]);
const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'percent', label: 'Porcentaje', field: 'percent', align: 'center' as const },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' as const },
];

const totalPercentage = ref(0);

function validatePercentages() {
  totalPercentage.value =
    jarElements.value?.reduce((sum, element) => sum + element.percent, 0) || 0;
}

function saveChanges() {
  console.log('Cambios guardados:', jarElements.value);
}

async function loadJarData() {
  try {
    const response = await axios.get('/api/jars/all', {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    console.log('Respuesta completa de la API de jars (all):', response.data);
  } catch (error) {
    console.error('Error al cargar los datos de la API de jars (all):', error);
  }
}

onMounted(async () => {
  await loadJarData();
});
defineOptions({ name: 'JarsOverviewPage' });
</script>

<style scoped>
.text-negative {
  color: red;
}
.text-warning {
  color: orange;
}
</style>
