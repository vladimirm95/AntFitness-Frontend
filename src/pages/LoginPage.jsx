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
            const data = await loginUser(formData);
            console.log('Login success:', data);

            localStorage.setItem('token', data.token);
            setMessage('Login successful!');

            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            setMessage('Login failed.');
        }
    }

    return (
        <div>
            <h2>Login Page</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username or Email</label>
                    <br />
                    <input
                        type="text"
                        name="usernameOrEmail"
                        value={formData.usernameOrEmail}
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
                    Login
                </button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default LoginPage;