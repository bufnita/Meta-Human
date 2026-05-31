import api from './axios'
import type { Doctor } from '../types'

export const doctoriApi = {
  async afiseazaTotiDoctorii(): Promise<Doctor[]> {
    const response = await api.get('/medici')
    return response.data
  },

  async afiseazaDoctorDupaId(id: number): Promise<Doctor> {
    const response = await api.get(`/medici/${id}`)
    return response.data
  },

  async adaugaDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await api.post('/medici', doctor)
    return response.data
  },

  async actualizeazaDoctor(id: number, doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await api.put(`/medici/${id}`, doctor)
    return response.data
  },

  async stergeDoctor(id: number): Promise<string> {
    const response = await api.delete(`/medici/${id}`)
    return response.data
  },

  async asociazaPacientLaDoctor(doctorId: number, pacientId: number): Promise<string> {
    const response = await api.post(`/medici/${doctorId}/pacienti/${pacientId}`)
    return response.data
  },
}
