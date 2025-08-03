"use client";

export default function TagsModal({ open, onClose, title, postulation }) {
  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md z-10">
        <h2 className="text-lg font-bold mb-4">{title || "Habilidades"}</h2>
        <div className="max-h-72 overflow-y-auto mb-4">
          <table className="w-full border-none bg-blue-200">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left font-semibold border-b">
                  Habilidad
                </th>
                <th className="py-2 px-4 text-center font-semibold border-b">
                  ¿Encontrada?
                </th>
              </tr>
            </thead>
            <tbody>
              {title === "Habilidades deseables" ? (
                <>
                  {(postulation?.ability_match?.desired_words_found || []).map(
                    (ability, idx) => (
                      <tr key={`des-found-${idx}`}>
                        <td className="bg-emerald-200 py-2 px-4 border-b font-semibold">
                          {capitalizeFirstLetter(ability)}
                        </td>
                        <td className="bg-emerald-200 py-2 px-4 border-b text-center text-xl">
                          ✔️
                        </td>
                      </tr>
                    )
                  )}
                  {(
                    postulation?.ability_match?.desired_words_not_found || []
                  ).map((ability, idx) => (
                    <tr key={`des-notfound-${idx}`}>
                      <td className="bg-red-200 py-2 px-4 border-b font-semibold">
                        {capitalizeFirstLetter(ability)}
                      </td>
                      <td className="bg-red-200 py-2 px-4 border-b text-center text-xl">
                        ❌
                      </td>
                    </tr>
                  ))}
                  {!postulation?.ability_match?.desired_words_found?.length &&
                    !postulation?.ability_match?.desired_words_not_found
                      ?.length && (
                      <tr>
                        <td
                          colSpan={2}
                          className="py-2 px-4 text-center text-gray-500"
                        >
                          No hay habilidades deseables para mostrar
                        </td>
                      </tr>
                    )}
                </>
              ) : (
                <>
                  {(postulation?.ability_match?.required_words_found || []).map(
                    (ability, idx) => (
                      <tr key={`req-found-${idx}`}>
                        <td className="bg-emerald-200 py-2 px-4 border-b font-semibold">
                          {capitalizeFirstLetter(ability)}
                        </td>
                        <td className="bg-emerald-200 py-2 px-4 border-b text-center text-xl">
                          ✔️
                        </td>
                      </tr>
                    )
                  )}
                  {(
                    postulation?.ability_match?.required_words_not_found || []
                  ).map((ability, idx) => (
                    <tr key={`req-notfound-${idx}`}>
                      <td className="bg-red-200 py-2 px-4 border-b font-semibold">
                        {capitalizeFirstLetter(ability)}
                      </td>
                      <td className="bg-red-200 py-2 px-4 border-b text-center text-xl">
                        ❌
                      </td>
                    </tr>
                  ))}
                  {!postulation?.ability_match?.required_words_found?.length &&
                    !postulation?.ability_match?.required_words_not_found
                      ?.length && (
                      <tr>
                        <td
                          colSpan={2}
                          className="py-2 px-4 text-center text-gray-500"
                        >
                          No hay habilidades requeridas para mostrar
                        </td>
                      </tr>
                    )}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
