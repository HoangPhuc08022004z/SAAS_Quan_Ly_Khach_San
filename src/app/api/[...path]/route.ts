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

    // ngrok trả 404 HTML khi tunnel tắt (ERR_NGROK_3200) → báo rõ thay vì "404" khó hiểu
    const ngrokError = backendRes.headers.get("ngrok-error-code");
    if (ngrokError) {
      return NextResponse.json(
        {
          message: `Backend đang offline (ngrok ${ngrokError}). Hãy bật lại backend/ngrok hoặc cập nhật NEXT_PUBLIC_SAAS_API_BASE_URL trong .env.`,
        },
        { status: 502 }
      );
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

    return new NextResponse(responseBody, {
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
