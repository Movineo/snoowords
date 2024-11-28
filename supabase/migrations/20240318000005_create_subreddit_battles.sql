-- Check for required tables
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'word_packs') THEN
        RAISE EXCEPTION 'Required table word_packs does not exist';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reddit_users') THEN
        RAISE EXCEPTION 'Required table reddit_users does not exist';
    END IF;
END $$;

-- Create subreddit battles table
CREATE TABLE IF NOT EXISTS subreddit_battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subreddit1 TEXT NOT NULL,
    subreddit2 TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    participants JSONB NOT NULL DEFAULT '{}'::jsonb,
    word_pack_id UUID REFERENCES word_packs(id),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    CONSTRAINT different_subreddits CHECK (subreddit1 <> subreddit2),
    CONSTRAINT valid_end_time CHECK (end_time > start_time)
);

-- Create battle actions table for live feed
CREATE TABLE IF NOT EXISTS battle_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID REFERENCES subreddit_battles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    player_id UUID REFERENCES reddit_users(id),
    subreddit TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_action_type CHECK (type IN ('join', 'word', 'award', 'powerup', 'milestone'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_battles_status ON subreddit_battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_end_time ON subreddit_battles(end_time);
CREATE INDEX IF NOT EXISTS idx_battles_subreddits ON subreddit_battles(subreddit1, subreddit2);
CREATE INDEX IF NOT EXISTS idx_battle_actions_battle_id ON battle_actions(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_actions_timestamp ON battle_actions(timestamp);

-- Create trigger for updated_at (reusing existing function)
DROP TRIGGER IF EXISTS update_subreddit_battles_updated_at ON subreddit_battles;
CREATE TRIGGER update_subreddit_battles_updated_at
    BEFORE UPDATE ON subreddit_battles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE subreddit_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_actions ENABLE ROW LEVEL SECURITY;

-- Everyone can view battles and actions
CREATE POLICY subreddit_battles_view_policy ON subreddit_battles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY battle_actions_view_policy ON battle_actions
    FOR SELECT
    TO authenticated
    USING (true);

-- Only authenticated users with valid Reddit tokens can create/update battles
CREATE POLICY subreddit_battles_insert_policy ON subreddit_battles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reddit_users
            WHERE id = auth.uid()
            AND access_token IS NOT NULL
            AND last_login > NOW() - INTERVAL '24 hours'
        )
    );

CREATE POLICY subreddit_battles_update_policy ON subreddit_battles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM reddit_users
            WHERE id = auth.uid()
            AND access_token IS NOT NULL
            AND last_login > NOW() - INTERVAL '24 hours'
        )
    );

-- Only battle participants can add actions
CREATE POLICY battle_actions_insert_policy ON battle_actions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM subreddit_battles b
            WHERE b.id = battle_id
            AND (b.participants->>(auth.uid())::text) IS NOT NULL
        )
    );

-- Add tables to existing realtime publication if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE subreddit_battles;
        ALTER PUBLICATION supabase_realtime ADD TABLE battle_actions;
    END IF;
END $$;
