import { useEffect, useState } from 'react';
import API from '../api';
import type { Game, User } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

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

  const data = games.map((g) => ({
    name: `Game ${g.id}`,
    score: g.total_score ?? 0,
    date: g.played_at ? new Date(g.played_at).toLocaleDateString() : '',
  }));

  const avg = games.length
    ? (
        games.reduce((s, g) => s + (g.total_score ?? 0), 0) / games.length
      ).toFixed(1)
    : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user.name}</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <h3>Your games — avg: {avg}</h3>

      {/* Responsive Chart */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Games list */}
      <div className="games-list">
        <h4>Game history</h4>
        {games.length === 0 ? (
          <p>No games yet. Add your first game!</p>
        ) : (
          <ul>
            {games.map((g) => (
              <li key={g.id}>
                <span>Game {g.id}</span>
                <span>Score: {g.total_score ?? 0}</span>
                <span>{g.played_at ? new Date(g.played_at).toLocaleDateString() : 'N/A'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
