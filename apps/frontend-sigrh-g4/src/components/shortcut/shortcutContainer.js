"use client";

import Image from "next/image";
import Link from "next/link";

export default function ShortcutContainer() {
  const shortcuts = [
    { label: "Portal para postularse", href: "/" },
    { label: "SIGRH", href: "/sigrh" },
    { label: "Totem entrada", href: "/face_recognition/in" },
    { label: "Totem salida", href: "/face_recognition/out" },
    // Podés agregar más accesos acá
  ];

  return (
    <div className="relative w-full min-h-screen">
      {/* Fondo */}
      <Image
        src="/fondo-postulaciones.png"
        alt="Fondo postulaciones"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Contenido */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full space-y-8 p-6">
        <div className="bg-white rounded-full shadow-md px-6 py-2 flex items-center justify-center">
          <h1 className="text-emerald-600 text-3xl font-semibold">SIGRH+</h1>
        </div>
        <div className="bg-white rounded-full shadow-md px-6 py-2 flex items-center justify-center">
          <h1 className="text-emerald-600 text-3xl font-semibold">
            Accesos directos
          </h1>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-4 gap-6">
          {shortcuts.map((shortcut, index) => (
            <Link
              key={index}
              href={shortcut.href}
              className="w-40 h-40 bg-white/90 hover:bg-white text-emerald-600 font-semibold rounded-xl shadow-lg flex items-center justify-center text-center text-lg transition duration-300"
            >
              {shortcut.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
