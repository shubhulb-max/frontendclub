import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const apiData = axios.create({
  baseURL: `API_BASE_URL/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Interceptor to automatically add the Token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('club_token'); // We will store it here after login
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default apiClient;