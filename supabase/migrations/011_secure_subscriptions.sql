-- 1. Revoke the insecure update policy (Fixes Security Hole)
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- 2. Create function to handle auto-granting premium (Backend Logic)
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger AS $$
BEGIN
  -- Check allowlist (Hardcoded for now, could be a table)
  IF new.email IN ('genenipangue@gmail.com', 'gfdnipangue@addu.edu.ph', 'solitudeafar@gmail.com') THEN
    -- Insert or Update subscription to premium
    INSERT INTO public.subscriptions (user_id, plan, status, billing_cycle, current_period_start, current_period_end)
    VALUES (
      new.id, 
      'premium', 
      'active', 
      'annual', 
      NOW(), 
      NOW() + interval '1 year'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      plan = 'premium', 
      status = 'active', 
      billing_cycle = 'annual',
      current_period_end = NOW() + interval '1 year',
      updated_at = NOW();
  ELSE
    -- Ensure free subscription exists
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (new.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger on User creation
DROP TRIGGER IF EXISTS on_user_created_subscription ON public.users;
CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
