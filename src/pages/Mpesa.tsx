import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Mpesa = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder: In a real app, you'd send these credentials to your backend
        toast({
            title: "M-Pesa credentials saved",
            description: `Phone: ${phone}`,
        });
        navigate("/dashboard");
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
                title="M-Pesa Integration"
                subtitle="Enter your M-Pesa credentials"
                profileName={"User"}
                profileImage={"/default-avatar.png"}
            />

            <div className="container mx-auto px-4 py-8 max-w-lg">
                <Card className="backdrop-blur-md bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Connect M-Pesa</CardTitle>
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
                                <label className="block text-sm font-medium mb-1">M-Pesa PIN</label>
                                <Input
                                    type="password"
                                    placeholder="Your PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" variant="default">
                                Save Credentials
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Mpesa;
