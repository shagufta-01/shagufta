import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardCheck,
  CreditCard,
  TrendingUp,
  FileText,
  Lock,
  RefreshCw,
  Building2,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'staff'
  | 'customers'
  | 'jobs'
  | 'reports'
  | 'payments'
  | 'profit_loss'
  | 'audit_logs'
  | 'sync_status'
  | 'supabase';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  pendingSyncCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  pendingSyncCount,
}) => {
  const isOwner = currentUser?.role === 'owner';

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Operations Dashboard',
      arLabel: 'لوحة العمليات الرئيسية',
      icon: LayoutDashboard,
      ownerOnly: false,
    },
    {
      id: 'staff' as ActiveTab,
      label: 'Staff Access & Roles',
      arLabel: 'إدارة الموظفين والصلاحيات',
      icon: Users,
      ownerOnly: true,
      badge: 'Owner Only',
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customer Accounts',
      arLabel: 'دليل العملاء والشركات',
      icon: Building2,
      ownerOnly: false,
    },
    {
      id: 'jobs' as ActiveTab,
      label: 'Service Requests & Jobs',
      arLabel: 'طلبات الخدمة والمشاريع',
      icon: Briefcase,
      ownerOnly: false,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Field Work Reports',
      arLabel: 'تقارير الإنجاز الميدانية',
      icon: ClipboardCheck,
      ownerOnly: false,
    },
    {
      id: 'payments' as ActiveTab,
      label: 'Payments & Receipts',
      arLabel: 'المقبوضات وسندات الصرف',
      icon: CreditCard,
      ownerOnly: false,
    },
    {
      id: 'profit_loss' as ActiveTab,
      label: 'Profit & Loss (P&L)',
      arLabel: 'الأرباح والخسائر والمالية',
      icon: TrendingUp,
      ownerOnly: true,
      badge: 'Confidential',
      lockedForStaff: true,
    },
    {
      id: 'audit_logs' as ActiveTab,
      label: 'System Audit Trail',
      arLabel: 'سجلات الرقابة والأمان',
      icon: FileText,
      ownerOnly: true,
      badge: 'Security',
      lockedForStaff: true,
    },
    {
      id: 'sync_status' as ActiveTab,
      label: 'Cloud Sync & Queue',
      arLabel: 'مزامنة السحابة وحالة الاتصال',
      icon: RefreshCw,
      ownerOnly: false,
      counter: pendingSyncCount,
    },
    {
      id: 'supabase' as ActiveTab,
      label: 'Supabase PostgreSQL Hub',
      arLabel: 'قاعدة البيانات المركزية RLS',
      icon: Database,
      ownerOnly: false,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Enterprise Modules</span>
          <span className="text-amber-400 font-semibold">{isOwner ? 'Owner Mode' : 'Staff Mode'}</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = item.ownerOnly && !isOwner;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group relative ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : isLocked
                  ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 opacity-75'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-slate-950' : isLocked ? 'text-slate-400' : 'text-slate-300'
                  }`}
                />
                <div className="truncate">
                  <div className="truncate leading-snug">{item.label}</div>
                  <div
                    className={`text-[9px] truncate font-['Tajawal'] ${
                      isActive ? 'text-slate-900/80' : 'text-slate-400'
                    }`}
                  >
                    {item.arLabel}
                  </div>
                </div>
              </div>

              {/* Badges / Locks / Counters */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                {isLocked && (
                  <span
                    title="Owner Authorization Required"
                    className="p-1 rounded bg-slate-800 text-amber-400/80 border border-slate-700"
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                  </span>
                )}
                {item.counter !== undefined && item.counter > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.counter}
                  </span>
                )}
                {item.badge && !isLocked && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Security Footer Notice */}
      <div className="pt-3 border-t border-slate-800/80 px-2">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Supabase RLS Active</div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              Row Level Security enforces owner privilege separation directly at the database layer.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
