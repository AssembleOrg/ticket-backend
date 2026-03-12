-- ============================================
-- RLS Policies for Ticket Backend
-- Run this in Supabase SQL Editor AFTER
-- the app has started and tables are created
-- by TypeORM synchronize: true
-- ============================================

-- ============================================
-- 1. Enable RLS on all ticket_ tables
-- ============================================
ALTER TABLE ticket_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_allowed_phones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Service role bypass (for backend)
-- The backend uses service_role key, which
-- bypasses RLS by default. These policies
-- are for authenticated users via Supabase Auth.
-- ============================================

-- ============================================
-- 3. ticket_clients policies
-- ============================================
CREATE POLICY "ticket_clients_select_authenticated"
  ON ticket_clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ticket_clients_insert_authenticated"
  ON ticket_clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ticket_clients_update_authenticated"
  ON ticket_clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ticket_clients_delete_authenticated"
  ON ticket_clients FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 4. ticket_systems policies
-- ============================================
CREATE POLICY "ticket_systems_select_authenticated"
  ON ticket_systems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ticket_systems_insert_authenticated"
  ON ticket_systems FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ticket_systems_update_authenticated"
  ON ticket_systems FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ticket_systems_delete_authenticated"
  ON ticket_systems FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 5. ticket_tickets policies
-- ============================================
CREATE POLICY "ticket_tickets_select_authenticated"
  ON ticket_tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ticket_tickets_insert_authenticated"
  ON ticket_tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ticket_tickets_update_authenticated"
  ON ticket_tickets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ticket_tickets_delete_authenticated"
  ON ticket_tickets FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 6. ticket_comments policies
-- ============================================
CREATE POLICY "ticket_comments_select_authenticated"
  ON ticket_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ticket_comments_insert_authenticated"
  ON ticket_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "ticket_comments_delete_authenticated"
  ON ticket_comments FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 7. ticket_history policies (read-only for auth users)
-- ============================================
CREATE POLICY "ticket_history_select_authenticated"
  ON ticket_history FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 8. ticket_allowed_emails policies (read-only for auth users)
-- ============================================
CREATE POLICY "ticket_allowed_emails_select_authenticated"
  ON ticket_allowed_emails FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 9. ticket_allowed_phones policies (read-only for auth users)
-- ============================================
CREATE POLICY "ticket_allowed_phones_select_authenticated"
  ON ticket_allowed_phones FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 10. Grant usage to anon and authenticated roles
-- (needed for Supabase Auth to work with these tables)
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ticket_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_clients TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_systems TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_tickets TO authenticated;
GRANT SELECT, INSERT, DELETE ON ticket_comments TO authenticated;
GRANT SELECT ON ticket_history TO authenticated;
GRANT SELECT ON ticket_allowed_emails TO authenticated;
GRANT SELECT ON ticket_allowed_phones TO authenticated;
