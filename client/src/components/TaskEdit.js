import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const TaskEdit = ({ token }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { taskId } = useParams(); // Получаем taskId из URL

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const task = response.data;
                setTitle(task.title);
                setDescription(task.description);
                setIsCompleted(task.is_completed);
            } catch (error) {
                setError('Failed to fetch task details.');
                console.error('Error fetching task:', error);
            }
        };

        fetchTask();
    }, [taskId, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(
                `http://localhost:8000/tasks/${taskId}`,
                {
                    title,
                    description,
                    is_completed: isCompleted,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            navigate('/tasks'); // Перенаправляем обратно на страницу задач после обновления
        } catch (error) {
            setError('Failed to update task.');
            console.error('Error updating task:', error);
        }
    };

    return (
        <div>
            <h2>Edit Task</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div>
                    <label>Task Status</label>
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => setIsCompleted(e.target.checked)}
                    />
                </div>
                <button type="submit">Update Task</button>
            </form>
        </div>
    );
};

export default TaskEdit;