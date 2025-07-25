-- ================================================================
-- DATABASE INCONSISTENCIES FIX
-- ================================================================
-- Purpose: Fix critical inconsistencies between database schema and TypeScript code
-- Date: 2025-01-21
-- ================================================================

-- Fix messages table to add is_read field if needed by APIs
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Create index for better performance on is_read queries
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(conversation_id, is_read, created_at DESC);

-- Update existing messages to set is_read = true if read_count > 0
UPDATE messages 
SET is_read = true 
WHERE read_count > 0 AND is_read = false;

-- Add trigger to sync is_read with read_count
CREATE OR REPLACE FUNCTION sync_message_read_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If read_count changes, update is_read accordingly
    IF NEW.read_count != OLD.read_count THEN
        NEW.is_read = (NEW.read_count > 0);
    END IF;
    
    -- If is_read is set to true and read_count is 0, set read_count to 1
    IF NEW.is_read = true AND NEW.read_count = 0 THEN
        NEW.read_count = 1;
    END IF;
    
    -- If is_read is set to false, reset read_count to 0
    IF NEW.is_read = false THEN
        NEW.read_count = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_sync_message_read_status ON messages;
CREATE TRIGGER trigger_sync_message_read_status
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION sync_message_read_status();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database inconsistencies fixed successfully!';
    RAISE NOTICE '  - Added is_read field to messages table';
    RAISE NOTICE '  - Created sync trigger between is_read and read_count';
    RAISE NOTICE '  - Updated existing messages with proper is_read status';
END $$;