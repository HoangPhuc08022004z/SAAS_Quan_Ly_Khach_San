export interface RoomCheckinState {
  roomId: string;
  roomNumber: string;
  status: "READY" | "OCCUPIED" | "VACANT_DIRTY" | "CLEANING" | "MAINTENANCE";
  hasUnresolvedIssue?: boolean;
}

export function canCheckInReservation(
  reservationStatus: string,
  rooms: RoomCheckinState[]
): { canCheckIn: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (reservationStatus !== "CONFIRMED") {
    reasons.push(`Đặt phòng đang ở trạng thái "${reservationStatus}", chỉ có thể nhận phòng khi "CONFIRMED".`);
  }

  if (rooms.length === 0) {
    reasons.push("Chưa có phòng nào được gán cho đặt phòng này.");
  }

  for (const r of rooms) {
    if (r.status !== "READY") {
      reasons.push(`Phòng ${r.roomNumber} chưa sẵn sàng (trạng thái hiện tại: ${r.status}).`);
    }
    if (r.hasUnresolvedIssue) {
      reasons.push(`Phòng ${r.roomNumber} có sự cố buồng phòng chưa được giải quyết.`);
    }
  }

  return {
    canCheckIn: reasons.length === 0,
    reasons,
  };
}
