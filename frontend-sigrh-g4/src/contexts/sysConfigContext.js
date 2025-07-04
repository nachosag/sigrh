"use client";
import config from "@/config";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const SystemConfigContext = createContext();

export function SystemConfigProvider({ children }) {
  const [sysConfig, setSysconfig] = useState(null);

  useEffect(() => {
    //loadMockConfig();
    loadBackendConfig();
  }, []);

  async function loadMockConfig() {
    const logoBase64 = await getBase64FromPublic("/gottert-navbar.png");
    const faviconBase64 = await getBase64FromPublic("/favicon_test.ico");

    const mockConfig = {
      company_name: "Gottert S.A.",
      logo_base64: logoBase64,
      favicon_base64: faviconBase64,
      primary_color: "#1d4ed8",
      secondary_color: "#93c5fd",
      language: "es",
      date_format: "DD/MM/YYYY",
      features: {
        showPayroll: true,
        showDashboard: true,
      },
    };

    // Convertir a data URLs
    mockConfig.logo_url = `data:image/png;base64,${logoBase64}`;
    mockConfig.favicon_url = `data:image/x-icon;base64,${faviconBase64}`;

    setSysconfig(mockConfig);
  }

  async function loadBackendConfig() {
    let sysConfigFetched;

    try {
      const res = await axios.post(
        `${config.API_URL}/configurations/getConfigurations`
      );

      if (res.status == 200) {
        sysConfigFetched = res.data;
        sysConfigFetched.logo_url = res.data.logo;
        sysConfigFetched.favicon_url = res.data.favicon;

        setSysconfig(sysConfigFetched);
      } else {
        throw new Error(
          "Hubo un error al obtener las configuraciones",
          res.statusText
        );
      }
    } catch (e) {
      console.error(
        `Hubo un error al obtener las configuraciones: ${e.message}`
      );
    }
  }

  // Función auxiliar para cargar imágenes de /public como base64
  async function getBase64FromPublic(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1]; // remove data:mime;base64,
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });
  }

  return (
    <SystemConfigContext.Provider value={sysConfig}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  return useContext(SystemConfigContext);
}
