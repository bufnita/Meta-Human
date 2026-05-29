<template>
  <div class="detalii-pacient">
    <div class="antet">
      <button @click="router.push('/pacienti')">← Inapoi</button>
      <h1 v-if="pacientiStore.pacientSelectat">
        {{ pacientiStore.pacientSelectat.nume }} {{ pacientiStore.pacientSelectat.prenume }}
      </h1>
    </div>

    <div v-if="pacientiStore.incarcare">Se incarca...</div>
    <div v-if="pacientiStore.eroare" class="eroare">{{ pacientiStore.eroare }}</div>

    <div v-if="pacientiStore.pacientSelectat" class="continut">
      <!-- Informatii pacient -->
      <div class="card">
        <h2>Informatii Personale</h2>
        <div class="rand-info">
          <span class="eticheta">CNP:</span>
          <span>{{ pacientiStore.pacientSelectat.cnp }}</span>
        </div>
        <div class="rand-info">
          <span class="eticheta">Data Nasterii:</span>
          <span>{{
            new Date(pacientiStore.pacientSelectat.dataNasterii).toLocaleDateString('ro-RO')
          }}</span>
        </div>
        <div class="rand-info">
          <span class="eticheta">Telefon:</span>
          <span>{{ pacientiStore.pacientSelectat.telefon }}</span>
        </div>
        <div class="rand-info">
          <span class="eticheta">Email:</span>
          <span>{{ pacientiStore.pacientSelectat.email }}</span>
        </div>
        <div class="rand-info">
          <span class="eticheta">Adresa:</span>
          <span>{{ pacientiStore.pacientSelectat.adresa }}</span>
        </div>
        <div class="rand-info">
          <span class="eticheta">Inregistrat la:</span>
          <span>{{
            new Date(pacientiStore.pacientSelectat.dataInregistrarii).toLocaleDateString('ro-RO')
          }}</span>
        </div>
      </div>

      <!-- Citiri senzori -->
      <div class="card">
        <div class="antet-card">
          <h2>Citiri Senzori</h2>
          <select v-model="numarCitiri" @change="incarcaCitiri">
            <option :value="10">Ultimele 10</option>
            <option :value="50">Ultimele 50</option>
            <option :value="100">Ultimele 100</option>
          </select>
        </div>

        <div v-if="incarcareСitiri">Se incarca...</div>

        <table v-if="citiri.length > 0">
          <thead>
            <tr>
              <th>Data si Ora</th>
              <th>Puls (bpm)</th>
              <th>Temperatura (°C)</th>
              <th>ECG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="citire in citiri" :key="citire.id">
              <td>{{ new Date(citire.timestamp).toLocaleString('ro-RO') }}</td>
              <td :class="{ anormal: citire.puls && (citire.puls < 40 || citire.puls > 150) }">
                {{ citire.puls ?? '-' }}
              </td>
              <td
                :class="{
                  anormal:
                    citire.temperatura && (citire.temperatura < 35 || citire.temperatura > 39.5),
                }"
              >
                {{ citire.temperatura ?? '-' }}
              </td>
              <td class="ecg">{{ citire.dateECG ?? '-' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!incarcareСitiri">Nu exista citiri pentru acest pacient.</p>
      </div>

      <!-- Alarme pacient -->
      <div class="card">
        <h2>Alarme</h2>
        <div v-if="incarcareAlarme">Se incarca...</div>
        <table v-if="alarme.length > 0">
          <thead>
            <tr>
              <th>Tip</th>
              <th>Mesaj</th>
              <th>Stare</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alarma in alarme" :key="alarma.id" :class="alarma.stare.toLowerCase()">
              <td>{{ alarma.tip }}</td>
              <td>{{ alarma.mesaj }}</td>
              <td>{{ alarma.stare }}</td>
              <td>{{ new Date(alarma.dataCrearii).toLocaleString('ro-RO') }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else-if="!incarcareAlarme">Nu exista alarme pentru acest pacient.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePacientiStore } from '../stores/pacienti'
import { citiriSenzoriApi } from '../api/citiriSenzori'
import { alarmeApi } from '../api/alarme'
import type { CitireSenzor, Alarma } from '../types'

const route = useRoute()
const router = useRouter()
const pacientiStore = usePacientiStore()

const citiri = ref<CitireSenzor[]>([])
const alarme = ref<Alarma[]>([])
const numarCitiri = ref(10)
const incarcareСitiri = ref(false)
const incarcareAlarme = ref(false)

const pacientId = Number(route.params.id)

onMounted(async () => {
  await pacientiStore.incarcaPacientDupaId(pacientId)
  await incarcaCitiri()
  await incarcaAlarme()
})

async function incarcaCitiri() {
  incarcareСitiri.value = true
  citiri.value = await citiriSenzoriApi.afiseazaCitiriDupaPacient(pacientId, numarCitiri.value)
  incarcareСitiri.value = false
}

async function incarcaAlarme() {
  incarcareAlarme.value = true
  alarme.value = await alarmeApi.afiseazaAlarmeDupaPacient(pacientId)
  incarcareAlarme.value = false
}
</script>

<style scoped>
.detalii-pacient {
  padding: 2rem;
}
.antet {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.continut {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.antet-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.rand-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.eticheta {
  font-weight: bold;
  min-width: 150px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  background-color: #3498db;
  color: white;
  padding: 0.75rem;
  text-align: left;
}
td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}
td.ecg {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.anormal {
  color: #e74c3c;
  font-weight: bold;
}
.activa td {
  background-color: #ffeaa7;
}
.rezolvata td {
  background-color: #dfe6e9;
}
button {
  padding: 0.4rem 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.eroare {
  background-color: #e74c3c;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
