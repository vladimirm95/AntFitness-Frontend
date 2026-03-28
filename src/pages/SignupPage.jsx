import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

function SignupPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
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
            await registerUser(formData);
            setMessage('');
            navigate('/');
        } catch (error) {
            console.error('Signup failed:', error);
            setMessage(error.response?.data?.message || 'Signup failed.');
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">
                    Join AntFitness and start organizing your training plan.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                        />
                    </div>

                    <div className="form-actions" style={{ marginTop: '8px' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Create account
                        </button>
                    </div>
                </form>

                {message && <div className="status-message">{message}</div>}
            </div>
        </div>
    );
}

export default SignupPage;