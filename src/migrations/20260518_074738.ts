import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sources_platform" AS ENUM('party_site', 'x', 'assemblee', 'datan', 'press', 'institution', 'other');
  CREATE TYPE "public"."enum_sources_fetch_status" AS ENUM('not_fetched', 'fetched', 'failed', 'skipped');
  CREATE TYPE "public"."enum__sources_v_version_platform" AS ENUM('party_site', 'x', 'assemblee', 'datan', 'press', 'institution', 'other');
  CREATE TYPE "public"."enum__sources_v_version_fetch_status" AS ENUM('not_fetched', 'fetched', 'failed', 'skipped');
  CREATE TYPE "public"."enum_source_snapshots_fetch_status" AS ENUM('fetched', 'failed', 'skipped');
  CREATE TYPE "public"."enum_source_documents_parser" AS ENUM('manual', 'html', 'pdf', 'social_post', 'vote_import', 'other');
  CREATE TYPE "public"."enum_source_documents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__source_documents_v_version_parser" AS ENUM('manual', 'html', 'pdf', 'social_post', 'vote_import', 'other');
  CREATE TYPE "public"."enum__source_documents_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_document_chunks_embedding_status" AS ENUM('pending', 'embedded', 'failed', 'skipped');
  CREATE TYPE "public"."enum_document_chunks_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__document_chunks_v_version_embedding_status" AS ENUM('pending', 'embedded', 'failed', 'skipped');
  CREATE TYPE "public"."enum__document_chunks_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_ingestion_jobs_job_type" AS ENUM('url', 'document', 'social_post', 'vote_import', 'scheduled_crawl');
  CREATE TYPE "public"."enum_ingestion_jobs_status" AS ENUM('queued', 'running', 'completed', 'failed', 'cancelled');
  CREATE TYPE "public"."enum_claims_claim_type" AS ENUM('program', 'public_position', 'vote', 'promise', 'factual_record', 'biography', 'criticism', 'other');
  CREATE TYPE "public"."enum_claims_stance" AS ENUM('proposes', 'supports', 'opposes', 'mixed', 'vote_for', 'vote_against', 'abstention', 'unclear', 'not_applicable');
  CREATE TYPE "public"."enum_claims_review_status" AS ENUM('pending', 'reviewed', 'rejected', 'disputed');
  CREATE TYPE "public"."enum_claims_extraction_method" AS ENUM('manual', 'llm', 'crawler', 'import', 'api');
  CREATE TYPE "public"."enum_claims_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__claims_v_version_claim_type" AS ENUM('program', 'public_position', 'vote', 'promise', 'factual_record', 'biography', 'criticism', 'other');
  CREATE TYPE "public"."enum__claims_v_version_stance" AS ENUM('proposes', 'supports', 'opposes', 'mixed', 'vote_for', 'vote_against', 'abstention', 'unclear', 'not_applicable');
  CREATE TYPE "public"."enum__claims_v_version_review_status" AS ENUM('pending', 'reviewed', 'rejected', 'disputed');
  CREATE TYPE "public"."enum__claims_v_version_extraction_method" AS ENUM('manual', 'llm', 'crawler', 'import', 'api');
  CREATE TYPE "public"."enum__claims_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_claim_evidence_review_status" AS ENUM('pending', 'reviewed', 'rejected', 'disputed');
  CREATE TYPE "public"."enum_claim_evidence_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__claim_evidence_v_version_review_status" AS ENUM('pending', 'reviewed', 'rejected', 'disputed');
  CREATE TYPE "public"."enum__claim_evidence_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "source_snapshots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source_id" integer NOT NULL,
  	"url" varchar NOT NULL,
  	"canonical_url" varchar,
  	"external_id" varchar,
  	"content_hash" varchar,
  	"fetch_status" "enum_source_snapshots_fetch_status" DEFAULT 'fetched' NOT NULL,
  	"http_status" numeric,
  	"content_type" varchar,
  	"fetched_at" timestamp(3) with time zone NOT NULL,
  	"raw_content" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "source_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"source_id" integer,
  	"snapshot_id" integer,
  	"parser" "enum_source_documents_parser" DEFAULT 'manual',
  	"language" varchar DEFAULT 'fr',
  	"content" varchar,
  	"summary" varchar,
  	"word_count" numeric,
  	"parsed_at" timestamp(3) with time zone,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_source_documents_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_source_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_source_id" integer,
  	"version_snapshot_id" integer,
  	"version_parser" "enum__source_documents_v_version_parser" DEFAULT 'manual',
  	"version_language" varchar DEFAULT 'fr',
  	"version_content" varchar,
  	"version_summary" varchar,
  	"version_word_count" numeric,
  	"version_parsed_at" timestamp(3) with time zone,
  	"version_metadata" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__source_documents_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "document_chunks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"document_id" integer,
  	"source_id" integer,
  	"snapshot_id" integer,
  	"chunk_index" numeric,
  	"text" varchar,
  	"section_title" varchar,
  	"page_number" numeric,
  	"char_start" numeric,
  	"char_end" numeric,
  	"token_count" numeric,
  	"embedding_status" "enum_document_chunks_embedding_status" DEFAULT 'pending',
  	"embedding_model" varchar,
  	"embedding" jsonb,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_document_chunks_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_document_chunks_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_document_id" integer,
  	"version_source_id" integer,
  	"version_snapshot_id" integer,
  	"version_chunk_index" numeric,
  	"version_text" varchar,
  	"version_section_title" varchar,
  	"version_page_number" numeric,
  	"version_char_start" numeric,
  	"version_char_end" numeric,
  	"version_token_count" numeric,
  	"version_embedding_status" "enum__document_chunks_v_version_embedding_status" DEFAULT 'pending',
  	"version_embedding_model" varchar,
  	"version_embedding" jsonb,
  	"version_metadata" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__document_chunks_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "ingestion_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"job_type" "enum_ingestion_jobs_job_type" DEFAULT 'url' NOT NULL,
  	"status" "enum_ingestion_jobs_status" DEFAULT 'queued' NOT NULL,
  	"input_url" varchar NOT NULL,
  	"source_id" integer,
  	"submitted_by_id" integer,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"priority" numeric DEFAULT 0 NOT NULL,
  	"last_run_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"error_message" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "claims" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"claim_text" varchar,
  	"primary_source_id" integer,
  	"source_snapshot_id" integer,
  	"source_document_id" integer,
  	"claim_type" "enum_claims_claim_type" DEFAULT 'other',
  	"stance" "enum_claims_stance" DEFAULT 'unclear',
  	"evidence_quote" varchar,
  	"position_date" timestamp(3) with time zone,
  	"valid_from" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"retrieved_at" timestamp(3) with time zone,
  	"review_status" "enum_claims_review_status" DEFAULT 'pending',
  	"confidence" numeric,
  	"extraction_method" "enum_claims_extraction_method" DEFAULT 'manual',
  	"last_verified_at" timestamp(3) with time zone,
  	"raw_extraction" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_claims_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "claims_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "_claims_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_claim_text" varchar,
  	"version_primary_source_id" integer,
  	"version_source_snapshot_id" integer,
  	"version_source_document_id" integer,
  	"version_claim_type" "enum__claims_v_version_claim_type" DEFAULT 'other',
  	"version_stance" "enum__claims_v_version_stance" DEFAULT 'unclear',
  	"version_evidence_quote" varchar,
  	"version_position_date" timestamp(3) with time zone,
  	"version_valid_from" timestamp(3) with time zone,
  	"version_valid_until" timestamp(3) with time zone,
  	"version_retrieved_at" timestamp(3) with time zone,
  	"version_review_status" "enum__claims_v_version_review_status" DEFAULT 'pending',
  	"version_confidence" numeric,
  	"version_extraction_method" "enum__claims_v_version_extraction_method" DEFAULT 'manual',
  	"version_last_verified_at" timestamp(3) with time zone,
  	"version_raw_extraction" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__claims_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_claims_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "claim_evidence" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"claim_id" integer,
  	"source_id" integer,
  	"snapshot_id" integer,
  	"document_id" integer,
  	"chunk_id" integer,
  	"quote" varchar,
  	"source_url" varchar,
  	"section_title" varchar,
  	"page_number" numeric,
  	"char_start" numeric,
  	"char_end" numeric,
  	"confidence" numeric,
  	"review_status" "enum_claim_evidence_review_status" DEFAULT 'pending',
  	"notes" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_claim_evidence_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_claim_evidence_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_claim_id" integer,
  	"version_source_id" integer,
  	"version_snapshot_id" integer,
  	"version_document_id" integer,
  	"version_chunk_id" integer,
  	"version_quote" varchar,
  	"version_source_url" varchar,
  	"version_section_title" varchar,
  	"version_page_number" numeric,
  	"version_char_start" numeric,
  	"version_char_end" numeric,
  	"version_confidence" numeric,
  	"version_review_status" "enum__claim_evidence_v_version_review_status" DEFAULT 'pending',
  	"version_notes" varchar,
  	"version_metadata" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__claim_evidence_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"candidates_find" boolean DEFAULT false,
  	"claim_evidence_find" boolean DEFAULT false,
  	"claims_find" boolean DEFAULT false,
  	"document_chunks_find" boolean DEFAULT false,
  	"parties_find" boolean DEFAULT false,
  	"programs_find" boolean DEFAULT false,
  	"proposals_find" boolean DEFAULT false,
  	"public_positions_find" boolean DEFAULT false,
  	"source_documents_find" boolean DEFAULT false,
  	"sources_find" boolean DEFAULT false,
  	"topics_find" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  ALTER TABLE "users" ADD COLUMN "legal_consent_accepted_at" varchar;
  ALTER TABLE "users" ADD COLUMN "legal_consent_version" varchar;
  ALTER TABLE "users" ADD COLUMN "legal_consent_ip_hash" varchar;
  ALTER TABLE "users" ADD COLUMN "legal_consent_user_agent" varchar;
  ALTER TABLE "users" ADD COLUMN "legal_consent_provider_ids" varchar;
  ALTER TABLE "sources" ADD COLUMN "platform" "enum_sources_platform" DEFAULT 'other';
  ALTER TABLE "sources" ADD COLUMN "canonical_url" varchar;
  ALTER TABLE "sources" ADD COLUMN "external_id" varchar;
  ALTER TABLE "sources" ADD COLUMN "last_fetched_at" timestamp(3) with time zone;
  ALTER TABLE "sources" ADD COLUMN "content_hash" varchar;
  ALTER TABLE "sources" ADD COLUMN "fetch_status" "enum_sources_fetch_status" DEFAULT 'not_fetched';
  ALTER TABLE "sources" ADD COLUMN "fetch_error" varchar;
  ALTER TABLE "sources" ADD COLUMN "raw_metadata" jsonb;
  ALTER TABLE "_sources_v" ADD COLUMN "version_platform" "enum__sources_v_version_platform" DEFAULT 'other';
  ALTER TABLE "_sources_v" ADD COLUMN "version_canonical_url" varchar;
  ALTER TABLE "_sources_v" ADD COLUMN "version_external_id" varchar;
  ALTER TABLE "_sources_v" ADD COLUMN "version_last_fetched_at" timestamp(3) with time zone;
  ALTER TABLE "_sources_v" ADD COLUMN "version_content_hash" varchar;
  ALTER TABLE "_sources_v" ADD COLUMN "version_fetch_status" "enum__sources_v_version_fetch_status" DEFAULT 'not_fetched';
  ALTER TABLE "_sources_v" ADD COLUMN "version_fetch_error" varchar;
  ALTER TABLE "_sources_v" ADD COLUMN "version_raw_metadata" jsonb;
  ALTER TABLE "search_rels" ADD COLUMN "source_documents_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "document_chunks_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "claims_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "claim_evidence_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "source_snapshots_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "source_documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "document_chunks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ingestion_jobs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "claims_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "claim_evidence_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_source_documents_v" ADD CONSTRAINT "_source_documents_v_parent_id_source_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_source_documents_v" ADD CONSTRAINT "_source_documents_v_version_source_id_sources_id_fk" FOREIGN KEY ("version_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_source_documents_v" ADD CONSTRAINT "_source_documents_v_version_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("version_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_source_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_document_chunks_v" ADD CONSTRAINT "_document_chunks_v_parent_id_document_chunks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."document_chunks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_document_chunks_v" ADD CONSTRAINT "_document_chunks_v_version_document_id_source_documents_id_fk" FOREIGN KEY ("version_document_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_document_chunks_v" ADD CONSTRAINT "_document_chunks_v_version_source_id_sources_id_fk" FOREIGN KEY ("version_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_document_chunks_v" ADD CONSTRAINT "_document_chunks_v_version_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("version_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_primary_source_id_sources_id_fk" FOREIGN KEY ("primary_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims" ADD CONSTRAINT "claims_source_document_id_source_documents_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claims_rels" ADD CONSTRAINT "claims_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_claims_v" ADD CONSTRAINT "_claims_v_parent_id_claims_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."claims"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claims_v" ADD CONSTRAINT "_claims_v_version_primary_source_id_sources_id_fk" FOREIGN KEY ("version_primary_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claims_v" ADD CONSTRAINT "_claims_v_version_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("version_source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claims_v" ADD CONSTRAINT "_claims_v_version_source_document_id_source_documents_id_fk" FOREIGN KEY ("version_source_document_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claims_v_rels" ADD CONSTRAINT "_claims_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_claims_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_claims_v_rels" ADD CONSTRAINT "_claims_v_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_claims_v_rels" ADD CONSTRAINT "_claims_v_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_claims_v_rels" ADD CONSTRAINT "_claims_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_document_id_source_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_chunk_id_document_chunks_id_fk" FOREIGN KEY ("chunk_id") REFERENCES "public"."document_chunks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claim_evidence_v" ADD CONSTRAINT "_claim_evidence_v_parent_id_claim_evidence_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."claim_evidence"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claim_evidence_v" ADD CONSTRAINT "_claim_evidence_v_version_claim_id_claims_id_fk" FOREIGN KEY ("version_claim_id") REFERENCES "public"."claims"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claim_evidence_v" ADD CONSTRAINT "_claim_evidence_v_version_source_id_sources_id_fk" FOREIGN KEY ("version_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claim_evidence_v" ADD CONSTRAINT "_claim_evidence_v_version_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("version_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claim_evidence_v" ADD CONSTRAINT "_claim_evidence_v_version_document_id_source_documents_id_fk" FOREIGN KEY ("version_document_id") REFERENCES "public"."source_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_claim_evidence_v" ADD CONSTRAINT "_claim_evidence_v_version_chunk_id_document_chunks_id_fk" FOREIGN KEY ("version_chunk_id") REFERENCES "public"."document_chunks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "source_snapshots_source_idx" ON "source_snapshots" USING btree ("source_id");
  CREATE INDEX "source_snapshots_canonical_url_idx" ON "source_snapshots" USING btree ("canonical_url");
  CREATE INDEX "source_snapshots_external_id_idx" ON "source_snapshots" USING btree ("external_id");
  CREATE INDEX "source_snapshots_content_hash_idx" ON "source_snapshots" USING btree ("content_hash");
  CREATE INDEX "source_snapshots_fetch_status_idx" ON "source_snapshots" USING btree ("fetch_status");
  CREATE INDEX "source_snapshots_fetched_at_idx" ON "source_snapshots" USING btree ("fetched_at");
  CREATE INDEX "source_snapshots_updated_at_idx" ON "source_snapshots" USING btree ("updated_at");
  CREATE INDEX "source_snapshots_created_at_idx" ON "source_snapshots" USING btree ("created_at");
  CREATE INDEX "source_documents_source_idx" ON "source_documents" USING btree ("source_id");
  CREATE INDEX "source_documents_snapshot_idx" ON "source_documents" USING btree ("snapshot_id");
  CREATE INDEX "source_documents_parsed_at_idx" ON "source_documents" USING btree ("parsed_at");
  CREATE INDEX "source_documents_updated_at_idx" ON "source_documents" USING btree ("updated_at");
  CREATE INDEX "source_documents_created_at_idx" ON "source_documents" USING btree ("created_at");
  CREATE INDEX "source_documents__status_idx" ON "source_documents" USING btree ("_status");
  CREATE INDEX "_source_documents_v_parent_idx" ON "_source_documents_v" USING btree ("parent_id");
  CREATE INDEX "_source_documents_v_version_version_source_idx" ON "_source_documents_v" USING btree ("version_source_id");
  CREATE INDEX "_source_documents_v_version_version_snapshot_idx" ON "_source_documents_v" USING btree ("version_snapshot_id");
  CREATE INDEX "_source_documents_v_version_version_parsed_at_idx" ON "_source_documents_v" USING btree ("version_parsed_at");
  CREATE INDEX "_source_documents_v_version_version_updated_at_idx" ON "_source_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_source_documents_v_version_version_created_at_idx" ON "_source_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_source_documents_v_version_version__status_idx" ON "_source_documents_v" USING btree ("version__status");
  CREATE INDEX "_source_documents_v_created_at_idx" ON "_source_documents_v" USING btree ("created_at");
  CREATE INDEX "_source_documents_v_updated_at_idx" ON "_source_documents_v" USING btree ("updated_at");
  CREATE INDEX "_source_documents_v_latest_idx" ON "_source_documents_v" USING btree ("latest");
  CREATE INDEX "document_chunks_document_idx" ON "document_chunks" USING btree ("document_id");
  CREATE INDEX "document_chunks_source_idx" ON "document_chunks" USING btree ("source_id");
  CREATE INDEX "document_chunks_snapshot_idx" ON "document_chunks" USING btree ("snapshot_id");
  CREATE INDEX "document_chunks_chunk_index_idx" ON "document_chunks" USING btree ("chunk_index");
  CREATE INDEX "document_chunks_embedding_status_idx" ON "document_chunks" USING btree ("embedding_status");
  CREATE INDEX "document_chunks_updated_at_idx" ON "document_chunks" USING btree ("updated_at");
  CREATE INDEX "document_chunks_created_at_idx" ON "document_chunks" USING btree ("created_at");
  CREATE INDEX "document_chunks__status_idx" ON "document_chunks" USING btree ("_status");
  CREATE INDEX "_document_chunks_v_parent_idx" ON "_document_chunks_v" USING btree ("parent_id");
  CREATE INDEX "_document_chunks_v_version_version_document_idx" ON "_document_chunks_v" USING btree ("version_document_id");
  CREATE INDEX "_document_chunks_v_version_version_source_idx" ON "_document_chunks_v" USING btree ("version_source_id");
  CREATE INDEX "_document_chunks_v_version_version_snapshot_idx" ON "_document_chunks_v" USING btree ("version_snapshot_id");
  CREATE INDEX "_document_chunks_v_version_version_chunk_index_idx" ON "_document_chunks_v" USING btree ("version_chunk_index");
  CREATE INDEX "_document_chunks_v_version_version_embedding_status_idx" ON "_document_chunks_v" USING btree ("version_embedding_status");
  CREATE INDEX "_document_chunks_v_version_version_updated_at_idx" ON "_document_chunks_v" USING btree ("version_updated_at");
  CREATE INDEX "_document_chunks_v_version_version_created_at_idx" ON "_document_chunks_v" USING btree ("version_created_at");
  CREATE INDEX "_document_chunks_v_version_version__status_idx" ON "_document_chunks_v" USING btree ("version__status");
  CREATE INDEX "_document_chunks_v_created_at_idx" ON "_document_chunks_v" USING btree ("created_at");
  CREATE INDEX "_document_chunks_v_updated_at_idx" ON "_document_chunks_v" USING btree ("updated_at");
  CREATE INDEX "_document_chunks_v_latest_idx" ON "_document_chunks_v" USING btree ("latest");
  CREATE INDEX "ingestion_jobs_status_idx" ON "ingestion_jobs" USING btree ("status");
  CREATE INDEX "ingestion_jobs_input_url_idx" ON "ingestion_jobs" USING btree ("input_url");
  CREATE INDEX "ingestion_jobs_source_idx" ON "ingestion_jobs" USING btree ("source_id");
  CREATE INDEX "ingestion_jobs_submitted_by_idx" ON "ingestion_jobs" USING btree ("submitted_by_id");
  CREATE INDEX "ingestion_jobs_priority_idx" ON "ingestion_jobs" USING btree ("priority");
  CREATE INDEX "ingestion_jobs_updated_at_idx" ON "ingestion_jobs" USING btree ("updated_at");
  CREATE INDEX "ingestion_jobs_created_at_idx" ON "ingestion_jobs" USING btree ("created_at");
  CREATE INDEX "claims_primary_source_idx" ON "claims" USING btree ("primary_source_id");
  CREATE INDEX "claims_source_snapshot_idx" ON "claims" USING btree ("source_snapshot_id");
  CREATE INDEX "claims_source_document_idx" ON "claims" USING btree ("source_document_id");
  CREATE INDEX "claims_claim_type_idx" ON "claims" USING btree ("claim_type");
  CREATE INDEX "claims_stance_idx" ON "claims" USING btree ("stance");
  CREATE INDEX "claims_position_date_idx" ON "claims" USING btree ("position_date");
  CREATE INDEX "claims_review_status_idx" ON "claims" USING btree ("review_status");
  CREATE INDEX "claims_updated_at_idx" ON "claims" USING btree ("updated_at");
  CREATE INDEX "claims_created_at_idx" ON "claims" USING btree ("created_at");
  CREATE INDEX "claims__status_idx" ON "claims" USING btree ("_status");
  CREATE INDEX "claims_rels_order_idx" ON "claims_rels" USING btree ("order");
  CREATE INDEX "claims_rels_parent_idx" ON "claims_rels" USING btree ("parent_id");
  CREATE INDEX "claims_rels_path_idx" ON "claims_rels" USING btree ("path");
  CREATE INDEX "claims_rels_candidates_id_idx" ON "claims_rels" USING btree ("candidates_id");
  CREATE INDEX "claims_rels_parties_id_idx" ON "claims_rels" USING btree ("parties_id");
  CREATE INDEX "claims_rels_topics_id_idx" ON "claims_rels" USING btree ("topics_id");
  CREATE INDEX "_claims_v_parent_idx" ON "_claims_v" USING btree ("parent_id");
  CREATE INDEX "_claims_v_version_version_primary_source_idx" ON "_claims_v" USING btree ("version_primary_source_id");
  CREATE INDEX "_claims_v_version_version_source_snapshot_idx" ON "_claims_v" USING btree ("version_source_snapshot_id");
  CREATE INDEX "_claims_v_version_version_source_document_idx" ON "_claims_v" USING btree ("version_source_document_id");
  CREATE INDEX "_claims_v_version_version_claim_type_idx" ON "_claims_v" USING btree ("version_claim_type");
  CREATE INDEX "_claims_v_version_version_stance_idx" ON "_claims_v" USING btree ("version_stance");
  CREATE INDEX "_claims_v_version_version_position_date_idx" ON "_claims_v" USING btree ("version_position_date");
  CREATE INDEX "_claims_v_version_version_review_status_idx" ON "_claims_v" USING btree ("version_review_status");
  CREATE INDEX "_claims_v_version_version_updated_at_idx" ON "_claims_v" USING btree ("version_updated_at");
  CREATE INDEX "_claims_v_version_version_created_at_idx" ON "_claims_v" USING btree ("version_created_at");
  CREATE INDEX "_claims_v_version_version__status_idx" ON "_claims_v" USING btree ("version__status");
  CREATE INDEX "_claims_v_created_at_idx" ON "_claims_v" USING btree ("created_at");
  CREATE INDEX "_claims_v_updated_at_idx" ON "_claims_v" USING btree ("updated_at");
  CREATE INDEX "_claims_v_latest_idx" ON "_claims_v" USING btree ("latest");
  CREATE INDEX "_claims_v_rels_order_idx" ON "_claims_v_rels" USING btree ("order");
  CREATE INDEX "_claims_v_rels_parent_idx" ON "_claims_v_rels" USING btree ("parent_id");
  CREATE INDEX "_claims_v_rels_path_idx" ON "_claims_v_rels" USING btree ("path");
  CREATE INDEX "_claims_v_rels_candidates_id_idx" ON "_claims_v_rels" USING btree ("candidates_id");
  CREATE INDEX "_claims_v_rels_parties_id_idx" ON "_claims_v_rels" USING btree ("parties_id");
  CREATE INDEX "_claims_v_rels_topics_id_idx" ON "_claims_v_rels" USING btree ("topics_id");
  CREATE INDEX "claim_evidence_claim_idx" ON "claim_evidence" USING btree ("claim_id");
  CREATE INDEX "claim_evidence_source_idx" ON "claim_evidence" USING btree ("source_id");
  CREATE INDEX "claim_evidence_snapshot_idx" ON "claim_evidence" USING btree ("snapshot_id");
  CREATE INDEX "claim_evidence_document_idx" ON "claim_evidence" USING btree ("document_id");
  CREATE INDEX "claim_evidence_chunk_idx" ON "claim_evidence" USING btree ("chunk_id");
  CREATE INDEX "claim_evidence_review_status_idx" ON "claim_evidence" USING btree ("review_status");
  CREATE INDEX "claim_evidence_updated_at_idx" ON "claim_evidence" USING btree ("updated_at");
  CREATE INDEX "claim_evidence_created_at_idx" ON "claim_evidence" USING btree ("created_at");
  CREATE INDEX "claim_evidence__status_idx" ON "claim_evidence" USING btree ("_status");
  CREATE INDEX "_claim_evidence_v_parent_idx" ON "_claim_evidence_v" USING btree ("parent_id");
  CREATE INDEX "_claim_evidence_v_version_version_claim_idx" ON "_claim_evidence_v" USING btree ("version_claim_id");
  CREATE INDEX "_claim_evidence_v_version_version_source_idx" ON "_claim_evidence_v" USING btree ("version_source_id");
  CREATE INDEX "_claim_evidence_v_version_version_snapshot_idx" ON "_claim_evidence_v" USING btree ("version_snapshot_id");
  CREATE INDEX "_claim_evidence_v_version_version_document_idx" ON "_claim_evidence_v" USING btree ("version_document_id");
  CREATE INDEX "_claim_evidence_v_version_version_chunk_idx" ON "_claim_evidence_v" USING btree ("version_chunk_id");
  CREATE INDEX "_claim_evidence_v_version_version_review_status_idx" ON "_claim_evidence_v" USING btree ("version_review_status");
  CREATE INDEX "_claim_evidence_v_version_version_updated_at_idx" ON "_claim_evidence_v" USING btree ("version_updated_at");
  CREATE INDEX "_claim_evidence_v_version_version_created_at_idx" ON "_claim_evidence_v" USING btree ("version_created_at");
  CREATE INDEX "_claim_evidence_v_version_version__status_idx" ON "_claim_evidence_v" USING btree ("version__status");
  CREATE INDEX "_claim_evidence_v_created_at_idx" ON "_claim_evidence_v" USING btree ("created_at");
  CREATE INDEX "_claim_evidence_v_updated_at_idx" ON "_claim_evidence_v" USING btree ("updated_at");
  CREATE INDEX "_claim_evidence_v_latest_idx" ON "_claim_evidence_v" USING btree ("latest");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_source_documents_fk" FOREIGN KEY ("source_documents_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_document_chunks_fk" FOREIGN KEY ("document_chunks_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_claim_evidence_fk" FOREIGN KEY ("claim_evidence_id") REFERENCES "public"."claim_evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_source_snapshots_fk" FOREIGN KEY ("source_snapshots_id") REFERENCES "public"."source_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_source_documents_fk" FOREIGN KEY ("source_documents_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_chunks_fk" FOREIGN KEY ("document_chunks_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingestion_jobs_fk" FOREIGN KEY ("ingestion_jobs_id") REFERENCES "public"."ingestion_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claim_evidence_fk" FOREIGN KEY ("claim_evidence_id") REFERENCES "public"."claim_evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sources_url_idx" ON "sources" USING btree ("url");
  CREATE INDEX "sources_canonical_url_idx" ON "sources" USING btree ("canonical_url");
  CREATE INDEX "sources_external_id_idx" ON "sources" USING btree ("external_id");
  CREATE INDEX "sources_content_hash_idx" ON "sources" USING btree ("content_hash");
  CREATE INDEX "_sources_v_version_version_url_idx" ON "_sources_v" USING btree ("version_url");
  CREATE INDEX "_sources_v_version_version_canonical_url_idx" ON "_sources_v" USING btree ("version_canonical_url");
  CREATE INDEX "_sources_v_version_version_external_id_idx" ON "_sources_v" USING btree ("version_external_id");
  CREATE INDEX "_sources_v_version_version_content_hash_idx" ON "_sources_v" USING btree ("version_content_hash");
  CREATE INDEX "search_rels_source_documents_id_idx" ON "search_rels" USING btree ("source_documents_id");
  CREATE INDEX "search_rels_document_chunks_id_idx" ON "search_rels" USING btree ("document_chunks_id");
  CREATE INDEX "search_rels_claims_id_idx" ON "search_rels" USING btree ("claims_id");
  CREATE INDEX "search_rels_claim_evidence_id_idx" ON "search_rels" USING btree ("claim_evidence_id");
  CREATE INDEX "payload_locked_documents_rels_source_snapshots_id_idx" ON "payload_locked_documents_rels" USING btree ("source_snapshots_id");
  CREATE INDEX "payload_locked_documents_rels_source_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("source_documents_id");
  CREATE INDEX "payload_locked_documents_rels_document_chunks_id_idx" ON "payload_locked_documents_rels" USING btree ("document_chunks_id");
  CREATE INDEX "payload_locked_documents_rels_ingestion_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("ingestion_jobs_id");
  CREATE INDEX "payload_locked_documents_rels_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("claims_id");
  CREATE INDEX "payload_locked_documents_rels_claim_evidence_id_idx" ON "payload_locked_documents_rels" USING btree ("claim_evidence_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "source_snapshots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "source_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_source_documents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "document_chunks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_document_chunks_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ingestion_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "claims" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "claims_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_claims_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_claims_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "claim_evidence" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_claim_evidence_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_mcp_api_keys" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "source_snapshots" CASCADE;
  DROP TABLE "source_documents" CASCADE;
  DROP TABLE "_source_documents_v" CASCADE;
  DROP TABLE "document_chunks" CASCADE;
  DROP TABLE "_document_chunks_v" CASCADE;
  DROP TABLE "ingestion_jobs" CASCADE;
  DROP TABLE "claims" CASCADE;
  DROP TABLE "claims_rels" CASCADE;
  DROP TABLE "_claims_v" CASCADE;
  DROP TABLE "_claims_v_rels" CASCADE;
  DROP TABLE "claim_evidence" CASCADE;
  DROP TABLE "_claim_evidence_v" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_source_documents_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_document_chunks_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_claims_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_claim_evidence_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_source_snapshots_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_source_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_document_chunks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ingestion_jobs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_claims_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_claim_evidence_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";
  
  DROP INDEX "sources_url_idx";
  DROP INDEX "sources_canonical_url_idx";
  DROP INDEX "sources_external_id_idx";
  DROP INDEX "sources_content_hash_idx";
  DROP INDEX "_sources_v_version_version_url_idx";
  DROP INDEX "_sources_v_version_version_canonical_url_idx";
  DROP INDEX "_sources_v_version_version_external_id_idx";
  DROP INDEX "_sources_v_version_version_content_hash_idx";
  DROP INDEX "search_rels_source_documents_id_idx";
  DROP INDEX "search_rels_document_chunks_id_idx";
  DROP INDEX "search_rels_claims_id_idx";
  DROP INDEX "search_rels_claim_evidence_id_idx";
  DROP INDEX "payload_locked_documents_rels_source_snapshots_id_idx";
  DROP INDEX "payload_locked_documents_rels_source_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_document_chunks_id_idx";
  DROP INDEX "payload_locked_documents_rels_ingestion_jobs_id_idx";
  DROP INDEX "payload_locked_documents_rels_claims_id_idx";
  DROP INDEX "payload_locked_documents_rels_claim_evidence_id_idx";
  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "users" DROP COLUMN "legal_consent_accepted_at";
  ALTER TABLE "users" DROP COLUMN "legal_consent_version";
  ALTER TABLE "users" DROP COLUMN "legal_consent_ip_hash";
  ALTER TABLE "users" DROP COLUMN "legal_consent_user_agent";
  ALTER TABLE "users" DROP COLUMN "legal_consent_provider_ids";
  ALTER TABLE "sources" DROP COLUMN "platform";
  ALTER TABLE "sources" DROP COLUMN "canonical_url";
  ALTER TABLE "sources" DROP COLUMN "external_id";
  ALTER TABLE "sources" DROP COLUMN "last_fetched_at";
  ALTER TABLE "sources" DROP COLUMN "content_hash";
  ALTER TABLE "sources" DROP COLUMN "fetch_status";
  ALTER TABLE "sources" DROP COLUMN "fetch_error";
  ALTER TABLE "sources" DROP COLUMN "raw_metadata";
  ALTER TABLE "_sources_v" DROP COLUMN "version_platform";
  ALTER TABLE "_sources_v" DROP COLUMN "version_canonical_url";
  ALTER TABLE "_sources_v" DROP COLUMN "version_external_id";
  ALTER TABLE "_sources_v" DROP COLUMN "version_last_fetched_at";
  ALTER TABLE "_sources_v" DROP COLUMN "version_content_hash";
  ALTER TABLE "_sources_v" DROP COLUMN "version_fetch_status";
  ALTER TABLE "_sources_v" DROP COLUMN "version_fetch_error";
  ALTER TABLE "_sources_v" DROP COLUMN "version_raw_metadata";
  ALTER TABLE "search_rels" DROP COLUMN "source_documents_id";
  ALTER TABLE "search_rels" DROP COLUMN "document_chunks_id";
  ALTER TABLE "search_rels" DROP COLUMN "claims_id";
  ALTER TABLE "search_rels" DROP COLUMN "claim_evidence_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "source_snapshots_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "source_documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "document_chunks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ingestion_jobs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "claims_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "claim_evidence_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";
  DROP TYPE "public"."enum_sources_platform";
  DROP TYPE "public"."enum_sources_fetch_status";
  DROP TYPE "public"."enum__sources_v_version_platform";
  DROP TYPE "public"."enum__sources_v_version_fetch_status";
  DROP TYPE "public"."enum_source_snapshots_fetch_status";
  DROP TYPE "public"."enum_source_documents_parser";
  DROP TYPE "public"."enum_source_documents_status";
  DROP TYPE "public"."enum__source_documents_v_version_parser";
  DROP TYPE "public"."enum__source_documents_v_version_status";
  DROP TYPE "public"."enum_document_chunks_embedding_status";
  DROP TYPE "public"."enum_document_chunks_status";
  DROP TYPE "public"."enum__document_chunks_v_version_embedding_status";
  DROP TYPE "public"."enum__document_chunks_v_version_status";
  DROP TYPE "public"."enum_ingestion_jobs_job_type";
  DROP TYPE "public"."enum_ingestion_jobs_status";
  DROP TYPE "public"."enum_claims_claim_type";
  DROP TYPE "public"."enum_claims_stance";
  DROP TYPE "public"."enum_claims_review_status";
  DROP TYPE "public"."enum_claims_extraction_method";
  DROP TYPE "public"."enum_claims_status";
  DROP TYPE "public"."enum__claims_v_version_claim_type";
  DROP TYPE "public"."enum__claims_v_version_stance";
  DROP TYPE "public"."enum__claims_v_version_review_status";
  DROP TYPE "public"."enum__claims_v_version_extraction_method";
  DROP TYPE "public"."enum__claims_v_version_status";
  DROP TYPE "public"."enum_claim_evidence_review_status";
  DROP TYPE "public"."enum_claim_evidence_status";
  DROP TYPE "public"."enum__claim_evidence_v_version_review_status";
  DROP TYPE "public"."enum__claim_evidence_v_version_status";`)
}
