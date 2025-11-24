import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Play } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const VideoManagement = () => {
    const { toast } = useToast();
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        category: "",
        duration: "",
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const { data, error } = await supabase
                .from("videos")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setVideos(data || []);
        } catch (error: any) {
            console.error("Error fetching videos:", error);
            toast({
                title: "Error",
                description: "Failed to fetch videos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingVideo) {
                const { error } = await supabase
                    .from("videos")
                    .update(formData)
                    .eq("id", editingVideo.id);

                if (error) throw error;
                toast({ title: "Success", description: "Video updated successfully" });
            } else {
                const { error } = await supabase
                    .from("videos")
                    .insert([formData]);

                if (error) throw error;
                toast({ title: "Success", description: "Video added successfully" });
            }

            setIsDialogOpen(false);
            setEditingVideo(null);
            setFormData({ title: "", description: "", video_url: "", thumbnail_url: "", category: "", duration: "" });
            fetchVideos();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save video",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this video?")) return;

        try {
            const { error } = await supabase
                .from("videos")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Success", description: "Video deleted successfully" });
            fetchVideos();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to delete video",
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (video: any) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            description: video.description || "",
            video_url: video.video_url,
            thumbnail_url: video.thumbnail_url || "",
            category: video.category || "",
            duration: video.duration || "",
        });
        setIsDialogOpen(true);
    };

    if (loading) {
        return (
            <Card className="backdrop-blur-md bg-white/10 border-white/20">
                <CardContent className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="backdrop-blur-md bg-white/10 border-white/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Video Management</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Upload Video
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="backdrop-blur-md bg-slate-900/95 border-white/20 text-white max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {editingVideo ? "Edit Video" : "Upload New Video"}
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    {editingVideo ? "Update video details" : "Add a new educational video"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="text-white">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category" className="text-white">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="e.g., Forex Basics, Trading Strategies"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="video_url" className="text-white">Video URL</Label>
                                    <Input
                                        id="video_url"
                                        value={formData.video_url}
                                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="https://youtube.com/watch?v=... or direct video URL"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="thumbnail_url" className="text-white">Thumbnail URL</Label>
                                    <Input
                                        id="thumbnail_url"
                                        value={formData.thumbnail_url}
                                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="duration" className="text-white">Duration</Label>
                                    <Input
                                        id="duration"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="e.g., 10:30"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-white">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="Video description..."
                                        rows={4}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            setEditingVideo(null);
                                            setFormData({ title: "", description: "", video_url: "", thumbnail_url: "", category: "", duration: "" });
                                        }}
                                        className="text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-500">
                                        {editingVideo ? "Update" : "Upload"} Video
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.length === 0 ? (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No videos found. Upload your first video!
                        </div>
                    ) : (
                        videos.map((video) => (
                            <Card key={video.id} className="backdrop-blur-md bg-white/5 border-white/20 hover:bg-white/10 transition-all group">
                                <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                                    {video.thumbnail_url ? (
                                        <img
                                            src={video.thumbnail_url}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play className="h-16 w-16 text-white/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Play className="h-12 w-12 text-white" />
                                    </div>
                                    {video.duration && (
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            {video.duration}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 space-y-3">
                                    <div>
                                        <h3 className="text-white font-semibold text-lg line-clamp-2">{video.title}</h3>
                                        {video.category && (
                                            <span className="text-xs text-pink-400 mt-1 inline-block">
                                                {video.category}
                                            </span>
                                        )}
                                    </div>
                                    {video.description && (
                                        <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex-1"
                                            onClick={() => openEditDialog(video)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => handleDelete(video.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default VideoManagement;
