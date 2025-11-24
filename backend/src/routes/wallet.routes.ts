import { Router } from 'express';
const router = Router();

router.get('/:userId', (req, res) => {
    res.json({ message: `Get wallet for user ${req.params.userId}` });
});

router.post('/add-funds', (req, res) => {
    res.json({ message: 'Add funds to wallet' });
});

router.get('/:userId/transactions', (req, res) => {
    res.json({ message: `Get transactions for user ${req.params.userId}` });
});

export default router;
