import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Game } from '../types';

interface ScoreDistributionChartProps {
  games: Game[];
}

export default function ScoreDistributionChart({ games }: ScoreDistributionChartProps) {
  const bins = [0, 101, 151, 201, 251, 301];
  const data = bins.slice(0, -1).map((start, i) => {
    const end = bins[i + 1] - 1;
    const count = games.filter(g => (g.total_score ?? 0) >= start && (g.total_score ?? 0) <= end).length;
    return { range: `${start}-${end}`, count };
  });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis allowDecimals={false} />
          <Tooltip content={({ payload, label }) => (
            <div style={{ background: "#fff", padding: 6, border: "1px solid #ccc" }}>
              <strong>{label}</strong><br />
              Games: {payload?.[0]?.value}
            </div>
          )} />
          <Bar dataKey="count" fill="#667eea" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
