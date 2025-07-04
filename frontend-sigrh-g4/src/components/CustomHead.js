"use client";
import { useEffect } from "react";
import { useSystemConfig } from "@/contexts/sysConfigContext";
import { usePathname } from "next/navigation";

export default function CustomHead() {
  const config = useSystemConfig();
  const pathname = usePathname(); // 🔄 Detecta cambios de ruta

  useEffect(() => {
    if (!config) return;

    const { company_name, favicon_url, primary_color, language } = config;

    // ✅ TÍTULO dinámico (preserva si ya incluye la empresa)
    const originalTitle = document.title.trim();
    const hasCompany = originalTitle.includes(company_name);
    document.title = hasCompany
      ? originalTitle
      : (originalTitle ? `${originalTitle} | ${company_name}` : company_name);

    // ✅ FAVICON dinámico
    let favicon = document.querySelector("link[rel~='icon']");
    if (favicon && favicon_url) {
      favicon.href = favicon_url;
    } else {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.href = favicon_url;
      document.head.appendChild(favicon);
    }

    // ✅ THEME COLOR
    let themeColor = document.querySelector("meta[name='theme-color']");
    if (themeColor) {
      themeColor.content = primary_color;
    } else {
      themeColor = document.createElement("meta");
      themeColor.name = "theme-color";
      themeColor.content = primary_color;
      document.head.appendChild(themeColor);
    }

    // ✅ LENGUAJE en <html>
    const html = document.documentElement;
    if (!html.lang || html.lang === "en") {
      html.lang = language || "es";
    }

  }, [config, pathname]); // 🔁 Se vuelve a ejecutar en cada ruta nueva

  return null;
}
