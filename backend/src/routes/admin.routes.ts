import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
const router = Router();

// Middleware to verify admin authentication
const requireAdmin = async (req: Request, res: Response, next: any) => {
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

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Admin dashboard stats
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
    try {
        // Get user stats
        const { count: totalUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Get video stats
        const { count: totalVideos, error: videosError } = await supabase
            .from('videos')
            .select('*', { count: 'exact', head: true });

        // Get withdrawal stats
        const { count: pendingWithdrawals, error: withdrawalsError } = await supabase
            .from('withdrawals')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Get total earnings
        const { data: earnings, error: earningsError } = await supabase
            .from('wallets')
            .select('total_earnings');

        const totalEarnings = earnings?.reduce((sum, wallet) => sum + (wallet.total_earnings || 0), 0) || 0;

        // Get recent transactions
        const { data: recentTransactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            totalUsers: totalUsers || 0,
            totalVideos: totalVideos || 0,
            pendingWithdrawals: pendingWithdrawals || 0,
            totalEarnings,
            recentTransactions: recentTransactions || []
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to get admin stats' });
    }
});

// User management
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        let query = supabase
            .from('profiles')
            .select(`
                *,
                wallets:wallets(balance, total_earnings)
            `)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;

        query = query.range(from, to);

        const { data: users, error, count } = await query;

        if (error) throw error;

        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil((count || 0) / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

router.put('/users/:id/toggle-status', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get current status
        const { data: user, error: fetchError } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const newStatus = user.status === 'active' ? 'suspended' : 'active';

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', id);

        if (updateError) throw updateError;

        res.json({ success: true, status: newStatus });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ error: 'Failed to toggle user status' });
    }
});

// Withdrawal management
router.get('/withdrawals', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        let query = supabase
            .from('withdrawals')
            .select(`
                *,
                profiles:user_id (full_name, phone_number)
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const from = (Number(page) - 1) * Number(limit);
        const to = from + Number(limit) - 1;

        query = query.range(from, to);

        const { data: withdrawals, error, count } = await query;

        if (error) throw error;

        res.json({
            withdrawals,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil((count || 0) / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ error: 'Failed to get withdrawals' });
    }
});

router.put('/withdrawals/:id/approve', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user.id;

        // Get withdrawal details
        const { data: withdrawal, error: withdrawalError } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('id', id)
            .single();

        if (withdrawalError || !withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ error: 'Withdrawal is not in pending status' });
        }

        // Update withdrawal status
        const { error: updateError } = await supabase
            .from('withdrawals')
            .update({
                status: 'approved',
                processed_at: new Date().toISOString(),
                processed_by: adminId
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Deduct from user wallet
        const { data: currentWallet, error: fetchError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', withdrawal.user_id)
            .single();

        if (!fetchError && currentWallet) {
            const { error: walletError } = await supabase
                .from('wallets')
                .update({
                    balance: (currentWallet.balance || 0) - withdrawal.amount
                })
                .eq('user_id', withdrawal.user_id);

            if (walletError) {
                console.error('Wallet update failed:', walletError);
            }
        }

        // Record transaction
        await supabase
            .from('transactions')
            .insert({
                user_id: withdrawal.user_id,
                type: 'withdrawal',
                amount: -withdrawal.amount,
                description: `Withdrawal to ${withdrawal.phone_number}`,
                status: 'completed'
            });

        res.json({ success: true, message: 'Withdrawal approved successfully' });
    } catch (error) {
        console.error('Approve withdrawal error:', error);
        res.status(500).json({ error: 'Failed to approve withdrawal' });
    }
});

router.put('/withdrawals/:id/reject', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user.id;

        const { error } = await supabase
            .from('withdrawals')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                processed_at: new Date().toISOString(),
                processed_by: adminId
            })
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Withdrawal rejected successfully' });
    } catch (error) {
        console.error('Reject withdrawal error:', error);
        res.status(500).json({ error: 'Failed to reject withdrawal' });
    }
});

// Content management
router.post('/videos', requireAdmin, async (req: Request, res: Response) => {
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

        res.json({ success: true, video: data });
    } catch (error) {
        console.error('Create video error:', error);
        res.status(500).json({ error: 'Failed to create video' });
    }
});

// Analytics
router.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period as string);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        // User registrations over time
        const { data: userStats, error: userError } = await supabase
            .from('profiles')
            .select('created_at')
            .gte('created_at', startDate.toISOString());

        // Transaction volume
        const { data: transactionStats, error: transactionError } = await supabase
            .from('transactions')
            .select('amount, type, created_at')
            .gte('created_at', startDate.toISOString());

        // Video views
        const { data: videoStats, error: videoError } = await supabase
            .from('video_views')
            .select('created_at')
            .gte('created_at', startDate.toISOString());

        res.json({
            period: `${days} days`,
            userRegistrations: userStats?.length || 0,
            totalTransactions: transactionStats?.length || 0,
            transactionVolume: transactionStats?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0,
            videoViews: videoStats?.length || 0
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// System settings (placeholder for future use)
router.get('/settings', requireAdmin, async (req: Request, res: Response) => {
    try {
        // This could be stored in a settings table
        const settings = {
            minWithdrawalAmount: process.env.MIN_WITHDRAWAL_AMOUNT || '100',
            maxWithdrawalAmount: process.env.MAX_WITHDRAWAL_AMOUNT || '50000',
            referralCommission: process.env.REFERRAL_LEVEL_1_COMMISSION || '10',
            videoWatchReward: process.env.VIDEO_WATCH_REWARD || '2'
        };

        res.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

export default router;
