import React, { useState, useEffect } from "react";
import JobOpportunitiesTags from "./jobOpportunitiesTags";
import Cookies from "js-cookie";
import config from "@/config";
import axios from "axios";
import { useUser } from "@/contexts/userContext";
import { canAccess } from "@/utils/permissions";
import { PermissionIds } from "@/enums/permissions";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobOpportunityFormData({
  onClose,
  onSave,
  jobOpportunity,
}) {
  const token = Cookies.get("token");

  const [formData, setFormData] = useState({
    status: "",
    work_mode: "",
    title: "",
    description: "",
    country_id: "",
    state_id: "",
    required_abilities: [],
    requiredPercentage: 0,
    desirable_abilities: [],
    desirablePercentage: 0,
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [statesAreLoaded, setStatesAreLoaded] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const REQUIRED_PERMISSION = PermissionIds.ABM_POSTULACIONES_APROBACIONES;
  const { role } = useUser();
  const permissionIds = role?.permissions?.map((p) => Number(p.id)) || [];
  const canEditStatus = canAccess([REQUIRED_PERMISSION], permissionIds);

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/countries/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status != 200) throw new Error("Error al traer los países");

      setCountries(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al obtener los países, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener países:", e);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/states/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 200) throw new Error("Error al traer los estados");

      const groupedStates = mapStatesToCountries(res.data);
      setStates(groupedStates);
      setStatesAreLoaded(true);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al obtener los estados, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener estados:", e);
    }
  };

  const mapStatesToCountries = (states) => {
    const groupedStates = {};

    states.forEach((state) => {
      const countryId = state.country_id;
      if (!groupedStates[countryId]) {
        groupedStates[countryId] = [];
      }
      groupedStates[countryId].push(state);
    });

    return groupedStates;
  };

  useEffect(() => {
    if (jobOpportunity) {
      var countryId = "";
      if (statesAreLoaded) {
        const state = Object.values(states)
          .flat()
          .find((state) => state.id === jobOpportunity.state_id);
        countryId = state ? state.country_id : "";
      }

      setFormData({
        status: jobOpportunity.status,
        work_mode: jobOpportunity.work_mode || "remoto",
        title: jobOpportunity.title || "",
        description: jobOpportunity.description || "",
        country_id: countryId || "",
        state_id: jobOpportunity.state_id || "",
        required_abilities: jobOpportunity.required_abilities || [],
        requiredPercentage: jobOpportunity.required_skill_percentage ?? "",
        desirable_abilities: jobOpportunity.desirable_abilities || [],
        desirablePercentage: jobOpportunity.desirable_skill_percentage ?? "",
      });
    } else {
      // Nueva convocatoria
      setFormData((prev) => ({
        ...prev,
        status: jobOpportunity.status,
      }));
    }
  }, [jobOpportunity, statesAreLoaded]);

  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []); // Cambia la dependencia a un array vacío

  const checkRegion = (e) => {
    const { name, value } = e.target;

    if (name === "country_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        state_id: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica si el botón "Guardar" fue el que disparó el evento
    if (e.nativeEvent.submitter?.name !== "saveButton") {
      return;
    }

    if (formData.required_abilities.length === 0) {
      return alert("Debes agregar al menos una etiqueta excluyente.");
    }
    if (formData.desirable_abilities.length === 0) {
      return alert("Debes agregar al menos una etiqueta deseable.");
    }
    if (formData.title.length > 75) {
      return alert("El título no puede tener más de 75 caracteres.");
    }
    if (formData.description.length > 1000) {
      return alert("La descripción no puede tener más de 1000 caracteres.");
    }

    setIsSaving(true);

    try {
      await onSave(formData, jobOpportunity.id);

      toastAlerts.showSuccess("Convocatoria guardada exitosamente");

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error al guardar la convocatoria:", error);
      toastAlerts.showError(
        "Hubo un error al guardar la convocatoria, recargue la página e intente nuevamente"
      );
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    {
      if (jobOpportunity) {
        var countryId = "";
        if (statesAreLoaded) {
          const state = Object.values(states)
            .flat()
            .find((state) => state.id === jobOpportunity.state_id);
          countryId = state ? state.country_id : "";
        }
        setFormData({
          status: jobOpportunity.status || "activo",
          work_mode: jobOpportunity.work_mode || "remoto",
          title: jobOpportunity.title || "",
          description: jobOpportunity.description || "",
          country_id: countryId ? countryId : "",
          state_id: jobOpportunity.state_id || "",
          required_abilities: jobOpportunity.required_abilities || [],
          desirable_abilities: jobOpportunity.desirable_abilities || [],
          requiredPercentage: jobOpportunity.required_skill_percentage ?? "",
          desirablePercentage: jobOpportunity.desirable_skill_percentage ?? "",
        });
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="bg-white w-full h-auto overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                  📂 Título convocatoria
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={checkRegion}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                  🌐 Modalidad
                </label>
                <select
                  name="work_mode"
                  value={formData.work_mode}
                  onChange={checkRegion}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  required
                >
                  <option value="remoto">Remoto</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                  🗺️ País
                </label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={checkRegion}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>
                    Seleccione un país
                  </option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                  🗻 Región
                </label>
                <select
                  name="state_id"
                  value={formData.state_id}
                  onChange={checkRegion}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  required
                >
                  <option value="" disabled>
                    Seleccione una región
                  </option>
                  {states[formData.country_id]?.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                  🛑 Estado
                </label>
                {canEditStatus ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={checkRegion}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    required
                  >
                    <option value="activo">Activa</option>
                    <option value="no_activo">Inactiva</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      formData.status == "no_activo" ? "Inactiva" : "Activa"
                    }
                    disabled
                    className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 sm:text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-1">
                  📃 Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={checkRegion}
                  className="mt-1 block w-full h-43 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm resize-none "
                  required
                />
              </div>
            </div>
          </div>
          <JobOpportunitiesTags
            tags={formData.required_abilities}
            otherTags={formData.desirable_abilities}
            setFormData={setFormData}
            type="required_abilities"
            percentage={formData.requiredPercentage}
            setPercentage={(value) =>
              setFormData((prev) => ({ ...prev, requiredPercentage: value }))
            }
          />
          <JobOpportunitiesTags
            tags={formData.desirable_abilities}
            otherTags={formData.required_abilities}
            setFormData={setFormData}
            type="desirable_abilities"
            percentage={formData.desirablePercentage}
            setPercentage={(value) =>
              setFormData((prev) => ({ ...prev, desirablePercentage: value }))
            }
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => handleCancel()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Restaurar datos
            </button>
            <button
              type="submit"
              name="saveButton"
              className={`px-4 py-2 rounded-md text-white ${
                isSaving
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
              disabled={isSaving}
            >
              {isSaving ? "Guardado ✅" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
