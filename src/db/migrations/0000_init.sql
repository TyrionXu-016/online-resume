CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"kind" varchar(30) NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" varchar(255),
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"visibility" varchar(20) DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "assets_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" uuid,
	"resume_id" uuid,
	"action" varchar(60) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"verification_token_hash" varchar(128),
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_domains_hostname_unique" UNIQUE("hostname")
);
--> statement-breakpoint
CREATE TABLE "resume_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"type" varchar(40) NOT NULL,
	"schema_version" smallint DEFAULT 1 NOT NULL,
	"sort_order" integer NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_id" uuid NOT NULL,
	"version_no" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"template_id" uuid,
	"template_version" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resume_versions_resume_id_version_no" UNIQUE("resume_id","version_no")
);
--> statement-breakpoint
CREATE TABLE "resume_visits" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resume_visits_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"resume_id" uuid NOT NULL,
	"visitor_hash" varchar(64) NOT NULL,
	"session_hash" varchar(64) NOT NULL,
	"referrer" text,
	"utm_source" varchar(120),
	"utm_medium" varchar(120),
	"device_type" varchar(20),
	"duration_ms" integer,
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"template_id" uuid,
	"content_version" integer DEFAULT 1 NOT NULL,
	"published_version_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "resumes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" varchar(40) DEFAULT 'general' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(80),
	"display_name" varchar(120),
	"avatar_asset_id" uuid,
	"plan" varchar(20) DEFAULT 'free' NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_sections" ADD CONSTRAINT "resume_sections_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_visits" ADD CONSTRAINT "resume_visits_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "custom_domains" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resume_sections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resume_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resume_visits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resumes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "assets" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "audit_logs" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "custom_domains" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "resume_sections" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "resume_versions" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "resume_visits" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "resumes" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "templates" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON TABLE "users" FROM anon, authenticated;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    lower(NEW.email),
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;--> statement-breakpoint
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();