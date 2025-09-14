export interface User {
  id: number;
  name: string;
  email: string;
  api_token: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: number;
  user_id: number;
  played_at: string | null;
  total_score: number | null;
  created_at: string;
  updated_at: string;
  rolls?: Roll[];
}

export interface Roll {
  id: number;
  game_id: number;
  frame: number;
  roll_number: number;
  pins: number;
  created_at: string;
  updated_at: string;
}
