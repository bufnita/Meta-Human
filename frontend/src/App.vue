<template>
  <div id="aplicatie">
    <nav v-if="utilizatorStore.esteAutentificat" ref="navRef">
      <div class="nav-stanga">
        <div class="nav-logo">M</div>
        <div class="nav-linkuri" :class="{ deschis: meniuDeschis }">
          <router-link to="/" @click="meniuDeschis = false">Acasă</router-link>
          <router-link to="/pacienti" @click="meniuDeschis = false">Pacienți</router-link>
          <router-link to="/alarme" @click="meniuDeschis = false">Alarme</router-link>
          <router-link v-if="utilizatorStore.esteAdmin" to="/doctori" @click="meniuDeschis = false"
            >Doctori</router-link
          >
        </div>
      </div>
      <div class="nav-dreapta">
        <span class="nav-info">{{ utilizatorStore.utilizator?.rol }}</span>
        <span class="nav-info"
          >{{ utilizatorStore.utilizator?.nume }} {{ utilizatorStore.utilizator?.prenume }}</span
        >
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
import { useUtilizatorStore } from './stores/utilizator'

const utilizatorStore = useUtilizatorStore()
const meniuDeschis = ref(false)
const navRef = ref<HTMLElement | null>(null)

function inchideMenuAfara(event: MouseEvent) {
  if (navRef.value && !navRef.value.contains(event.target as Node)) {
    meniuDeschis.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', inchideMenuAfara)
})

onUnmounted(() => {
  document.removeEventListener('click', inchideMenuAfara)
})
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
  background-color: #2d7d46;
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
  color: #2d7d46;
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

  .hamburger {
    display: flex;
  }

  .nav-linkuri {
    display: none;
    position: absolute;
    top: 62px;
    left: 0;
    right: 0;
    background-color: #2d7d46;
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
}
</style>
