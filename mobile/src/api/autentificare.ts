import api from './axios';

export const autentificare = async (email: string, parola: string) => {
  const raspuns = await api.post('/auth/login', {
    email,
    parola,
  });

  return raspuns.data;
};
