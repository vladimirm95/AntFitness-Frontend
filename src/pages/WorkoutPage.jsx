import { useEffect, useState } from 'react';
import api from '../services/api';

function WorkoutPage() {
    const [date, setDate] = useState('');
    const [workout, setWorkout] = useState(null);
    const [message, setMessage] = useState('');
    const [allExercises, setAllExercises] = useState([]);

    const [exerciseForm, setExerciseForm] = useState({
        exerciseId: '',
        sets: '',
        reps: '',
    });

    useEffect(() => {
        async function fetchExercises() {
            try {
                const response = await api.get('/exercises');
                setAllExercises(response.data);
            } catch (error) {
                console.error('Failed to load exercises:', error);
            }
        }

        fetchExercises();
    }, []);

    async function handleFetchWorkout() {
        if (!date) {
            setMessage('Please select a date.');
            return;
        }

        try {
            const response = await api.get(`/workouts?date=${date}`);
            setWorkout(response.data);
            setMessage('');
        } catch (error) {
            console.error('Failed to fetch workout:', error);
            setWorkout(null);
            setMessage('Workout plan not found for this date.');
        }
    }

    async function handleCreateWorkout() {
        if (!date) {
            setMessage('Please select a date.');
            return;
        }

        try {
            const response = await api.post('/workouts', { date });
            setWorkout(response.data);
            setMessage('Workout plan created successfully.');
        } catch (error) {
            console.error('Failed to create workout:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to create workout plan.');
        }
    }

    async function handleCompleteWorkout() {
        if (!workout) {
            setMessage('Load or create a workout first.');
            return;
        }

        try {
            const response = await api.put(`/workouts/${workout.id}/complete`);
            setWorkout(response.data);
            setMessage('Workout marked as completed.');
        } catch (error) {
            console.error('Failed to complete workout:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to complete workout.');
        }
    }

    async function handleDeleteExercise(workoutExerciseId) {
        try {
            await api.delete(`/workouts/exercises/${workoutExerciseId}`);

            setWorkout((prev) => ({
                ...prev,
                exercises: prev.exercises.filter(
                    (exercise) => exercise.id !== workoutExerciseId
                ),
            }));

            setMessage('Exercise deleted successfully.');
        } catch (error) {
            console.error('Failed to delete exercise:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to delete exercise.');
        }
    }

    function handleExerciseFormChange(e) {
        const { name, value } = e.target;

        setExerciseForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleAddExercise() {
        if (!workout) {
            setMessage('Load or create a workout first.');
            return;
        }

        if (!exerciseForm.exerciseId || !exerciseForm.sets || !exerciseForm.reps) {
            setMessage('Please fill all exercise fields.');
            return;
        }

        try {
            const response = await api.post(`/workouts/${workout.id}/exercises`, {
                exerciseId: Number(exerciseForm.exerciseId),
                sets: Number(exerciseForm.sets),
                reps: Number(exerciseForm.reps),
            });

            setWorkout(response.data);
            setMessage('Exercise added successfully.');

            setExerciseForm({
                exerciseId: '',
                sets: '',
                reps: '',
            });
        } catch (error) {
            console.error('Failed to add exercise:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to add exercise.');
        }
    }

    return (
        <div>
            <h2>Workout Page</h2>

            <div>
                <label>Select date:</label>
                <br />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <button onClick={handleFetchWorkout} style={{ marginLeft: '10px' }}>
                    Load Workout
                </button>

                <button onClick={handleCreateWorkout} style={{ marginLeft: '10px' }}>
                    Create Workout
                </button>
            </div>

            {message && <p>{message}</p>}

            {workout && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Workout for {workout.date}</h3>

                    <p>
                        <strong>Completed:</strong> {workout.completed ? 'Yes' : 'No'}
                    </p>

                    <button
                        onClick={handleCompleteWorkout}
                        disabled={workout.completed}
                        style={{ marginBottom: '10px' }}
                    >
                        {workout.completed ? 'Workout Completed' : 'Mark as Completed'}
                    </button>

                    <hr />

                    <h4>Add Exercise</h4>

                    <div>
                        <select
                            name="exerciseId"
                            value={exerciseForm.exerciseId}
                            onChange={handleExerciseFormChange}
                        >
                            <option value="">Select exercise</option>
                            {allExercises.map((exercise) => (
                                <option key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="sets"
                            placeholder="Sets"
                            value={exerciseForm.sets}
                            onChange={handleExerciseFormChange}
                            style={{ marginLeft: '10px' }}
                        />

                        <input
                            type="number"
                            name="reps"
                            placeholder="Reps"
                            value={exerciseForm.reps}
                            onChange={handleExerciseFormChange}
                            style={{ marginLeft: '10px' }}
                        />

                        <button onClick={handleAddExercise} style={{ marginLeft: '10px' }}>
                            Add Exercise
                        </button>
                    </div>

                    <hr />

                    <h4>Exercises:</h4>

                    {workout.exercises.length === 0 ? (
                        <p>No exercises in this workout.</p>
                    ) : (
                        workout.exercises.map((exercise) => (
                            <div key={exercise.id} style={{ marginBottom: '10px' }}>
                                <p><strong>{exercise.exerciseName}</strong></p>
                                <p>Sets: {exercise.sets}</p>
                                <p>Reps: {exercise.reps}</p>
                                <p>Order: {exercise.orderIndex}</p>

                                <button onClick={() => handleDeleteExercise(exercise.id)}>
                                    Delete Exercise
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkoutPage;