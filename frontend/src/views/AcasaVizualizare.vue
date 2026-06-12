<template>
  <div class="acasa">
    <div class="header">
      <div>
        <h1>{{ titlu }}</h1>
        <p>{{ subtitlu }}</p>
      </div>
    </div>

    <div class="carduri">
      <div
        v-for="card in carduriVizibile"
        :key="card.titlu"
        class="card"
        @click="router.push(card.ruta)"
      >
        <div class="card-icon">{{ card.initiala }}</div>
        <h2>{{ card.titlu }}</h2>
        <p>{{ card.descriere }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUtilizatorStore } from '../stores/utilizator'

const router = useRouter()
const utilizatorStore = useUtilizatorStore()

const titlu = computed(() => {
  if (utilizatorStore.estePacient) return 'Panou pacient'
  if (utilizatorStore.esteMedic) return 'Panou medic'
  if (utilizatorStore.esteAdmin) return 'Panou administrator'
  return 'Bun venit'
})

const subtitlu = computed(() => {
  if (utilizatorStore.estePacient) return 'Monitorizează valorile, alertele și recomandările primite.'
  if (utilizatorStore.esteMedic) return 'Gestionează pacienții, pragurile, alertele și recomandările.'
  if (utilizatorStore.esteAdmin) return 'Acces complet la ecranele principale ale sistemului.'
  return ''
})

const carduri = [
  {
    titlu: 'Monitorizare',
    descriere: 'Vizualizare măsurători și istoric pacient.',
    ruta: '/monitorizare',
    initiala: 'M',
    roluri: ['Pacient', 'Admin'],
  },
  {
    titlu: 'Alerte',
    descriere: 'Consultare alerte active si istoric alerte.',
    ruta: '/alarme',
    initiala: 'A',
    roluri: ['Pacient', 'Medic'],
  },
  {
    titlu: 'Recomandări',
    descriere: 'Indicații medicale pentru pacient.',
    ruta: '/recomandari',
    initiala: 'R',
    roluri: ['Pacient'],
  },
  {
    titlu: 'Pacienți',
    descriere: 'Listă pacienți, detalii, editare și praguri.',
    ruta: '/pacienti',
    initiala: 'P',
    roluri: ['Medic', 'Admin'],
  },
  {
    titlu: 'Medici',
    descriere: 'Administrare conturi si date medici.',
    ruta: '/medici',
    initiala: 'D',
    roluri: ['Admin'],
  },
]

const carduriVizibile = computed(() => {
  const rol = utilizatorStore.utilizator?.rol
  return carduri.filter((card) => rol && card.roluri.includes(rol))
})
</script>

<style scoped>
.acasa {
  padding: 3rem;
  min-height: calc(100vh - 60px);
  background-color: #f0f4f8;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
}

h1 {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 0.3rem;
}

.header p {
  color: #718096;
}

.carduri {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-top: 4px solid #0047ab;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(45, 125, 70, 0.15);
}

.card-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  color: #0047ab;
  background: #eaf1ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  margin-bottom: 1rem;
}

.card h2 {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 0.4rem;
}

.card p {
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .acasa {
    padding: 1.5rem 1rem;
  }
}
</style>
