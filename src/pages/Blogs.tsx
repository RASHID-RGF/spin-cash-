import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { BookOpen, Search, Clock, Eye, ThumbsUp, Share2, TrendingUp } from "lucide-react";

const Blogs = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState<any>(null);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const initPage = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    navigate("/login");
                    return;
                }

                // Fetch profile
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                setProfile(profileData);

                // Fetch blogs
                const { data: blogsData } = await supabase
                    .from("blogs")
                    .select("*")
                    .eq("published", true)
                    .order("created_at", { ascending: false });

                setBlogs(blogsData || []);

            } catch (error: any) {
                console.error("Error loading blogs:", error);
                toast({
                    title: "Error",
                    description: "Failed to load blogs",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [navigate, toast]);

    const filteredBlogs = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            <PageHeader
                title="Blogs & Articles"
                subtitle="Learn and earn from our expert content"
                profileName={profile?.full_name}
                profileImage={profile?.avatar_url}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Search and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="md:col-span-3 backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search blogs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-md bg-card/50 border-border/50">
                        <CardContent className="pt-6 text-center">
                            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold">{blogs.length}</div>
                            <div className="text-xs text-muted-foreground">Total Articles</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.length > 0 ? (
                        filteredBlogs.map((blog) => (
                            <Card
                                key={blog.id}
                                className="backdrop-blur-md bg-card/50 border-border/50 shadow-glass hover:scale-105 transition-all cursor-pointer group overflow-hidden"
                            >
                                {blog.image_url && (
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={blog.image_url}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary">{blog.category || "General"}</Badge>
                                        </div>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                                    <CardDescription className="line-clamp-3">
                                        {blog.excerpt || blog.content?.substring(0, 150) + "..."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                <span>{blog.views || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="h-4 w-4" />
                                                <span>{blog.likes || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Read More
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
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

export default Blogs;
