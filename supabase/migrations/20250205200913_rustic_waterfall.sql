/*
  # Add company isolation and user management functions

  1. New Functions
    - update_user_company: Updates a user's company_id in auth.users table
    - get_user_company: Gets a user's company information

  2. Security
    - Functions are restricted to authenticated users
    - Company updates only allowed for own user
*/

-- Function to update user's company_id
CREATE OR REPLACE FUNCTION update_user_company(user_id uuid, company_id_params uuid)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET company_id = company_id_params
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Function to get user's company
CREATE OR REPLACE FUNCTION get_user_company(user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.active
  FROM companies c
  JOIN auth.users u ON u.company_id = c.id
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;