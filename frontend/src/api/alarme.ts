import api from './axios'
import type { Alarma } from '../types'

export const alarmeApi = {
  async afiseazaToateAlarmele(): Promise<Alarma[]> {
    const response = await api.get('/Alarme')
    return response.data
  },

  async afiseazaAlarmeActive(): Promise<Alarma[]> {
    const response = await api.get('/Alarme/active')
    return response.data
  },

  async afiseazaAlarmeDupaPacient(pacientId: number): Promise<Alarma[]> {
    const response = await api.get(`/Alarme/pacient/${pacientId}`)
    return response.data
  },

  async rezolvaAlarma(id: number): Promise<string> {
    const response = await api.put(`/Alarme/${id}/rezolva`)
    return response.data
  },

  async ignoraAlarma(id: number): Promise<string> {
    const response = await api.put(`/Alarme/${id}/ignora`)
    return response.data
  },
}
