import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Game, Roll } from '../types';

interface StrikesSparesPieChartProps {
  games: Game[];
}

export default function StrikesSparesPieChart({ games }: StrikesSparesPieChartProps) {
  let strikes = 0, spares = 0, opens = 0;

  games.forEach((g) => {
    const rolls: Roll[] = g.rolls ?? [];
    for (let i = 0; i < rolls.length; i += 2) {
      const r1 = rolls[i]?.pins ?? 0;
      const r2 = rolls[i + 1]?.pins ?? 0;

      if (r1 === 10) strikes++;
      else if (r1 + r2 === 10) spares++;
      else opens++;
    }
  });

  const data = [
    { name: "Strikes", value: strikes },
    { name: "Spares", value: spares },
    { name: "Open", value: opens },
  ];

  const COLORS = ["#f6ad55", "#48bb78", "#4299e1"];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={({ payload }) => (
            <div style={{ background:"#fff", padding:6, border:"1px solid #ccc" }}>
              {payload?.map(p => (<div key={p.name}>{p.name}: {p.value}</div>))}
            </div>
          )} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
