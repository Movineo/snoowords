-- Create profiles table first
-- CREATE TABLE public.profiles (
--     id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
--     reddit_username TEXT UNIQUE,
--     display_name TEXT,
--     karma INTEGER DEFAULT 0,
--     achievements JSONB DEFAULT '[]'::jsonb,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );

-- Enable Row Level Security
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create game_rooms table
CREATE TABLE IF NOT EXISTS public.game_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID REFERENCES reddit_users(id),
    guest_id UUID REFERENCES reddit_users(id),
    status TEXT NOT NULL CHECK (status IN ('waiting', 'playing', 'finished')),
    word_pack_id TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create word_packs table
-- CREATE TABLE public.word_packs (
--     id TEXT PRIMARY KEY,
--     subreddit TEXT NOT NULL,
--     title TEXT,
--     words TEXT[] NOT NULL,
--     upvotes INTEGER DEFAULT 0,
--     created_by TEXT REFERENCES public.profiles(reddit_username),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );

-- Create game_results table
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_room_id UUID REFERENCES public.game_rooms(id),
    player_id UUID REFERENCES reddit_users(id),
    score INTEGER NOT NULL,
    words TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_game_rooms_host_id ON public.game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_guest_id ON public.game_rooms(guest_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON public.game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_results_player_id ON public.game_results(player_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_room_id ON public.game_results(game_room_id);

-- Add RLS policies
-- CREATE POLICY "Public profiles are viewable by everyone"
-- ON public.profiles FOR SELECT
-- TO public
-- USING (true);

-- CREATE POLICY "Users can insert their own profile"
-- ON public.profiles FOR INSERT
-- TO public
-- WITH CHECK (auth.uid() = id);

-- CREATE POLICY "Users can update own profile"
-- ON public.profiles FOR UPDATE
-- TO public
-- USING (auth.uid() = id);

-- Game rooms policies
CREATE POLICY "Anyone can create a game room"
ON public.game_rooms FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view game rooms"
ON public.game_rooms FOR SELECT
TO public
USING (true);

CREATE POLICY "Host can update their game rooms"
ON public.game_rooms FOR UPDATE
TO public
USING (host_id = auth.uid());

-- Word packs policies
-- CREATE POLICY "Anyone can view word packs"
-- ON public.word_packs FOR SELECT
-- TO public
-- USING (true);

-- CREATE POLICY "Authenticated users can create word packs"
-- ON public.word_packs FOR INSERT
-- TO public
-- WITH CHECK (auth.role() = 'authenticated');

-- Game results policies
CREATE POLICY "Anyone can view game results"
ON public.game_results FOR SELECT
TO public
USING (true);

CREATE POLICY "Players can insert their own results"
ON public.game_results FOR INSERT
TO public
WITH CHECK (player_id = auth.uid());

-- Enable realtime for multiplayer
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;

-- Add function to update room status
CREATE OR REPLACE FUNCTION public.update_room_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_status_trigger
    BEFORE UPDATE ON public.game_rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_room_status();

-- Add function to update profile timestamps
-- CREATE OR REPLACE FUNCTION public.update_profile_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER update_profiles_updated_at
--     BEFORE UPDATE ON public.profiles
--     FOR EACH ROW
--     EXECUTE FUNCTION public.update_profile_updated_at();

-- Add index on reddit_username for faster lookups
-- CREATE INDEX idx_profiles_reddit_username ON public.profiles(reddit_username);

-- Add function to handle profile creation
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     INSERT INTO public.profiles (id)
--     VALUES (NEW.id);
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- Trigger to create profile on new user
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_user();
