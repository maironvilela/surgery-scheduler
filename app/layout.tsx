import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Surgery Scheduler",
  description: "Sistema de Agendamento Cirúrgico",
};

import { HospitalProvider } from "@/context/hospital-context";
import { DoctorProvider } from "@/context/doctor-context";
import { PatientProvider } from "@/context/patient-context";
import { AgendaProvider } from "@/context/agenda-context";
import { ProcedureProvider } from "@/context/procedure-context";

import AppLayout from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* SessionProvider disponibiliza useSession() em todos os componentes cliente */}
        <SessionProvider>
          <HospitalProvider>
            <DoctorProvider>
              <PatientProvider>
                <AgendaProvider>
                  <ProcedureProvider>
                    <AppLayout>
                      {children}
                    </AppLayout>
                    <Toaster />
                  </ProcedureProvider>
                </AgendaProvider>
              </PatientProvider>
            </DoctorProvider>
          </HospitalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
