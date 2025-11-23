-- =====================================================
-- Whiteboard App - Database Migration
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create whiteboard_data table - stores entire localStorage state as JSON
CREATE TABLE IF NOT EXISTS whiteboard_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Store entire whiteboard state (matches localStorage structure)
  cells JSONB DEFAULT '[]'::jsonb,
  scholarships JSONB DEFAULT '[]'::jsonb,
  essays JSONB DEFAULT '[]'::jsonb,
  json_outputs JSONB DEFAULT '[]'::jsonb,
  block_positions JSONB DEFAULT '[]'::jsonb,

  -- Track first-time users
  is_first_time_user BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE whiteboard_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own whiteboard" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can insert own whiteboard" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can update own whiteboard" ON whiteboard_data;
DROP POLICY IF EXISTS "Users can delete own whiteboard" ON whiteboard_data;

-- RLS Policies: Users can only access their own whiteboard
CREATE POLICY "Users can view own whiteboard" ON whiteboard_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whiteboard" ON whiteboard_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whiteboard" ON whiteboard_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whiteboard" ON whiteboard_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_whiteboard_data_user_id ON whiteboard_data(user_id);

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Enable Google OAuth in Authentication > Providers
-- 2. Enable GitHub OAuth in Authentication > Providers
-- 3. Enable Email provider in Authentication > Providers
-- 4. Configure redirect URLs in provider settings
-- =====================================================
