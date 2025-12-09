import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Mpesa = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || !amount) {
            toast({
                title: "Missing Information",
                description: "Please enter both phone number and amount",
                variant: "destructive",
            });
            return;
        }

        if (parseFloat(amount) < 10) {
            toast({
                title: "Invalid Amount",
                description: "Minimum deposit amount is KES 10",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Get the current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('Not authenticated');
            }

            // Call the M-Pesa deposit API
            const response = await fetch('http://localhost:3001/api/mpesa/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    phoneNumber: phone,
                    amount: parseFloat(amount),
                    userId: session.user.id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Deposit failed');
            }

            const data = await response.json();

            toast({
                title: "M-Pesa STK Push Sent",
                description: "Please check your phone and enter your M-Pesa PIN to complete the transaction",
            });

            // Navigate back to dashboard after a delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 5000);

        } catch (error: any) {
            console.error("M-Pesa deposit error:", error);
            toast({
                title: "Deposit Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
                title="M-Pesa Deposit"
                subtitle="Deposit funds using M-Pesa"
                profileName={"User"}
                profileImage={"/default-avatar.png"}
            />

            <div className="container mx-auto px-4 py-8 max-w-lg">
                <Card className="backdrop-blur-md bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Deposit via M-Pesa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number</label>
                                <Input
                                    type="tel"
                                    placeholder="e.g. 0712345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount (KES)</label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="10"
                                    step="0.01"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Minimum deposit: KES 10
                                </p>
                            </div>
                            <Button type="submit" className="w-full" variant="default" disabled={loading}>
                                {loading ? "Processing..." : "Deposit via M-Pesa"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Mpesa;
