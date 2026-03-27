import api from './api';

export async function loginUser(loginData) {
    const response = await api.post('/auth/login', loginData);
    return response.data;
}

export async function registerUser(registerData) {
    const response = await api.post('/auth/signup', registerData);
    return response.data;
}

export async function getCurrentUser() {
    const token = localStorage.getItem('token');

    const response = await api.get('/users/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

export async function getWorkoutCalendar(year, month) {
    const response = await api.get(`/workouts/calendar?year=${year}&month=${month}`);
    return response.data;
}

export async function getWorkoutByDate(date) {
    const response = await api.get(`/workouts?date=${date}`);
    return response.data;
}

export async function getExercises() {
    const response = await api.get('/exercises');
    return response.data;
}