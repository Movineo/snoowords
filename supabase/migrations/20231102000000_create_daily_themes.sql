-- Create daily_themes table
CREATE TABLE IF NOT EXISTS daily_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme TEXT NOT NULL,
  description TEXT NOT NULL,
  bonus_words TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on expiration date for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_themes_expires_at ON daily_themes(expires_at);

-- Create trigger to automatically update created_at
CREATE OR REPLACE FUNCTION update_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_created_at
  BEFORE INSERT ON daily_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_created_at();
