import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineRight, AiOutlinePlus } from "react-icons/ai";
import { IoMdArrowRoundForward } from "react-icons/io";

export default function RelationalInput({
  options,
  value,
  onChange,
  resourceUrl,
  onCrearNuevo,
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef(null); // <-- ref para el contenedor

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const seleccionar = (option) => {
    onChange(option);
    setIsOpen(false);
    setQuery("");
    setHighlightedIndex(-1);
  };

  const verDetalles = () => {
    if (value) {
      router.push(`${resourceUrl}`);
    }
  };

  const manejarTeclas = (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      seleccionar(filteredOptions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Cierra el desplegable al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
      <div className="relative">
        <div className="flex gap-2">
          <input
            className="w-full py-1 bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
            placeholder="Buscar o seleccionar..."
            value={value ? value.label : query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={manejarTeclas}
          />
          {/* <button
            onClick={verDetalles}
            disabled={!value}
            className="gap-1 px-2 py-1 text-sm cursor-pointer disabled:opacity-50"
          >
            <IoMdArrowRoundForward size={16} />
          </button> */}
        </div>
        {isOpen && (
          <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-auto shadow min-w-full">
            {filteredOptions.map((opt, index) => (
              <li
                key={opt.value}
                className={`px-2 py-1 cursor-pointer flex justify-between ${
                  highlightedIndex === index ? "bg-blue-100" : ""
                } ${
                  value && value.value === opt.value ? "font-semibold" : ""
                } hover:bg-gray-100`}
                onClick={() => seleccionar(opt)}
              >
                {opt.label}
                {value && value.value === opt.value && (
                  <span className="text-green-500 text-xs ml-2">
                    (Seleccionado)
                  </span>
                )}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <>
                <li className="px-2 py-1 text-gray-400">No hay resultados</li>
                {/* <li
                  onClick={onCrearNuevo}
                  className="px-2 py-1 text-gray-400 flex items-center gap-1 cursor-pointer hover:bg-gray-100"
                >
                  <AiOutlinePlus size={16} /> Nuevo
                </li> */}
              </>
            )}
            <li className="px-2 py-1 text-emerald-500 hover:bg-gray-100 cursor-pointer text-sm">
              Buscar más...
            </li>
            <li className="px-2 py-1 italic text-gray-500 text-sm">
              Escriba algo…
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
