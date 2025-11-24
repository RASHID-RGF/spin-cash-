import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    Users,
    DollarSign,
    Video,
    BookOpen,
    Dices,
    Calculator,
    Bell,
    BarChart3,
    LogOut,
    CheckCircle,
    XCircle,
    TrendingUp,
    Activity,
    UserCheck,
    Wallet,
} from "lucide-react";

// Import admin components
import UserManagement from "@/components/admin/UserManagement";
import WithdrawalApproval from "@/components/admin/WithdrawalApproval";
import BlogManagement from "@/components/admin/BlogManagement";
import VideoManagement from "@/components/admin/VideoManagement";
import GameManagement from "@/components/admin/GameManagement";
import Analytics from "@/components/admin/Analytics";
import Notifications from "@/components/admin/Notifications";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalEarnings: 0,
        pendingWithdrawals: 0,
        totalVideos: 0,
        totalBlogs: 0,
        todaySignups: 0,
        totalSpins: 0,
    });

    useEffect(() => {
        const initAdmin = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    navigate("/login");
                    return;
                }

                // Check if user is admin
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (!profile?.is_admin) {
                    toast({
                        title: "Access Denied",
                        description: "You don't have admin privileges",
                        variant: "destructive",
                    });
                    navigate("/dashboard");
                    return;
                }

                setUser(session.user);
                await fetchStats();
            } catch (error: any) {
                console.error("Error loading admin dashboard:", error);
                toast({
                    title: "Error",
                    description: "Failed to load admin dashboard",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        initAdmin();
    }, [navigate, toast]);

    const fetchStats = async () => {
        try {
            // Fetch total users
            const { count: totalUsers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });

            // Fetch active users (logged in last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { count: activeUsers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .gte("last_login", sevenDaysAgo.toISOString());

            // Fetch total earnings
            const { data: wallets } = await supabase
                .from("wallets")
                .select("total_earnings");
            const totalEarnings = wallets?.reduce((sum, w) => sum + (w.total_earnings || 0), 0) || 0;

            // Fetch pending withdrawals
            const { count: pendingWithdrawals } = await supabase
                .from("withdrawals")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");

            // Fetch videos count
            const { count: totalVideos } = await supabase
                .from("videos")
                .select("*", { count: "exact", head: true });

            // Fetch blogs count
            const { count: totalBlogs } = await supabase
                .from("blogs")
                .select("*", { count: "exact", head: true });

            // Fetch today's signups
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count: todaySignups } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .gte("created_at", today.toISOString());

            // Fetch total spins
            const { count: totalSpins } = await supabase
                .from("spin_history")
                .select("*", { count: "exact", head: true });

            setStats({
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalEarnings,
                pendingWithdrawals: pendingWithdrawals || 0,
                totalVideos: totalVideos || 0,
                totalBlogs: totalBlogs || 0,
                todaySignups: todaySignups || 0,
                totalSpins: totalSpins || 0,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background */}
            <div className="fixed inset-0 -z-10 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
            </div>

            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                                SpinCash Admin Panel
                            </h1>
                            <p className="text-sm text-gray-400">Manage your platform</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="hover:bg-red-500/10 hover:text-red-400 text-white"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-glass hover:scale-105 transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                            <Users className="h-5 w-5 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                            <p className="text-xs text-gray-400 mt-1">
                                <span className="text-green-400">+{stats.todaySignups}</span> today
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-glass hover:scale-105 transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
                            <UserCheck className="h-5 w-5 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.activeUsers}</div>
                            <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-glass hover:scale-105 transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Earnings</CardTitle>
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.totalEarnings.toFixed(2)} KES</div>
                            <p className="text-xs text-gray-400 mt-1">Platform wide</p>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-glass hover:scale-105 transition-transform">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white">Pending Withdrawals</CardTitle>
                            <Wallet className="h-5 w-5 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.pendingWithdrawals}</div>
                            <p className="text-xs text-gray-400 mt-1">Requires approval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-white/20">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-gray-300">Total Videos</p>
                                <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                            </div>
                            <Video className="h-8 w-8 text-blue-400" />
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-white/20">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-gray-300">Total Blogs</p>
                                <p className="text-2xl font-bold text-white">{stats.totalBlogs}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-purple-400" />
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-teal-500/20 border-white/20">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-gray-300">Total Spins</p>
                                <p className="text-2xl font-bold text-white">{stats.totalSpins}</p>
                            </div>
                            <Dices className="h-8 w-8 text-green-400" />
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-white/20">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="text-sm text-gray-300">Activity</p>
                                <p className="text-2xl font-bold text-white">Live</p>
                            </div>
                            <Activity className="h-8 w-8 text-yellow-400 animate-pulse" />
                        </CardContent>
                    </Card>
                </div>

                {/* Main Admin Tabs */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="backdrop-blur-md bg-white/10 border border-white/20 p-1 grid grid-cols-3 md:grid-cols-7 gap-1">
                        <TabsTrigger value="users" className="data-[state=active]:bg-blue-500/30 text-white">
                            <Users className="h-4 w-4 mr-2" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="withdrawals" className="data-[state=active]:bg-purple-500/30 text-white">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Withdrawals
                        </TabsTrigger>
                        <TabsTrigger value="blogs" className="data-[state=active]:bg-green-500/30 text-white">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Blogs
                        </TabsTrigger>
                        <TabsTrigger value="videos" className="data-[state=active]:bg-pink-500/30 text-white">
                            <Video className="h-4 w-4 mr-2" />
                            Videos
                        </TabsTrigger>
                        <TabsTrigger value="games" className="data-[state=active]:bg-yellow-500/30 text-white">
                            <Dices className="h-4 w-4 mr-2" />
                            Games
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500/30 text-white">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-red-500/30 text-white">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="withdrawals">
                        <WithdrawalApproval onApprove={fetchStats} />
                    </TabsContent>

                    <TabsContent value="blogs">
                        <BlogManagement />
                    </TabsContent>

                    <TabsContent value="videos">
                        <VideoManagement />
                    </TabsContent>

                    <TabsContent value="games">
                        <GameManagement />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Analytics stats={stats} />
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Notifications />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
