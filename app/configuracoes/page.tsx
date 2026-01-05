"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { User, Bell, Moon, Sun, Info, LogOut } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        appointments: true
    });

    const [darkMode, setDarkMode] = useState(false); // Mock dark mode state

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as preferências do sistema.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Perfil do Usuário
                        </CardTitle>
                        <CardDescription>Suas informações de acesso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                DR
                            </div>
                            <div>
                                <p className="font-medium">Dr. Roberto Almeida</p>
                                <p className="text-sm text-muted-foreground">roberto.almeida@hospital.com</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair do Sistema
                        </Button>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            Aparência
                        </CardTitle>
                        <CardDescription>Personalize a interface</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Modo Escuro</Label>
                                <p className="text-sm text-muted-foreground">
                                    Alternar entre temas claro e escuro.
                                </p>
                            </div>
                            <Switch
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notificações
                        </CardTitle>
                        <CardDescription>Gerencie como você recebe alertas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Notificações por Email</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receber resumos diários e alertas importantes.
                                </p>
                            </div>
                            <Switch
                                checked={notifications.email}
                                onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Push Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Alertas em tempo real no navegador.
                                </p>
                            </div>
                            <Switch
                                checked={notifications.push}
                                onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Lembretes de Cirurgia</Label>
                                <p className="text-sm text-muted-foreground">
                                    Avise-me com 2 horas de antecedência.
                                </p>
                            </div>
                            <Switch
                                checked={notifications.appointments}
                                onChange={(e) => setNotifications(prev => ({ ...prev, appointments: e.target.checked }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Sobre o Sistema
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex justify-between border-b pb-2">
                            <span>Versão</span>
                            <span className="font-mono">v1.0.0</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Desenvolvido por</span>
                            <span>Antigravity Engineering</span>
                        </div>
                        <div className="pt-2">
                            <p>
                                O Surgery Scheduler é uma plataforma para gestão eficiente de centros cirúrgicos,
                                integrando médicos, pacientes e hospitais em um fluxo unificado.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
