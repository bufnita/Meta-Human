import { defineStore } from 'pinia'
import { ref } from 'vue'
import { pacientiApi } from '../api/pacienti'
import type {
  Pacient,
  PacientDetaliu,
  CererePacient,
  IstoricMasuratori,
  Alerta,
  PragAlerta,
  CererePragAlerta,
  Recomandare,
  CerereRecomandare,
} from '../types'

export const usePacientiStore = defineStore('pacienti', () => {
  const pacienti = ref<Pacient[]>([])
  const pacientSelectat = ref<PacientDetaliu | null>(null)
  const istoricMasuratori = ref<IstoricMasuratori | null>(null)
  const alerte = ref<Alerta[]>([])
  const praguri = ref<PragAlerta[]>([])
  const recomandari = ref<Recomandare[]>([])
  const incarcare = ref(false)
  const eroare = ref<string | null>(null)

  async function incarcaLista() {
    incarcare.value = true
    eroare.value = null
    try {
      pacienti.value = await pacientiApi.obtineLista()
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea pacienților'
    } finally {
      incarcare.value = false
    }
  }

  async function incarcaDetaliu(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      pacientSelectat.value = await pacientiApi.obtineDetaliu(id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function creeaza(cerere: CererePacient) {
    incarcare.value = true
    eroare.value = null
    try {
      const pacientNou = await pacientiApi.creeaza(cerere)
      pacienti.value.push(pacientNou)
      return pacientNou
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la crearea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function actualizeaza(id: number, cerere: CererePacient) {
    incarcare.value = true
    eroare.value = null
    try {
      const actualizat = await pacientiApi.actualizeaza(id, cerere)
      const index = pacienti.value.findIndex((p) => p.idPacient === id)
      if (index !== -1) pacienti.value[index] = actualizat
      pacientSelectat.value = await pacientiApi.obtineDetaliu(id)
      return actualizat
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la actualizarea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function dezactiveaza(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await pacientiApi.dezactiveaza(id)
      pacienti.value = pacienti.value.filter((p) => p.idPacient !== id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la dezactivarea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function stergeDefinitiv(id: number) {
    incarcare.value = true
    eroare.value = null
    try {
      await pacientiApi.stergeDefinitiv(id)
      pacienti.value = pacienti.value.filter((p) => p.idPacient !== id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la ștergerea pacientului'
    } finally {
      incarcare.value = false
    }
  }

  async function incarcaIstoric(id: number, ultimele = 100) {
    eroare.value = null
    try {
      istoricMasuratori.value = await pacientiApi.obtineIstoric(id, ultimele)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea istoricului'
    }
  }

  async function incarcaAlertePatient(id: number) {
    eroare.value = null
    try {
      alerte.value = await pacientiApi.obtineAlarme(id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea alertelor'
    }
  }

  async function incarcaPraguri(id: number) {
    eroare.value = null
    try {
      praguri.value = await pacientiApi.obtinePraguri(id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea pragurilor'
    }
  }

  async function adaugaPrag(id: number, cerere: CererePragAlerta) {
    eroare.value = null
    try {
      const prag = await pacientiApi.configureazaPrag(id, cerere)
      praguri.value.push(prag)
      return prag
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la adăugarea pragului'
    }
  }

  async function incarcaRecomandari(id: number) {
    eroare.value = null
    try {
      recomandari.value = await pacientiApi.obtineRecomandari(id)
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la încărcarea recomandărilor'
    }
  }

  async function adaugaRecomandare(id: number, cerere: CerereRecomandare) {
    eroare.value = null
    try {
      const rec = await pacientiApi.adaugaRecomandare(id, cerere)
      recomandari.value.unshift(rec)
      return rec
    } catch (err: unknown) {
      eroare.value =
        (err as { response?: { data?: { mesaj?: string } } }).response?.data?.mesaj ||
        'Eroare la adăugarea recomandării'
    }
  }

  return {
    pacienti,
    pacientSelectat,
    istoricMasuratori,
    alerte,
    praguri,
    recomandari,
    incarcare,
    eroare,
    incarcaLista,
    incarcaDetaliu,
    creeaza,
    actualizeaza,
    dezactiveaza,
    stergeDefinitiv,
    incarcaIstoric,
    incarcaAlertePatient,
    incarcaPraguri,
    adaugaPrag,
    incarcaRecomandari,
    adaugaRecomandare,
  }
})
