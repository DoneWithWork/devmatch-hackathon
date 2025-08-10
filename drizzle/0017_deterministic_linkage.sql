-- Add client_provided_id column for deterministic off-chain/on-chain linkage
-- Migration: add client_provided_id column (run once)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'certificates' 
                   AND column_name = 'client_provided_id') THEN
        ALTER TABLE certificates ADD COLUMN client_provided_id text;
    END IF;
END $$;
