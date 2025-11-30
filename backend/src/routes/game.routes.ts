import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
const router = Router();

// Spin game routes
router.post('/spin', async (req: Request, res: Response) => {
    try {
        const { userId, spinType = 'free' } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check daily spin limit
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySpins, error: spinError } = await supabase
            .from('spin_history')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00.000Z`)
            .lt('created_at', `${today}T23:59:59.999Z`);

        if (spinError) throw spinError;

        if (todaySpins && todaySpins.length >= 5) {
            return res.status(400).json({ error: 'Daily spin limit reached' });
        }

        // For paid spins, check spin points
        if (spinType === 'paid') {
            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('spin_points')
                .eq('user_id', userId)
                .single();

            if (walletError) throw walletError;

            if (!wallet || wallet.spin_points < 10) {
                return res.status(400).json({ error: 'Insufficient spin points' });
            }

            // Deduct spin points
            await supabase
                .from('wallets')
                .update({ spin_points: wallet.spin_points - 10 })
                .eq('user_id', userId);
        }

        // Generate random reward (1-100)
        const reward = Math.floor(Math.random() * 100) + 1;

        // Update wallet
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
                type: 'spin_reward',
                amount: reward,
                description: `Spin reward (${spinType})`
            });

        // Record spin history
        await supabase
            .from('spin_history')
            .insert({
                user_id: userId,
                reward_amount: reward,
                spin_type: spinType
            });

        res.json({
            success: true,
            reward,
            message: `You won ${reward} points!`
        });
    } catch (error: any) {
        console.error('Spin error:', error);
        res.status(500).json({ error: 'Failed to process spin' });
    }
});

router.get('/spin/history/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('spin_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get spin history error:', error);
        res.status(500).json({ error: 'Failed to get spin history' });
    }
});

// Quiz routes
router.get('/quiz/questions', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get quiz questions error:', error);
        res.status(500).json({ error: 'Failed to get quiz questions' });
    }
});

router.post('/quiz/submit', async (req: Request, res: Response) => {
    try {
        const { userId, answers } = req.body; // answers: [{ questionId, answer }]

        if (!userId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'User ID and answers are required' });
        }

        let correctAnswers = 0;
        const totalQuestions = answers.length;

        // Check answers
        for (const answer of answers) {
            const { data: question, error } = await supabase
                .from('quiz_questions')
                .select('correct_answer')
                .eq('id', answer.questionId)
                .single();

            if (error) continue;

            if (question.correct_answer === answer.answer) {
                correctAnswers++;
            }
        }

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const reward = correctAnswers * 5; // 5 points per correct answer

        // Update wallet
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
                type: 'quiz_reward',
                amount: reward,
                description: `Quiz reward: ${correctAnswers}/${totalQuestions} correct`
            });

        // Record quiz attempt
        await supabase
            .from('quiz_attempts')
            .insert({
                user_id: userId,
                score,
                total_questions: totalQuestions,
                reward_earned: reward
            });

        res.json({
            success: true,
            score,
            correctAnswers,
            totalQuestions,
            reward,
            message: `You scored ${score}% and earned ${reward} points!`
        });
    } catch (error: any) {
        console.error('Quiz submit error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Number game routes
router.post('/number-game/play', async (req: Request, res: Response) => {
    try {
        const { userId, guessedNumber } = req.body;

        if (!userId || guessedNumber === undefined) {
            return res.status(400).json({ error: 'User ID and guessed number are required' });
        }

        const correctNumber = Math.floor(Math.random() * 100) + 1;
        const won = guessedNumber === correctNumber;
        const reward = won ? 50 : 0;

        // Update wallet if won
        if (won) {
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
                    type: 'game_reward',
                    amount: reward,
                    description: 'Number game win'
                });
        }

        // Record attempt
        await supabase
            .from('number_game_attempts')
            .insert({
                user_id: userId,
                guessed_number: guessedNumber,
                correct_number: correctNumber,
                won,
                reward_earned: reward
            });

        res.json({
            success: true,
            correctNumber,
            won,
            reward,
            message: won ? `Congratulations! You won ${reward} points!` : `Sorry, the correct number was ${correctNumber}.`
        });
    } catch (error: any) {
        console.error('Number game error:', error);
        res.status(500).json({ error: 'Failed to play number game' });
    }
});

router.get('/number-game/history/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('number_game_attempts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        console.error('Get number game history error:', error);
        res.status(500).json({ error: 'Failed to get number game history' });
    }
});

export default router;
