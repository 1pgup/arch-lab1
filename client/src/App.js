import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import TaskCreate from './components/TaskCreate';
import TaskEdit from './components/TaskEdit';
import UserList from './components/UserList';
import { jwtDecode } from 'jwt-decode';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setUsername(decodedToken.sub); // Извлекаем имя пользователя из токена
    }
  }, [token]);

  return (
    <Router>
      <div>
        {!token ? (
          <div>
            <h2>Welcome to Task Management App</h2>
            <p>Choose an option:</p>
            <div>
              <Link to="/login">Login</Link>
              <br />
              <Link to="/register">Register</Link>
            </div>
          </div>
        ) : (
          <div>
            <Routes>
              <Route path="/tasks" element={<TaskList token={token} username={username} />} />
              <Route path="/create" element={<TaskCreate token={token} />} />
              <Route path="/edit/:taskId" element={<TaskEdit token={token} />} />
              <Route path="/users" element={<UserList token={token} />} />
            </Routes>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Login setToken={setToken} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;