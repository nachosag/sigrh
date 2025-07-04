import { useState } from "react";
import SelectPayrollStatusChip from "./selectPayrollStatusChip";
import { capitalize } from "@/utils/capitalize";
import axios from "axios";
import config from "@/config";
import EditPayrollNotesModal from "./editPayrollNotesModal";
import { CONCEPTS_ALARM } from "@/constants/conceptsAlarms";
import AttendanceChecksEventsDetailsModal from "../attendance/attendanceChecksEventsDetailsModal";
import { FiAlertTriangle } from "react-icons/fi";
import { toastAlerts } from "@/utils/toastAlerts";

const columns = [
  "Día",
  "Fecha",
  "Novedad",
  "Entrada",
  "Salida",
  "Fichadas",
  "Turno",
  "Concepto",
  "Horas",
  "Notas",
  "Estado",
];

export default function PayrollTable({ data, employee, onUpdateData }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  const openEditModal = (note, id) => {
    setSelectedNote(note);
    setSelectedRowId(id);
    setOpenModal(true);
  };

  const openAttendanceModal = (workDate) => {
    setSelectedDate(workDate);
    setAttendanceModalOpen(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setSelectedNote(null);
    setSelectedRowId(null);
  };

  const handlePayrollStatusChange = async (payrollRowId, newState) => {
    // alert(`Cambio de estado row ${payrollRowId} -> Estado: ${newState}`);

    try {
      const res = await axios.patch(
        `${config.API_URL}/employee_hours/${payrollRowId}`,
        { payroll_status: newState }
      );

      if (res.status === 200) {
        toastAlerts.showSuccess("Registro de horas actualizado correctamente.");
        onUpdateData();
      } else {
        throw Error(
          `Ha ocurrido un error al actualizar el registro de horas: COD. ${res.status} ${res.statusText}`
        );
      }
    } catch (e) {
      console.error(
        "ha ocurrido un error al actualizar el registro de horas",
        e
      );
      toastAlerts.showError(
        `Ha ocurrido un error al actualizar el registro de horas: ${e.message}`
      );
    }
  };

  const getConceptComponentDescription = (row) => {
    const concept = row?.concept?.description;

    const isAlarm =
      CONCEPTS_ALARM.includes(concept) &&
      row.employee_hours.payroll_status != "archived";

    return (
      <div className="flex gap-2 items-center">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isAlarm
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-gray-100 text-gray-700 border border-gray-300"
          }`}
        >
          {concept || "—"}
        </span>
        {isAlarm && <FiAlertTriangle className="text-red-500" />}
      </div>
    );
  };

  return (
    <div className="overflow-auto h-[70vh]">
      <table className="min-w-full table-fixed bg-white rounded-lg shadow">
        <thead className="sticky top-0">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold text-center"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-xs">
          {data?.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-400"
              >
                {employee
                  ? "No hay resultados para la búsqueda."
                  : "Ingrese los campos de búsqueda y haga clic en buscar para ver los resultados."}
              </td>
            </tr>
          ) : (
            data?.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-300 hover:bg-gray-100"
              >
                <td className="px-3 py-2">
                  {capitalize(
                    new Date(
                      row.employee_hours.work_date + "T00:00:00"
                    ).toLocaleDateString("es-AR", { weekday: "long" })
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(
                    row.employee_hours.work_date + "T00:00:00"
                  ).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  {row.employee_hours.register_type}
                </td>
                <td className="px-3 py-2">
                  {row.employee_hours.first_check_in
                    ? new Date(
                        `1970-01-01T${row.employee_hours.first_check_in}`
                      ).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""}
                </td>
                <td className="px-3 py-2">
                  {row.employee_hours.last_check_out
                    ? new Date(
                        `1970-01-01T${row.employee_hours.last_check_out}`
                      ).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : ""}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  {row.employee_hours.check_count}{" "}
                  <button
                    onClick={() =>
                      openAttendanceModal(row.employee_hours.work_date)
                    }
                    className="text-emerald-500 underline text-xs"
                  >
                    Ver
                  </button>
                </td>
                <td className="px-3 py-2">{row.shift.description}</td>
                <td className="px-3 py-2">
                  {getConceptComponentDescription(row)}
                </td>
                <td className="px-3 py-2">
                  {row.employee_hours.sumary_time ||
                    row.employee_hours.extra_hours ||
                    "00:00:00"}
                </td>
                <td className="px-3 py-2 max-w-[200px]">
                  <div className="flex justify-between">
                    <span className="truncate" title={row.employee_hours.notes}>
                      {row.employee_hours.notes || "—"}
                    </span>
                    <button
                      onClick={() =>
                        openEditModal(
                          row.employee_hours.notes,
                          row.employee_hours.id
                        )
                      }
                      className="text-emerald-600 text-[11px] underline hover:text-emerald-800 w-fit"
                    >
                      Editar
                    </button>
                  </div>
                </td>

                <td className="px-3 py-2 flex gap-2 items-center">
                  <SelectPayrollStatusChip
                    value={row.employee_hours.payroll_status}
                    rowId={row.employee_hours.id}
                    onChange={handlePayrollStatusChange}
                  />
                  {row.employee_hours.payroll_status ===
                    "pending validation" && (
                    <FiAlertTriangle className="text-red-500" />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <AttendanceChecksEventsDetailsModal
        open={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        employeeId={employee?.id}
        employeeData={employee}
        fecha={selectedDate}
        onFichadasChanged={onUpdateData}
      />

      <EditPayrollNotesModal
        isOpen={openModal}
        onClose={closeModal}
        onSave={onUpdateData}
        initialNote={selectedNote}
        recordId={selectedRowId}
      />
    </div>
  );
}
