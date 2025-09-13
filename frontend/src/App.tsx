import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import API, { setToken } from "./api";
import type { User } from "./types";
import "./App.css";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from /me if token exists
  useEffect(() => {
    const token = localStorage.getItem("api_token");
    if (token) {
      setToken(token);
      API.get<{ user: User }>("/users/me")
        .then((res) => setUser(res.data.user))
        .catch((err) => {
          if (401 !== err.response?.status) {
            console.error(err);
          }
          localStorage.removeItem("api_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* Dashboard (home) */}
        <Route
          path="/"
          element={
            user ? (
              <div className="dashboard-container">
                <Dashboard
                  user={user}
                  onLogout={() => {
                    localStorage.removeItem("api_token");
                    setUser(null);
                  }}
                />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login page */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <div className="auth-container">
                <div className="auth-card">
                  <h2>Login</h2>
                  <Login onLogin={setUser} />
                  <button
                    className="toggle-link"
                    onClick={() => (window.location.href = "/register")}
                  >
                    Don&apos;t have an account? Register
                  </button>
                </div>
              </div>
            )
          }
        />

        {/* Register page */}
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <div className="auth-container">
                <div className="auth-card">
                  <h2>Register</h2>
                  <Register onRegister={setUser} />
                  <button
                    className="toggle-link"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Already have an account? Login
                  </button>
                </div>
              </div>
            )
          }
        />

        {/* OAuth callback */}
        <Route path="/auth/callback" element={<AuthCallback onAuth={setUser} />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
