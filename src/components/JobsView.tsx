import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Tag,
  DollarSign,
} from 'lucide-react';
import { Job, JobStatus, JobPriority, User as UserType } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface JobsViewProps {
  currentUser: UserType | null;
}

export const JobsView: React.FC<JobsViewProps> = ({ currentUser }) => {
  const canCreateJobs = currentUser?.role === 'owner' || currentUser?.permissions.canCreateJobs;
  const jobs = CloudSyncService.getJobs();
  const customers = CloudSyncService.getCustomers();
  const allUsers = CloudSyncService.getUsers().filter((u) => u.status === 'active');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [jobCode, setJobCode] = useState(`MAT-2026-0${Math.floor(85 + Math.random() * 20)}`);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [assignedStaffId, setAssignedStaffId] = useState(currentUser?.id || allUsers[1]?.id || '');
  const [status, setStatus] = useState<JobStatus>('in_progress');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedBudget, setEstimatedBudget] = useState(35000);
  const [description, setDescription] = useState('');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingJob(null);
    setTitle('');
    setJobCode(`MAT-2026-0${Math.floor(86 + Math.random() * 20)}`);
    setCustomerId(customers[0]?.id || '');
    setAssignedStaffId(currentUser?.id || allUsers[1]?.id || '');
    setStatus('in_progress');
    setPriority('medium');
    setLocation('');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setEstimatedBudget(30000);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setJobCode(job.jobCode);
    setCustomerId(job.customerId);
    setAssignedStaffId(job.assignedStaffId);
    setStatus(job.status);
    setPriority(job.priority);
    setLocation(job.location);
    setScheduledDate(job.scheduledDate);
    setEstimatedBudget(job.estimatedBudget);
    setDescription(job.description);
    setIsModalOpen(true);
  };

  const handleStatusChange = (job: Job, newStatus: JobStatus) => {
    CloudSyncService.saveJob(
      {
        ...job,
        status: newStatus,
      },
      job.id
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCust = customers.find((c) => c.id === customerId);
    const selectedStaff = allUsers.find((u) => u.id === assignedStaffId);

    CloudSyncService.saveJob(
      {
        jobCode,
        title,
        customerId,
        customerName: selectedCust?.company || 'Corporate Client',
        assignedStaffId,
        assignedStaffName: selectedStaff?.name || 'Assigned Engineer',
        status,
        priority,
        location,
        scheduledDate,
        estimatedBudget: Number(estimatedBudget) || 0,
        description,
      },
      editingJob?.id
    );
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: JobPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/80';
      case 'high':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      case 'medium':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/80';
      case 'low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (s: JobStatus) => {
    switch (s) {
      case 'in_progress':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80';
      case 'completed':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      case 'on_hold':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      case 'pending':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'invoiced':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Service Requests & Project Jobs</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {jobs.length} Total Jobs
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
            متابعة مشاريع التأسيس والفحص والتقارير الميدانية وتكليف المهندسين
          </p>
        </div>

        {canCreateJobs && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by code, title, customer, or tech..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">Status:</span>
          {(['all', 'in_progress', 'completed', 'pending', 'on_hold'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-3 relative group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 font-mono text-xs font-bold text-amber-400 border border-slate-700">
                  {job.jobCode}
                </span>
                <h3 className="font-bold text-sm text-slate-100">{job.title}</h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getPriorityBadge(
                    job.priority
                  )}`}
                >
                  {job.priority} Priority
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getStatusBadge(
                    job.status
                  )}`}
                >
                  {job.status.replace('_', ' ')}
                </span>

                {job.syncStatus === 'pending' ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/80 text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending Sync
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Cloud Synced
                  </span>
                )}

                <button
                  onClick={() => handleOpenEdit(job)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Edit Job"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{job.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Client Company</span>
                <span className="text-slate-200 font-medium truncate block">{job.customerName}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Assigned Specialist</span>
                <span className="text-cyan-300 font-medium flex items-center gap-1 truncate">
                  <User className="w-3 h-3 flex-shrink-0" />
                  {job.assignedStaffName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Site Location</span>
                <span className="text-slate-200 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0 text-slate-500" />
                  {job.location}
                </span>
              </div>

              <div className="text-right sm:text-left">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Budget (SAR)</span>
                <span className="font-mono text-amber-400 font-bold">
                  SAR {job.estimatedBudget.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Inline Fast Status Switcher */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Advance Job Lifecycle:</span>
              <div className="flex items-center gap-1">
                {(['pending', 'in_progress', 'on_hold', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    disabled={job.status === s}
                    onClick={() => handleStatusChange(job, s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      job.status === s
                        ? 'bg-amber-500 text-slate-950 font-bold cursor-default'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">{editingJob ? 'Edit Job Order' : 'Create Job Dispatch'}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Concrete Compression Test Series"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Job Code</label>
                  <input
                    type="text"
                    required
                    value={jobCode}
                    onChange={(e) => setJobCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Customer / Client</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assigned Specialist</label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="invoiced">Invoiced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as JobPriority)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Budget (SAR)</label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Site Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Plot / District / City"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Scheduled Target Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Work Scope & Specifications</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed instructions for field staff..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save & Synchronize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
