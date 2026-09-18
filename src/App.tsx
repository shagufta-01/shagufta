import React, { useState, useEffect } from 'react';
import { CloudSyncService } from './services/cloudSyncService';
import { User, NetworkMode } from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StaffManagementView } from './components/StaffManagementView';
import { CustomersView } from './components/CustomersView';
import { JobsView } from './components/JobsView';
import { WorkReportsView } from './components/WorkReportsView';
import { PaymentsView } from './components/PaymentsView';
import { ProfitLossView } from './components/ProfitLossView';
import { AuditLogsView } from './components/AuditLogsView';
import { LoginModal } from './components/LoginModal';
import { SyncStatusModal } from './components/SyncStatusModal';
import { SupabaseSchemaModal } from './components/SupabaseSchemaModal';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  CreditCard,
  ClipboardCheck,
  FileText,
  Lock,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => CloudSyncService.getCurrentUser());
  const [networkMode, setNetworkMode] = useState<NetworkMode>(() => CloudSyncService.getNetworkMode());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<'windows' | 'android'>('windows');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(() => CloudSyncService.getSyncQueue().length);
  const [, setRenderTrigger] = useState(0);

  // Subscribe to service updates (cross-tab events, data updates, sync ticks)
  useEffect(() => {
    const unsubscribe = CloudSyncService.subscribe(() => {
      setCurrentUser(CloudSyncService.getCurrentUser());
      setNetworkMode(CloudSyncService.getNetworkMode());
      setPendingCount(CloudSyncService.getSyncQueue().length);
      setRenderTrigger((c) => c + 1);
    });
    return unsubscribe;
  }, []);

  const handleSwitchUser = (newUser: User) => {
    CloudSyncService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    // If switched user is staff and current tab is owner-only, push back to dashboard
    if (newUser.role === 'staff' && (activeTab === 'staff' || activeTab === 'profit_loss' || activeTab === 'audit_logs')) {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    CloudSyncService.logout();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setCurrentUser(loggedInUser);
    setIsLoginModalOpen(false);
    setActiveTab('dashboard');
  };

  // Safe navigation with Owner-only guard
  const handleTabSelect = (tab: ActiveTab) => {
    if (tab === 'sync_status') {
      setIsSyncModalOpen(true);
      return;
    }
    if (tab === 'supabase') {
      setIsSchemaModalOpen(true);
      return;
    }
    if (currentUser?.role === 'staff' && (tab === 'staff' || tab === 'profit_loss' || tab === 'audit_logs')) {
      // Record unauthorized attempt
      CloudSyncService.addAuditLog(
        'unauthorized_access_attempt',
        `Staff member ${currentUser.name} attempted to access restricted tab: ${tab}`,
        undefined
      );
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        networkMode={networkMode}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />

      {/* Main Responsive Body Container */}
      <div className="flex-1 flex overflow-hidden">
        {deviceMode === 'windows' ? (
          /* WINDOWS ENTERPRISE DESKTOP WORKSPACE */
          <div className="flex-1 flex overflow-hidden">
            {/* Desktop Left Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleTabSelect}
              currentUser={currentUser}
              pendingSyncCount={pendingCount}
            />

            {/* Main Central View Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
              <div className="max-w-7xl mx-auto space-y-6">
                {activeTab === 'dashboard' && (
                  <DashboardView
                    currentUser={currentUser}
                    setActiveTab={handleTabSelect}
                    networkMode={networkMode}
                    onOpenSyncModal={() => setIsSyncModalOpen(true)}
                  />
                )}
                {activeTab === 'staff' && (
                  <StaffManagementView
                    currentUser={currentUser}
                    onNavigateToAudit={() => handleTabSelect('audit_logs')}
                  />
                )}
                {activeTab === 'customers' && <CustomersView currentUser={currentUser} />}
                {activeTab === 'jobs' && <JobsView currentUser={currentUser} />}
                {activeTab === 'reports' && <WorkReportsView currentUser={currentUser} />}
                {activeTab === 'payments' && <PaymentsView currentUser={currentUser} />}
                {activeTab === 'profit_loss' && <ProfitLossView currentUser={currentUser} />}
                {activeTab === 'audit_logs' && <AuditLogsView currentUser={currentUser} />}
              </div>
            </main>
          </div>
        ) : (
          /* ANDROID NATIVE TABLET / MOBILE EMULATOR FRAME */
          <div className="flex-1 p-3 sm:p-6 flex items-center justify-center bg-slate-950/90 overflow-y-auto">
            <div className="w-full max-w-[420px] h-[840px] bg-slate-900 border-4 border-slate-700/80 rounded-[44px] shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative">
              {/* Android Hardware Top Speaker & Camera Notch */}
              <div className="pt-2 pb-1 px-6 bg-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-medium select-none">
                <span>09:41</span>
                <div className="w-20 h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  {networkMode === 'offline' ? (
                    <WifiOff className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  )}
                  <span>5G</span>
                </div>
              </div>

              {/* Android Mobile App Bar */}
              <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    م
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">MADAR AL-TASIS</div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {currentUser?.role === 'owner' ? 'Owner Admin' : 'Staff Field App'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {pendingCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Scrollable Viewport */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-slate-950">
                {activeTab === 'dashboard' && (
                  <DashboardView
                    currentUser={currentUser}
                    setActiveTab={handleTabSelect}
                    networkMode={networkMode}
                    onOpenSyncModal={() => setIsSyncModalOpen(true)}
                  />
                )}
                {activeTab === 'staff' && (
                  <StaffManagementView
                    currentUser={currentUser}
                    onNavigateToAudit={() => handleTabSelect('audit_logs')}
                  />
                )}
                {activeTab === 'customers' && <CustomersView currentUser={currentUser} />}
                {activeTab === 'jobs' && <JobsView currentUser={currentUser} />}
                {activeTab === 'reports' && <WorkReportsView currentUser={currentUser} />}
                {activeTab === 'payments' && <PaymentsView currentUser={currentUser} />}
                {activeTab === 'profit_loss' && <ProfitLossView currentUser={currentUser} />}
                {activeTab === 'audit_logs' && <AuditLogsView currentUser={currentUser} />}
              </div>

              {/* Android Bottom Navigation Bar */}
              <div className="bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around text-slate-400 select-none">
                <button
                  onClick={() => handleTabSelect('dashboard')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => handleTabSelect('jobs')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'jobs' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </button>

                <button
                  onClick={() => handleTabSelect('reports')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'reports' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Reports</span>
                </button>

                <button
                  onClick={() => handleTabSelect('payments')}
                  className={`flex flex-col items-center gap-0.5 text-[10px] ${
                    activeTab === 'payments' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Receipts</span>
                </button>

                {currentUser?.role === 'owner' ? (
                  <button
                    onClick={() => handleTabSelect('staff')}
                    className={`flex flex-col items-center gap-0.5 text-[10px] ${
                      activeTab === 'staff' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Staff</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabSelect('customers')}
                    className={`flex flex-col items-center gap-0.5 text-[10px] ${
                      activeTab === 'customers' ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Clients</span>
                  </button>
                )}
              </div>

              {/* Android Home Navigation Bar Pill */}
              <div className="pb-1 pt-0.5 bg-slate-900 flex justify-center">
                <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen || !currentUser}
        onSuccess={handleLoginSuccess}
        onClose={currentUser ? () => setIsLoginModalOpen(false) : undefined}
      />

      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        networkMode={networkMode}
      />

      <SupabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </div>
  );
}
