-- Migration: Seed Dev Auth Bypass User
-- Purpose: Create a "Sovereign Observer" user for development/E2E testing
-- This user is used by the `?dev_auto_login=true` feature
-- Dev User UUID: 00000000-0000-0000-0000-000000000001

-- 1. Insert Dev User (idempotent)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'dev@sovereign.ai',
    crypt('devpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated',
    NOW(),
    NOW(),
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.users (required for app logic)
INSERT INTO public.users (id, email, theme, disclaimer_accepted)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dev@sovereign.ai',
    'light',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Grant Premium Subscription (for testing)
INSERT INTO public.subscriptions (user_id, status, plan, current_period_end)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'active',
    'premium',
    NOW() + INTERVAL '1 year'
)
ON CONFLICT (user_id) DO NOTHING;
