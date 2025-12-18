-- Fix specific existing users to ensured Premium status
-- This handles users who existed before the auto-grant trigger was created

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get ID for solitudeafar@gmail.com
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'solitudeafar@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- Upsert subscription to Premium
        INSERT INTO public.subscriptions (
            user_id, 
            plan, 
            status, 
            billing_cycle, 
            current_period_start, 
            current_period_end,
            updated_at
        )
        VALUES (
            target_user_id, 
            'premium', 
            'active', 
            'annual', 
            NOW(), 
            NOW() + interval '10 years', -- Grant long-term access for this specific user
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            plan = 'premium', 
            status = 'active', 
            billing_cycle = 'annual',
            current_period_end = GREATEST(subscriptions.current_period_end, NOW() + interval '1 year'),
            updated_at = NOW();
            
        RAISE NOTICE 'Updated subscription for solitudeafar@gmail.com';
    END IF;
    
    -- Also handle genenipangue@gmail.com just in case
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'genenipangue@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
         INSERT INTO public.subscriptions (
            user_id, plan, status, billing_cycle, current_period_start, current_period_end, updated_at
        ) VALUES (
            target_user_id, 'premium', 'active', 'annual', NOW(), NOW() + interval '10 years', NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET plan = 'premium', status = 'active', current_period_end = NOW() + interval '10 years';
    END IF;

END $$;
