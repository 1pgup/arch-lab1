import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const UserList = ({ token }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [adminUsername, setAdminUsername] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (error) {
                setError('Failed to fetch users.');
                console.error('Error fetching users:', error);
            }
        };

        if (token) {
            const decodedToken = jwtDecode(token);
            setAdminUsername(decodedToken.sub);
            fetchUsers();
        }
    }, [token]);

    const handleDelete = async (userId) => {
        try {
            await axios.delete(`http://localhost:8000/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter((user) => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user.');
        }
    };

    return (
        <div>
            <h2>Manage Users</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {users.length === 0 ? (
                <p>No users available.</p>
            ) : (
                users
                    .filter(user => user.username !== adminUsername)  // Исключаем админа из списка
                    .map((user) => (
                        <div key={user.id}>
                            <h3>{user.username}</h3>
                            <p>Email: {user.email}</p>
                            <p>Role: {user.role}</p>
                            <button onClick={() => handleDelete(user.id)}>Delete User</button>
                        </div>
                    ))
            )}
        </div>
    );
};

export default UserList;