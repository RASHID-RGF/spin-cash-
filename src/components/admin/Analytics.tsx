import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

interface AnalyticsProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalEarnings: number;
        pendingWithdrawals: number;
        totalVideos: number;
        totalBlogs: number;
        todaySignups: number;
        totalSpins: number;
    };
}

const Analytics = ({ stats }: AnalyticsProps) => {
    // Sample data for charts - in real app, fetch from database
    const userGrowthData = [
        { month: "Jan", users: 400 },
        { month: "Feb", users: 600 },
        { month: "Mar", users: 800 },
        { month: "Apr", users: 1200 },
        { month: "May", users: 1600 },
        { month: "Jun", users: 2000 },
    ];

    const earningsData = [
        { month: "Jan", earnings: 5000 },
        { month: "Feb", earnings: 8000 },
        { month: "Mar", earnings: 12000 },
        { month: "Apr", earnings: 18000 },
        { month: "May", earnings: 25000 },
        { month: "Jun", earnings: 32000 },
    ];

    const activityData = [
        { name: "Spins", value: stats.totalSpins || 400 },
        { name: "Videos Watched", value: 300 },
        { name: "Blogs Read", value: 200 },
        { name: "Quizzes Taken", value: 150 },
    ];

    const COLORS = ["#3b82f6", "#a855f7", "#10b981", "#f59e0b"];

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-white/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Growth Rate</p>
                                <p className="text-3xl font-bold text-white">+{((stats.todaySignups / stats.totalUsers) * 100).toFixed(1)}%</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-white/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Active Rate</p>
                                <p className="text-3xl font-bold text-white">{((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}%</p>
                            </div>
                            <Users className="h-10 w-10 text-purple-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-teal-500/20 border-white/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Avg Earnings</p>
                                <p className="text-3xl font-bold text-white">{(stats.totalEarnings / stats.totalUsers).toFixed(0)} KES</p>
                            </div>
                            <DollarSign className="h-10 w-10 text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-white/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-300">Engagement</p>
                                <p className="text-3xl font-bold text-white">High</p>
                            </div>
                            <Activity className="h-10 w-10 text-yellow-400 animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                <XAxis dataKey="month" stroke="#ffffff80" />
                                <YAxis stroke="#ffffff80" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #ffffff20",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Earnings Chart */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Platform Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={earningsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                <XAxis dataKey="month" stroke="#ffffff80" />
                                <YAxis stroke="#ffffff80" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #ffffff20",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="earnings" fill="#a855f7" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Activity Distribution */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Activity Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={activityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {activityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #ffffff20",
                                        borderRadius: "8px",
                                        color: "#fff",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Platform Stats */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Platform Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-300">Total Users</span>
                                <span className="text-white font-bold text-xl">{stats.totalUsers}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-300">Active Users (7d)</span>
                                <span className="text-green-400 font-bold text-xl">{stats.activeUsers}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-300">Total Earnings</span>
                                <span className="text-purple-400 font-bold text-xl">{stats.totalEarnings.toFixed(2)} KES</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-300">Pending Withdrawals</span>
                                <span className="text-yellow-400 font-bold text-xl">{stats.pendingWithdrawals}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-300">Total Videos</span>
                                <span className="text-blue-400 font-bold text-xl">{stats.totalVideos}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                                <span className="text-gray-300">Total Blogs</span>
                                <span className="text-pink-400 font-bold text-xl">{stats.totalBlogs}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
