"use client";

import { FaBars } from "react-icons/fa";
import { useUser } from "@/contexts/userContext";
import { useSystemConfig } from "@/contexts/sysConfigContext";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useUser();
  const config = useSystemConfig();

  const getTitleElement = (isMobile = false) => {
    if (config?.logo_url) {
      return (
        <img
          src={config.logo_url}
          alt="Logo"
          className={`h-14 ${isMobile ? "block md:hidden" : "hidden md:block"}`}
        />
      );
    }

    const title = config?.company_name || "SIGRH+";
    return (
      <span
        className={`font-bold text-emerald-500 text-xl ${
          isMobile ? "block md:hidden" : "hidden md:inline"
        }`}
      >
        {title}
      </span>
    );
  };

  return (
    <nav className="flex justify-between items-center bg-white p-4 fixed top-0 left-0 w-full z-10 border-b border-gray-100">
      {/* Botón Hamburguesa + Título */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-2xl text-emerald-500"
        >
          <FaBars />
        </button>

        {/* Logo o título en escritorio */}
        {getTitleElement(false)}
      </div>

      {/* Logo o título en móvil */}
      {getTitleElement(true)}

      {/* Foto de usuario y nombre */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-end">
            <span className="text-sm font-semibold text-emerald-500">
              {user.first_name} {user.last_name}
            </span>
            <div className="flex gap-2 justify-end">
              {user.job?.name && (
                <span className="text-xs text-gray-600">{user.job.name}</span>
              )}
              {user.job?.sector?.name && (
                <span className="text-xs text-gray-400 italic">
                  {" "}
                  / {user.job.sector.name}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 italic font-semibold">
              {user.role?.description || "Invitado"} (Rol)
            </span>
          </div>
          <img
            src={user.photo}
            alt="Foto de perfil"
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        </div>
      )}
    </nav>
  );
}
