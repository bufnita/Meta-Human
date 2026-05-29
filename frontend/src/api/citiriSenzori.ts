import api from './axios'
import type { CitireSenzor } from '../types'

export const citiriSenzoriApi = {
  async afiseazaCitiriDupaPacient(
    pacientId: number,
    ultimele: number = 100,
  ): Promise<CitireSenzor[]> {
    const response = await api.get(`/CitiriSenzori/pacient/${pacientId}`, {
      params: { ultimele },
    })
    return response.data
  },

  async adaugaCitire(citire: Omit<CitireSenzor, 'id' | 'timestamp'>): Promise<CitireSenzor> {
    const response = await api.post('/CitiriSenzori', citire)
    return response.data
  },
}
