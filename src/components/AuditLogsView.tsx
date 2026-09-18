import React, { useState } from 'react';
import {
  FileText,
  Shield,
  Search,
  Filter,
  UserCheck,
  UserX,
  KeyRound,
  LogIn,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Lock,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { AuditLog, AuditAction, User } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface AuditLogsViewProps {
  currentUser: User | null;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ currentUser }) => {
  const isOwner = currentUser?.role === 'owner';
  const logs = CloudSyncService.getAuditLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  if (!isOwner) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 my-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Owner Authorization Required</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          System audit logs containing security events and employee access records are restricted to the Owner.
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetUser && log.targetUser.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.ipAddress.includes(searchQuery);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'user_created':
        return { label: 'User Created', bg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80', icon: UserCheck };
      case 'otp_sent':
        return { label: 'OTP Dispatched', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/80', icon: KeyRound };
      case 'otp_verified':
        return { label: 'OTP Verified', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80', icon: KeyRound };
      case 'login':
        return { label: 'Session Login', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80', icon: LogIn };
      case 'logout':
        return { label: 'Session Logout', bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: LogOut };
      case 'user_activated':
        return { label: 'Account Activated', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80', icon: UserCheck };
      case 'user_deactivated':
        return { label: 'Account Deactivated', bg: 'bg-rose-950/60 text-rose-300 border-rose-800/80', icon: UserX };
      case 'user_removed':
        return { label: 'Account Removed', bg: 'bg-rose-950/60 text-rose-300 border-rose-800/80', icon: UserX };
      case 'permissions_changed':
        return { label: 'Permissions Changed', bg: 'bg-purple-950/60 text-purple-300 border-purple-800/80', icon: Shield };
      case 'data_synced':
        return { label: 'Cloud Synced', bg: 'bg-blue-950/60 text-blue-300 border-blue-800/80', icon: RefreshCw };
      case 'offline_queued':
        return { label: 'Offline Queued', bg: 'bg-amber-950/60 text-amber-300 border-amber-800/80', icon: RefreshCw };
      case 'unauthorized_access_attempt':
        return { label: 'Access Blocked', bg: 'bg-rose-950/80 text-rose-400 border-rose-800', icon: AlertTriangle };
      default:
        return { label: action, bg: 'bg-slate-800 text-slate-300 border-slate-700', icon: FileText };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Enterprise Security & Audit Trail</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
            سجل المراقبة والعمليات الأمنية وحركات تسجيل الدخول وتغيير الصلاحيات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            Total Logged Events: <strong className="text-white">{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail, actor, or IP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Audit Actions</option>
            <option value="user_created">User Created</option>
            <option value="otp_sent">OTP Dispatched</option>
            <option value="otp_verified">OTP Verified</option>
            <option value="login">Login Events</option>
            <option value="logout">Logout Events</option>
            <option value="user_activated">Account Activated</option>
            <option value="user_deactivated">Account Deactivated</option>
            <option value="user_removed">Account Removed</option>
            <option value="permissions_changed">Permission Changes</option>
            <option value="data_synced">Data Synced</option>
            <option value="unauthorized_access_attempt">Security Violations</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Actor / Performer</th>
                <th className="px-4 py-3">Target Subject</th>
                <th className="px-4 py-3">Event Details</th>
                <th className="px-4 py-3">Client Device & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No audit records match the filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const date = new Date(log.timestamp);

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        <div>{date.toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{date.toLocaleTimeString()}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-sans font-semibold ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-sans">
                        <div className="font-semibold text-slate-200">{log.performedBy.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{log.performedBy.role}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-sans">
                        {log.targetUser ? (
                          <div>
                            <div className="text-slate-200 font-medium">{log.targetUser.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.targetUser.mobile}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-sans text-slate-300 max-w-xs">
                        <span className="leading-relaxed">{log.details}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-slate-400">
                        <div>{log.device}</div>
                        <div className="text-cyan-400 font-mono mt-0.5">{log.ipAddress}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
