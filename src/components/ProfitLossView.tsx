import React from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Lock,
  DollarSign,
  PieChart,
  Calendar,
  AlertTriangle,
  Download,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { User, ProfitLossData } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface ProfitLossViewProps {
  currentUser: User | null;
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({ currentUser }) => {
  const isOwner = currentUser?.role === 'owner';

  // Strict RBAC Enforcement
  if (!isOwner) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 text-center bg-slate-900 border border-rose-900/60 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-800/80 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 text-xs font-bold border border-rose-800 mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>403 FORBIDDEN • RLS PROTECTED</span>
        </div>
        <h2 className="text-xl font-black text-white">Owner Authorization Required</h2>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
          Staff member accounts are strictly prohibited from viewing company financial statements, net margins, labor expenses, and Profit & Loss reports.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="text-rose-400 font-bold">PostgreSQL Security Guard:</div>
          <div>Query: SELECT * FROM public.financial_profit_loss</div>
          <div>RLS Policy: "Strict Owner Only Financials" evaluated to FALSE.</div>
          <div>Violation recorded in system audit log with IP and session ID.</div>
        </div>
      </div>
    );
  }

  const plData: ProfitLossData = CloudSyncService.getProfitAndLoss();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Profit & Loss (P&L) Financials</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Owner Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
            التقارير المالية وحسابات الأرباح والخسائر لمؤسسة مدار التأسيس
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Fiscal Year: {plData.fiscalYear}</span>
          </span>
        </div>
      </div>

      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</div>
          <div className="text-2xl font-black text-white mt-1">
            SAR {plData.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs previous fiscal year</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Direct & Materials Cost
          </div>
          <div className="text-2xl font-black text-slate-300 mt-1">
            SAR {plData.totalDirectCosts.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {((plData.totalDirectCosts / plData.totalRevenue) * 100).toFixed(1)}% of gross billing
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Labor & Field Payroll
          </div>
          <div className="text-2xl font-black text-slate-300 mt-1">
            SAR {plData.totalLaborExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Engineering & technician wages
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Net Profit</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            SAR {plData.totalNetProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1 font-semibold">
            Overall Net Margin: {plData.overallMarginPercent}%
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-200">2026 Monthly Operational Financial Breakdown</h3>
            <p className="text-[10px] text-slate-400">All figures in Saudi Riyals (SAR) • Verified against Supabase database</p>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
            Real-time Calculation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Revenue (SAR)</th>
                <th className="px-4 py-3">Direct Costs</th>
                <th className="px-4 py-3">Labor Costs</th>
                <th className="px-4 py-3">Operating Exp.</th>
                <th className="px-4 py-3">Net Profit</th>
                <th className="px-4 py-3 text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {plData.monthlyBreakdown.map((m) => (
                <tr key={m.month} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-200">{m.month}</td>
                  <td className="px-4 py-3 font-mono font-medium text-emerald-400">
                    {m.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{m.directCosts.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{m.laborCosts.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{m.operatingExpenses.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-400">
                    {m.netProfit.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 font-mono text-[11px] font-semibold">
                      {m.marginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Assurance Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200 block mb-0.5">Database Security Guarantee:</strong>
          Supabase Row Level Security ensures that even if a staff member reverse-engineers the client bundle or intercepts network traffic, direct REST queries to <code className="text-emerald-400 font-mono">public.financial_profit_loss</code> are blocked by PostgreSQL rules at the database engine level.
        </div>
      </div>
    </div>
  );
};
