import { useEffect, useState } from "react";
import API from "../api";
import type { Game, User } from "../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import NewGameForm from "../components/NewGameForm";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function load() {
      const res = await API.get<Game[]>("/games");
      setGames(res.data);
    }
    load();
  }, []);

  // Sort games by played_at (oldest first)
  const sortedGames = [...games].sort((a, b) => {
    const dateA = a.played_at ? new Date(a.played_at).getTime() : 0;
    const dateB = b.played_at ? new Date(b.played_at).getTime() : 0;
    return dateA - dateB;
  });

  const data = sortedGames.map((g, i) => ({
    name: `Game ${i + 1}`, // sequential order instead of DB id
    score: g.total_score ?? 0,
    date: g.played_at ? new Date(g.played_at).toLocaleDateString() : "",
  }));

  const avg = sortedGames.length
    ? (
        sortedGames.reduce((s, g) => s + (g.total_score ?? 0), 0) /
        sortedGames.length
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
            <Line
              type="monotone"
              dataKey="score"
              stroke="#667eea"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Add game */}
      <NewGameForm onGameCreated={(game) => setGames([...games, game])} />

      {/* Games list */}
      <div className="games-list">
        <h4>Game history</h4>
        {sortedGames.length === 0 ? (
          <p>No games yet. Add your first game!</p>
        ) : (
          <ul>
            {sortedGames.map((g, i) => (
              <li key={g.id}>
                <span>Game {i + 1}</span>
                <span>Score: {g.total_score ?? 0}</span>
                <span>
                  {g.played_at
                    ? new Date(g.played_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
