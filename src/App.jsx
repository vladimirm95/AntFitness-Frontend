import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExercisesPage from './pages/ExercisesPage.jsx';

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/exercises"
                    element={
                        <ProtectedRoute>
                            <ExercisesPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <SignupPage />
                        </PublicRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;