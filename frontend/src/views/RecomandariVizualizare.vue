<template>
  <div class="recomandari">
    <div class="header">
      <h1>Recomandari</h1>
      <p>Indicatiile primite de la medic</p>
    </div>

    <div v-if="incarcare" class="card-recomandare">Se incarca...</div>
    <div v-if="eroare" class="eroare">{{ eroare }}</div>

    <div v-if="!incarcare && recomandari.length" class="lista-recomandari">
      <div v-for="rec in recomandari" :key="rec.idRecomandare" class="card-recomandare">
        <div class="antet-card">
          <h2>{{ rec.tipActivitate }}</h2>
          <span class="badge">{{ rec.stare }}</span>
        </div>

        <div class="rand-info">
          <span>Durata zilnica</span>
          <strong>{{ rec.durataZilnica || '-' }}</strong>
        </div>

        <div class="rand-info">
          <span>Data inceput</span>
          <strong>{{ formatData(rec.dataInceput) }}</strong>
        </div>

        <div class="rand-info">
          <span>Data sfarsit</span>
          <strong>{{ rec.dataSfarsit ? formatData(rec.dataSfarsit) : '-' }}</strong>
        </div>

        <p v-if="rec.alteIndicatii" class="indicatii">{{ rec.alteIndicatii }}</p>
      </div>
    </div>

    <div v-else-if="!incarcare" class="card-recomandare">
      Nu exista recomandari inregistrate pentru contul tau.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { pacientApi } from '../api/pacient'
import type { Recomandare } from '../types'

const recomandari = ref<Recomandare[]>([])
const incarcare = ref(false)
const eroare = ref<string | null>(null)

onMounted(async () => {
  incarcare.value = true
  eroare.value = null
  try {
    recomandari.value = await pacientApi.obtineRecomandari()
  } catch (err: unknown) {
    eroare.value =
      (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
      'Eroare la incarcarea recomandarilor'
  } finally {
    incarcare.value = false
  }
})

function formatData(data: string) {
  return new Date(data).toLocaleDateString('ro-RO')
}
</script>

<style scoped>
.recomandari {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  font-size: 1.8rem;
  color: #2d3748;
}

.header p {
  margin-top: 0.35rem;
  color: #718096;
}

.lista-recomandari {
  display: grid;
  gap: 1rem;
}

.card-recomandare {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #0047AB;
}

.antet-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.1rem;
  color: #2d3748;
}

.badge {
  background: #eaf1ff;
  color: #0047AB;
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.rand-info {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.7rem 0;
}

.rand-info span {
  color: #718096;
}

.indicatii {
  margin-top: 1rem;
  color: #4a5568;
  line-height: 1.5;
}

.eroare {
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .recomandari {
    padding: 1.5rem 1rem;
  }

  .rand-info {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
