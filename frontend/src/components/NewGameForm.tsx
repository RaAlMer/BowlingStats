import { useMemo, useState } from "react";
import API from "../api";
import type { Game } from "../types";
import { calculateFrameTotals, calculateScore } from "../utils/GameScorer";

type Frame = number[]; // frames[0..8] -> [r1, r2], frame[9] -> [r1, r2, r3]

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const initialFrames = (): Frame[] =>
  Array.from({ length: 10 }, (_, i) => (i < 9 ? [0, 0] : [0, 0, 0]));

function getSymbol(frames: Frame[], frameIdx: number, rollIdx: number): { text: string; className: string } {
  const fmt = (v: number) => (v === 0 ? { text: "-", className: "miss" } : { text: String(v), className: "number" });

  const frame = frames[frameIdx];
  const r1 = frame[0] ?? 0;
  const r2 = frame[1] ?? 0;
  const r3 = frame[2] ?? 0;

  if (frameIdx < 9) {
    if (rollIdx === 0) {
      if (r1 === 10) return { text: "X", className: "strike" };
      return fmt(r1);
    } else {
      if (r1 === 10) return { text: "", className: "" };
      if (r1 + r2 === 10) return { text: "/", className: "spare" };
      return fmt(r2);
    }
  } else {
    if (rollIdx === 0) return r1 === 10 ? { text: "X", className: "strike" } : fmt(r1);
    if (rollIdx === 1) {
      if (r1 === 10) return r2 === 10 ? { text: "X", className: "strike" } : fmt(r2);
      return r1 + r2 === 10 ? { text: "/", className: "spare" } : fmt(r2);
    }
    if (rollIdx === 2) {
      if (r1 === 10) {
        if (r2 === 10) return r3 === 10 ? { text: "X", className: "strike" } : fmt(r3);
        return r2 + r3 === 10 ? { text: "/", className: "spare" } : fmt(r3);
      } else if (r1 + r2 === 10) {
        return r3 === 10 ? { text: "X", className: "strike" } : fmt(r3);
      }
    }
  }
  return { text: "", className: "" };
}

export default function NewGameForm({ onGameCreated }: { onGameCreated: (g: Game) => void }) {
  const [frames, setFrames] = useState<Frame[]>(initialFrames);
  const [loading, setLoading] = useState(false);

  // Helpers to compute max allowed for a particular input
  const maxFor = (frameIdx: number, rollIdx: number, currentFrames: Frame[]) => {
    if (frameIdx < 9) {
      if (rollIdx === 0) return 10;
      // second roll: if first is strike, no second roll (we will hide it); otherwise 10 - first
      const r1 = currentFrames[frameIdx][0] ?? 0;
      return r1 === 10 ? 0 : 10 - r1;
    } else {
      // tenth frame
      const r1 = currentFrames[9][0] ?? 0;
      const r2 = currentFrames[9][1] ?? 0;
      if (rollIdx === 0) return 10;
      if (rollIdx === 1) {
        return r1 === 10 ? 10 : 10 - r1;
      }
      // rollIdx === 2
      if (r1 === 10) {
        // if second was strike -> full set; else remaining pins
        return r2 === 10 ? 10 : 10 - r2;
      }
      // if r1 + r2 is spare -> full set for bonus; otherwise no third roll
      return r1 + r2 === 10 ? 10 : 0;
    }
  };

  const canShowSecond = (frameIdx: number, curFrames: Frame[]) =>
    frameIdx < 9 ? (curFrames[frameIdx][0] ?? 0) < 10 : true;

  const canShowThirdInTenth = (curFrames: Frame[]) => {
    const r1 = curFrames[9][0] ?? 0;
    const r2 = curFrames[9][1] ?? 0;
    return r1 === 10 || r1 + r2 === 10;
  };

  const handleRollChange = (frameIdx: number, rollIdx: number, raw: number) => {
    setFrames((prev) => {
      const updated = prev.map((f) => [...f]) as Frame[];
      const max = maxFor(frameIdx, rollIdx, updated);
      const value = clamp(Number.isFinite(raw) ? raw : 0, 0, max);

      // ensure frame array length exists
      if (!updated[frameIdx]) updated[frameIdx] = frameIdx < 9 ? [0, 0] : [0, 0, 0];

      updated[frameIdx][rollIdx] = value;

      // maintain invariants:
      if (frameIdx < 9) {
        // if first roll becomes strike, clear second (we hide it)
        if (rollIdx === 0 && value === 10) {
          updated[frameIdx][1] = 0;
        }
        // if first roll changed to non-strike and second > allowed, clamp second
        if (rollIdx === 0 && value < 10) {
          const secondMax = 10 - value;
          updated[frameIdx][1] = clamp(updated[frameIdx][1] ?? 0, 0, secondMax);
        }
        // if second roll changed and sum > 10, clamp it
        if (rollIdx === 1) {
          const r1 = updated[frameIdx][0] ?? 0;
          updated[frameIdx][1] = clamp(updated[frameIdx][1] ?? 0, 0, 10 - r1);
        }
      } else {
        // tenth frame rules:
        const r1 = updated[9][0] ?? 0;
        const r2 = updated[9][1] ?? 0;

        // if first changed:
        if (rollIdx === 0) {
          // clamp second if needed
          const secondMax = r1 === 10 ? 10 : 10 - r1;
          updated[9][1] = clamp(updated[9][1] ?? 0, 0, secondMax);
          // third only allowed if r1===10 or r1+r2===10
          if (!(r1 === 10 || r1 + r2 === 10)) {
            updated[9][2] = 0;
          } else {
            // clamp third
            const thirdMax = r1 === 10 ? (r2 === 10 ? 10 : 10 - r2) : 10;
            updated[9][2] = clamp(updated[9][2] ?? 0, 0, thirdMax);
          }
        }

        // if second changed:
        if (rollIdx === 1) {
          const secondMax = r1 === 10 ? 10 : 10 - r1;
          updated[9][1] = clamp(updated[9][1] ?? 0, 0, secondMax);

          // recompute whether third is allowed and clamp it
          if (!(r1 === 10 || r1 + updated[9][1] === 10)) {
            updated[9][2] = 0;
          } else {
            const thirdMax = r1 === 10 ? (updated[9][1] === 10 ? 10 : 10 - updated[9][1]) : 10;
            updated[9][2] = clamp(updated[9][2] ?? 0, 0, thirdMax);
          }
        }

        // if third changed: clamp it by the rule (maxFor handles it but keep safe)
        if (rollIdx === 2) {
          const thirdMax = maxFor(9, 2, updated);
          updated[9][2] = clamp(updated[9][2] ?? 0, 0, thirdMax);
        }
      }

      return updated;
    });
  };

  // flatten rolls for scoring
  const allRolls = useMemo(() => {
    const rolls: number[] = [];
    for (let i = 0; i < 9; i++) {
      const [r1 = 0, r2 = 0] = frames[i] ?? [0, 0];
      rolls.push(r1);
      if (r1 !== 10) rolls.push(r2);
    }
    // tenth frame
    const [tr1 = 0, tr2 = 0, tr3 = 0] = frames[9] ?? [0, 0, 0];
    rolls.push(tr1);
    rolls.push(tr2);
    if (tr1 === 10 || tr1 + tr2 === 10) {
      // third roll only counts if strike or spare scenario
      rolls.push(tr3);
    }
    // remove undefined/null - keep zeros
    return rolls;
  }, [frames]);

  const previewScore = useMemo(() => calculateScore(allRolls), [allRolls]);
  const frameTotals = useMemo(() => calculateFrameTotals(allRolls), [allRolls]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await API.post<Game>("/games");
      const game = res.data;

      // submit frames 1..9
      for (let i = 0; i < 9; i++) {
        const [r1 = 0, r2 = 0] = frames[i];
        // only post rolls that are actually played: r1 always posted if > 0 (or 0 too if you want)
        await API.post(`/games/${game.id}/rolls`, {
          roll: { frame: i + 1, roll_number: 1, pins: r1 },
        });
        if (r1 !== 10) {
          await API.post(`/games/${game.id}/rolls`, {
            roll: { frame: i + 1, roll_number: 2, pins: r2 },
          });
        }
      }

      // tenth frame: post the three possible rolls (API expects roll_number 1,2,3)
      const [r1 = 0, r2 = 0, r3 = 0] = frames[9];
      await API.post(`/games/${game.id}/rolls`, {
        roll: { frame: 10, roll_number: 1, pins: r1 },
      });
      await API.post(`/games/${game.id}/rolls`, {
        roll: { frame: 10, roll_number: 2, pins: r2 },
      });
      if (r1 === 10 || r1 + r2 === 10) {
        await API.post(`/games/${game.id}/rolls`, {
          roll: { frame: 10, roll_number: 3, pins: r3 },
        });
      }

      // fetch computed game
      const finalRes = await API.get<Game>(`/games/${game.id}`);
      onGameCreated(finalRes.data);

      // reset
      setFrames(initialFrames());
    } catch (err) {
      console.error(err);
      // you may want to show an error to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-game-form">
      <h4>Add New Game</h4>

      <div className="bowling-grid">
        {frames.map((frame, i) => {
          // frame slots: frames 0..8 => show up to 2 inputs, frame 9 => up to 3
          const isTenth = i === 9;
          const secondShown = canShowSecond(i, frames);
          const thirdShown = isTenth && canShowThirdInTenth(frames);

          return (
            <div key={i} className={`bowling-frame ${isTenth ? "tenth-frame" : ""}`}>
              <div className="frame-label">F{i + 1}</div>

              <div className="rolls">
                {/* roll 1 */}
                <input
                  aria-label={`frame-${i + 1}-roll-1`}
                  type="number"
                  min={0}
                  max={10}
                  value={frame[0] ?? 0}
                  onChange={(e) => handleRollChange(i, 0, Number(e.target.value))}
                />

                {/* roll 2 (hidden for frames 1..9 when strike) */}
                {secondShown && (
                  <input
                    aria-label={`frame-${i + 1}-roll-2`}
                    type="number"
                    min={0}
                    max={maxFor(i, 1, frames)}
                    value={frame[1] ?? 0}
                    onChange={(e) => handleRollChange(i, 1, Number(e.target.value))}
                  />
                )}

                {/* roll 3 only for 10th frame when allowed */}
                {isTenth && thirdShown && (
                  <input
                    aria-label={`frame-10-roll-3`}
                    type="number"
                    min={0}
                    max={maxFor(9, 2, frames)}
                    value={frame[2] ?? 0}
                    onChange={(e) => handleRollChange(9, 2, Number(e.target.value))}
                  />
                )}
              </div>

              <div className="symbols">
                <span className={getSymbol(frames, i, 0).className}>
                    {getSymbol(frames, i, 0).text}
                </span>
                {secondShown && (
                  <span className={getSymbol(frames, i, 1).className}>
                    {getSymbol(frames, i, 1).text}
                  </span>
                )}
                {isTenth && thirdShown && (
                  <span className={getSymbol(frames, i, 2).className}>
                    {getSymbol(frames, i, 2).text}
                  </span>
                )}
              </div>

              <div className="cumulative">{frameTotals[i] ?? ""}</div>
            </div>
          );
        })}
      </div>

      <div className="final-score-box">
        <div className="score">{previewScore}</div>
      </div>

      <button disabled={loading} onClick={handleSubmit}>
        {loading ? "Saving..." : "Save Game"}
      </button>
    </div>
  );
}
