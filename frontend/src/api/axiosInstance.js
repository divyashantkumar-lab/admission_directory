import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export default axiosInstance;
