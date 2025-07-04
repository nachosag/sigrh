"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  FaUsers,
  FaBriefcase,
  FaRegClock,
  FaHome,
  FaSignOutAlt,
  FaChevronRight,
  FaMoneyCheck,
  FaClock,
  FaFileAlt,
  FaFileContract,
  FaChartBar,
  FaChartPie,
} from "react-icons/fa";
import { MdSecurity, MdSettings } from "react-icons/md";
import { canAccess } from "@/utils/permissions";
import { useUser } from "@/contexts/userContext";
import { PermissionIds } from "@/enums/permissions";
import { FaCheck, FaPerson } from "react-icons/fa6";

const menuItems = [
  {
    label: "Inicio",
    icon: <FaHome className="text-2xl" />,
    path: "/sigrh",
  },
  {
    label: "Empleados",
    icon: <FaUsers className="text-2xl" />,
    path: "/sigrh/employees",
    requiredPermissions: [PermissionIds.ABM_EMPLEADOS], // ← ID de permiso para ABM empleados
    submenus: [
      {
        label: "Listado de empleados",
        path: "/sigrh/employees",
        icon: <FaUsers />,
      },
      {
        label: "Puestos de trabajo",
        path: "/sigrh/jobs",
        icon: <FaBriefcase />,
      },
      { label: "Sectores", path: "/sigrh/sectors", icon: <FaUsers /> },
      {
        label: "Turnos",
        path: "/sigrh/shifts",
        icon: <FaClock />,
        requiredPermissions: [PermissionIds.ABM_TURNOS],
      },
      {
        label: "Roles",
        path: "/sigrh/roles",
        icon: <MdSecurity />,
        requiredPermissions: [PermissionIds.ABM_ROLES], // ← ID de permiso para ABM roles
      },
    ],
  },
  {
    label: "Convocatorias",
    icon: <FaBriefcase className="text-2xl" />,
    path: "/sigrh/job_opportunities",
    requiredPermissions: [
      PermissionIds.ABM_POSTULACIONES_CARGA,
      PermissionIds.ABM_POSTULACIONES_APROBACIONES,
    ],
  },
  {
    label: "Asistencia",
    icon: <FaRegClock className="text-2xl" />,
    path: "/sigrh/attendance",
    requiredPermissions: [PermissionIds.ABM_FICHADAS],
  },
  {
    label: "Nómina",
    icon: <FaMoneyCheck className="text-2xl" />,
    path: "/sigrh/payroll",
    submenus: [
      {
        label: "Gestión de nomina",
        icon: <FaFileAlt className="text-2xl" />,
        path: "/sigrh/payroll",
        requiredPermissions: [PermissionIds.GESTION_NOMINA_CARGA],
      },
      {
        label: "Aprobaciones de nomina",
        icon: <FaCheck className="text-xl" />,
        path: "/sigrh/payroll_evaluation",
        requiredPermissions: [PermissionIds.GESTION_NOMINA_APROBACIONES],
      },
    ],
  },
  {
    label: "Licencias",
    icon: <FaFileAlt className="text-2xl" />,
    path: "/sigrh/my_licenses",
    requiredPermissions: [PermissionIds.GESTION_LICENCIAS_CARGA],
    submenus: [
      {
        label: "Mis Licencias",
        icon: <FaFileAlt className="text-2xl" />,
        path: "/sigrh/my_licenses",
        requiredPermissions: [PermissionIds.GESTION_LICENCIAS_CARGA],
      },
      {
        label: "Admin. Licencias",
        icon: <FaFileContract className="text-2xl" />,
        path: "/sigrh/licenses",
        requiredPermissions: [PermissionIds.GESTION_LICENCIAS_APROBACIONES],
      },
    ],
  },
  {
    label: "Reportes",
    icon: <FaChartBar className="text-2xl" />,
    path: "/sigrh/reports",
    submenus: [
      {
        label: "Mis reportes",
        icon: <FaChartPie className="text-2xl" />,
        path: "/sigrh/reports/my_reports",
      },
      {
        label: "Reportes de empleados",
        icon: <FaPerson className="text-2xl" />,
        path: "/sigrh/reports/employees",
      },
      {
        label: "Reportes de asistencia",
        icon: <FaClock className="text-2xl" />,
        path: "/sigrh/reports/attendance",
      },
      {
        label: "Reportes de licencias",
        icon: <FaFileAlt className="text-2xl" />,
        path: "/sigrh/reports/licenses",
      },
      {
        label: "Reportes de convocatorias",
        icon: <FaBriefcase className="text-2xl" />,
        path: "/sigrh/reports/job_opportunities",
      },
    ],
  },
  {
    label: "Ajustes",
    icon: <MdSettings className="text-2xl" />,
    path: "/sigrh/settings",
    requiredPermissions: [PermissionIds.PERSONALIZACION_SISTEMA],
  },
];
export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const submenuRef = useRef();

  const { role } = useUser();
  const permissionIds = role?.permissions.map((p) => Number(p.id));

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/sigrh/login");
  };

  const handleClickOutside = (e) => {
    if (submenuRef.current && !submenuRef.current.contains(e.target)) {
      setActiveSubMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <div className="relative">
      <div className="hidden md:flex flex-col justify-between bg-white shadow-md w-64 h-[calc(100vh-4rem)] fixed top-16 left-0 p-4 z-20">
        <ul className="space-y-2">
          {menuItems.map((item, idx) => {
            if (!canAccess(item.requiredPermissions, permissionIds))
              return null;

            const isParentActive = pathname.startsWith(item.path);
            const hasSubmenus = Array.isArray(item.submenus);
            const visibleSubmenus = (item.submenus || []).filter((sub) =>
              canAccess(sub.requiredPermissions, permissionIds)
            );

            if (hasSubmenus && visibleSubmenus.length === 0) return null;

            return (
              <li key={idx} className="relative">
                {!hasSubmenus ? (
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all w-full ${
                      isActive(item.path)
                        ? "bg-emerald-500 text-white"
                        : "hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setActiveSubMenu(activeSubMenu === idx ? null : idx)
                      }
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                        isParentActive
                          ? "bg-emerald-500 text-white"
                          : "hover:bg-emerald-500 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <FaChevronRight />
                    </button>

                    {activeSubMenu === idx && visibleSubmenus.length > 0 && (
                      <div
                        ref={submenuRef}
                        className="absolute top-0 left-full w-56 bg-white shadow-lg border border-gray-200 rounded-lg z-30"
                      >
                        <ul className="p-2">
                          {visibleSubmenus.map((sub, subIdx) => (
                            <li key={subIdx}>
                              <Link
                                href={sub.path}
                                className={`flex items-center mt-1 space-x-2 p-2 rounded-lg transition w-full ${
                                  isActive(sub.path)
                                    ? "bg-emerald-500 text-white"
                                    : "hover:bg-emerald-500 hover:text-white"
                                }`}
                              >
                                {sub.icon && sub.icon}
                                <span>{sub.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all"
          >
            <FaSignOutAlt className="text-2xl" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
