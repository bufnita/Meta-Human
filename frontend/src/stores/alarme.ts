import { defineStore } from 'pinia'
import { ref } from 'vue'
import { alarmeApi } from '../api/alarme'
import type { Alarma } from '../types'

export const useAlarmeStore = defineStore('alarme', () => {
  const alarme = ref<Alarma[]>([])
  const alarmeActive = ref<Alarma[]>([])
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  async function incarcaToateAlarmele() {
    incarcare.value = true
    eroare.value = null
    try {
      alarme.value = await alarmeApi.afiseazaToateAlarmele()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data || 'Eroare la incarcarea alarmelor'
    } finally {
      incarcare.value = false
    }
  }

  async function incarcaAlarmeActive() {
    incarcare.value = true
    eroare.value = null
    try {
      alarmeActive.value = await alarmeApi.afiseazaAlarmeActive()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la incarcarea alarmelor active'
    } finally {
      incarcare.value = false
    }
  }

  async function rezolvaAlarma(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await alarmeApi.rezolvaAlarma(id)
      alarmeActive.value = alarmeActive.value.filter((a) => a.id !== id)
      const alarma = alarme.value.find((a) => a.id === id)
      if (alarma) {
        alarma.stare = 'Rezolvata'
      }
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data || 'Eroare la rezolvarea alarmei'
    } finally {
      incarcare.value = false
    }
  }

  async function ignoraAlarma(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await alarmeApi.ignoraAlarma(id)
      alarmeActive.value = alarmeActive.value.filter((a) => a.id !== id)
      const alarma = alarme.value.find((a) => a.id === id)
      if (alarma) {
        alarma.stare = 'Ignorata'
      }
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data || 'Eroare la ignorarea alarmei'
    } finally {
      incarcare.value = false
    }
  }

  return {
    alarme,
    alarmeActive,
    incarcare,
    eroare,
    incarcaToateAlarmele,
    incarcaAlarmeActive,
    rezolvaAlarma,
    ignoraAlarma,
  }
})
