-- Create tables for the game
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reddit_username TEXT UNIQUE NOT NULL,
  karma_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.players(id),
  score INTEGER NOT NULL,
  words_found TEXT[] NOT NULL,
  game_mode TEXT NOT NULL,
  daily_theme TEXT,
  duration INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme TEXT NOT NULL,
  bonus_words TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.players(id),
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create views for leaderboards
CREATE VIEW public.daily_leaderboard AS
SELECT 
  p.reddit_username,
  gs.score,
  gs.words_found,
  gs.created_at
FROM game_sessions gs
JOIN players p ON p.id = gs.player_id
WHERE gs.created_at >= CURRENT_DATE
ORDER BY gs.score DESC;

CREATE VIEW public.all_time_leaderboard AS
SELECT 
  p.reddit_username,
  SUM(gs.score) as total_score,
  COUNT(*) as games_played,
  MAX(gs.score) as best_score
FROM players p
JOIN game_sessions gs ON p.id = gs.player_id
GROUP BY p.id, p.reddit_username
ORDER BY total_score DESC;

-- Create functions for game mechanics
CREATE OR REPLACE FUNCTION public.submit_score(
  p_reddit_username TEXT,
  p_score INTEGER,
  p_words TEXT[],
  p_game_mode TEXT,
  p_theme TEXT,
  p_duration INTEGER
) RETURNS UUID AS $$
DECLARE
  v_player_id UUID;
  v_session_id UUID;
BEGIN
  -- Get or create player
  INSERT INTO public.players (reddit_username)
  VALUES (p_reddit_username)
  ON CONFLICT (reddit_username) DO UPDATE
  SET games_played = players.games_played + 1
  RETURNING id INTO v_player_id;

  -- Create game session
  INSERT INTO public.game_sessions 
    (player_id, score, words_found, game_mode, daily_theme, duration)
  VALUES 
    (v_player_id, p_score, p_words, p_game_mode, p_theme, p_duration)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
