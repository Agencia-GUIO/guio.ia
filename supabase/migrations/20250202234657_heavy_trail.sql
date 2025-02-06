/*
  # Remove RLS and allow public access
  
  1. Changes
    - Disable RLS on customers table
    - Disable RLS on messages table
    - Drop existing policies
  
  2. Security
    - WARNING: This removes all security restrictions
    - Tables will be publicly accessible
    - This should only be used for development/testing
*/

-- Disable RLS on tables
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;

DROP POLICY IF EXISTS "Users can read own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;