<template>
  <div class="alarme">
    <div class="antet">
      <h1>Alarme</h1>
      <div class="filtre">
        <button
          :class="filtru === 'toate' ? 'btn-primar' : 'btn-contur'"
          @click="schimbaFiltru('toate')"
        >
          Toate
        </button>
        <button
          :class="filtru === 'active' ? 'btn-primar' : 'btn-contur'"
          @click="schimbaFiltru('active')"
        >
          Active
        </button>
      </div>
    </div>

    <div v-if="alarmeStore.incarcare">Se încarcă...</div>
    <div v-if="alarmeStore.eroare" class="eroare">{{ alarmeStore.eroare }}</div>

    <table v-if="alarmeAfisate.length > 0">
      <thead>
        <tr>
          <th>Pacient</th>
          <th>Tip</th>
          <th>Mesaj</th>
          <th>Stare</th>
          <th>Data</th>
          <th>Acțiuni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="alarma in alarmeAfisate" :key="alarma.id" :class="alarma.stare.toLowerCase()">
          <td data-label="Pacient">{{ alarma.pacientNume }} {{ alarma.pacientPrenume }}</td>
          <td data-label="Tip">{{ traducceTipAlarma(alarma.tip) }}</td>
          <td data-label="Mesaj">{{ alarma.mesaj }}</td>
          <td data-label="Stare">{{ alarma.stare }}</td>
          <td data-label="Data">{{ new Date(alarma.dataCrearii).toLocaleString('ro-RO') }}</td>
          <td class="td-actiuni">
            <template v-if="alarma.stare === 'Activa'">
              <button class="btn-contur" @click="rezolvaAlarma(alarma.id)">Rezolvă</button>
              <button class="btn-contur-rosu" @click="ignoraAlarma(alarma.id)">Ignoră</button>
            </template>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!alarmeStore.incarcare">Nu există alarme.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAlarmeStore } from '../stores/alarme'

const alarmeStore = useAlarmeStore()
const filtru = ref<'toate' | 'active'>('active')

const alarmeAfisate = computed(() => {
  return filtru.value === 'active' ? alarmeStore.alarmeActive : alarmeStore.alarme
})

onMounted(() => {
  alarmeStore.incarcaToateAlarmele()
  alarmeStore.incarcaAlarmeActive()
})

function schimbaFiltru(valoare: 'toate' | 'active') {
  filtru.value = valoare
}

async function rezolvaAlarma(id: number) {
  await alarmeStore.rezolvaAlarma(id)
}

async function ignoraAlarma(id: number) {
  await alarmeStore.ignoraAlarma(id)
}

function traducceTipAlarma(tip: string): string {
  const traduceri: Record<string, string> = {
    PulsAnormal: 'Puls anormal',
    TemperaturaAnormala: 'Temperatură anormală',
    ECGAnormal: 'ECG anormal',
    UmiditateAnormala: 'Umiditate anormală',
  }
  return traduceri[tip] || tip
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
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  font-size: 1.8rem;
  color: #2d3748;
}

.filtre {
  display: flex;
  gap: 0.5rem;
}

.btn-primar {
  padding: 0.5rem 1.2rem;
  background-color: #2d7d46;
  color: white;
  border: 2px solid #2d7d46;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-contur {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #2d7d46;
  border: 2px solid #2d7d46;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  margin-right: 0.4rem;
}

.btn-contur:hover {
  background-color: #2d7d46;
  color: white;
}

.btn-contur-rosu {
  padding: 0.4rem 0.9rem;
  background-color: white;
  color: #e74c3c;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-contur-rosu:hover {
  background-color: #e74c3c;
  color: white;
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
  background-color: #2d7d46;
  color: white;
  padding: 0.9rem 0.75rem;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  color: #2d3748;
}

.td-actiuni {
  white-space: nowrap;
}

tbody tr:nth-child(odd) td {
  background-color: #ffffff;
}

tbody tr:nth-child(even) td {
  background-color: #f7f9fb;
}

tbody tr:hover td {
  background-color: #e8f5ee;
}

.activa td {
  background-color: transparent;
}

.rezolvata td {
  background-color: transparent;
  color: #a0aec0;
}

.ignorata td {
  background-color: transparent;
  color: #a0aec0;
}

.eroare {
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .alarme {
    padding: 1.5rem 1rem;
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
    border-radius: 0;
  }

  tbody tr {
    background: white !important;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-top: 4px solid #2d7d46;
    border-left: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }

  tbody tr:nth-child(even) td,
  tbody tr:nth-child(odd) td,
  tbody tr:hover td {
    background: transparent !important;
  }

  td {
    padding: 0.35rem 0;
    border: none;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #f0f4f8;
  }

  td:last-child {
    border-bottom: none;
  }

  td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #2d7d46;
    font-size: 0.85rem;
  }

  .td-actiuni {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }

  .td-actiuni::before {
    display: none;
  }

  td[data-label='Mesaj'] {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  td[data-label='Mesaj']::before {
    margin-bottom: 0.1rem;
  }
}
</style>
