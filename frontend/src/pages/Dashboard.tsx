import React, { useEffect, useState } from 'react';
import API from '../api';
import type { Game, User } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function load() {
      const res = await API.get<Game[]>('/games');
      setGames(res.data);
    }
    load();
  }, []);

  const data = games.map(g => ({
    name: g.id,
    score: g.total_score ?? 0,
    date: g.played_at,
  }));

  const avg = games.length
    ? (games.reduce((s, g) => s + (g.total_score ?? 0), 0) / games.length).toFixed(1)
    : 0;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <button onClick={onLogout}>Logout</button>

      <h3>Your games — avg: {avg}</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
