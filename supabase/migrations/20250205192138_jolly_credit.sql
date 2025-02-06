/*
  # Fix Insights Table RLS

  1. Changes
    - Add client_id column to track ownership
    - Drop existing policies
    - Create new RLS policies with proper ownership checks
    - Add index for client_id
*/

-- Add client_id column
ALTER TABLE insights
ADD COLUMN client_id uuid NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_insights_client_id ON insights(client_id);

-- Drop existing policies
DROP POLICY IF EXISTS "insights_read_policy" ON insights;
DROP POLICY IF EXISTS "insights_insert_policy" ON insights;
DROP POLICY IF EXISTS "insights_update_policy" ON insights;
DROP POLICY IF EXISTS "insights_delete_policy" ON insights;

-- Create new policies with proper ownership checks
CREATE POLICY "insights_read_policy"
  ON insights
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "insights_insert_policy"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "insights_update_policy"
  ON insights
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "insights_delete_policy"
  ON insights
  FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());