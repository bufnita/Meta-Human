import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import type { Utilizator, CerereLogin } from '../types'

export const useUtilizatorStore = defineStore('utilizator', () => {
  const utilizator = ref<Utilizator | null>(null)
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  const esteAutentificat = computed(() => !!utilizator.value)
  const esteAdmin = computed(() => utilizator.value?.rol === 'Admin')
  const esteDoctor = computed(() => utilizator.value?.rol === 'Doctor')
  const estePacient = computed(() => utilizator.value?.rol === 'Pacient')

  async function autentificare(cerere: CerereLogin) {
    incarcare.value = true
    eroare.value = null
    try {
      const date = await authApi.login(cerere)
      utilizator.value = date
      localStorage.setItem('token', date.token)
      localStorage.setItem('utilizator', JSON.stringify(date))
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data || 'Eroare la autentificare'
    } finally {
      incarcare.value = false
    }
  }

  function deconectare() {
    authApi.logout()
    utilizator.value = null
  }

  function incarcaDinStorage() {
    const date = localStorage.getItem('utilizator')
    if (date) {
      utilizator.value = JSON.parse(date)
    }
  }

  return {
    utilizator,
    incarcare,
    eroare,
    esteAutentificat,
    esteAdmin,
    esteDoctor,
    estePacient,
    autentificare,
    deconectare,
    incarcaDinStorage,
  }
})
