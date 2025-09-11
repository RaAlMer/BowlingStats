import React, { useState } from 'react';
import API, { setToken } from '../api';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await API.post('/login', { email, password });
    const token: string = res.data.api_token;
    setToken(token);
    localStorage.setItem('api_token', token);
    onLogin(res.data.user as User);
  };

  return (
    <form onSubmit={submit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="email"
        autoComplete="email"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="password"
        autoComplete="current-password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
