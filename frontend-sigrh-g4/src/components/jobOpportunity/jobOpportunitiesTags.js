import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobOpportunitiesTags({
  tags,
  setFormData,
  type,
  otherTags,
  percentage,
  setPercentage,
}) {
  const [availableTags, setAvailableTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const token = Cookies.get("token");
  const maxSuggestions = 1; // Número máximo de sugerencias a mostrar

  const fetchAvailableTags = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/abilities/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 200) throw new Error("Error al traer las habilidades");

      setAvailableTags(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al obtener las habilidades, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchAvailableTags();
  }, [tags, otherTags]);

  const create_ability = async (ability) => {
    try {
      const res = await axios.post(
        `${config.API_URL}/abilities/create`,
        { name: ability, description: "" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status !== 201) throw new Error("Error al crear la habilidad");

      return res.data; // Devuelve el objeto creado
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al crear la habilidad, recargue la página e intente nuevamente"
      );
      console.error("Error al crear la habilidad:", e);
      return null; // Devuelve null en caso de error
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const filteredSuggestions = availableTags
        .filter(
          (tag) =>
            tag.name.toLowerCase().includes(value.toLowerCase()) &&
            !tags.some(
              (existingTag) =>
                existingTag.name.toLowerCase() === tag.name.toLowerCase()
            ) &&
            !otherTags.some(
              (existingTag) =>
                existingTag.name.toLowerCase() === tag.name.toLowerCase()
            )
        )
        // Ordenar para que las coincidencias exactas aparezcan primero
        .sort((a, b) => {
          if (a.name.toLowerCase() === value.toLowerCase()) return -1;
          if (b.name.toLowerCase() === value.toLowerCase()) return 1;
          return 0;
        })
        .slice(0, maxSuggestions);

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddTag = (tag) => {
    if (tags.length >= 15) {
      alert("No puedes agregar más de 15 etiquetas.");
      return;
    }

    // Verificar si la etiqueta ya existe en required_abilities o desirable_abilities
    let alreadyExists = false;

    setFormData((prev) => {
      const isTagInRequired = prev.required_abilities.some(
        (existingTag) =>
          existingTag.name.toLowerCase() === tag.name.toLowerCase()
      );
      const isTagInDesirable = prev.desirable_abilities.some(
        (existingTag) =>
          existingTag.name.toLowerCase() === tag.name.toLowerCase()
      );

      if (isTagInRequired || isTagInDesirable) {
        alreadyExists = true; // Marcar que la etiqueta ya existe
        return prev; // No realizar cambios si ya existe
      }

      const updatedFormData = { ...prev };

      if (type === "required_abilities") {
        updatedFormData.required_abilities = [...prev.required_abilities, tag];
      } else if (type === "desirable_abilities") {
        updatedFormData.desirable_abilities = [
          ...prev.desirable_abilities,
          tag,
        ];
      }

      return updatedFormData;
    });

    // Mostrar el mensaje de alerta solo si la etiqueta ya existía
    if (alreadyExists) {
      alert("La etiqueta ya existe en alguna de las listas.");
    } else {
      setInputValue(""); // Limpiar el valor del input
      setSuggestions([]); // Limpiar las sugerencias
    }
  };

  const handleCreateTag = async () => {
    if (tags.length >= 15) {
      alert("No puedes agregar más de 15 etiquetas.");
      return;
    }
    if (inputValue.length >= 50) {
      alert("La etiqueta no puede tener más de 50 caracteres.");
      return;
    }
    if (
      availableTags.some(
        (existingTag) =>
          existingTag.name.toLowerCase() === inputValue.toLowerCase()
      )
    ) {
      alert("La etiqueta " + inputValue + " ya existe.");
      return;
    }

    const newTag = await create_ability(inputValue); // Espera el objeto creado
    if (newTag) {
      setFormData((prev) => {
        const updatedFormData = { ...prev };

        if (type === "required_abilities") {
          updatedFormData.required_abilities = [
            ...prev.required_abilities,
            {
              id: newTag.id,
              name: newTag.name,
              description: newTag.description,
            },
          ];
        } else if (type === "desirable_abilities") {
          updatedFormData.desirable_abilities = [
            ...prev.desirable_abilities,
            {
              id: newTag.id,
              name: newTag.name,
              description: newTag.description,
            },
          ];
        }

        return updatedFormData;
      });
    }

    setInputValue("");
    setSuggestions([]);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => {
      const updatedFormData = { ...prev };

      if (type === "required_abilities") {
        updatedFormData.required_abilities = prev.required_abilities.filter(
          (tag) => tag.id !== tagToRemove.id
        );
      } else if (type === "desirable_abilities") {
        updatedFormData.desirable_abilities = prev.desirable_abilities.filter(
          (tag) => tag.id !== tagToRemove.id
        );
      }

      return updatedFormData;
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
        {type === "required_abilities"
          ? "📋 Habilidades requeridas"
          : "📋 Habilidades deseables"}
      </label>
      <div className="mt-1 flex gap-2 overflow-x-auto whitespace-nowrap rounded-md">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`flex items-center ${
              type === "required_abilities"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-700"
            } px-3 py-1 rounded-full font-semibold text-sm`}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={
            type === "required_abilities"
              ? "Buscar o crear habilidad"
              : "Buscar o crear habilidad"
          }
          className="block w-2/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
        />
        <input
          name={
            type === "required_abilities"
              ? "requiredPercentage"
              : "desirablePercentage"
          }
          type="number"
          value={percentage ?? ""}
          onChange={(e) => setPercentage(e.target.value)}
          className="block w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          placeholder=" % Porcentaje de habilidades que se deben encontrar"
          min={0}
          max={100}
          required
        />
      </div>
      <div className="relative mt-4">
        <div className="absolute z-10 bg-white rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto w-full">
          {/* Mostrar sugerencias */}
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleAddTag(suggestion)}
                  className="px-4 py-2 cursor-pointer hover:bg-emerald-100"
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}

          {/* Mostrar siempre la opción de crear etiqueta */}
          {inputValue &&
            !availableTags.some(
              (existingTag) =>
                existingTag.name.toLowerCase() === inputValue.toLowerCase()
            ) && (
              <div>
                <button
                  onClick={handleCreateTag}
                  className="w-full px-4 py-2 text-left cursor-pointer hover:bg-emerald-100"
                >
                  Crear etiqueta: <strong>{inputValue}</strong>
                </button>
              </div>
            )}

          {
            /* Mostrar mensaje si no hay sugerencias */
            suggestions.length === 0 &&
              availableTags.some(
                (existingTag) =>
                  existingTag.name.toLowerCase() === inputValue.toLowerCase()
              ) &&
              inputValue && (
                <div className="px-4 py-2 text-gray-500">
                  Ya agregaste "{inputValue}"
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
}
