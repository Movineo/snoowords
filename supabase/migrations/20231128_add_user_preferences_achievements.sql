-- Add preferences and achievements columns to reddit_users table
ALTER TABLE reddit_users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"soundEnabled": true, "theme": "default"}'::jsonb,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '{}'::jsonb;
