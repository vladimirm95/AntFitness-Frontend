import { useState } from 'react';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

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
            setMessage('Registration successful!');

            // redirect na login
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            setMessage('Registration failed.');
        }
    }

    return (
        <div>
            <h2>Signup Page</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <br />
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" style={{ marginTop: '10px' }}>
                    Signup
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default SignupPage;