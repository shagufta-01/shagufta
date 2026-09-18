import React, { useState } from 'react';
import {
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  Smartphone,
  Monitor,
  UserCheck,
  LogOut,
  Sliders,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { User, NetworkMode } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface HeaderProps {
  currentUser: User | null;
  deviceMode: 'windows' | 'android';
  setDeviceMode: (mode: 'windows' | 'android') => void;
  networkMode: NetworkMode;
  onOpenSyncModal: () => void;
  onOpenSchemaModal: () => void;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  deviceMode,
  setDeviceMode,
  networkMode,
  onOpenSyncModal,
  onOpenSchemaModal,
  onSwitchUser,
  onLogout,
  pendingCount,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const allUsers = CloudSyncService.getUsers();

  const handleNetworkSelect = (mode: NetworkMode) => {
    CloudSyncService.setNetworkMode(mode);
    setShowNetworkMenu(false);
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/20 font-bold text-lg border border-amber-400/30">
          م
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
              MADAR AL-TASIS
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                Enterprise
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal']">مؤسسة مدار التأسيس لإدارة العمليات</p>
        </div>
      </div>

      {/* Center Utilities: Network & Sync */}
      <div className="hidden md:flex items-center gap-2">
        {/* Network Mode Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNetworkMenu(!showNetworkMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              networkMode === 'online'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/60'
                : networkMode === 'slow'
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/60 hover:bg-amber-950/60'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/60 hover:bg-rose-950/60'
            }`}
          >
            {networkMode === 'online' && <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            {networkMode === 'slow' && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            {networkMode === 'offline' && <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
            <span className="capitalize">
              {networkMode === 'online' ? 'Cloud Online' : networkMode === 'slow' ? 'Slow 3G Sync' : 'Offline Mode'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showNetworkMenu && (
            <div className="absolute top-full mt-2 left-0 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                Simulate Network Connectivity
              </div>
              <button
                onClick={() => handleNetworkSelect('online')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div>
                  <div className="font-medium text-emerald-400">Online (Fast Cloud)</div>
                  <div className="text-[10px] text-slate-400">Real-time instant sync to Supabase</div>
                </div>
              </button>
              <button
                onClick={() => handleNetworkSelect('offline')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <div>
                  <div className="font-medium text-rose-400">Offline (No Internet)</div>
                  <div className="text-[10px] text-slate-400">Changes queue locally safely</div>
                </div>
              </button>
              <button
                onClick={() => handleNetworkSelect('slow')}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div>
                  <div className="font-medium text-amber-400">Slow / Intermittent 3G</div>
                  <div className="text-[10px] text-slate-400">Simulate field connection delay</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Sync Status Button */}
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${pendingCount > 0 ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
          {pendingCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              {pendingCount}
            </span>
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>

        {/* Supabase PostgreSQL Schema View */}
        <button
          onClick={onOpenSchemaModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Supabase / RLS</span>
        </button>
      </div>

      {/* Right Controls: Device Mode & Active User Switcher */}
      <div className="flex items-center gap-3">
        {/* Device Switcher (Windows vs Android) */}
        <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => setDeviceMode('windows')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              deviceMode === 'windows'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Windows Enterprise Workstation View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Windows</span>
          </button>
          <button
            onClick={() => setDeviceMode('android')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              deviceMode === 'android'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Android Mobile Device Simulation"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android</span>
          </button>
        </div>

        {/* User Profile & Quick Role Switcher */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-left"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 ${
                  currentUser.role === 'owner'
                    ? 'bg-gradient-to-tr from-amber-400 to-amber-200'
                    : 'bg-gradient-to-tr from-cyan-400 to-sky-300'
                }`}
              >
                {currentUser.avatarInitials}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.role === 'owner' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      Owner
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">{currentUser.designation}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Quick Switch Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-700 mb-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Current Active Session
                  </div>
                  <div className="font-semibold text-slate-200 text-sm mt-0.5">{currentUser.name}</div>
                  <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                    <span>{currentUser.mobile}</span>
                    <span>•</span>
                    <span className={currentUser.role === 'owner' ? 'text-amber-400 font-medium' : 'text-cyan-400 font-medium'}>
                      {currentUser.role === 'owner' ? 'Full Administrator' : 'Restricted Staff'}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Switch Active User (Test RBAC)
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    const isInactive = u.status === 'inactive';
                    return (
                      <button
                        key={u.id}
                        disabled={isInactive}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                            : isInactive
                            ? 'opacity-40 cursor-not-allowed bg-slate-900/50'
                            : 'hover:bg-slate-700/70 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              u.role === 'owner' ? 'bg-amber-400 text-slate-950' : 'bg-cyan-500 text-slate-950'
                            }`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="font-medium text-xs flex items-center gap-1">
                              {u.name}
                              {u.role === 'owner' && (
                                <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1 rounded">Owner</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.designation} {isInactive ? ' (Deactivated)' : ''}
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
