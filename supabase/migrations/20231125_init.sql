-- Enable UUID generation
create extension if not exists "uuid-ossp";

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
CREATE OR REPLACE VIEW public.daily_leaderboard AS
SELECT 
  p.reddit_username,
  gs.score,
  gs.words_found,
  gs.created_at
FROM game_sessions gs
JOIN players p ON p.id = gs.player_id
WHERE DATE(gs.created_at AT TIME ZONE 'UTC') = CURRENT_DATE
ORDER BY gs.score DESC;

CREATE OR REPLACE VIEW public.all_time_leaderboard AS
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
  p_theme TEXT DEFAULT NULL,
  p_duration INTEGER DEFAULT 60
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

-- Add RLS (Row Level Security) policies
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Public read access for players"
  ON public.players FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for game_sessions"
  ON public.game_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for daily_challenges"
  ON public.daily_challenges FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access for achievements"
  ON public.achievements FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert their own scores"
  ON public.game_sessions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can insert their own achievements"
  ON public.achievements FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert sample data
INSERT INTO public.daily_challenges (theme, bonus_words, start_date, end_date, target_score)
VALUES (
  'Technology',
  ARRAY['computer', 'internet', 'software', 'programming'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 day',
  100
);
