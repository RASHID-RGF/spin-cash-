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

// Get user's referral code
router.get('/code', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const { data: referral, error } = await supabase
            .from('referrals')
            .select('referral_code')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found

        if (!referral) {
            // Generate new referral code
            const referralCode = `REF${userId.slice(-6).toUpperCase()}`;

            const { error: insertError } = await supabase
                .from('referrals')
                .insert({
                    user_id: userId,
                    referral_code: referralCode
                });

            if (insertError) throw insertError;

            res.json({ referral_code: referralCode });
        } else {
            res.json({ referral_code: referral.referral_code });
        }
    } catch (error) {
        console.error('Get referral code error:', error);
        res.status(500).json({ error: 'Failed to get referral code' });
    }
});

// Get user's referrals
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const { data: referrals, error } = await supabase
            .from('referrals')
            .select(`
                id,
                referral_code,
                total_referrals,
                total_earnings,
                created_at,
                referred_users:referral_links (
                    id,
                    referred_user_id,
                    status,
                    commission_earned,
                    created_at,
                    profiles:referred_user_id (
                        full_name,
                        created_at
                    )
                )
            `)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(referrals || {
            referral_code: null,
            total_referrals: 0,
            total_earnings: 0,
            referred_users: []
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({ error: 'Failed to get referrals' });
    }
});

// Track referral (when someone uses a referral code)
router.post('/track', async (req: Request, res: Response) => {
    try {
        const { referralCode, newUserId } = req.body;

        if (!referralCode || !newUserId) {
            return res.status(400).json({ error: 'Referral code and new user ID are required' });
        }

        // Find the referrer
        const { data: referrer, error: referrerError } = await supabase
            .from('referrals')
            .select('user_id')
            .eq('referral_code', referralCode)
            .single();

        if (referrerError || !referrer) {
            return res.status(400).json({ error: 'Invalid referral code' });
        }

        // Check if this user was already referred
        const { data: existingReferral, error: checkError } = await supabase
            .from('referral_links')
            .select('id')
            .eq('referred_user_id', newUserId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existingReferral) {
            return res.status(400).json({ error: 'User already referred' });
        }

        // Create referral link
        const { error: linkError } = await supabase
            .from('referral_links')
            .insert({
                referrer_id: referrer.user_id,
                referred_user_id: newUserId,
                status: 'active'
            });

        if (linkError) throw linkError;

        // Update referrer's referral count
        const { error: updateError } = await supabase.rpc('increment_referral_count', {
            referrer_id: referrer.user_id
        });

        if (updateError) {
            console.error('Failed to update referral count:', updateError);
        }

        res.json({ success: true, message: 'Referral tracked successfully' });
    } catch (error) {
        console.error('Track referral error:', error);
        res.status(500).json({ error: 'Failed to track referral' });
    }
});

// Award referral commission (called when referred user makes a deposit)
router.post('/commission', async (req: Request, res: Response) => {
    try {
        const { userId, amount, type = 'deposit' } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ error: 'User ID and amount are required' });
        }

        // Find referrer
        const { data: referralLink, error: linkError } = await supabase
            .from('referral_links')
            .select('referrer_id')
            .eq('referred_user_id', userId)
            .eq('status', 'active')
            .single();

        if (linkError || !referralLink) {
            return res.json({ success: true, message: 'No active referral found' });
        }

        // Calculate commission based on type
        let commissionRate = 0;
        if (type === 'deposit') {
            commissionRate = parseInt(process.env.REFERRAL_LEVEL_1_COMMISSION || '10');
        }

        const commission = Math.floor((amount * commissionRate) / 100);

        if (commission > 0) {
            // Award commission to referrer
            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('balance, total_earnings')
                .eq('referrer_id', referralLink.referrer_id)
                .single();

            if (walletError) throw walletError;

            const { error: updateError } = await supabase
                .from('wallets')
                .update({
                    balance: (wallet?.balance || 0) + commission,
                    total_earnings: (wallet?.total_earnings || 0) + commission
                })
                .eq('user_id', referralLink.referrer_id);

            if (updateError) throw updateError;

            // Record commission transaction
            await supabase
                .from('transactions')
                .insert({
                    user_id: referralLink.referrer_id,
                    type: 'referral_commission',
                    amount: commission,
                    description: `Referral commission from ${type}`
                });

            // Update referral earnings
            const { data: currentReferral, error: fetchError } = await supabase
                .from('referrals')
                .select('total_earnings')
                .eq('user_id', referralLink.referrer_id)
                .single();

            if (!fetchError && currentReferral) {
                await supabase
                    .from('referrals')
                    .update({
                        total_earnings: (currentReferral.total_earnings || 0) + commission
                    })
                    .eq('user_id', referralLink.referrer_id);
            }
        }

        res.json({
            success: true,
            commission_awarded: commission,
            referrer_id: referralLink.referrer_id
        });
    } catch (error) {
        console.error('Award commission error:', error);
        res.status(500).json({ error: 'Failed to award commission' });
    }
});

// Get referral statistics
router.get('/stats/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data: stats, error } = await supabase
            .from('referrals')
            .select('total_referrals, total_earnings')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(stats || { total_referrals: 0, total_earnings: 0 });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({ error: 'Failed to get referral stats' });
    }
});

export default router;
