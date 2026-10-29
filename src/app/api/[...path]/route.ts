import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_SAAS_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, await params);
}

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] }
) {
  const path = params.path.join("/");
  const searchParams = req.nextUrl.searchParams.toString();
  // Route nằm ở /api/[...path] nên params.path đã bị mất tiền tố "api" → thêm lại
  const targetUrl = `${BACKEND_URL.replace(/\/+$/, "")}/api/${path}${searchParams ? `?${searchParams}` : ""}`;

  // Xây dựng headers — override Origin để khớp với giá trị backend chấp nhận
  const forwardHeaders: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") || "application/json",
    Accept: req.headers.get("accept") || "application/json",
    "ngrok-skip-browser-warning": "true",
    // Giả mạo Origin là localhost:5173 vì backend Spring Boot chỉ cho phép origin này
    Origin: "http://localhost:5173",
  };

  // Forward Authorization nếu có
  const auth = req.headers.get("authorization");
  if (auth) forwardHeaders["Authorization"] = auth;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    // ngrok tự trả lỗi (HTML) khi tunnel tắt hoặc backend phía sau không phản hồi
    const ngrokError = backendRes.headers.get("ngrok-error-code");
    if (ngrokError) {
      const reason =
        ngrokError === "ERR_NGROK_8012" || ngrokError === "8012"
          ? "ngrok kết nối được nhưng ứng dụng Spring Boot không phản hồi (đã dừng/treo/crash khi xử lý yêu cầu). Kiểm tra log backend."
          : "Hãy bật lại backend/ngrok hoặc cập nhật NEXT_PUBLIC_SAAS_API_BASE_URL trong .env.";
      console.error(`[proxy] ngrok ${ngrokError} khi ${req.method} ${targetUrl}`);
      return NextResponse.json({ message: `Backend không phản hồi (ngrok ${ngrokError}). ${reason}` }, { status: 502 });
    }

    const responseHeaders: Record<string, string> = {
      "Content-Type": backendRes.headers.get("content-type") || "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, ngrok-skip-browser-warning",
    };

    let responseBody: string;
    try {
      responseBody = await backendRes.text();
    } catch {
      responseBody = "";
    }

    // 204/205/304 không được phép có body (Response constructor sẽ ném lỗi) → trả null body
    const noBody = [204, 205, 304].includes(backendRes.status);
    return new NextResponse(noBody ? null : responseBody, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[proxy] Error proxying to ${targetUrl}:`, err?.message);
    return NextResponse.json(
      { message: "Backend không thể kết nối được: " + (err?.message || "Unknown error") },
      { status: 502 }
    );
  }
}
