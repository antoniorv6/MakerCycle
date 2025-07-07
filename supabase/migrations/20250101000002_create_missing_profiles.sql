-- Migration to create missing profiles for existing users
-- This handles the case where users signed up before the trigger was in place

-- Create profiles for existing auth.users that don't have profiles yet
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING; 