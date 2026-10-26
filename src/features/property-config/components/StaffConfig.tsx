"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { userApi, type ApiRole, type ApiUserSummary } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Shield, Edit2, Lock, X } from "lucide-react";

export function StaffConfig({
  propertyId,
  roles,
  initialStaff,
}: {
  propertyId: string;
  roles: ApiRole[];
  initialStaff: ApiUserSummary[];
}) {
  const [activeTab, setActiveTab] = useState<"STAFF" | "ROLES">("STAFF");
  const [staffList, setStaffList] = useState<ApiUserSummary[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<ApiUserSummary | null>(null);
  const [staffToDeactivate, setStaffToDeactivate] = useState<ApiUserSummary | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number>(roles[0]?.roleId ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = async () => setStaffList(await userApi.list(propertyId));

  const openCreateModal = () => {
    setEditingStaff(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRoleId(roles[0]?.roleId ?? 0);
    setIsModalOpen(true);
  };

  const openEditModal = (staff: ApiUserSummary) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setPhone(staff.phone || "");
    setPassword("");
    setRoleId(staff.roleId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !roleId) {
      toast.error("Vui lòng điền họ tên, email và chọn vai trò.");
      return;
    }
    if (!editingStaff && password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingStaff) {
        // Gọi OpenAPI: PUT /api/properties/{propertyId}/users/{userId}
        await userApi.update(propertyId, editingStaff.userId, {
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          roleId,
        });
        toast.success("Đã cập nhật nhân viên thành công!");
      } else {
        // Gọi OpenAPI: POST /api/properties/{propertyId}/users
        await userApi.create(propertyId, {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          roleId,
        });
        toast.success("Đã tạo mới nhân viên thành công!");
      }
      await refresh();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu nhân viên.");
    } finally {
      setIsSaving(false);
    }
  };

  // Backend chỉ có vô hiệu hóa (không xóa vật lý, không có API kích hoạt lại)
  const handleDeactivate = async () => {
    if (!staffToDeactivate) return;
    try {
      // Gọi OpenAPI: DELETE /api/properties/{propertyId}/users/{userId}
      const res = await userApi.deactivate(propertyId, staffToDeactivate.userId);
      toast.success(res?.message || "Đã vô hiệu hóa tài khoản nhân viên.");
      await refresh();
    } catch (err: any) {
      toast.error(err?.message || "Không thể vô hiệu hóa nhân viên này.");
    } finally {
      setStaffToDeactivate(null);
    }
  };

  const columns: Column<ApiUserSummary>[] = [
    {
      key: "fullName",
      header: "Họ và tên nhân viên",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white">{s.fullName}</div>
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
      key: "roleName",
      header: "Vai trò (Role)",
      render: (s) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Shield className="w-3 h-3" />
          <span>{s.roleName}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (s) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            s.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
          }`}
        >
          {s.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
        </span>
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
          {s.status === "ACTIVE" && (
            <button
              onClick={() => setStaffToDeactivate(s)}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Vô hiệu hóa tài khoản"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex p-1 bg-slate-100 rounded-xl dark:bg-slate-800 max-w-xs">
        {(["STAFF", "ROLES"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            {tab === "STAFF" ? `Danh sách nhân viên (${staffList.length})` : `Vai trò (${roles.length})`}
          </button>
        ))}
      </div>

      {activeTab === "STAFF" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tài Khoản Nhân Viên Khách Sạn</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map((r) => (
            <div
              key={r.roleId}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{r.name}</h4>
              </div>
              <p className="text-xs text-slate-500">{r.description || "Chưa có mô tả."}</p>
            </div>
          ))}
        </div>
      )}

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

            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Họ và tên nhân viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
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
                  autoComplete="off"
                  disabled={!!editingStaff}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="letan@hotel.vn"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white disabled:opacity-60"
                />
              </div>

              {!editingStaff && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu (8–72 ký tự) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                <input
                  type="text"
                  maxLength={20}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Vai trò (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>
                      {r.name}
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
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
                >
                  {isSaving ? "Đang lưu..." : "Lưu tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!staffToDeactivate}
        title="Vô hiệu hóa tài khoản nhân viên"
        description={`Tài khoản "${staffToDeactivate?.fullName}" sẽ không thể đăng nhập nữa. Hệ thống không xóa dữ liệu và hiện chưa có chức năng kích hoạt lại.`}
        confirmText="Vô hiệu hóa"
        variant="destructive"
        onConfirm={handleDeactivate}
        onClose={() => setStaffToDeactivate(null)}
      />
    </div>
  );
}
