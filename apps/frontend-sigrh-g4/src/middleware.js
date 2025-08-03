import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const mustChange = request.cookies.get("must_change_password")?.value === "true";

  const { pathname } = request.nextUrl;

  // Permitir acceso libre al login y al cambio de contraseña
  if (pathname.startsWith("/login") || pathname.startsWith("/change-password")) {
    return NextResponse.next();
  }

  // Redirigir si no hay token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirigir a /change-password si el flag está activo
  if (mustChange) {
    const url = request.nextUrl.clone();
    url.pathname = "/change-password";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Aplica a rutas protegidas
export const config = {
  matcher: ["/sigrh/:path*"],
};
