<template>
  <div class="autentificare-container">
    <div class="autentificare-stanga">
      <div class="logo">M</div>
      <div class="caracteristici">
        <div class="caracteristica">
          <span class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </span>
          <span>Monitorizare puls în timp real</span>
        </div>
        <div class="caracteristica">
          <span class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9V4a1 1 0 00-2 0v5a3 3 0 102 0z"
              />
              <circle cx="11" cy="17" r="3" stroke="white" stroke-width="1.5" fill="none" />
              <line
                x1="11"
                y1="9"
                x2="11"
                y2="14"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span>Temperatura corporală</span>
        </div>
        <div class="caracteristica">
          <span class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              stroke-width="1.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h2l2-6 4 12 3-9 2 3h3" />
            </svg>
          </span>
          <span>Analiză ECG</span>
        </div>
        <div class="caracteristica">
          <span class="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </span>
          <span>Alarme automate</span>
        </div>
      </div>
    </div>

    <div class="autentificare-dreapta">
      <div class="autentificare-card">
        <h2>Bun venit</h2>
        <p class="subtitlu">Autentificați-vă pentru a continua</p>

        <div v-if="eroare" class="eroare">{{ eroare }}</div>

        <form @submit.prevent="autentificare">
          <div class="camp">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="email@exemplu.ro" required />
          </div>
          <div class="camp">
            <label>Parolă</label>
            <input v-model="parola" type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" :disabled="incarcare">
            {{ incarcare ? 'Se încarcă...' : 'Autentificare' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUtilizatorStore } from '../stores/utilizator'

const router = useRouter()
const utilizatorStore = useUtilizatorStore()

const email = ref('')
const parola = ref('')
const eroare = ref<string | null>(null)
const incarcare = ref(false)

async function autentificare() {
  incarcare.value = true
  eroare.value = null
  await utilizatorStore.autentificare({ email: email.value, parola: parola.value })
  if (utilizatorStore.eroare) {
    eroare.value = utilizatorStore.eroare
  } else {
    router.push('/')
  }
  incarcare.value = false
}
</script>

<style scoped>
.autentificare-container {
  display: grid;
  grid-template-columns: 20% 80%;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}

.autentificare-stanga {
  background-color: #2d7d46;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem;
  color: white;
  border-radius: 16px;
  overflow: hidden;
}

.logo {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #2d7d46;
  margin-bottom: 2.5rem;
}

.caracteristici {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.caracteristica {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.autentificare-dreapta {
  background-color: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
}

.autentificare-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #2d7d46;
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.subtitlu {
  color: #718096;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.camp {
  margin-bottom: 1.2rem;
}

.camp label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.camp input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
  outline: none;
}

.camp input:focus {
  border-color: #2d7d46;
}

button {
  width: 100%;
  padding: 0.85rem;
  background-color: #2d7d46;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

button:hover {
  background-color: #245f37;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.eroare {
  background-color: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
}
</style>
