"use client";

import React, { useState, useMemo } from "react";
import { Download, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { EmptyState } from "../feedback/EmptyState";
import { ErrorState } from "../feedback/ErrorState";
import { TableSkeleton } from "../feedback/Skeletons";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => any;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  traceId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  exportFileName?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  isError,
  errorMessage,
  traceId,
  emptyTitle = "Không có dữ liệu",
  emptyDescription = "Hiện chưa có bản ghi nào để hiển thị.",
  pageSize = 10,
  exportFileName = "danh-sach-du-lieu",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleColKeys, setVisibleColKeys] = useState<string[]>(() => columns.map((c) => c.key));
  const [showColMenu, setShowColMenu] = useState(false);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    return [...data].sort((a, b) => {
      const valA = col?.accessor ? col.accessor(a) : a[sortKey];
      const valB = col?.accessor ? col.accessor(b) : b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      const cmp = valA > valB ? 1 : -1;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortOrder, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const toggleColumn = (key: string) => {
    setVisibleColKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const exportCSV = () => {
    if (!data.length) return;
    const visibleCols = columns.filter((c) => visibleColKeys.includes(c.key));
    const headers = visibleCols.map((c) => c.header);

    const rows = sortedData.map((row) => {
      return visibleCols
        .map((c) => {
          const val = c.accessor ? c.accessor(row) : row[c.key];
          if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />;
  }

  if (isError) {
    return (
      <ErrorState
        message={errorMessage || "Không thể tải danh sách dữ liệu."}
        traceId={traceId}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const activeColumns = columns.filter((c) => visibleColKeys.includes(c.key));

  return (
    <div className="space-y-3">
      {/* Table toolbar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Tổng cộng: <strong className="font-semibold text-slate-900 dark:text-white">{data.length}</strong> bản ghi
        </div>
        <div className="flex items-center gap-2">
          {/* Column Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColMenu(!showColMenu)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Tùy chỉnh cột hiển thị"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Cột ({activeColumns.length}/{columns.length})</span>
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-30">
                <div className="text-xs font-semibold px-2 py-1 text-slate-500">Hiển thị cột:</div>
                <div className="max-h-52 overflow-y-auto space-y-1">
                  {columns.map((c) => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColKeys.includes(c.key)}
                        onChange={() => toggleColumn(c.key)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span>{c.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCSV}
            disabled={data.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Xuất bảng ra file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                {activeColumns.map((col) => (
                  <th key={col.key} className="px-4 py-3">
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white uppercase font-semibold text-xs"
                      >
                        <span>{col.header}</span>
                        <ArrowUpDown className="w-3 h-3" />
                        {sortKey === col.key && (sortOrder === "asc" ? "▲" : "▼")}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={row.id || rowIdx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {activeColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-200">
                        {col.render ? col.render(row) : col.accessor ? col.accessor(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeColumns.length} className="py-12">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 text-xs dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Trang {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
