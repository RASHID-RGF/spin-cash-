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

// Create withdrawal request
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { amount, phone_number, payment_method = 'mpesa' } = req.body;
        const userId = (req as any).user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Check minimum withdrawal amount
        const minWithdrawal = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT || '100');
        if (amount < minWithdrawal) {
            return res.status(400).json({ error: `Minimum withdrawal amount is ${minWithdrawal} KES` });
        }

        // Check user balance
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (walletError) {
            return res.status(500).json({ error: 'Failed to check wallet balance' });
        }

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Create withdrawal request
        const { data: withdrawal, error: withdrawalError } = await supabase
            .from('withdrawals')
            .insert({
                user_id: userId,
                amount,
                phone_number,
                payment_method,
                status: 'pending'
            })
            .select()
            .single();

        if (withdrawalError) {
            return res.status(500).json({ error: 'Failed to create withdrawal request' });
        }

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawal
        });
    } catch (error) {
        console.error('Create withdrawal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's withdrawal history
router.get('/history', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const { data: withdrawals, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch withdrawal history' });
        }

        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: Get all withdrawals
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
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

        const { data: withdrawals, error } = await supabase
            .from('withdrawals')
            .select(`
                *,
                profiles:user_id (full_name, phone_number)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch withdrawals' });
        }

        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: Approve withdrawal
router.put('/:id/approve', requireAuth, async (req: Request, res: Response) => {
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
                processed_by: userId
            })
            .eq('id', id);

        if (updateError) {
            return res.status(500).json({ error: 'Failed to approve withdrawal' });
        }

        // Deduct from user wallet
        const { data: currentWallet, error: fetchError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', withdrawal.user_id)
            .single();

        if (fetchError) {
            console.error('Failed to fetch current wallet:', fetchError);
        } else {
            const { error: updateError } = await supabase
                .from('wallets')
                .update({
                    balance: (currentWallet?.balance || 0) - withdrawal.amount
                })
                .eq('user_id', withdrawal.user_id);

            if (updateError) {
                console.error('Wallet update failed:', updateError);
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: Reject withdrawal
router.put('/:id/reject', requireAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
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

        // Update withdrawal status
        const { error: updateError } = await supabase
            .from('withdrawals')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                processed_at: new Date().toISOString(),
                processed_by: userId
            })
            .eq('id', id);

        if (updateError) {
            return res.status(500).json({ error: 'Failed to reject withdrawal' });
        }

        res.json({ success: true, message: 'Withdrawal rejected successfully' });
    } catch (error) {
        console.error('Reject withdrawal error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
