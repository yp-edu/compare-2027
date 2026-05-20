import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sources_submission_status" AS ENUM('internal', 'submitted', 'accepted', 'rejected');
  CREATE TYPE "public"."enum_sources_processing_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'skipped');
  CREATE TYPE "public"."enum__sources_v_version_submission_status" AS ENUM('internal', 'submitted', 'accepted', 'rejected');
  CREATE TYPE "public"."enum__sources_v_version_processing_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'skipped');
  CREATE TYPE "public"."enum_candidate_submissions_status" AS ENUM('pending', 'accepted', 'rejected', 'duplicate');
  CREATE TYPE "public"."enum_claim_feedback_status" AS ENUM('pending', 'accepted', 'rejected', 'duplicate');
  ALTER TYPE "public"."enum_sources_type" ADD VALUE 'candidacy_declaration' BEFORE 'vote';
  ALTER TYPE "public"."enum_sources_type" ADD VALUE 'social_post' BEFORE 'vote';
  ALTER TYPE "public"."enum__sources_v_version_type" ADD VALUE 'candidacy_declaration' BEFORE 'vote';
  ALTER TYPE "public"."enum__sources_v_version_type" ADD VALUE 'social_post' BEFORE 'vote';
  CREATE TABLE "sources_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer
  );
  
  CREATE TABLE "_sources_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer
  );
  
  CREATE TABLE "candidate_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"candidate_name" varchar NOT NULL,
  	"candidate_details" varchar,
  	"matched_candidate_id" integer,
  	"declaration_source_id" integer NOT NULL,
  	"submitted_by_id" integer NOT NULL,
  	"status" "enum_candidate_submissions_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "claim_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"claim_id" integer NOT NULL,
  	"invalidating_source_url" varchar NOT NULL,
  	"invalidating_source_id" integer,
  	"submitted_by_id" integer NOT NULL,
  	"message_id" varchar,
  	"question" varchar,
  	"answer" varchar,
  	"comment" varchar,
  	"status" "enum_claim_feedback_status" DEFAULT 'pending' NOT NULL,
  	"review_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "sources" ADD COLUMN "submitted_by_id" integer;
  ALTER TABLE "sources" ADD COLUMN "submission_status" "enum_sources_submission_status" DEFAULT 'internal';
  ALTER TABLE "sources" ADD COLUMN "processing_status" "enum_sources_processing_status" DEFAULT 'queued';
  ALTER TABLE "sources" ADD COLUMN "processed_at" timestamp(3) with time zone;
  ALTER TABLE "sources" ADD COLUMN "processing_error" varchar;
  ALTER TABLE "sources" ADD COLUMN "llm_model" varchar;
  ALTER TABLE "_sources_v" ADD COLUMN "version_submitted_by_id" integer;
  ALTER TABLE "_sources_v" ADD COLUMN "version_submission_status" "enum__sources_v_version_submission_status" DEFAULT 'internal';
  ALTER TABLE "_sources_v" ADD COLUMN "version_processing_status" "enum__sources_v_version_processing_status" DEFAULT 'queued';
  ALTER TABLE "_sources_v" ADD COLUMN "version_processed_at" timestamp(3) with time zone;
  ALTER TABLE "_sources_v" ADD COLUMN "version_processing_error" varchar;
  ALTER TABLE "_sources_v" ADD COLUMN "version_llm_model" varchar;
  ALTER TABLE "candidates" ADD COLUMN "declaration_source_id" integer;
  ALTER TABLE "candidates" ADD COLUMN "declared_at" timestamp(3) with time zone;
  ALTER TABLE "_candidates_v" ADD COLUMN "version_declaration_source_id" integer;
  ALTER TABLE "_candidates_v" ADD COLUMN "version_declared_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "candidate_submissions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "claim_feedback_id" integer;
  ALTER TABLE "sources_rels" ADD CONSTRAINT "sources_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_rels" ADD CONSTRAINT "sources_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sources_v_rels" ADD CONSTRAINT "_sources_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_sources_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_sources_v_rels" ADD CONSTRAINT "_sources_v_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidate_submissions" ADD CONSTRAINT "candidate_submissions_matched_candidate_id_candidates_id_fk" FOREIGN KEY ("matched_candidate_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidate_submissions" ADD CONSTRAINT "candidate_submissions_declaration_source_id_sources_id_fk" FOREIGN KEY ("declaration_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidate_submissions" ADD CONSTRAINT "candidate_submissions_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_feedback" ADD CONSTRAINT "claim_feedback_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_feedback" ADD CONSTRAINT "claim_feedback_invalidating_source_id_sources_id_fk" FOREIGN KEY ("invalidating_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_feedback" ADD CONSTRAINT "claim_feedback_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sources_rels_order_idx" ON "sources_rels" USING btree ("order");
  CREATE INDEX "sources_rels_parent_idx" ON "sources_rels" USING btree ("parent_id");
  CREATE INDEX "sources_rels_path_idx" ON "sources_rels" USING btree ("path");
  CREATE INDEX "sources_rels_candidates_id_idx" ON "sources_rels" USING btree ("candidates_id");
  CREATE INDEX "_sources_v_rels_order_idx" ON "_sources_v_rels" USING btree ("order");
  CREATE INDEX "_sources_v_rels_parent_idx" ON "_sources_v_rels" USING btree ("parent_id");
  CREATE INDEX "_sources_v_rels_path_idx" ON "_sources_v_rels" USING btree ("path");
  CREATE INDEX "_sources_v_rels_candidates_id_idx" ON "_sources_v_rels" USING btree ("candidates_id");
  CREATE INDEX "candidate_submissions_matched_candidate_idx" ON "candidate_submissions" USING btree ("matched_candidate_id");
  CREATE INDEX "candidate_submissions_declaration_source_idx" ON "candidate_submissions" USING btree ("declaration_source_id");
  CREATE INDEX "candidate_submissions_submitted_by_idx" ON "candidate_submissions" USING btree ("submitted_by_id");
  CREATE INDEX "candidate_submissions_status_idx" ON "candidate_submissions" USING btree ("status");
  CREATE INDEX "candidate_submissions_updated_at_idx" ON "candidate_submissions" USING btree ("updated_at");
  CREATE INDEX "candidate_submissions_created_at_idx" ON "candidate_submissions" USING btree ("created_at");
  CREATE INDEX "claim_feedback_claim_idx" ON "claim_feedback" USING btree ("claim_id");
  CREATE INDEX "claim_feedback_invalidating_source_idx" ON "claim_feedback" USING btree ("invalidating_source_id");
  CREATE INDEX "claim_feedback_submitted_by_idx" ON "claim_feedback" USING btree ("submitted_by_id");
  CREATE INDEX "claim_feedback_message_id_idx" ON "claim_feedback" USING btree ("message_id");
  CREATE INDEX "claim_feedback_status_idx" ON "claim_feedback" USING btree ("status");
  CREATE INDEX "claim_feedback_updated_at_idx" ON "claim_feedback" USING btree ("updated_at");
  CREATE INDEX "claim_feedback_created_at_idx" ON "claim_feedback" USING btree ("created_at");
  ALTER TABLE "sources" ADD CONSTRAINT "sources_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sources_v" ADD CONSTRAINT "_sources_v_version_submitted_by_id_users_id_fk" FOREIGN KEY ("version_submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidates" ADD CONSTRAINT "candidates_declaration_source_id_sources_id_fk" FOREIGN KEY ("declaration_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_candidates_v" ADD CONSTRAINT "_candidates_v_version_declaration_source_id_sources_id_fk" FOREIGN KEY ("version_declaration_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_candidate_submissions_fk" FOREIGN KEY ("candidate_submissions_id") REFERENCES "public"."candidate_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claim_feedback_fk" FOREIGN KEY ("claim_feedback_id") REFERENCES "public"."claim_feedback"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sources_submitted_by_idx" ON "sources" USING btree ("submitted_by_id");
  CREATE INDEX "sources_submission_status_idx" ON "sources" USING btree ("submission_status");
  CREATE INDEX "sources_processing_status_idx" ON "sources" USING btree ("processing_status");
  CREATE INDEX "_sources_v_version_version_submitted_by_idx" ON "_sources_v" USING btree ("version_submitted_by_id");
  CREATE INDEX "_sources_v_version_version_submission_status_idx" ON "_sources_v" USING btree ("version_submission_status");
  CREATE INDEX "_sources_v_version_version_processing_status_idx" ON "_sources_v" USING btree ("version_processing_status");
  CREATE INDEX "candidates_declaration_source_idx" ON "candidates" USING btree ("declaration_source_id");
  CREATE INDEX "candidates_declared_at_idx" ON "candidates" USING btree ("declared_at");
  CREATE INDEX "_candidates_v_version_version_declaration_source_idx" ON "_candidates_v" USING btree ("version_declaration_source_id");
  CREATE INDEX "_candidates_v_version_version_declared_at_idx" ON "_candidates_v" USING btree ("version_declared_at");
  CREATE INDEX "payload_locked_documents_rels_candidate_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("candidate_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_claim_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("claim_feedback_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sources_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_sources_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "candidate_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "claim_feedback" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sources_rels" CASCADE;
  DROP TABLE "_sources_v_rels" CASCADE;
  DROP TABLE "candidate_submissions" CASCADE;
  DROP TABLE "claim_feedback" CASCADE;
  ALTER TABLE "sources" DROP CONSTRAINT "sources_submitted_by_id_users_id_fk";
  
  ALTER TABLE "_sources_v" DROP CONSTRAINT "_sources_v_version_submitted_by_id_users_id_fk";
  
  ALTER TABLE "candidates" DROP CONSTRAINT "candidates_declaration_source_id_sources_id_fk";
  
  ALTER TABLE "_candidates_v" DROP CONSTRAINT "_candidates_v_version_declaration_source_id_sources_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_candidate_submissions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_claim_feedback_fk";
  
  ALTER TABLE "sources" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "sources" ALTER COLUMN "type" SET DEFAULT 'other'::text;
  DROP TYPE "public"."enum_sources_type";
  CREATE TYPE "public"."enum_sources_type" AS ENUM('official_program', 'speech', 'interview', 'press_release', 'vote', 'article', 'report', 'other');
  ALTER TABLE "sources" ALTER COLUMN "type" SET DEFAULT 'other'::"public"."enum_sources_type";
  ALTER TABLE "sources" ALTER COLUMN "type" SET DATA TYPE "public"."enum_sources_type" USING "type"::"public"."enum_sources_type";
  ALTER TABLE "_sources_v" ALTER COLUMN "version_type" SET DATA TYPE text;
  ALTER TABLE "_sources_v" ALTER COLUMN "version_type" SET DEFAULT 'other'::text;
  DROP TYPE "public"."enum__sources_v_version_type";
  CREATE TYPE "public"."enum__sources_v_version_type" AS ENUM('official_program', 'speech', 'interview', 'press_release', 'vote', 'article', 'report', 'other');
  ALTER TABLE "_sources_v" ALTER COLUMN "version_type" SET DEFAULT 'other'::"public"."enum__sources_v_version_type";
  ALTER TABLE "_sources_v" ALTER COLUMN "version_type" SET DATA TYPE "public"."enum__sources_v_version_type" USING "version_type"::"public"."enum__sources_v_version_type";
  DROP INDEX "sources_submitted_by_idx";
  DROP INDEX "sources_submission_status_idx";
  DROP INDEX "sources_processing_status_idx";
  DROP INDEX "_sources_v_version_version_submitted_by_idx";
  DROP INDEX "_sources_v_version_version_submission_status_idx";
  DROP INDEX "_sources_v_version_version_processing_status_idx";
  DROP INDEX "candidates_declaration_source_idx";
  DROP INDEX "candidates_declared_at_idx";
  DROP INDEX "_candidates_v_version_version_declaration_source_idx";
  DROP INDEX "_candidates_v_version_version_declared_at_idx";
  DROP INDEX "payload_locked_documents_rels_candidate_submissions_id_idx";
  DROP INDEX "payload_locked_documents_rels_claim_feedback_id_idx";
  ALTER TABLE "sources" DROP COLUMN "submitted_by_id";
  ALTER TABLE "sources" DROP COLUMN "submission_status";
  ALTER TABLE "sources" DROP COLUMN "processing_status";
  ALTER TABLE "sources" DROP COLUMN "processed_at";
  ALTER TABLE "sources" DROP COLUMN "processing_error";
  ALTER TABLE "sources" DROP COLUMN "llm_model";
  ALTER TABLE "_sources_v" DROP COLUMN "version_submitted_by_id";
  ALTER TABLE "_sources_v" DROP COLUMN "version_submission_status";
  ALTER TABLE "_sources_v" DROP COLUMN "version_processing_status";
  ALTER TABLE "_sources_v" DROP COLUMN "version_processed_at";
  ALTER TABLE "_sources_v" DROP COLUMN "version_processing_error";
  ALTER TABLE "_sources_v" DROP COLUMN "version_llm_model";
  ALTER TABLE "candidates" DROP COLUMN "declaration_source_id";
  ALTER TABLE "candidates" DROP COLUMN "declared_at";
  ALTER TABLE "_candidates_v" DROP COLUMN "version_declaration_source_id";
  ALTER TABLE "_candidates_v" DROP COLUMN "version_declared_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "candidate_submissions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "claim_feedback_id";
  DROP TYPE "public"."enum_sources_submission_status";
  DROP TYPE "public"."enum_sources_processing_status";
  DROP TYPE "public"."enum__sources_v_version_submission_status";
  DROP TYPE "public"."enum__sources_v_version_processing_status";
  DROP TYPE "public"."enum_candidate_submissions_status";
  DROP TYPE "public"."enum_claim_feedback_status";`)
}
