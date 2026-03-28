import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
    });

    const [message, setMessage] = useState('');

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await loginUser(formData);
            setMessage('');
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            setMessage(error.response?.data?.message || 'Login failed.');
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">
                    Login to continue managing your workouts and progress.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username or Email</label>
                        <input
                            type="text"
                            name="usernameOrEmail"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            placeholder="Enter username or email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                        />
                    </div>

                    <div className="form-actions" style={{ marginTop: '8px' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Login
                        </button>
                    </div>
                </form>

                {message && <div className="status-message">{message}</div>}
            </div>
        </div>
    );
}

export default LoginPage;