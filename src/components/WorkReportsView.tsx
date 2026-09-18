import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Layers,
  FileCheck,
  X,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { WorkReport, WorkReportChecklistItem, User as UserType } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface WorkReportsViewProps {
  currentUser: UserType | null;
}

export const WorkReportsView: React.FC<WorkReportsViewProps> = ({ currentUser }) => {
  const canSubmit = currentUser?.role === 'owner' || currentUser?.permissions.canSubmitReports;
  const reports = CloudSyncService.getWorkReports();
  const jobs = CloudSyncService.getJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New report form state
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState<number>(6.0);
  const [summary, setSummary] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [clientSignatureName, setClientSignatureName] = useState('');
  const [checklistItems, setChecklistItems] = useState<WorkReportChecklistItem[]>([
    { id: '1', task: 'Pre-inspection site safety audit', done: true },
    { id: '2', task: 'Calibrate measurement apparatus', done: true },
    { id: '3', task: 'Complete specimen analysis protocol', done: true },
  ]);
  const [newChecklistTask, setNewChecklistTask] = useState('');

  const filteredReports = reports.filter(
    (r) =>
      r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddChecklistItem = () => {
    if (!newChecklistTask.trim()) return;
    setChecklistItems([
      ...checklistItems,
      { id: Date.now().toString(), task: newChecklistTask.trim(), done: true },
    ]);
    setNewChecklistTask('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobs.find((j) => j.id === selectedJobId) || jobs[0];

    CloudSyncService.saveWorkReport({
      jobId: job.id,
      jobCode: job.jobCode,
      jobTitle: job.title,
      staffId: currentUser?.id || 'usr_staff_default',
      staffName: currentUser?.name || 'Field Engineer',
      date,
      hoursWorked: Number(hoursWorked) || 0,
      summary,
      checklist: checklistItems,
      materialsUsed,
      clientSignatureName,
    });

    setIsModalOpen(false);
    setSummary('');
    setMaterialsUsed('');
    setClientSignatureName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Field Work & Inspection Reports</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {reports.length} Signed Reports
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
            تقارير الإنجاز اليومية المعتمدة وتوقيعات المهندسين والعملاء
          </p>
        </div>

        {canSubmit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Daily Field Report</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by job code, summary, or engineer..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] font-bold text-amber-400 border border-slate-700">
                  {report.jobCode}
                </span>
                <h3 className="font-bold text-sm text-slate-100 mt-1">{report.jobTitle}</h3>
              </div>

              {report.syncStatus === 'pending' ? (
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
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200">{report.staffName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{report.date}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{report.hoursWorked} hrs logged</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
              {report.summary}
            </p>

            {/* Checklist */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Field Inspection Checklist:
              </span>
              <div className="space-y-1">
                {report.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{item.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {report.materialsUsed && (
              <div className="text-xs text-slate-400">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Materials / Reagents:</span>
                <span className="text-slate-300">{report.materialsUsed}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Client Sign-Off Representative:</span>
              <span className="text-slate-200 font-semibold">{report.clientSignatureName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT REPORT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Submit Field Work Report</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Project Job</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jobCode} - {j.title} ({j.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Date Conducted</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Executive Summary & Observations</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize site findings, testing values, or execution progress..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dynamic Checklist */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Completed Quality Verification Checklist
                </label>
                <div className="space-y-1.5 mb-2">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-200">{item.task}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChecklistTask}
                    onChange={(e) => setNewChecklistTask(e.target.value)}
                    placeholder="Add inspection task item..."
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Materials / Equipment Consumed</label>
                <input
                  type="text"
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  placeholder="e.g. Test cylinders, epoxy sealant 10kg, sensors..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Client Engineer / Representative Sign-Off
                </label>
                <input
                  type="text"
                  required
                  value={clientSignatureName}
                  onChange={(e) => setClientSignatureName(e.target.value)}
                  placeholder="Full name of client site supervisor"
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
                  Submit & Sync to Cloud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
