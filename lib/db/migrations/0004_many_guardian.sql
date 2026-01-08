ALTER TABLE "risk_register" ADD COLUMN "scope" varchar(20) DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "risk_register" ADD COLUMN "asset_id" integer;--> statement-breakpoint
ALTER TABLE "risk_register" ADD COLUMN "process_id" integer;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register" ADD CONSTRAINT "risk_register_process_id_business_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."business_processes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_risk_register_asset_id" ON "risk_register" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_risk_register_process_id" ON "risk_register" USING btree ("process_id");