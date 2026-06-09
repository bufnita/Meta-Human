import api from './axios'
import type { Alerta, IstoricMasuratori, PacientDetaliu, Recomandare } from '../types'

export const pacientApi = {
  async obtineProfil(): Promise<PacientDetaliu> {
    const response = await api.get('/pacient/profil')
    return response.data
  },

  async obtineAlerte(): Promise<Alerta[]> {
    const response = await api.get('/pacient/alerte')
    return response.data
  },

  async obtineIstoric(ultimele = 100): Promise<IstoricMasuratori> {
    const response = await api.get('/masuratori/istoric', { params: { ultimele } })
    return response.data
  },

  async obtineRecomandari(): Promise<Recomandare[]> {
    const response = await api.get('/pacient/recomandari')
    return response.data
  },
}
