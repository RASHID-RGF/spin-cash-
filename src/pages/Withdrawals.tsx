import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, History, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

const Withdrawals = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("mpesa");

    const [earnings, setEarnings] = useState({
        total: 0,
        spins: 0,
        quiz: 0,
        referrals: 0,
        ads: 0
    });
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    navigate("/login");
                    return;
                }

                // Fetch profile stats
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (profile) {
                    setEarnings({
                        total: profile.total_kes || 0,
                        spins: profile.total_kes || 0, // Assuming total_kes largely comes from spins for now, or split if schema supports
                        quiz: 0, // Placeholder if not in schema
                        referrals: 0, // Placeholder if not in schema
                        ads: 0
                    });
                }

                // Fetch transactions (mock for now as table might not exist, but structure is ready)
                // const { data: txns } = await supabase.from("withdrawals").select("*").eq("user_id", session.user.id);
                // setTransactions(txns || []);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            if (Number(amount) > earnings.total) {
                toast({
                    title: "Insufficient Funds",
                    description: "You cannot withdraw more than your available balance.",
                    variant: "destructive"
                });
                return;
            }

            toast({
                title: "Withdrawal Request Received",
                description: `Your request to withdraw KES ${amount} via ${method === 'mpesa' ? 'M-Pesa' : 'Bank'} has been submitted.`,
            });
            setAmount("");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed inset-0 -z-10">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(/RASHID.jpeg)` }}
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <PageHeader
                title="Withdraw Funds"
                subtitle="Manage your earnings and payouts"
                profileName="User"
                profileImage="/default-avatar.png"
            />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Earnings Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                                    <h3 className="text-2xl font-bold mt-2">KES {earnings.total.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Wallet className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Spin Earnings</p>
                                    <h3 className="text-2xl font-bold mt-2">KES {earnings.spins.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Quiz Earnings</p>
                                    <h3 className="text-2xl font-bold mt-2">KES {earnings.quiz.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Referral Bonus</p>
                                    <h3 className="text-2xl font-bold mt-2">KES {earnings.referrals.toLocaleString()}</h3>
                                </div>
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Withdrawal Form */}
                    <div className="lg:col-span-1">
                        <Card className="backdrop-blur-md bg-card/50 border-border/50 h-full">
                            <CardHeader>
                                <CardTitle>Request Withdrawal</CardTitle>
                                <CardDescription>Minimum withdrawal amount: KES 500</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleWithdraw} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Amount (KES)</label>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Withdrawal Method</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Button
                                                type="button"
                                                variant={method === "mpesa" ? "default" : "outline"}
                                                onClick={() => setMethod("mpesa")}
                                                className="w-full"
                                            >
                                                M-Pesa
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={method === "bank" ? "default" : "outline"}
                                                onClick={() => setMethod("bank")}
                                                className="w-full"
                                            >
                                                Bank
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Processing Fee</span>
                                            <span>KES 50</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t border-border/50">
                                            <span>Total Deducted</span>
                                            <span>KES {Number(amount) > 0 ? Number(amount) + 50 : 0}</span>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Processing..." : "Withdraw Funds"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction History */}
                    <div className="lg:col-span-2">
                        <Card className="backdrop-blur-md bg-card/50 border-border/50 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Transaction History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {transactions.map((txn) => (
                                        <div key={txn.id} className="flex items-center justify-between p-4 rounded-lg bg-background/40 border border-border/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${txn.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                                                    txn.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {txn.status === 'Completed' ? <CheckCircle className="h-5 w-5" /> :
                                                        txn.status === 'Processing' ? <Clock className="h-5 w-5" /> :
                                                            <AlertCircle className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">Withdrawal to {txn.method}</p>
                                                    <p className="text-xs text-muted-foreground">{txn.date} • ID: {txn.id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">- KES {txn.amount.toLocaleString()}</p>
                                                <Badge variant={
                                                    txn.status === 'Completed' ? 'default' :
                                                        txn.status === 'Processing' ? 'secondary' : 'destructive'
                                                }>
                                                    {txn.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Withdrawals;
