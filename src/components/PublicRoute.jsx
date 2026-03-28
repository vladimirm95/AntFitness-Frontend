import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

function PublicRoute({ children }) {
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
                    setStatus('authenticated');
                } else {
                    setStatus('guest');
                }
            } catch (error) {
                if (isMounted) {
                    setStatus('guest');
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

    if (status === 'authenticated') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default PublicRoute;