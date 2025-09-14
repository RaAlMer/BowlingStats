import { useMemo } from "react";
import type { Game, Roll } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FrameBreakdownChartProps {
  games: Game[];
  rollsMap?: Record<number, Roll[]>; // optional if you fetch rolls separately
}

export default function FrameBreakdownChart({ games }: FrameBreakdownChartProps) {
  // Compute per-frame averages
  const data = useMemo(() => {
    const frameSums = Array(10).fill(0);
    const frameCounts = Array(10).fill(0);

    games.forEach(g => {
      const rolls = g.rolls || []; // or fetch separately if not included
      const frames: number[][] = Array(10).fill(0).map(() => []);

      // Group rolls by frame
      rolls.forEach(r => {
        frames[r.frame - 1].push(r.pins);
      });

      frames.forEach((frame, idx) => {
        if (frame.length > 0) {
          frameSums[idx] += frame.reduce((a, b) => a + b, 0);
          frameCounts[idx] += 1;
        }
      });
    });

    return frameSums.map((sum, idx) => ({
      frame: `F${idx + 1}`,
      avg: frameCounts[idx] ? +(sum / frameCounts[idx]).toFixed(1) : 0
    }));
  }, [games]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="frame" />
        <YAxis />
        <Tooltip content={({ payload, label }) => (
          <div style={{ background: "#fff", padding: 6, border: "1px solid #ccc" }}>
            <strong>{label}</strong><br />
            Avg Pins: {payload?.[0]?.value}
          </div>
        )} />
        <Bar dataKey="avg" fill="#ff6b6b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
