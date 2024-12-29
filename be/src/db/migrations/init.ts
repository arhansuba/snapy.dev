// src/db/migrations/init.ts
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  // Create enum types
  await sql`
    CREATE TYPE "PlanType" AS ENUM (
      'FREE',
      'BASIC',
      'PREMIUM',
      'ENTERPRISE'
    );
    
    CREATE TYPE "PaymentStatus" AS ENUM (
      'PENDING',
      'SUCCEEDED',
      'FAILED'
    );
  `.execute(db);

  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('password', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)')
    .addColumn('planType', sql`"PlanType"`, (col) => 
      col.notNull().defaultTo('FREE'))
    .addColumn('stripeCustomerId', 'varchar(255)', (col) => col.unique())
    .addColumn('createdAt', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create prompt_usage table
  await db.schema
    .createTable('prompt_usage')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('userId', 'uuid', (col) => 
      col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('prompt', 'text', (col) => col.notNull())
    .addColumn('response', 'text', (col) => col.notNull())
    .addColumn('tokens', 'integer', (col) => col.notNull())
    .addColumn('usedAt', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create projects table
  await db.schema
    .createTable('projects')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('userId', 'uuid', (col) => 
      col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('files', 'jsonb', (col) => col.notNull().defaultTo('{}'))
    .addColumn('createdAt', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create payments table
  await db.schema
    .createTable('payments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('userId', 'uuid', (col) => 
      col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('stripePaymentId', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('amount', 'integer', (col) => col.notNull())
    .addColumn('currency', 'varchar(3)', (col) => col.notNull())
    .addColumn('status', sql`"PaymentStatus"`, (col) => col.notNull())
    .addColumn('planType', sql`"PlanType"`, (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) => 
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create indexes
  await db.schema
    .createIndex('prompt_usage_user_id_index')
    .on('prompt_usage')
    .column('userId')
    .execute();

  await db.schema
    .createIndex('projects_user_id_index')
    .on('projects')
    .column('userId')
    .execute();

  await db.schema
    .createIndex('payments_user_id_index')
    .on('payments')
    .column('userId')
    .execute();

  // Create updated_at trigger function
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `.execute(db);

  // Add updated_at triggers
  await sql`
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
  // Drop triggers
  await sql`
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
  `.execute(db);

  // Drop function
  await sql`
    DROP FUNCTION IF EXISTS update_updated_at_column;
  `.execute(db);

  // Drop tables
  await db.schema.dropTable('payments').execute();
  await db.schema.dropTable('prompt_usage').execute();
  await db.schema.dropTable('projects').execute();
  await db.schema.dropTable('users').execute();

  // Drop enum types
  await sql`
    DROP TYPE IF EXISTS "PaymentStatus";
    DROP TYPE IF EXISTS "PlanType";
  `.execute(db);
}