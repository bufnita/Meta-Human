import api from './axios';

export const trimiteMasuratoare = async (
  idPacient: number,
  tipParametru: string,
  valoare: number,
  unitate: string,
  sursa: string,
  dataOra?: string,
) => {
  const raspuns = await api.post('/masuratori', {
    idPacient,
    tipParametru,
    valoare,
    unitate,
    dataOra: dataOra ?? new Date().toISOString(),
    sursa,
  });

  return raspuns.data;
};

export const obtineIstoricMasuratori = async (ultimele = 20) => {
  const raspuns = await api.get('/masuratori/istoric', {
    params: {
      ultimele,
    },
  });

  return raspuns.data;
};

export const trimiteEcg = async (
  idPacient: number,
  secventaValori: string,
  durataCapturiiSec: number,
  frecventaEsantionare?: number,
) => {
  const raspuns = await api.post('/masuratori/ecg', {
    idPacient,
    secventaValori,
    durataCapturiiSec,
    frecventaEsantionare,
  });

  return raspuns.data;
};
