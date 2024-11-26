-- Create subreddit_word_packs table
CREATE TABLE IF NOT EXISTS subreddit_word_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subreddit TEXT NOT NULL,
  words TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on subreddit for faster lookups
CREATE INDEX IF NOT EXISTS idx_subreddit_word_packs_subreddit ON subreddit_word_packs(subreddit);

-- Insert some initial data
INSERT INTO subreddit_word_packs (subreddit, words) VALUES
  ('todayilearned', ARRAY['history', 'fact', 'discovery', 'science', 'knowledge', 'learning', 'interesting', 'research']),
  ('science', ARRAY['research', 'study', 'experiment', 'discovery', 'hypothesis', 'theory', 'data', 'analysis']),
  ('worldnews', ARRAY['global', 'politics', 'economy', 'international', 'crisis', 'diplomacy', 'trade', 'policy']),
  ('books', ARRAY['novel', 'author', 'story', 'chapter', 'fiction', 'literature', 'reading', 'plot']),
  ('technology', ARRAY['innovation', 'software', 'hardware', 'digital', 'computer', 'internet', 'device', 'startup']),
  ('gaming', ARRAY['game', 'console', 'player', 'level', 'score', 'achievement', 'quest', 'multiplayer']),
  ('movies', ARRAY['film', 'actor', 'director', 'cinema', 'scene', 'plot', 'review', 'trailer']),
  ('music', ARRAY['song', 'album', 'artist', 'band', 'genre', 'concert', 'melody', 'rhythm']),
  ('food', ARRAY['recipe', 'cooking', 'ingredient', 'dish', 'cuisine', 'flavor', 'meal', 'restaurant']),
  ('sports', ARRAY['team', 'player', 'game', 'score', 'championship', 'league', 'match', 'tournament']);
