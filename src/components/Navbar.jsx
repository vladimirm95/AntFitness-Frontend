import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/signup" style={{ marginRight: '10px' }}>Signup</Link>

            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
                Logout
            </button>
        </nav>
    );
}

export default Navbar;