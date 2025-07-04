"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import config from "@/config";
import { useSystemConfig } from "@/contexts/sysConfigContext";

export default function LoginPage() {
  const router = useRouter();
  const [usuarioId, setUsuarioId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const configSys = useSystemConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setErrorMessage(""); // Limpiar error anterior
      const res = await axios.postForm(`${config.API_URL}/auth/login`, {
          username: usuarioId,
          password: password
      });

      if (res.status !== 200) throw new Error("Login fallido");

      const data = await res.data;
      Cookies.set("token", data.access_token, { expires: 1 });
      router.push("/sigrh");
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
              className="w-full rounded-full bg-emerald-500 p-3 text-white hover:bg-emerald-600 transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
