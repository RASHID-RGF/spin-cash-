import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { addVideo } from "@/utils/sampleVideos";

interface Video {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    category: string;
    duration: string;
    tags: string[];
    featured: boolean;
    difficulty: string;
    prerequisites: string[];
    transcript: string;
    views: number;
    avg_rating: number;
    total_ratings: number;
    created_at: string;
}

const VideoManagement = () => {
    const { toast } = useToast();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [prereqInput, setPrereqInput] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        category: "",
        duration: "",
        tags: [] as string[],
        featured: false,
        difficulty: "beginner",
        prerequisites: [] as string[],
        transcript: "",
    });

    // Local storage key
    const STORAGE_KEY = 'spincash_videos';

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const videosData = stored ? JSON.parse(stored) : [];
            setVideos(videosData);
        } catch (error: any) {
            console.error("Error fetching videos:", error);
            toast({
                title: "Error",
                description: "Failed to load videos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const saveVideos = (videosData: Video[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(videosData));
        } catch (error) {
            console.error("Error saving videos:", error);
            toast({
                title: "Error",
                description: "Failed to save videos",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const videoData: Video = {
                id: editingVideo ? editingVideo.id : Date.now().toString(),
                title: formData.title,
                description: formData.description,
                video_url: formData.video_url,
                thumbnail_url: formData.thumbnail_url,
                category: formData.category,
                duration: formData.duration,
                tags: formData.tags,
                featured: formData.featured,
                difficulty: formData.difficulty,
                prerequisites: formData.prerequisites,
                transcript: formData.transcript,
                views: editingVideo ? editingVideo.views : 0,
                avg_rating: editingVideo ? editingVideo.avg_rating : 0,
                total_ratings: editingVideo ? editingVideo.total_ratings : 0,
                created_at: editingVideo ? editingVideo.created_at : new Date().toISOString(),
            };

            let updatedVideos;
            if (editingVideo) {
                updatedVideos = videos.map(video =>
                    video.id === editingVideo.id ? videoData : video
                );
                toast({ title: "Success", description: "Video updated successfully" });
            } else {
                updatedVideos = [videoData, ...videos];
                toast({ title: "Success", description: "Video added successfully" });
            }

            setVideos(updatedVideos);
            saveVideos(updatedVideos);

            setIsDialogOpen(false);
            setEditingVideo(null);
            setFormData({
                title: "",
                description: "",
                video_url: "",
                thumbnail_url: "",
                category: "",
                duration: "",
                tags: [],
                featured: false,
                difficulty: "beginner",
                prerequisites: [],
                transcript: "",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save video",
                variant: "destructive",
            });
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this video?")) return;

        try {
            const updatedVideos = videos.filter(video => video.id !== id);
            setVideos(updatedVideos);
            saveVideos(updatedVideos);
            toast({ title: "Success", description: "Video deleted successfully" });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to delete video",
                variant: "destructive",
            });
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const addPrerequisite = () => {
        if (prereqInput.trim() && !formData.prerequisites.includes(prereqInput.trim())) {
            setFormData({ ...formData, prerequisites: [...formData.prerequisites, prereqInput.trim()] });
            setPrereqInput("");
        }
    };

    const removePrerequisite = (prereqToRemove: string) => {
        setFormData({ ...formData, prerequisites: formData.prerequisites.filter(prereq => prereq !== prereqToRemove) });
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
            tags: video.tags || [],
            featured: video.featured || false,
            difficulty: video.difficulty || "beginner",
            prerequisites: video.prerequisites || [],
            transcript: video.transcript || "",
        });
        setTagInput("");
        setPrereqInput("");
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
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                const newVideo = addVideo({
                                    title: "New Forex Video",
                                    description: "Add your video description here",
                                    video_url: "",
                                    thumbnail_url: "",
                                    category: "Forex Basics",
                                    duration: "10:00",
                                    tags: ["forex"],
                                    featured: false,
                                    difficulty: "beginner",
                                    prerequisites: [],
                                    transcript: ""
                                });
                                setVideos(prev => [newVideo, ...prev]);
                                toast({ title: "Success", description: "New video added! Edit it with your URLs." });
                            }}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Quick Add
                        </Button>
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

                                {/* Tags */}
                                <div>
                                    <Label className="text-white">Tags</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                            placeholder="Add tag..."
                                        />
                                        <Button type="button" onClick={addTag} variant="outline" size="sm">
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {tag}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() => removeTag(tag)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Featured & Difficulty */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="featured"
                                            checked={formData.featured}
                                            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                                        />
                                        <Label htmlFor="featured" className="text-white">Featured Video</Label>
                                    </div>

                                    <div>
                                        <Label className="text-white">Difficulty</Label>
                                        <Select
                                            value={formData.difficulty}
                                            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                                        >
                                            <SelectTrigger className="backdrop-blur-md bg-white/10 border-white/20 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Prerequisites */}
                                <div>
                                    <Label className="text-white">Prerequisites</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={prereqInput}
                                            onChange={(e) => setPrereqInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                                            className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                            placeholder="Add prerequisite..."
                                        />
                                        <Button type="button" onClick={addPrerequisite} variant="outline" size="sm">
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.prerequisites.map((prereq, index) => (
                                            <Badge key={index} variant="outline" className="flex items-center gap-1 text-white border-white/20">
                                                {prereq}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() => removePrerequisite(prereq)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Transcript */}
                                <div>
                                    <Label htmlFor="transcript" className="text-white">Transcript (Optional)</Label>
                                    <Textarea
                                        id="transcript"
                                        value={formData.transcript}
                                        onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="Video transcript for accessibility..."
                                        rows={6}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            setEditingVideo(null);
                                            setFormData({
                                                title: "",
                                                description: "",
                                                video_url: "",
                                                thumbnail_url: "",
                                                category: "",
                                                duration: "",
                                                tags: [],
                                                featured: false,
                                                difficulty: "beginner",
                                                prerequisites: [],
                                                transcript: "",
                                            });
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
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-white font-semibold text-lg line-clamp-2 flex-1">{video.title}</h3>
                                            {video.featured && (
                                                <Badge variant="default" className="bg-accent text-xs ml-2">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {video.category && (
                                                <span className="text-xs text-pink-400">
                                                    {video.category}
                                                </span>
                                            )}
                                            {video.difficulty && (
                                                <Badge variant="outline" className="text-xs border-white/20 text-white">
                                                    {video.difficulty}
                                                </Badge>
                                            )}
                                        </div>
                                        {video.tags && video.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {video.tags.slice(0, 3).map((tag: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {video.tags.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{video.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {video.description && (
                                        <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{video.views || 0} views</span>
                                        {video.avg_rating > 0 && (
                                            <span>★ {video.avg_rating.toFixed(1)} ({video.total_ratings})</span>
                                        )}
                                    </div>
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
