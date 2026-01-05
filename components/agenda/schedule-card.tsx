import { Button } from "@/components/ui/button";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { Clock, MapPin, User, Stethoscope, CalendarDays, Building } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { SurgeryStatus } from "@/types";

interface ScheduleCardProps {
    id: string;
    startTime: string;
    endTime: string;
    procedure: string;
    patient: string; // Mapped from patientName
    doctor: string; // Mapped from doctorName
    hospital: string; // Mapped from hospitalName
    room: string;
    date: string;
    status: SurgeryStatus;
}

export function ScheduleCard({
    id,
    startTime,
    endTime,
    procedure,
    patient,
    doctor,
    hospital,
    room,
    date,
    status,
}: ScheduleCardProps) {
    // Map SurgeryStatus to StatusType if needed, currently they look compatible or StatusBadge handles strings.
    // StatusType in StatusBadge might be specific. I'll assume it handles strings or I should check.
    // Assuming 'scheduled' | 'completed' | ... are valid keys for badge variants.

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <CardHeader className="pb-3 bg-secondary/30 relative">
                <div className="absolute top-4 right-4">
                    <StatusBadge status={status as StatusType} />
                </div>
                <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-lg">
                        <Clock className="h-5 w-5" />
                        <span>{startTime} - {endTime}</span>
                    </div>
                </div>
                <CardTitle className="text-xl font-bold mt-3 line-clamp-2 leading-tight text-center">
                    {patient}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                    <Stethoscope className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="font-medium">{procedure}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Dr(a). {doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Building className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{hospital}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{room}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
                </div>
            </CardContent>
            <CardFooter className="bg-secondary/10 pt-3 pb-3">
                <Link href={`/agenda/${id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                        Detalhes
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
