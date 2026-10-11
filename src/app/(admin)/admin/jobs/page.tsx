// FR: FR-S07, FR-S20, FR-S21
// Service: api.runExpiryCheckJob, api.runRenewalReminderJob, api.adminListJobLogs
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobLogManagement } from "@/features/admin/components/JobLogManagement";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const logs = await api.adminListJobLogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật Ký Tác Vụ Định Kỳ (Scheduled Background Jobs)"
        description="Theo dõi lịch sử chạy ngầm của các tiến trình quét hạn thuê bao, gửi thông báo nhắc phí và kích hoạt thử nghiệm."
      />
      <JobLogManagement initialLogs={logs} />
    </div>
  );
}
