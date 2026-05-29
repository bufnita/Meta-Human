export interface Pacient {
  id: number
  nume: string
  prenume: string
  cnp: string
  telefon: string
  email: string
  adresa: string
  dataNasterii: string
  dataInregistrarii: string
}

export interface Doctor {
  id: number
  nume: string
  prenume: string
  email: string
  telefon: string
  specializare: string
  numarParafa: string
}

export interface CitireSenzor {
  id: number
  timestamp: string
  puls: number | null
  temperatura: number | null
  dateECG: string | null
  pacientId: number
}

export interface Alarma {
  id: number
  tip: string
  stare: string
  mesaj: string
  dataCrearii: string
  dataRezolvarii: string | null
  pacientId: number
  pacientNume: string
  pacientPrenume: string
}

export interface Utilizator {
  email: string
  token: string
  rol: string
  nume: string
  prenume: string
}

export interface CerereLogin {
  email: string
  parola: string
}

export interface CerereInregistrare {
  email: string
  parola: string
  rol: number
}
