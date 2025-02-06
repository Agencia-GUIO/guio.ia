/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `message_content` (text)
      - `status` (text)
      - `role` (text)
      - `phone` (text)
      - `client_id` (uuid)
      - `tokens` (integer)
      - `custo_tokens` (numeric)

  2. Security
    - Enable RLS on `messages` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  message_content text NOT NULL,
  status text NOT NULL,
  role text NOT NULL CHECK (role IN ('assistant', 'customer')),
  phone text NOT NULL,
  client_id uuid NOT NULL,
  tokens integer DEFAULT 0,
  custo_tokens numeric(10, 6) DEFAULT 0.0
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);