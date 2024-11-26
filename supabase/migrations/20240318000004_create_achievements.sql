-- Drop existing achievements table and related objects
DROP TABLE IF EXISTS public.achievements CASCADE;

-- Create achievements table with enhanced structure
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create user_stats table for tracking achievement progress
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  correct_guesses INTEGER DEFAULT 0,
  visited_subreddits TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_packs INTEGER DEFAULT 0,
  voice_games_started INTEGER DEFAULT 0,
  legendary_puzzles_completed INTEGER DEFAULT 0
);

-- Create function to track word guesses
CREATE OR REPLACE FUNCTION public.track_word_guess(user_id UUID, is_correct BOOLEAN)
RETURNS void AS $$
BEGIN
  IF is_correct THEN
    INSERT INTO public.user_stats (user_id, correct_guesses)
    VALUES (user_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET correct_guesses = public.user_stats.correct_guesses + 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track subreddit visits
CREATE OR REPLACE FUNCTION public.track_subreddit_visit(user_id UUID, subreddit TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, visited_subreddits)
  VALUES (user_id, ARRAY[subreddit])
  ON CONFLICT (user_id) 
  DO UPDATE SET visited_subreddits = 
    array_append(
      ARRAY(
        SELECT DISTINCT unnest(
          COALESCE(public.user_stats.visited_subreddits, ARRAY[]::TEXT[]) || ARRAY[subreddit]
        )
      ),
      NULL
    )
  WHERE NOT (subreddit = ANY(COALESCE(public.user_stats.visited_subreddits, ARRAY[]::TEXT[])));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track word pack creation
CREATE OR REPLACE FUNCTION public.track_word_pack_creation(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, created_packs)
  VALUES (user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET created_packs = public.user_stats.created_packs + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track voice game starts
CREATE OR REPLACE FUNCTION public.track_voice_game_start(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, voice_games_started)
  VALUES (user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET voice_games_started = public.user_stats.voice_games_started + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track legendary puzzle completion
CREATE OR REPLACE FUNCTION public.track_legendary_puzzle_completion(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, legendary_puzzles_completed)
  VALUES (user_id, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET legendary_puzzles_completed = public.user_stats.legendary_puzzles_completed + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unlock achievement
CREATE OR REPLACE FUNCTION public.unlock_achievement(user_id UUID, achievement_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.achievements (id, user_id, achievement_type)
  VALUES (achievement_id, user_id, achievement_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user achievements
CREATE OR REPLACE FUNCTION public.get_user_achievements(user_id UUID)
RETURNS TABLE (
  achievement_id TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, achievements.unlocked_at
  FROM public.achievements
  WHERE achievements.user_id = get_user_achievements.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can read their own stats
CREATE POLICY "Users can read their own stats"
  ON public.user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own stats
CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update achievement policies
DROP POLICY IF EXISTS "Public read access for achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;

CREATE POLICY "Users can read their own achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own achievements"
  ON public.achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);
