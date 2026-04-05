import axios from "axios";

export const api = axios.create({
    baseURL: 'http://localhost:5000/api',
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
            
            await fetch('http://localhost:5000/api/auth/me', {
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