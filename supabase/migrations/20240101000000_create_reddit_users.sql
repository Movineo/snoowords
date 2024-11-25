-- Create reddit_users table
CREATE TABLE IF NOT EXISTS reddit_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    karma INTEGER DEFAULT 0,
    avatar_url TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username
CREATE INDEX IF NOT EXISTS idx_reddit_users_username ON reddit_users(username);

-- Create RLS policies
ALTER TABLE reddit_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read their own data"
    ON reddit_users FOR SELECT
    USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update their own data"
    ON reddit_users FOR UPDATE
    USING (auth.uid() = id);

-- Allow insertion of new users
CREATE POLICY "Allow insertion of new users"
    ON reddit_users FOR INSERT
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reddit_users_updated_at
    BEFORE UPDATE ON reddit_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
