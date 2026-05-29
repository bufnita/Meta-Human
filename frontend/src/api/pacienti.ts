import api from './axios'
import type { Pacient } from '../types'

export const pacientiApi = {
  async afiseazaTotiPacientii(): Promise<Pacient[]> {
    const response = await api.get('/Pacienti')
    return response.data
  },

  async afiseazaPacientDupaId(id: number): Promise<Pacient> {
    const response = await api.get(`/Pacienti/${id}`)
    return response.data
  },

  async adaugaPacient(pacient: Omit<Pacient, 'id' | 'dataInregistrarii'>): Promise<Pacient> {
    const response = await api.post('/Pacienti', pacient)
    return response.data
  },

  async actualizeazaPacient(
    id: number,
    pacient: Omit<Pacient, 'id' | 'dataInregistrarii'>,
  ): Promise<Pacient> {
    const response = await api.put(`/Pacienti/${id}`, pacient)
    return response.data
  },

  async stergePacient(id: number): Promise<string> {
    const response = await api.delete(`/Pacienti/${id}`)
    return response.data
  },
}
