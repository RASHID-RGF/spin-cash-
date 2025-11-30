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

router.get('/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { data: wallet, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch wallet' });
        }

        res.json(wallet);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/add-funds', requireAuth, async (req: Request, res: Response) => {
    try {
        const { amount, paymentMethod } = req.body;
        const userId = (req as any).user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Get current wallet
        const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (walletError) {
            return res.status(500).json({ error: 'Failed to fetch wallet' });
        }

        // Update wallet balance
        const newBalance = (wallet.balance || 0) + amount;
        const { error: updateError } = await supabase
            .from('wallets')
            .update({
                balance: newBalance,
                total_earnings: (wallet.total_earnings || 0) + amount,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) {
            return res.status(500).json({ error: 'Failed to update wallet' });
        }

        // Record transaction
        const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                type: 'deposit',
                amount: amount,
                description: `Deposit via ${paymentMethod}`,
                status: 'completed'
            });

        if (transactionError) {
            console.error('Transaction recording failed:', transactionError);
            // Don't fail the request if transaction recording fails
        }

        res.json({
            success: true,
            message: 'Funds added successfully',
            newBalance: newBalance,
            amount: amount
        });
    } catch (error) {
        console.error('Add funds error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:userId/transactions', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch transactions' });
        }

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
