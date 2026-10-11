import { ApiErrorResponse } from "../lib/api/types";

let simulateFailureMode: "NONE" | "ERROR_500" | "ERROR_403" | "ERROR_409" | "VALIDATION" = "NONE";
let forcePaymentStatus: "AUTO" | "SUCCESS" | "FAILED" = "AUTO";

export function setSimulateFailure(mode: "NONE" | "ERROR_500" | "ERROR_403" | "ERROR_409" | "VALIDATION") {
  simulateFailureMode = mode;
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_simulate_failure", mode);
  }
}

export function getSimulateFailure(): typeof simulateFailureMode {
  if (typeof window !== "undefined") {
    const val = localStorage.getItem("mock_simulate_failure");
    if (val) return val as any;
  }
  return simulateFailureMode;
}

export function setForcePaymentStatus(status: "AUTO" | "SUCCESS" | "FAILED") {
  forcePaymentStatus = status;
  if (typeof window !== "undefined") {
    localStorage.setItem("mock_force_payment", status);
  }
}

export function getForcePaymentStatus(): typeof forcePaymentStatus {
  if (typeof window !== "undefined") {
    const val = localStorage.getItem("mock_force_payment");
    if (val) return val as any;
  }
  return forcePaymentStatus;
}

export async function simulateLatency(min = 300, max = 800): Promise<void> {
  const mode = getSimulateFailure();

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("fail") === "1" || mode === "ERROR_500") {
      throw {
        code: "INTERNAL_SERVER_ERROR",
        message: "Lỗi máy chủ nội bộ giả lập (500) để kiểm tra giao diện xử lý lỗi.",
        traceId: `ERR_${Date.now()}`,
      } as ApiErrorResponse;
    }
    if (mode === "ERROR_403") {
      throw {
        code: "FORBIDDEN",
        message: "Bạn không có quyền thực hiện hành động này (403).",
        traceId: `ERR_403_${Date.now()}`,
      } as ApiErrorResponse;
    }
    if (mode === "ERROR_409") {
      throw {
        code: "CONFLICT",
        message: "Dữ liệu bị xung đột hoặc tài nguyên đang bị khóa bởi thao tác khác (409).",
        traceId: `ERR_409_${Date.now()}`,
      } as ApiErrorResponse;
    }
  }

  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
