import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    function handleLogout() {
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            {!token ? (
                <>
                    <Link to="/login" style={{ marginRight: '10px' }}>
                        Login
                    </Link>
                    <Link to="/signup">Signup</Link>
                </>
            ) : (
                <>
                    <Link to="/" style={{ marginRight: '10px' }}>
                        Dashboard
                    </Link>
                    <Link to="/exercises" style={{ marginRight: '10px' }}>
                        Exercises
                    </Link>

                    <button onClick={handleLogout}>Logout</button>
                </>
            )}
        </nav>
    );
}

export default Navbar;