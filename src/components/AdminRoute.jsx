import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        async function checkAdmin() {
            if (!token) {
                setStatus('forbidden');
                return;
            }

            try {
                const user = await getCurrentUser();

                if (user.role === 'ADMIN') {
                    setStatus('allowed');
                } else {
                    setStatus('forbidden');
                }
            } catch (error) {
                console.error('Admin check failed:', error);
                setStatus('forbidden');
            }
        }

        checkAdmin();
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'forbidden') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;