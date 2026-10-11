import { describe, it, expect } from "vitest";
import {
  canActivateSubscription,
  canRenewSubscription,
  isSubscriptionExpired,
  calculateNewEndDate,
} from "./subscriptionRules";
import {
  canCreateProperty,
  canCreateRoom,
  canCreateUser,
  canUploadStorage,
  isTenantOperational,
} from "./tenantRules";
import {
  isDateRangeOverlap,
  isRoomAvailableForDates,
  calculateDepositRequired,
} from "./bookingRules";
import { canCheckInReservation } from "./checkinRules";
import { calculateBalance, canCheckOut, needsRefundOnCheckout } from "./checkoutRules";
import { calculateCancellationQuote, canCancelReservation } from "./cancellationRules";
import { isNoShowCandidate, calculateNoShowDepositSettlement } from "./noShowRules";
import { calculateSellingPrice, canOrderFnb, requiresFnbApproval } from "./fnbRules";
import { canConfirmDailyStats, validateAdjustment } from "./statsRules";

describe("Business Rules Unit Tests", () => {
  describe("subscriptionRules", () => {
    it("canActivateSubscription only when status is PENDING/EXPIRED and payment is SUCCESS", () => {
      expect(canActivateSubscription("PENDING", "SUCCESS")).toBe(true);
      expect(canActivateSubscription("PENDING", "FAILED")).toBe(false);
      expect(canActivateSubscription("CANCELLED", "SUCCESS")).toBe(false);
    });

    it("canRenewSubscription when ACTIVE or EXPIRED", () => {
      expect(canRenewSubscription("ACTIVE")).toBe(true);
      expect(canRenewSubscription("EXPIRED")).toBe(true);
      expect(canRenewSubscription("CANCELLED")).toBe(false);
    });

    it("isSubscriptionExpired detects past end_date relative to reference date", () => {
      expect(isSubscriptionExpired("2026-10-01", "2026-10-11")).toBe(true);
      expect(isSubscriptionExpired("2026-10-20", "2026-10-11")).toBe(false);
    });

    it("calculateNewEndDate adds duration correctly", () => {
      const newEnd = calculateNewEndDate("2026-12-01", 1, "MONTH", "2026-10-11");
      expect(newEnd).toBe("2027-01-01");
    });
  });

  describe("tenantRules", () => {
    it("enforces max_properties and max_rooms limits", () => {
      expect(canCreateProperty(2, 3)).toBe(true);
      expect(canCreateProperty(3, 3)).toBe(false);
      expect(canCreateRoom(50, 50)).toBe(false);
      expect(canCreateRoom(49, 50)).toBe(true);
    });

    it("enforces storage limits", () => {
      expect(canUploadStorage(1000, 500, 2000)).toBe(true);
      expect(canUploadStorage(1800, 300, 2000)).toBe(false);
    });

    it("isTenantOperational only when both tenant and subscription are ACTIVE", () => {
      expect(isTenantOperational("ACTIVE", "ACTIVE")).toBe(true);
      expect(isTenantOperational("SUSPENDED", "ACTIVE")).toBe(false);
      expect(isTenantOperational("ACTIVE", "EXPIRED")).toBe(false);
    });
  });

  describe("bookingRules", () => {
    it("detects date range overlap accurately [checkIn, checkOut)", () => {
      // res 1: 10/10 to 15/10
      // query 1: 12/10 to 14/10 -> overlaps
      expect(isDateRangeOverlap("2026-10-12", "2026-10-14", "2026-10-10", "2026-10-15")).toBe(true);
      // query 2: 15/10 to 18/10 -> no overlap (checkOut is 15/10, checkIn is 15/10)
      expect(isDateRangeOverlap("2026-10-15", "2026-10-18", "2026-10-10", "2026-10-15")).toBe(false);
    });

    it("checks room availability against existing bookings", () => {
      const existing = [
        { roomId: "r1", checkIn: "2026-10-11", checkOut: "2026-10-14", status: "CONFIRMED" },
      ];
      expect(isRoomAvailableForDates("r1", "2026-10-12", "2026-10-13", existing)).toBe(false);
      expect(isRoomAvailableForDates("r1", "2026-10-14", "2026-10-16", existing)).toBe(true);
    });

    it("calculates 50% deposit required", () => {
      expect(calculateDepositRequired(2000000, 50)).toBe(1000000);
    });
  });

  describe("checkinRules", () => {
    it("allows checkin only when CONFIRMED and all rooms READY with no issues", () => {
      const readyState = [{ roomId: "r1", roomNumber: "101", status: "READY" as const }];
      expect(canCheckInReservation("CONFIRMED", readyState).canCheckIn).toBe(true);

      const dirtyState = [{ roomId: "r1", roomNumber: "101", status: "VACANT_DIRTY" as const }];
      expect(canCheckInReservation("CONFIRMED", dirtyState).canCheckIn).toBe(false);

      const issueState = [{ roomId: "r1", roomNumber: "101", status: "READY" as const, hasUnresolvedIssue: true }];
      expect(canCheckInReservation("CONFIRMED", issueState).canCheckIn).toBe(false);
    });
  });

  describe("checkoutRules", () => {
    it("calculates balance and allows checkout only when balance is zero", () => {
      expect(calculateBalance(1000000, 1000000)).toBe(0);
      expect(canCheckOut("CHECKED_IN", 0).canCheckOut).toBe(true);
      expect(canCheckOut("CHECKED_IN", 200000).canCheckOut).toBe(false);
      expect(canCheckOut("CONFIRMED", 0).canCheckOut).toBe(false);
      expect(needsRefundOnCheckout(-50000)).toBe(true);
    });
  });

  describe("cancellationRules", () => {
    it("calculates tiered cancellation quotes based on days before checkin", () => {
      const quote7Days = calculateCancellationQuote("2026-10-20", "2026-10-11", 1000000);
      expect(quote7Days.refundAmount).toBe(1000000);
      expect(quote7Days.penaltyAmount).toBe(0);

      const quote4Days = calculateCancellationQuote("2026-10-15", "2026-10-11", 1000000);
      expect(quote4Days.refundAmount).toBe(500000);
      expect(quote4Days.penaltyAmount).toBe(500000);

      const quote1Day = calculateCancellationQuote("2026-10-12", "2026-10-11", 1000000);
      expect(quote1Day.refundAmount).toBe(0);
      expect(quote1Day.penaltyAmount).toBe(1000000);
    });

    it("allows cancel only for CONFIRMED or PENDING", () => {
      expect(canCancelReservation("CONFIRMED")).toBe(true);
      expect(canCancelReservation("CHECKED_IN")).toBe(false);
    });
  });

  describe("noShowRules", () => {
    it("detects no-show candidate after check-in deadline", () => {
      expect(isNoShowCandidate("2026-10-11", "14:00", "2026-10-11T16:00:00+07:00", "CONFIRMED")).toBe(true);
      expect(isNoShowCandidate("2026-10-11", "14:00", "2026-10-11T12:00:00+07:00", "CONFIRMED")).toBe(false);
    });

    it("calculates no-show deposit retention", () => {
      const res = calculateNoShowDepositSettlement(1200000, 800000);
      expect(res.keepAmount).toBe(800000);
      expect(res.refundAmount).toBe(400000);
    });
  });

  describe("fnbRules", () => {
    it("calculates selling price correctly", () => {
      // 50,000 purchase price + 20% margin = 60,000
      expect(calculateSellingPrice(50000, 20)).toBe(60000);
    });

    it("enforces daily limits and approval threshold", () => {
      expect(canOrderFnb(10, 8, 2)).toBe(true);
      expect(canOrderFnb(10, 8, 3)).toBe(false);
      expect(requiresFnbApproval(6, 300000)).toBe(true);
      expect(requiresFnbApproval(2, 600000)).toBe(true);
      expect(requiresFnbApproval(2, 200000)).toBe(false);
    });
  });

  describe("statsRules", () => {
    it("checks confirmation and validates adjustment", () => {
      expect(canConfirmDailyStats("PENDING")).toBe(true);
      expect(canConfirmDailyStats("CONFIRMED")).toBe(false);

      const invalidReason = validateAdjustment("", 10, 15);
      expect(invalidReason.valid).toBe(false);

      const validAdjustment = validateAdjustment("Khách check-in muộn bổ sung", 10, 12);
      expect(validAdjustment.valid).toBe(true);
    });
  });
});
