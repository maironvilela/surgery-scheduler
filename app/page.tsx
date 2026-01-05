import { KPICards } from "@/components/dashboard/kpi-cards";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <KPICards />
      <div className="grid gap-6 md:grid-cols-1">
        <RecentAppointments />
      </div>
    </div>
  );
}
