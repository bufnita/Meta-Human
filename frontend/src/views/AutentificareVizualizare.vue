<template>
  <div v-if="afiseazaSplash" class="splash-screen">
    <div class="splash-brand">
      <div class="splash-logo">M</div>
      <div class="splash-text">MetaHuman</div>
    </div>
  </div>

  <div class="autentificare-container">
    <div class="autentificare-stanga">
      <div class="login-logo">M</div>
    </div>

    <div class="autentificare-dreapta">
      <div class="autentificare-card">
        <h2>Bun venit</h2>
        <p class="subtitlu">Autentificați-vă pentru a continua</p>

        <form @submit.prevent="autentificare">
          <div class="camp">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="email@exemplu.ro"
              required
            />
          </div>

          <div class="camp">
            <label>Parolă</label>
            <input
              v-model="parola"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <p v-if="eroare" class="eroare">{{ eroare }}</p>

          <button type="submit" :disabled="incarcare">
            {{ incarcare ? 'Se autentifică...' : 'Autentificare' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUtilizatorStore } from '../stores/utilizator'

const afiseazaSplash = ref(true)

onMounted(() => {
  setTimeout(() => {
    afiseazaSplash.value = false
  }, 1400)
})

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
  grid-template-columns: 280px 1fr;
  height: 100vh;
  width: 100vw;
}

.autentificare-stanga {
  background: linear-gradient(160deg, #0047AB, #00357f);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 0 18px 18px 0;
  overflow: hidden;
  position: relative;
}

.logo {
  width: 76px;
  height: 76px;
  background: white;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  color: #0047AB;
  position: relative;
  flex-shrink: 0;
}

.login-logo {
  width: 76px;
  height: 76px;
  background: white;
  color: #0047AB;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
}


@keyframes ripple {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.6);
    opacity: 0;
  }
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
  color: #0047AB;
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
  border-color: #0047AB;
}

.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0047AB;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.splash-logo {
  width: 76px;
  height: 76px;
  background: white;
  color: #0047AB;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  position: relative;
}

.splash-logo::before,
.splash-logo::after {
  content: "";
  position: absolute;
  inset: -16px;
  border-radius: 32px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  animation: ripple 1.7s ease-out infinite;
}

.splash-logo::after {
  animation-delay: 0.55s;
}

.splash-text {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
}

@keyframes ripple {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .autentificare-container {
    grid-template-columns: 1fr;
  }

  .autentificare-stanga {
    display: none;
  }
}

@media (max-width: 768px) {
  .splash-brand {
    flex-direction: column;
  }

  .splash-text {
    font-size: 2rem;
  }
}

button {
  width: 100%;
  padding: 0.85rem;
  background-color: #0047AB;
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
  background-color: #00357f;
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
