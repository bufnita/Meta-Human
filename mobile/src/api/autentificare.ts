import api from './axios';

export const autentificare = async (email: string, parola: string) => {
  const raspuns = await api.post('/Auth/login', {
    Email: email,
    Parola: parola,
  });
  return raspuns.data;
};
