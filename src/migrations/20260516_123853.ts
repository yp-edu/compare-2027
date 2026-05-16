import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_response_feedback_rating" AS ENUM('helpful', 'not_helpful');
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

   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "response_feedback_id" integer;
  ALTER TABLE "response_feedback" ADD CONSTRAINT "response_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "response_feedback_user_idx" ON "response_feedback" USING btree ("user_id");
  CREATE INDEX "response_feedback_message_id_idx" ON "response_feedback" USING btree ("message_id");
  CREATE INDEX "response_feedback_updated_at_idx" ON "response_feedback" USING btree ("updated_at");
  CREATE INDEX "response_feedback_created_at_idx" ON "response_feedback" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_response_feedback_fk" FOREIGN KEY ("response_feedback_id") REFERENCES "public"."response_feedback"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_response_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("response_feedback_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "response_feedback" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "response_feedback" CASCADE;
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_response_feedback_fk";

   DROP INDEX "payload_locked_documents_rels_response_feedback_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "response_feedback_id";
  DROP TYPE "public"."enum_response_feedback_rating";`)
}
