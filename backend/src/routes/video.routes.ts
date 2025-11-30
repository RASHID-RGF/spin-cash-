import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
const router = Router();

// Middleware to check if user is authenticated
const requireAuth = async (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    try {
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

router.get('/', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get videos error:', error);
        res.status(500).json({ error: 'Failed to get videos' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, description, video_url, thumbnail_url, category, duration } = req.body;

        const { data, error } = await supabase
            .from('videos')
            .insert({
                title,
                description,
                video_url,
                thumbnail_url,
                category,
                duration
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Upload video error:', error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('id', id)
            .eq('is_published', true)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get video error:', error);
        res.status(500).json({ error: 'Failed to get video' });
    }
});

router.post('/:id/view', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, watchDuration } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check if already viewed
        const { data: existingView, error: viewError } = await supabase
            .from('video_views')
            .select('id, reward_given')
            .eq('user_id', userId)
            .eq('video_id', id)
            .single();

        if (viewError && viewError.code !== 'PGRST116') throw viewError; // PGRST116 is not found

        if (existingView) {
            // Update watch duration
            await supabase
                .from('video_views')
                .update({
                    watch_duration: watchDuration,
                    completed: watchDuration >= 30 // Assume 30 seconds for completion
                })
                .eq('id', existingView.id);

            return res.json({ success: true, message: 'View updated' });
        }

        // New view
        const completed = watchDuration >= 30;
        const reward = completed ? 2 : 0;

        // Award reward if completed
        if (completed) {
            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('balance, total_earnings')
                .eq('user_id', userId)
                .single();

            if (walletError) throw walletError;

            const { error: updateError } = await supabase
                .from('wallets')
                .update({
                    balance: (wallet?.balance || 0) + reward,
                    total_earnings: (wallet?.total_earnings || 0) + reward
                })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            // Record transaction
            await supabase
                .from('transactions')
                .insert({
                    user_id: userId,
                    type: 'video_reward',
                    amount: reward,
                    description: 'Video watch reward'
                });
        }

        // Record view
        await supabase
            .from('video_views')
            .insert({
                user_id: userId,
                video_id: id,
                watch_duration: watchDuration,
                completed,
                reward_given: completed
            });

        // Update video views count
        const { data: video, error: videoError } = await supabase
            .from('videos')
            .select('views')
            .eq('id', id)
            .single();

        if (videoError) throw videoError;

        await supabase
            .from('videos')
            .update({ views: (video?.views || 0) + 1 })
            .eq('id', id);

        res.json({
            success: true,
            reward: completed ? reward : 0,
            message: completed ? `You earned ${reward} points for watching the video!` : 'Video view recorded'
        });
    } catch (error: any) {
        console.error('Track video view error:', error);
        res.status(500).json({ error: 'Failed to track video view' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Video deleted' });
    } catch (error: any) {
        console.error('Delete video error:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// ===== ENHANCED VIDEO FEATURES =====

// Video Ratings
router.post('/:id/rate', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        const userId = (req as any).user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const { data, error } = await supabase
            .from('video_ratings')
            .upsert({
                video_id: id,
                user_id: userId,
                rating,
                review: review || null
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, rating: data });
    } catch (error: any) {
        console.error('Rate video error:', error);
        res.status(500).json({ error: 'Failed to rate video' });
    }
});

router.get('/:id/ratings', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('video_ratings')
            .select(`
                rating,
                review,
                created_at,
                profiles:user_id (full_name)
            `)
            .eq('video_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get video ratings error:', error);
        res.status(500).json({ error: 'Failed to get ratings' });
    }
});

// Video Bookmarks
router.post('/:id/bookmark', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const { data: existing, error: checkError } = await supabase
            .from('video_bookmarks')
            .select('id')
            .eq('video_id', id)
            .eq('user_id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existing) {
            // Remove bookmark
            const { error } = await supabase
                .from('video_bookmarks')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;
            res.json({ success: true, bookmarked: false });
        } else {
            // Add bookmark
            const { error } = await supabase
                .from('video_bookmarks')
                .insert({ video_id: id, user_id: userId });

            if (error) throw error;
            res.json({ success: true, bookmarked: true });
        }
    } catch (error: any) {
        console.error('Bookmark video error:', error);
        res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
});

router.get('/bookmarks/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('video_bookmarks')
            .select(`
                id,
                created_at,
                videos:video_id (
                    id,
                    title,
                    description,
                    thumbnail_url,
                    duration,
                    views,
                    avg_rating
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ error: 'Failed to get bookmarks' });
    }
});

// Video Tags
router.post('/:id/tags', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        // Delete existing tags
        await supabase
            .from('video_tags')
            .delete()
            .eq('video_id', id);

        // Insert new tags
        if (tags.length > 0) {
            const tagInserts = tags.map(tag => ({
                video_id: id,
                tag: tag.toLowerCase().trim()
            }));

            const { error } = await supabase
                .from('video_tags')
                .insert(tagInserts);

            if (error) throw error;
        }

        // Update video tags array
        const { error: updateError } = await supabase
            .from('videos')
            .update({ tags })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({ success: true, tags });
    } catch (error: any) {
        console.error('Update video tags error:', error);
        res.status(500).json({ error: 'Failed to update tags' });
    }
});

router.get('/tags/search', async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        const { data, error } = await supabase
            .from('video_tags')
            .select('tag')
            .ilike('tag', `%${q}%`)
            .limit(10);

        if (error) throw error;

        const uniqueTags = [...new Set(data.map(item => item.tag))];
        res.json(uniqueTags);
    } catch (error: any) {
        console.error('Search tags error:', error);
        res.status(500).json({ error: 'Failed to search tags' });
    }
});

// Video Playlists
router.get('/playlists/user/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('video_playlists')
            .select(`
                *,
                video_count:playlist_videos(count)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get playlists error:', error);
        res.status(500).json({ error: 'Failed to get playlists' });
    }
});

router.post('/playlists', requireAuth, async (req: Request, res: Response) => {
    try {
        const { title, description, is_public } = req.body;
        const userId = (req as any).user.id;

        const { data, error } = await supabase
            .from('video_playlists')
            .insert({
                title,
                description,
                user_id: userId,
                is_public: is_public || false
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Create playlist error:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

router.post('/playlists/:playlistId/videos', requireAuth, async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params;
        const { videoId } = req.body;
        const userId = (req as any).user.id;

        // Check if playlist belongs to user
        const { data: playlist, error: playlistError } = await supabase
            .from('video_playlists')
            .select('user_id')
            .eq('id', playlistId)
            .single();

        if (playlistError || playlist.user_id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get next position
        const { data: existing, error: countError } = await supabase
            .from('playlist_videos')
            .select('position')
            .eq('playlist_id', playlistId)
            .order('position', { ascending: false })
            .limit(1);

        const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 1;

        const { data, error } = await supabase
            .from('playlist_videos')
            .insert({
                playlist_id: playlistId,
                video_id: videoId,
                position: nextPosition
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Add video to playlist error:', error);
        res.status(500).json({ error: 'Failed to add video to playlist' });
    }
});

// Enhanced Video Analytics
router.get('/:id/analytics', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('video_analytics')
            .select('*')
            .eq('video_id', id)
            .order('date', { ascending: false })
            .limit(30);

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get video analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// Enhanced video view tracking with progress
router.put('/:id/progress', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { progress, watchTime } = req.body;
        const userId = (req as any).user.id;

        const { error } = await supabase
            .from('video_views')
            .upsert({
                video_id: id,
                user_id: userId,
                watch_progress: progress,
                total_watch_time: watchTime,
                last_watched_at: new Date().toISOString()
            });

        if (error) throw error;

        res.json({ success: true });
    } catch (error: any) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

export default router;
