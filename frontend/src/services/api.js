import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            if (parsed && parsed.token) {
                // Ensure compatibility with Axios v1.x AxiosHeaders classes
                if (config.headers.set) {
                    config.headers.set('Authorization', `Bearer ${parsed.token}`);
                } else {
                    config.headers['Authorization'] = `Bearer ${parsed.token}`;
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
