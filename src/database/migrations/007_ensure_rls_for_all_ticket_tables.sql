-- ============================================
-- Ensure RLS + base policies on all ticket_* tables
-- ============================================
-- This migration is idempotent and safe to run multiple times.
-- It applies to public tables prefixed with "ticket_".

DO $$
DECLARE
  tbl record;
  table_name text;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'ticket_%'
  LOOP
    table_name := tbl.tablename;

    -- Enable RLS for every ticket_* table
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);

    -- SELECT policy
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_name
        AND policyname = table_name || '_select_authenticated'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)',
        table_name || '_select_authenticated',
        table_name
      );
    END IF;

    -- INSERT policy
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_name
        AND policyname = table_name || '_insert_authenticated'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (true)',
        table_name || '_insert_authenticated',
        table_name
      );
    END IF;

    -- UPDATE policy
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_name
        AND policyname = table_name || '_update_authenticated'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
        table_name || '_update_authenticated',
        table_name
      );
    END IF;

    -- DELETE policy
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = table_name
        AND policyname = table_name || '_delete_authenticated'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR DELETE TO authenticated USING (true)',
        table_name || '_delete_authenticated',
        table_name
      );
    END IF;
  END LOOP;
END $$;
