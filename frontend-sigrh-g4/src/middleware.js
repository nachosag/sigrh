import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  // Si la ruta ya es /login, no hacer nada (permitir acceso)
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Si no tiene token, redirigir
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Proteger solo rutas que empiecen con /sigrh
export const config = {
  matcher: ["/sigrh/:path*"],
};
