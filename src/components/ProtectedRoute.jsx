import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

function ProtectedRoute({ children }) {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let isMounted = true;

        async function checkAuth() {
            try {
                const authenticated = await isAuthenticated();

                if (!isMounted) {
                    return;
                }

                if (authenticated) {
                    setStatus('allowed');
                } else {
                    setStatus('forbidden');
                }
            } catch {
                if (isMounted) {
                    setStatus('forbidden');
                }
            }
        }

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'forbidden') {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;