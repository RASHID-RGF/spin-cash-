import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CheckCircle, XCircle, Clock, DollarSign, User } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WithdrawalApprovalProps {
    onApprove?: () => void;
}

const WithdrawalApproval = ({ onApprove }: WithdrawalApprovalProps) => {
    const { toast } = useToast();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            const { data, error } = await supabase
                .from("withdrawals")
                .select(`
          *,
          profiles (
            full_name,
            email,
            phone_number
          )
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setWithdrawals(data || []);
        } catch (error: any) {
            console.error("Error fetching withdrawals:", error);
            toast({
                title: "Error",
                description: "Failed to fetch withdrawals",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (withdrawalId: string, userId: string, amount: number) => {
        try {
            // Update withdrawal status
            const { error: withdrawalError } = await supabase
                .from("withdrawals")
                .update({
                    status: "approved",
                    processed_at: new Date().toISOString()
                })
                .eq("id", withdrawalId);

            if (withdrawalError) throw withdrawalError;

            // Deduct from user's wallet
            const { data: wallet } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", userId)
                .single();

            if (wallet) {
                const { error: walletError } = await supabase
                    .from("wallets")
                    .update({ balance: wallet.balance - amount })
                    .eq("user_id", userId);

                if (walletError) throw walletError;
            }

            toast({
                title: "Success",
                description: "Withdrawal approved successfully",
            });

            fetchWithdrawals();
            onApprove?.();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to approve withdrawal",
                variant: "destructive",
            });
        }
    };

    const handleReject = async (withdrawalId: string) => {
        try {
            const { error } = await supabase
                .from("withdrawals")
                .update({
                    status: "rejected",
                    processed_at: new Date().toISOString()
                })
                .eq("id", withdrawalId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Withdrawal rejected",
            });

            fetchWithdrawals();
            onApprove?.();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to reject withdrawal",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge className="bg-yellow-500/30 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case "approved":
                return <Badge className="bg-green-500/30 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case "rejected":
                return <Badge className="bg-red-500/30 text-red-400"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge className="bg-gray-500/30 text-gray-400">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardContent className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </CardContent>
            </Card>
        );
    }

    const pendingCount = withdrawals.filter(w => w.status === "pending").length;
    const approvedCount = withdrawals.filter(w => w.status === "approved").length;
    const rejectedCount = withdrawals.filter(w => w.status === "rejected").length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-white/20">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-gray-300">Pending</p>
                            <p className="text-2xl font-bold text-white">{pendingCount}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-400" />
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-teal-500/20 border-white/20">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-gray-300">Approved</p>
                            <p className="text-2xl font-bold text-white">{approvedCount}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-gradient-to-br from-red-500/20 to-pink-500/20 border-white/20">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-sm text-gray-300">Rejected</p>
                            <p className="text-2xl font-bold text-white">{rejectedCount}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-400" />
                    </CardContent>
                </Card>
            </div>

            {/* Withdrawals Table */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardHeader>
                    <CardTitle className="text-white">Withdrawal Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/20 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="text-gray-300">User</TableHead>
                                    <TableHead className="text-gray-300">Phone</TableHead>
                                    <TableHead className="text-gray-300">Amount</TableHead>
                                    <TableHead className="text-gray-300">Method</TableHead>
                                    <TableHead className="text-gray-300">Status</TableHead>
                                    <TableHead className="text-gray-300">Date</TableHead>
                                    <TableHead className="text-gray-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                                            No withdrawal requests found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    withdrawals.map((withdrawal) => (
                                        <TableRow key={withdrawal.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="text-white font-medium">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-400" />
                                                    {withdrawal.profiles?.full_name || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                {withdrawal.phone_number || withdrawal.profiles?.phone_number || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-white font-semibold">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-green-400" />
                                                    {withdrawal.amount?.toFixed(2)} KES
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">
                                                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                                                    {withdrawal.payment_method || "MPESA"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                                            <TableCell className="text-gray-300">
                                                {new Date(withdrawal.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {withdrawal.status === "pending" ? (
                                                    <div className="flex gap-2">
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="backdrop-blur-md bg-slate-900/95 border-white/20 text-white">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-white">Approve Withdrawal?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-gray-400">
                                                                        This will approve the withdrawal of {withdrawal.amount?.toFixed(2)} KES to {withdrawal.profiles?.full_name}.
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-green-500 hover:bg-green-600"
                                                                        onClick={() => handleApprove(withdrawal.id, withdrawal.user_id, withdrawal.amount)}
                                                                    >
                                                                        Approve
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="backdrop-blur-md bg-slate-900/95 border-white/20 text-white">
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-white">Reject Withdrawal?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-gray-400">
                                                                        This will reject the withdrawal request. The user will be notified.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-500 hover:bg-red-600"
                                                                        onClick={() => handleReject(withdrawal.id)}
                                                                    >
                                                                        Reject
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">
                                                        {withdrawal.status === "approved" ? "Processed" : "Rejected"}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WithdrawalApproval;
