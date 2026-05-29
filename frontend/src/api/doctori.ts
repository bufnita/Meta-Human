import api from './axios'
import type { Doctor } from '../types'

export const doctoriApi = {
  async afiseazaTotiDoctorii(): Promise<Doctor[]> {
    const response = await api.get('/Doctori')
    return response.data
  },

  async afiseazaDoctorDupaId(id: number): Promise<Doctor> {
    const response = await api.get(`/Doctori/${id}`)
    return response.data
  },

  async adaugaDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await api.post('/Doctori', doctor)
    return response.data
  },

  async actualizeazaDoctor(id: number, doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const response = await api.put(`/Doctori/${id}`, doctor)
    return response.data
  },

  async stergeDoctor(id: number): Promise<string> {
    const response = await api.delete(`/Doctori/${id}`)
    return response.data
  },

  async asociazaPacientLaDoctor(doctorId: number, pacientId: number): Promise<string> {
    const response = await api.post(`/Doctori/${doctorId}/pacienti/${pacientId}`)
    return response.data
  },
}
