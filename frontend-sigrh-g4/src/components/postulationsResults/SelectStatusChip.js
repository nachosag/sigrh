import React, { useState } from "react";
import axios from "axios";
import config from "@/config";
import RejectModal from "./RejectModal";
import { toastAlerts } from "@/utils/toastAlerts";

const SelectStatusChip = ({ value, postulation, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const getColorClass = (val) => {
    switch (val) {
      case "pendiente":
        return "bg-yellow-200 text-yellow-700 border-yellow-400";
      case "aceptada":
        return "bg-green-200 text-green-700 border-green-400";
      case "rechazado":
        return "bg-red-200 text-red-700 border-red-400";
      case "contratado":
        return "bg-blue-200 text-blue-700 border-blue-400";
      case "no aceptada":
        return "bg-red-400 text-red-900 border-red-600";
      default:
        return "bg-gray-200 text-gray-600 border-gray-400";
    }
  };

  const handleChange = async (e) => {
    const newValue = e.target.value;

    if (newValue === "no aceptada") {
      setPendingStatus(newValue);
      setShowModal(true);
      return;
    }

    const motive = "";

    try {
      await axios.patch(`${config.API_URL}/postulations/${postulation.id}`, {
        status: newValue,
        motive: motive,
      });
      onChange();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toastAlerts.showError(
        "Hubo un error al actualizar el estado de la postulación, recargue la página e intente nuevamente"
      );
    }
  };

  return (
    <>
      <select
        value={value}
        onChange={handleChange}
        className={`rounded-full px-3 py-1 text-xs md:text-sm font-semibold border focus:outline-none ${getColorClass(
          value
        )}`}
      >
        <option value="pendiente" className="bg-white text-black">
          Pendiente
        </option>
        <option value="aceptada" className="bg-white text-black">
          Aceptada
        </option>
        <option value="no aceptada" className="bg-white text-black">
          No aceptada
        </option>
        <option value="contratado" className="bg-white text-black">
          Contratado
        </option>
      </select>

      {showModal && (
        <RejectModal
          setShowModal={setShowModal}
          setPendingStatus={setPendingStatus}
          pendingStatus={pendingStatus}
          onChange={onChange}
          postulation={postulation}
        />
      )}
    </>
  );
};

export default SelectStatusChip;
