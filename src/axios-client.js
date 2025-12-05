import axios from "axios";

const axiosClient = axios.create({
  // Mengambil URL dari Environment Variable Vercel
  // Jika tidak ada (local), fallback ke localhost
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

// Interceptor: Selipkan Token di setiap request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Jika token salah, hapus
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
      if (response && response.status === 401) {
        const requestUrl = (error.config && error.config.url) || '';
        if (!requestUrl.endsWith('/login')) {
          localStorage.removeItem('ACCESS_TOKEN');
          try { window.location.href = '/login'; } catch (e) { /* noop */ }
        }
      }
    throw error;
  }
);

export default axiosClient;