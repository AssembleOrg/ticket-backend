import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

async function runSQL(client: pg.Client, filePath: string, description: string) {
  const sql = readFileSync(filePath, 'utf-8');
  console.log(`\n▶ Running: ${description}...`);

  try {
    await client.query(sql);
    console.log(`  ✓ Done: ${description}`);
    return true;
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log(`  ⚠ Skipped (already exists): ${description}`);
      return true;
    }
    console.error(`  ✗ Failed: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Ticket Backend: Running Migrations ===\n');

  const dbUrl = process.env.DATABASE_URL!;
  // Remove pgbouncer param for direct DDL operations
  const directUrl = dbUrl.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✓ Connected to database');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const migrationsDir = join(__dirname, 'migrations');

  // Run each migration file as individual statements to handle "already exists" gracefully
  const files = [
    { file: '001_enable_rls_policies.sql', desc: 'Enable RLS & Policies' },
    { file: '002_seed_initial_data.sql', desc: 'Seed initial data' },
    { file: '003_storage_bucket.sql', desc: 'Create storage bucket' },
    { file: '004_new_tables_rls.sql', desc: 'RLS for new tables (projects, tasks, time entries, hour packs)' },
    { file: '005_fix_rls_all_tables.sql', desc: 'Fix RLS: drop ticket_systems, ensure all policies' },
    { file: '006_attachments_rls.sql', desc: 'RLS & storage bucket for attachments' },
  ];

  for (const { file, desc } of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`\n▶ Running: ${desc}...`);

    try {
      await client.query(sql);
      console.log(`  ✓ Done`);
    } catch (err: any) {
      if (
        err.message?.includes('already exists') ||
        err.message?.includes('duplicate')
      ) {
        console.log(`  ⚠ Skipped (already exists)`);
      } else {
        console.error(`  ✗ Failed: ${err.message}`);
      }
    }
  }

  await client.end();
  console.log('\n=== All migrations completed ===');
}

main().catch(console.error);
