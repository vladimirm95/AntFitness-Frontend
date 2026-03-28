import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExercisesPage from './pages/ExercisesPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';

function App() {
    return (
        <>
            <Navbar />

            <main className="page-shell">
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
                        path="/admin/users"
                        element={
                            <AdminRoute>
                                <AdminUsersPage />
                            </AdminRoute>
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
            </main>
        </>
    );
}

export default App;