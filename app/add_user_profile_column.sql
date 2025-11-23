-- Add user_profile column to whiteboard_data table
ALTER TABLE whiteboard_data
ADD COLUMN IF NOT EXISTS user_profile JSONB DEFAULT NULL;

-- Enable RLS on whiteboard_data table (if not already enabled)
ALTER TABLE whiteboard_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own whiteboard data" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can insert their own whiteboard data" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can update their own whiteboard data" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can delete their own whiteboard data" ON whiteboard_data;

-- Create RLS policies for whiteboard_data
-- Policy for SELECT
CREATE POLICY "Users can view their own whiteboard data"
ON whiteboard_data
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for INSERT
CREATE POLICY "Users can insert their own whiteboard data"
ON whiteboard_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE
CREATE POLICY "Users can update their own whiteboard data"
ON whiteboard_data
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE
CREATE POLICY "Users can delete their own whiteboard data"
ON whiteboard_data
FOR DELETE
USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON whiteboard_data TO authenticated;
