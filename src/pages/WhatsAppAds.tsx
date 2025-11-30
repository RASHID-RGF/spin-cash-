import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Megaphone, Eye, DollarSign, TrendingUp, ExternalLink, Copy } from "lucide-react";

const WhatsAppAds = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const adCampaigns = [
        {
            id: 1,
            title: "Forex Trading Course - Limited Offer",
            description: "Promote our premium forex trading course and earn 20% commission",
            commission: "20%",
            earnings: "500-2000 KES",
            status: "active",
            image: "/Money Realistic Pictures.jpeg",
            clicks: 145,
            conversions: 12
        },
        {
            id: 2,
            title: "Digital Marketplace Launch",
            description: "Share our new marketplace and earn for every signup",
            commission: "50 KES",
            earnings: "per signup",
            status: "active",
            image: "/Digital marketplace experience_ online shopping, virtual orders, mobile app, laptop comm.jpeg",
            clicks: 89,
            conversions: 8
        },
        {
            id: 3,
            title: "Wealth Building Webinar",
            description: "Invite friends to our exclusive wealth building webinar",
            commission: "100 KES",
            earnings: "per attendee",
            status: "hot",
            image: "/The Flow of Wealth.jpeg",
            clicks: 234,
            conversions: 23
        }
    ];

    useEffect(() => {
        const initPage = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    navigate("/login");
                    return;
                }

                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                setProfile(profileData);

            } catch (error: any) {
                console.error("Error loading page:", error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [navigate]);

    const copyAdLink = async (campaignId: number) => {
        const link = `https://spincash.com/ad/${campaignId}?ref=${profile?.referral_code}`;
        navigator.clipboard.writeText(link);

        if (profile?.id) {
            try {
                const rewardAmount = 5; // Small reward for sharing

                const { data: currentProfile } = await supabase
                    .from("profiles")
                    .select("total_kes")
                    .eq("id", profile.id)
                    .single();

                const newBalance = (currentProfile?.total_kes || 0) + rewardAmount;

                await supabase.from("profiles").update({
                    total_kes: newBalance
                }).eq("id", profile.id);

                toast({
                    title: "Link Copied! 🔗",
                    description: `You earned ${rewardAmount} KES for sharing this ad!`,
                });

            } catch (error) {
                console.error("Error crediting ad share:", error);
                toast({
                    title: "Link Copied!",
                    description: "Share this link on WhatsApp to start earning",
                });
            }
        } else {
            toast({
                title: "Link Copied!",
                description: "Share this link on WhatsApp to start earning",
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
                title="WhatsApp Ad Campaigns"
                subtitle="Share ads and earn commissions"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Megaphone className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{adCampaigns.length}</div>
                            <div className="text-xs text-muted-foreground">Active Campaigns</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Eye className="h-8 w-8 text-accent mx-auto mb-2" />
                            <div className="text-2xl font-bold">468</div>
                            <div className="text-xs text-muted-foreground">Total Clicks</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
                            <div className="text-2xl font-bold">43</div>
                            <div className="text-xs text-muted-foreground">Conversions</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">3,450</div>
                            <div className="text-xs text-muted-foreground">KES Earned</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaign Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adCampaigns.map((campaign) => (
                        <Card
                            key={campaign.id}
                            className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-all overflow-hidden"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={campaign.image}
                                    alt={campaign.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute top-2 right-2">
                                    <Badge variant={campaign.status === "hot" ? "destructive" : "default"}>
                                        {campaign.status === "hot" ? "🔥 HOT" : "Active"}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-bold text-lg line-clamp-2">{campaign.title}</h3>
                                </div>
                            </div>
                            <CardHeader>
                                <CardDescription className="line-clamp-2">
                                    {campaign.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                                        <div className="text-lg font-bold text-primary">{campaign.commission}</div>
                                        <div className="text-xs text-muted-foreground">Commission</div>
                                    </div>
                                    <div className="text-center p-3 bg-accent/10 rounded-lg">
                                        <div className="text-lg font-bold text-accent">{campaign.earnings}</div>
                                        <div className="text-xs text-muted-foreground">Potential</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        <span>{campaign.clicks} clicks</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>{campaign.conversions} sales</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => copyAdLink(campaign.id)}
                                        className="flex-1"
                                        variant="outline"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Link
                                    </Button>
                                    <Button className="flex-1">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppAds;
