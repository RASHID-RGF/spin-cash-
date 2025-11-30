import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Bank = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [accountNumber, setAccountNumber] = useState("");
    const [bankName, setBankName] = useState("");
    const [branch, setBranch] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder: In a real app, you'd send these credentials to your backend
        toast({
            title: "Bank credentials saved",
            description: `Bank: ${bankName}, Account: ${accountNumber}`,
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
                title="Bank Transfer Integration"
                subtitle="Enter your bank details"
                profileName={"User"}
                profileImage={"/default-avatar.png"}
            />

            <div className="container mx-auto px-4 py-8 max-w-lg">
                <Card className="backdrop-blur-md bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle>Connect Bank Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Name</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Bank</option>
                                    <option value="KCB Bank">KCB Bank</option>
                                    <option value="Equity Bank">Equity Bank</option>
                                    <option value="Co-operative Bank">Co-operative Bank</option>
                                    <option value="Standard Chartered">Standard Chartered</option>
                                    <option value="Barclays Bank Kenya">Barclays Bank Kenya</option>
                                    <option value="NCBA">NCBA</option>
                                    <option value="Absa Bank Kenya">Absa Bank Kenya</option>
                                    <option value="Family Bank">Family Bank</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Account Number</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. 1234567890"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Branch</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Nairobi West"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
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

export default Bank;
