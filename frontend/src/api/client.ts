import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const client = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const clearAuthHeaders = () => {
    delete client.defaults.headers.common['Authorization'];
};

// Add response interceptor to handle token refresh
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                // Make sure we're not including the old token in this request
                const refreshConfig = {
                    headers: { 
                        'Content-Type': 'application/json'
                    }
                };

                const response = await axios.post(
                    `${API_URL}/api/auth/token/refresh/`,
                    { refresh: refreshToken },
                    refreshConfig
                );

                const { access } = response.data;
                localStorage.setItem('token', access);

                // Update the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return client(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                
                // Instead of navigating directly (which breaks SPA routing),
                // redirect to the base URL and let React Router handle it
                window.location.href = window.location.origin;
                
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);