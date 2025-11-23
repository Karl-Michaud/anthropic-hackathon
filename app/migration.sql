-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create whiteboard_data table
CREATE TABLE IF NOT EXISTS whiteboard_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  cells JSONB DEFAULT '[]'::jsonb,
  scholarships JSONB DEFAULT '[]'::jsonb,
  essays JSONB DEFAULT '[]'::jsonb,
  json_outputs JSONB DEFAULT '[]'::jsonb,
  block_positions JSONB DEFAULT '[]'::jsonb,
  is_first_time_user BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column to existing tables if not exists
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE prompt_personalities ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE prompt_priorities ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE prompt_values ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE prompt_weights ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add RLS policies for whiteboard_data
ALTER TABLE whiteboard_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own whiteboard data" ON whiteboard_data;
CREATE POLICY "Users can read their own whiteboard data"
  ON whiteboard_data FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own whiteboard data" ON whiteboard_data;
CREATE POLICY "Users can insert their own whiteboard data"
  ON whiteboard_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own whiteboard data" ON whiteboard_data;
CREATE POLICY "Users can update their own whiteboard data"
  ON whiteboard_data FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own whiteboard data" ON whiteboard_data;
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
