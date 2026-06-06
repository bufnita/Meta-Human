// ── Utilizator / Auth ──────────────────────────────────────────────
export interface Utilizator {
  email: string
  token: string
  rol: string
  nume: string
  prenume: string
  idPacient?: number | null
}

export interface CerereLogin {
  email: string
  parola: string
}

// ── Medic ──────────────────────────────────────────────────────────
export interface Medic {
  idMedic: number
  nume: string
  prenume: string
  email: string
  specializare?: string | null
  telefon?: string | null
}

export interface CerereMedic {
  nume: string
  prenume: string
  email: string
  parola: string
  specializare?: string
  telefon?: string
}

export interface CerereActualizareMedic {
  nume: string
  prenume: string
  specializare?: string
  telefon?: string
}

// ── Pacient ────────────────────────────────────────────────────────
export interface Pacient {
  idPacient: number
  idMedic: number
  nume: string
  prenume: string
  varsta: number
  cnp?: string | null
  telefon?: string | null
  email?: string | null
  activ: boolean
}

export interface PacientDetaliu {
  idPacient: number
  idMedic: number
  nume: string
  prenume: string
  varsta: number
  cnp?: string | null
  adresa?: string | null
  telefon?: string | null
  email?: string | null
  profesie?: string | null
  locMunca?: string | null
  istoricMedical?: string | null
  alergii?: string | null
  consultatiiCardiologice?: string | null
  activ: boolean
}

export interface CererePacient {
  idMedic?: number
  nume: string
  prenume: string
  varsta: number
  cnp?: string
  adresa?: string
  telefon?: string
  email: string
  parola?: string
  profesie?: string
  locMunca?: string
  istoricMedical?: string
  alergii?: string
  consultatiiCardiologice?: string
}

// ── Măsurători ─────────────────────────────────────────────────────
export interface Masuratoare {
  idMasuratoare: number
  idPacient: number
  tipParametru: string
  valoare: number
  unitateMasura: string
  dataOra: string
  stare: string
}

export interface IstoricMasuratori {
  idPacient: number
  masuratori: Masuratoare[]
}

// ── Alertă ─────────────────────────────────────────────────────────
export interface Alerta {
  idAlerta: number
  idPacient: number
  pacientNume: string
  pacientPrenume: string
  tipAlerta: string
  parametruAsociat: string
  pragMinim?: number | null
  pragMaxim?: number | null
  valoareConstatata: number
  dataOra: string
  durataPersistentaSec: number
  mesaj: string
  stare: string
}

// ── Prag alertă ────────────────────────────────────────────────────
export interface PragAlerta {
  idPrag: number
  idPacient: number
  tipParametru: string
  valoareMinima?: number | null
  valoareMaxima?: number | null
  durataPersistentaSec: number
  activ: boolean
}

export interface CererePragAlerta {
  tipParametru: string
  valoareMinima?: number
  valoareMaxima?: number
  durataPersistentaSec: number
  activ: boolean
}

// ── Recomandare ────────────────────────────────────────────────────
export interface Recomandare {
  idRecomandare: number
  idPacient: number
  tipActivitate: string
  durataZilnica?: string | null
  alteIndicatii?: string | null
  dataInceput: string
  dataSfarsit?: string | null
  stare: string
}

export interface CerereRecomandare {
  tipActivitate: string
  durataZilnica?: string
  alteIndicatii?: string
  dataInceput: string
  dataSfarsit?: string
}
