import { useEffect, useState } from 'react';
import { getAllUsers, createUser, deleteUser } from '../services/adminService';
import { getCurrentUser } from '../services/authService';

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER',
    });

    useEffect(() => {
        async function loadData() {
            try {
                const me = await getCurrentUser();
                setCurrentUser(me);

                const allUsers = await getAllUsers();
                setUsers(allUsers);
                setMessage('');
            } catch (error) {
                console.error('Failed to load admin users:', error);
                setMessage(error.response?.data?.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleCreateUser(e) {
        e.preventDefault();

        try {
            const newUser = await createUser(formData);
            setUsers((prev) => [...prev, newUser]);

            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'USER',
            });

            setMessage('User created successfully.');
        } catch (error) {
            console.error('Failed to create user:', error);
            setMessage(error.response?.data?.message || 'Failed to create user.');
        }
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm('Delete this user?')) {
            return;
        }

        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setMessage('User deleted successfully.');
        } catch (error) {
            console.error('Failed to delete user:', error);
            setMessage(error.response?.data?.message || 'Failed to delete user.');
        }
    }

    if (loading) {
        return <p>Loading admin page...</p>;
    }

    return (
        <div>
            <h2>Admin Users</h2>

            {message && <p>{message}</p>}

            <h3>Create user</h3>
            <form onSubmit={handleCreateUser}>
                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

                <button type="submit">Create User</button>
            </form>

            <h3>All users</h3>

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => {
                    const isMe = currentUser?.id === user.id;

                    return (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={isMe}
                                >
                                    {isMe ? 'Cannot delete yourself' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUsersPage;