import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskList = ({ token, username }) => {
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:8000/tasks', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTasks(response.data);
            } catch (error) {
                setError('Failed to fetch tasks.');
                console.error('Error fetching tasks:', error);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token]);

    // Функция для удаления задачи
    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`http://localhost:8000/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Обновляем список задач после удаления
            setTasks(tasks.filter((task) => task.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
            setError('Failed to delete task.');
        }
    };

    // Функция для редактирования задачи
    const handleEdit = (taskId) => {
        navigate(`/edit/${taskId}`); // Перенаправляем на страницу редактирования задачи
    };

    // Функция выхода
    const handleLogout = () => {
        localStorage.removeItem('token');  // Удаляем токен из localStorage
        navigate('/');  // Перенаправляем на страницу задач
    };

    return (
        <div>
            <h2>Your Tasks</h2>
            <p>Welcome, {username}!</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {tasks.length === 0 ? (
                <p>No tasks available. Please create a new task.</p>
            ) : (
                tasks.map((task) => (
                    <div key={task.id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                        <p>Status: {task.is_completed ? 'Task Completed' : 'Task Not Completed'}</p>
                        <button onClick={() => handleEdit(task.id)}>Edit</button>
                        <button onClick={() => handleDelete(task.id)}>Delete</button>
                    </div>
                ))
            )}
            <button onClick={() => window.location.href = '/create'}>Create New Task</button>
            <button onClick={() => window.location.href = '/users'}>View List Of Users (admin)</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default TaskList;