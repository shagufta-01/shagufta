export type UserRole = 'owner' | 'staff';

export type AccountStatus = 'active' | 'inactive' | 'pending_otp';

export interface StaffPermissions {
  canViewCustomers: boolean;
  canEditCustomers: boolean;
  canCreateJobs: boolean;
  canSubmitReports: boolean;
  canLogPayments: boolean;
  canViewAuditLogs: boolean; // restricted to owner by default
  canViewProfitLoss: boolean; // STRICTLY owner only
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  status: AccountStatus;
  designation: string;
  permissions: StaffPermissions;
  createdAt: string;
  lastLoginAt: string | null;
  activeSessionId: string | null;
  deviceType: 'android' | 'windows' | 'web';
  avatarInitials: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
  totalBilled: number;
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export type JobStatus = 'pending' | 'in_progress' | 'on_hold' | 'completed' | 'invoiced';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Job {
  id: string;
  jobCode: string;
  title: string;
  customerId: string;
  customerName: string;
  assignedStaffId: string;
  assignedStaffName: string;
  status: JobStatus;
  priority: JobPriority;
  location: string;
  scheduledDate: string;
  estimatedBudget: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface WorkReportChecklistItem {
  id: string;
  task: string;
  done: boolean;
}

export interface WorkReport {
  id: string;
  jobId: string;
  jobCode: string;
  jobTitle: string;
  staffId: string;
  staffName: string;
  date: string;
  hoursWorked: number;
  summary: string;
  checklist: WorkReportChecklistItem[];
  materialsUsed: string;
  clientSignatureName: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'pos_card' | 'cheque';

export interface Payment {
  id: string;
  receiptNumber: string;
  jobId: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber: string;
  collectedByStaffId: string;
  collectedByStaffName: string;
  date: string;
  notes: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface ProfitLossMonth {
  month: string;
  revenue: number;
  directCosts: number;
  laborCosts: number;
  operatingExpenses: number;
  netProfit: number;
  marginPercent: number;
}

export interface ProfitLossData {
  fiscalYear: string;
  totalRevenue: number;
  totalDirectCosts: number;
  totalLaborExpenses: number;
  totalOperatingExpenses: number;
  totalNetProfit: number;
  overallMarginPercent: number;
  monthlyBreakdown: ProfitLossMonth[];
}

export type AuditAction = 
  | 'user_created'
  | 'otp_sent'
  | 'otp_verified'
  | 'login'
  | 'logout'
  | 'user_activated'
  | 'user_deactivated'
  | 'user_removed'
  | 'permissions_changed'
  | 'data_synced'
  | 'offline_queued'
  | 'unauthorized_access_attempt';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  performedBy: {
    id: string;
    name: string;
    role: UserRole;
  };
  targetUser?: {
    id: string;
    name: string;
    mobile: string;
  };
  details: string;
  ipAddress: string;
  device: string;
}

export type NetworkMode = 'online' | 'offline' | 'slow';
export type SyncStatus = 'idle' | 'syncing' | 'completed' | 'failed';

export interface PendingQueueItem {
  id: string;
  entityType: 'customer' | 'job' | 'work_report' | 'payment' | 'staff';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  payload: any;
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

export interface SyncEngineState {
  networkMode: NetworkMode;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  pendingItems: PendingQueueItem[];
  failedItems: PendingQueueItem[];
}
