import api from './axios'
import type { Medic, CerereMedic, CerereActualizareMedic } from '../types'

export const mediciApi = {
  async obtineToti(): Promise<Medic[]> {
    const response = await api.get('/medici')
    return response.data
  },

  async obtineDupaId(id: number): Promise<Medic> {
    const response = await api.get(`/medici/${id}`)
    return response.data
  },

  async creeaza(cerere: CerereMedic): Promise<Medic> {
    const response = await api.post('/medici', cerere)
    return response.data
  },

  async actualizeaza(id: number, cerere: CerereActualizareMedic): Promise<Medic> {
    const response = await api.put(`/medici/${id}`, cerere)
    return response.data
  },

  async dezactiveaza(id: number): Promise<void> {
    await api.patch(`/medici/${id}/dezactivare`)
  },

  async activeaza(id: number): Promise<void> {
    await api.patch(`/medici/${id}/activare`)
  },

  async sterge(id: number): Promise<void> {
    await api.delete(`/medici/${id}`)
  },
}
