-- ============================================
-- Seed initial data
-- Run this in Supabase SQL Editor AFTER
-- 001_enable_rls_policies.sql
-- ============================================

-- Insert allowed emails (users that can login to the web dashboard)
-- Replace with your actual emails
INSERT INTO ticket_allowed_emails (id, email, active, created_at)
VALUES
  (gen_random_uuid(), 'admin@pistech.com', true, now()),
  (gen_random_uuid(), 'charly@pistech.net', true, now())
ON CONFLICT (email) DO NOTHING;

-- Insert allowed phones (WhatsApp numbers that can use the bot)
-- Replace with your actual phone numbers
-- client_id can be linked later when clients are created
INSERT INTO ticket_allowed_phones (id, phone, active, created_at)
VALUES
  (gen_random_uuid(), '5491136585581', true, now())
ON CONFLICT (phone) DO NOTHING;
