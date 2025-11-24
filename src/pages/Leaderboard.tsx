import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Trophy, Medal, Award, TrendingUp, Users, Crown } from "lucide-react";

const Leaderboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const topEarners = [
        { id: 1, name: "Rashid Ali Omondi", earnings: 45000, referrals: 23, rank: 1, avatar: "/RASHID.jpeg" },
        { id: 2, name: "Sarah Johnson", earnings: 38500, referrals: 19, rank: 2, avatar: "/ali.jpeg" },
        { id: 3, name: "Michael Chen", earnings: 32000, referrals: 15, rank: 3, avatar: null },
        { id: 4, name: "Amina Hassan", earnings: 28000, referrals: 14, rank: 4, avatar: null },
        { id: 5, name: "David Kimani", earnings: 25000, referrals: 12, rank: 5, avatar: null },
        { id: 6, name: "Grace Wanjiru", earnings: 22000, referrals: 11, rank: 6, avatar: null },
        { id: 7, name: "James Ochieng", earnings: 19000, referrals: 10, rank: 7, avatar: null },
        { id: 8, name: "Faith Akinyi", earnings: 17500, referrals: 9, rank: 8, avatar: null },
        { id: 9, name: "Peter Mwangi", earnings: 15000, referrals: 8, rank: 9, avatar: null },
        { id: 10, name: "Lucy Njeri", earnings: 12500, referrals: 7, rank: 10, avatar: null },
    ];

    const topReferrers = [...topEarners].sort((a, b) => b.referrals - a.referrals);

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

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-orange-600" />;
            default:
                return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
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
                title="Leaderboard"
                subtitle="See how you rank against top earners"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center justify-end">
                        <Card className="backdrop-blur-md bg-card/50 border-border/50 w-full text-center pb-8">
                            <CardContent className="pt-6">
                                <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-gray-400">
                                    <AvatarImage src={topEarners[1].avatar} />
                                    <AvatarFallback>{getInitials(topEarners[1].name)}</AvatarFallback>
                                </Avatar>
                                <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <div className="font-bold text-sm line-clamp-1">{topEarners[1].name}</div>
                                <div className="text-xl font-bold text-primary">{topEarners[1].earnings.toLocaleString()} KES</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center justify-end -mt-8">
                        <Card className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500 w-full text-center pb-8">
                            <CardContent className="pt-6">
                                <Avatar className="h-24 w-24 mx-auto mb-3 border-4 border-yellow-500">
                                    <AvatarImage src={topEarners[0].avatar} />
                                    <AvatarFallback>{getInitials(topEarners[0].name)}</AvatarFallback>
                                </Avatar>
                                <Crown className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                                <div className="font-bold line-clamp-1">{topEarners[0].name}</div>
                                <div className="text-2xl font-bold text-primary">{topEarners[0].earnings.toLocaleString()} KES</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center justify-end">
                        <Card className="backdrop-blur-md bg-card/50 border-border/50 w-full text-center pb-8">
                            <CardContent className="pt-6">
                                <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-orange-600">
                                    <AvatarImage src={topEarners[2].avatar} />
                                    <AvatarFallback>{getInitials(topEarners[2].name)}</AvatarFallback>
                                </Avatar>
                                <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                <div className="font-bold text-sm line-clamp-1">{topEarners[2].name}</div>
                                <div className="text-xl font-bold text-primary">{topEarners[2].earnings.toLocaleString()} KES</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs for different leaderboards */}
                <Tabs defaultValue="earnings" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2 backdrop-blur-md bg-card/50">
                        <TabsTrigger value="earnings">
                            <Trophy className="h-4 w-4 mr-2" />
                            Top Earners
                        </TabsTrigger>
                        <TabsTrigger value="referrals">
                            <Users className="h-4 w-4 mr-2" />
                            Top Referrers
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="earnings" className="space-y-4 mt-6">
                        {topEarners.map((user) => (
                            <Card
                                key={user.id}
                                className={`backdrop-blur-md bg-card/50 border-border/50 hover:scale-102 transition-all ${user.name === profile?.full_name ? 'border-primary border-2' : ''
                                    }`}
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 flex items-center justify-center">
                                            {getRankIcon(user.rank)}
                                        </div>
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-bold flex items-center gap-2">
                                                {user.name}
                                                {user.name === profile?.full_name && (
                                                    <Badge variant="default">You</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {user.referrals} referrals
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-primary">
                                            {user.earnings.toLocaleString()} KES
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            +12% this month
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="referrals" className="space-y-4 mt-6">
                        {topReferrers.map((user, index) => (
                            <Card
                                key={user.id}
                                className={`backdrop-blur-md bg-card/50 border-border/50 hover:scale-102 transition-all ${user.name === profile?.full_name ? 'border-primary border-2' : ''
                                    }`}
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 flex items-center justify-center">
                                            {getRankIcon(index + 1)}
                                        </div>
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-bold flex items-center gap-2">
                                                {user.name}
                                                {user.name === profile?.full_name && (
                                                    <Badge variant="default">You</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {user.earnings.toLocaleString()} KES earned
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-primary">
                                            {user.referrals}
                                        </div>
                                        <div className="text-xs text-muted-foreground">referrals</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Leaderboard;
