-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    is_reddit_user BOOLEAN DEFAULT false,
    words TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster score sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read leaderboard
CREATE POLICY "Allow public read access" ON public.leaderboard
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to insert their own scores
CREATE POLICY "Allow authenticated insert" ON public.leaderboard
    FOR INSERT
    WITH CHECK (true);

-- Enable realtime subscriptions for the leaderboard table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
