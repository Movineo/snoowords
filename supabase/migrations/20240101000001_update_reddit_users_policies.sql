-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON reddit_users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON reddit_users;
DROP POLICY IF EXISTS "Enable update access for all users" ON reddit_users;

-- Enable RLS
ALTER TABLE reddit_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
ON reddit_users FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON reddit_users FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON reddit_users FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);
