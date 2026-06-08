import { defineStore } from 'pinia'
import { ref } from 'vue'
import { alarmeApi } from '../api/alarme'
import type { Alerta } from '../types'

export const useAlarmeStore = defineStore('alarme', () => {
  const alarme = ref<Alerta[]>([])
  const alarmeActive = ref<Alerta[]>([])
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  async function incarcaToate() {
    incarcare.value = true
    eroare.value = null
    try {
      alarme.value = await alarmeApi.obtineToate()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea alertelor'
    } finally {
      incarcare.value = false
    }
  }

  async function incarcaActive() {
    incarcare.value = true
    eroare.value = null
    try {
      alarmeActive.value = await alarmeApi.obtineActive()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea alertelor active'
    } finally {
      incarcare.value = false
    }
  }

  async function incarcaPacient() {
    incarcare.value = true
    eroare.value = null
    try {
      alarme.value = await alarmeApi.obtinePacient()
      alarmeActive.value = alarme.value.filter((a) => a.stare === 'Activa' || a.stare === 'Activă')
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea alertelor pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function rezolva(id: number) {
    eroare.value = null
    try {
      const alertaActualizata = await alarmeApi.rezolva(id)
      alarmeActive.value = alarmeActive.value.filter((a) => a.idAlerta !== id)
      const index = alarme.value.findIndex((a) => a.idAlerta === id)
      if (index !== -1) alarme.value[index] = alertaActualizata
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la rezolvarea alertei'
    }
  }

  async function ignora(id: number) {
    eroare.value = null
    try {
      const alertaActualizata = await alarmeApi.ignora(id)
      alarmeActive.value = alarmeActive.value.filter((a) => a.idAlerta !== id)
      const index = alarme.value.findIndex((a) => a.idAlerta === id)
      if (index !== -1) alarme.value[index] = alertaActualizata
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la ignorarea alertei'
    }
  }

  return {
    alarme,
    alarmeActive,
    incarcare,
    eroare,
    incarcaToate,
    incarcaActive,
    incarcaPacient,
    rezolva,
    ignora,
  }
})
