import { AppointmentMetrics } from "@/components/dashboard/appointment-metrics";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-2 md:p-4">
      {/* Módulo de Agendamentos de Consultas com Filtros e Gráfico Comparativo */}
      <AppointmentMetrics />
    </div>
  );
}


