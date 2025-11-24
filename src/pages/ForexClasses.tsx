import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, BookOpen, Video, Award, CheckCircle, Lock, Play, BarChart } from "lucide-react";

const ForexClasses = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<number[]>([]);

    const forexCourses = [
        {
            id: 1,
            title: "Forex Trading Basics",
            description: "Learn the fundamentals of forex trading",
            lessons: 10,
            duration: "2 hours",
            level: "Beginner",
            image: "/Money Realistic Pictures.jpeg",
            locked: false
        },
        {
            id: 2,
            title: "Technical Analysis Mastery",
            description: "Master chart patterns and indicators",
            lessons: 15,
            duration: "4 hours",
            level: "Intermediate",
            image: "/The Flow of Wealth.jpeg",
            locked: false
        },
        {
            id: 3,
            title: "Advanced Trading Strategies",
            description: "Professional trading techniques",
            lessons: 20,
            duration: "6 hours",
            level: "Advanced",
            image: "/Digital marketplace experience_ online shopping, virtual orders, mobile app, laptop comm.jpeg",
            locked: true
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

                // Mock completed lessons
                setCompletedLessons([1, 2, 3]);

            } catch (error: any) {
                console.error("Error loading page:", error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [navigate]);

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
                title="Forex Trading Classes"
                subtitle="Master the art of forex trading"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Progress Overview */}
                <Card className="backdrop-blur-md bg-card/50 border-border/50 mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5 text-primary" />
                            Your Learning Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-primary/10 rounded-lg">
                                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                                <div className="text-2xl font-bold">{completedLessons.length}</div>
                                <div className="text-sm text-muted-foreground">Lessons Completed</div>
                            </div>
                            <div className="text-center p-4 bg-accent/10 rounded-lg">
                                <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                                <div className="text-2xl font-bold">45</div>
                                <div className="text-sm text-muted-foreground">Total Lessons</div>
                            </div>
                            <div className="text-center p-4 bg-secondary/10 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-secondary mx-auto mb-2" />
                                <div className="text-2xl font-bold">{Math.round((completedLessons.length / 45) * 100)}%</div>
                                <div className="text-sm text-muted-foreground">Completion Rate</div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Overall Progress</span>
                                <span className="font-medium">{completedLessons.length}/45 lessons</span>
                            </div>
                            <Progress value={(completedLessons.length / 45) * 100} className="h-3" />
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forexCourses.map((course) => (
                        <Card
                            key={course.id}
                            className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-all overflow-hidden"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute top-2 right-2">
                                    <Badge variant={course.locked ? "destructive" : "default"}>
                                        {course.locked ? <Lock className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                        {course.level}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-bold text-lg mb-1">{course.title}</h3>
                                    <p className="text-white/80 text-sm">{course.description}</p>
                                </div>
                            </div>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{course.lessons} lessons</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Video className="h-4 w-4" />
                                        <span>{course.duration}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    disabled={course.locked}
                                    variant={course.locked ? "outline" : "default"}
                                >
                                    {course.locked ? (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Unlock Course
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Learning
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ForexClasses;
