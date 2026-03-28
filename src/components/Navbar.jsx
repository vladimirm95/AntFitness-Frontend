import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, logoutUser } from '../services/authService';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDropdown, setOpenDropdown] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadUser() {
            const publicPaths = ['/login', '/signup'];

            if (publicPaths.includes(location.pathname)) {
                if (isMounted) {
                    setCurrentUser(null);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);

            try {
                const user = await getCurrentUser();

                if (isMounted) {
                    setCurrentUser(user);
                }
            } catch {
                if (isMounted) {
                    setCurrentUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            isMounted = false;
        };
    }, [location.pathname]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function handleLogout() {
        try {
            await logoutUser();
        } finally {
            setCurrentUser(null);
            setOpenDropdown(false);
            navigate('/login');
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand">
                    AntFitness
                </Link>

                {loading ? (
                    <span className="nav-loading">Loading...</span>
                ) : !currentUser ? (
                    <div className="nav-links">
                        <Link to="/login" className="nav-btn nav-btn-secondary">
                            Login
                        </Link>
                        <Link to="/signup" className="nav-btn nav-btn-primary">
                            Signup
                        </Link>
                    </div>
                ) : (
                    <div className="nav-links">
                        <Link to="/" className="nav-btn nav-btn-secondary">
                            Dashboard
                        </Link>

                        <Link to="/exercises" className="nav-btn nav-btn-secondary">
                            Exercises
                        </Link>

                        {currentUser.role === 'ADMIN' && (
                            <Link to="/admin/users" className="nav-btn nav-btn-secondary">
                                Admin
                            </Link>
                        )}

                        <div className="nav-profile" ref={dropdownRef}>
                            <button
                                type="button"
                                className="profile-trigger"
                                onClick={() => setOpenDropdown((prev) => !prev)}
                            >
                                <div className="avatar">
                                    {currentUser.username?.charAt(0).toUpperCase()}
                                </div>

                                <span className="profile-arrow">▾</span>
                            </button>

                            {openDropdown && (
                                <div className="profile-dropdown">
                                    <div className="profile-header">
                                        <div className="profile-name">{currentUser.username}</div>
                                        <div className="profile-email">{currentUser.email}</div>
                                    </div>

                                    <div className="dropdown-divider" />

                                    <button
                                        className="dropdown-item"
                                        onClick={() => {
                                            setOpenDropdown(false);
                                            navigate('/settings');
                                        }}
                                    >
                                        Settings
                                    </button>

                                    <button
                                        className="dropdown-item"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;