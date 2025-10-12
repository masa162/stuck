import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};

export function middleware(request: NextRequest) {
  // Basic認証を実施
  const basicAuth = request.headers.get("authorization");
  const url = request.nextUrl;

  // 環境変数から認証情報を取得
  const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || "admin";
  const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || "password";

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (user === BASIC_AUTH_USER && pwd === BASIC_AUTH_PASSWORD) {
      return NextResponse.next();
    }
  }

  // 認証失敗時は401を返す
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
