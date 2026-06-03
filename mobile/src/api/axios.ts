import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.10.10.60:80/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
