-- ============================================
-- Supabase Storage: Create bucket for ticket attachments
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the bucket (if using SQL, otherwise create via Supabase Dashboard > Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-attachments',
  'ticket-attachments',
  false,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload
CREATE POLICY "ticket_attachments_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ticket-attachments');

-- Policy: authenticated users can read
CREATE POLICY "ticket_attachments_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'ticket-attachments');

-- Policy: authenticated users can delete their uploads
CREATE POLICY "ticket_attachments_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ticket-attachments');

-- Policy: service_role can do everything (for backend)
-- Note: service_role bypasses RLS by default, so no policy needed
