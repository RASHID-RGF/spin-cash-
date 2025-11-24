import { Router } from 'express';
const router = Router();

// Auth routes will be handled by Supabase on the frontend
// These are placeholder routes for any custom auth logic

router.post('/register', (req, res) => {
    res.json({ message: 'Use Supabase auth on frontend' });
});

router.post('/login', (req, res) => {
    res.json({ message: 'Use Supabase auth on frontend' });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Use Supabase auth on frontend' });
});

export default router;
