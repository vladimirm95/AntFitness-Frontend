import api from './api';

export async function getExercises(filters = {}) {
    const params = {};

    if (filters.muscleGroup) params.muscleGroup = filters.muscleGroup;
    if (filters.category) params.category = filters.category;
    if (filters.equipment) params.equipment = filters.equipment;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.exerciseType) params.exerciseType = filters.exerciseType;

    const response = await api.get('/exercises', { params });
    return response.data;
}