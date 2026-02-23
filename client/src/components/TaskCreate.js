import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TaskCreate = ({ token }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:8000/tasks',
                {
                    title,
                    description,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // После успешного создания задачи перенаправляем на страницу задач
            navigate('/tasks');
        } catch (err) {
            setError('Failed to create task. Please try again.');
            console.error('Error creating task:', err);
        }
    };

    const handleViewTasks = () => {
        navigate('/tasks'); // Перенаправляем на страницу с задачами
    };

    return (
        <div>
            <h2>Create New Task</h2>
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
                <button type="submit">Create Task</button>
            </form>
            <button onClick={handleViewTasks}>View My Tasks</button> {/* Кнопка для просмотра задач */}
        </div>
    );
};

export default TaskCreate;