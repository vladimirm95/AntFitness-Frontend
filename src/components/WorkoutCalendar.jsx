import { useEffect, useState } from 'react';
import { getWorkoutCalendar, getWorkoutByDate } from '../services/authService';

function WorkoutCalendar() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
    const [calendarData, setCalendarData] = useState([]); // [{date, completed}]
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [loadingWorkout, setLoadingWorkout] = useState(false);
    const [message, setMessage] = useState('');

    // Učitaj kalendar kad se promeni mesec
    useEffect(() => {
        async function fetchCalendar() {
            try {
                const data = await getWorkoutCalendar(year, month);
                setCalendarData(data);
            } catch (error) {
                console.error('Failed to fetch calendar:', error);
            }
        }
        fetchCalendar();
        setSelectedDate(null);
        setSelectedWorkout(null);
    }, [year, month]);

    // Klik na dan
    async function handleDayClick(dateStr) {
        // Toggle — klik na isti dan zatvara
        if (selectedDate === dateStr) {
            setSelectedDate(null);
            setSelectedWorkout(null);
            return;
        }

        setSelectedDate(dateStr);
        setSelectedWorkout(null);
        setMessage('');

        const dayInfo = calendarData.find(d => d.date === dateStr);
        if (!dayInfo) {
            setMessage('No workout for this day.');
            return;
        }

        setLoadingWorkout(true);
        try {
            const workout = await getWorkoutByDate(dateStr);
            setSelectedWorkout(workout);
        } catch (error) {
            setMessage('Failed to load workout.');
        } finally {
            setLoadingWorkout(false);
        }
    }

    function prevMonth() {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    }

    function nextMonth() {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    }

    // Generiši dane u mesecu
    function buildDays() {
        const firstDay = new Date(year, month - 1, 1).getDay(); // 0=ned
        const daysInMonth = new Date(year, month, 0).getDate();
        // Pomeri da nedelja bude poslednja (EU format: pon=0)
        const startOffset = (firstDay + 6) % 7;
        return { daysInMonth, startOffset };
    }

    function getDayStatus(day) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const found = calendarData.find(d => d.date === dateStr);
        if (!found) return 'none';
        return found.completed ? 'completed' : 'planned';
    }

    function formatDateStr(day) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const { daysInMonth, startOffset } = buildDays();
    const monthNames = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
    const dayNames = ['Pon','Uto','Sri','Čet','Pet','Sub','Ned'];

    return (
        <div style={{ maxWidth: '400px', marginTop: '20px' }}>
            {/* Header navigacija */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button onClick={prevMonth}>{'<'}</button>
                <strong>{monthNames[month - 1]} {year}</strong>
                <button onClick={nextMonth}>{'>'}</button>
            </div>

            {/* Dani u nedelji */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '4px' }}>
                {dayNames.map(d => (
                    <div key={d} style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>{d}</div>
                ))}
            </div>

            {/* Kalendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {/* Prazne ćelije pre prvog dana */}
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Dani */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dateStr = formatDateStr(day);
                    const status = getDayStatus(day);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === today.toISOString().split('T')[0];

                    let bg = '#f0f0f0';
                    if (status === 'completed') bg = '#4caf50';
                    if (status === 'planned') bg = '#2196f3';

                    return (
                        <div
                            key={day}
                            onClick={() => handleDayClick(dateStr)}
                            style={{
                                padding: '8px 4px',
                                textAlign: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: bg,
                                color: status !== 'none' ? 'white' : 'black',
                                fontWeight: isToday ? 'bold' : 'normal',
                                outline: isSelected ? '2px solid #333' : 'none',
                                fontSize: '14px',
                            }}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px' }}>
                <span><span style={{ color: '#2196f3' }}>●</span> Planned</span>
                <span><span style={{ color: '#4caf50' }}>●</span> Completed</span>
            </div>

            {/* Expand sekcija ispod kalendara */}
            {selectedDate && (
                <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Workout — {selectedDate}</h4>

                    {loadingWorkout && <p>Loading...</p>}

                    {!loadingWorkout && message && <p style={{ color: '#999' }}>{message}</p>}

                    {!loadingWorkout && selectedWorkout && (
                        <>
                            <p style={{ margin: '0 0 8px 0' }}>
                                Status: <strong>{selectedWorkout.completed ? '✅ Completed' : '🔵 Planned'}</strong>
                            </p>

                            {selectedWorkout.exercises.length === 0 ? (
                                <p style={{ color: '#999' }}>No exercises added.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                    <tr style={{ borderBottom: '1px solid #ccc' }}>
                                        <th style={{ textAlign: 'left', padding: '4px' }}>Exercise</th>
                                        <th style={{ textAlign: 'center', padding: '4px' }}>Sets</th>
                                        <th style={{ textAlign: 'center', padding: '4px' }}>Reps</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedWorkout.exercises.map(ex => (
                                        <tr key={ex.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '4px' }}>{ex.exerciseName}</td>
                                            <td style={{ textAlign: 'center', padding: '4px' }}>{ex.sets}</td>
                                            <td style={{ textAlign: 'center', padding: '4px' }}>{ex.reps}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default WorkoutCalendar;