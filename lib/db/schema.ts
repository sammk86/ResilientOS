import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  jsonb,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  isConfirmed: boolean('is_confirmed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const organisations = pgTable('organisations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const organisationMembers = pgTable('organisation_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  organisationId: integer('organisation_id')
    .notNull()
    .references(() => organisations.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id')
    .notNull()
    .references(() => organisations.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id')
    .notNull()
    .references(() => organisations.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// --- User Settings ---
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 20 }).default('light'),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// --- Governance ---

export const policies = pgTable('policies', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content'), // Markdown content (for simple policies)
  status: varchar('status', { length: 20 }).default('draft'), // draft, review, approved, published, archived
  version: varchar('version', { length: 20 }).default('1.0'),
  isTemplate: boolean('is_template').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  authorId: integer('author_id').references(() => users.id),
});

export const policySections = pgTable('policy_sections', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').notNull().references(() => policies.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'), // HTML or Markdown
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const policyReviews = pgTable('policy_reviews', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').notNull().references(() => policies.id, { onDelete: 'cascade' }),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).default('pending'), // pending, approved, rejected
  comments: text('comments'),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  respondedAt: timestamp('responded_at'),
});

// --- Frameworks & Controls (Enhanced) ---

export const frameworks = pgTable('frameworks', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 50 }),
  type: varchar('type', { length: 50 }).default('standard'), // 'standard', 'custom'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const domains = pgTable('domains', {
  id: serial('id').primaryKey(),
  frameworkId: integer('framework_id').notNull().references(() => frameworks.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').default(0),
  parentDomainId: integer('parent_domain_id'), // For sub-domains
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const controls = pgTable('controls', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  frameworkId: integer('framework_id').notNull().references(() => frameworks.id, { onDelete: 'cascade' }),
  framework: varchar('framework', { length: 50 }), // Deprecated, kept for migration compatibility
  code: varchar('code', { length: 50 }).notNull(), // e.g., "5.1"
  originalId: varchar('original_id', { length: 255 }), // Keep ID from original source if imported
  name: varchar('name', { length: 255 }).notNull(), // Renamed from current schema 'name' to match functionality, though kept 'name' key
  category: varchar('category', { length: 100 }),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('active'),
  domainId: integer('domain_id').references(() => domains.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  frameworkIdIdx: index('idx_controls_framework_id').on(table.frameworkId),
  domainIdIdx: index('idx_controls_domain_id').on(table.domainId),
}));

export const policyControls = pgTable('policy_controls', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').notNull().references(() => policies.id),
  controlId: integer('control_id').notNull().references(() => controls.id),
});

export const userFrameworkAccess = pgTable('user_framework_access', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  frameworkId: integer('framework_id').notNull().references(() => frameworks.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.frameworkId] }),
  userIdIdx: index('idx_user_framework_access_user_id').on(table.userId),
}));

// --- Assessments ---

export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  assessmentName: varchar('assessment_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }), // 'self_assessment', 'audit', etc.
  description: text('description'),
  frameworkId: integer('framework_id').references(() => frameworks.id, { onDelete: 'set null' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('created'), // created, in_progress, review, completed
  progress: integer('progress').default(0),
  assignedDate: timestamp('assigned_date').notNull().defaultNow(),
  startedDate: timestamp('started_date'),
  dueDate: timestamp('due_date'),
  completedDate: timestamp('completed_date'),
  assignerId: integer('assigner_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  scope: varchar('scope', { length: 50 }).default('organisation'),
  assetId: integer('asset_id').references(() => assets.id, { onDelete: 'set null' }),
  processId: integer('process_id').references(() => businessProcesses.id, { onDelete: 'set null' }),

}, (table) => ({
  userIdIdx: index('idx_assessments_user_id').on(table.userId),
  frameworkIdIdx: index('idx_assessments_framework_id').on(table.frameworkId),
  statusIdx: index('idx_assessments_status').on(table.status),
}));

export const assessmentProgress = pgTable('assessment_progress', {
  assessmentId: integer('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  domainId: integer('domain_id').notNull().default(0), // Can be 0 if no specific domain
  controlId: integer('control_id').notNull(),
  status: varchar('status', { length: 20 }).default('not_started'),
  completedDate: timestamp('completed_date'),
  notes: text('notes'),
  assignedToUserId: integer('assigned_to_user_id').references(() => users.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.assessmentId, table.domainId, table.controlId] }),
  assessmentIdIdx: index('idx_assessment_progress_assessment_id').on(table.assessmentId),
}));

export const assessmentResults = pgTable('assessment_results', {
  assessmentId: integer('assessment_id').primaryKey().references(() => assessments.id, { onDelete: 'cascade' }),
  overallScore: integer('overall_score'),
  overallCompliance: integer('overall_compliance'),
  totalDomains: integer('total_domains').default(0),
  totalControls: integer('total_controls').default(0),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
  resultsData: jsonb('results_data'),
});

// --- Risk Management ---

export const riskCategories = pgTable('risk_categories', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  parentCategoryId: integer('parent_category_id'),
  color: varchar('color', { length: 20 }).default('#808080'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const riskUniverse = pgTable('risk_universe', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  assessmentId: integer('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  frameworkId: integer('framework_id').notNull().references(() => frameworks.id, { onDelete: 'cascade' }),
  frameworkName: varchar('framework_name', { length: 255 }).notNull(),
  assessmentName: varchar('assessment_name', { length: 255 }).notNull(),
  controlId: integer('control_id').notNull().references(() => controls.id, { onDelete: 'cascade' }),
  controlCode: varchar('control_code', { length: 50 }).notNull(),
  controlName: varchar('control_name', { length: 255 }).notNull(),
  domainId: integer('domain_id').references(() => domains.id, { onDelete: 'set null' }),
  riskDescription: text('risk_description').notNull(),
  riskType: varchar('risk_type', { length: 50 }),
  status: varchar('status', { length: 20 }).default('identified'),
  dateIdentified: timestamp('date_identified').notNull().defaultNow(),
  publishedByUserId: integer('published_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  organisationIdIdx: index('idx_risk_universe_organisation_id').on(table.organisationId),
  controlIdIdx: index('idx_risk_universe_control_id').on(table.controlId),
}));

export const riskRegister = pgTable('risk_register', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id, { onDelete: 'cascade' }),
  riskUniverseId: integer('risk_universe_id').notNull().references(() => riskUniverse.id, { onDelete: 'cascade' }),
  riskName: varchar('risk_name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => riskCategories.id), // Link to RiskCategory
  likelihood: integer('likelihood').default(1), // 1-5
  impact: integer('impact').default(1), // 1-5
  riskScore: integer('risk_score'), // Calculated
  inherentLikelihood: integer('inherent_likelihood'),
  inherentImpact: integer('inherent_impact'),
  inherentRiskScore: integer('inherent_risk_score'),
  residualLikelihood: integer('residual_likelihood'),
  residualImpact: integer('residual_impact'),
  residualRiskScore: integer('residual_risk_score'),
  status: varchar('status', { length: 20 }).default('open'), // open, mitigated, closed, accepted
  strategy: varchar('strategy', { length: 50 }), // mitigate, transfer, accept, avoid
  ownerUserId: integer('owner_user_id').references(() => users.id), // Risk Owner
  nextReviewDate: timestamp('next_review_date'),

  // Scoping & Connections
  scope: varchar('scope', { length: 20 }).default('system'), // 'system', 'asset', 'process'
  assetId: integer('asset_id').references(() => assets.id, { onDelete: 'set null' }),
  processId: integer('process_id').references(() => businessProcesses.id, { onDelete: 'set null' }),

  createdByUserId: integer('created_by_user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  organisationIdIdx: index('idx_risk_register_organisation_id').on(table.organisationId),
  riskUniverseIdIdx: index('idx_risk_register_risk_universe_id').on(table.riskUniverseId),
  ownerUserIdIdx: index('idx_risk_register_owner_user_id').on(table.ownerUserId),
  nextReviewDateIdx: index('idx_risk_register_next_review_date').on(table.nextReviewDate),
  assetIdIdx: index('idx_risk_register_asset_id').on(table.assetId),
  processIdIdx: index('idx_risk_register_process_id').on(table.processId),
}));

export const riskAssets = pgTable('risk_assets', {
  riskRegisterId: integer('risk_register_id').notNull().references(() => riskRegister.id, { onDelete: 'cascade' }),
  assetId: integer('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.riskRegisterId, table.assetId] }),
}));

export const riskProcesses = pgTable('risk_processes', {
  riskRegisterId: integer('risk_register_id').notNull().references(() => riskRegister.id, { onDelete: 'cascade' }),
  processId: integer('process_id').notNull().references(() => businessProcesses.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.riskRegisterId, table.processId] }),
}));

export const riskTreatments = pgTable('risk_treatments', {
  id: serial('id').primaryKey(),
  riskRegisterId: integer('risk_register_id').notNull().references(() => riskRegister.id, { onDelete: 'cascade' }),
  treatmentType: varchar('treatment_type', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('planned'),
  assignedToUserId: integer('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
  dueDate: timestamp('due_date'),
  completionDate: timestamp('completion_date'),
  effectivenessRating: integer('effectiveness_rating'),
  createdByUserId: integer('created_by_user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  riskRegisterIdIdx: index('idx_risk_treatments_risk_register_id').on(table.riskRegisterId),
  statusIdx: index('idx_risk_treatments_status').on(table.status),
  assignedToUserIdIdx: index('idx_risk_treatments_assigned_to_user_id').on(table.assignedToUserId),
}));

export const riskReviews = pgTable('risk_reviews', {
  id: serial('id').primaryKey(),
  riskRegisterId: integer('risk_register_id').notNull().references(() => riskRegister.id, { onDelete: 'cascade' }),
  reviewDate: timestamp('review_date').notNull().defaultNow(),
  reviewedByUserId: integer('reviewed_by_user_id').notNull().references(() => users.id),
  reviewType: varchar('review_type', { length: 20 }).notNull(),
  severityBefore: varchar('severity_before', { length: 20 }),
  severityAfter: varchar('severity_after', { length: 20 }),
  likelihoodBefore: varchar('likelihood_before', { length: 20 }),
  likelihoodAfter: varchar('likelihood_after', { length: 20 }),
  impactBefore: varchar('impact_before', { length: 20 }),
  impactAfter: varchar('impact_after', { length: 20 }),
  riskScoreBefore: integer('risk_score_before'),
  riskScoreAfter: integer('risk_score_after'),
  statusBefore: varchar('status_before', { length: 20 }),
  statusAfter: varchar('status_after', { length: 20 }),
  reviewNotes: text('review_notes').notNull(),
  actionItems: text('action_items'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  riskRegisterIdIdx: index('idx_risk_reviews_risk_register_id').on(table.riskRegisterId),
  reviewDateIdx: index('idx_risk_reviews_review_date').on(table.reviewDate),
}));

// --- Legacy Risk Tables (Optional/Deprecated or Helper) ---

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }),
  criticality: varchar('criticality', { length: 20 }),
  owner: varchar('owner', { length: 100 }),
  description: text('description'),
  recoveryTimeObjective: varchar('recovery_time_objective', { length: 20 }), // e.g. "4h", "24h"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const threats = pgTable('threats', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const risks = pgTable('risks', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  assetId: integer('asset_id').references(() => assets.id),
  threatId: integer('threat_id').references(() => threats.id),
  description: text('description'),
  likelihood: integer('likelihood').notNull().default(1),
  impact: integer('impact').notNull().default(1),
  status: varchar('status', { length: 20 }).default('open'),
  mitigationStrategy: text('mitigation_strategy'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// --- BIA ---

export const businessProcesses = pgTable('business_processes', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  rto: varchar('rto', { length: 20 }),
  rpo: varchar('rpo', { length: 20 }),
  priority: varchar('priority', { length: 20 }),
  owner: varchar('owner', { length: 100 }),
  // New Impact Fields
  financialImpact: text('financial_impact'), // JSON or structured text
  downtimeCostPerHour: integer('downtime_cost_per_hour').default(0),
  recoveryCostFixed: integer('recovery_cost_fixed').default(0),
  dataClassification: varchar('data_classification', { length: 50 }).default('financial'), // public, internal, confidential, restricted, financial
  operationalImpact: text('operational_impact'),
  recoveryStrategy: text('recovery_strategy'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const dependencies = pgTable('dependencies', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  processId: integer('process_id').notNull().references(() => businessProcesses.id, { onDelete: 'cascade' }),
  dependentOnAssetId: integer('dependent_on_asset_id').references(() => assets.id),
  dependentOnProcessId: integer('dependent_on_process_id').references(() => businessProcesses.id, { onDelete: 'cascade' }), // New Process-Process Link
  type: varchar('type', { length: 50 }).default('technical'), // technical, data, people, vendor
  notes: text('notes'),
});



export const biaRuns = pgTable('bia_runs', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  name: varchar('name', { length: 255 }).notNull().default('Untitled Analysis'),
  processId: integer('process_id').notNull().references(() => businessProcesses.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, completed
  notes: text('notes'),
  runDate: timestamp('run_date'),
  summaryData: jsonb('summary_data'), // Nullable in draft
  performedBy: varchar('performed_by', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// --- Plans (Runbooks) ---

export const runbooks = pgTable('runbooks', {
  id: serial('id').primaryKey(),
  organisationId: integer('organisation_id').notNull().references(() => organisations.id),
  title: varchar('title', { length: 255 }).notNull(),
  processId: integer('process_id').references(() => businessProcesses.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).default('draft'),
  version: varchar('version', { length: 20 }).default('1.0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const runbookSteps = pgTable('runbook_steps', {
  id: serial('id').primaryKey(),
  runbookId: integer('runbook_id').notNull().references(() => runbooks.id),
  title: varchar('title', { length: 255 }),
  content: text('content'),
  role: varchar('role', { length: 100 }),
  order: integer('order').notNull(),
  estimatedTime: varchar('estimated_time', { length: 20 }),
});


// --- Relations ---

export const organisationsRelations = relations(organisations, ({ many }) => ({
  organisationMembers: many(organisationMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  policies: many(policies),
  controls: many(controls),
  assets: many(assets),
  threats: many(threats),
  risks: many(risks),
  businessProcesses: many(businessProcesses),
  runbooks: many(runbooks),
  frameworks: many(frameworks),
  riskHelperCategories: many(riskCategories),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  organisationMembers: many(organisationMembers),
  invitationsSent: many(invitations),
  settings: one(userSettings),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organisation: one(organisations, {
    fields: [invitations.organisationId],
    references: [organisations.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const organisationMembersRelations = relations(organisationMembers, ({ one }) => ({
  user: one(users, {
    fields: [organisationMembers.userId],
    references: [users.id],
  }),
  organisation: one(organisations, {
    fields: [organisationMembers.organisationId],
    references: [organisations.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  organisation: one(organisations, {
    fields: [activityLogs.organisationId],
    references: [organisations.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [policies.organisationId],
    references: [organisations.id],
  }),
  controls: many(policyControls),
  sections: many(policySections),
  reviews: many(policyReviews),
}));

export const policySectionsRelations = relations(policySections, ({ one }) => ({
  policy: one(policies, {
    fields: [policySections.policyId],
    references: [policies.id],
  }),
}));

export const policyReviewsRelations = relations(policyReviews, ({ one }) => ({
  policy: one(policies, {
    fields: [policyReviews.policyId],
    references: [policies.id],
  }),
  reviewer: one(users, {
    fields: [policyReviews.reviewerId],
    references: [users.id],
  }),
}));

export const frameworksRelations = relations(frameworks, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [frameworks.organisationId],
    references: [organisations.id],
  }),
  domains: many(domains),
  controls: many(controls),
  userAccess: many(userFrameworkAccess),
  assessments: many(assessments),
}));

export const domainsRelations = relations(domains, ({ one, many }) => ({
  framework: one(frameworks, {
    fields: [domains.frameworkId],
    references: [frameworks.id],
  }),
  parentDomain: one(domains, {
    fields: [domains.parentDomainId],
    references: [domains.id],
    relationName: 'parent',
  }),
  subdomains: many(domains, {
    relationName: 'parent',
  }),
  controls: many(controls),
}));

export const controlsRelations = relations(controls, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [controls.organisationId],
    references: [organisations.id],
  }),
  framework: one(frameworks, {
    fields: [controls.frameworkId],
    references: [frameworks.id],
  }),
  domain: one(domains, {
    fields: [controls.domainId],
    references: [domains.id],
  }),
  policies: many(policyControls),
}));

export const policyControlsRelations = relations(policyControls, ({ one }) => ({
  policy: one(policies, {
    fields: [policyControls.policyId],
    references: [policies.id],
  }),
  control: one(controls, {
    fields: [policyControls.controlId],
    references: [controls.id],
  }),
}));

export const userFrameworkAccessRelations = relations(userFrameworkAccess, ({ one }) => ({
  user: one(users, {
    fields: [userFrameworkAccess.userId],
    references: [users.id],
  }),
  framework: one(frameworks, {
    fields: [userFrameworkAccess.frameworkId],
    references: [frameworks.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
  framework: one(frameworks, {
    fields: [assessments.frameworkId],
    references: [frameworks.id],
  }),
  assigner: one(users, {
    fields: [assessments.assignerId],
    references: [users.id],
    relationName: 'assigner',
  }),
  progress: many(assessmentProgress),
  results: one(assessmentResults, {
    fields: [assessments.id],
    references: [assessmentResults.assessmentId],
  }),
}));

export const assessmentProgressRelations = relations(assessmentProgress, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentProgress.assessmentId],
    references: [assessments.id],
  }),
  control: one(controls, {
    fields: [assessmentProgress.controlId],
    references: [controls.id],
  }),
  domain: one(domains, {
    fields: [assessmentProgress.domainId],
    references: [domains.id],
  }),
  assignedToUser: one(users, {
    fields: [assessmentProgress.assignedToUserId],
    references: [users.id],
    relationName: 'assignedProgress',
  }),
}));

export const assessmentResultsRelations = relations(assessmentResults, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentResults.assessmentId],
    references: [assessments.id],
  }),
}));

// Risk Relations

export const riskCategoriesRelations = relations(riskCategories, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [riskCategories.organisationId],
    references: [organisations.id],
  }),
  parentCategory: one(riskCategories, {
    fields: [riskCategories.parentCategoryId],
    references: [riskCategories.id],
    relationName: 'parent',
  }),
  subCategories: many(riskCategories, {
    relationName: 'parent',
  }),
  riskRegisterEntries: many(riskRegister),
}));

export const riskUniverseRelations = relations(riskUniverse, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [riskUniverse.organisationId],
    references: [organisations.id],
  }),
  assessment: one(assessments, {
    fields: [riskUniverse.assessmentId],
    references: [assessments.id],
  }),
  framework: one(frameworks, {
    fields: [riskUniverse.frameworkId],
    references: [frameworks.id],
  }),
  control: one(controls, {
    fields: [riskUniverse.controlId],
    references: [controls.id],
  }),
  domain: one(domains, {
    fields: [riskUniverse.domainId],
    references: [domains.id],
  }),
  publishedBy: one(users, {
    fields: [riskUniverse.publishedByUserId],
    references: [users.id],
    relationName: 'publishedBy',
  }),
  riskRegisterEntries: many(riskRegister),
}));

export const riskRegisterRelations = relations(riskRegister, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [riskRegister.organisationId],
    references: [organisations.id],
  }),
  riskUniverse: one(riskUniverse, {
    fields: [riskRegister.riskUniverseId],
    references: [riskUniverse.id],
  }),
  category: one(riskCategories, {
    fields: [riskRegister.categoryId],
    references: [riskCategories.id],
  }),
  owner: one(users, {
    fields: [riskRegister.ownerUserId],
    references: [users.id],
    relationName: 'riskOwner',
  }),
  asset: one(assets, {
    fields: [riskRegister.assetId],
    references: [assets.id],
  }),
  process: one(businessProcesses, {
    fields: [riskRegister.processId],
    references: [businessProcesses.id],
  }),
  createdBy: one(users, {
    fields: [riskRegister.createdByUserId],
    references: [users.id],
    relationName: 'riskCreatedBy',
  }),
  treatments: many(riskTreatments),
  reviews: many(riskReviews),
  riskAssets: many(riskAssets),
  riskProcesses: many(riskProcesses),
}));

export const riskAssetsRelations = relations(riskAssets, ({ one }) => ({
  risk: one(riskRegister, {
    fields: [riskAssets.riskRegisterId],
    references: [riskRegister.id],
  }),
  asset: one(assets, {
    fields: [riskAssets.assetId],
    references: [assets.id],
  }),
}));

export const riskProcessesRelations = relations(riskProcesses, ({ one }) => ({
  risk: one(riskRegister, {
    fields: [riskProcesses.riskRegisterId],
    references: [riskRegister.id],
  }),
  process: one(businessProcesses, {
    fields: [riskProcesses.processId],
    references: [businessProcesses.id],
  }),
}));

export const riskTreatmentsRelations = relations(riskTreatments, ({ one }) => ({
  riskRegister: one(riskRegister, {
    fields: [riskTreatments.riskRegisterId],
    references: [riskRegister.id],
  }),
  assignedTo: one(users, {
    fields: [riskTreatments.assignedToUserId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [riskTreatments.createdByUserId],
    references: [users.id],
    relationName: 'treatmentCreatedBy',
  }),
}));

export const riskReviewsRelations = relations(riskReviews, ({ one }) => ({
  riskRegister: one(riskRegister, {
    fields: [riskReviews.riskRegisterId],
    references: [riskRegister.id],
  }),
  reviewedBy: one(users, {
    fields: [riskReviews.reviewedByUserId],
    references: [users.id],
  }),
}));

export const risksRelations = relations(risks, ({ one }) => ({
  organisation: one(organisations, {
    fields: [risks.organisationId],
    references: [organisations.id],
  }),
  asset: one(assets, {
    fields: [risks.assetId],
    references: [assets.id],
  }),
  threat: one(threats, {
    fields: [risks.threatId],
    references: [threats.id],
  }),
}));

export const businessProcessesRelations = relations(businessProcesses, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [businessProcesses.organisationId],
    references: [organisations.id],
  }),
  dependencies: many(dependencies, { relationName: 'processDependencies' }),
  inverseDependencies: many(dependencies, { relationName: 'dependentProcess' }), // Dependencies WHERE dependentOnProcessId = this.id
  risks: many(riskRegister),
}));

export const dependenciesRelations = relations(dependencies, ({ one }) => ({
  process: one(businessProcesses, {
    fields: [dependencies.processId],
    references: [businessProcesses.id],
    relationName: 'processDependencies', // outgoing dependencies
  }),
  asset: one(assets, {
    fields: [dependencies.dependentOnAssetId],
    references: [assets.id],
  }),
  dependentProcess: one(businessProcesses, {
    fields: [dependencies.dependentOnProcessId],
    references: [businessProcesses.id],
    relationName: 'dependentProcess', // the process being depended ON
  }),
}));

export const runbooksRelations = relations(runbooks, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [runbooks.organisationId],
    references: [organisations.id],
  }),
  process: one(businessProcesses, {
    fields: [runbooks.processId],
    references: [businessProcesses.id],
  }),
  steps: many(runbookSteps),
}));

export const runbookStepsRelations = relations(runbookSteps, ({ one }) => ({
  runbook: one(runbooks, {
    fields: [runbookSteps.runbookId],
    references: [runbooks.id],
  }),
}));


export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organisation = typeof organisations.$inferSelect;
export type NewOrganisation = typeof organisations.$inferInsert;
export type OrganisationMember = typeof organisationMembers.$inferSelect;
export type NewOrganisationMember = typeof organisationMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type OrganisationDataWithMembers = Organisation & {
  organisationMembers: (OrganisationMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
  invitations?: Pick<Invitation, 'id' | 'email' | 'role' | 'invitedAt' | 'status'>[];
};

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
export type Framework = typeof frameworks.$inferSelect;
export type NewFramework = typeof frameworks.$inferInsert;
export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
export type Control = typeof controls.$inferSelect;
export type NewControl = typeof controls.$inferInsert;
export type UserFrameworkAccess = typeof userFrameworkAccess.$inferSelect;
export type NewUserFrameworkAccess = typeof userFrameworkAccess.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type AssessmentProgress = typeof assessmentProgress.$inferSelect;
export type NewAssessmentProgress = typeof assessmentProgress.$inferInsert;
export type AssessmentResults = typeof assessmentResults.$inferSelect;
export type NewAssessmentResults = typeof assessmentResults.$inferInsert;

export type RiskUniverse = typeof riskUniverse.$inferSelect;
export type NewRiskUniverse = typeof riskUniverse.$inferInsert;
export type RiskCategory = typeof riskCategories.$inferSelect;
export type NewRiskCategory = typeof riskCategories.$inferInsert;
export type RiskRegister = typeof riskRegister.$inferSelect;
export type NewRiskRegister = typeof riskRegister.$inferInsert;
export type RiskTreatment = typeof riskTreatments.$inferSelect;
export type NewRiskTreatment = typeof riskTreatments.$inferInsert;
export type RiskReview = typeof riskReviews.$inferSelect;
export type NewRiskReview = typeof riskReviews.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_ORGANISATION = 'CREATE_ORGANISATION',
  REMOVE_ORGANISATION_MEMBER = 'REMOVE_ORGANISATION_MEMBER',
  INVITE_ORGANISATION_MEMBER = 'INVITE_ORGANISATION_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
