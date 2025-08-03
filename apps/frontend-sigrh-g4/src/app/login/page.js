"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import config from "@/config";
import { useSystemConfig } from "@/contexts/sysConfigContext";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [usuarioId, setUsuarioId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetUserId, setResetUserId] = useState("");
  const [resetRequested, setResetRequested] = useState(false);

  const configSys = useSystemConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setErrorMessage(""); // Limpiar error anterior
      const res = await axios.postForm(`${config.API_URL}/auth/login`, {
        username: usuarioId,
        password: password,
      });

      if (res.status !== 200) throw new Error("Login fallido");

      const data = await res.data;

      Cookies.set("token", data.access_token, { expires: 1 });

      const res_me = await axios.get(`${config.API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      const me_data = await res_me.data;

      // 👇 Agregá esta línea para registrar el flag de cambio obligatorio
      Cookies.set("must_change_password", me_data.must_change_password, {
        expires: 1,
      });


      if (data.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/sigrh");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Credenciales inválidas. Verifica tu usuario y contraseña."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Imagen: solo visible en escritorio */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="absolute inset-0 bg-[url('/pattern-sigrh.svg')] bg-cover bg-center" />
      </div>

      {/* Formulario: visible siempre */}
      <div className="flex flex-1 items-center justify-center p-8 bg-[url('/pattern-sigrh.svg')] bg-cover bg-center md:bg-none">
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl">
          <div className="mb-6 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold text-gray-600">SIGRH+</h2>
            {configSys?.logo_url ? (
              <img src={configSys.logo_url} alt="Logo" className="h-32 mb-2" />
            ) : configSys?.company_name ? (
              <span className="text-lg font-semibold text-gray-600 mb-1">
                {configSys.company_name}
              </span>
            ) : null}
          </div>

          {/* <h2 className="mb-6 text-2xl font-bold text-gray-800 text-center">
            Iniciar sesión
          </h2> */}

          {/* Mensaje de error */}
          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-100 p-4 text-sm text-red-700 border border-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                placeholder="Ingrese su usuario"
                className="w-full rounded-full border border-gray-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="w-full rounded-full border border-gray-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-500 p-3 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              Ingresar
            </button>

            {/* <div className="text-center">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:underline mt-2 cursor-pointer"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div> */}
          </form>
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm z-50 relative">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Recuperar contraseña
            </h3>

            {!resetRequested ? (
              <>
                <label className="block text-sm mb-2 text-gray-600">
                  Ingresá tu nombre de usuario
                </label>
                <input
                  type="text"
                  value={resetUserId}
                  onChange={(e) => setResetUserId(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-gray-600 hover:underline"
                    onClick={() => setShowForgotPasswordModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    onClick={async () => {
                      try {
                        await axios.post(
                          `${config.API_URL}/auth/request-password-reset`,
                          { username: resetUserId }
                        );
                        setResetRequested(true);
                      } catch (err) {
                        console.error(err);
                        toast.error(
                          "No se pudo solicitar el cambio. Verificá el usuario."
                        );
                      }
                    }}
                  >
                    Enviar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-700 mb-4">
                  Se ha solicitado un restablecimiento de contraseña. Vas a
                  recibir un correo con una contraseña temporal.
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setResetRequested(false);
                    setResetUserId("");
                  }}
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
