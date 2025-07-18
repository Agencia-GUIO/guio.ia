/*
  # Create insights table with RLS

  1. New Tables
    - `insights`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `period` (integer)
      - `insights` (jsonb)
      - `client_id` (uuid) - links to auth.uid()

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own insights
    - Add period validation
*/

-- Create the insights table
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  period integer NOT NULL,
  insights jsonb NOT NULL,
  client_id uuid NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at);
CREATE INDEX IF NOT EXISTS idx_insights_client_id ON insights(client_id);

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own insights"
  ON insights
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Users can insert own insights"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can update own insights"
  ON insights
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can delete own insights"
  ON insights
  FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Add validation check for period
ALTER TABLE insights 
  ADD CONSTRAINT insights_period_check 
  CHECK (period IN (7, 15, 30));