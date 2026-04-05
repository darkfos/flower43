import axios from "axios";

export const api = axios.create({
    baseURL: 'https://flowers-site161.ru/api',
    timeout: 2800,
    headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
    } 
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            };
            
            await fetch('https://flowers-site161.ru/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return config
        } finally {
            return config;
        }
    },
    async (error) => Promise.reject(error)
);