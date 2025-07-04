"use client";

import { useEffect, useState } from "react";
import HasPermission from "../HasPermission";
import { PERMISSIONS } from "@/constants/permissions";
import RelationalInput from "../RelationalInput";
import SelectActiveChip from "./SelectActiveChip";
import { defaultEmployeeDataForm } from "@/constants/defaultEmployeeForm";
import { useCountries } from "@/hooks/useCountries";
import { useJob } from "@/hooks/useJob";
import {
  parseOptionsToRelationalInput,
  parseOptionsToRelationalInputDescription,
} from "@/utils/parseOptions";
import { useStatesCountry } from "@/hooks/useStatesCountry";
import EmployeePhoto from "./EmployeePhoto";
import { useRouter } from "next/navigation";
import { cleanEmployeePayloadFormData } from "@/utils/cleanEmployeePayload";
import axios from "axios";
import config from "@/config";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // o /lib/bootstrap.css si usás bootstrap
import * as faceapi from "face-api.js";
import Cookies from "js-cookie";
import { useShifts } from "@/hooks/useShifts";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EmployeeForm({ employeeData, id, onSave }) {
  const [formData, setFormData] = useState(defaultEmployeeDataForm);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [facialRegister, setFacialRegister] = useState("");
  const token = Cookies.get("token");

  function validateForm() {
    const newErrors = {};

    const today = new Date();
    const birthDate = new Date(formData.birth_date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const isTooYoung =
      age < 16 ||
      (age === 16 && monthDiff < 0) ||
      (age === 16 && monthDiff === 0 && today.getDate() < birthDate.getDate());

    if (!formData.first_name?.trim())
      newErrors.first_name = "El nombre es obligatorio";
    if (!formData.last_name?.trim())
      newErrors.last_name = "El apellido es obligatorio";
    if (!formData.dni?.trim()) newErrors.dni = "El DNI es obligatorio";
    if (isNaN(formData.dni)) newErrors.dni = "El DNI debe ser numérico";
    if (!formData.type_dni?.trim())
      newErrors.type_dni = "Tipo de DNI obligatorio";
    if (!formData.birth_date)
      newErrors.birth_date = "La fecha de nacimiento es obligatoria";
    else if (isTooYoung) newErrors.birth_date = "Debe tener al menos 16 años";

    if (!formData.personal_email?.trim())
      newErrors.personal_email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.personal_email))
      newErrors.personal_email = "Email inválido";

    if (!formData.phone?.trim()) newErrors.phone = "El teléfono es obligatorio";

    if (!formData.hire_date)
      newErrors.hire_date = "La fecha de contratación es obligatoria";

    if (!formData.job_id) newErrors.job_id = "Debe seleccionar un cargo";

    if (!formData.address_street?.trim())
      newErrors.address_street = "La calle es obligatoria";
    if (!formData.address_city?.trim())
      newErrors.address_city = "La ciudad es obligatoria";
    if (!formData.address_cp?.trim())
      newErrors.address_cp = "El código postal es obligatorio";

    if (!formData.address_state_id)
      newErrors.address_state_id = "Debe seleccionar una provincia";
    if (!formData.address_country_id)
      newErrors.address_country_id = "Debe seleccionar un país";

    // if (!formData.salary) newErrors.salary = "Debe indicar al menos un salario";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const {
    countries,
    loading: loadingCountries,
    error: errorCountries,
  } = useCountries();
  const {
    states,
    loading: loadingStatesCountry,
    error: errorStatesCountry,
  } = useStatesCountry();
  const { jobs, loading: loadingJobs, error: errorJobs } = useJob();
  const { shifts, loading: loadingShifts, error: errorShifts } = useShifts();
  const router = useRouter();

  const shiftsParsed = parseOptionsToRelationalInputDescription(shifts);
  const jobsParsed = parseOptionsToRelationalInput(jobs);
  const countriesParsed = parseOptionsToRelationalInput(countries);
  const statesParsed = parseOptionsToRelationalInput(states);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditing(true);
  }

  async function handleSave() {
    if (!validateForm()) return;
    const cleanedData = cleanEmployeePayloadFormData(formData);
    let new_id;

    try {
      const payload = {
        embedding: facialRegister,
      };

      const res = await axios.post(
        //Verifica si un rostro similar ya está registrado
        `${config.API_URL}/face_recognition/`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        res.status === 200 &&
        res.data.employee_id !== formData.id &&
        res.data.success
      ) {
        toastAlerts.showError(
          "Ya existe un rostro similar registrado para otro empleado."
        );
        return;
      }
    } catch (e) {}

    try {
      let res;

      if (id !== "new") {
        res = await axios.patch(
          `${config.API_URL}/employees/${id}`,
          cleanedData
        );
      } else {
        res = await axios.post(`${config.API_URL}/employees/register`, {
          ...cleanedData,
          salary: 1,
        });
      }

      const expectedStatus = id !== "new" ? 200 : 201;
      if (res.status !== expectedStatus) {
        throw new Error(`Error inesperado al guardar, código: ${res.status}`);
      }

      if (id === "new") {
        router.push(`/sigrh/employees/${res.data.id}`);
      }

      new_id = res.data.id;
      setEditing(false);
    } catch (error) {
      console.error(error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const detail = error.response?.data?.detail;

        if (status === 400) {
          toastAlerts.showError(
            "Error de validación: El DNI, Teléfono, Mail o Usuario ya está en uso."
          );
          return;
        }
      }

      toastAlerts.showError(
        "Hubo un error al guardar el empleado, recargue la página e intente nuevamente"
      );
    }

    console.log("Data:", employeeData);

    if (formData.photo) {
      if (!employeeData || !employeeData.photo) {
        try {
          let payload = {};
          if (new_id) {
            payload = {
              employee_id: new_id,
              embedding: facialRegister,
            };
          } else {
            payload = {
              employee_id: id,
              embedding: facialRegister,
            };
          }

          console.log("Registrando:", JSON.stringify(payload));

          const res = await axios.post(
            `${config.API_URL}/face_recognition/register`,
            JSON.stringify(payload),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (res.status != 201) throw new Error("Error al registrar rostro");
        } catch (e) {
          console.error(e);
          toastAlerts.showError("Ocurrió un error al registrar el rostro.");
          return;
        }
      } else {
        try {
          const payload = {
            employee_id: id,
            embedding: facialRegister,
          };

          console.log("Modificando:", JSON.stringify(payload));

          const res = await axios.patch(
            `${config.API_URL}/face_recognition/update`,
            JSON.stringify(payload),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (res.status != 200)
            throw new Error("Error al actualizar el rostro");
        } catch (e) {
          console.error(e);
          toastAlerts.showError("Ocurrió un error al actualizar el rostro.");
          return;
        }
      }
    }
    onSave();
    toastAlerts.showSuccess("Cambios guardados con éxito");
  }

  function handleCancel() {
    setFormData(employeeData);
    setEditing(false);
  }

  useEffect(() => {
    setFormData({
      ...defaultEmployeeDataForm,
      ...employeeData,
    });
  }, [employeeData]);

  // Modelos de face-api
  useEffect(() => {
    faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  }, []);

  // Para generar un nuevo embedding cada vez que se cambia la foto
  useEffect(() => {
    async function updateFacialRegister() {
      if (!formData.photo) {
        setFormData((prev) => ({ ...prev, facial_register: "" }));
        return;
      }
      const img = new window.Image();
      img.src = formData.photo;
      img.onload = async () => {
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection && detection.descriptor) {
          setFacialRegister(Array.from(detection.descriptor));
          console.log(
            "Facial register updated:",
            Array.from(detection.descriptor)
          );
        } else {
          setFacialRegister(Array.from(detection.descriptor));
        }
      };
    }
    updateFacialRegister();
  }, [formData.photo]);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Nombre</label>
              <input
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.first_name && (
                <span className="text-red-500 text-sm">
                  {errors.first_name}
                </span>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Apellido/s</label>
              <input
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.last_name && (
                <span className="text-red-500 text-sm">{errors.last_name}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Estado</label>

              <SelectActiveChip
                value={formData.active ? "activo" : "inactivo"}
                onChange={(e) => {
                  const newValue = e.target.value === "activo";
                  setFormData((prev) => ({
                    ...prev,
                    active: newValue,
                  }));
                  setEditing(true);
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Cargo</label>

              <RelationalInput
                label={"Cargo"}
                options={jobsParsed}
                value={
                  jobsParsed.find((c) => c.value === formData.job_id) || null
                }
                onChange={(selectedCargo) => {
                  setFormData((prev) => ({
                    ...prev,
                    job_id: selectedCargo ? selectedCargo.value : null,
                    job_title: selectedCargo ? selectedCargo.label : "", // Guardás el nombre también
                    job: jobs.find((job) => {
                      return job.id == selectedCargo.value;
                    }),
                  }));
                  setEditing(true);
                }}
                verDetalles={() => {
                  const cargo = jobsParsed.find(
                    (c) => c.value === formData.job_id
                  );
                  if (cargo) {
                    toastAlerts.showInfo(
                      `Detalles del cargo:\n${cargo.description || "No hay descripción disponible"}`
                    );
                  }
                }}
                resourceUrl={`/sigrh/jobs`}
                onCrearNuevo={() => {
                  toastAlerts.showInfo("Abrir modal para crear nuevo cargo");
                }}
              />
              {errors.job_id && (
                <span className="text-red-500 text-sm">{errors.job_id}</span>
              )}
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Area</label>
              <input
                name="sector_name"
                type="text"
                value={formData.job?.sector?.name || ""}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
                disabled
              />
              {errors.sector_name && (
                <span className="text-red-500 text-sm">
                  {errors.sector_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-500">Turno</label>

            <RelationalInput
              label={"Turno"}
              options={shiftsParsed}
              value={
                shiftsParsed.find((c) => c.value === formData.shift_id) || null
              }
              onChange={(selectedCargo) => {
                setFormData((prev) => ({
                  ...prev,
                  shift_id: selectedCargo ? selectedCargo.value : null,
                  shift_description: selectedCargo ? selectedCargo.label : "", // Guardás el nombre también
                  shift: shifts.find((shift) => {
                    return shift.id == selectedCargo.value;
                  }),
                }));
                setEditing(true);
              }}
              verDetalles={() => {
                const shift = shifts.find((c) => c.value === formData.shift_id);
                if (shift) {
                  toastAlerts.showInfo(
                    `Detalles del turno:\n${shift.description || "No hay descripción disponible"}`
                  );
                }
              }}
              resourceUrl={`/sigrh/shifts`}
              onCrearNuevo={() => {
                toastAlerts.showInfo("Abrir modal para crear nuevo turno");
              }}
            />
            {errors.shift_id && (
              <span className="text-red-500 text-sm">{errors.shift_id}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <EmployeePhoto
            photoBase64={formData.photo}
            onPhotoChange={(newBase64) => {
              setFormData((prev) => ({
                ...prev,
                photo: newBase64,
              }));
              setEditing(true);
            }}
          />
        </div>
        <div className="flex ">
          <div className="flex gap-2">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500">DNI</label>
              <input
                name="dni"
                type="text"
                value={formData.dni}
                onChange={handleChange}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.dni && (
                <span className="text-red-500 text-sm">{errors.dni}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm whitespace-nowrap text-gray-500">
                Tipo DNI
              </label>
              <select
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
                name="type_dni"
                value={formData.type_dni || "du"}
                onChange={handleChange}
              >
                <option value="lc">LC</option>
                <option value="le">LE</option>
                <option value="du">DU</option>
                <option value="li">LI</option>
              </select>
              {errors.type_dni && (
                <span className="text-red-500 text-sm">{errors.type_dni}</span>
              )}
            </div>
          </div>

          <div className="flex justify-center w-full">
            <div className="flex flex-col ">
              <label className="text-sm text-gray-500">
                Fecha de Nacimiento
              </label>
              <input
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.birth_date && (
                <span className="text-red-500 text-sm">
                  {errors.birth_date}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full">
          <label className="text-sm text-gray-500">Email personal</label>
          <input
            name="personal_email"
            type="personal_email"
            value={formData.personal_email}
            onChange={handleChange}
            className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
          />
          {errors.personal_email && (
            <span className="text-red-500 text-sm">
              {errors.personal_email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">Dirección</label>

          <div className="flex gap-2">
            <div className="flex flex-col w-full">
              <input
                name="address_street"
                type="text"
                placeholder="Calle"
                value={formData.address_street}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, address_street: "" }));
                }}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.address_street && (
                <span className="text-red-500 text-sm">
                  {errors.address_street}
                </span>
              )}
            </div>

            <div className="flex flex-col w-full">
              <input
                name="address_city"
                type="text"
                placeholder="Ciudad"
                value={formData.address_city}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, address_city: "" }));
                }}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.address_city && (
                <span className="text-red-500 text-sm">
                  {errors.address_city}
                </span>
              )}
            </div>

            <div className="flex flex-col w-full">
              <input
                name="address_cp"
                type="text"
                placeholder="CP"
                value={formData.address_cp}
                onChange={(e) => {
                  handleChange(e);
                  setErrors((prev) => ({ ...prev, address_cp: "" }));
                }}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
              {errors.address_cp && (
                <span className="text-red-500 text-sm">
                  {errors.address_cp}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-500">Estado/Provincia</label>
            <RelationalInput
              label={"Estado/Provincia"}
              options={statesParsed}
              value={
                statesParsed.find(
                  (c) => c.value === formData.address_state_id
                ) || null
              }
              onChange={(selected) => {
                setFormData((prev) => ({
                  ...prev,
                  address_state_id: selected ? selected.value : null,
                  address_state_name: selected ? selected.label : "",
                }));
                setEditing(true);
                setErrors((prev) => ({ ...prev, address_state_id: "" }));
              }}
            />
            {errors.address_state_id && (
              <span className="text-red-500 text-sm">
                {errors.address_state_id}
              </span>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label className="text-sm text-gray-500">País</label>
            <RelationalInput
              label={"País"}
              options={countriesParsed}
              value={
                countriesParsed.find(
                  (c) => c.value === formData.address_country_id
                ) || null
              }
              onChange={(selected) => {
                setFormData((prev) => ({
                  ...prev,
                  address_country_id: selected ? selected.value : null,
                  address_country_name: selected ? selected.label : "",
                }));
                setEditing(true);
                setErrors((prev) => ({ ...prev, address_country_id: "" }));
              }}
            />
            {errors.address_country_id && (
              <span className="text-red-500 text-sm">
                {errors.address_country_id}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-500">Teléfono</label>
          <PhoneInput
            country={"ar"}
            value={formData.phone}
            onChange={(phone, countryData, e, formattedValue) => {
              const formatted = phone.startsWith("+") ? phone : `+${phone}`;
              setFormData((prev) => ({ ...prev, phone: formatted }));
              setEditing(true);
            }}
            inputClass="!bg-transparent !text-black !focus:outline-none !pb-1"
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone}</span>
          )}
        </div>

        <div className="flex gap-2 justify-between">
          <div className="flex flex-col">
            <label className="text-sm whitespace-nowrap text-gray-500">
              Fecha de Contratación
            </label>
            <input
              name="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={handleChange}
              className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
            />
            {errors.hire_date && (
              <span className="text-red-500 text-sm">{errors.hire_date}</span>
            )}
          </div>

          {/* <div className="flex flex-col justify-center ">
            <label className="text-sm text-gray-500">Salario</label>
            <input
              name="salary"
              type="text"
              value={formData.salary}
              onChange={handleChange}
              className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
            />
            {errors.salary && (
              <span className="text-red-500 text-sm">{errors.salary}</span>
            )}
          </div> */}
        </div>
      </div>

      {editing && (
        <div className="flex justify-start gap-4 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
          >
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}
