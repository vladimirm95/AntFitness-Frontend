import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';

function DashboardPage() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {
        async function fetchUser() {
            try {
                const data = await getCurrentUser();
                setUser(data);
                setMessage('');
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setMessage('You are not authenticated.');
            }
        }

        fetchUser();
    }, []);

    return (
        <div>
            <h2>Dashboard Page</h2>

            {message && <p>{message}</p>}

            {user && (
                <div>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;