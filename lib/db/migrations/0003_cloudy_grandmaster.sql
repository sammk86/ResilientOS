CREATE TABLE "assessment_progress" (
	"assessment_id" integer NOT NULL,
	"domain_id" integer DEFAULT 0 NOT NULL,
	"control_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'not_started',
	"completed_date" timestamp,
	"notes" text,
	"assigned_to_user_id" integer,
	CONSTRAINT "assessment_progress_assessment_id_domain_id_control_id_pk" PRIMARY KEY("assessment_id","domain_id","control_id")
);
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"assessment_id" integer PRIMARY KEY NOT NULL,
	"overall_score" integer,
	"overall_compliance" integer,
	"total_domains" integer DEFAULT 0,
	"total_controls" integer DEFAULT 0,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"results_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_name" varchar(255) NOT NULL,
	"type" varchar(50),
	"description" text,
	"framework_id" integer,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'created',
	"progress" integer DEFAULT 0,
	"assigned_date" timestamp DEFAULT now() NOT NULL,
	"started_date" timestamp,
	"due_date" timestamp,
	"completed_date" timestamp,
	"assigner_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"framework_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"parent_domain_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "frameworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisation_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"version" varchar(50),
	"type" varchar(50) DEFAULT 'standard',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisation_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"parent_category_id" integer,
	"color" varchar(20) DEFAULT '#808080',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_register" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisation_id" integer NOT NULL,
	"risk_universe_id" integer NOT NULL,
	"risk_name" varchar(255) NOT NULL,
	"description" text,
	"category_id" integer,
	"likelihood" integer DEFAULT 1,
	"impact" integer DEFAULT 1,
	"risk_score" integer,
	"inherent_likelihood" integer,
	"inherent_impact" integer,
	"inherent_risk_score" integer,
	"residual_likelihood" integer,
	"residual_impact" integer,
	"residual_risk_score" integer,
	"status" varchar(20) DEFAULT 'open',
	"strategy" varchar(50),
	"owner_user_id" integer,
	"next_review_date" timestamp,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"risk_register_id" integer NOT NULL,
	"review_date" timestamp DEFAULT now() NOT NULL,
	"reviewed_by_user_id" integer NOT NULL,
	"review_type" varchar(20) NOT NULL,
	"severity_before" varchar(20),
	"severity_after" varchar(20),
	"likelihood_before" varchar(20),
	"likelihood_after" varchar(20),
	"impact_before" varchar(20),
	"impact_after" varchar(20),
	"risk_score_before" integer,
	"risk_score_after" integer,
	"status_before" varchar(20),
	"status_after" varchar(20),
	"review_notes" text NOT NULL,
	"action_items" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_treatments" (
	"id" serial PRIMARY KEY NOT NULL,
	"risk_register_id" integer NOT NULL,
	"treatment_type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"assigned_to_user_id" integer,
	"due_date" timestamp,
	"completion_date" timestamp,
	"effectiveness_rating" integer,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_universe" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisation_id" integer NOT NULL,
	"assessment_id" integer NOT NULL,
	"framework_id" integer NOT NULL,
	"framework_name" varchar(255) NOT NULL,
	"assessment_name" varchar(255) NOT NULL,
	"control_id" integer NOT NULL,
	"control_code" varchar(50) NOT NULL,
	"control_name" varchar(255) NOT NULL,
	"domain_id" integer,
	"risk_description" text NOT NULL,
	"risk_type" varchar(50),
	"status" varchar(20) DEFAULT 'identified',
	"date_identified" timestamp DEFAULT now() NOT NULL,
	"published_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_framework_access" (
	"user_id" integer NOT NULL,
	"framework_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "user_framework_access_user_id_framework_id_pk" PRIMARY KEY("user_id","framework_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"theme" varchar(20) DEFAULT 'light',
	"notifications_enabled" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "controls" ADD COLUMN "framework_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "controls" ADD COLUMN "original_id" varchar(255);--> statement-breakpoint
ALTER TABLE "controls" ADD COLUMN "category" varchar(100);--> statement-breakpoint
ALTER TABLE "controls" ADD COLUMN "status" varchar(20) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "controls" ADD COLUMN "domain_id" integer;--> statement-breakpoint
ALTER TABLE "assessment_progress" ADD CONSTRAINT "assessment_progress_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_progress" ADD CONSTRAINT "assessment_progress_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assigner_id_users_id_fk" FOREIGN KEY ("assigner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frameworks" ADD CONSTRAINT "frameworks_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_categories" ADD CONSTRAINT "risk_categories_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_risk_universe_id_risk_universe_id_fk" FOREIGN KEY ("risk_universe_id") REFERENCES "public"."risk_universe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_category_id_risk_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."risk_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_reviews" ADD CONSTRAINT "risk_reviews_risk_register_id_risk_register_id_fk" FOREIGN KEY ("risk_register_id") REFERENCES "public"."risk_register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_reviews" ADD CONSTRAINT "risk_reviews_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_treatments" ADD CONSTRAINT "risk_treatments_risk_register_id_risk_register_id_fk" FOREIGN KEY ("risk_register_id") REFERENCES "public"."risk_register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_treatments" ADD CONSTRAINT "risk_treatments_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_treatments" ADD CONSTRAINT "risk_treatments_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_universe" ADD CONSTRAINT "risk_universe_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_universe" ADD CONSTRAINT "risk_universe_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_universe" ADD CONSTRAINT "risk_universe_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_universe" ADD CONSTRAINT "risk_universe_control_id_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."controls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_universe" ADD CONSTRAINT "risk_universe_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_universe" ADD CONSTRAINT "risk_universe_published_by_user_id_users_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_framework_access" ADD CONSTRAINT "user_framework_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_framework_access" ADD CONSTRAINT "user_framework_access_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assessment_progress_assessment_id" ON "assessment_progress" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "idx_assessments_user_id" ON "assessments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_assessments_framework_id" ON "assessments" USING btree ("framework_id");--> statement-breakpoint
CREATE INDEX "idx_assessments_status" ON "assessments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_risk_register_organisation_id" ON "risk_register" USING btree ("organisation_id");--> statement-breakpoint
CREATE INDEX "idx_risk_register_risk_universe_id" ON "risk_register" USING btree ("risk_universe_id");--> statement-breakpoint
CREATE INDEX "idx_risk_register_owner_user_id" ON "risk_register" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "idx_risk_register_next_review_date" ON "risk_register" USING btree ("next_review_date");--> statement-breakpoint
CREATE INDEX "idx_risk_reviews_risk_register_id" ON "risk_reviews" USING btree ("risk_register_id");--> statement-breakpoint
CREATE INDEX "idx_risk_reviews_review_date" ON "risk_reviews" USING btree ("review_date");--> statement-breakpoint
CREATE INDEX "idx_risk_treatments_risk_register_id" ON "risk_treatments" USING btree ("risk_register_id");--> statement-breakpoint
CREATE INDEX "idx_risk_treatments_status" ON "risk_treatments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_risk_treatments_assigned_to_user_id" ON "risk_treatments" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "idx_risk_universe_organisation_id" ON "risk_universe" USING btree ("organisation_id");--> statement-breakpoint
CREATE INDEX "idx_risk_universe_control_id" ON "risk_universe" USING btree ("control_id");--> statement-breakpoint
CREATE INDEX "idx_user_framework_access_user_id" ON "user_framework_access" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "controls" ADD CONSTRAINT "controls_framework_id_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."frameworks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controls" ADD CONSTRAINT "controls_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_controls_framework_id" ON "controls" USING btree ("framework_id");--> statement-breakpoint
CREATE INDEX "idx_controls_domain_id" ON "controls" USING btree ("domain_id");