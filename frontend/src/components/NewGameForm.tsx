import { useState, useMemo } from "react";
import API from "../api";
import type { Game } from "../types";
import { calculateFrameTotals, calculateScore } from "../utils/GameScorer";

interface NewGameFormProps {
  onGameCreated: (game: Game) => void;
}

type Frame = number[];

export default function NewGameForm({ onGameCreated }: NewGameFormProps) {
  const [frames, setFrames] = useState<Frame[]>(Array(10).fill([0, 0]));
  const [extraRoll, setExtraRoll] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRollChange = (frameIndex: number, rollIndex: number, value: number) => {
    const updated = frames.map((f) => [...f]);
    updated[frameIndex][rollIndex] = value;
    setFrames(updated);

    // handle 10th frame extra roll
    if (frameIndex === 9) {
      const [r1, r2] = updated[9];
      if (r1 === 10 || r1 + r2 === 10) {
        if (extraRoll === null) setExtraRoll(0);
      } else {
        setExtraRoll(null);
      }
    }
  };

  // flatten rolls for scoring
  const allRolls = useMemo(() => {
    const rolls: number[] = [];
    frames.forEach((frame, i) => {
      rolls.push(frame[0]);
      if (!(i < 9 && frame[0] === 10)) {
        rolls.push(frame[1]);
      }
    });
    if (extraRoll !== null) rolls.push(extraRoll);
    return rolls.filter((r) => r !== undefined && r !== null);
  }, [frames, extraRoll]);

  const previewScore = useMemo(() => calculateScore(allRolls), [allRolls]);
  const frameTotals = useMemo(() => calculateFrameTotals(allRolls), [allRolls]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const gameRes = await API.post<Game>("/games");
      const game = gameRes.data;

      // submit rolls
      for (let f = 0; f < 10; f++) {
        const [r1, r2] = frames[f];
        if (r1 > 0) {
          await API.post(`/games/${game.id}/rolls`, {
            roll: { frame: f + 1, roll_number: 1, pins: r1 },
          });
        }
        if (r2 > 0 && !(f < 9 && r1 === 10)) {
          await API.post(`/games/${game.id}/rolls`, {
            roll: { frame: f + 1, roll_number: 2, pins: r2 },
          });
        }
      }

      if (extraRoll !== null && extraRoll > 0) {
        await API.post(`/games/${game.id}/rolls`, {
          roll: { frame: 10, roll_number: 3, pins: extraRoll },
        });
      }

      // refresh game with computed total_score
      const finalRes = await API.get<Game>(`/games/${game.id}`);
      onGameCreated(finalRes.data);

      // reset form
      setFrames(Array(10).fill([0, 0]));
      setExtraRoll(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-game-form">
      <h4>Add New Game</h4>
      <div className="frames">
        {frames.map((frame, i) => (
          <div key={i} className="frame">
            <label>{i + 1}</label>
            <div>
              <input
                type="number"
                min="0"
                max="10"
                value={frame[0]}
                onChange={(e) => handleRollChange(i, 0, Number(e.target.value))}
              />
              {!(i < 9 && frame[0] === 10) && (
                <input
                  type="number"
                  min="0"
                  max={i < 9 ? 10 - frame[0] : 10}
                  value={frame[1]}
                  onChange={(e) => handleRollChange(i, 1, Number(e.target.value))}
                />
              )}
            </div>
          </div>
        ))}

        {extraRoll !== null && (
          <div className="frame">
            <label>10 (extra)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={extraRoll}
              onChange={(e) => setExtraRoll(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      <div className="frame-totals">
        {frameTotals.map((t, i) => (
          <div key={i} className="frame-total">
            {t}
          </div>
        ))}
      </div>

      <p className="preview-score">Live score: {previewScore}</p>

      <button disabled={loading} onClick={handleSubmit}>
        {loading ? "Saving..." : "Save Game"}
      </button>
    </div>
  );
}
