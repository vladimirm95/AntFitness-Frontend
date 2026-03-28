import api from './api';

export async function getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data;
}

export async function createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
}

export async function deleteUser(userId) {
    await api.delete(`/admin/users/${userId}`);
}