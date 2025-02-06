/*
  # Add company isolation

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `active` (boolean)

  2. Changes
    - Add company_id to users table
    - Add role to users table
    - Add company_id to customers table
    - Add company_id to messages table
    - Add company_id to insights table

  3. Security
    - Enable RLS on companies table
    - Add policies for company data access
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Add company_id and role to auth.users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'user'));

-- Add company_id to customers
ALTER TABLE customers 
ADD COLUMN company_id uuid REFERENCES companies(id);

-- Add company_id to messages
ALTER TABLE messages 
ADD COLUMN company_id uuid REFERENCES companies(id);

-- Add company_id to insights
ALTER TABLE insights 
ADD COLUMN company_id uuid REFERENCES companies(id);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "users_can_read_own_company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (id = auth.jwt()->>'company_id');

-- Update policies for customers
DROP POLICY IF EXISTS "Users can read own customers" ON customers;
CREATE POLICY "company_isolation_customers_select"
  ON customers
  FOR SELECT
  TO authenticated
  USING (company_id = auth.jwt()->>'company_id');

-- Update policies for messages
DROP POLICY IF EXISTS "Users can read own messages" ON messages;
CREATE POLICY "company_isolation_messages_select"
  ON messages
  FOR SELECT
  TO authenticated
  USING (company_id = auth.jwt()->>'company_id');

-- Update policies for insights
DROP POLICY IF EXISTS "insights_read_policy" ON insights;
CREATE POLICY "company_isolation_insights_select"
  ON insights
  FOR SELECT
  TO authenticated
  USING (company_id = auth.jwt()->>'company_id');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_insights_company_id ON insights(company_id);