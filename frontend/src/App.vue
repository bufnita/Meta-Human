<template>
  <div id="aplicatie">
    <nav v-if="utilizatorStore.esteAutentificat" ref="navRef">
      <div class="nav-stanga">
        <div class="nav-logo">M</div>
        <div class="nav-linkuri" :class="{ deschis: meniuDeschis }">
          <router-link to="/" @click="meniuDeschis = false"> Acasă </router-link>

          <router-link
            v-if="utilizatorStore.estePacient || utilizatorStore.esteAdmin"
            to="/monitorizare"
            @click="meniuDeschis = false"
          >
            Monitorizare
          </router-link>

          <router-link
            v-if="
              utilizatorStore.estePacient || utilizatorStore.esteMedic || utilizatorStore.esteAdmin
            "
            to="/alarme"
            @click="meniuDeschis = false"
          >
            Alerte
          </router-link>

          <router-link
            v-if="utilizatorStore.estePacient || utilizatorStore.esteAdmin"
            to="/recomandari"
            @click="meniuDeschis = false"
          >
            Recomandări
          </router-link>

          <router-link
            v-if="utilizatorStore.esteMedic || utilizatorStore.esteAdmin"
            to="/pacienti"
            @click="meniuDeschis = false"
          >
            Pacienți
          </router-link>

          <router-link v-if="utilizatorStore.esteAdmin" to="/medici" @click="meniuDeschis = false">
            Medici
          </router-link>

          <!-- Deconectare vizibil doar în meniul hamburger pe mobil -->
          <a class="link-deconectare-mobil" @click="deconectare">Deconectare</a>
        </div>
      </div>
      <div class="nav-dreapta">
        <span class="nav-info">{{ utilizatorStore.utilizator?.rol }}</span>
        <span class="nav-info"
          >{{ utilizatorStore.utilizator?.nume }} {{ utilizatorStore.utilizator?.prenume }}</span
        >
        <button class="btn-deconectare" @click="deconectare">Deconectare</button>
        <button class="hamburger" @click.stop="meniuDeschis = !meniuDeschis" aria-label="Meniu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUtilizatorStore } from './stores/utilizator'

const utilizatorStore = useUtilizatorStore()
const router = useRouter()
const meniuDeschis = ref(false)
const navRef = ref<HTMLElement | null>(null)

function deconectare() {
  utilizatorStore.deconectare()
  router.push('/autentificare')
}

function inchideMenuAfara(event: MouseEvent) {
  if (navRef.value && !navRef.value.contains(event.target as Node)) {
    meniuDeschis.value = false
  }
}

onMounted(() => document.addEventListener('click', inchideMenuAfara))
onUnmounted(() => document.removeEventListener('click', inchideMenuAfara))
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html {
  height: 100%;
}
body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  height: 100%;
}
#aplicatie {
  height: 100vh;
}
nav {
  background-color: #0047ab;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  border-radius: 16px;
  margin: 1px 0;
  position: relative;
  z-index: 100;
}
.nav-stanga {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-dreapta {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav-logo {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #0047ab;
  flex-shrink: 0;
}
.nav-linkuri {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
nav a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.95rem;
}
nav a:hover {
  color: white;
}
nav a.router-link-active {
  color: white;
  border-bottom: 2px solid white;
}
.nav-info {
  color: white;
  font-size: 0.9rem;
}

.btn-deconectare {
  padding: 0.4rem 0.9rem;
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}
.btn-deconectare:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: white;
}

.link-deconectare-mobil {
  display: none;
  cursor: pointer;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.2s;
}

@media (max-width: 640px) {
  nav {
    padding: 0 1rem;
    border-radius: 0 0 16px 16px;
  }
  .nav-info {
    display: none;
  }
  .btn-deconectare {
    display: none;
  }
  .hamburger {
    display: flex;
  }
  .nav-linkuri {
    display: none;
    position: absolute;
    top: 62px;
    left: 0;
    right: 0;
    background-color: #0047ab;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.5rem;
    gap: 1rem;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .nav-linkuri.deschis {
    display: flex;
  }
  .nav-linkuri a {
    font-size: 1rem;
    padding: 0.3rem 0;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  }
  .nav-linkuri a:last-child {
    border-bottom: none;
  }
  .link-deconectare-mobil {
    display: block;
    font-size: 1rem;
    padding: 0.3rem 0;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }
  .link-deconectare-mobil:hover {
    color: white;
  }
}
</style>
