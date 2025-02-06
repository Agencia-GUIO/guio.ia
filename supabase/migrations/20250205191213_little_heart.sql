/*
  # Create insights table with proper RLS

  1. New Tables
    - `insights`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `period` (integer)
      - `insights` (jsonb)
      - `user_id` (uuid) - links to auth.users

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own insights
    - Add period validation
*/

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  period integer NOT NULL,
  insights jsonb NOT NULL,
  user_id uuid DEFAULT auth.uid() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own insights"
  ON insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON insights
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON insights
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add validation check for period
ALTER TABLE insights 
  ADD CONSTRAINT insights_period_check 
  CHECK (period IN (7, 15, 30));