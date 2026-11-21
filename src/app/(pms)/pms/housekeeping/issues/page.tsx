"use client";

// API thật: GET/POST /api/properties/{id}/housekeeping/issues, PATCH .../issues/{issueId}/resolution
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { HousekeepingIssuesView } from "@/features/housekeeping/components/HousekeepingIssuesView";

export default function HousekeepingIssuesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sự Cố Phòng" description="Ghi nhận hỏng hóc, thất lạc trong phòng và theo dõi cách xử lý." />
      <HousekeepingIssuesView />
    </div>
  );
}
