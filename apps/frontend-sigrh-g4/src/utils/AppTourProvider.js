import { TourProvider } from "@reactour/tour";

export default function AppTourProvider({ steps, children }) {
  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 12,
          color: "#047857",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)",
          padding: "3rem",
        }),
        badge: (base) => ({
          ...base,
          background: "#10b981",
          color: "#fff",
          fontWeight: "bold",
        }),
        dot: (base) => ({
          ...base,
          background: "#10b981",
          border: "1px solid #047857",
        }),
        close: (base) => ({
          ...base,
          padding: 5,
          width: 20,
          height: 20,
          color: "#047857",
        }),
        controls: (base) => ({
          ...base,
          marginTop: 16,
        }),
        arrow: (base) => ({
          ...base,
          padding: 0,
          margin: 10,
          color: "#047857",
        }),
        button: (base) => ({
          ...base,
          background: "#fff",
          color: "#10b981",
          borderRadius: 10,
          fontWeight: "bold",
          border: "2px solid #10b981",
        }),
      }}
    >
      {children}
    </TourProvider>
  );
}
