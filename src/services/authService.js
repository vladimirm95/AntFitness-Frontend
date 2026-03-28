import api from './api';

export async function loginUser(loginData) {
    const response = await api.post('/auth/login', loginData);
    return response.data;
}

export async function registerUser(registerData) {
    const response = await api.post('/auth/signup', registerData);
    return response.data;
}

export async function logoutUser() {
    const response = await api.post('/auth/logout');
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
}

export async function isAuthenticated() {
    try {
        const response = await api.get('/auth/status');
        return response.data === true;
    } catch {
        return false;
    }
}