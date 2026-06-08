<template>
  <div class="alarme">
    <div class="antet">
      <div>
        <h1>Alerte</h1>
        <p>{{ utilizatorStore.estePacient ? 'Alertele mele medicale' : 'Alerte pacienți' }}</p>
      </div>
      <div class="filtre">
        <button
          :class="filtru === 'active' ? 'btn-primar' : 'btn-contur'"
          @click="schimbaFiltru('active')"
        >
          Active
        </button>
        <button
          :class="filtru === 'toate' ? 'btn-primar' : 'btn-contur'"
          @click="schimbaFiltru('toate')"
        >
          Toate
        </button>
      </div>
    </div>

    <div v-if="alarmeStore.incarcare" class="card">Se încarcă...</div>
    <div v-if="alarmeStore.eroare" class="eroare">{{ alarmeStore.eroare }}</div>

    <table v-if="!alarmeStore.incarcare && alarmeAfisate.length">
      <thead>
        <tr>
          <th v-if="!utilizatorStore.estePacient">Pacient</th>
          <th>Parametru</th>
          <th>Valoare</th>
          <th>Mesaj</th>
          <th>Stare</th>
          <th>Data</th>
          <th v-if="!utilizatorStore.estePacient">Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="alerta in alarmeAfisate"
          :key="alerta.idAlerta"
          :class="{ activa: esteActiva(alerta.stare) }"
        >
          <td v-if="!utilizatorStore.estePacient" data-label="Pacient">
            {{ alerta.pacientNume }} {{ alerta.pacientPrenume }}
          </td>
          <td data-label="Parametru">{{ alerta.parametruAsociat }}</td>
          <td data-label="Valoare">{{ alerta.valoareConstatata }}</td>
          <td data-label="Mesaj">{{ alerta.mesaj }}</td>
          <td data-label="Stare">
            <span :class="esteActiva(alerta.stare) ? 'badge-activ' : 'badge-inactiv'">
              {{ alerta.stare }}
            </span>
          </td>
          <td data-label="Data">{{ new Date(alerta.dataOra).toLocaleString('ro-RO') }}</td>
          <td v-if="!utilizatorStore.estePacient" class="td-actiuni">
            <button
              class="btn-contur"
              :disabled="!esteActiva(alerta.stare)"
              @click="rezolva(alerta.idAlerta)"
            >
              Rezolvă
            </button>
            <button
              class="btn-contur-rosu"
              :disabled="!esteActiva(alerta.stare)"
              @click="ignora(alerta.idAlerta)"
            >
              Ignoră
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!alarmeStore.incarcare" class="card">
      Nu există alerte pentru filtrul selectat.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAlarmeStore } from '../stores/alarme'
import { useUtilizatorStore } from '../stores/utilizator'

const alarmeStore = useAlarmeStore()
const utilizatorStore = useUtilizatorStore()
const filtru = ref<'toate' | 'active'>('active')

const alarmeAfisate = computed(() => {
  return filtru.value === 'active' ? alarmeStore.alarmeActive : alarmeStore.alarme
})

onMounted(async () => {
  utilizatorStore.incarcaDinStorage()
  if (utilizatorStore.estePacient) {
    await alarmeStore.incarcaPacient()
  } else {
    await alarmeStore.incarcaToate()
    await alarmeStore.incarcaActive()
  }
})

function schimbaFiltru(valoare: 'toate' | 'active') {
  filtru.value = valoare
}

function esteActiva(stare: string) {
  return stare === 'Activa' || stare === 'Activă'
}

async function rezolva(id: number) {
  await alarmeStore.rezolva(id)
}

async function ignora(id: number) {
  await alarmeStore.ignora(id)
}
</script>

<style scoped>
.alarme {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.antet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  font-size: 1.8rem;
  color: #2d3748;
}

.antet p {
  margin-top: 0.35rem;
  color: #718096;
}

.filtre {
  display: flex;
  gap: 0.5rem;
}

.btn-primar,
.btn-contur,
.btn-contur-rosu {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primar {
  background-color: #0047ab;
  color: white;
  border: 2px solid #0047ab;
}

.btn-contur {
  background-color: white;
  color: #0047ab;
  border: 2px solid #0047ab;
}

.btn-contur-rosu {
  background-color: white;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.card {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid #0047ab;
  color: #2d3748;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

th {
  background-color: #0047ab;
  color: white;
  padding: 0.9rem 0.75rem;
  text-align: left;
  font-size: 0.9rem;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  color: #2d3748;
}

tbody tr:nth-child(even) td {
  background-color: #f7f9fb;
}

tr.activa td {
  background-color: #fff8e1;
}

.badge-activ,
.badge-inactiv {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.badge-activ {
  background-color: #c6f6d5;
  color: #276749;
}

.badge-inactiv {
  background-color: #e2e8f0;
  color: #4a5568;
}

.td-actiuni {
  white-space: nowrap;
}

.eroare {
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .alarme {
    padding: 1.5rem 1rem;
  }

  .antet {
    align-items: flex-start;
    flex-direction: column;
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

  table {
    background: transparent;
    box-shadow: none;
  }

  tbody tr {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-top: 4px solid #0047ab;
  }

  td {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.4rem 0;
    border: none;
    background: transparent !important;
  }

  td::before {
    content: attr(data-label);
    font-weight: 700;
    color: #0047ab;
  }
}
</style>
