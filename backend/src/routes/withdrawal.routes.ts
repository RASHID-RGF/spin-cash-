import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get all withdrawals' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create withdrawal request' });
});

router.put('/:id/approve', (req, res) => {
    res.json({ message: `Approve withdrawal ${req.params.id}` });
});

router.put('/:id/reject', (req, res) => {
    res.json({ message: `Reject withdrawal ${req.params.id}` });
});

export default router;
