import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Dices, Gift, Sparkles, Coins, Trophy } from "lucide-react";

const FreeSpin = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [spinsLeft, setSpinsLeft] = useState(5);
    const [totalWins, setTotalWins] = useState(0);
    const [totalKES, setTotalKES] = useState(0);

    // Weighted prizes: jackpot has low probability
    const prizes = [
        { id: 1, name: "10 KES", value: 10, color: "bg-green-500", weight: 30 },
        { id: 2, name: "50 KES", value: 50, color: "bg-blue-500", weight: 20 },
        { id: 3, name: "100 KES", value: 100, color: "bg-purple-500", weight: 15 },
        { id: 4, name: "5 Spin Points", value: 5, color: "bg-yellow-500", weight: 10 },
        { id: 5, name: "Better Luck", value: 0, color: "bg-gray-500", weight: 15 },
        { id: 6, name: "20 KES", value: 20, color: "bg-pink-500", weight: 5 },
        { id: 7, name: "Jackpot 500 KES", value: 500, color: "bg-red-600", weight: 1 },
    ];

    useEffect(() => {
        const initPage = async () => {
            try {
                const session = await auth.getSession();

                if (!session?.user) {
                    navigate("/login");
                    return;
                }

                const profileData = await auth.getProfile();
                setProfile(profileData.user);

            } catch (error: any) {
                console.error("Error loading page:", error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [navigate]);


    const handleSpin = async () => {
        if (spinsLeft <= 0) {
            toast({
                title: "No spins left",
                description: "Come back tomorrow for more spins!",
                variant: "destructive",
            });
            return;
        }

        setSpinning(true);
        setResult(null);

        try {
            // Call backend API
            const response = await fetch('/api/games/spin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile?.id,
                    spinType: 'free'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to spin');
            }

            // Simulate spinning animation
            setTimeout(() => {
                setResult({ name: `${data.reward} Points`, value: data.reward });
                setSpinning(false);
                setSpinsLeft(spinsLeft - 1);

                if (data.reward > 0) {
                    setTotalWins(prev => prev + 1);
                    setTotalKES(prev => prev + data.reward);

                    toast({
                        title: "Congratulations! 🎉",
                        description: data.message,
                    });
                } else {
                    toast({
                        title: "Better luck next time!",
                        description: "Try again with your remaining spins",
                    });
                }
            }, 3000);
        } catch (error: any) {
            console.error('Spin error:', error);
            setSpinning(false);
            toast({
                title: "Spin failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
                title="Free Spin Wheel"
                subtitle="Spin daily and win amazing prizes!"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Dices className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{spinsLeft}</div>
                            <div className="text-xs text-muted-foreground">Spins Remaining</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
                            <div className="text-2xl font-bold">{totalWins}</div>
                            <div className="text-xs text-muted-foreground">Total Wins</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Coins className="h-8 w-8 text-secondary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{totalKES}</div>
                            <div className="text-xs text-muted-foreground">KES Won</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="backdrop-blur-md bg-card/50 border-border/50">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Spin the Wheel!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mx-auto w-80 h-80 mb-8">
                            <div className={`w-full h-full rounded-full border-8 border-primary flex items-center justify-center ${spinning ? 'animate-spin' : ''}`}>
                                <div className="grid grid-cols-3 gap-2 p-8">
                                    {prizes.map((prize) => (
                                        <div
                                            key={prize.id}
                                            className={`${prize.color} w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-xs text-center p-2`}
                                        >
                                            {prize.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <Sparkles className="h-12 w-12 text-yellow-400" />
                            </div>
                        </div>

                        {result && !spinning && (
                            <div className="text-center mb-6 p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
                                <Gift className="h-12 w-12 text-primary mx-auto mb-2" />
                                <div className="text-2xl font-bold mb-2">
                                    {result.value > 0 ? "You Won!" : "Try Again!"}
                                </div>
                                <div className={`text-3xl font-bold ${result.value > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {result.name}
                                </div>
                                {result.value > 0 && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Added to your wallet balance
                                    </p>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={handleSpin}
                            disabled={spinning || spinsLeft <= 0}
                            className="w-full"
                            size="lg"
                        >
                            {spinning ? (
                                <>
                                    <Dices className="mr-2 h-5 w-5 animate-spin" />
                                    Spinning...
                                </>
                            ) : (
                                <>
                                    <Dices className="mr-2 h-5 w-5" />
                                    Spin Now ({spinsLeft} left)
                                </>
                            )}
                        </Button>

                        <div className="mt-6 text-center text-sm text-muted-foreground">
                            <p>You get 5 free spins daily!</p>
                            <p>Come back tomorrow for more chances to win</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FreeSpin;
