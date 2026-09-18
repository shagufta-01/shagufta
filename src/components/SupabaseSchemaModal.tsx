import React, { useState } from 'react';
import {
  X,
  Database,
  Shield,
  Copy,
  Check,
  Code2,
  Table,
  Lock,
  Radio,
  Server,
} from 'lucide-react';
import { CloudSyncService } from '../services/cloudSyncService';

interface SupabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSchemaModal: React.FC<SupabaseSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'tables' | 'rls'>('sql');

  if (!isOpen) return null;

  const sqlScript = CloudSyncService.getPostgreSqlMigrationScript();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tables = [
    { name: 'profiles', records: 4, rls: 'Strict Role Checks', desc: 'Staff directory, permissions, session tokens' },
    { name: 'customers', records: 4, rls: 'Authenticated Staff/Owner', desc: 'Client corporate accounts & balances' },
    { name: 'jobs', records: 4, rls: 'Authenticated Staff/Owner', desc: 'Service dispatch, schedules, priorities' },
    { name: 'work_reports', records: 2, rls: 'Staff Logged Reports', desc: 'Inspection checklists & client sign-offs' },
    { name: 'payments', records: 2, rls: 'Collection Vouchers', desc: 'Receipts, payment methods & references' },
    { name: 'financial_profit_loss', records: 8, rls: 'STRICT OWNER ONLY', desc: 'Revenue, direct costs, net margins (Blocked for staff)' },
    { name: 'audit_logs', records: 5, rls: 'Owner & Auditing', desc: 'Immutable security & session audit trail' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Supabase Cloud & PostgreSQL Database Engine</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  RLS Enforced
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Single Source of Truth for Android and Windows Enterprise Clients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-4 pt-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'sql'
                  ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL Schema & RLS Policies</span>
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'tables'
                  ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Cloud PostgreSQL Tables ({tables.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('rls')}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'rls'
                  ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>RLS Security Architecture</span>
            </button>
          </div>

          {activeTab === 'sql' && (
            <button
              onClick={handleCopy}
              className="mb-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Migration'}</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] text-xs">
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-300 leading-relaxed text-[11px]">
                Copy and run this PostgreSQL script in your Supabase SQL Editor. It automatically sets up the full database schema, foreign keys, row level security (RLS) policies, and realtime broadcast publications.
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed select-all">
                {sqlScript}
              </pre>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="space-y-3">
              <div className="grid gap-2">
                {tables.map((tbl) => (
                  <div
                    key={tbl.name}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-sm font-bold text-amber-400 flex items-center gap-2">
                        <span>public.{tbl.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-sans">
                          {tbl.records} rows synced
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{tbl.desc}</div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                          tbl.rls.includes('OWNER ONLY')
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                        }`}
                      >
                        {tbl.rls}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>Row Level Security (RLS) Policy Rules</span>
                </div>
                <div className="text-slate-300 leading-relaxed space-y-2 text-[11px]">
                  <p>
                    <strong className="text-amber-400">1. Profit & Loss Lockdown:</strong> The table <code className="text-emerald-400">public.financial_profit_loss</code> has RLS policies that match <code className="text-cyan-300">role = 'owner'</code>. Staff tokens querying this table receive zero rows, protecting corporate margins even if the API is directly inspected.
                  </p>
                  <p>
                    <strong className="text-amber-400">2. Staff Deactivation Enforcement:</strong> Every RLS policy asserts <code className="text-cyan-300">status = 'active'</code>. If the Owner deactivates an account, all subsequent queries immediately return permission denied.
                  </p>
                  <p>
                    <strong className="text-amber-400">3. Real-Time Broadcast Subscriptions:</strong> Supabase Realtime emits change CDC payloads to authorized Android and Windows clients over TLS WebSocket channels.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Client Architecture:</span>
                <span className="font-mono text-emerald-400">TLS 1.3 / HTTPS • Supabase JS v2 Client</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Never store Supabase Service Role keys on Android or Windows client devices.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
