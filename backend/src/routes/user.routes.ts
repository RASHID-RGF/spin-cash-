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

// Get current user profile
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { full_name, phone_number, country, bio } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name,
                phone_number,
                country,
                bio,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({ success: true, profile: data });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user statistics
router.get('/stats/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Get wallet balance
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('balance, total_earnings')
            .eq('user_id', userId)
            .single();

        if (walletError) {
            return res.status(500).json({ error: 'Failed to fetch wallet stats' });
        }

        // Get referral count
        const { count: referralCount, error: referralError } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId);

        // Get video views count
        const { count: videoViewsCount, error: viewsError } = await supabase
            .from('video_views')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Get quiz attempts count
        const { count: quizAttemptsCount, error: quizError } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        res.json({
            wallet: wallet || { balance: 0, total_earnings: 0 },
            referrals: referralCount || 0,
            video_views: videoViewsCount || 0,
            quiz_attempts: quizAttemptsCount || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin routes (require admin privileges)
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const userId = (req as any).user.id;
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Allow users to view their own profile or admins to view any profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profileError) {
            return res.status(500).json({ error: 'Failed to verify permissions' });
        }

        if (id !== userId && profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const updates = req.body;

        // Check permissions
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profileError) {
            return res.status(500).json({ error: 'Failed to verify permissions' });
        }

        if (id !== userId && profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update user' });
        }

        res.json({ success: true, user: data });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
