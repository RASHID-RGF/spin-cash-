-- Update the handle_new_user function to set registration_paid for Google OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, referral_code, registration_paid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    generate_referral_code(),
    CASE
      WHEN NEW.raw_user_meta_data->>'registration_paid' = 'true' THEN true
      WHEN NEW.app_metadata->>'provider' = 'google' THEN true
      ELSE false
    END
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;