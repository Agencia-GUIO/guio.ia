/*
  # Create insights table for AI analysis

  1. New Tables
    - `insights`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `period` (integer)
      - `insights` (jsonb)

  2. Security
    - Enable RLS on `insights` table
    - Add policies for authenticated users to read and insert their own insights
*/

CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  period integer NOT NULL,
  insights jsonb NOT NULL
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own insights"
  ON insights
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own insights"
  ON insights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);