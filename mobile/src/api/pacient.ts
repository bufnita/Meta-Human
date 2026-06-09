import api from './axios';

export const obtineProfilPacient = async () => {
  const raspuns = await api.get('/pacient/profil');
  return raspuns.data;
};

export const obtineAlertePacient = async () => {
  const raspuns = await api.get('/pacient/alerte');
  return raspuns.data;
};

export const obtineRecomandariPacient = async () => {
  const raspuns = await api.get('/pacient/recomandari');
  return raspuns.data;
};
