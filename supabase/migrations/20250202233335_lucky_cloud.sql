/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `nome` (text)
      - `celular_cliente` (text)
      - `timer_is_active` (boolean)
      - `client_id` (uuid)
      - `ativacao` (boolean)

  2. Security
    - Enable RLS on `customers` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  nome text NOT NULL,
  celular_cliente text NOT NULL,
  timer_is_active boolean DEFAULT true,
  client_id uuid NOT NULL,
  ativacao boolean DEFAULT true
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Users can insert own customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);