import api from './axios';

export const obtineToateAlertele = async () => {
  const raspuns = await api.get('/alerte');
  return raspuns.data;
};

export const obtineAlertelePacientului = async () => {
  const raspuns = await api.get('/pacient/alerte');
  return raspuns.data;
};

export const rezolvaAlerta = async (idAlerta: number) => {
  const raspuns = await api.put(`/alerte/${idAlerta}/rezolva`);
  return raspuns.data;
};

export const ignoraAlerta = async (idAlerta: number) => {
  const raspuns = await api.put(`/alerte/${idAlerta}/ignora`);
  return raspuns.data;
};
