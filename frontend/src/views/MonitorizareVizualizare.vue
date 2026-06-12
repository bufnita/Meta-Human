<template>
  <div class="monitorizare">
    <div class="header">
      <div>
        <h1>Monitorizare</h1>
        <p>Ultimele măsurători primite de la dispozitiv</p>
      </div>
      <select v-model.number="ultimele" @change="reincarcaIstoricDinSelect">
        <option :value="10">Ultimele 10</option>
        <option :value="50">Ultimele 50</option>
        <option :value="100">Ultimele 100</option>
      </select>
    </div>

    <div v-if="incarcare" class="card">Se încarcă...</div>
    <div v-if="eroare" class="eroare">{{ eroare }}</div>

    <div class="carduri-monitorizare">
      <div v-for="card in carduriMasuratori" :key="card.cheie" class="card-masurare">
        <h2>{{ card.titlu }}</h2>
        <div class="valoare">
          {{ card.masuratoare?.valoare ?? '--' }}
          <span v-if="card.masuratoare">
            {{ card.masuratoare.unitateMasura ?? card.unitateFallback }}
          </span>
        </div>
        <p v-if="card.masuratoare">
          {{ formateazaDataOraRomania(card.masuratoare.dataOra) }}
        </p>
        <p v-else>Nu există măsurători recente.</p>
      </div>
    </div>

    <div class="card">
      <div class="antet-card">
        <h2>Istoric măsurători</h2>
      </div>

      <table v-if="istoric.length">
        <thead>
          <tr>
            <th>Parametru</th>
            <th>Valoare</th>
            <th>Unitate</th>
            <th>Data și ora</th>
            <th>Stare</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="masuratoare in istoric" :key="masuratoare.idMasuratoare">
            <td data-label="Parametru">{{ etichetaParametru(masuratoare.tipParametru) }}</td>
            <td data-label="Valoare">{{ masuratoare.valoare }}</td>
            <td data-label="Unitate">{{ masuratoare.unitateMasura }}</td>
            <td data-label="Data">{{ formateazaDataOraRomania(masuratoare.dataOra) }}</td>
            <td data-label="Stare">{{ masuratoare.stare }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="!incarcare">Nu există măsurători înregistrate.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { pacientApi } from '../api/pacient'
import type { Masuratoare } from '../types'
import { formateazaDataOraRomania } from '../utils/dataOra'

type TipMetrica = 'temperatura' | 'ecg' | 'puls'

const istoric = ref<Masuratoare[]>([])
const incarcare = ref(false)
const eroare = ref<string | null>(null)
const ultimele = ref(50)
const intervalPollingMs = 8000
const DATA_ORA_FARA_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/
const FEREASTRA_MASURARE_LIVE_MS: Record<TipMetrica, number> = {
  temperatura: 45000,
  ecg: 32000,
  puls: 24000,
}

let intervalIstoricId: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await incarcaIstoric()
  pornestePollingIstoric()
})

onUnmounted(() => {
  oprestePollingIstoric()
})

async function incarcaIstoric(silent = false) {
  if (incarcare.value) {
    return
  }

  if (!silent) {
    incarcare.value = true
  }

  eroare.value = null
  try {
    const raspuns = await pacientApi.obtineIstoric(ultimele.value)
    istoric.value = extrageMasuratori(raspuns)
  } catch (err: unknown) {
    eroare.value =
      (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
      'Eroare la încărcarea măsurătorilor'
  } finally {
    incarcare.value = false
  }
}

function reincarcaIstoricDinSelect() {
  void incarcaIstoric()
}

function pornestePollingIstoric() {
  if (intervalIstoricId !== null) {
    return
  }

  intervalIstoricId = setInterval(() => {
    void incarcaIstoric(true)
  }, intervalPollingMs)
}

function oprestePollingIstoric() {
  if (intervalIstoricId === null) {
    return
  }

  clearInterval(intervalIstoricId)
  intervalIstoricId = null
}

function ultimaPentru(tip: string) {
  return istoric.value.find((m) => normalizeazaTipParametru(m.tipParametru) === tip)
}

function ultimaMasuratoareLivePentru(tip: TipMetrica) {
  const masuratoare = ultimaPentru(tip)

  if (!masuratoare) {
    return null
  }

  const timestamp = obtineTimestampMasuratoare(masuratoare.dataOra)

  if (timestamp === null) {
    return null
  }

  if (Date.now() - timestamp > FEREASTRA_MASURARE_LIVE_MS[tip]) {
    return null
  }

  return masuratoare
}

const carduriMasuratori = computed(() => [
  {
    cheie: 'temperatura',
    titlu: 'Temperatură',
    unitateFallback: 'C',
    masuratoare: ultimaMasuratoareLivePentru('temperatura'),
  },
  {
    cheie: 'ecg',
    titlu: 'ECG',
    unitateFallback: 'raw',
    masuratoare: ultimaMasuratoareLivePentru('ecg'),
  },
  {
    cheie: 'puls',
    titlu: 'Puls',
    unitateFallback: 'bpm',
    masuratoare: ultimaMasuratoareLivePentru('puls'),
  },
])

function extrageMasuratori(
  raspuns: { masuratori?: Masuratoare[]; Masuratori?: Masuratoare[] },
) {
  return (raspuns.masuratori ?? raspuns.Masuratori ?? []).filter(Boolean)
}

function normalizeazaTipParametru(tipParametru?: string | null) {
  return String(tipParametru ?? '')
    .trim()
    .toLowerCase()
}

function obtineTimestampMasuratoare(dataOra?: string | null) {
  const valoareCuratata = String(dataOra ?? '').trim()

  if (!valoareCuratata) {
    return null
  }

  const valoareStandardizata = DATA_ORA_FARA_TIMEZONE.test(valoareCuratata)
    ? `${valoareCuratata.replace(' ', 'T')}Z`
    : valoareCuratata

  const dataMasuratoare = new Date(valoareStandardizata)

  if (Number.isNaN(dataMasuratoare.getTime())) {
    return null
  }

  return dataMasuratoare.getTime()
}

function etichetaParametru(tipParametru?: string | null) {
  const cheie = normalizeazaTipParametru(tipParametru)

  if (cheie === 'temperatura') {
    return 'Temperatură'
  }

  if (cheie === 'ecg') {
    return 'ECG'
  }

  if (cheie === 'puls') {
    return 'Puls'
  }

  return tipParametru || '-'
}
</script>

<style scoped>
.monitorizare {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
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

select {
  padding: 0.55rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #2d3748;
}

.carduri-monitorizare {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card-masurare,
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #0047AB;
}

.card-masurare,
.card {
  padding: 2rem;
}

.card-masurare h2,
.card h2 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.valoare {
  font-size: 2.4rem;
  font-weight: 700;
  color: #0047AB;
  margin-bottom: 0.5rem;
}

.valoare span {
  font-size: 1rem;
  color: #718096;
  margin-left: 0.3rem;
}

.card-masurare p,
.card p {
  color: #718096;
  font-size: 0.9rem;
}

.antet-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #0047AB;
  color: white;
  padding: 0.8rem;
  text-align: left;
}

td {
  padding: 0.8rem;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr:nth-child(even) td {
  background-color: #f7f9fb;
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
  .monitorizare {
    padding: 1.5rem 1rem;
  }

  .header {
    align-items: flex-start;
    flex-direction: column;
  }

  .carduri-monitorizare {
    grid-template-columns: 1fr;
  }

  table thead {
    display: none;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
  }

  tbody tr {
    border-top: 3px solid #0047AB;
    padding: 0.75rem 0;
  }

  td {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    background: transparent !important;
  }

  td::before {
    content: attr(data-label);
    font-weight: 700;
    color: #0047AB;
  }
}
</style>
