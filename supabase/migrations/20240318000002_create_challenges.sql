-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    theme TEXT NOT NULL,
    target_score INTEGER NOT NULL DEFAULT 100,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_scores table
CREATE TABLE IF NOT EXISTS challenge_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    username TEXT NOT NULL REFERENCES reddit_users(username),
    score INTEGER NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, username)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenge_scores_updated_at ON challenge_scores;
CREATE TRIGGER update_challenge_scores_updated_at
    BEFORE UPDATE ON challenge_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_scores_challenge ON challenge_scores(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_scores_user ON challenge_scores(username);

-- Create function to create daily challenge
CREATE OR REPLACE FUNCTION create_daily_challenge()
RETURNS challenges AS $$
DECLARE
    new_challenge challenges;
    themes TEXT[] := ARRAY['Space Adventure', 'Tech Revolution', 'Nature Explorer', 'Gaming Champion', 'Science Discovery'];
    random_theme TEXT;
    start_time TIMESTAMP WITH TIME ZONE;
    end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Select random theme
    random_theme := themes[floor(random() * array_length(themes, 1) + 1)];
    
    -- Set start time to current day at midnight UTC
    start_time := date_trunc('day', NOW() AT TIME ZONE 'UTC');
    -- Set end time to next day at midnight UTC
    end_time := start_time + INTERVAL '1 day';

    -- Create new challenge
    INSERT INTO challenges (
        title,
        description,
        theme,
        target_score,
        start_date,
        end_date
    ) VALUES (
        'Daily ' || random_theme || ' Challenge',
        'Score points by finding words related to ' || random_theme || '! Top players will receive special Reddit awards.',
        random_theme,
        100,
        start_time,
        end_time
    )
    RETURNING * INTO new_challenge;

    RETURN new_challenge;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure daily challenge exists
CREATE OR REPLACE FUNCTION ensure_daily_challenge()
RETURNS challenges AS $$
DECLARE
    current_challenge challenges;
BEGIN
    -- Try to get current challenge
    SELECT *
    INTO current_challenge
    FROM challenges
    WHERE NOW() AT TIME ZONE 'UTC' BETWEEN start_date AND end_date
    LIMIT 1;

    -- If no current challenge exists, create one
    IF current_challenge IS NULL THEN
        RETURN create_daily_challenge();
    END IF;

    RETURN current_challenge;
END;
$$ LANGUAGE plpgsql;
