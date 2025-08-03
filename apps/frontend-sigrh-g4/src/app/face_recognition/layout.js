export default function FaceRecognitionLayout({ children }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Fondo de la página */}
      <img
        src="/fondo-postulaciones.png"
        alt="Fondo"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      {/* Capa negra con opacidad */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.20)", // Ajusta la opacidad aquí
          zIndex: 1,
        }}
      />
      {/* Contenido */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
