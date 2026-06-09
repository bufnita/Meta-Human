import api from './axios';

export const obtineMedici = async () => {
  const raspuns = await api.get('/medici');
  return raspuns.data;
};

export const obtineMedic = async (idMedic: number) => {
  const raspuns = await api.get(`/medici/${idMedic}`);
  return raspuns.data;
};

export const creeazaMedic = async (date: any) => {
  const raspuns = await api.post('/medici', date);
  return raspuns.data;
};

export const actualizeazaMedic = async (idMedic: number, date: any) => {
  const raspuns = await api.put(`/medici/${idMedic}`, date);
  return raspuns.data;
};

export const dezactiveazaMedic = async (idMedic: number) => {
  await api.patch(`/medici/${idMedic}/dezactivare`);
};

export const activeazaMedic = async (idMedic: number) => {
  await api.patch(`/medici/${idMedic}/activare`);
};

export const stergeMedic = async (idMedic: number) => {
  await api.delete(`/medici/${idMedic}`);
};
