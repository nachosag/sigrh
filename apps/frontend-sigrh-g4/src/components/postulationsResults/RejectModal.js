"use client";
import React, { useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { toastAlerts } from "@/utils/toastAlerts";

const REJECT_REASONS = [
  // Motivos de la empresa
  "No cumple con los requisitos del puesto",
  "Falta de experiencia relevante",
  "No posee la formación académica requerida",
  "No se ajusta al perfil buscado",
  "No disponibilidad horaria",
  "Proceso cerrado por cobertura interna",
  "No pasó la entrevista técnica",
  "No pasó la entrevista de RRHH",
  // Motivos del postulante
  "Postulante solicitaba salario alto",
  "Postulante no interesado en la propuesta",
  "Postulante no se presentó a la entrevista",
  "Postulante retiró su postulación",
  "Postulante aceptó otra oferta",
  //Otros
  "Otro motivo",
  "No especificado",
];

export default function RejectModal({
  setShowModal,
  setPendingStatus,
  onChange,
  pendingStatus,
  postulation,
}) {
  const token = Cookies.get("token");
  const [rejectComment, setRejectComment] = useState("");

  const handleSendReject = async () => {
    await sendMotive();
    setShowModal(false);
    setRejectComment("");
    setPendingStatus(null);
    onChange();
  };

  const sendMotive = async () => {
    try {
      await axios.patch(`${config.API_URL}/postulations/${postulation.id}`, {
        status: pendingStatus,
        motive: rejectComment,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md z-10">
        <h2 className="text-lg font-bold mb-2">Motivo de rechazo</h2>
        <select
          className="w-full border rounded p-2 mb-4"
          size={4}
          style={{ overflowY: "auto" }}
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
        >
          <option value="" disabled>
            Seleccione un motivo...
          </option>
          {REJECT_REASONS.map((reason, idx) => (
            <option key={idx} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              setShowModal(false);
              setRejectComment("");
              setPendingStatus(null);
            }}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleSendReject}
            disabled={!rejectComment}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
