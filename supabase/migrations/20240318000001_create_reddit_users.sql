-- Create reddit_users table
CREATE TABLE IF NOT EXISTS reddit_users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    karma INTEGER DEFAULT 0,
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_reddit_users_username ON reddit_users(username);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_reddit_users_updated_at ON reddit_users;
CREATE TRIGGER update_reddit_users_updated_at
    BEFORE UPDATE ON reddit_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
