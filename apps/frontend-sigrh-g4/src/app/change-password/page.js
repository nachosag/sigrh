"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toastAlerts } from "@/utils/toastAlerts";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  const token = Cookies.get("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        toastAlerts.showError("Token no disponible. Inicie sesión nuevamente.");
        router.push("/login");
        return;
      }

      try {
        const res = await axios.get(`${config.API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Error al obtener el usuario:", err);
        toastAlerts.showError("Error al obtener los datos del usuario.");
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toastAlerts.showError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${config.API_URL}/employees/change_password`,
        { password, employee_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toastAlerts.showSuccess("Contraseña cambiada exitosamente");
      Cookies.remove("must_change_password");
      router.push("/sigrh");
    } catch (err) {
      console.error(err);
      toastAlerts.showError("No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Cargando usuario...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
        {user && (
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user.photo || "/default-avatar.png"}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-700">
                {user.first_name} {user.last_name}
              </span>
              {user.job?.name && (
                <span className="text-sm text-gray-600">{user.job.name}</span>
              )}
              {user.job?.sector?.name && (
                <span className="text-sm text-gray-400 italic">
                  {user.job.sector.name}
                </span>
              )}
              {user.role?.description && (
                <span className="text-sm text-gray-400 italic font-semibold">
                  {user.role.description} (Rol)
                </span>
              )}
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Cambio obligatorio de contraseña
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
