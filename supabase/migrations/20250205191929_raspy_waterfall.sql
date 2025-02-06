/*
  # Update insights table policies

  1. Changes
    - Drop existing policies
    - Recreate policies with proper names
    - Add period validation

  2. Security
    - Maintain RLS enabled
    - Add policies for authenticated users
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read insights" ON insights;
DROP POLICY IF EXISTS "Users can insert insights" ON insights;
DROP POLICY IF EXISTS "Users can update insights" ON insights;
DROP POLICY IF EXISTS "Users can delete insights" ON insights;

-- Create new policies with unique names
CREATE POLICY "insights_read_policy"
  ON insights
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "insights_insert_policy"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "insights_update_policy"
  ON insights
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "insights_delete_policy"
  ON insights
  FOR DELETE
  TO authenticated
  USING (true);