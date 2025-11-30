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
import { Video, Search, Play, Clock, Eye, Star, TrendingUp, Film, Bookmark, BookmarkCheck, MessageSquare } from "lucide-react";

const Videos = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
    const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());

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

                // Load videos from local storage
                const storedVideos = localStorage.getItem('spincash_videos');
                const videosData = storedVideos ? JSON.parse(storedVideos) : [];
                console.log('Loaded videos:', videosData);
                setVideos(videosData);

                // Load user bookmarks and ratings
                await loadUserData();

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

    const handleWatchVideo = (video: any) => {
        // Update view count locally
        const updatedVideos = videos.map(v =>
            v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v
        );
        setVideos(updatedVideos);
        localStorage.setItem('spincash_videos', JSON.stringify(updatedVideos));

        toast({
            title: "Video Started 🎥",
            description: "Enjoy learning!",
        });
    };

    const handleBookmark = (video: any) => {
        const newBookmarkedVideos = new Set(bookmarkedVideos);
        const isBookmarked = bookmarkedVideos.has(video.id);

        if (isBookmarked) {
            newBookmarkedVideos.delete(video.id);
        } else {
            newBookmarkedVideos.add(video.id);
        }

        setBookmarkedVideos(newBookmarkedVideos);
        localStorage.setItem('spincash_bookmarks', JSON.stringify(Array.from(newBookmarkedVideos)));

        toast({
            title: isBookmarked ? "Removed from bookmarks" : "Bookmarked! 📚",
            description: isBookmarked ? "Video removed from bookmarks" : "Video saved to your bookmarks",
        });
    };

    const handleRateVideo = (video: any, rating: number) => {
        setUserRatings(new Map(userRatings.set(video.id, rating)));
        localStorage.setItem('spincash_ratings', JSON.stringify(Object.fromEntries(userRatings.set(video.id, rating))));

        toast({
            title: "Rating Submitted! ⭐",
            description: `You rated this video ${rating} star${rating !== 1 ? 's' : ''}`,
        });
    };

    const loadUserData = () => {
        try {
            // Load bookmarks from localStorage
            const storedBookmarks = localStorage.getItem('spincash_bookmarks');
            if (storedBookmarks) {
                const bookmarkIds = JSON.parse(storedBookmarks);
                setBookmarkedVideos(new Set(bookmarkIds));
            }

            // Load ratings from localStorage
            const storedRatings = localStorage.getItem('spincash_ratings');
            if (storedRatings) {
                const ratingsObj = JSON.parse(storedRatings);
                const ratingsMap = new Map(Object.entries(ratingsObj).map(([k, v]) => [k, v as number]));
                setUserRatings(ratingsMap);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
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
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1">
                                                {video.description}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleBookmark(video)}
                                            className="ml-2 p-1 h-8 w-8"
                                        >
                                            {bookmarkedVideos.has(video.id) ? (
                                                <BookmarkCheck className="h-4 w-4 text-accent" />
                                            ) : (
                                                <Bookmark className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {/* Tags and Badges */}
                                    <div className="flex items-center gap-2 mt-2">
                                        {video.featured && (
                                            <Badge variant="default" className="bg-accent text-xs">
                                                <Star className="h-3 w-3 mr-1" />
                                                Featured
                                            </Badge>
                                        )}
                                        {video.difficulty && (
                                            <Badge variant="outline" className="text-xs">
                                                {video.difficulty}
                                            </Badge>
                                        )}
                                        {video.category && (
                                            <Badge variant="secondary" className="text-xs">
                                                {video.category}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {video.tags && video.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {video.tags.slice(0, 2).map((tag: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {video.tags.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{video.tags.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {/* Rating Section */}
                                    {profile && (
                                        <div className="mb-3">
                                            <div className="flex items-center gap-1 mb-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => handleRateVideo(video, star)}
                                                        className="text-lg hover:scale-110 transition-transform"
                                                    >
                                                        <Star
                                                            className={`h-4 w-4 ${
                                                                (userRatings.get(video.id) || 0) >= star
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-400'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                                {video.avg_rating > 0 && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {video.avg_rating.toFixed(1)} ({video.total_ratings})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats */}
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

                                    {/* Prerequisites */}
                                    {video.prerequisites && video.prerequisites.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs text-muted-foreground mb-1">Prerequisites:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {video.prerequisites.map((prereq: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {prereq}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button className="flex-1" onClick={() => handleWatchVideo(video)}>
                                            <Play className="mr-2 h-4 w-4" />
                                            Watch Now
                                        </Button>
                                        {video.transcript && (
                                            <Button variant="outline" size="sm">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
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
