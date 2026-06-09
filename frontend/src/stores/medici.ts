import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mediciApi } from '../api/medici'
import type { Medic, CerereMedic, CerereActualizareMedic } from '../types'

export const useMediciStore = defineStore('medici', () => {
  const medici = ref<Medic[]>([])
  const medicSelectat = ref<Medic | null>(null)
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  function ordoneazaMedici(lista: Medic[]): Medic[] {
    return [...lista].sort((a, b) => {
      if (a.activ !== b.activ) return Number(b.activ) - Number(a.activ)
      return a.nume.localeCompare(b.nume, 'ro', { sensitivity: 'base' })
    })
  }

  function actualizeazaStatusLocal(id: number, activ: boolean) {
    medici.value = ordoneazaMedici(
      medici.value.map((m) => (m.idMedic === id ? { ...m, activ } : m)),
    )
    if (medicSelectat.value?.idMedic === id) {
      medicSelectat.value = { ...medicSelectat.value, activ }
    }
  }

  async function sincronizeazaListaDinServer() {
    medici.value = ordoneazaMedici(await mediciApi.obtineToti())
  }

  async function incarcaToti() {
    incarcare.value = true
    eroare.value = null
    try {
      await sincronizeazaListaDinServer()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea medicilor'
    } finally {
      incarcare.value = false
    }
  }

  async function creeaza(cerere: CerereMedic) {
    incarcare.value = true
    eroare.value = null
    try {
      const medicNou = await mediciApi.creeaza(cerere)
      medici.value.push(medicNou)
      return medicNou
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la crearea medicului'
    } finally {
      incarcare.value = false
    }
  }

  async function actualizeaza(id: number, cerere: CerereActualizareMedic) {
    incarcare.value = true
    eroare.value = null
    try {
      const actualizat = await mediciApi.actualizeaza(id, cerere)
      const index = medici.value.findIndex((m) => m.idMedic === id)
      if (index !== -1) medici.value[index] = actualizat
      return actualizat
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la actualizarea medicului'
    } finally {
      incarcare.value = false
    }
  }

  async function dezactiveaza(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await mediciApi.dezactiveaza(id)
      actualizeazaStatusLocal(id, false)
      try {
        await sincronizeazaListaDinServer()
      } catch {
        // lista e deja actualizată local
      }
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la dezactivarea medicului'
    } finally {
      incarcare.value = false
    }
  }

  async function activeaza(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await mediciApi.activeaza(id)
      actualizeazaStatusLocal(id, true)
      try {
        await sincronizeazaListaDinServer()
      } catch {
        // lista e deja actualizată local
      }
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la activarea medicului'
    } finally {
      incarcare.value = false
    }
  }

  async function sterge(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await mediciApi.sterge(id)
      medici.value = medici.value.filter((m) => m.idMedic !== id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la ștergerea medicului'
    } finally {
      incarcare.value = false
    }
  }

  return {
    medici,
    medicSelectat,
    incarcare,
    eroare,
    incarcaToti,
    creeaza,
    actualizeaza,
    dezactiveaza,
    activeaza,
    sterge,
  }
})
