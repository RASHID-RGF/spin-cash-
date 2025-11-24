import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Ban, CheckCircle, Mail, Phone, Calendar } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const UserManagement = () => {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select(`
          *,
          wallets (
            balance,
            total_earnings,
            bonus_balance,
            spin_points
          )
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ is_active: !currentStatus })
                .eq("id", userId);

            if (error) throw error;

            toast({
                title: "Success",
                description: `User ${!currentStatus ? "activated" : "deactivated"} successfully`,
            });
            fetchUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to update user status",
                variant: "destructive",
            });
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.includes(searchTerm)
    );

    if (loading) {
        return (
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardContent className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>User Management</span>
                    <Badge variant="secondary" className="bg-blue-500/30 text-white">
                        {users.length} Total Users
                    </Badge>
                </CardTitle>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 backdrop-blur-md bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/20 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-gray-300">Name</TableHead>
                                <TableHead className="text-gray-300">Email</TableHead>
                                <TableHead className="text-gray-300">Phone</TableHead>
                                <TableHead className="text-gray-300">Balance</TableHead>
                                <TableHead className="text-gray-300">Earnings</TableHead>
                                <TableHead className="text-gray-300">Status</TableHead>
                                <TableHead className="text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="text-white font-medium">
                                        {user.full_name || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3" />
                                            {user.email || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" />
                                            {user.phone_number || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-white font-semibold">
                                        {user.wallets?.[0]?.balance?.toFixed(2) || "0.00"} KES
                                    </TableCell>
                                    <TableCell className="text-green-400 font-semibold">
                                        {user.wallets?.[0]?.total_earnings?.toFixed(2) || "0.00"} KES
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.is_active ? "default" : "destructive"}
                                            className={user.is_active ? "bg-green-500/30 text-green-400" : "bg-red-500/30 text-red-400"}
                                        >
                                            {user.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        View
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="backdrop-blur-md bg-slate-900/95 border-white/20 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-white">User Details</DialogTitle>
                                                        <DialogDescription className="text-gray-400">
                                                            Complete information about {selectedUser?.full_name}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    {selectedUser && (
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Full Name</p>
                                                                    <p className="font-semibold">{selectedUser.full_name}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Email</p>
                                                                    <p className="font-semibold">{selectedUser.email}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Phone</p>
                                                                    <p className="font-semibold">{selectedUser.phone_number}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Referral Code</p>
                                                                    <p className="font-semibold">{selectedUser.referral_code}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Balance</p>
                                                                    <p className="font-semibold text-green-400">
                                                                        {selectedUser.wallets?.[0]?.balance?.toFixed(2) || "0.00"} KES
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Total Earnings</p>
                                                                    <p className="font-semibold text-purple-400">
                                                                        {selectedUser.wallets?.[0]?.total_earnings?.toFixed(2) || "0.00"} KES
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Bonus Balance</p>
                                                                    <p className="font-semibold text-blue-400">
                                                                        {selectedUser.wallets?.[0]?.bonus_balance?.toFixed(2) || "0.00"} KES
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Spin Points</p>
                                                                    <p className="font-semibold text-yellow-400">
                                                                        {selectedUser.wallets?.[0]?.spin_points || 0}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Joined</p>
                                                                    <p className="font-semibold">
                                                                        {new Date(selectedUser.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-400">Status</p>
                                                                    <Badge
                                                                        variant={selectedUser.is_active ? "default" : "destructive"}
                                                                        className={selectedUser.is_active ? "bg-green-500/30" : "bg-red-500/30"}
                                                                    >
                                                                        {selectedUser.is_active ? "Active" : "Inactive"}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={
                                                    user.is_active
                                                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                                }
                                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                            >
                                                {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserManagement;
