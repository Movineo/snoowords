-- Create word_packs table
CREATE TABLE word_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  description TEXT,
  words TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  creator TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create community_puzzles table
CREATE TABLE community_puzzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  creator TEXT NOT NULL,
  description TEXT,
  words TEXT[] NOT NULL,
  hints TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  upvotes INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to increment word pack upvotes
CREATE OR REPLACE FUNCTION increment_word_pack_upvotes(pack_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE word_packs
  SET upvotes = upvotes + 1
  WHERE id = pack_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment puzzle upvotes
CREATE OR REPLACE FUNCTION increment_puzzle_upvotes(puzzle_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_puzzles
  SET upvotes = upvotes + 1
  WHERE id = puzzle_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment puzzle plays
CREATE OR REPLACE FUNCTION increment_puzzle_plays(puzzle_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_puzzles
  SET plays = plays + 1
  WHERE id = puzzle_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes
CREATE INDEX idx_word_packs_subreddit ON word_packs(subreddit);
CREATE INDEX idx_word_packs_upvotes ON word_packs(upvotes DESC);
CREATE INDEX idx_community_puzzles_upvotes ON community_puzzles(upvotes DESC);
CREATE INDEX idx_community_puzzles_plays ON community_puzzles(plays DESC);
CREATE INDEX idx_community_puzzles_created_at ON community_puzzles(created_at DESC);
