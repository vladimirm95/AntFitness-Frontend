import { useEffect, useMemo, useState } from 'react';
import { getExercises } from '../services/exerciseService';

const muscleGroups = [
    '',
    'CHEST',
    'BACK',
    'LEGS',
    'SHOULDERS',
    'ARMS',
    'CORE',
    'FULL_BODY',
];

const categories = ['', 'STRENGTH', 'CARDIO', 'MOBILITY', 'CORE'];
const equipmentOptions = ['', 'BODYWEIGHT', 'DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'KETTLEBELL', 'BAND'];
const difficultyOptions = ['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function formatLabel(value) {
    if (!value) return 'All';
    return value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function ExercisesPage() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [filters, setFilters] = useState({
        muscleGroup: '',
        category: '',
        equipment: '',
        difficulty: '',
    });

    const [search, setSearch] = useState('');

    useEffect(() => {
        async function loadExercises() {
            setLoading(true);

            try {
                const data = await getExercises(filters);
                setExercises(data);
                setMessage('');
            } catch (error) {
                console.error('Failed to load exercises:', error);
                setExercises([]);
                setMessage('Failed to load exercises.');
            } finally {
                setLoading(false);
            }
        }

        loadExercises();
    }, [filters]);

    function handleFilterChange(e) {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const filteredExercises = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return exercises;
        }

        return exercises.filter((exercise) =>
            exercise.name.toLowerCase().includes(term) ||
            (exercise.description && exercise.description.toLowerCase().includes(term)) ||
            exercise.muscleGroup.toLowerCase().includes(term) ||
            exercise.category.toLowerCase().includes(term) ||
            exercise.equipment.toLowerCase().includes(term)
        );
    }, [exercises, search]);

    return (
        <div>
            <section className="exercises-header">
                <h1 className="exercises-title">Exercises Library</h1>
                <p className="exercises-subtitle">
                    Explore exercises by muscle group, category, equipment, and difficulty.
                    Build smarter workouts with a cleaner and more organized exercise library.
                </p>
            </section>

            <section className="card" style={{ marginBottom: '22px' }}>
                <div className="exercises-toolbar">
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        name="muscleGroup"
                        value={filters.muscleGroup}
                        onChange={handleFilterChange}
                    >
                        {muscleGroups.map((value) => (
                            <option key={value || 'all-muscle'} value={value}>
                                {value ? formatLabel(value) : 'All Muscle Groups'}
                            </option>
                        ))}
                    </select>

                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                    >
                        {categories.map((value) => (
                            <option key={value || 'all-category'} value={value}>
                                {value ? formatLabel(value) : 'All Categories'}
                            </option>
                        ))}
                    </select>

                    <select
                        name="equipment"
                        value={filters.equipment}
                        onChange={handleFilterChange}
                    >
                        {equipmentOptions.map((value) => (
                            <option key={value || 'all-equipment'} value={value}>
                                {value ? formatLabel(value) : 'All Equipment'}
                            </option>
                        ))}
                    </select>

                    <select
                        name="difficulty"
                        value={filters.difficulty}
                        onChange={handleFilterChange}
                    >
                        {difficultyOptions.map((value) => (
                            <option key={value || 'all-difficulty'} value={value}>
                                {value ? formatLabel(value) : 'All Difficulties'}
                            </option>
                        ))}
                    </select>
                </div>

                {message && <div className="status-message">{message}</div>}
            </section>

            {loading ? (
                <div className="exercise-empty">Loading exercises...</div>
            ) : filteredExercises.length === 0 ? (
                <div className="exercise-empty">
                    No exercises found for the selected filters or search term.
                </div>
            ) : (
                <section className="exercises-grid">
                    {filteredExercises.map((exercise) => (
                        <article key={exercise.id} className="exercise-card">
                            <div className="exercise-top">
                                <div>
                                    <h3 className="exercise-name">{exercise.name}</h3>
                                    <span className="exercise-main-group">
                                        {formatLabel(exercise.muscleGroup)}
                                    </span>
                                </div>
                            </div>

                            <p className="exercise-description">
                                {exercise.description || 'No description available.'}
                            </p>

                            <div className="exercise-tags">
                                <span className="exercise-tag">
                                    {formatLabel(exercise.category)}
                                </span>
                                <span className="exercise-tag">
                                    {formatLabel(exercise.exerciseType)}
                                </span>
                                <span className="exercise-tag">
                                    {formatLabel(exercise.equipment)}
                                </span>
                                <span className="exercise-tag">
                                    {formatLabel(exercise.difficulty)}
                                </span>
                                <span className="exercise-tag">
                                    {formatLabel(exercise.movementPattern)}
                                </span>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
}

export default ExercisesPage;