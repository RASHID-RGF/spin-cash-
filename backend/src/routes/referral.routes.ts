import { Router } from 'express';
const router = Router();

router.get('/:userId', (req, res) => {
    res.json({ message: `Get referrals for user ${req.params.userId}` });
});

router.post('/track', (req, res) => {
    res.json({ message: 'Track referral' });
});

router.get('/:userId/earnings', (req, res) => {
    res.json({ message: `Get referral earnings for user ${req.params.userId}` });
});

export default router;
