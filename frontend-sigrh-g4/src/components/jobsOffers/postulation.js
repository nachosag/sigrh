"use client";

import { useState, useEffect, use } from "react";
import config from "@/config";
import Cookies from "js-cookie";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toastAlerts } from "@/utils/toastAlerts";
import { toast } from "react-toastify";

export default function PostulationModal({ onClose, jobTitle, jobId }) {
  const token = Cookies.get("token"); // Token de autenticación
  const [step, setStep] = useState(1); // Controla la etapa del proceso
  const [email, setEmail] = useState(""); // Almacena el correo del postulante
  const [name, setName] = useState(""); // Almacena el nombre del postulante
  const [surname, setSurname] = useState(""); // Almacena el apellido del postulante
  const [phone, setPhone] = useState(""); // Almacena el teléfono del postulante
  const [countryId, setCountryId] = useState(""); // País seleccionado
  const [stateId, setStateId] = useState(""); // Provincia seleccionada
  const [language, setLanguage] = useState(""); // Idioma del CV
  const [countries, setCountries] = useState([]); // Lista de países
  const [states, setStates] = useState([]); // Lista de provincias
  const [canCreate, setCanCreate] = useState(false); // Verifica si se puede crear una postulación
  const [cvFile, setCvFile] = useState(null); // Almacena el archivo del CV
  const [postulations, setPostulations] = useState([]); // Almacena las postulaciones

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${config.API_URL}/countries/`);
      if (!res.ok) throw new Error("Error al obtener los países");
      const data = await res.json();
      setCountries(data);
    } catch (error) {
      console.error("Error al obtener los países:", error);
      toastAlerts.showError(
        "Hubo un error al obtener los países, recargue la página e intente nuevamente"
      );
    }
  };

  const fetchStates = async () => {
    try {
      const res = await fetch(`${config.API_URL}/states/`);
      if (!res.ok) throw new Error("Error al obtener las provincias");
      const data = await res.json();
      setStates(data);
    } catch (error) {
      console.error("Error al obtener las provincias:", error);
      toastAlerts.showError(
        "Hubo un error al obtener las provincias, recargue la página e intente nuevamente"
      );
    }
  };

  const fetchCanCreatePostulation = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/postulations/can_create?job_opportunity_id=${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status !== 200)
        throw new Error("No se pudo verificar la capacidad de postulaciones");

      setCanCreate(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al verificar la capacidad de postulaciones, recargue la página e intente nuevamente"
      );
      console.error("Error al verificar la capacidad de postulaciones:", e);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchStates();
    fetchCanCreatePostulation();
  }, []);

  useEffect(() => {
    fetchCanCreatePostulation();
  }, [step]);

  const handleCountryChange = (e) => {
    setCountryId(e.target.value);
    setStateId("");
  };

  const handleStateChange = (e) => {
    setStateId(e.target.value);
  };

  const fetchPostulations = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/postulations/?job_opportunity_id=${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status !== 200)
        throw new Error("Error al obtener las postulaciones");

      setPostulations(res.data);
    } catch (error) {
      console.error("Error al obtener las postulaciones:", error);
      toastAlerts.showError(
        "Hubo un error al obtener las postulaciones, recargue la página e intente nuevamente"
      );
      return []; // Devuelve un array vacío en caso de error
    }
  };

  useEffect(() => {
    fetchPostulations();
  }, []);

  const validateStep1 = () => {
    if (!email || !name || !surname || !phone || !countryId || !stateId) {
      alert("Por favor, completa todos los campos.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, ingresa un email válido.");
      return false;
    }

    if (name.length > 50) {
      alert("El nombre no puede tener más de 50 caracteres.");
      return false;
    }

    if (surname.length > 50) {
      alert("El apellido no puede tener más de 50 caracteres.");
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      alert(
        "Por favor, ingresa un número de teléfono válido en formato internacional (ejemplo: +541112345678)."
      );
      return false;
    }

    const countryExists = countries.some(
      (country) => country.id === parseInt(countryId)
    );
    if (!countryExists) {
      alert("El país seleccionado no es válido.");
      return false;
    }

    const stateExists = states.some((state) => state.id === parseInt(stateId));
    if (!stateExists) {
      alert("La provincia seleccionada no es válida.");
      return false;
    }

    const emailExists = postulations.some(
      (postulation) => postulation.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      alert(
        "Ya existe una postulación con este email para esta oferta de trabajo."
      );
      return false;
    }

    return true;
  };

  const validateCV = (file) => {
    // Validar que el archivo sea un PDF, dsp agregaremos word (por eso está comentado)
    const allowedExtensions = [
      "application/pdf",
      /*"application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",*/
    ];
    if (!allowedExtensions.includes(file.type)) {
      alert("El archivo debe ser un documento PDF.");
      return false;
    }

    // Validar que el archivo no pese más de 5 MB
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      alert("El archivo no puede pesar más de 5 MB.");
      return false;
    }

    if (!canCreate) {
      alert(
        "Lo sentimos, la capacidad máxima de postulaciones ha sido alcanzada."
      );
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!cvFile) {
        alert("Por favor, sube tu CV antes de continuar.");
        return;
        /*} else if (!language) {
        alert("Por favor, selecciona el idioma de tu CV.");
        return;*/
      } else if (!validateCV(cvFile)) {
        return;
      }
      setStep(3);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateCV(file)) {
      setCvFile(file);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Extraer solo la parte Base64
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // Leer como DataURL (Base64)
    });
  };

  const CreatePostulation = async () => {
    try {
      // Convertir el archivo a Base64
      const cvFileBase64 = await fileToBase64(cvFile);

      const payload = {
        job_opportunity_id: jobId,
        name: name,
        surname: surname,
        email: email,
        phone_number: phone,
        address_country_id: parseInt(countryId), // Asegurarse de que sea un número
        address_state_id: parseInt(stateId), // Asegurarse de que sea un número
        cv_file: cvFileBase64, // Archivo en formato Base64
        cv_language: language,
      };

      const res = await axios.post(
        `${config.API_URL}/postulations/create`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status !== 201) throw new Error("Error al enviar la postulación");

      setStep(4); // Confirmación de envío
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al crear la postulación, recargue la página e intente nuevamente"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Postulación a: {jobTitle}
            </h2>
            <h3>Ingresa tus datos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>

                <PhoneInput
                  country={"ar"}
                  value={phone}
                  onChange={setPhone}
                  inputClass="!w-full  !border !border-gray-300 !rounded-md !focus:ring-emerald-500 !focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <select
                  value={countryId}
                  onChange={handleCountryChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="" disabled>
                    Selecciona un país
                  </option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <select
                  value={stateId}
                  onChange={handleStateChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="" disabled>
                    Selecciona una provincia
                  </option>
                  {states
                    .filter((state) => state.country_id === parseInt(countryId))
                    .map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="mt-4 w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Sube tu CV
            </h2>
            <div>
              {/*<select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md
                focus:ring-emerald-500 focus:border-emerald-500 mb-4"
              >
                <option value="" disabled>
                  Selecciona el idioma de tu CV
                </option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>*/}
              <div
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setCvFile(file);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {cvFile ? (
                  <span>{cvFile.name}</span>
                ) : (
                  <span>Arrastra tu archivo aquí o haz clic para subirlo</span>
                )}
              </div>
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="cv-upload"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="cv-upload"
              className="mt-2 inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300"
            >
              Seleccionar archivo
            </label>
            <button
              onClick={handleNext}
              className="mt-4 w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
            >
              Enviar
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmación
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de enviar tu CV para la oferta "{jobTitle}"?
            </p>
            <button
              onClick={() => CreatePostulation()}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
            >
              Confirmar y Enviar
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ¡CV enviado con éxito!
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Nos pondremos en contacto contigo pronto.
            </p>
          </div>
        )}

        <div className="flex justify-center items-center mb-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
