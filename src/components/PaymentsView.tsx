import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Building2,
  DollarSign,
  Receipt,
  FileCheck2,
  X,
} from 'lucide-react';
import { Payment, PaymentMethod, User as UserType } from '../types';
import { CloudSyncService } from '../services/cloudSyncService';

interface PaymentsViewProps {
  currentUser: UserType | null;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ currentUser }) => {
  const canLog = currentUser?.role === 'owner' || currentUser?.permissions.canLogPayments;
  const payments = CloudSyncService.getPayments();
  const customers = CloudSyncService.getCustomers();
  const jobs = CloudSyncService.getJobs();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [receiptNumber, setReceiptNumber] = useState(`REC-2026-0${Math.floor(200 + Math.random() * 50)}`);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [jobId, setJobId] = useState(jobs[0]?.id || '');
  const [amount, setAmount] = useState<number>(25000);
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const filteredPayments = payments.filter(
    (p) =>
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.collectedByStaffName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleOpenAdd = () => {
    setReceiptNumber(`REC-2026-0${Math.floor(200 + Math.random() * 50)}`);
    setCustomerId(customers[0]?.id || '');
    setJobId(jobs[0]?.id || '');
    setAmount(20000);
    setMethod('bank_transfer');
    setReferenceNumber(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);

    CloudSyncService.savePayment({
      receiptNumber,
      jobId,
      customerId,
      customerName: cust?.company || 'Corporate Client',
      amount: Number(amount) || 0,
      method,
      referenceNumber,
      collectedByStaffId: currentUser?.id || 'usr_staff_default',
      collectedByStaffName: currentUser?.name || 'Staff Member',
      date,
      notes,
    });

    setIsModalOpen(false);
  };

  const getMethodBadge = (m: PaymentMethod) => {
    switch (m) {
      case 'bank_transfer':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      case 'pos_card':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80';
      case 'cash':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      case 'cheque':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Payments & Receipt Vouchers</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {payments.length} Vouchers
            </span>
          </div>
          <p className="text-xs text-slate-400 font-['Tajawal'] mt-0.5">
            سندات القبض الميدانية وتحصيل الدفعات ومطابقة الحسابات البنكية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Collections</span>
            <span className="font-mono text-emerald-400 font-black text-sm">
              SAR {totalCollected.toLocaleString()}
            </span>
          </div>

          {canLog && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Received Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search receipt, customer, or transaction ID..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Receipt No.</th>
                <th className="px-4 py-3">Customer Entity</th>
                <th className="px-4 py-3">Amount (SAR)</th>
                <th className="px-4 py-3">Method & Reference</th>
                <th className="px-4 py-3">Collected By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No payment vouchers recorded.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">
                      <div className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>{p.receiptNumber}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-200">
                      {p.customerName}
                    </td>

                    <td className="px-4 py-3 font-mono text-sm font-black text-emerald-400">
                      SAR {p.amount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${getMethodBadge(
                          p.method
                        )}`}
                      >
                        {p.method.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.referenceNumber}</div>
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{p.collectedByStaffName}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-400 font-mono">{p.date}</td>

                    <td className="px-4 py-3 text-right">
                      {p.syncStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/80 text-[10px] font-semibold">
                          <Clock className="w-3 h-3" />
                          Pending Sync
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Cloud Synced
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Log Payment Receipt Voucher</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Amount (SAR)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Client Entity</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company} (Bal: SAR {c.outstandingBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Associated Job</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.jobCode} - {j.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Instrument</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="bank_transfer">Bank Transfer (سداد / تحويل)</option>
                    <option value="pos_card">POS Card / Mada (شبكة مدى)</option>
                    <option value="cash">Cash (نقدي)</option>
                    <option value="cheque">Bank Cheque (شيك مصرفي)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bank Reference / TXN ID</label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="TXN-XXXXXX"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Collection Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50% advance milestone deposit..."
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
                  Save & Sync Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
