import api from './axios'
import type { CerereLogin, Utilizator } from '../types'

export const authApi = {
  async login(cerere: CerereLogin): Promise<Utilizator> {
    const response = await api.post('/auth/login', cerere)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('utilizator')
  },
}
