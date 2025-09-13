import React, { useState } from "react";
import API, { setToken } from "../api";
import type { User } from "../types";
import ErrorMessage from '../components/ErrorMessage';
import axios from "axios";

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const res = await API.post("/login", { email, password });

      const user = res.data.user as User;
      const token = user.api_token;

      if (!token) {
        alert("No token returned from server");
        return;
      }

      setToken(token);
      localStorage.setItem("api_token", token);

      const me = await API.get<{ user: User }>("/users/me");
      onLogin(me.data.user);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error) {
          setErrorMessage(err.response.data.error as string);
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
      } else {
        setErrorMessage('Unexpected error occurred.');
      }
    }
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google_oauth2`;
  };

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-form">
        <h2>Login with Email</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          autoComplete="email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoComplete="current-password"
        />
        <ErrorMessage message={errorMessage} />
        <button type="submit">Login</button>
      </form>

      <div className="divider">or</div>

      <button onClick={googleLogin} className="google-btn">
        Sign in with Google
      </button>
    </div>
  );
}
