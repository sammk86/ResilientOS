import { db } from '@/lib/db/drizzle';
import {
  riskRegister,
  assessments,
  businessProcesses,
  assets,
  users,
  riskCategories,
  policies,
  runbooks,
  biaRuns
} from '@/lib/db/schema';
import { count, eq, desc, and, ne } from 'drizzle-orm';
import { RiskHeatmap } from '@/components/dashboard/risk-heatmap';
import { BiaSummary } from '@/components/dashboard/bia-summary';
import { AssessmentProgressWidget } from '@/components/dashboard/assessment-progress';
import { RecentActivityWidget, ActivityItem } from '@/components/dashboard/recent-activity';
import { StatCard } from '@/components/dashboard/stat-card';
import { ShieldAlert, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch Data

  // 1. Risks
  const risks = await db.select({
    id: riskRegister.id,
    riskName: riskRegister.riskName,
    likelihood: riskRegister.likelihood,
    impact: riskRegister.impact,
    riskScore: riskRegister.riskScore,
    description: riskRegister.description,
    status: riskRegister.status,
    ownerName: users.name,
    categoryName: riskCategories.name
  })
    .from(riskRegister)
    .leftJoin(users, eq(riskRegister.ownerUserId, users.id))
    .leftJoin(riskCategories, eq(riskRegister.categoryId, riskCategories.id));

  const totalRisks = risks.length;
  // @ts-ignore
  const highRisks = risks.filter(r => (r.riskScore || 0) >= 15).length;
  // @ts-ignore
  const mediumRisks = risks.filter(r => (r.riskScore || 0) >= 8 && (r.riskScore || 0) < 15).length;

  // 2. Assessments
  const activeAssessments = await db.select({
    id: assessments.id,
    name: assessments.assessmentName,
    progress: assessments.progress,
    status: assessments.status,
    dueDate: assessments.dueDate,
    updatedAt: assessments.updatedAt
  })
    .from(assessments)
    .where(ne(assessments.status, 'completed'))
    .orderBy(desc(assessments.updatedAt))
    .limit(5);

  // 3. BIA Data
  const allProcesses = await db.select().from(businessProcesses);
  const totalProcesses = allProcesses.length;
  // Assuming '4h' or less is critical. This is a simple check, could be more robust parsing.
  // @ts-ignore
  const criticalProcesses = allProcesses.filter(p => p.rto === '4h' || p.rto === '1h' || p.rto === '0h').length; // Simplified logic

  const allAssets = await db.select().from(assets);
  const totalAssets = allAssets.length;
  // @ts-ignore
  const criticalAssets = allAssets.filter(a => a.criticality === 'critical').length;

  // 4. Recent Activity
  const recentPolicies = await db.select({
    id: policies.id,
    title: policies.title,
    createdAt: policies.createdAt,
  })
    .from(policies)
    .orderBy(desc(policies.createdAt))
    .limit(5);

  const recentRunbooks = await db.select({
    id: runbooks.id,
    title: runbooks.title,
    createdAt: runbooks.createdAt,
  })
    .from(runbooks)
    .orderBy(desc(runbooks.createdAt))
    .limit(5);

  const recentBiaRuns = await db.select({
    id: biaRuns.id,
    name: biaRuns.name, // using name as title
    createdAt: biaRuns.createdAt,
  })
    .from(biaRuns)
    .orderBy(desc(biaRuns.createdAt))
    .limit(5);

  // Combine and sort
  const allActivities: ActivityItem[] = [
    ...recentPolicies.map((p: typeof recentPolicies[0]) => ({
      id: `policy-${p.id}`,
      type: 'policy' as const,
      title: p.title,
      date: p.createdAt,
      link: `/governance/policies/${p.id}`
    })),
    ...recentRunbooks.map((r: typeof recentRunbooks[0]) => ({
      id: `plan-${r.id}`,
      type: 'plan' as const,
      title: r.title,
      date: r.createdAt,
      link: `/plan/runbooks/${r.id}` // Corrected link based on standard structure, verifying later
    })),
    ...recentBiaRuns.map((b: typeof recentBiaRuns[0]) => ({
      id: `bia-${b.id}`,
      type: 'bia' as const,
      title: b.name,
      date: b.createdAt,
      link: `/bia/analysis/${b.id}`
    })),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 5);


  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Risks"
            value={totalRisks}
            icon={ShieldAlert}
            description={`${highRisks} Critical Risks`}
          />
          <StatCard
            title="Active Assessments"
            value={activeAssessments.length}
            icon={CheckCircle}
          />
          <StatCard
            title="Business Processes"
            value={totalProcesses}
            icon={Activity}
            description={`${criticalProcesses} Critical (RTO < 4h)`}
          />
          <StatCard
            title="Attention Required"
            value={highRisks + criticalProcesses} // Example metric
            icon={AlertTriangle}
            description="Combined Critical Risks & Processes"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

          {/* Main Chart Area: Risk Heatmap (4 cols) */}
          <div className="col-span-4">
            <RiskHeatmap risks={risks} />
          </div>

          {/* Right Side Widgets (3 cols) */}
          <div className="col-span-3 space-y-4">

            {/* Recent Activity */}
            <RecentActivityWidget activities={allActivities} />

            {/* BIA Summary */}
            <BiaSummary
              totalProcesses={totalProcesses}
              criticalProcesses={criticalProcesses}
              totalAssets={totalAssets}
              criticalAssets={criticalAssets}
            />

            {/* Assessment Progress */}
            <AssessmentProgressWidget
              assessments={activeAssessments}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
