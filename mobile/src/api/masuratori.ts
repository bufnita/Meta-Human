import api from './axios';

export const trimiteMarsuratoare = async (
  idPacient: number,
  tipParametru: string,
  valoare: number,
  unitate: string,
  sursa: string,
) => {
  const raspuns = await api.post('/masuratori', {
    idPacient,
    tipParametru,
    valoare,
    unitate,
    dataOra: new Date().toISOString(),
    sursa,
  });
  return raspuns.data;
};
