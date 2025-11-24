import { Router } from 'express';
const router = Router();

// Spin game routes
router.post('/spin', (req, res) => {
    res.json({ message: 'Process spin' });
});

router.get('/spin/history/:userId', (req, res) => {
    res.json({ message: `Get spin history for user ${req.params.userId}` });
});

// Quiz routes
router.get('/quiz/questions', (req, res) => {
    res.json({ message: 'Get quiz questions' });
});

router.post('/quiz/submit', (req, res) => {
    res.json({ message: 'Submit quiz answers' });
});

// Number game routes
router.post('/number-game/play', (req, res) => {
    res.json({ message: 'Play number game' });
});

router.get('/number-game/history/:userId', (req, res) => {
    res.json({ message: `Get number game history for user ${req.params.userId}` });
});

export default router;
