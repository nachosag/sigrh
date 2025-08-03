export default function WorkInProgress() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-full p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl sm:text-5xl font-bold text-emerald-500">
          ¡Página en Construcción!
        </h1>
        <p className="text-xl md:text-lg text-center sm:text-left text-gray-700 font-semibold">
          Estamos trabajando en mejorar esta sección. Vuelve pronto.
        </p>
      </main>
    </div>
  );
}
