import api from './axios'
import type { Alerta, PacientDetaliu, Recomandare } from '../types'

export const pacientApi = {
  async obtineProfil(): Promise<PacientDetaliu> {
    const response = await api.get('/pacient/profil')
    return response.data
  },

  async obtineAlerte(): Promise<Alerta[]> {
    const response = await api.get('/pacient/alerte')
    return response.data
  },

  async obtineRecomandari(): Promise<Recomandare[]> {
    const response = await api.get('/pacient/recomandari')
    return response.data
  },
}
