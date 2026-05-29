import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doctoriApi } from '../api/doctori'
import type { Doctor } from '../types'

export const useDoctoriStore = defineStore('doctori', () => {
  const doctori = ref<Doctor[]>([])
  const doctorSelectat = ref<Doctor | null>(null)
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  async function incarcaTotiDoctorii() {
    incarcare.value = true
    eroare.value = null
    try {
      doctori.value = await doctoriApi.afiseazaTotiDoctorii()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data ||
        'Eroare la incarcarea doctorilor'
    } finally {
      incarcare.value = false
    }
  }

  async function adaugaDoctor(doctor: Omit<Doctor, 'id'>) {
    incarcare.value = true
    eroare.value = null
    try {
      const doctorNou = await doctoriApi.adaugaDoctor(doctor)
      doctori.value.push(doctorNou)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data || 'Eroare la adaugarea doctorului'
    } finally {
      incarcare.value = false
    }
  }

  async function stergeDoctor(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await doctoriApi.stergeDoctor(id)
      doctori.value = doctori.value.filter((d) => d.id !== id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: string } }).response?.data || 'Eroare la stergerea doctorului'
    } finally {
      incarcare.value = false
    }
  }

  return {
    doctori,
    doctorSelectat,
    incarcare,
    eroare,
    incarcaTotiDoctorii,
    adaugaDoctor,
    stergeDoctor,
  }
})
