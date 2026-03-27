import { useEffect, useState } from 'react';
import { getExercises } from '../services/authService';

function ExercisesPage() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExercises() {
            try {
                const data = await getExercises();
                setExercises(data);
            } catch (error) {
                console.error('Failed to fetch exercises:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchExercises();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Exercises</h2>

            {exercises.map((ex) => (
                <div key={ex.id} style={{ marginBottom: '10px' }}>
                    <h4>{ex.name}</h4>
                    <p>{ex.description}</p>
                    <p><b>{ex.muscleGroup}</b></p>
                </div>
            ))}
        </div>
    );
}

export default ExercisesPage;