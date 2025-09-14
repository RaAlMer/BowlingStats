import { useEffect, useState } from "react";
import API from "../api";
import type { Game, User } from "../types";
import NewGameForm from "../components/NewGameForm";
import RollingAverageChart from "../components/RollingAverageChart";
import ScoreDistributionChart from "../components/ScoreDistributionChart";
import FrameBreakdownChart from "../components/FrameBreakdownChart";
import StrikesSparesPieChart from "../components/StrikesSparesPieChart";
import ChartWrapper from "../utils/ChartWrapper";
import MiniScorecard from "../utils/MiniScorecard";

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

  // Sort games oldest first
  const sortedGames = [...games].sort((a, b) => {
    const dateA = a.played_at ? new Date(a.played_at).getTime() : 0;
    const dateB = b.played_at ? new Date(b.played_at).getTime() : 0;
    return dateA - dateB;
  });

  const avg = sortedGames.length
    ? (
        sortedGames.reduce((s, g) => s + (g.total_score ?? 0), 0) /
        sortedGames.length
      ).toFixed(1)
    : 0;

  // Group games by month/year
  const groupedGames = sortedGames.reduce((acc, g, i) => {
    const date = g.played_at ? new Date(g.played_at) : null;
    const key = date
    ? (() => {
        const str = date.toLocaleString("default", { month: "short", year: "numeric" });
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      })()
    : "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...g, label: `Game ${i + 1}` });
    return acc;
  }, {} as Record<string, (Game & { label: string })[]>);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user.name}</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <h3>Average: {avg}</h3>

      {/* Charts */}
      <div className="dashboard-charts">
        <ChartWrapper 
          title="Rolling Average" 
          description="Shows your rolling average score over the last few games. Useful to see trends and improvement."
        >
          <RollingAverageChart games={sortedGames} />
        </ChartWrapper>

        <ChartWrapper 
          title="Score Distribution" 
          description="Shows how often you score within certain ranges. Helps identify consistency or peaks."
        >
          <ScoreDistributionChart games={sortedGames} />
        </ChartWrapper>

        <ChartWrapper 
          title="Frame Breakdown" 
          description="Shows your average score per frame. Helps identify which frames you do best in or need improvement."
        >
          <FrameBreakdownChart games={sortedGames} />
        </ChartWrapper>

        <ChartWrapper 
          title="Strikes, Spares, Opens" 
          description="Pie chart showing your proportion of strikes, spares, and open frames. Helps evaluate performance patterns."
        >
          <StrikesSparesPieChart games={sortedGames} />
        </ChartWrapper>
      </div>

      {/* Add game */}
      <NewGameForm onGameCreated={(game) => setGames([...games, game])} />

      {/* Games list */}
      <div className="games-list">
        <h4>Game history</h4>
        {sortedGames.length === 0 ? (
          <p>No games yet. Add your first game!</p>
        ) : (
          Object.entries(groupedGames).map(([month, games]) => (
            <div key={month} className="games-month">
              <h5 className="month-header">{month}</h5>
              <ul>
                {games.map((g) => (
                  <li key={g.id}>
                    <span>{g.label}</span>
                    <span>Score: {g.total_score ?? 0}</span>
                    <span>
                      {g.played_at ? new Date(g.played_at).toLocaleDateString() : "N/A"}
                    </span>
                    <MiniScorecard rolls={g.rolls ?? []} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
