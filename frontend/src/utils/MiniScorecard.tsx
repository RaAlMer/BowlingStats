import type { Roll } from "../types";
import { calculateFrameTotals, formatRoll } from "./GameScorer";

interface Props {
  rolls: Roll[];
}

export default function MiniScorecard({ rolls }: Props) {
  // Split rolls into frames
  const frames: number[][] = Array.from({ length: 10 }, () => []);
  rolls.forEach(r => frames[r.frame - 1].push(r.pins));

  // Flatten all pins for totals calculation
  const flatRolls = rolls.map(r => r.pins);
  const frameTotals = calculateFrameTotals(flatRolls);

  const getRollClass = (roll: string) => {
    if (roll === "X") return "strike";
    if (roll === "/") return "spare";
    if (roll === "-") return "miss";
    return "number";
  };

  return (
    <div className="mini-scorecard">
      {frames.map((frame, idx) => {
        // Convert rolls to symbols
        const symbols = frame.map((pins, i) => formatRoll(pins, frame, i));

        // Handle 10th frame extra rolls
        if (idx === 9 && symbols.length < 3) {
          while (symbols.length < 3) symbols.push(" ");
        }

        // Handle empty second roll for frames 1-9
        if (idx < 9 && symbols.length === 1 && frame[0] !== 10) {
          symbols.push(" ");
        }

        return (
          <div key={idx} className={`mini-frame ${idx === 9 ? "tenth-frame" : ""}`}>
            <div className="rolls">
              {symbols.map((s, i) => (
                <span key={i} className={getRollClass(s)}>
                  {s}
                </span>
              ))}
            </div>
            <div className="cumulative">{frameTotals[idx] ?? "-"}</div>
          </div>
        );
      })}
    </div>
  );
}
