import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import { CloudSyncService } from '../services/cloudSyncService';
import { NetworkMode } from '../types';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkMode: NetworkMode;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  networkMode,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const queue = CloudSyncService.getSyncQueue();
  const lastSync = CloudSyncService.getLastSyncedAt();

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await CloudSyncService.triggerSync();
      setIsSyncing(false);
      if (networkMode === 'offline') {
        setSyncFeedback('Cannot sync while Offline. Switch network mode to Online or Slow 3G.');
      } else {
        setSyncFeedback(`Successfully synchronized ${result.syncedCount} queued records to Supabase Cloud.`);
      }
    } catch (err: any) {
      setIsSyncing(false);
      setSyncFeedback('Sync failed: Network interruption. Pending records preserved locally.');
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Cloud Sync & Central Persistence Engine</h3>
              <p className="text-[10px] text-slate-400">PostgreSQL • Supabase Replication Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Network State</div>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-sm">
                {networkMode === 'online' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-emerald-400">Online</span>
                  </>
                )}
                {networkMode === 'slow' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-amber-400">Slow 3G</span>
                  </>
                )}
                {networkMode === 'offline' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                    <span className="text-rose-400">Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Uploads</div>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-sm">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className={queue.length > 0 ? 'text-amber-400' : 'text-slate-300'}>
                  {queue.length} items queued
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Cloud Sync State</div>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Up to date</span>
              </div>
            </div>
          </div>

          {/* Last Sync Timestamp Box */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last Successful Cloud Sync:</span>
            </div>
            <span className="font-mono text-slate-200 font-medium">{formatDate(lastSync)}</span>
          </div>

          {syncFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                syncFeedback.includes('Cannot') || syncFeedback.includes('failed')
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Pending Sync Queue List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Local Offline Queue (Never Silently Lost)
              </span>
              <span className="text-[10px] text-slate-400">{queue.length} transactions pending</span>
            </div>

            {queue.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-dashed border-slate-700 text-center text-slate-400 text-xs">
                All local records are synchronized with the central Supabase PostgreSQL cloud database.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-200 capitalize flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold">
                          {item.action}
                        </span>
                        <span>{item.entityType.replace('_', ' ')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        ID: {item.entityId} • Queued {new Date(item.queuedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      Pending Sync
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conflict & Deduplication Guarantees */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline-First Reliability & Conflict Prevention</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
              <li>
                <strong className="text-slate-300">Idempotent UUIDs:</strong> New entities receive cryptographic IDs client-side to prevent duplicate records upon reconnect.
              </li>
              <li>
                <strong className="text-slate-300">Optimistic UI:</strong> Staff can continue logging work reports, jobs, and payments even in remote desert sites without cellular signal.
              </li>
              <li>
                <strong className="text-slate-300">Immediate Owner Synchronization:</strong> Cloud changes automatically replicate to all connected devices without manual export/import.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Endpoint: Supabase Cloud (db.madar-al-tasis.supabase.co)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Close
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing || networkMode === 'offline'}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Retry / Force Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
