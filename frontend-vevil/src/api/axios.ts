import axios from 'axios';
import { getApiBaseUrl } from '../services/api';

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Importante: incluir cookies HttpOnly
});

// Ya no necesitamos interceptor de token - ahora usamos HttpOnly cookies
// El navegador maneja automáticamente las cookies con cada request

export default apiClient;
