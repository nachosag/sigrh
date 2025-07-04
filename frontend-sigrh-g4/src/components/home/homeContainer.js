"use client";

import { useUser } from "@/contexts/userContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import HasPermission from "../HasPermission";
import { PermissionIds } from "@/enums/permissions";
import { toastAlerts } from "@/utils/toastAlerts";

export default function HomeContainer() {
  const { user } = useUser();
  const [fechaHoy, setFechaHoy] = useState("");
  const [empleadosActivos, setEmpleadosActivos] = useState(0);
  const [convocatoriasAbiertas, setConvocatoriasAbiertas] = useState(0);

  const token = Cookies.get("token");

  // Obtener la fecha formateada
  useEffect(() => {
    const fecha = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setFechaHoy(fecha.toLocaleDateString("es-AR", options));
  }, []);

  // Fetch de datos
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empleadosRes, convocatoriasRes] = await Promise.all([
          axios.post(`${config.API_URL}/employees/active-count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.post(`${config.API_URL}/opportunities/active-count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setEmpleadosActivos(empleadosRes.data.active_count);
        setConvocatoriasAbiertas(convocatoriasRes.data.active_count);
      } catch (error) {
        console.error("Error al obtener datos del dashboard", error);
        toastAlerts.showError(
          "Hubo un error al obtener los datos del dashboard, recargue la página e intente nuevamente"
        );
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  return (
    <div className="bg-white w-full h-full p-6">
      {/* Bienvenida */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        🏠 ¡Bienvenido{user?.first_name ? `, ${user.first_name}` : ""}!
      </h1>
      <p className="text-sm text-gray-600 mb-6">Hoy es {fechaHoy}</p>

      {/* Cards de datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <HasPermission id={PermissionIds.ABM_EMPLEADOS}>
          <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl shadow-sm">
            <p className="text-sm">Empleados activos</p>
            <h2 className="text-3xl font-bold">{empleadosActivos}</h2>
          </div>
        </HasPermission>
        <HasPermission id={PermissionIds.ABM_POSTULACIONES_CARGA}>
          <div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow-sm">
            <p className="text-sm">Convocatorias abiertas</p>
            <h2 className="text-3xl font-bold">{convocatoriasAbiertas}</h2>
          </div>
        </HasPermission>
      </div>

      {/* Enlaces útiles */}
      <h2 className="text-lg font-medium text-gray-700 mb-3">Enlaces útiles</h2>
      <div className="flex flex-wrap gap-4">
        <HasPermission id={PermissionIds.ABM_EMPLEADOS}>
          <Link
            href="/sigrh/employees"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
          >
            Ver empleados
          </Link>
        </HasPermission>
        <HasPermission id={PermissionIds.ABM_POSTULACIONES_CARGA}>
          <Link
            href="/sigrh/job_opportunities"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Ver convocatorias
          </Link>
        </HasPermission>
        <Link
          href="/"
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
        >
          Portal para postularse
        </Link>
        <HasPermission id={PermissionIds.ABM_FICHADAS}>
          <Link
            href="/sigrh/attendance"
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            Asistencia
          </Link>
        </HasPermission>
        <HasPermission id={PermissionIds.ABM_POSTULACIONES_CARGA}>
          <Link
            href="/sigrh/payroll"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Revisar nóminas
          </Link>
        </HasPermission>
      </div>
    </div>
  );
}
