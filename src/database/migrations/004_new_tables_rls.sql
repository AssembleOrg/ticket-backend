-- ============================================
-- RLS Policies for new tables (v2)
-- Run AFTER TypeORM creates the new tables
-- ============================================

-- Drop old ticket_systems policies (renamed to ticket_projects)
DROP POLICY IF EXISTS "ticket_systems_select_authenticated" ON ticket_systems;
DROP POLICY IF EXISTS "ticket_systems_insert_authenticated" ON ticket_systems;
DROP POLICY IF EXISTS "ticket_systems_update_authenticated" ON ticket_systems;
DROP POLICY IF EXISTS "ticket_systems_delete_authenticated" ON ticket_systems;

-- Enable RLS on new tables
ALTER TABLE ticket_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_hour_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_hour_pack_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_hour_pack_audit ENABLE ROW LEVEL SECURITY;

-- ticket_projects
CREATE POLICY "ticket_projects_select_authenticated" ON ticket_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "ticket_projects_insert_authenticated" ON ticket_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ticket_projects_update_authenticated" ON ticket_projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ticket_projects_delete_authenticated" ON ticket_projects FOR DELETE TO authenticated USING (true);

-- ticket_tasks
CREATE POLICY "ticket_tasks_select_authenticated" ON ticket_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "ticket_tasks_insert_authenticated" ON ticket_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ticket_tasks_update_authenticated" ON ticket_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ticket_tasks_delete_authenticated" ON ticket_tasks FOR DELETE TO authenticated USING (true);

-- ticket_time_entries
CREATE POLICY "ticket_time_entries_select_authenticated" ON ticket_time_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "ticket_time_entries_insert_authenticated" ON ticket_time_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ticket_time_entries_delete_authenticated" ON ticket_time_entries FOR DELETE TO authenticated USING (true);

-- ticket_hour_packs
CREATE POLICY "ticket_hour_packs_select_authenticated" ON ticket_hour_packs FOR SELECT TO authenticated USING (true);
CREATE POLICY "ticket_hour_packs_insert_authenticated" ON ticket_hour_packs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ticket_hour_packs_update_authenticated" ON ticket_hour_packs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ticket_hour_pack_months (read-only)
CREATE POLICY "ticket_hour_pack_months_select_authenticated" ON ticket_hour_pack_months FOR SELECT TO authenticated USING (true);

-- ticket_hour_pack_audit (read-only)
CREATE POLICY "ticket_hour_pack_audit_select_authenticated" ON ticket_hour_pack_audit FOR SELECT TO authenticated USING (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_tasks TO authenticated;
GRANT SELECT, INSERT, DELETE ON ticket_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ticket_hour_packs TO authenticated;
GRANT SELECT ON ticket_hour_pack_months TO authenticated;
GRANT SELECT ON ticket_hour_pack_audit TO authenticated;
