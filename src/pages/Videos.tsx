import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Video, Search, Play, Clock, Eye, Star, TrendingUp, Film } from "lucide-react";

const Videos = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

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

                const { data: videosData } = await supabase
                    .from("videos")
                    .select("*")
                    .eq("published", true)
                    .order("created_at", { ascending: false });

                setVideos(videosData || []);

            } catch (error: any) {
                console.error("Error loading videos:", error);
                toast({
                    title: "Error",
                    description: "Failed to load videos",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [navigate, toast]);

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["all", "tutorial", "training", "webinar", "demo"];

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
                title="Video Library"
                subtitle="Watch and learn from expert tutorials"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <Film className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{videos.length}</div>
                            <div className="text-xs text-muted-foreground">Total Videos</div>
                        </CardContent>
                    </Card>
                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                            <div className="text-2xl font-bold">{videos.filter(v => v.featured).length}</div>
                            <div className="text-xs text-muted-foreground">Featured</div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search videos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Tabs */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
                    <TabsList className="backdrop-blur-md bg-card/50">
                        {categories.map((cat) => (
                            <TabsTrigger key={cat} value={cat} className="capitalize">
                                {cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.length > 0 ? (
                        filteredVideos.map((video) => (
                            <Card
                                key={video.id}
                                className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-all cursor-pointer group overflow-hidden"
                            >
                                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Video className="h-16 w-16 text-primary/50" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="h-16 w-16 text-white" />
                                    </div>
                                    {video.featured && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="default" className="bg-accent">
                                                <Star className="h-3 w-3 mr-1" />
                                                Featured
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2">
                                        <Badge variant="secondary">{video.duration || "10:00"}</Badge>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {video.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date(video.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            <span>{video.views || 0} views</span>
                                        </div>
                                    </div>
                                    <Button className="w-full">
                                        <Play className="mr-2 h-4 w-4" />
                                        Watch Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? "Try a different search term" : "Check back later for new content!"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Videos;
