"use client";

import React, { useState } from "react";
import { Property, RoomType } from "@/lib/api/types";
import { api } from "@/lib/api";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { MoneyText } from "@/components/data/MoneyText";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { BASE_DATE } from "@/config/constants";
import { MapPin, Phone, Mail, Users, Bed, Check, Sparkles, Search } from "lucide-react";

interface PropertyGuestViewProps {
  property: Property;
  roomTypes: RoomType[];
}

export function PropertyGuestView({ property, roomTypes }: PropertyGuestViewProps) {
  const [startDate, setStartDate] = useState(BASE_DATE);
  const [endDate, setEndDate] = useState("2026-10-14");
  const [availability, setAvailability] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await api.getPublicAvailability(property.id, { checkIn: startDate, checkOut: endDate });
      setAvailability(res);
    } catch {
      // fallback
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Property Hero */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.image_url}
          alt={property.name}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-white space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khách sạn tiêu chuẩn cao cấp</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{property.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {property.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {property.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              {property.email}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        {/* Availability Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Chọn ngày lưu trú [Nhận phòng - Trả phòng]
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                minDate={BASE_DATE}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all h-[38px]"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? "Đang tra cứu..." : "Tìm phòng trống & Giá"}</span>
            </button>
          </div>
        </div>

        {/* Room Types Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Các Hạng Phòng Đang Phục Vụ
            </h2>
            <span className="text-xs text-slate-500">{roomTypes.length} loại phòng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((rt) => {
              const avail = availability?.find((a: any) => a.roomType?.id === rt.id);
              const remaining = avail ? avail.availableRoomsCount : rt.number_of_rooms;

              return (
                <div
                  key={rt.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rt.image_url}
                      alt={rt.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                      {remaining > 0 ? (
                        <span className="text-emerald-400">Còn {remaining} phòng trống</span>
                      ) : (
                        <span className="text-rose-400">Đã hết phòng</span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {rt.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{rt.description}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          {rt.capacity} người
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-indigo-500" />
                          {rt.bed_type}
                        </span>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {rt.amenities.slice(0, 4).map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[10px]"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Giá từ</span>
                        <MoneyText
                          amount={avail?.rate || (rt.id.includes("suite") ? 2400000 : 1200000)}
                          className="text-lg font-extrabold text-blue-600 dark:text-blue-400"
                        />
                        <span className="text-[10px] text-slate-400">/đêm</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Quý khách muốn đặt phòng ${rt.name}. Vui lòng liên hệ hotline ${property.phone} hoặc trao đổi trực tiếp với Trợ lý AI ở góc màn hình!`)}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                      >
                        Đặt phòng này
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Guest Chatbot (FR-O45) */}
      <ChatWidget mode="guest" propertyId={property.id} isFloating />
    </div>
  );
}
