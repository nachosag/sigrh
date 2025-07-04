"use client";

import { useRouter } from "next/navigation";

export default function FaceRecognitionPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className=" text-3xl p-4 mb-4 text-emerald-700 font-semibold text-center rounded">
          Seleccione la opción de fichada que desea realizar:
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
          <button
            className="bg-emerald-500 text-white text-2xl font-semibold px-4 py- rounded-full cursor-pointer hover:bg-emerald-600"
            onClick={() => router.push("/face_recognition/in")}
          >
            Check in
          </button>
          <button
            className="bg-emerald-500 text-white text-2xl px-4 font-semibold py-4 rounded-full cursor-pointer hover:bg-emerald-600"
            onClick={() => router.push("/face_recognition/out")}
          >
            Check out
          </button>
        </div>
      </div>
    </div>
  );
}
