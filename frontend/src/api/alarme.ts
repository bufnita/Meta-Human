import api from './axios'
import type { Alerta } from '../types'

export const alarmeApi = {
  async obtineToate(): Promise<Alerta[]> {
    const response = await api.get('/alerte')
    return response.data
  },

  async obtineActive(): Promise<Alerta[]> {
    const response = await api.get('/alerte/active')
    return response.data
  },

  async obtinePacient(): Promise<Alerta[]> {
    const response = await api.get('/pacient/alerte')
    return response.data
  },

  async rezolva(id: number): Promise<Alerta> {
    const response = await api.put(`/alerte/${id}/rezolva`)
    return response.data
  },

  async ignora(id: number): Promise<Alerta> {
    const response = await api.put(`/alerte/${id}/ignora`)
    return response.data
  },
}
