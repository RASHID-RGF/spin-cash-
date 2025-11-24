import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
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

const BlogManagement = () => {
    const { toast } = useToast();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        excerpt: "",
        image_url: "",
        category: "",
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBlogs(data || []);
        } catch (error: any) {
            console.error("Error fetching blogs:", error);
            toast({
                title: "Error",
                description: "Failed to fetch blogs",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingBlog) {
                // Update existing blog
                const { error } = await supabase
                    .from("blogs")
                    .update(formData)
                    .eq("id", editingBlog.id);

                if (error) throw error;
                toast({ title: "Success", description: "Blog updated successfully" });
            } else {
                // Create new blog
                const { error } = await supabase
                    .from("blogs")
                    .insert([formData]);

                if (error) throw error;
                toast({ title: "Success", description: "Blog created successfully" });
            }

            setIsDialogOpen(false);
            setEditingBlog(null);
            setFormData({ title: "", content: "", excerpt: "", image_url: "", category: "" });
            fetchBlogs();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to save blog",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            const { error } = await supabase
                .from("blogs")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Success", description: "Blog deleted successfully" });
            fetchBlogs();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to delete blog",
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (blog: any) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt || "",
            image_url: blog.image_url || "",
            category: blog.category || "",
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
                    <CardTitle className="text-white">Blog Management</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                                <Plus className="h-4 w-4 mr-2" />
                                New Blog
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="backdrop-blur-md bg-slate-900/95 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {editingBlog ? "Edit Blog" : "Create New Blog"}
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    {editingBlog ? "Update the blog post details" : "Add a new blog post to your platform"}
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
                                        placeholder="e.g., Forex, Trading, Tips"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="Brief description..."
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image_url" className="text-white">Image URL</Label>
                                    <Input
                                        id="image_url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="content" className="text-white">Content</Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="backdrop-blur-md bg-white/10 border-white/20 text-white"
                                        placeholder="Write your blog content here..."
                                        rows={10}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            setEditingBlog(null);
                                            setFormData({ title: "", content: "", excerpt: "", image_url: "", category: "" });
                                        }}
                                        className="text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500">
                                        {editingBlog ? "Update" : "Create"} Blog
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blogs.length === 0 ? (
                        <div className="col-span-full text-center text-gray-400 py-8">
                            No blogs found. Create your first blog post!
                        </div>
                    ) : (
                        blogs.map((blog) => (
                            <Card key={blog.id} className="backdrop-blur-md bg-white/5 border-white/20 hover:bg-white/10 transition-all">
                                {blog.image_url && (
                                    <div className="h-40 overflow-hidden rounded-t-lg">
                                        <img
                                            src={blog.image_url}
                                            alt={blog.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardContent className="p-4 space-y-3">
                                    <div>
                                        <h3 className="text-white font-semibold text-lg line-clamp-2">{blog.title}</h3>
                                        {blog.category && (
                                            <span className="text-xs text-purple-400 mt-1 inline-block">
                                                {blog.category}
                                            </span>
                                        )}
                                    </div>
                                    {blog.excerpt && (
                                        <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex-1"
                                            onClick={() => openEditDialog(blog)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => handleDelete(blog.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(blog.created_at).toLocaleDateString()}
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

export default BlogManagement;
