"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader } from "@/components/forms/ImageUploader";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Hotel, Save, Trash2, ArrowLeft } from "lucide-react";

export function PropertyForm({
  initialData,
  isEdit = false,
}: {
  initialData?: any;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(
    initialData?.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim() || !email.trim()) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && initialData?.id) {
        await api.updateProperty(initialData.id, {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          description: description.trim(),
          image_url: imageUrl,
        });
        toast.success("Đã cập nhật thông tin khách sạn thành công!");
      } else {
        const created = await api.createProperty({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          description: description.trim(),
          image_url: imageUrl,
        });
        toast.success("Đã tạo mới khách sạn thành công!");
        router.push(`/owner/properties/${created.id}/setup`);
        return;
      }
      router.refresh();
      router.push("/owner/properties");
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu thông tin khách sạn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await api.deleteProperty(initialData.id);
      toast.success("Đã xóa khách sạn thành công.");
      router.push("/owner/properties");
    } catch {
      toast.error("Không thể xóa khách sạn này.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/owner/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khách sạn</span>
        </Link>

        {isEdit && (
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl dark:bg-rose-950/40 dark:text-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa khách sạn này</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEdit ? `Chỉnh Sửa Khách Sạn: ${initialData?.name}` : "Tạo Mới Cơ Sở Khách Sạn"}
              </h2>
              <p className="text-xs text-slate-400">Nhập đầy đủ thông tin pháp lý và liên hệ</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo khách sạn"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên khách sạn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Khách Sạn ABC Grand Luxury"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Địa chỉ chi tiết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ví dụ: 123 Đường Trần Phú, Quận Ba Đình, Hà Nội"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hotline / Điện thoại lễ tân <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 3828 9999"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="booking@hotelabc.vn"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả giới thiệu</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu vị trí đắc địa, cảnh quan, số lượng phòng và dịch vụ nổi bật..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hình ảnh đại diện</label>
            <ImageUploader value={imageUrl} onChange={(url) => setImageUrl(url)} />
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Xác nhận xóa khách sạn"
        description={`Bạn có chắc chắn muốn xóa khách sạn "${initialData?.name}"? Toàn bộ loại phòng, phòng và dữ liệu cấu hình liên quan sẽ bị xóa vĩnh viễn.`}
        confirmText="Xóa khách sạn"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
