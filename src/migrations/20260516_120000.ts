import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "legal_consent_accepted_at" varchar;
   ALTER TABLE "users" ADD COLUMN "legal_consent_version" varchar;
   ALTER TABLE "users" ADD COLUMN "legal_consent_ip_hash" varchar;
   ALTER TABLE "users" ADD COLUMN "legal_consent_user_agent" varchar;
   ALTER TABLE "users" ADD COLUMN "legal_consent_provider_ids" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "legal_consent_accepted_at";
   ALTER TABLE "users" DROP COLUMN "legal_consent_version";
   ALTER TABLE "users" DROP COLUMN "legal_consent_ip_hash";
   ALTER TABLE "users" DROP COLUMN "legal_consent_user_agent";
   ALTER TABLE "users" DROP COLUMN "legal_consent_provider_ids";
  `)
}
