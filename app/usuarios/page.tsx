"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Users,
    UserPlus,
    Search,
    Pencil,
    Trash2,
    Shield,
    ShieldAlert,
    Key,
    Mail,
    User as UserIcon,
    Eye,
    EyeOff,
    Check,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { getUsers, createUser, updateUser, deleteUser, UserDTO } from "@/app/actions/users";

export default function UsuariosPage() {
    const { data: session } = useSession();

    const [users, setUsers] = useState<UserDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State (Create / Edit)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDTO | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("user");
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Delete Alert State
    const [userToDelete, setUserToDelete] = useState<UserDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Users
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            toast.error("Erro ao carregar lista de usuários.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Filter Users
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);

    // Open Modal for Create
    const handleOpenCreate = () => {
        setEditingUser(null);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("user");
        setShowPassword(false);
        setIsDialogOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEdit = (user: UserDTO) => {
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword("");
        setConfirmPassword("");
        setRole(user.role);
        setShowPassword(false);
        setIsDialogOpen(true);
    };

    // Submit Form (Create / Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            toast.warning("Nome e E-mail são obrigatórios.");
            return;
        }

        // Validation for new user
        if (!editingUser) {
            if (!password) {
                toast.warning("Defina uma senha para o novo usuário.");
                return;
            }
            if (password.length < 8) {
                toast.warning("A senha deve ter pelo menos 8 caracteres.");
                return;
            }
            if (password !== confirmPassword) {
                toast.warning("As senhas informadas não conferem.");
                return;
            }
        } else {
            // Edit user password check if typed
            if (password && password.length < 8) {
                toast.warning("A nova senha deve ter pelo menos 8 caracteres.");
                return;
            }
            if (password && password !== confirmPassword) {
                toast.warning("As senhas informadas não conferem.");
                return;
            }
        }

        setIsSaving(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, {
                    name,
                    email,
                    role,
                    ...(password ? { password } : {}),
                });
                toast.success("Usuário atualizado com sucesso!");
            } else {
                await createUser({
                    name,
                    email,
                    password,
                    role,
                });
                toast.success("Usuário cadastrado com sucesso!");
            }

            setIsDialogOpen(false);
            loadUsers();
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar usuário.");
        } finally {
            setIsSaving(false);
        }
    };

    // Confirm Delete
    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await deleteUser(userToDelete.id);
            toast.success("Usuário excluído com sucesso!");
            setUserToDelete(null);
            loadUsers();
        } catch (error: any) {
            toast.error(error.message || "Erro ao excluir usuário.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header da página */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Cadastro de Usuários
                    </h1>
                    <p className="text-sm text-slate-500">
                        Gerencie os usuários que possuem acesso ao sistema
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow font-medium"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Novo Usuário
                </Button>
            </div>

            {/* Card com lista de usuários */}
            <Card>
                <CardHeader className="border-b bg-slate-50/50 pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-800">
                                Usuários Cadastrados
                            </CardTitle>
                            <CardDescription>
                                Total de {filteredUsers.length} usuário(s) encontrado(s)
                            </CardDescription>
                        </div>

                        {/* Campo de Busca */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-sm text-slate-500">Carregando usuários...</span>
                            </div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
                            <Users className="h-10 w-10 text-slate-300" />
                            <p className="text-sm font-medium">Nenhum usuário encontrado</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>E-mail</TableHead>
                                        <TableHead>Nível de Acesso</TableHead>
                                        <TableHead>Data de Cadastro</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const isCurrentUser = session?.user?.email?.toLowerCase() === user.email.toLowerCase();
                                        const formattedDate = format(
                                            new Date(user.createdAt),
                                            "dd/MM/yyyy 'às' HH:mm",
                                            { locale: ptBR }
                                        );

                                        return (
                                            <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Nome + Avatar */}
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">
                                                                {user.name}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className="text-xs text-blue-600 font-medium">
                                                                    (Você)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* E-mail */}
                                                <TableCell className="text-slate-600 font-mono text-xs">
                                                    {user.email}
                                                </TableCell>

                                                {/* Role */}
                                                <TableCell>
                                                    {user.role === "admin" ? (
                                                        <Badge variant="default" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 gap-1 font-medium">
                                                            <Shield className="h-3 w-3" /> Administrador
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200 gap-1 font-medium">
                                                            <UserIcon className="h-3 w-3" /> Usuário
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                {/* Data */}
                                                <TableCell className="text-slate-500 text-xs">
                                                    {formattedDate}
                                                </TableCell>

                                                {/* Ações */}
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(user)}
                                                            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                            title="Editar usuário"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setUserToDelete(user)}
                                                            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                                                            title="Excluir usuário"
                                                            disabled={isCurrentUser || users.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Cadastro / Edição */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            {editingUser ? <Pencil className="h-5 w-5 text-blue-600" /> : <UserPlus className="h-5 w-5 text-blue-600" />}
                            {editingUser ? "Editar Usuário" : "Novo Usuário"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? "Atualize as informações do usuário. Deixe a senha em branco se não quiser alterá-la."
                                : "Preencha os dados abaixo para cadastrar um novo acesso ao sistema."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Nome */}
                        <div className="space-y-1.5">
                            <Label htmlFor="user-name" className="text-xs font-semibold text-slate-700">
                                Nome Completo *
                            </Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="user-name"
                                    placeholder="Ex: João da Silva"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        {/* E-mail */}
                        <div className="space-y-1.5">
                            <Label htmlFor="user-email" className="text-xs font-semibold text-slate-700">
                                E-mail de Acesso *
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="user-email"
                                    type="email"
                                    placeholder="usuario@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="user-role" className="text-xs font-semibold text-slate-700">
                                Nível de Acesso
                            </Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o nível" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuário (Padrão)</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Senha */}
                        <div className="space-y-1.5">
                            <Label htmlFor="user-password" className="text-xs font-semibold text-slate-700">
                                {editingUser ? "Nova Senha (opcional)" : "Senha de Acesso *"}
                            </Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="user-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={editingUser ? "Preencha apenas para alterar" : "Mínimo 8 caracteres"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 pr-10"
                                    required={!editingUser}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Senha */}
                        {(password || !editingUser) && (
                            <div className="space-y-1.5">
                                <Label htmlFor="user-confirm-password" className="text-xs font-semibold text-slate-700">
                                    Confirmar Senha *
                                </Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="user-confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Repita a senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-9"
                                        required={!editingUser || Boolean(password)}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : editingUser ? (
                                    "Atualizar"
                                ) : (
                                    "Cadastrar"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog para Exclusão */}
            <AlertDialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="h-5 w-5" />
                            Excluir Usuário
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o acesso de <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
                            <br />
                            Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? "Excluindo..." : "Excluir Usuário"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
