-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subreddit_battles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.subreddit_battles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.subreddit_battles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.subreddit_battles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.subreddit_battles;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_battles_updated_at ON public.subreddit_battles;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.subreddit_battles ADD COLUMN IF NOT EXISTS word_pack JSONB;
    EXCEPTION WHEN duplicate_column THEN 
        -- Handle case where column already exists
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.subreddit_battles ADD COLUMN IF NOT EXISTS scores JSONB;
    EXCEPTION WHEN duplicate_column THEN 
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.subreddit_battles ADD COLUMN IF NOT EXISTS participants JSONB;
    EXCEPTION WHEN duplicate_column THEN 
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.subreddit_battles ADD COLUMN IF NOT EXISTS status TEXT;
    EXCEPTION WHEN duplicate_column THEN 
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.subreddit_battles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN duplicate_column THEN 
        NULL;
    END;
    
    BEGIN
        ALTER TABLE public.subreddit_battles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN duplicate_column THEN 
        NULL;
    END;
END $$;

-- Now set the constraints and defaults
ALTER TABLE public.subreddit_battles 
    ALTER COLUMN subreddit1 SET NOT NULL,
    ALTER COLUMN subreddit2 SET NOT NULL,
    ALTER COLUMN start_time SET NOT NULL,
    ALTER COLUMN start_time SET DEFAULT NOW(),
    ALTER COLUMN end_time SET NOT NULL,
    ALTER COLUMN scores SET NOT NULL,
    ALTER COLUMN scores SET DEFAULT '{}'::jsonb,
    ALTER COLUMN participants SET NOT NULL,
    ALTER COLUMN participants SET DEFAULT '{}'::jsonb,
    ALTER COLUMN word_pack SET NOT NULL,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 'active',
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add check constraint for word_pack
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.subreddit_battles 
        ADD CONSTRAINT word_pack_has_words 
        CHECK (jsonb_array_length(word_pack->'words') > 0);
    EXCEPTION
        WHEN duplicate_object THEN 
            NULL;
    END;
END $$;

-- Add RLS policies
ALTER TABLE public.subreddit_battles ENABLE ROW LEVEL SECURITY;

-- Create trigger using existing update_updated_at_column function
CREATE TRIGGER update_battles_updated_at
    BEFORE UPDATE ON public.subreddit_battles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
CREATE POLICY "Enable read access for all users"
    ON public.subreddit_battles FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users"
    ON public.subreddit_battles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for all users"
    ON public.subreddit_battles FOR UPDATE
    USING (true);
