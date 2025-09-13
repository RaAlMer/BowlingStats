import React, { useState } from "react";
import API, { setToken } from "../api";
import type { User } from "../types";
import ErrorMessage from '../components/ErrorMessage';
import axios from 'axios';

interface RegisterProps {
  onRegister: (user: User) => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const res = await API.post("/users", {
        user: { name, email, password, password_confirmation: passwordConfirmation },
      });

      const token: string = res.data.user.api_token;

      // Save token
      setToken(token);
      localStorage.setItem("api_token", token);

      // Fetch current user
      const me = await API.get<{ user: User }>("/users/me");
      onRegister(me.data.user);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.errors) {
          setErrorMessage(err.response.data.errors.join(', '));
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
      } else {
        setErrorMessage('Unexpected error occurred.');
      }
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="new-password"
      />
      <input
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        placeholder="Confirm Password"
        autoComplete="new-password"
      />
      <ErrorMessage message={errorMessage} />
      <button type="submit">Register</button>
    </form>
  );
}
