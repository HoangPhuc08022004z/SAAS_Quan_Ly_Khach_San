"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Shield,
  KeyRound,
  Edit2,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";

export function StaffConfig({
  propertyId,
  roles,
  permissions,
  initialStaff,
}: {
  propertyId: string;
  roles: any[];
  permissions: any[];
  initialStaff: any[];
}) {
  const [activeTab, setActiveTab] = useState<"STAFF" | "ROLES">("STAFF");
  const [staffList, setStaffList] = useState<any[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [staffForPasswordReset, setStaffForPasswordReset] = useState<any | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState(roles[1]?.id || roles[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setRoleId(roles[1]?.id || roles[0]?.id || "");
    setIsModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setEditingStaff(staff);
    setFullName(staff.full_name);
    setEmail(staff.email);
    setPhone(staff.phone || "");
    setRoleId(staff.role_id || staff.role?.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Vui lòng điền họ tên và email.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, {
          full_name: fullName.trim(),
          phone: phone.trim(),
        });
        await api.setStaffRole(editingStaff.id, roleId);
        const selectedRole = roles.find((r) => r.id === roleId);
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id
              ? { ...s, full_name: fullName.trim(), phone: phone.trim(), role_id: roleId, role: selectedRole }
              : s
          )
        );
        toast.success("Đã cập nhật nhân viên thành công!");
      } else {
        const created = await api.createStaff(propertyId, {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role_id: roleId,
        });
        const selectedRole = roles.find((r) => r.id === roleId);
        setStaffList((prev) => [...prev, { ...created, role: selectedRole }]);
        toast.success("Đã tạo mới nhân viên thành công! Mật khẩu mặc định: 123456");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu nhân viên.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (staff: any) => {
    const nextStatus: "ACTIVE" | "INACTIVE" = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.setStaffStatus(staff.id, nextStatus);
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, status: nextStatus } : s))
      );
      toast.success(`Đã đổi trạng thái tài khoản sang: ${nextStatus === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}`);
    } catch {
      toast.error("Không thể thay đổi trạng thái nhân viên.");
    }
  };

  const handleResetPassword = async () => {
    if (!staffForPasswordReset) return;
    try {
      await api.resetStaffPassword(staffForPasswordReset.id);
      toast.success(`Mật khẩu của ${staffForPasswordReset.full_name} đã được đặt lại về: 123456`);
      setStaffForPasswordReset(null);
    } catch {
      toast.error("Không thể đặt lại mật khẩu.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "full_name",
      header: "Họ và tên nhân viên",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white">{s.full_name}</div>
          <div className="text-[11px] text-slate-400">{s.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Số điện thoại",
      render: (s) => <span className="text-xs text-slate-500">{s.phone || "Chưa cập nhật"}</span>,
    },
    {
      key: "role",
      header: "Vai trò (Role)",
      render: (s) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Shield className="w-3 h-3" />
          <span>{s.role?.name || s.role_id}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (s) => (
        <button
          onClick={() => handleToggleStatus(s)}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
            s.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400"
          }`}
        >
          {s.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEditModal(s)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Đổi vai trò & sửa thông tin"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStaffForPasswordReset(s)}
            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            title="Đặt lại mật khẩu"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigation tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl dark:bg-slate-800 max-w-xs">
        <button
          onClick={() => setActiveTab("STAFF")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "STAFF"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Danh sách nhân viên ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab("ROLES")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "ROLES"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Role & Quyền ({roles.length})
        </button>
      </div>

      {activeTab === "STAFF" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tài Khoản Nhân Viên Khách Sạn
              </h3>
              <p className="text-xs text-slate-400">
                Nhân viên dùng tài khoản này để đăng nhập vào cổng vận hành khách sạn (/pms/login).
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhân viên</span>
            </button>
          </div>

          <DataTable columns={columns} data={staffList} exportFileName="nhan-vien-khach-san" />
        </div>
      )}

      {activeTab === "ROLES" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-200">
            <span className="font-bold">Quy tắc BR-C04:</span> Hệ thống sử dụng 3 vai trò tiêu chuẩn cố định (Quản lý khách sạn, Nhân viên lễ tân, Nhân viên buồng phòng) với 26 phân quyền chức năng rõ ràng. Không hỗ trợ thêm/xóa vai trò tự do để đảm bảo an toàn nghiệp vụ.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roles.map((r) => (
              <div
                key={r.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{r.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{r.code}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">{r.description}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Quyền hạn tương ứng:
                  </span>
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto pr-1">
                    {permissions.map((p) => {
                      const hasPerm =
                        r.code === "MANAGER"
                          ? true
                          : r.code === "RECEPTIONIST"
                          ? ["CHECKIN", "CHECKOUT", "ROOM_VIEW", "RESERVATION_CREATE", "FNB_ORDER"].some((k) => p.code.includes(k))
                          : ["ROOM_VIEW", "HK_UPDATE", "ISSUE_CREATE"].some((k) => p.code.includes(k));
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between text-[11px] py-0.5 ${
                            hasPerm ? "text-slate-800 dark:text-slate-200" : "text-slate-300 dark:text-slate-700"
                          }`}
                        >
                          <span>{p.name}</span>
                          {hasPerm && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingStaff ? "Chỉnh Sửa Thông Tin Nhân Viên" : "Tạo Mới Tài Khoản Nhân Viên"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Họ và tên nhân viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email đăng nhập PMS <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingStaff}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="letan@hotel.vn"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Vai trò (Role) gán cho nhân viên <span className="text-rose-500">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSaving ? "Đang lưu..." : "Lưu tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!staffForPasswordReset}
        title="Đặt lại mật khẩu nhân viên"
        description={`Bạn có chắc muốn đặt lại mật khẩu cho "${staffForPasswordReset?.full_name}"? Mật khẩu mới sẽ được gán mặc định là: 123456`}
        confirmText="Đặt lại mật khẩu"
        onConfirm={handleResetPassword}
        onClose={() => setStaffForPasswordReset(null)}
      />
    </div>
  );
}
