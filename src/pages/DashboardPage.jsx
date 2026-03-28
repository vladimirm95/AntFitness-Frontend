import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';

function DashboardPage() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');

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
            } catch (error) {
                console.error('Failed to fetch user:', error);
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
            setMessage('No workout plan found for the selected date.');
        }
    }

    async function handleCreateWorkout() {
        if (!selectedDate) {
            setMessage('Select a date from the calendar first.');
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
            setMessage('Create or open a workout first.');
            return;
        }

        if (workout.completed) {
            setMessage('Completed workout cannot be changed.');
            return;
        }

        if (!exerciseForm.exerciseId || !exerciseForm.sets || !exerciseForm.reps) {
            setMessage('Fill all exercise fields.');
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
        if (!workout) {
            setMessage('No workout selected.');
            return;
        }

        if (workout.completed) {
            setMessage('Completed workout cannot be changed.');
            return;
        }

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
    const isWorkoutCompleted = workout?.completed === true;

    return (
        <div>
            <section className="hero-card">
                <h1 className="hero-title">
                    Welcome back{user?.username ? `, ${user.username}` : ''}.
                </h1>
                <p className="hero-subtitle">
                    Plan your workouts, stay consistent, and keep your progress organized in one place.
                </p>
                {message && <div className="status-message" style={{ marginTop: '18px' }}>{message}</div>}
            </section>

            <div className="dashboard-grid">
                <section className="card">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            marginBottom: '18px',
                        }}
                    >
                        <h3 style={{ margin: 0 }}>Workout Calendar</h3>
                        <div className="inline-row">
                            <button className="btn-secondary" onClick={previousMonth}>
                                ←
                            </button>
                            <strong style={{ minWidth: '140px', textAlign: 'center' }}>
                                {getMonthName(currentMonth)} {currentYear}
                            </strong>
                            <button className="btn-secondary" onClick={nextMonth}>
                                →
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '10px',
                            marginBottom: '12px',
                        }}
                    >
                        {dayNames.map((name) => (
                            <div
                                key={name}
                                style={{
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    color: '#64748b',
                                    paddingBottom: '6px',
                                }}
                            >
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

                            let backgroundColor = '#f8fafc';
                            let border = '1px solid #e2e8f0';

                            if (status === 'planned') {
                                backgroundColor = '#dbeafe';
                                border = '1px solid #bfdbfe';
                            }

                            if (status === 'completed') {
                                backgroundColor = '#dcfce7';
                                border = '1px solid #bbf7d0';
                            }

                            if (isSelected) {
                                backgroundColor = '#fde68a';
                                border = '1px solid #fcd34d';
                            }

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    style={{
                                        height: '48px',
                                        borderRadius: '14px',
                                        background: backgroundColor,
                                        border,
                                        fontWeight: 700,
                                    }}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '18px',
                            flexWrap: 'wrap',
                            marginTop: '18px',
                            color: '#475569',
                            fontSize: '14px',
                        }}
                    >
                        <span><span style={{ color: '#2563eb' }}>●</span> Planned</span>
                        <span><span style={{ color: '#16a34a' }}>●</span> Completed</span>
                        <span><span style={{ color: '#f59e0b' }}>●</span> Selected</span>
                    </div>
                </section>

                <section className="card">
                    <h3 style={{ marginBottom: '10px' }}>Workout Details</h3>

                    <p style={{ color: '#64748b', marginBottom: '18px' }}>
                        Selected date: <strong style={{ color: '#0f172a' }}>{selectedDate || 'No date selected'}</strong>
                    </p>

                    <div className="form-actions" style={{ marginBottom: '18px' }}>
                        <button
                            className="btn-primary"
                            onClick={handleCreateWorkout}
                            disabled={!selectedDate}
                        >
                            Create Workout
                        </button>

                        {workout && (
                            <button
                                className="btn-secondary"
                                onClick={handleCompleteWorkout}
                                disabled={workout.completed}
                            >
                                {workout.completed ? 'Workout Completed' : 'Mark as Completed'}
                            </button>
                        )}
                    </div>

                    {!workout ? (
                        <div
                            style={{
                                padding: '18px',
                                borderRadius: '16px',
                                background: '#f8fafc',
                                border: '1px dashed #cbd5e1',
                                color: '#64748b',
                            }}
                        >
                            Select a date and create a workout plan.
                        </div>
                    ) : (
                        <div
                            style={{
                                opacity: isWorkoutCompleted ? 0.7 : 1,
                                transition: 'opacity 0.2s ease',
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: '18px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: isWorkoutCompleted ? '#f8fafc' : '#eff6ff',
                                    border: '1px solid #dbeafe',
                                }}
                            >
                                <div className="form-group">
                                    <label className="form-label">Exercise</label>
                                    <select
                                        name="exerciseId"
                                        value={exerciseForm.exerciseId}
                                        onChange={handleExerciseFormChange}
                                        disabled={isWorkoutCompleted}
                                    >
                                        <option value="">Select exercise</option>
                                        {allExercises.map((exercise) => (
                                            <option key={exercise.id} value={exercise.id}>
                                                {exercise.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '12px',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <div>
                                        <label className="form-label">Sets</label>
                                        <input
                                            type="number"
                                            name="sets"
                                            value={exerciseForm.sets}
                                            onChange={handleExerciseFormChange}
                                            disabled={isWorkoutCompleted}
                                            placeholder="e.g. 4"
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label">Reps</label>
                                        <input
                                            type="number"
                                            name="reps"
                                            value={exerciseForm.reps}
                                            onChange={handleExerciseFormChange}
                                            disabled={isWorkoutCompleted}
                                            placeholder="e.g. 10"
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleAddExercise}
                                    disabled={isWorkoutCompleted}
                                >
                                    Add Exercise
                                </button>
                            </div>

                            {isWorkoutCompleted && (
                                <div className="status-message" style={{ marginBottom: '16px' }}>
                                    This workout is completed and can no longer be changed.
                                </div>
                            )}

                            <h4 style={{ marginBottom: '12px' }}>Exercises</h4>

                            {workout.exercises.length === 0 ? (
                                <div
                                    style={{
                                        padding: '16px',
                                        borderRadius: '16px',
                                        background: '#f8fafc',
                                        border: '1px dashed #cbd5e1',
                                        color: '#64748b',
                                    }}
                                >
                                    No exercises added yet.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {workout.exercises.map((exercise) => (
                                        <div
                                            key={exercise.id}
                                            style={{
                                                padding: '16px',
                                                borderRadius: '16px',
                                                border: '1px solid #e2e8f0',
                                                background: '#ffffff',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 800, marginBottom: '8px' }}>
                                                        {exercise.exerciseName}
                                                    </div>
                                                    <div style={{ color: '#64748b' }}>
                                                        Sets: <strong style={{ color: '#0f172a' }}>{exercise.sets}</strong>
                                                        {' • '}
                                                        Reps: <strong style={{ color: '#0f172a' }}>{exercise.reps}</strong>
                                                        {' • '}
                                                        Order: <strong style={{ color: '#0f172a' }}>{exercise.orderIndex}</strong>
                                                    </div>
                                                </div>

                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleDeleteExercise(exercise.id)}
                                                    disabled={isWorkoutCompleted}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default DashboardPage;