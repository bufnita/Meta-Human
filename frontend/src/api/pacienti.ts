import api from './axios'
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

export const pacientiApi = {
  async obtineLista(): Promise<Pacient[]> {
    const response = await api.get('/pacienti')
    return response.data
  },

  async obtineDetaliu(id: number): Promise<PacientDetaliu> {
    const response = await api.get(`/pacienti/${id}`)
    return response.data
  },

  async creeaza(cerere: CererePacient): Promise<Pacient> {
    const response = await api.post('/pacienti', cerere)
    return response.data
  },

  async actualizeaza(id: number, cerere: CererePacient): Promise<Pacient> {
    const response = await api.put(`/pacienti/${id}`, cerere)
    return response.data
  },

  async dezactiveaza(id: number): Promise<void> {
    await api.delete(`/pacienti/${id}`)
  },

  async stergeDefinitiv(id: number): Promise<void> {
    await api.delete(`/pacienti/${id}/definitiv`)
  },

  async obtineIstoric(id: number, ultimele = 100): Promise<IstoricMasuratori> {
    const response = await api.get(`/pacienti/${id}/istoric`, { params: { ultimele } })
    return response.data
  },

  async obtineAlarme(id: number): Promise<Alerta[]> {
    const response = await api.get(`/pacienti/${id}/alarme`)
    return response.data
  },

  async obtinePraguri(id: number): Promise<PragAlerta[]> {
    const response = await api.get(`/pacienti/${id}/praguri`)
    return response.data
  },

  async configureazaPrag(id: number, cerere: CererePragAlerta): Promise<PragAlerta> {
    const response = await api.post(`/pacienti/${id}/praguri`, cerere)
    return response.data
  },

  async actualizeazaPrag(
    idPacient: number,
    idPrag: number,
    cerere: CererePragAlerta,
  ): Promise<PragAlerta> {
    const response = await api.put(`/pacienti/${idPacient}/praguri/${idPrag}`, cerere)
    return response.data
  },

  async stergePrag(idPacient: number, idPrag: number): Promise<void> {
    await api.delete(`/pacienti/${idPacient}/praguri/${idPrag}`)
  },

  async obtineRecomandari(id: number): Promise<Recomandare[]> {
    const response = await api.get(`/pacienti/${id}/recomandari`)
    return response.data
  },

  async adaugaRecomandare(id: number, cerere: CerereRecomandare): Promise<Recomandare> {
    const response = await api.post(`/pacienti/${id}/recomandari`, cerere)
    return response.data
  },

  async actualizeazaRecomandare(
    idPacient: number,
    idRecomandare: number,
    cerere: CerereRecomandare,
  ): Promise<Recomandare> {
    const response = await api.put(
      `/pacienti/${idPacient}/recomandari/${idRecomandare}`,
      cerere,
    )
    return response.data
  },

  async stergeRecomandare(idPacient: number, idRecomandare: number): Promise<void> {
    await api.delete(`/pacienti/${idPacient}/recomandari/${idRecomandare}`)
  },
}
