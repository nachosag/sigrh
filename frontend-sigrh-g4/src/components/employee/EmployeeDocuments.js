import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import { MdDeleteOutline, MdOutlineFileDownload } from "react-icons/md";
import Cookies from "js-cookie";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EmployeeDocuments({ employeeData }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    active: false,
    file: null,
  });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}/documents/${employeeData.id}`
      );
      setDocuments(res.data);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    if (!confirm("¿Seguro que quieres eliminar este documento?")) return;
    try {
      await axios.delete(
        `${config.API_URL}/documents/${employeeData.id}/${documentId}`
      );
      setDocuments((prev) =>
        prev.filter((doc) => doc.document_id !== documentId)
      );
    } catch (error) {
      console.error("Error al eliminar documento:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toastAlerts.showError(
        "Debe seleccionar un archivo para agregar el documento."
      );
      return;
    }

    try {
      const fileBase64 = await convertFileToBase64(formData.file);
      const documentData = {
        name: formData.name,
        extension: formData.file.name.split(".").pop(),
        creation_date: new Date().toISOString().split("T")[0],
        active: formData.active,
        file: fileBase64,
      };

      await axios.post(
        `${config.API_URL}/documents/${employeeData.id}`,
        documentData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setFormData({ name: "", active: false, file: null });
      setShowForm(false);
      fetchDocuments();
    } catch (error) {
      console.error("Error al agregar documento:", error);
    }
  };

  const handleDownload = (base64File, fileName, fileExtension) => {
    const byteCharacters = atob(base64File);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: "application/octet-stream" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${fileName}.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  useEffect(() => {
    fetchDocuments();
  }, [employeeData.id]);

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-500 rounded-full text-white text-sm font-semibold flex items-center gap-2"
        >
          + Agregar
        </button>
      </div>

      <table className="min-w-full table-auto">
        <thead className="bg-emerald-50">
          <tr>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Nombre del Documento
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Extensión
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Fecha de Creación
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Vigente
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr key={"loading"}>
              <td colSpan="5" className="text-center py-4">
                Cargando...
              </td>
            </tr>
          ) : (
            documents.map((document) => (
              <tr
                key={document.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-2">{document.name}</td>
                <td className="px-4 py-2">{document.extension}</td>
                <td className="px-4 py-2">
                  {new Date(document.creation_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {document.active ? (
                    <span className="text-green-600 font-semibold">Sí</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() =>
                      handleDownload(
                        document.file,
                        document.name,
                        document.extension
                      )
                    }
                    className="text-emerald-500 hover:underline"
                  >
                    <MdOutlineFileDownload />
                  </button>
                  <button
                    onClick={() => deleteDocument(document.document_id)}
                    className="text-red-500 hover:underline"
                  >
                    <MdDeleteOutline />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-lg font-semibold mb-4">Agregar Documento</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-emerald-700">
                  Nombre del Documento
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-emerald-700">
                  Archivo
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div className="mb-3 flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm text-emerald-700">¿Vigente?</label>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-emerald-300 text-emerald-700 rounded hover:bg-emerald-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
