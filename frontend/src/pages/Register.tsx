import React, { useState } from 'react';
import API, { setToken } from '../api';
import type { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/users', {
        user: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      // Rails should return { api_token, user }
      const token: string = res.data.api_token;
      setToken(token);
      localStorage.setItem('api_token', token);

      onRegister(res.data.user as User);
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="name"
      />
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
        autoComplete="new-password"
      />
      <input
        type="password"
        value={passwordConfirmation}
        onChange={e => setPasswordConfirmation(e.target.value)}
        placeholder="confirm password"
        autoComplete="new-password"
      />
      <button type="submit">Register</button>
    </form>
  );
}
