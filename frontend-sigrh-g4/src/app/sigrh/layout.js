import SIGRHLayout from "@/components/SIGRHLayout/SIGRHLayout";
import { UserProvider } from "@/contexts/userContext";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "SIGRH+",
  description: "Aplicación de recursos humanos con IA",
};

export default function Layout({ children }) {
  return (
    <UserProvider>
      <SIGRHLayout>{children}</SIGRHLayout>
      <ToastContainer />
    </UserProvider>
  );
}
