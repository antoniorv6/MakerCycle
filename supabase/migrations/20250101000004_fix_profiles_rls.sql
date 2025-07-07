-- Fix RLS policies for profiles to allow team invitations
-- Allow authenticated users to read all profiles (needed for team invitations)

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create a new policy that allows reading all profiles
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep the existing policies for update and insert
-- (These are already correct and don't need to change) 