import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';

function DashboardPage() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('Loading...');

    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

    const [calendarDays, setCalendarDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    const [workout, setWorkout] = useState(null);
    const [allExercises, setAllExercises] = useState([]);

    const [exerciseForm, setExerciseForm] = useState({
        exerciseId: '',
        sets: '',
        reps: '',
    });

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                setMessage('');
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setMessage('You are not authenticated.');
            }

            try {
                const response = await api.get('/exercises');
                setAllExercises(response.data);
            } catch (error) {
                console.error('Failed to load exercises:', error);
            }
        }

        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchCalendar();
    }, [currentYear, currentMonth]);

    async function fetchCalendar() {
        try {
            const response = await api.get(
                `/workouts/calendar?year=${currentYear}&month=${currentMonth}`
            );
            setCalendarDays(response.data);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        }
    }

    function formatDate(year, month, day) {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    }

    function getMonthName(month) {
        const names = [
            'Januar',
            'Februar',
            'Mart',
            'April',
            'Maj',
            'Jun',
            'Jul',
            'Avgust',
            'Septembar',
            'Oktobar',
            'Novembar',
            'Decembar',
        ];
        return names[month - 1];
    }

    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        const jsDay = new Date(year, month - 1, 1).getDay();
        return jsDay === 0 ? 7 : jsDay;
    }

    function getDayStatus(dateString) {
        const found = calendarDays.find((day) => day.date === dateString);
        if (!found) return null;
        return found.completed ? 'completed' : 'planned';
    }

    function handleDayClick(day) {
        const date = formatDate(currentYear, currentMonth, day);
        setSelectedDate(date);
        loadWorkoutByDate(date);
    }

    async function loadWorkoutByDate(date) {
        try {
            const response = await api.get(`/workouts?date=${date}`);
            setWorkout(response.data);
            setMessage('');
        } catch (error) {
            console.error('Failed to fetch workout:', error);
            setWorkout(null);
            setMessage('Workout plan not found for selected date.');
        }
    }

    async function handleCreateWorkout() {
        if (!selectedDate) {
            setMessage('Select a date from calendar first.');
            return;
        }

        try {
            const response = await api.post('/workouts', { date: selectedDate });
            setWorkout(response.data);
            setMessage('Workout created successfully.');
            fetchCalendar();
        } catch (error) {
            console.error('Failed to create workout:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to create workout.');
        }
    }

    async function handleCompleteWorkout() {
        if (!workout) {
            setMessage('No workout selected.');
            return;
        }

        try {
            const response = await api.put(`/workouts/${workout.id}/complete`);
            setWorkout(response.data);
            setMessage('Workout marked as completed.');
            fetchCalendar();
        } catch (error) {
            console.error('Failed to complete workout:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to complete workout.');
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
            setMessage('Fill all fields for exercise.');
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

            fetchCalendar();
        } catch (error) {
            console.error('Failed to add exercise:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to add exercise.');
        }
    }

    async function handleDeleteExercise(workoutExerciseId) {
        try {
            await api.delete(`/workouts/exercises/${workoutExerciseId}`);

            setWorkout((prev) => ({
                ...prev,
                exercises: prev.exercises.filter((ex) => ex.id !== workoutExerciseId),
            }));

            setMessage('Exercise deleted successfully.');
            fetchCalendar();
        } catch (error) {
            console.error('Failed to delete exercise:', error);
            const backendMessage = error.response?.data?.message;
            setMessage(backendMessage || 'Failed to delete exercise.');
        }
    }

    function previousMonth() {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear((prev) => prev - 1);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    }

    function nextMonth() {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear((prev) => prev + 1);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    }

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const dayNames = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

    return (
        <div>
            <h2>Dashboard Page</h2>

            {user && (
                <div style={{ marginBottom: '20px' }}>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>
            )}

            {message && <p>{message}</p>}

            <hr />

            <h3>Workout Calendar</h3>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '15px',
                }}
            >
                <button onClick={previousMonth}>{'<'}</button>
                <h3 style={{ margin: 0 }}>
                    {getMonthName(currentMonth)} {currentYear}
                </h3>
                <button onClick={nextMonth}>{'>'}</button>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 55px)',
                    gap: '8px',
                    marginBottom: '10px',
                }}
            >
                {dayNames.map((name) => (
                    <div key={name} style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {name}
                    </div>
                ))}

                {Array.from({ length: firstDay - 1 }).map((_, index) => (
                    <div key={`empty-${index}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const dateString = formatDate(currentYear, currentMonth, day);
                    const status = getDayStatus(dateString);
                    const isSelected = selectedDate === dateString;

                    let backgroundColor = '#f0f0f0';

                    if (status === 'planned') backgroundColor = '#cfe2ff';
                    if (status === 'completed') backgroundColor = '#d9f7be';
                    if (isSelected) backgroundColor = '#ffe58f';

                    return (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            style={{
                                width: '55px',
                                height: '40px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                backgroundColor,
                                cursor: 'pointer',
                            }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                <span style={{ marginRight: '15px' }}>
                    <span style={{ color: '#1677ff' }}>●</span> Planned
                </span>
                <span style={{ marginRight: '15px' }}>
                    <span style={{ color: '#52c41a' }}>●</span> Completed
                </span>
                <span>
                    <span style={{ color: '#faad14' }}>●</span> Selected
                </span>
            </div>

            <hr />

            <h3>Workout Details</h3>

            <p>
                <strong>Selected date:</strong>{' '}
                {selectedDate || 'No date selected'}
            </p>

            <div style={{ marginBottom: '15px' }}>
                <button onClick={handleCreateWorkout} disabled={!selectedDate}>
                    Create Workout For Selected Date
                </button>

                <button
                    onClick={() => loadWorkoutByDate(selectedDate)}
                    disabled={!selectedDate}
                    style={{ marginLeft: '10px' }}
                >
                    Load Workout
                </button>
            </div>

            {workout && (
                <div>
                    <p><strong>Date:</strong> {workout.date}</p>
                    <p>
                        <strong>Completed:</strong> {workout.completed ? 'Yes' : 'No'}
                    </p>

                    <button
                        onClick={handleCompleteWorkout}
                        disabled={workout.completed}
                        style={{ marginBottom: '15px' }}
                    >
                        {workout.completed ? 'Workout Completed' : 'Mark as Completed'}
                    </button>

                    <hr />

                    <h4>Add Exercise</h4>

                    <div style={{ marginBottom: '15px' }}>
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

                    <h4>Exercises</h4>

                    {workout.exercises.length === 0 ? (
                        <p>No exercises in this workout.</p>
                    ) : (
                        workout.exercises.map((exercise) => (
                            <div
                                key={exercise.id}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    padding: '10px',
                                    marginBottom: '10px',
                                }}
                            >
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

export default DashboardPage;