import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Coins,
  Users,
  TrendingUp,
  Wallet,
  Gift,
  LogOut,
  Home,
  Video,
  BookOpen,
  Calculator,
  Dices,
  Megaphone,
  Settings,
  Share2,
  BarChart3,
  Bell,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  UserPlus,
  Award,
  Target,
  Zap
} from "lucide-react";


const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ total: 0, active: 0, earnings: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(profileData);

        // Fetch wallet
        const { data: walletData } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        setWallet(walletData);

        // Fetch recent transactions
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentTransactions(transactionsData || []);

        // Fetch referral statistics
        const { data: referralsData } = await supabase
          .from("profiles")
          .select("id, created_at")
          .eq("referred_by", profileData?.referral_code);

        const totalReferrals = referralsData?.length || 0;
        const activeReferrals = referralsData?.filter((ref: any) => {
          const createdDate = new Date(ref.created_at);
          const daysSinceJoin = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceJoin <= 30;
        }).length || 0;

        setReferralStats({
          total: totalReferrals,
          active: activeReferrals,
          earnings: walletData?.total_earnings || 0
        });

        // Mock notifications (you can fetch real ones from database)
        setNotifications([
          { id: 1, type: "success", message: "Welcome to Spincash Agencies!", time: "Just now" },
          { id: 2, type: "info", message: "Complete your profile to earn bonus points", time: "1h ago" },
        ]);

      } catch (error: any) {
        console.error("Error loading dashboard:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/RASHID.jpeg)` }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Spincash Agencies
            </h1>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || "User"}!</h2>
          <p className="text-muted-foreground">Here's your earnings overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {wallet?.total_earnings?.toFixed(2) || "0.00"} KES
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet?.balance?.toFixed(2) || "0.00"} KES</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bonus Balance</CardTitle>
              <Gift className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet?.bonus_balance?.toFixed(2) || "0.00"} KES</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Spin Points</CardTitle>
              <Coins className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet?.spin_points || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <Card className="backdrop-blur-md bg-gradient-primary/10 border-primary/20 shadow-glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="backdrop-blur-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast({ title: "Copied!", description: "Referral link copied to clipboard" });
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link to earn commissions from your referrals!
            </p>
          </CardContent>
        </Card>

        {/* Two Column Layout for Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Referral Stats & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Statistics */}
            <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Referral Statistics
                </CardTitle>
                <CardDescription>Track your referral performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{referralStats.total}</div>
                    <div className="text-xs text-muted-foreground">Total Referrals</div>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <Zap className="h-6 w-6 text-accent mx-auto mb-2" />
                    <div className="text-2xl font-bold">{referralStats.active}</div>
                    <div className="text-xs text-muted-foreground">Active (30d)</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <Award className="h-6 w-6 text-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{referralStats.earnings.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">KES Earned</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Next Tier</span>
                    <span className="font-medium">{referralStats.total}/10</span>
                  </div>
                  <Progress value={(referralStats.total / 10) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {10 - referralStats.total} more referrals to unlock Bronze tier rewards!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'credit' ? (
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{transaction.description || 'Transaction'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{transaction.amount?.toFixed(2)} KES
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent transactions</p>
                    <p className="text-xs">Start earning to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions with Images */}
            <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-3 h-auto p-3"
                  variant="outline"
                  onClick={() => navigate("/withdraw")}
                >
                  <Download className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Withdraw Funds</div>
                    <div className="text-xs text-muted-foreground">Cash out your earnings</div>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-auto p-3"
                  variant="outline"
                  onClick={() => navigate("/deposit")}
                >
                  <Upload className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Add Funds</div>
                    <div className="text-xs text-muted-foreground">Top up your wallet</div>
                  </div>
                </Button>
                <Button
                  className="w-full justify-start gap-3 h-auto p-3"
                  variant="outline"
                  onClick={() => navigate("/spin")}
                >
                  <Dices className="h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Free Spin</div>
                    <div className="text-xs text-muted-foreground">Try your luck today!</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge variant="destructive" className="ml-auto">{notifications.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((notification: any) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                    {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                    {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                    {notification.type === 'warning' && <XCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Opportunities with Images */}
        <Card className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Featured Opportunities
            </CardTitle>
            <CardDescription>Explore ways to maximize your earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opportunity 1 - Money Making */}
              <div
                className="relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => navigate("/forex")}
              >
                <img
                  src="/Money Realistic Pictures.jpeg"
                  alt="Money Making Opportunities"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">Forex Trading</h3>
                    <p className="text-white/80 text-sm">Learn & Earn with Forex</p>
                  </div>
                </div>
              </div>

              {/* Opportunity 2 - Digital Marketplace */}
              <div
                className="relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => navigate("/marketplace")}
              >
                <img
                  src="/Digital marketplace experience_ online shopping, virtual orders, mobile app, laptop comm.jpeg"
                  alt="Digital Marketplace"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">Marketplace</h3>
                    <p className="text-white/80 text-sm">Shop & Earn Cashback</p>
                  </div>
                </div>
              </div>

              {/* Opportunity 3 - Affiliate Marketing */}
              <div
                className="relative overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => navigate("/affiliate")}
              >
                <img
                  src="/The Flow of Wealth.jpeg"
                  alt="Wealth Flow"
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">Passive Income</h3>
                    <p className="text-white/80 text-sm">Build Wealth Streams</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Menu */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { icon: Home, label: "Dashboard", path: "/dashboard" },
            { icon: Dices, label: "Free Spin", path: "/spin" },
            { icon: Video, label: "Forex Classes", path: "/forex" },
            { icon: Calculator, label: "Math Quiz", path: "/quiz" },
            { icon: BookOpen, label: "Blogs", path: "/blogs" },
            { icon: Video, label: "Videos", path: "/videos" },
            { icon: Megaphone, label: "WhatsApp Ads", path: "/ads" },
            { icon: BarChart3, label: "Leaderboard", path: "/leaderboard" },
          ].map((item, index) => (
            <Card
              key={index}
              className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-all cursor-pointer group"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <item.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
