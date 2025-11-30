import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
const router = Router();

// Middleware to verify user authentication
const requireAuth = async (req: Request, res: Response, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Middleware to check admin privileges
const requireAdmin = async (req: Request, res: Response, next: any) => {
    try {
        const userId = (req as any).user.id;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

// Get all published blogs
router.get('/', async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;

        let query = supabase
            .from('blogs')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;

        query = query.range(from, to);

        const { data: blogs, error, count } = await query;

        if (error) throw error;

        res.json({
            blogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil((count || 0) / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ error: 'Failed to get blogs' });
    }
});

// Get blog categories
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('category')
            .not('category', 'is', null);

        if (error) throw error;

        const categories = [...new Set(data.map(item => item.category))];
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

// Get single blog
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: blog, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', id)
            .eq('is_published', true)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Increment view count
        await supabase
            .from('blogs')
            .update({ views: (blog.views || 0) + 1 })
            .eq('id', id);

        res.json(blog);
    } catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({ error: 'Failed to get blog' });
    }
});

// Create blog (admin only)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { title, content, excerpt, category, tags, featured_image, is_published } = req.body;
        const authorId = (req as any).user.id;

        const { data, error } = await supabase
            .from('blogs')
            .insert({
                title,
                content,
                excerpt,
                category,
                tags,
                featured_image,
                author_id: authorId,
                is_published: is_published || false
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, blog: data });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// Update blog (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('blogs')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, blog: data });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// Delete blog (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// Get all blogs for admin (including drafts)
router.get('/admin/all', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        let query = supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });

        if (status === 'published') {
            query = query.eq('is_published', true);
        } else if (status === 'draft') {
            query = query.eq('is_published', false);
        }

        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;

        query = query.range(from, to);

        const { data: blogs, error, count } = await query;

        if (error) throw error;

        res.json({
            blogs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil((count || 0) / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get admin blogs error:', error);
        res.status(500).json({ error: 'Failed to get blogs' });
    }
});

export default router;
