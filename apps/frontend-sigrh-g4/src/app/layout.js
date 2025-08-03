import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SystemConfigProvider } from "@/contexts/sysConfigContext";
import CustomHead from "@/components/CustomHead";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ofertas de empleo",
  description: "Ofertas de empleo",
};

export default function RootLayout({ children }) {
  return (
    <SystemConfigProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <CustomHead />
          {children}
          <ToastContainer />
        </body>
      </html>
    </SystemConfigProvider>
  );
}
