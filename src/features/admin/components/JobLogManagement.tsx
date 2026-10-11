"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Play, Clock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export function JobLogManagement({ initialLogs }: { initialLogs: any[] }) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const handleRunExpiryJob = async () => {
    setRunningJob("expiry");
    try {
      const res = await api.runExpiryCheckJob();
      setLogs((prev) => [res, ...prev]);
      toast.success(res.details || "Đã chạy tác vụ kiểm tra kỳ hạn thuê bao.");
    } catch {
      toast.error("Không thể chạy tác vụ kiểm tra kỳ hạn.");
    } finally {
      setRunningJob(null);
    }
  };

  const handleRunReminderJob = async () => {
    setRunningJob("reminder");
    try {
      const res = await api.runRenewalReminderJob();
      setLogs((prev) => [res, ...prev]);
      toast.success(res.details || "Đã chạy tác vụ gửi email/thông báo nhắc hạn.");
    } catch {
      toast.error("Không thể chạy tác vụ nhắc hạn.");
    } finally {
      setRunningJob(null);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "Mã tác vụ",
      render: (l) => <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{l.id}</span>,
    },
    {
      key: "job_name",
      header: "Tên tiến trình định kỳ",
      sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{l.job_name}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Kết quả & Chi tiết xử lý",
      render: (l) => (
        <div>
          <div className="text-xs text-slate-800 dark:text-slate-200">{l.details}</div>
          <div className="text-[11px] text-slate-400">Số bản ghi duyệt qua: {l.processed_count}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (l) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            l.status === "SUCCESS"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
          }`}
        >
          {l.status === "SUCCESS" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          <span>{l.status}</span>
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Thời điểm chạy",
      sortable: true,
      render: (l) => <DateText date={l.created_at} type="datetime" className="text-xs text-slate-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Manual Run Job Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kích Hoạt Tác Vụ Cron-Job Bằng Tay</h3>
            <p className="text-xs text-slate-400">
              Dành riêng cho môi trường thử nghiệm và demo, cho phép mô phỏng hành vi của các daemon nền tảng.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleRunExpiryJob}
            disabled={!!runningJob}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
          >
            {runningJob === "expiry" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Chạy Kiểm Tra Kỳ Hạn (Expiry Check)</span>
          </button>

          <button
            onClick={handleRunReminderJob}
            disabled={!!runningJob}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {runningJob === "reminder" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Chạy Gửi Nhắc Hạn (Renewal Reminders)</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Nhật ký thực thi hệ thống ({logs.length})
        </h3>
        <DataTable columns={columns} data={logs} exportFileName="nhat-ky-cron-jobs" />
      </div>
    </div>
  );
}
