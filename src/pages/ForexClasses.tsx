import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Video, Play, CheckCircle, Clock, BookOpen } from "lucide-react";

const ForexClasses = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [watchedVideos, setWatchedVideos] = useState<number[]>([]);

    // Video sections - YOU CAN ADD YOUR VIDEO URLs HERE
    const videoSections = [
        {
            id: 1,
            title: "Introduction to Forex Trading",
            description: "Learn the basics of forex trading and how the market works",
            duration: "15:30",
            videoUrl: "https://www.youtube.com/embed/J0WC352ftKg", // VIDEO 1 ADDED
            thumbnail: "/Money Realistic Pictures.jpeg",
            level: "Beginner"
        },
        {
            id: 2,
            title: "Understanding Currency Pairs",
            description: "Master the concept of currency pairs and how to read them",
            duration: "20:45",
            videoUrl: "https://www.youtube.com/embed/mFtHE97hG0s", // VIDEO 2 ADDED
            thumbnail: "/The Flow of Wealth.jpeg",
            level: "Beginner"
        },
        {
            id: 3,
            title: "Technical Analysis Fundamentals",
            description: "Learn to read charts and identify trading patterns",
            duration: "25:15",
            videoUrl: "https://www.youtube.com/embed/QDY5mGbAPIc", // VIDEO 3 ADDED
            thumbnail: "/Digital marketplace experience_ online shopping, virtual orders, mobile app, laptop comm.jpeg",
            level: "Intermediate"
        },
        {
            id: 4,
            title: "Risk Management Strategies",
            description: "Protect your capital with proper risk management techniques",
            duration: "18:20",
            videoUrl: "https://www.youtube.com/embed/Xb4KWuHmHBQ", // VIDEO 4 ADDED
            thumbnail: "/Money Realistic Pictures.jpeg",
            level: "Intermediate"
        },
        {
            id: 5,
            title: "Advanced Trading Strategies",
            description: "Master advanced techniques used by professional traders",
            duration: "30:00",
            videoUrl: "https://www.youtube.com/embed/5iEHsRja8u0", // VIDEO 5 ADDED
            thumbnail: "/The Flow of Wealth.jpeg",
            level: "Advanced"
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

    const markAsWatched = (videoId: number) => {
        if (!watchedVideos.includes(videoId)) {
            setWatchedVideos([...watchedVideos, videoId]);
            toast({
                title: "Progress Saved! ✅",
                description: "Video marked as watched",
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
                title="Forex Trading Classes"
                subtitle="Watch video lessons and master forex trading"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Progress Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{videoSections.length}</div>
                            <div className="text-xs text-muted-foreground">Total Videos</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{watchedVideos.length}</div>
                            <div className="text-xs text-muted-foreground">Videos Watched</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                                {Math.round((watchedVideos.length / videoSections.length) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Completion</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Video Sections */}
                <div className="space-y-8">
                    {videoSections.map((video, index) => (
                        <Card
                            key={video.id}
                            className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass overflow-hidden"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant="outline" className="text-xs">
                                                Lesson {index + 1}
                                            </Badge>
                                            <Badge variant={
                                                video.level === "Beginner" ? "default" :
                                                    video.level === "Intermediate" ? "secondary" : "destructive"
                                            }>
                                                {video.level}
                                            </Badge>
                                            {watchedVideos.includes(video.id) && (
                                                <Badge variant="default" className="bg-green-500">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Watched
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl mb-2">{video.title}</CardTitle>
                                        <CardDescription className="text-base">
                                            {video.description}
                                        </CardDescription>
                                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Video Player Section */}
                                <div className="relative w-full bg-black rounded-lg overflow-hidden mb-4">
                                    {video.videoUrl ? (
                                        // If video URL is provided, show embedded video
                                        <div className="aspect-video">
                                            <iframe
                                                src={video.videoUrl}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                title={video.title}
                                            />
                                        </div>
                                    ) : (
                                        // Placeholder when no URL is provided
                                        <div className="aspect-video relative">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Play className="h-16 w-16 text-white mx-auto mb-4" />
                                                    <p className="text-white text-lg font-semibold mb-2">
                                                        Video URL Not Set
                                                    </p>
                                                    <p className="text-white/80 text-sm">
                                                        Add your video URL to enable playback
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => markAsWatched(video.id)}
                                        disabled={watchedVideos.includes(video.id)}
                                        className="flex-1"
                                        variant={watchedVideos.includes(video.id) ? "outline" : "default"}
                                    >
                                        {watchedVideos.includes(video.id) ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Completed
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Mark as Watched
                                            </>
                                        )}
                                    </Button>
                                    {video.videoUrl && (
                                        <Button variant="outline" asChild>
                                            <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                                                <Play className="mr-2 h-4 w-4" />
                                                Open in New Tab
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default ForexClasses;
