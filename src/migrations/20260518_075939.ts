import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'user');
  CREATE TYPE "public"."enum_admin_invitations_role" AS ENUM('admin', 'editor', 'user');
  CREATE TYPE "public"."enum_sources_type" AS ENUM('official_program', 'speech', 'interview', 'press_release', 'vote', 'article', 'report', 'other');
  CREATE TYPE "public"."enum_sources_platform" AS ENUM('party_site', 'x', 'assemblee', 'datan', 'press', 'institution', 'other');
  CREATE TYPE "public"."enum_sources_fetch_status" AS ENUM('not_fetched', 'fetched', 'failed', 'skipped');
  CREATE TYPE "public"."enum_sources_verification_status" AS ENUM('pending', 'verified', 'disputed', 'archived');
  CREATE TYPE "public"."enum_sources_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__sources_v_version_type" AS ENUM('official_program', 'speech', 'interview', 'press_release', 'vote', 'article', 'report', 'other');
  CREATE TYPE "public"."enum__sources_v_version_platform" AS ENUM('party_site', 'x', 'assemblee', 'datan', 'press', 'institution', 'other');
  CREATE TYPE "public"."enum__sources_v_version_fetch_status" AS ENUM('not_fetched', 'fetched', 'failed', 'skipped');
  CREATE TYPE "public"."enum__sources_v_version_verification_status" AS ENUM('pending', 'verified', 'disputed', 'archived');
  CREATE TYPE "public"."enum__sources_v_version_status" AS ENUM('draft', 'published');
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
  CREATE TYPE "public"."enum_parties_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__parties_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_candidates_candidacy_status" AS ENUM('declared', 'expected', 'exploring', 'withdrawn', 'not_candidate');
  CREATE TYPE "public"."enum_candidates_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__candidates_v_version_candidacy_status" AS ENUM('declared', 'expected', 'exploring', 'withdrawn', 'not_candidate');
  CREATE TYPE "public"."enum__candidates_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_topics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_version_status" AS ENUM('draft', 'published');
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
  CREATE TYPE "public"."enum_programs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__programs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_proposals_proposal_status" AS ENUM('announced', 'confirmed', 'changed', 'withdrawn', 'unclear');
  CREATE TYPE "public"."enum_proposals_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__proposals_v_version_proposal_status" AS ENUM('announced', 'confirmed', 'changed', 'withdrawn', 'unclear');
  CREATE TYPE "public"."enum__proposals_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_public_positions_position_type" AS ENUM('speech', 'interview', 'vote', 'social_post', 'press_release', 'debate', 'other');
  CREATE TYPE "public"."enum_public_positions_stance" AS ENUM('supports', 'opposes', 'mixed', 'unclear', 'not_applicable');
  CREATE TYPE "public"."enum_public_positions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__public_positions_v_version_position_type" AS ENUM('speech', 'interview', 'vote', 'social_post', 'press_release', 'debate', 'other');
  CREATE TYPE "public"."enum__public_positions_v_version_stance" AS ENUM('supports', 'opposes', 'mixed', 'unclear', 'not_applicable');
  CREATE TYPE "public"."enum__public_positions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_response_feedback_rating" AS ENUM('helpful', 'not_helpful');
  CREATE TABLE "users_role" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_role",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"email_verified" boolean DEFAULT false NOT NULL,
  	"image" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"banned" boolean DEFAULT false,
  	"ban_reason" varchar,
  	"ban_expires" timestamp(3) with time zone,
  	"two_factor_enabled" boolean DEFAULT false,
  	"legal_consent_accepted_at" varchar,
  	"legal_consent_version" varchar,
  	"legal_consent_ip_hash" varchar,
  	"legal_consent_user_agent" varchar,
  	"legal_consent_provider_ids" varchar
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"token" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"user_id" integer NOT NULL,
  	"impersonated_by_id" integer
  );
  
  CREATE TABLE "accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"account_id" varchar NOT NULL,
  	"provider_id" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"id_token" varchar,
  	"access_token_expires_at" timestamp(3) with time zone,
  	"refresh_token_expires_at" timestamp(3) with time zone,
  	"scope" varchar,
  	"password" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "verifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "two_factors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"secret" varchar NOT NULL,
  	"backup_codes" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"verified" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "admin_invitations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_admin_invitations_role" DEFAULT 'admin' NOT NULL,
  	"token" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_sources_type" DEFAULT 'other',
  	"platform" "enum_sources_platform" DEFAULT 'other',
  	"url" varchar,
  	"canonical_url" varchar,
  	"external_id" varchar,
  	"archived_url" varchar,
  	"file_id" integer,
  	"publisher" varchar,
  	"published_at" timestamp(3) with time zone,
  	"retrieved_at" timestamp(3) with time zone,
  	"last_fetched_at" timestamp(3) with time zone,
  	"content_hash" varchar,
  	"fetch_status" "enum_sources_fetch_status" DEFAULT 'not_fetched',
  	"fetch_error" varchar,
  	"language" varchar DEFAULT 'fr',
  	"quote" varchar,
  	"notes" varchar,
  	"raw_metadata" jsonb,
  	"verification_status" "enum_sources_verification_status" DEFAULT 'pending',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_sources_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_sources_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "enum__sources_v_version_type" DEFAULT 'other',
  	"version_platform" "enum__sources_v_version_platform" DEFAULT 'other',
  	"version_url" varchar,
  	"version_canonical_url" varchar,
  	"version_external_id" varchar,
  	"version_archived_url" varchar,
  	"version_file_id" integer,
  	"version_publisher" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_retrieved_at" timestamp(3) with time zone,
  	"version_last_fetched_at" timestamp(3) with time zone,
  	"version_content_hash" varchar,
  	"version_fetch_status" "enum__sources_v_version_fetch_status" DEFAULT 'not_fetched',
  	"version_fetch_error" varchar,
  	"version_language" varchar DEFAULT 'fr',
  	"version_quote" varchar,
  	"version_notes" varchar,
  	"version_raw_metadata" jsonb,
  	"version_verification_status" "enum__sources_v_version_verification_status" DEFAULT 'pending',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__sources_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
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
  
  CREATE TABLE "parties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"short_name" varchar,
  	"logo_id" integer,
  	"color" varchar,
  	"website" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_parties_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "parties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_parties_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_short_name" varchar,
  	"version_logo_id" integer,
  	"version_color" varchar,
  	"version_website" varchar,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__parties_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_parties_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "candidates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"display_name" varchar,
  	"slug" varchar,
  	"photo_id" integer,
  	"current_party_id" integer,
  	"candidacy_status" "enum_candidates_candidacy_status" DEFAULT 'expected',
  	"website" varchar,
  	"bio" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_candidates_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "candidates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "_candidates_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_first_name" varchar,
  	"version_last_name" varchar,
  	"version_display_name" varchar,
  	"version_slug" varchar,
  	"version_photo_id" integer,
  	"version_current_party_id" integer,
  	"version_candidacy_status" "enum__candidates_v_version_candidacy_status" DEFAULT 'expected',
  	"version_website" varchar,
  	"version_bio" varchar,
  	"version_sort_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__candidates_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_candidates_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" varchar,
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"color" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_topics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" varchar,
  	"version_parent_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_color" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__topics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
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
  
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"source_id" integer,
  	"file_id" integer,
  	"program_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_programs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "programs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer
  );
  
  CREATE TABLE "_programs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_source_id" integer,
  	"version_file_id" integer,
  	"version_program_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__programs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_programs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer
  );
  
  CREATE TABLE "proposals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"details" varchar,
  	"proposal_status" "enum_proposals_proposal_status" DEFAULT 'announced',
  	"published_at" timestamp(3) with time zone,
  	"last_verified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_proposals_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "proposals_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer,
  	"topics_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_proposals_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_details" varchar,
  	"version_proposal_status" "enum__proposals_v_version_proposal_status" DEFAULT 'announced',
  	"version_published_at" timestamp(3) with time zone,
  	"version_last_verified_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__proposals_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_proposals_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer,
  	"topics_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "public_positions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"source_id" integer,
  	"position_date" timestamp(3) with time zone,
  	"position_type" "enum_public_positions_position_type" DEFAULT 'other',
  	"quote" varchar,
  	"summary" varchar,
  	"stance" "enum_public_positions_stance" DEFAULT 'unclear',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_public_positions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "public_positions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "_public_positions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_source_id" integer,
  	"version_position_date" timestamp(3) with time zone,
  	"version_position_type" "enum__public_positions_v_version_position_type" DEFAULT 'other',
  	"version_quote" varchar,
  	"version_summary" varchar,
  	"version_stance" "enum__public_positions_v_version_stance" DEFAULT 'unclear',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__public_positions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_public_positions_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"candidates_id" integer,
  	"parties_id" integer,
  	"topics_id" integer
  );
  
  CREATE TABLE "response_feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rating" "enum_response_feedback_rating" NOT NULL,
  	"user_id" integer NOT NULL,
  	"message_id" varchar,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"comment" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"collection_slug" varchar,
  	"excerpt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"parties_id" integer,
  	"candidates_id" integer,
  	"topics_id" integer,
  	"source_documents_id" integer,
  	"document_chunks_id" integer,
  	"claims_id" integer,
  	"claim_evidence_id" integer,
  	"programs_id" integer,
  	"proposals_id" integer,
  	"public_positions_id" integer
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
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"sessions_id" integer,
  	"accounts_id" integer,
  	"verifications_id" integer,
  	"two_factors_id" integer,
  	"admin_invitations_id" integer,
  	"media_id" integer,
  	"sources_id" integer,
  	"source_snapshots_id" integer,
  	"source_documents_id" integer,
  	"document_chunks_id" integer,
  	"ingestion_jobs_id" integer,
  	"parties_id" integer,
  	"candidates_id" integer,
  	"topics_id" integer,
  	"claims_id" integer,
  	"claim_evidence_id" integer,
  	"programs_id" integer,
  	"proposals_id" integer,
  	"public_positions_id" integer,
  	"response_feedback_id" integer,
  	"search_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "database" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seeded" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_role" ADD CONSTRAINT "users_role_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_id_users_id_fk" FOREIGN KEY ("impersonated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sources" ADD CONSTRAINT "sources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sources_v" ADD CONSTRAINT "_sources_v_parent_id_sources_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_sources_v" ADD CONSTRAINT "_sources_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "parties" ADD CONSTRAINT "parties_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "parties_rels" ADD CONSTRAINT "parties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "parties_rels" ADD CONSTRAINT "parties_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_parties_v" ADD CONSTRAINT "_parties_v_parent_id_parties_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_parties_v" ADD CONSTRAINT "_parties_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_parties_v_rels" ADD CONSTRAINT "_parties_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_parties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_parties_v_rels" ADD CONSTRAINT "_parties_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates" ADD CONSTRAINT "candidates_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidates" ADD CONSTRAINT "candidates_current_party_id_parties_id_fk" FOREIGN KEY ("current_party_id") REFERENCES "public"."parties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "candidates_rels" ADD CONSTRAINT "candidates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "candidates_rels" ADD CONSTRAINT "candidates_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_candidates_v" ADD CONSTRAINT "_candidates_v_parent_id_candidates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."candidates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_candidates_v" ADD CONSTRAINT "_candidates_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_candidates_v" ADD CONSTRAINT "_candidates_v_version_current_party_id_parties_id_fk" FOREIGN KEY ("version_current_party_id") REFERENCES "public"."parties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_candidates_v_rels" ADD CONSTRAINT "_candidates_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_candidates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_candidates_v_rels" ADD CONSTRAINT "_candidates_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_version_parent_id_topics_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "programs" ADD CONSTRAINT "programs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs" ADD CONSTRAINT "programs_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_rels" ADD CONSTRAINT "programs_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v" ADD CONSTRAINT "_programs_v_parent_id_programs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programs_v" ADD CONSTRAINT "_programs_v_version_source_id_sources_id_fk" FOREIGN KEY ("version_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programs_v" ADD CONSTRAINT "_programs_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_programs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programs_v_rels" ADD CONSTRAINT "_programs_v_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proposals_rels" ADD CONSTRAINT "proposals_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proposals_rels" ADD CONSTRAINT "proposals_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proposals_rels" ADD CONSTRAINT "proposals_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proposals_rels" ADD CONSTRAINT "proposals_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "proposals_rels" ADD CONSTRAINT "proposals_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proposals_v" ADD CONSTRAINT "_proposals_v_parent_id_proposals_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."proposals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_proposals_v_rels" ADD CONSTRAINT "_proposals_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_proposals_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proposals_v_rels" ADD CONSTRAINT "_proposals_v_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proposals_v_rels" ADD CONSTRAINT "_proposals_v_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proposals_v_rels" ADD CONSTRAINT "_proposals_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_proposals_v_rels" ADD CONSTRAINT "_proposals_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_positions" ADD CONSTRAINT "public_positions_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "public_positions_rels" ADD CONSTRAINT "public_positions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."public_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_positions_rels" ADD CONSTRAINT "public_positions_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_positions_rels" ADD CONSTRAINT "public_positions_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "public_positions_rels" ADD CONSTRAINT "public_positions_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_public_positions_v" ADD CONSTRAINT "_public_positions_v_parent_id_public_positions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."public_positions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_public_positions_v" ADD CONSTRAINT "_public_positions_v_version_source_id_sources_id_fk" FOREIGN KEY ("version_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_public_positions_v_rels" ADD CONSTRAINT "_public_positions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_public_positions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_public_positions_v_rels" ADD CONSTRAINT "_public_positions_v_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_public_positions_v_rels" ADD CONSTRAINT "_public_positions_v_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_public_positions_v_rels" ADD CONSTRAINT "_public_positions_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "response_feedback" ADD CONSTRAINT "response_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_source_documents_fk" FOREIGN KEY ("source_documents_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_document_chunks_fk" FOREIGN KEY ("document_chunks_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_claim_evidence_fk" FOREIGN KEY ("claim_evidence_id") REFERENCES "public"."claim_evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_proposals_fk" FOREIGN KEY ("proposals_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_public_positions_fk" FOREIGN KEY ("public_positions_id") REFERENCES "public"."public_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounts_fk" FOREIGN KEY ("accounts_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verifications_fk" FOREIGN KEY ("verifications_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_two_factors_fk" FOREIGN KEY ("two_factors_id") REFERENCES "public"."two_factors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_invitations_fk" FOREIGN KEY ("admin_invitations_id") REFERENCES "public"."admin_invitations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_source_snapshots_fk" FOREIGN KEY ("source_snapshots_id") REFERENCES "public"."source_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_source_documents_fk" FOREIGN KEY ("source_documents_id") REFERENCES "public"."source_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_chunks_fk" FOREIGN KEY ("document_chunks_id") REFERENCES "public"."document_chunks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ingestion_jobs_fk" FOREIGN KEY ("ingestion_jobs_id") REFERENCES "public"."ingestion_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parties_fk" FOREIGN KEY ("parties_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_candidates_fk" FOREIGN KEY ("candidates_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claims_fk" FOREIGN KEY ("claims_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claim_evidence_fk" FOREIGN KEY ("claim_evidence_id") REFERENCES "public"."claim_evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_proposals_fk" FOREIGN KEY ("proposals_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_public_positions_fk" FOREIGN KEY ("public_positions_id") REFERENCES "public"."public_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_response_feedback_fk" FOREIGN KEY ("response_feedback_id") REFERENCES "public"."response_feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_role_order_idx" ON "users_role" USING btree ("order");
  CREATE INDEX "users_role_parent_idx" ON "users_role" USING btree ("parent_id");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");
  CREATE INDEX "sessions_impersonated_by_idx" ON "sessions" USING btree ("impersonated_by_id");
  CREATE INDEX "accounts_account_id_idx" ON "accounts" USING btree ("account_id");
  CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");
  CREATE INDEX "accounts_created_at_idx" ON "accounts" USING btree ("created_at");
  CREATE INDEX "accounts_updated_at_idx" ON "accounts" USING btree ("updated_at");
  CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");
  CREATE INDEX "verifications_created_at_idx" ON "verifications" USING btree ("created_at");
  CREATE INDEX "verifications_updated_at_idx" ON "verifications" USING btree ("updated_at");
  CREATE INDEX "two_factors_secret_idx" ON "two_factors" USING btree ("secret");
  CREATE INDEX "two_factors_user_idx" ON "two_factors" USING btree ("user_id");
  CREATE INDEX "two_factors_updated_at_idx" ON "two_factors" USING btree ("updated_at");
  CREATE INDEX "two_factors_created_at_idx" ON "two_factors" USING btree ("created_at");
  CREATE INDEX "admin_invitations_token_idx" ON "admin_invitations" USING btree ("token");
  CREATE INDEX "admin_invitations_updated_at_idx" ON "admin_invitations" USING btree ("updated_at");
  CREATE INDEX "admin_invitations_created_at_idx" ON "admin_invitations" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "sources_url_idx" ON "sources" USING btree ("url");
  CREATE INDEX "sources_canonical_url_idx" ON "sources" USING btree ("canonical_url");
  CREATE INDEX "sources_external_id_idx" ON "sources" USING btree ("external_id");
  CREATE INDEX "sources_file_idx" ON "sources" USING btree ("file_id");
  CREATE INDEX "sources_published_at_idx" ON "sources" USING btree ("published_at");
  CREATE INDEX "sources_content_hash_idx" ON "sources" USING btree ("content_hash");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "sources__status_idx" ON "sources" USING btree ("_status");
  CREATE INDEX "_sources_v_parent_idx" ON "_sources_v" USING btree ("parent_id");
  CREATE INDEX "_sources_v_version_version_url_idx" ON "_sources_v" USING btree ("version_url");
  CREATE INDEX "_sources_v_version_version_canonical_url_idx" ON "_sources_v" USING btree ("version_canonical_url");
  CREATE INDEX "_sources_v_version_version_external_id_idx" ON "_sources_v" USING btree ("version_external_id");
  CREATE INDEX "_sources_v_version_version_file_idx" ON "_sources_v" USING btree ("version_file_id");
  CREATE INDEX "_sources_v_version_version_published_at_idx" ON "_sources_v" USING btree ("version_published_at");
  CREATE INDEX "_sources_v_version_version_content_hash_idx" ON "_sources_v" USING btree ("version_content_hash");
  CREATE INDEX "_sources_v_version_version_updated_at_idx" ON "_sources_v" USING btree ("version_updated_at");
  CREATE INDEX "_sources_v_version_version_created_at_idx" ON "_sources_v" USING btree ("version_created_at");
  CREATE INDEX "_sources_v_version_version__status_idx" ON "_sources_v" USING btree ("version__status");
  CREATE INDEX "_sources_v_created_at_idx" ON "_sources_v" USING btree ("created_at");
  CREATE INDEX "_sources_v_updated_at_idx" ON "_sources_v" USING btree ("updated_at");
  CREATE INDEX "_sources_v_latest_idx" ON "_sources_v" USING btree ("latest");
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
  CREATE UNIQUE INDEX "parties_slug_idx" ON "parties" USING btree ("slug");
  CREATE INDEX "parties_logo_idx" ON "parties" USING btree ("logo_id");
  CREATE INDEX "parties_updated_at_idx" ON "parties" USING btree ("updated_at");
  CREATE INDEX "parties_created_at_idx" ON "parties" USING btree ("created_at");
  CREATE INDEX "parties__status_idx" ON "parties" USING btree ("_status");
  CREATE INDEX "parties_rels_order_idx" ON "parties_rels" USING btree ("order");
  CREATE INDEX "parties_rels_parent_idx" ON "parties_rels" USING btree ("parent_id");
  CREATE INDEX "parties_rels_path_idx" ON "parties_rels" USING btree ("path");
  CREATE INDEX "parties_rels_sources_id_idx" ON "parties_rels" USING btree ("sources_id");
  CREATE INDEX "_parties_v_parent_idx" ON "_parties_v" USING btree ("parent_id");
  CREATE INDEX "_parties_v_version_version_slug_idx" ON "_parties_v" USING btree ("version_slug");
  CREATE INDEX "_parties_v_version_version_logo_idx" ON "_parties_v" USING btree ("version_logo_id");
  CREATE INDEX "_parties_v_version_version_updated_at_idx" ON "_parties_v" USING btree ("version_updated_at");
  CREATE INDEX "_parties_v_version_version_created_at_idx" ON "_parties_v" USING btree ("version_created_at");
  CREATE INDEX "_parties_v_version_version__status_idx" ON "_parties_v" USING btree ("version__status");
  CREATE INDEX "_parties_v_created_at_idx" ON "_parties_v" USING btree ("created_at");
  CREATE INDEX "_parties_v_updated_at_idx" ON "_parties_v" USING btree ("updated_at");
  CREATE INDEX "_parties_v_latest_idx" ON "_parties_v" USING btree ("latest");
  CREATE INDEX "_parties_v_rels_order_idx" ON "_parties_v_rels" USING btree ("order");
  CREATE INDEX "_parties_v_rels_parent_idx" ON "_parties_v_rels" USING btree ("parent_id");
  CREATE INDEX "_parties_v_rels_path_idx" ON "_parties_v_rels" USING btree ("path");
  CREATE INDEX "_parties_v_rels_sources_id_idx" ON "_parties_v_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "candidates_slug_idx" ON "candidates" USING btree ("slug");
  CREATE INDEX "candidates_photo_idx" ON "candidates" USING btree ("photo_id");
  CREATE INDEX "candidates_current_party_idx" ON "candidates" USING btree ("current_party_id");
  CREATE INDEX "candidates_sort_order_idx" ON "candidates" USING btree ("sort_order");
  CREATE INDEX "candidates_updated_at_idx" ON "candidates" USING btree ("updated_at");
  CREATE INDEX "candidates_created_at_idx" ON "candidates" USING btree ("created_at");
  CREATE INDEX "candidates__status_idx" ON "candidates" USING btree ("_status");
  CREATE INDEX "candidates_rels_order_idx" ON "candidates_rels" USING btree ("order");
  CREATE INDEX "candidates_rels_parent_idx" ON "candidates_rels" USING btree ("parent_id");
  CREATE INDEX "candidates_rels_path_idx" ON "candidates_rels" USING btree ("path");
  CREATE INDEX "candidates_rels_sources_id_idx" ON "candidates_rels" USING btree ("sources_id");
  CREATE INDEX "_candidates_v_parent_idx" ON "_candidates_v" USING btree ("parent_id");
  CREATE INDEX "_candidates_v_version_version_slug_idx" ON "_candidates_v" USING btree ("version_slug");
  CREATE INDEX "_candidates_v_version_version_photo_idx" ON "_candidates_v" USING btree ("version_photo_id");
  CREATE INDEX "_candidates_v_version_version_current_party_idx" ON "_candidates_v" USING btree ("version_current_party_id");
  CREATE INDEX "_candidates_v_version_version_sort_order_idx" ON "_candidates_v" USING btree ("version_sort_order");
  CREATE INDEX "_candidates_v_version_version_updated_at_idx" ON "_candidates_v" USING btree ("version_updated_at");
  CREATE INDEX "_candidates_v_version_version_created_at_idx" ON "_candidates_v" USING btree ("version_created_at");
  CREATE INDEX "_candidates_v_version_version__status_idx" ON "_candidates_v" USING btree ("version__status");
  CREATE INDEX "_candidates_v_created_at_idx" ON "_candidates_v" USING btree ("created_at");
  CREATE INDEX "_candidates_v_updated_at_idx" ON "_candidates_v" USING btree ("updated_at");
  CREATE INDEX "_candidates_v_latest_idx" ON "_candidates_v" USING btree ("latest");
  CREATE INDEX "_candidates_v_rels_order_idx" ON "_candidates_v_rels" USING btree ("order");
  CREATE INDEX "_candidates_v_rels_parent_idx" ON "_candidates_v_rels" USING btree ("parent_id");
  CREATE INDEX "_candidates_v_rels_path_idx" ON "_candidates_v_rels" USING btree ("path");
  CREATE INDEX "_candidates_v_rels_sources_id_idx" ON "_candidates_v_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_parent_idx" ON "topics" USING btree ("parent_id");
  CREATE INDEX "topics_order_idx" ON "topics" USING btree ("order");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics__status_idx" ON "topics" USING btree ("_status");
  CREATE INDEX "_topics_v_parent_idx" ON "_topics_v" USING btree ("parent_id");
  CREATE INDEX "_topics_v_version_version_slug_idx" ON "_topics_v" USING btree ("version_slug");
  CREATE INDEX "_topics_v_version_version_parent_idx" ON "_topics_v" USING btree ("version_parent_id");
  CREATE INDEX "_topics_v_version_version_order_idx" ON "_topics_v" USING btree ("version_order");
  CREATE INDEX "_topics_v_version_version_updated_at_idx" ON "_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_topics_v_version_version_created_at_idx" ON "_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_topics_v_version_version__status_idx" ON "_topics_v" USING btree ("version__status");
  CREATE INDEX "_topics_v_created_at_idx" ON "_topics_v" USING btree ("created_at");
  CREATE INDEX "_topics_v_updated_at_idx" ON "_topics_v" USING btree ("updated_at");
  CREATE INDEX "_topics_v_latest_idx" ON "_topics_v" USING btree ("latest");
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
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE INDEX "programs_source_idx" ON "programs" USING btree ("source_id");
  CREATE INDEX "programs_file_idx" ON "programs" USING btree ("file_id");
  CREATE INDEX "programs_program_date_idx" ON "programs" USING btree ("program_date");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE INDEX "programs__status_idx" ON "programs" USING btree ("_status");
  CREATE INDEX "programs_rels_order_idx" ON "programs_rels" USING btree ("order");
  CREATE INDEX "programs_rels_parent_idx" ON "programs_rels" USING btree ("parent_id");
  CREATE INDEX "programs_rels_path_idx" ON "programs_rels" USING btree ("path");
  CREATE INDEX "programs_rels_candidates_id_idx" ON "programs_rels" USING btree ("candidates_id");
  CREATE INDEX "programs_rels_parties_id_idx" ON "programs_rels" USING btree ("parties_id");
  CREATE INDEX "_programs_v_parent_idx" ON "_programs_v" USING btree ("parent_id");
  CREATE INDEX "_programs_v_version_version_slug_idx" ON "_programs_v" USING btree ("version_slug");
  CREATE INDEX "_programs_v_version_version_source_idx" ON "_programs_v" USING btree ("version_source_id");
  CREATE INDEX "_programs_v_version_version_file_idx" ON "_programs_v" USING btree ("version_file_id");
  CREATE INDEX "_programs_v_version_version_program_date_idx" ON "_programs_v" USING btree ("version_program_date");
  CREATE INDEX "_programs_v_version_version_updated_at_idx" ON "_programs_v" USING btree ("version_updated_at");
  CREATE INDEX "_programs_v_version_version_created_at_idx" ON "_programs_v" USING btree ("version_created_at");
  CREATE INDEX "_programs_v_version_version__status_idx" ON "_programs_v" USING btree ("version__status");
  CREATE INDEX "_programs_v_created_at_idx" ON "_programs_v" USING btree ("created_at");
  CREATE INDEX "_programs_v_updated_at_idx" ON "_programs_v" USING btree ("updated_at");
  CREATE INDEX "_programs_v_latest_idx" ON "_programs_v" USING btree ("latest");
  CREATE INDEX "_programs_v_rels_order_idx" ON "_programs_v_rels" USING btree ("order");
  CREATE INDEX "_programs_v_rels_parent_idx" ON "_programs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_programs_v_rels_path_idx" ON "_programs_v_rels" USING btree ("path");
  CREATE INDEX "_programs_v_rels_candidates_id_idx" ON "_programs_v_rels" USING btree ("candidates_id");
  CREATE INDEX "_programs_v_rels_parties_id_idx" ON "_programs_v_rels" USING btree ("parties_id");
  CREATE UNIQUE INDEX "proposals_slug_idx" ON "proposals" USING btree ("slug");
  CREATE INDEX "proposals_published_at_idx" ON "proposals" USING btree ("published_at");
  CREATE INDEX "proposals_updated_at_idx" ON "proposals" USING btree ("updated_at");
  CREATE INDEX "proposals_created_at_idx" ON "proposals" USING btree ("created_at");
  CREATE INDEX "proposals__status_idx" ON "proposals" USING btree ("_status");
  CREATE INDEX "proposals_rels_order_idx" ON "proposals_rels" USING btree ("order");
  CREATE INDEX "proposals_rels_parent_idx" ON "proposals_rels" USING btree ("parent_id");
  CREATE INDEX "proposals_rels_path_idx" ON "proposals_rels" USING btree ("path");
  CREATE INDEX "proposals_rels_candidates_id_idx" ON "proposals_rels" USING btree ("candidates_id");
  CREATE INDEX "proposals_rels_parties_id_idx" ON "proposals_rels" USING btree ("parties_id");
  CREATE INDEX "proposals_rels_topics_id_idx" ON "proposals_rels" USING btree ("topics_id");
  CREATE INDEX "proposals_rels_sources_id_idx" ON "proposals_rels" USING btree ("sources_id");
  CREATE INDEX "_proposals_v_parent_idx" ON "_proposals_v" USING btree ("parent_id");
  CREATE INDEX "_proposals_v_version_version_slug_idx" ON "_proposals_v" USING btree ("version_slug");
  CREATE INDEX "_proposals_v_version_version_published_at_idx" ON "_proposals_v" USING btree ("version_published_at");
  CREATE INDEX "_proposals_v_version_version_updated_at_idx" ON "_proposals_v" USING btree ("version_updated_at");
  CREATE INDEX "_proposals_v_version_version_created_at_idx" ON "_proposals_v" USING btree ("version_created_at");
  CREATE INDEX "_proposals_v_version_version__status_idx" ON "_proposals_v" USING btree ("version__status");
  CREATE INDEX "_proposals_v_created_at_idx" ON "_proposals_v" USING btree ("created_at");
  CREATE INDEX "_proposals_v_updated_at_idx" ON "_proposals_v" USING btree ("updated_at");
  CREATE INDEX "_proposals_v_latest_idx" ON "_proposals_v" USING btree ("latest");
  CREATE INDEX "_proposals_v_rels_order_idx" ON "_proposals_v_rels" USING btree ("order");
  CREATE INDEX "_proposals_v_rels_parent_idx" ON "_proposals_v_rels" USING btree ("parent_id");
  CREATE INDEX "_proposals_v_rels_path_idx" ON "_proposals_v_rels" USING btree ("path");
  CREATE INDEX "_proposals_v_rels_candidates_id_idx" ON "_proposals_v_rels" USING btree ("candidates_id");
  CREATE INDEX "_proposals_v_rels_parties_id_idx" ON "_proposals_v_rels" USING btree ("parties_id");
  CREATE INDEX "_proposals_v_rels_topics_id_idx" ON "_proposals_v_rels" USING btree ("topics_id");
  CREATE INDEX "_proposals_v_rels_sources_id_idx" ON "_proposals_v_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "public_positions_slug_idx" ON "public_positions" USING btree ("slug");
  CREATE INDEX "public_positions_source_idx" ON "public_positions" USING btree ("source_id");
  CREATE INDEX "public_positions_position_date_idx" ON "public_positions" USING btree ("position_date");
  CREATE INDEX "public_positions_updated_at_idx" ON "public_positions" USING btree ("updated_at");
  CREATE INDEX "public_positions_created_at_idx" ON "public_positions" USING btree ("created_at");
  CREATE INDEX "public_positions__status_idx" ON "public_positions" USING btree ("_status");
  CREATE INDEX "public_positions_rels_order_idx" ON "public_positions_rels" USING btree ("order");
  CREATE INDEX "public_positions_rels_parent_idx" ON "public_positions_rels" USING btree ("parent_id");
  CREATE INDEX "public_positions_rels_path_idx" ON "public_positions_rels" USING btree ("path");
  CREATE INDEX "public_positions_rels_candidates_id_idx" ON "public_positions_rels" USING btree ("candidates_id");
  CREATE INDEX "public_positions_rels_parties_id_idx" ON "public_positions_rels" USING btree ("parties_id");
  CREATE INDEX "public_positions_rels_topics_id_idx" ON "public_positions_rels" USING btree ("topics_id");
  CREATE INDEX "_public_positions_v_parent_idx" ON "_public_positions_v" USING btree ("parent_id");
  CREATE INDEX "_public_positions_v_version_version_slug_idx" ON "_public_positions_v" USING btree ("version_slug");
  CREATE INDEX "_public_positions_v_version_version_source_idx" ON "_public_positions_v" USING btree ("version_source_id");
  CREATE INDEX "_public_positions_v_version_version_position_date_idx" ON "_public_positions_v" USING btree ("version_position_date");
  CREATE INDEX "_public_positions_v_version_version_updated_at_idx" ON "_public_positions_v" USING btree ("version_updated_at");
  CREATE INDEX "_public_positions_v_version_version_created_at_idx" ON "_public_positions_v" USING btree ("version_created_at");
  CREATE INDEX "_public_positions_v_version_version__status_idx" ON "_public_positions_v" USING btree ("version__status");
  CREATE INDEX "_public_positions_v_created_at_idx" ON "_public_positions_v" USING btree ("created_at");
  CREATE INDEX "_public_positions_v_updated_at_idx" ON "_public_positions_v" USING btree ("updated_at");
  CREATE INDEX "_public_positions_v_latest_idx" ON "_public_positions_v" USING btree ("latest");
  CREATE INDEX "_public_positions_v_rels_order_idx" ON "_public_positions_v_rels" USING btree ("order");
  CREATE INDEX "_public_positions_v_rels_parent_idx" ON "_public_positions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_public_positions_v_rels_path_idx" ON "_public_positions_v_rels" USING btree ("path");
  CREATE INDEX "_public_positions_v_rels_candidates_id_idx" ON "_public_positions_v_rels" USING btree ("candidates_id");
  CREATE INDEX "_public_positions_v_rels_parties_id_idx" ON "_public_positions_v_rels" USING btree ("parties_id");
  CREATE INDEX "_public_positions_v_rels_topics_id_idx" ON "_public_positions_v_rels" USING btree ("topics_id");
  CREATE INDEX "response_feedback_user_idx" ON "response_feedback" USING btree ("user_id");
  CREATE INDEX "response_feedback_message_id_idx" ON "response_feedback" USING btree ("message_id");
  CREATE INDEX "response_feedback_updated_at_idx" ON "response_feedback" USING btree ("updated_at");
  CREATE INDEX "response_feedback_created_at_idx" ON "response_feedback" USING btree ("created_at");
  CREATE INDEX "search_collection_slug_idx" ON "search" USING btree ("collection_slug");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_parties_id_idx" ON "search_rels" USING btree ("parties_id");
  CREATE INDEX "search_rels_candidates_id_idx" ON "search_rels" USING btree ("candidates_id");
  CREATE INDEX "search_rels_topics_id_idx" ON "search_rels" USING btree ("topics_id");
  CREATE INDEX "search_rels_source_documents_id_idx" ON "search_rels" USING btree ("source_documents_id");
  CREATE INDEX "search_rels_document_chunks_id_idx" ON "search_rels" USING btree ("document_chunks_id");
  CREATE INDEX "search_rels_claims_id_idx" ON "search_rels" USING btree ("claims_id");
  CREATE INDEX "search_rels_claim_evidence_id_idx" ON "search_rels" USING btree ("claim_evidence_id");
  CREATE INDEX "search_rels_programs_id_idx" ON "search_rels" USING btree ("programs_id");
  CREATE INDEX "search_rels_proposals_id_idx" ON "search_rels" USING btree ("proposals_id");
  CREATE INDEX "search_rels_public_positions_id_idx" ON "search_rels" USING btree ("public_positions_id");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("accounts_id");
  CREATE INDEX "payload_locked_documents_rels_verifications_id_idx" ON "payload_locked_documents_rels" USING btree ("verifications_id");
  CREATE INDEX "payload_locked_documents_rels_two_factors_id_idx" ON "payload_locked_documents_rels" USING btree ("two_factors_id");
  CREATE INDEX "payload_locked_documents_rels_admin_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_invitations_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_source_snapshots_id_idx" ON "payload_locked_documents_rels" USING btree ("source_snapshots_id");
  CREATE INDEX "payload_locked_documents_rels_source_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("source_documents_id");
  CREATE INDEX "payload_locked_documents_rels_document_chunks_id_idx" ON "payload_locked_documents_rels" USING btree ("document_chunks_id");
  CREATE INDEX "payload_locked_documents_rels_ingestion_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("ingestion_jobs_id");
  CREATE INDEX "payload_locked_documents_rels_parties_id_idx" ON "payload_locked_documents_rels" USING btree ("parties_id");
  CREATE INDEX "payload_locked_documents_rels_candidates_id_idx" ON "payload_locked_documents_rels" USING btree ("candidates_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("claims_id");
  CREATE INDEX "payload_locked_documents_rels_claim_evidence_id_idx" ON "payload_locked_documents_rels" USING btree ("claim_evidence_id");
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_proposals_id_idx" ON "payload_locked_documents_rels" USING btree ("proposals_id");
  CREATE INDEX "payload_locked_documents_rels_public_positions_id_idx" ON "payload_locked_documents_rels" USING btree ("public_positions_id");
  CREATE INDEX "payload_locked_documents_rels_response_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("response_feedback_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_role" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "accounts" CASCADE;
  DROP TABLE "verifications" CASCADE;
  DROP TABLE "two_factors" CASCADE;
  DROP TABLE "admin_invitations" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "_sources_v" CASCADE;
  DROP TABLE "source_snapshots" CASCADE;
  DROP TABLE "source_documents" CASCADE;
  DROP TABLE "_source_documents_v" CASCADE;
  DROP TABLE "document_chunks" CASCADE;
  DROP TABLE "_document_chunks_v" CASCADE;
  DROP TABLE "ingestion_jobs" CASCADE;
  DROP TABLE "parties" CASCADE;
  DROP TABLE "parties_rels" CASCADE;
  DROP TABLE "_parties_v" CASCADE;
  DROP TABLE "_parties_v_rels" CASCADE;
  DROP TABLE "candidates" CASCADE;
  DROP TABLE "candidates_rels" CASCADE;
  DROP TABLE "_candidates_v" CASCADE;
  DROP TABLE "_candidates_v_rels" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "_topics_v" CASCADE;
  DROP TABLE "claims" CASCADE;
  DROP TABLE "claims_rels" CASCADE;
  DROP TABLE "_claims_v" CASCADE;
  DROP TABLE "_claims_v_rels" CASCADE;
  DROP TABLE "claim_evidence" CASCADE;
  DROP TABLE "_claim_evidence_v" CASCADE;
  DROP TABLE "programs" CASCADE;
  DROP TABLE "programs_rels" CASCADE;
  DROP TABLE "_programs_v" CASCADE;
  DROP TABLE "_programs_v_rels" CASCADE;
  DROP TABLE "proposals" CASCADE;
  DROP TABLE "proposals_rels" CASCADE;
  DROP TABLE "_proposals_v" CASCADE;
  DROP TABLE "_proposals_v_rels" CASCADE;
  DROP TABLE "public_positions" CASCADE;
  DROP TABLE "public_positions_rels" CASCADE;
  DROP TABLE "_public_positions_v" CASCADE;
  DROP TABLE "_public_positions_v_rels" CASCADE;
  DROP TABLE "response_feedback" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "database" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_admin_invitations_role";
  DROP TYPE "public"."enum_sources_type";
  DROP TYPE "public"."enum_sources_platform";
  DROP TYPE "public"."enum_sources_fetch_status";
  DROP TYPE "public"."enum_sources_verification_status";
  DROP TYPE "public"."enum_sources_status";
  DROP TYPE "public"."enum__sources_v_version_type";
  DROP TYPE "public"."enum__sources_v_version_platform";
  DROP TYPE "public"."enum__sources_v_version_fetch_status";
  DROP TYPE "public"."enum__sources_v_version_verification_status";
  DROP TYPE "public"."enum__sources_v_version_status";
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
  DROP TYPE "public"."enum_parties_status";
  DROP TYPE "public"."enum__parties_v_version_status";
  DROP TYPE "public"."enum_candidates_candidacy_status";
  DROP TYPE "public"."enum_candidates_status";
  DROP TYPE "public"."enum__candidates_v_version_candidacy_status";
  DROP TYPE "public"."enum__candidates_v_version_status";
  DROP TYPE "public"."enum_topics_status";
  DROP TYPE "public"."enum__topics_v_version_status";
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
  DROP TYPE "public"."enum__claim_evidence_v_version_status";
  DROP TYPE "public"."enum_programs_status";
  DROP TYPE "public"."enum__programs_v_version_status";
  DROP TYPE "public"."enum_proposals_proposal_status";
  DROP TYPE "public"."enum_proposals_status";
  DROP TYPE "public"."enum__proposals_v_version_proposal_status";
  DROP TYPE "public"."enum__proposals_v_version_status";
  DROP TYPE "public"."enum_public_positions_position_type";
  DROP TYPE "public"."enum_public_positions_stance";
  DROP TYPE "public"."enum_public_positions_status";
  DROP TYPE "public"."enum__public_positions_v_version_position_type";
  DROP TYPE "public"."enum__public_positions_v_version_stance";
  DROP TYPE "public"."enum__public_positions_v_version_status";
  DROP TYPE "public"."enum_response_feedback_rating";`)
}
