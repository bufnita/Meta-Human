import api from './axios'
import type { Alarma } from '../types'

export const alarmeApi = {
  async afiseazaToateAlarmele(): Promise<Alarma[]> {
    const response = await api.get('/alerte')
    return response.data
  },

  async afiseazaAlarmeActive(): Promise<Alarma[]> {
    const response = await api.get('/alerte/active')
    return response.data
  },

  async afiseazaAlarmeDupaPacient(pacientId: number): Promise<Alarma[]> {
    const response = await api.get(`/alerte/pacient/${pacientId}`)
    return response.data
  },

  async rezolvaAlarma(id: number): Promise<string> {
    const response = await api.put(`/alerte/${id}/rezolva`)
    return response.data
  },

  async ignoraAlarma(id: number): Promise<string> {
    const response = await api.put(`/alerte/${id}/ignora`)
    return response.data
  },
}
