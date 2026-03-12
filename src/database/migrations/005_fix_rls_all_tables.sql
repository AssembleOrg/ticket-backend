-- ============================================
-- Fix RLS for ALL ticket_ tables
-- Ensures every table has RLS enabled + policies
-- ============================================

-- Drop old ticket_systems table (renamed to ticket_projects)
DROP TABLE IF EXISTS ticket_systems CASCADE;

-- Enable RLS on ALL tables (idempotent)
ALTER TABLE ticket_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_hour_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_hour_pack_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_hour_pack_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_allowed_phones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ticket_clients
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_clients_select_authenticated" ON ticket_clients FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_clients_insert_authenticated" ON ticket_clients FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_clients_update_authenticated" ON ticket_clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_clients_delete_authenticated" ON ticket_clients FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_projects
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_projects_select_authenticated" ON ticket_projects FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_projects_insert_authenticated" ON ticket_projects FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_projects_update_authenticated" ON ticket_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_projects_delete_authenticated" ON ticket_projects FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_tickets
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_tickets_select_authenticated" ON ticket_tickets FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_tickets_insert_authenticated" ON ticket_tickets FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_tickets_update_authenticated" ON ticket_tickets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_tickets_delete_authenticated" ON ticket_tickets FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_comments
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_comments_select_authenticated" ON ticket_comments FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_comments_insert_authenticated" ON ticket_comments FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_comments_delete_authenticated" ON ticket_comments FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_history
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_history_select_authenticated" ON ticket_history FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_tasks
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_tasks_select_authenticated" ON ticket_tasks FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_tasks_insert_authenticated" ON ticket_tasks FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_tasks_update_authenticated" ON ticket_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_tasks_delete_authenticated" ON ticket_tasks FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_time_entries
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_time_entries_select_authenticated" ON ticket_time_entries FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_time_entries_insert_authenticated" ON ticket_time_entries FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_time_entries_delete_authenticated" ON ticket_time_entries FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_hour_packs
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_hour_packs_select_authenticated" ON ticket_hour_packs FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_hour_packs_insert_authenticated" ON ticket_hour_packs FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_hour_packs_update_authenticated" ON ticket_hour_packs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_hour_pack_months
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_hour_pack_months_select_authenticated" ON ticket_hour_pack_months FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_hour_pack_audit
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_hour_pack_audit_select_authenticated" ON ticket_hour_pack_audit FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_allowed_emails
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_allowed_emails_select_authenticated" ON ticket_allowed_emails FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- ticket_allowed_phones
-- ============================================
DO $$ BEGIN
  CREATE POLICY "ticket_allowed_phones_select_authenticated" ON ticket_allowed_phones FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- Grants
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_tickets TO authenticated;
GRANT SELECT, INSERT, DELETE ON ticket_comments TO authenticated;
GRANT SELECT ON ticket_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_tasks TO authenticated;
GRANT SELECT, INSERT, DELETE ON ticket_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ticket_hour_packs TO authenticated;
GRANT SELECT ON ticket_hour_pack_months TO authenticated;
GRANT SELECT ON ticket_hour_pack_audit TO authenticated;
GRANT SELECT ON ticket_allowed_emails TO authenticated;
GRANT SELECT ON ticket_allowed_phones TO authenticated;
