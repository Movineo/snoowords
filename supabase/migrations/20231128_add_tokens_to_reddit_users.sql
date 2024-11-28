-- Add token columns to reddit_users table
ALTER TABLE reddit_users 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT;
