CREATE TABLE "bia_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organisation_id" integer NOT NULL,
	"name" varchar(255) DEFAULT 'Untitled Analysis' NOT NULL,
	"process_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"run_date" timestamp,
	"summary_data" jsonb,
	"performed_by" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dependencies" DROP CONSTRAINT "dependencies_process_id_business_processes_id_fk";
--> statement-breakpoint
ALTER TABLE "runbooks" DROP CONSTRAINT "runbooks_process_id_business_processes_id_fk";
--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "scope" varchar(50) DEFAULT 'organisation';--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "asset_id" integer;--> statement-breakpoint
ALTER TABLE "assessments" ADD COLUMN "process_id" integer;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "recovery_time_objective" varchar(20);--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "financial_impact" text;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "downtime_cost_per_hour" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "recovery_cost_fixed" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "data_classification" varchar(50) DEFAULT 'financial';--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "operational_impact" text;--> statement-breakpoint
ALTER TABLE "business_processes" ADD COLUMN "recovery_strategy" text;--> statement-breakpoint
ALTER TABLE "dependencies" ADD COLUMN "dependent_on_process_id" integer;--> statement-breakpoint
ALTER TABLE "dependencies" ADD COLUMN "type" varchar(50) DEFAULT 'technical';--> statement-breakpoint
ALTER TABLE "bia_runs" ADD CONSTRAINT "bia_runs_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bia_runs" ADD CONSTRAINT "bia_runs_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_dependent_on_process_id_business_processes_id_fk" FOREIGN KEY ("dependent_on_process_id") REFERENCES "public"."business_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runbooks" ADD CONSTRAINT "runbooks_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE set null ON UPDATE no action;