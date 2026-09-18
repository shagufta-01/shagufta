import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Clock,
  Edit2,
  Trash2,
  KeyRound,
  Search,
  Filter,
  Check,
  X,
  PhoneCall,
} from 'lucide-react';
import { User, StaffPermissions } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface StaffManagementViewProps {
  currentUser: User | null;
  onNavigateToAudit: () => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  currentUser,
  onNavigateToAudit,
}) => {
  const isOwner = currentUser?.role === 'owner';
  const allUsers = CloudSyncService.getUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending_otp'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [generatedOtpAlert, setGeneratedOtpAlert] = useState<{ name: string; mobile: string; otp: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newPermissions, setNewPermissions] = useState<StaffPermissions>({
    canViewCustomers: true,
    canEditCustomers: true,
    canCreateJobs: true,
    canSubmitReports: true,
    canLogPayments: false,
    canViewAuditLogs: false,
    canViewProfitLoss: false,
  });

  if (!isOwner) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 my-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Owner Administrative Clearance Required</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Staff member accounts are strictly managed and authorized by the primary corporate Owner. Staff cannot view or modify administrative access settings.
        </p>
      </div>
    );
  }

  const filteredUsers = allUsers.filter((u) => {
    if (u.role === 'owner') return false; // Show staff under management
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile.includes(searchQuery) ||
      u.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const result = CloudSyncService.createStaff({
        name: newName.trim(),
        mobile: newMobile.trim(),
        designation: newDesignation.trim(),
        permissions: newPermissions,
      });

      setGeneratedOtpAlert({
        name: result.user.name,
        mobile: result.user.mobile,
        otp: result.otpCode,
      });

      setIsAddModalOpen(false);
      setNewName('');
      setNewMobile('');
      setNewDesignation('');
      setFeedback(`Staff member ${result.user.name} added successfully. Onboarding OTP dispatched.`);
    } catch (err: any) {
      alert(err.message || 'Failed to add staff');
    }
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      CloudSyncService.updateStaff(editingStaff.id, {
        name: editingStaff.name,
        mobile: editingStaff.mobile,
        designation: editingStaff.designation,
        permissions: editingStaff.permissions,
      });
      setEditingStaff(null);
      setFeedback(`Updated staff profile for ${editingStaff.name}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    }
  };

  const handleToggleStatus = (staff: User) => {
    const willActivate = staff.status === 'inactive';
    const confirmMsg = willActivate
      ? `Activate access for ${staff.name}?`
      : `DEACTIVATE ${staff.name}? This will immediately terminate all active sessions across Android and Windows devices and block future logins.`;

    if (window.confirm(confirmMsg)) {
      CloudSyncService.toggleStaffStatus(staff.id, willActivate);
      setFeedback(
        willActivate
          ? `Activated access for ${staff.name}.`
          : `Deactivated ${staff.name}. All active sessions terminated immediately.`
      );
    }
  };

  const handleRemoveStaff = (staff: User) => {
    if (
      window.confirm(
        `Permanently remove staff member ${staff.name} (${staff.mobile})? All active sessions will be terminated immediately.`
      )
    ) {
      CloudSyncService.removeStaff(staff.id);
      setFeedback(`Staff account ${staff.name} permanently removed.`);
    }
  };

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Pending First Login';
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Banner / Feedback */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* OTP Dispatch Alert Box for Onboarding */}
      {generatedOtpAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/60 text-amber-200 shadow-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Onboarding Mobile OTP Dispatched</div>
              <p className="text-xs text-amber-300 mt-0.5">
                Sent to <strong>{generatedOtpAlert.name}</strong> ({generatedOtpAlert.mobile}):
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-lg font-bold bg-slate-900 px-3 py-1 rounded-lg border border-amber-500/40 text-amber-400 tracking-widest">
                  {generatedOtpAlert.otp}
                </span>
                <span className="text-[11px] text-slate-300">
                  Staff must verify this OTP on their Android or Windows device to complete account activation.
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setGeneratedOtpAlert(null)}
            className="p-1 rounded-lg text-amber-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Staff Directory & Access Control</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              Owner Controlled
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
            إدارة الموظفين والتحكم بصلاحيات الوصول وإرسال رموز التحقق
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToAudit}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>View Access Audit Logs</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Staff Member</span>
          </button>
        </div>
      </div>

      {/* Primary Owner Card Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            HT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Hassan Al-Tamimi</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                Sole Primary Owner
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              +966 50 111 2233 • Managing Director & Corporate Administrator
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-4">
          <div>
            <span className="text-slate-500 text-[10px] block uppercase">Administrative Scope</span>
            <span className="font-semibold text-emerald-400">Full Cloud Control (P&L, Staff, Audit)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          {(['all', 'active', 'inactive', 'pending_otp'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {st === 'pending_otp' ? 'Pending OTP' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Staff Name</th>
                <th className="px-4 py-3">Mobile Number</th>
                <th className="px-4 py-3">Role & Designation</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Last Login Time</th>
                <th className="px-4 py-3">Key Permissions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No staff members match the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((staff) => {
                  const isActive = staff.status === 'active';
                  const isPending = staff.status === 'pending_otp';
                  const isInactive = staff.status === 'inactive';

                  return (
                    <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {staff.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">{staff.name}</div>
                            <div className="text-[10px] text-slate-400">{staff.designation}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{staff.mobile}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                          Staff
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Active
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/80 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Pending OTP
                          </span>
                        )}
                        {isInactive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/80 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {formatLastLogin(staff.lastLoginAt)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {staff.permissions.canCreateJobs && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px] border border-slate-700">
                              Jobs
                            </span>
                          )}
                          {staff.permissions.canSubmitReports && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 text-[10px] border border-slate-700">
                              Reports
                            </span>
                          )}
                          {staff.permissions.canLogPayments && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 text-[10px] border border-slate-700">
                              Payments
                            </span>
                          )}
                          <span
                            title="Owner Only: Staff has 0 access to P&L"
                            className="px-1.5 py-0.2 rounded bg-rose-950/40 text-rose-300 text-[10px] border border-rose-800/60 flex items-center gap-0.5"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            No P&L
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Activation */}
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            title={isActive ? 'Deactivate staff member (kill sessions)' : 'Activate staff member'}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                              isActive
                                ? 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                                : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* Edit Staff */}
                          <button
                            onClick={() => setEditingStaff(staff)}
                            title="Edit permissions"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Staff */}
                          <button
                            onClick={() => handleRemoveStaff(staff)}
                            title="Remove staff account"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 border border-slate-700 text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Enroll New Staff Member</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Eng. Majed Al-Ghamdi"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Verified Mobile Number (For OTP Verification)
                </label>
                <input
                  type="text"
                  required
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="+966 50 123 4567"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  The system will generate and dispatch a 6-digit OTP to this mobile for first-time access.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Corporate Designation</label>
                <input
                  type="text"
                  required
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="e.g. Field Inspector / Projects Specialist"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="font-semibold text-slate-300 mb-2">Role Permissions Matrix:</div>
                <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canViewCustomers}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, canViewCustomers: e.target.checked })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can View Customer Directory & Job Histories</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canEditCustomers}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, canEditCustomers: e.target.checked })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Create & Modify Customer Details</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canCreateJobs}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, canCreateJobs: e.target.checked })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Dispatch & Create Service Request Jobs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canSubmitReports}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, canSubmitReports: e.target.checked })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Submit Field Work Inspection Reports</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canLogPayments}
                      onChange={(e) =>
                        setNewPermissions({ ...newPermissions, canLogPayments: e.target.checked })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Collect & Log Client Payment Vouchers</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300/90 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Profit & Loss reports and administrative user governance are strictly blocked for all staff profiles.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Enroll Staff & Send OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Edit Staff & Permissions</h3>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Verified Mobile Number</label>
                <input
                  type="text"
                  required
                  value={editingStaff.mobile}
                  onChange={(e) => setEditingStaff({ ...editingStaff, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={editingStaff.designation}
                  onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="font-semibold text-slate-300 mb-2">Permissions:</div>
                <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.permissions.canViewCustomers}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          permissions: { ...editingStaff.permissions, canViewCustomers: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can View Customers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.permissions.canEditCustomers}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          permissions: { ...editingStaff.permissions, canEditCustomers: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Edit Customers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.permissions.canCreateJobs}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          permissions: { ...editingStaff.permissions, canCreateJobs: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Create & Dispatch Jobs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.permissions.canSubmitReports}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          permissions: { ...editingStaff.permissions, canSubmitReports: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Submit Field Inspection Reports</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingStaff.permissions.canLogPayments}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          permissions: { ...editingStaff.permissions, canLogPayments: e.target.checked },
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span>Can Log Payments</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
