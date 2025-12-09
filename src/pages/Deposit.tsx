import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Landmark, CreditCard, CheckCircle } from "lucide-react";

const Deposit = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("mpesa");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: form, 2: processing, 3: success

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid amount greater than 0",
                variant: "destructive",
            });
            return;
        }

        if (paymentMethod === "mpesa" && !phoneNumber) {
            toast({
                title: "Phone Number Required",
                description: "Please enter your M-Pesa phone number",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setStep(2);

        try {
            // Get the current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('Not authenticated');
            }

            let response;
            let successMessage;

            if (paymentMethod === "mpesa") {
                // Call the M-Pesa deposit API
                response = await fetch('http://localhost:3001/api/mpesa/deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        phoneNumber: phoneNumber,
                        amount: parseFloat(amount),
                        userId: session.user.id
                    }),
                });
                successMessage = "M-Pesa STK Push sent. Please check your phone and enter your PIN to complete the transaction.";
            } else {
                // Call the general wallet add-funds API for other payment methods
                response = await fetch('http://localhost:3001/api/wallet/add-funds', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        amount: parseFloat(amount),
                        paymentMethod: paymentMethod
                    }),
                });
                successMessage = `KES ${amount} has been added to your wallet`;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Deposit failed');
            }

            const data = await response.json();

            toast({
                title: paymentMethod === "mpesa" ? "M-Pesa STK Push Sent" : "Deposit Successful!",
                description: successMessage,
            });

            setStep(3);

            // Redirect after success
            setTimeout(() => {
                navigate("/dashboard");
            }, 3000);

        } catch (error: any) {
            console.error("Deposit error:", error);
            toast({
                title: "Deposit Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = [
        {
            id: "mpesa",
            name: "M-Pesa",
            icon: Smartphone,
            description: "Pay with M-Pesa",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/30"
        },
        {
            id: "bank",
            name: "Bank Transfer",
            icon: Landmark,
            description: "Direct bank transfer",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30"
        },
        {
            id: "card",
            name: "Credit/Debit Card",
            icon: CreditCard,
            description: "Visa, Mastercard",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/30"
        }
    ];

    if (step === 2) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="fixed inset-0 -z-10">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(/RASHID.jpeg)` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <Card className="backdrop-blur-md bg-card/50 border-border/50 max-w-md w-full mx-4">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
                        <p className="text-muted-foreground text-center">
                            Please wait while we process your deposit of KES {amount}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="fixed inset-0 -z-10">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(/RASHID.jpeg)` }}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <Card className="backdrop-blur-md bg-card/50 border-border/50 max-w-md w-full mx-4">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Deposit Successful!</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            KES {amount} has been added to your wallet
                        </p>
                        <Button onClick={() => navigate("/dashboard")} className="w-full">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                title="Add Funds"
                subtitle="Top up your wallet balance"
                profileName={"User"}
                profileImage={"/default-avatar.png"}
            />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Methods */}
                    <div className="lg:col-span-1">
                        <Card className="backdrop-blur-md bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <div
                                            key={method.id}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === method.id
                                                ? `${method.borderColor} ${method.bgColor}`
                                                : "border-border hover:border-primary/50"
                                                }`}
                                            onClick={() => setPaymentMethod(method.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={`h-6 w-6 ${method.color}`} />
                                                <div>
                                                    <div className="font-medium">{method.name}</div>
                                                    <div className="text-xs text-muted-foreground">{method.description}</div>
                                                </div>
                                            </div>
                                            {paymentMethod === method.id && (
                                                <Badge variant="default" className="ml-auto">Selected</Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Deposit Form */}
                    <div className="lg:col-span-2">
                        <Card className="backdrop-blur-md bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle>Deposit Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {paymentMethod === "mpesa" && (
                                        <div>
                                            <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
                                            <Input
                                                type="tel"
                                                placeholder="e.g. 0712345678"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="1"
                                            step="0.01"
                                            required
                                            className="text-lg"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Minimum deposit: KES 10
                                        </p>
                                    </div>

                                    {/* Quick Amount Buttons */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Quick Select</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[100, 500, 1000, 2000, 5000, 10000].map((quickAmount) => (
                                                <Button
                                                    key={quickAmount}
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setAmount(quickAmount.toString())}
                                                    className="text-sm"
                                                >
                                                    KES {quickAmount}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={loading}
                                    >
                                        {loading ? "Processing..." : `Deposit KES ${amount || "0"}`}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="backdrop-blur-md bg-card/50 border-border/50 mt-4">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium mb-1">Secure & Instant</p>
                                        <p className="text-muted-foreground">
                                            Your funds will be credited instantly after successful payment verification.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Deposit;