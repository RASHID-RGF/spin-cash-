import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get all blogs' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create blog' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Get blog ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Update blog ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Delete blog ${req.params.id}` });
});

export default router;
