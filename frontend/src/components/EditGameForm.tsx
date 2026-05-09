import { useState } from "react";
import API from "../api";
import type { Game, Roll } from "../types";
import type { AxiosError } from "axios";

interface EditGameFormProps {
  game: Game & { rolls?: Roll[] };
  onClose: () => void;
  onGameUpdated: (game: Game) => void;
}

export default function EditGameForm({ game, onClose, onGameUpdated }: EditGameFormProps) {
  const [score, setScore] = useState<number>(game.total_score ?? 0);
  const [date, setDate] = useState<string>(
    game.played_at ? new Date(game.played_at).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedGame = { ...game, total_score: score, played_at: date };
      const res = await API.put(`/games/${game.id}`, updatedGame);
      onGameUpdated(res.data);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        "Unknown error updating game.";
        alert("Error updating game: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Game</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </label>

          <label>
            Total Score:
            <input
              type="number"
              value={score}
              onChange={e => setScore(Number(e.target.value))}
            />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
