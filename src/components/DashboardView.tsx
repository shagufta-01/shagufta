import React from 'react';
import {
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  ClipboardCheck,
  CreditCard,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { User, NetworkMode } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  currentUser: User | null;
  setActiveTab: (tab: ActiveTab) => void;
  networkMode: NetworkMode;
  onOpenSyncModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  setActiveTab,
  networkMode,
  onOpenSyncModal,
}) => {
  const isOwner = currentUser?.role === 'owner';
  const jobs = CloudSyncService.getJobs();
  const customers = CloudSyncService.getCustomers();
  const reports = CloudSyncService.getWorkReports();
  const payments = CloudSyncService.getPayments();
  const users = CloudSyncService.getUsers();
  const queue = CloudSyncService.getSyncQueue();

  const activeJobs = jobs.filter((j) => j.status === 'in_progress' || j.status === 'pending');
  const totalBilled = customers.reduce((acc, c) => acc + c.totalBilled, 0);
  const totalOutstanding = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const activeStaffCount = users.filter((u) => u.role === 'staff' && u.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                {isOwner ? 'Executive Owner Control' : 'Staff Operations Portal'}
              </span>
              <span className="text-xs text-slate-400 font-mono">MAT-OPS-2026</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight">
              Welcome back, {currentUser?.name}
            </h2>
            <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
              مؤسسة مدار التأسيس • نظام إدارة المشاريع والعمليات المركزية السحابية
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('jobs')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>View Service Jobs</span>
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('staff')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manage Staff</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-xl space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Active Service Jobs</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeJobs.length}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{jobs.length} total projects</span>
            <span className="text-cyan-400 font-medium">View jobs &rarr;</span>
          </div>
        </div>

        {/* Staff / Personnel */}
        <div
          onClick={() => isOwner && setActiveTab('staff')}
          className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 ${
            isOwner ? 'hover:border-slate-700 cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Authorized Staff</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeStaffCount} Active</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{users.length} enrolled profiles</span>
            {isOwner ? <span className="text-amber-400 font-medium">Manage &rarr;</span> : <span>Restricted</span>}
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div
          onClick={() => setActiveTab('customers')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-xl space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-semibold">Outstanding Balances</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            SAR {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{customers.length} client accounts</span>
            <span className="text-emerald-400 font-medium">Clients &rarr;</span>
          </div>
        </div>

        {/* Confidential P&L Card (Owner only or Locked badge) */}
        {isOwner ? (
          <div
            onClick={() => setActiveTab('profit_loss')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all shadow-xl space-y-2"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-bold text-amber-400">2026 Net Profit (Owner)</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">SAR 350,000</div>
            <div className="text-[11px] text-amber-300/80 flex items-center justify-between font-medium">
              <span>Margin: 30.57%</span>
              <span>Financials &rarr;</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-2 opacity-75">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] uppercase font-semibold">Company Financials</span>
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-lg font-bold text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500/70" />
              <span>Owner Access Only</span>
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              RLS Policy restricts P&L reporting strictly to Owner sessions.
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Active Jobs & Cloud Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Service Requests */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Priority Active Service Dispatches</span>
            </h3>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              View All ({jobs.length})
            </button>
          </div>

          <div className="space-y-2">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {job.jobCode}
                    </span>
                    <span className="font-bold text-slate-100">{job.title}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-3">
                    <span>{job.customerName}</span>
                    <span>•</span>
                    <span className="text-cyan-300">{job.assignedStaffName}</span>
                    <span>•</span>
                    <span>Target: {job.scheduledDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 font-semibold text-[10px] uppercase">
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Quick Operations Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setActiveTab('reports')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-left transition-all"
              >
                <ClipboardCheck className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="font-semibold text-xs text-slate-200">Submit Report</div>
                <div className="text-[10px] text-slate-400">Daily field check</div>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-left transition-all"
              >
                <CreditCard className="w-4 h-4 text-amber-400 mb-1" />
                <div className="font-semibold text-xs text-slate-200">Log Payment</div>
                <div className="text-[10px] text-slate-400">Receipt voucher</div>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-left transition-all"
              >
                <Building2 className="w-4 h-4 text-cyan-400 mb-1" />
                <div className="font-semibold text-xs text-slate-200">New Client</div>
                <div className="text-[10px] text-slate-400">Add company</div>
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-left transition-all"
              >
                <Plus className="w-4 h-4 text-purple-400 mb-1" />
                <div className="font-semibold text-xs text-slate-200">Dispatch Job</div>
                <div className="text-[10px] text-slate-400">Assign engineer</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cloud Sync Health & Central Database */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Central Cloud Sync Status</span>
              </div>
              <button
                onClick={onOpenSyncModal}
                className="text-[10px] text-amber-400 hover:underline font-semibold"
              >
                Details &rarr;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Network State:</span>
                <span className="font-bold capitalize flex items-center gap-1">
                  {networkMode === 'online' && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                  {networkMode === 'slow' && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                  {networkMode === 'offline' && <span className="w-2 h-2 rounded-full bg-rose-400"></span>}
                  <span className={networkMode === 'online' ? 'text-emerald-400' : 'text-amber-400'}>
                    {networkMode}
                  </span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Pending Local Queue:</span>
                <span className={`font-bold ${queue.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {queue.length} records
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-400">Backend:</span>
                <span className="font-mono text-emerald-400 text-[11px]">Supabase PostgreSQL</span>
              </div>
            </div>

            <button
              onClick={onOpenSyncModal}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Offline Queue & Sync</span>
            </button>
          </div>

          {/* Security & Access Guarantee Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-xs space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Access Control</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Active Session: <strong className="text-slate-200">{currentUser?.name}</strong>.
              {isOwner
                ? ' Full administrative authorization enabled. You can add, activate, deactivate, or delete staff members at any time.'
                : ' Staff authorization active. Financial P&L statements and staff administrative permissions are restricted.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
