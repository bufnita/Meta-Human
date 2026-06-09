import api from './axios';

export const obtinePacienti = async () => {
  const raspuns = await api.get('/pacienti');
  return raspuns.data;
};

export const obtinePacient = async (idPacient: number) => {
  const raspuns = await api.get(`/pacienti/${idPacient}`);
  return raspuns.data;
};

export const creeazaPacient = async (date: any) => {
  const raspuns = await api.post('/pacienti', date);
  return raspuns.data;
};

export const actualizeazaPacient = async (idPacient: number, date: any) => {
  const raspuns = await api.put(`/pacienti/${idPacient}`, date);
  return raspuns.data;
};

export const dezactiveazaPacient = async (idPacient: number) => {
  await api.patch(`/pacienti/${idPacient}/dezactivare`);
};

export const activeazaPacient = async (idPacient: number) => {
  await api.patch(`/pacienti/${idPacient}/activare`);
};

export const stergePacient = async (idPacient: number) => {
  await api.delete(`/pacienti/${idPacient}`);
};

export const obtineIstoricPacient = async (idPacient: number, ultimele = 20) => {
  const raspuns = await api.get(`/pacienti/${idPacient}/istoric`, {
    params: {
      ultimele,
    },
  });

  return raspuns.data;
};

export const obtineAlertePacientDupaId = async (idPacient: number) => {
  const raspuns = await api.get(`/pacienti/${idPacient}/alarme`);
  return raspuns.data;
};

export const obtinePraguriPacient = async (idPacient: number) => {
  const raspuns = await api.get(`/pacienti/${idPacient}/praguri`);
  return raspuns.data;
};

export const adaugaPragPacient = async (idPacient: number, date: any) => {
  const raspuns = await api.post(`/pacienti/${idPacient}/praguri`, date);
  return raspuns.data;
};

export const actualizeazaPragPacient = async (
  idPacient: number,
  idPrag: number,
  date: any,
) => {
  const raspuns = await api.put(`/pacienti/${idPacient}/praguri/${idPrag}`, date);
  return raspuns.data;
};

export const stergePragPacient = async (idPacient: number, idPrag: number) => {
  await api.delete(`/pacienti/${idPacient}/praguri/${idPrag}`);
};

export const obtineRecomandariPacientDupaId = async (idPacient: number) => {
  const raspuns = await api.get(`/pacienti/${idPacient}/recomandari`);
  return raspuns.data;
};

export const adaugaRecomandarePacient = async (idPacient: number, date: any) => {
  const raspuns = await api.post(`/pacienti/${idPacient}/recomandari`, date);
  return raspuns.data;
};

export const actualizeazaRecomandarePacient = async (
  idPacient: number,
  idRecomandare: number,
  date: any,
) => {
  const raspuns = await api.put(
    `/pacienti/${idPacient}/recomandari/${idRecomandare}`,
    date,
  );
  return raspuns.data;
};

export const stergeRecomandarePacient = async (
  idPacient: number,
  idRecomandare: number,
) => {
  await api.delete(`/pacienti/${idPacient}/recomandari/${idRecomandare}`);
};
