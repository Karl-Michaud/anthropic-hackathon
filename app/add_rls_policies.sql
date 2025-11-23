-- Enable RLS on whiteboard_data
ALTER TABLE whiteboard_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own whiteboard data" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can insert their own whiteboard data" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can update their own whiteboard data" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can delete their own whiteboard data" ON whiteboard_data;

-- Create RLS policies for whiteboard_data
CREATE POLICY "Users can read their own whiteboard data"
  ON whiteboard_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whiteboard data"
  ON whiteboard_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whiteboard data"
  ON whiteboard_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own whiteboard data"
  ON whiteboard_data FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_whiteboard_data_user_id ON whiteboard_data(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_user_id ON scholarships(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_personalities_user_id ON prompt_personalities(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_priorities_user_id ON prompt_priorities(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_values_user_id ON prompt_values(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_weights_user_id ON prompt_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
