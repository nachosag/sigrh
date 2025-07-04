import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

const showSuccess = (msg, options = {}) =>
  //Le pongo un mensaje por defecto para casos que sean similares (en este caso, cuando se hace algo y sale bien)
  toast.success(msg || "Operación realizada", {
    ...defaultOptions,
    ...options,
  });

const showError = (msg, options = {}) =>
  //Le pongo un mensaje por defecto para casos que sean similares (en este caso, cuando falla al cargar los datos del back)
  toast.error(
    msg || "Hubo un error en la conexión de datos, refresque la página",
    {
      ...defaultOptions,
      ...options,
    }
  );

//Los creo por las dudas, no se si los vamos a usar
const showInfo = (msg, options = {}) =>
  toast.info(msg, {
    ...defaultOptions,
    ...options,
  });

const showWarning = (msg, options = {}) =>
  toast.warn(msg, {
    ...defaultOptions,
    ...options,
  });

export const toastAlerts = {
  showSuccess,
  showError,
  showInfo,
  showWarning,
};
