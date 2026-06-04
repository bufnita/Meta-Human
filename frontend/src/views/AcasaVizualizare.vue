<template>
  <div class="acasa">
    <div class="header">
      <h1>Bun venit</h1>
    </div>

    <div v-if="utilizatorStore.estePacient" class="carduri">
      <div class="card" @click="router.push('/monitorizare')">
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h3l2-5 4 10 3-7 2 2h4" />
          </svg>
        </div>
        <h2>Monitorizare</h2>
        <p>Vizualizează datele primite de la dispozitiv</p>
      </div>

      <div class="card" @click="router.push('/alarme')">
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </div>
        <h2>Alerte</h2>
        <p>Vizualizează alertele active</p>
      </div>

      <div class="card" @click="router.push('/recomandari')">
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2>Recomandări</h2>
        <p>Vizualizează recomandările primite</p>
      </div>
    </div>

    <div v-else class="carduri">
      <div class="card" @click="router.push('/pacienti')">
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h2>Pacienți</h2>
        <p>Gestionează pacienții</p>
      </div>

      <div class="card" @click="router.push('/alarme')">
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </div>
        <h2>Alerte</h2>
        <p>Vizualizează alertele active</p>
      </div>

      <div v-if="utilizatorStore.esteAdmin" class="card" @click="router.push('/medici')">
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h2>Medici</h2>
        <p>Gestionează medicii</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUtilizatorStore } from '../stores/utilizator'

const router = useRouter()
const utilizatorStore = useUtilizatorStore()

function deconectare() {
  utilizatorStore.deconectare()
  router.push('/autentificare')
}
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

.email {
  color: #0047AB;
}

.carduri {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  min-width: 200px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-top: 4px solid #0047AB;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(45, 125, 70, 0.15);
}

.card-icon {
  color: #0047AB;
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
}

.btn-deconectare {
  padding: 0.5rem 1.2rem;
  background-color: white;
  color: #0047AB;
  border: 2px solid #0047AB;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.btn-deconectare:hover {
  background-color: #0047AB;
  color: white;
}
</style>
