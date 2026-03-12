-- ============================================
-- RLS + policies for ticket_attachments
-- ============================================

ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ticket_attachments_select_authenticated" ON ticket_attachments FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_attachments_insert_authenticated" ON ticket_attachments FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "ticket_attachments_delete_authenticated" ON ticket_attachments FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, DELETE ON ticket_attachments TO authenticated;

-- ============================================
-- Ensure Storage bucket exists
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
DO $$ BEGIN
  CREATE POLICY "ticket_attachments_storage_insert"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'ticket-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ticket_attachments_storage_select"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'ticket-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ticket_attachments_storage_delete"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'ticket-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
