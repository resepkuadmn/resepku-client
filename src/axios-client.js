import axios from "axios";

const axiosClient = axios.create({
  // Mengambil URL dari Environment Variable Vercel
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
        // Cek agar tidak infinite loop di halaman login
        const requestUrl = (error.config && error.config.url) || '';
        if (!requestUrl.endsWith('/login')) {
            localStorage.removeItem('ACCESS_TOKEN');
            // Opsional: window.location.href = '/login';
        }
    }
    throw error;
  }
);

export default axiosClient;