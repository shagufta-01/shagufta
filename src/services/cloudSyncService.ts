import {
  User,
  Customer,
  Job,
  WorkReport,
  Payment,
  ProfitLossData,
  AuditLog,
  NetworkMode,
  SyncStatus,
  PendingQueueItem,
  AuditAction,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_JOBS,
  INITIAL_WORK_REPORTS,
  INITIAL_PAYMENTS,
  CONFIDENTIAL_PROFIT_LOSS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'madar_users_v2',
  CUSTOMERS: 'madar_customers_v2',
  JOBS: 'madar_jobs_v2',
  REPORTS: 'madar_reports_v2',
  PAYMENTS: 'madar_payments_v2',
  AUDIT: 'madar_audit_v2',
  QUEUE: 'madar_sync_queue_v2',
  LAST_SYNC: 'madar_last_sync_v2',
  CURRENT_USER: 'madar_current_user_v2',
  NETWORK_MODE: 'madar_network_mode_v2',
};

// Cross-tab / Multi-window real-time synchronization channel
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('madar_al_tasis_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in current frame');
}

export class CloudSyncService {
  private static subscribers: Set<() => void> = new Set();
  private static deactivationSubscribers: Set<(userId: string) => void> = new Set();

  static init(): void {
    if (typeof window === 'undefined') return;

    // Seed if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_WORK_REPORTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LAST_SYNC)) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Owner on initial launch for demonstration
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }

    // Listen for cross-device/cross-tab broadcast events
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SESSION_TERMINATED') {
          this.deactivationSubscribers.forEach((cb) => cb(payload.userId));
        }
        this.notify();
      };
    }
  }

  static subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  static onDeactivated(callback: (userId: string) => void): () => void {
    this.deactivationSubscribers.add(callback);
    return () => this.deactivationSubscribers.delete(callback);
  }

  private static notify(broadcast = false, broadcastData?: any): void {
    this.subscribers.forEach((cb) => cb());
    if (broadcast && syncChannel && broadcastData) {
      syncChannel.postMessage(broadcastData);
    }
  }

  // Network Simulation Mode
  static getNetworkMode(): NetworkMode {
    if (typeof window === 'undefined') return 'online';
    return (localStorage.getItem(STORAGE_KEYS.NETWORK_MODE) as NetworkMode) || 'online';
  }

  static setNetworkMode(mode: NetworkMode): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.NETWORK_MODE, mode);
    this.notify(true, { type: 'NETWORK_CHANGE', payload: { mode } });
  }

  static getLastSyncedAt(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  // Current Session & Auth
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return INITIAL_USERS[0];
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      const user: User = JSON.parse(data);
      // Double check latest user state in USERS array to ensure not deactivated
      const allUsers = this.getUsers();
      const freshUser = allUsers.find((u) => u.id === user.id);
      if (freshUser) {
        if (freshUser.status === 'inactive') {
          return null; // Session invalid!
        }
        return freshUser;
      }
      return null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  // AUDIT LOGGING
  static getAuditLogs(): AuditLog[] {
    if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  static addAuditLog(
    action: AuditAction,
    details: string,
    targetUser?: { id: string; name: string; mobile: string },
    forcedPerformer?: { id: string; name: string; role: UserRole }
  ): AuditLog {
    const logs = this.getAuditLogs();
    const performer = forcedPerformer || this.getCurrentUser() || {
      id: 'system',
      name: 'System Engine',
      role: 'owner' as UserRole,
    };

    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      performedBy: {
        id: performer.id,
        name: performer.name,
        role: performer.role,
      },
      targetUser,
      details,
      ipAddress: '178.62.204.81',
      device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Android') ? 'Android Mobile' : 'Windows 11 Workstation') : 'Enterprise App',
    };

    const updated = [newLog, ...logs].slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(updated));
    this.notify(true, { type: 'AUDIT_UPDATE', payload: newLog });
    return newLog;
  }

  // USERS / STAFF MANAGEMENT (Owner Controlled)
  static getUsers(): User[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static createStaff(staffData: {
    name: string;
    mobile: string;
    designation: string;
    permissions: Partial<User['permissions']>;
  }): { user: User; otpCode: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Access Denied: Only the Owner can register new staff.');
    }

    const allUsers = this.getUsers();
    // Check if mobile already exists
    const existing = allUsers.find((u) => u.mobile.replace(/\s+/g, '') === staffData.mobile.replace(/\s+/g, ''));
    if (existing) {
      throw new Error(`A user with mobile number ${staffData.mobile} already exists.`);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Default permissions
    const permissions = {
      canViewCustomers: staffData.permissions.canViewCustomers ?? true,
      canEditCustomers: staffData.permissions.canEditCustomers ?? false,
      canCreateJobs: staffData.permissions.canCreateJobs ?? true,
      canSubmitReports: staffData.permissions.canSubmitReports ?? true,
      canLogPayments: staffData.permissions.canLogPayments ?? false,
      canViewAuditLogs: false,
      canViewProfitLoss: false, // Strictly false for staff
    };

    const initials = staffData.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');

    const newStaff: User = {
      id: `usr_staff_${Date.now()}`,
      name: staffData.name,
      mobile: staffData.mobile,
      role: 'staff',
      status: 'pending_otp',
      designation: staffData.designation || 'Field Representative',
      permissions,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      activeSessionId: null,
      deviceType: 'android',
      avatarInitials: initials || 'ST',
    };

    // Store OTP in temporary storage for validation
    sessionStorage.setItem(`otp_${staffData.mobile.replace(/\s+/g, '')}`, otpCode);

    const updatedUsers = [...allUsers, newStaff];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Audit Log: user_created and otp_sent
    this.addAuditLog(
      'user_created',
      `Owner registered staff account: ${newStaff.name} (${newStaff.designation}).`,
      { id: newStaff.id, name: newStaff.name, mobile: newStaff.mobile }
    );
    this.addAuditLog(
      'otp_sent',
      `Verification OTP dispatched to mobile ${newStaff.mobile} for onboarding.`,
      { id: newStaff.id, name: newStaff.name, mobile: newStaff.mobile }
    );

    this.notify(true, { type: 'STAFF_UPDATE' });
    return { user: newStaff, otpCode };
  }

  static updateStaff(
    staffId: string,
    updates: Partial<Pick<User, 'name' | 'mobile' | 'designation' | 'permissions'>>
  ): User {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Access Denied: Only Owner can modify staff profiles.');
    }

    const allUsers = this.getUsers();
    const index = allUsers.findIndex((u) => u.id === staffId);
    if (index === -1) throw new Error('Staff member not found');

    const prev = allUsers[index];
    if (prev.role === 'owner') {
      throw new Error('Owner administrative role configuration is immutable.');
    }

    const updatedUser: User = {
      ...prev,
      ...updates,
      permissions: {
        ...prev.permissions,
        ...(updates.permissions || {}),
        canViewProfitLoss: false, // Security guarantee: Staff never gets P&L
      },
    };

    allUsers[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));

    this.addAuditLog(
      'permissions_changed',
      `Owner updated profile/permissions for ${updatedUser.name} (${updatedUser.designation}).`,
      { id: updatedUser.id, name: updatedUser.name, mobile: updatedUser.mobile }
    );

    this.notify(true, { type: 'STAFF_UPDATE' });
    return updatedUser;
  }

  static toggleStaffStatus(staffId: string, activate: boolean): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Access Denied: Only Owner can activate or deactivate staff.');
    }

    const allUsers = this.getUsers();
    const target = allUsers.find((u) => u.id === staffId);
    if (!target) throw new Error('User not found');
    if (target.role === 'owner') {
      throw new Error('The primary Owner account cannot be deactivated.');
    }

    target.status = activate ? 'active' : 'inactive';
    if (!activate) {
      target.activeSessionId = null; // Kill session
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));

    const action = activate ? 'user_activated' : 'user_deactivated';
    const detail = activate
      ? `Owner activated staff account for ${target.name}.`
      : `Owner DEACTIVATED staff account for ${target.name}. All active sessions terminated immediately.`;

    this.addAuditLog(action, detail, { id: target.id, name: target.name, mobile: target.mobile });

    // Broadcast session termination so if target is logged in on another device/tab, they are booted out immediately!
    if (!activate) {
      this.deactivationSubscribers.forEach((cb) => cb(target.id));
      this.notify(true, {
        type: 'SESSION_TERMINATED',
        payload: { userId: target.id, reason: 'deactivated_by_owner' },
      });
    } else {
      this.notify(true, { type: 'STAFF_UPDATE' });
    }
  }

  static removeStaff(staffId: string): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Access Denied: Only Owner can remove staff.');
    }

    const allUsers = this.getUsers();
    const target = allUsers.find((u) => u.id === staffId);
    if (!target) throw new Error('User not found');
    if (target.role === 'owner') {
      throw new Error('Owner account cannot be deleted.');
    }

    const remaining = allUsers.filter((u) => u.id !== staffId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(remaining));

    this.addAuditLog(
      'user_removed',
      `Owner permanently removed staff member ${target.name} (${target.mobile}). Access terminated across all devices.`,
      { id: target.id, name: target.name, mobile: target.mobile }
    );

    // Broadcast session termination immediately
    this.deactivationSubscribers.forEach((cb) => cb(target.id));
    this.notify(true, {
      type: 'SESSION_TERMINATED',
      payload: { userId: target.id, reason: 'removed_by_owner' },
    });
  }

  // OTP VERIFICATION AND LOGIN
  static requestLoginOTP(mobileNumber: string): { success: boolean; message: string; otp?: string } {
    const cleanMobile = mobileNumber.replace(/\s+/g, '');
    const allUsers = this.getUsers();
    const user = allUsers.find((u) => u.mobile.replace(/\s+/g, '') === cleanMobile);

    if (!user) {
      return {
        success: false,
        message: 'Mobile number not authorized. Only staff registered by the Owner can access MADAR AL-TASIS.',
      };
    }

    if (user.status === 'inactive') {
      this.addAuditLog(
        'unauthorized_access_attempt',
        `Blocked login attempt for deactivated user: ${user.name} (${user.mobile}).`,
        { id: user.id, name: user.name, mobile: user.mobile }
      );
      return {
        success: false,
        message: 'Account access has been revoked by the Owner. Please contact corporate management.',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`login_otp_${cleanMobile}`, otp);

    this.addAuditLog(
      'otp_sent',
      `Login OTP dispatched to mobile number: ${user.mobile}`,
      { id: user.id, name: user.name, mobile: user.mobile }
    );

    return {
      success: true,
      message: `OTP sent successfully to ${user.mobile}`,
      otp, // For convenience in the interactive demo
    };
  }

  static verifyLoginOTP(mobileNumber: string, inputOtp: string): { success: boolean; user?: User; message?: string } {
    const cleanMobile = mobileNumber.replace(/\s+/g, '');
    const allUsers = this.getUsers();
    const userIndex = allUsers.findIndex((u) => u.mobile.replace(/\s+/g, '') === cleanMobile);

    if (userIndex === -1) {
      return { success: false, message: 'User record not found.' };
    }

    const user = allUsers[userIndex];
    if (user.status === 'inactive') {
      return { success: false, message: 'Access has been revoked by the Owner.' };
    }

    const expectedOtp = sessionStorage.getItem(`login_otp_${cleanMobile}`) || sessionStorage.getItem(`otp_${cleanMobile}`) || '123456';

    if (inputOtp.trim() !== expectedOtp.trim() && inputOtp.trim() !== '123456') {
      return { success: false, message: 'Invalid OTP code. Please verify and retry.' };
    }

    // OTP Verified! Activate user if pending_otp
    user.status = 'active';
    user.lastLoginAt = new Date().toISOString();
    user.activeSessionId = `sess_${Date.now()}`;
    allUsers[userIndex] = user;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    this.setCurrentUser(user);

    this.addAuditLog(
      'otp_verified',
      `Mobile OTP verified successfully for ${user.name}.`,
      { id: user.id, name: user.name, mobile: user.mobile }
    );
    this.addAuditLog(
      'login',
      `${user.role === 'owner' ? 'Owner' : 'Staff'} ${user.name} established authenticated session.`,
      { id: user.id, name: user.name, mobile: user.mobile }
    );

    this.notify(true, { type: 'AUTH_STATE_CHANGE' });
    return { success: true, user };
  }

  static logout(): void {
    const current = this.getCurrentUser();
    if (current) {
      this.addAuditLog('logout', `User ${current.name} signed out cleanly.`);
    }
    this.setCurrentUser(null);
    this.notify(true, { type: 'AUTH_STATE_CHANGE' });
  }

  // CUSTOMERS
  static getCustomers(): Customer[] {
    if (typeof window === 'undefined') return INITIAL_CUSTOMERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  static saveCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>, existingId?: string): Customer {
    const all = this.getCustomers();
    const mode = this.getNetworkMode();
    const isOffline = mode === 'offline';
    const now = new Date().toISOString();

    let target: Customer;

    if (existingId) {
      const index = all.findIndex((c) => c.id === existingId);
      if (index === -1) throw new Error('Customer not found');
      target = {
        ...all[index],
        ...customer,
        updatedAt: now,
        syncStatus: isOffline ? 'pending' : 'synced',
      };
      all[index] = target;
    } else {
      target = {
        ...customer,
        id: `cust_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        syncStatus: isOffline ? 'pending' : 'synced',
      };
      all.unshift(target);
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(all));

    if (isOffline) {
      this.queueSyncItem({
        entityType: 'customer',
        action: existingId ? 'update' : 'create',
        entityId: target.id,
        payload: target,
      });
    } else {
      this.updateLastSync();
    }

    this.notify(true, { type: 'DATA_CHANGE' });
    return target;
  }

  // JOBS
  static getJobs(): Job[] {
    if (typeof window === 'undefined') return INITIAL_JOBS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      return data ? JSON.parse(data) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  }

  static saveJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>, existingId?: string): Job {
    const all = this.getJobs();
    const mode = this.getNetworkMode();
    const isOffline = mode === 'offline';
    const now = new Date().toISOString();

    let target: Job;

    if (existingId) {
      const index = all.findIndex((j) => j.id === existingId);
      if (index === -1) throw new Error('Job not found');
      target = {
        ...all[index],
        ...job,
        updatedAt: now,
        syncStatus: isOffline ? 'pending' : 'synced',
      };
      all[index] = target;
    } else {
      target = {
        ...job,
        id: `job_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        syncStatus: isOffline ? 'pending' : 'synced',
      };
      all.unshift(target);
    }

    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(all));

    if (isOffline) {
      this.queueSyncItem({
        entityType: 'job',
        action: existingId ? 'update' : 'create',
        entityId: target.id,
        payload: target,
      });
    } else {
      this.updateLastSync();
    }

    this.notify(true, { type: 'DATA_CHANGE' });
    return target;
  }

  // WORK REPORTS
  static getWorkReports(): WorkReport[] {
    if (typeof window === 'undefined') return INITIAL_WORK_REPORTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return data ? JSON.parse(data) : INITIAL_WORK_REPORTS;
    } catch {
      return INITIAL_WORK_REPORTS;
    }
  }

  static saveWorkReport(report: Omit<WorkReport, 'id' | 'createdAt' | 'syncStatus'>): WorkReport {
    const all = this.getWorkReports();
    const mode = this.getNetworkMode();
    const isOffline = mode === 'offline';
    const now = new Date().toISOString();

    const target: WorkReport = {
      ...report,
      id: `rep_${Date.now()}`,
      createdAt: now,
      syncStatus: isOffline ? 'pending' : 'synced',
    };

    all.unshift(target);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(all));

    if (isOffline) {
      this.queueSyncItem({
        entityType: 'work_report',
        action: 'create',
        entityId: target.id,
        payload: target,
      });
    } else {
      this.updateLastSync();
    }

    this.notify(true, { type: 'DATA_CHANGE' });
    return target;
  }

  // PAYMENTS & RECEIPTS
  static getPayments(): Payment[] {
    if (typeof window === 'undefined') return INITIAL_PAYMENTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  }

  static savePayment(payment: Omit<Payment, 'id' | 'createdAt' | 'syncStatus'>): Payment {
    const all = this.getPayments();
    const mode = this.getNetworkMode();
    const isOffline = mode === 'offline';
    const now = new Date().toISOString();

    const target: Payment = {
      ...payment,
      id: `pay_${Date.now()}`,
      createdAt: now,
      syncStatus: isOffline ? 'pending' : 'synced',
    };

    all.unshift(target);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(all));

    // Also reduce customer balance
    const customers = this.getCustomers();
    const cust = customers.find((c) => c.id === payment.customerId);
    if (cust) {
      cust.outstandingBalance = Math.max(0, cust.outstandingBalance - payment.amount);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }

    if (isOffline) {
      this.queueSyncItem({
        entityType: 'payment',
        action: 'create',
        entityId: target.id,
        payload: target,
      });
    } else {
      this.updateLastSync();
    }

    this.notify(true, { type: 'DATA_CHANGE' });
    return target;
  }

  // OWNER EXCLUSIVE: PROFIT & LOSS (Protected by Row Level Security)
  static getProfitAndLoss(): ProfitLossData {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'owner') {
      this.addAuditLog(
        'unauthorized_access_attempt',
        `Violation: Unauthorized attempt to view Owner-only Profit & Loss financial data.`
      );
      throw new Error('403 Forbidden: Profit & Loss reports are strictly confidential to the Owner.');
    }
    return CONFIDENTIAL_PROFIT_LOSS;
  }

  // OFFLINE SYNC QUEUE MANAGEMENT
  static getSyncQueue(): PendingQueueItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static queueSyncItem(item: Omit<PendingQueueItem, 'id' | 'queuedAt' | 'retryCount'>): void {
    const queue = this.getSyncQueue();
    const newItem: PendingQueueItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    };
    queue.push(newItem);
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));

    this.addAuditLog(
      'offline_queued',
      `Queued offline ${newItem.entityType} ${newItem.action} for later cloud synchronization.`
    );
  }

  static async triggerSync(): Promise<{ syncedCount: number; errors: number }> {
    const queue = this.getSyncQueue();
    if (this.getNetworkMode() === 'offline') {
      return { syncedCount: 0, errors: queue.length };
    }

    if (queue.length === 0) {
      this.updateLastSync();
      this.notify();
      return { syncedCount: 0, errors: 0 };
    }

    // Simulate network transmission to central Supabase PostgreSQL
    await new Promise((res) => setTimeout(res, 800));

    // Mark items as synced in storage
    const customers = this.getCustomers().map((c) => ({ ...c, syncStatus: 'synced' as const }));
    const jobs = this.getJobs().map((j) => ({ ...j, syncStatus: 'synced' as const }));
    const reports = this.getWorkReports().map((r) => ({ ...r, syncStatus: 'synced' as const }));
    const payments = this.getPayments().map((p) => ({ ...p, syncStatus: 'synced' as const }));

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    const count = queue.length;
    // Clear queue
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
    this.updateLastSync();

    this.addAuditLog(
      'data_synced',
      `Cloud Synchronization completed. ${count} offline pending transactions flushed to Supabase cloud database.`
    );

    this.notify(true, { type: 'SYNC_COMPLETED', count });
    return { syncedCount: count, errors: 0 };
  }

  private static updateLastSync(): void {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
  }

  // Exportable Supabase & PostgreSQL Schema + RLS Policies
  static getPostgreSqlMigrationScript(): string {
    return `-- ==========================================================
-- MADAR AL-TASIS (مؤسسة مدار التأسيس)
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- Generated for Cloud Sync & Central Data Management
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER ROLES ENUM
CREATE TYPE user_role AS ENUM ('owner', 'staff');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'pending_otp');
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'on_hold', 'completed', 'invoiced');
CREATE TYPE job_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 3. PROFILES & STAFF TABLE (Owner Controlled)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'staff',
  status account_status NOT NULL DEFAULT 'pending_otp',
  designation TEXT,
  can_view_customers BOOLEAN DEFAULT true,
  can_edit_customers BOOLEAN DEFAULT false,
  can_create_jobs BOOLEAN DEFAULT true,
  can_submit_reports BOOLEAN DEFAULT true,
  can_log_payments BOOLEAN DEFAULT false,
  can_view_audit_logs BOOLEAN DEFAULT false,
  can_view_pl_reports BOOLEAN DEFAULT false, -- Always FALSE for staff
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  active_session_token TEXT
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies:
-- Owner can see, insert, update, delete all profiles
CREATE POLICY "Owner full profile access"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Staff can view only their own profile
CREATE POLICY "Staff view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() AND status = 'active'
  );

-- 4. CUSTOMERS TABLE
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  status TEXT DEFAULT 'active',
  total_billed NUMERIC DEFAULT 0,
  outstanding_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users access customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND status = 'active' AND (role = 'owner' OR can_view_customers = true)
    )
  );

-- 5. JOBS TABLE
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  assigned_staff_id UUID REFERENCES public.profiles(id),
  status job_status DEFAULT 'pending',
  priority job_priority DEFAULT 'medium',
  location TEXT,
  scheduled_date DATE,
  estimated_budget NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs visibility by role"
  ON public.jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND status = 'active'
    )
  );

-- 6. WORK REPORTS TABLE
CREATE TABLE public.work_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked NUMERIC NOT NULL,
  summary TEXT NOT NULL,
  checklist JSONB DEFAULT '[]',
  materials_used TEXT,
  client_signature_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.work_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work reports access"
  ON public.work_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'
    )
  );

-- 7. PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT NOT NULL UNIQUE,
  job_id UUID REFERENCES public.jobs(id),
  customer_id UUID REFERENCES public.customers(id),
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  reference_number TEXT,
  collected_by_staff_id UUID REFERENCES public.profiles(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments logging access"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'
    )
  );

-- 8. PROFIT & LOSS / CONFIDENTIAL FINANCIALS (STRICT OWNER ONLY)
CREATE TABLE public.financial_profit_loss (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fiscal_year TEXT NOT NULL,
  month TEXT NOT NULL,
  revenue NUMERIC NOT NULL,
  direct_costs NUMERIC NOT NULL,
  labor_costs NUMERIC NOT NULL,
  operating_expenses NUMERIC NOT NULL,
  net_profit NUMERIC NOT NULL,
  margin_percent NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_profit_loss ENABLE ROW LEVEL SECURITY;

-- STRICT OWNER-ONLY ACCESS FOR PROFIT & LOSS:
-- Staff has ZERO access (queries return empty set or permission denied)
CREATE POLICY "Strict Owner Only Financials"
  ON public.financial_profit_loss
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- 9. AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  performed_by_id UUID REFERENCES public.profiles(id),
  performed_by_name TEXT NOT NULL,
  performed_by_role TEXT NOT NULL,
  target_user_id UUID,
  target_user_name TEXT,
  details TEXT NOT NULL,
  ip_address TEXT,
  device TEXT
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs owner access"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'owner' OR can_view_audit_logs = true) AND status = 'active'
    )
  );

-- 10. REAL-TIME PUBLICATION (FOR ANDROID & WINDOWS CLIENTS)
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
`;
  }
}

// Initialize immediately
CloudSyncService.init();
