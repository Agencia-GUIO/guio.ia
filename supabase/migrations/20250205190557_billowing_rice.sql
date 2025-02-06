/*
  # Create insights table with security

  1. New Tables
    - `insights`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `period` (integer) - Analysis period in days
      - `insights` (jsonb) - Stores analysis results
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  period integer NOT NULL,
  insights jsonb NOT NULL
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at);

-- Enable RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read insights"
  ON insights
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert insights"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update insights"
  ON insights
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete insights"
  ON insights
  FOR DELETE
  TO authenticated
  USING (true);

-- Add validation check for period
ALTER TABLE insights 
  ADD CONSTRAINT insights_period_check 
  CHECK (period IN (7, 15, 30));