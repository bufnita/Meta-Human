import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pacientiApi } from '../api/pacienti'
import type { Pacient } from '../types'

export const usePacientiStore = defineStore('pacienti', () => {
  const pacienti = ref<Pacient[]>([])
  const pacientSelectat = ref<Pacient | null>(null)
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  async function incarcaTotiPacientii() {
    incarcare.value = true
    eroare.value = null
    try {
      pacienti.value = await pacientiApi.afiseazaTotiPacientii()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la incarcarea pacientilor'
    } finally {
      incarcare.value = false
    }
  }

  async function incarcaPacientDupaId(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      pacientSelectat.value = await pacientiApi.afiseazaPacientDupaId(id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la incarcarea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function adaugaPacient(pacient: Omit<Pacient, 'id' | 'dataInregistrarii'>) {
    incarcare.value = true
    eroare.value = null
    try {
      const pacientNou = await pacientiApi.adaugaPacient(pacient)
      pacienti.value.push(pacientNou)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la adaugarea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function actualizeazaPacient(
    id: number,
    pacient: Omit<Pacient, 'id' | 'dataInregistrarii'>,
  ) {
    incarcare.value = true
    eroare.value = null
    try {
      const pacientActualizat = await pacientiApi.actualizeazaPacient(id, pacient)
      const index = pacienti.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        pacienti.value[index] = pacientActualizat
      }
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la actualizarea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function stergePacient(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await pacientiApi.stergePacient(id)
      pacienti.value = pacienti.value.filter((p) => p.id !== id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la stergerea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  return {
    pacienti,
    pacientSelectat,
    incarcare,
    eroare,
    incarcaTotiPacientii,
    incarcaPacientDupaId,
    adaugaPacient,
    actualizeazaPacient,
    stergePacient,
  }
})
