import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage if available
  useEffect(() => {
    const token = localStorage.getItem('api_token');
    if (token) {
      // You could call an API like /me to fetch the real user by token
      // For now, just keep a placeholder
      setUser({
        id: 0,
        name: 'Anonymous',
        email: '',
        api_token: token,
        created_at: '',
        updated_at: ''
      });
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* If logged in, redirect login/register → dashboard */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register onRegister={setUser} />}
        />

        {/* Dashboard is the main ("/") route */}
        <Route
          path="/"
          element={
            user ? (
              <Dashboard
                user={user}
                onLogout={() => {
                  localStorage.removeItem('api_token');
                  setUser(null);
                }}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all: if unknown route, go to main page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
