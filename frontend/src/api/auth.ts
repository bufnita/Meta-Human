import api from './axios'
import type { CerereLogin, CerereInregistrare, Utilizator } from '../types'

export const authApi = {
  async login(cerere: CerereLogin): Promise<Utilizator> {
    const response = await api.post('/auth/login', cerere)
    return response.data
  },

  async inregistrare(cerere: CerereInregistrare): Promise<string> {
    const response = await api.post('/auth/inregistrare', cerere)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('utilizator')
  },
}
