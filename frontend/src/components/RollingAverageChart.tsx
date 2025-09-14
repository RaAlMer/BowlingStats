import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import type { Game } from '../types';

interface RollingAverageChartProps {
  games: Game[];
  windowSize?: number; // last N games
}

export default function RollingAverageChart({ games, windowSize = 5 }: RollingAverageChartProps) {
  const data = games.map((g, i, arr) => {
    const start = Math.max(0, i - windowSize + 1);
    const rollingAvg = (
      arr.slice(start, i + 1).reduce((sum, g) => sum + (g.total_score ?? 0), 0) /
      (i - start + 1)
    ).toFixed(1);
    return { name: `Game ${i + 1}`, score: g.total_score ?? 0, rollingAvg: Number(rollingAvg) };
  });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={({ payload, label }) => (
            <div style={{ background: "#fff", padding: 6, border: "1px solid #ccc" }}>
              <strong>{label}</strong><br />
              Score: {payload?.[0]?.value}
              <br />
              Rolling Average: {payload?.[1]?.value}
            </div>
          )} />
          <Line type="monotone" dataKey="score" stroke="#667eea" strokeWidth={2} />
          <Line type="monotone" dataKey="rollingAvg" stroke="#2ecc71" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
