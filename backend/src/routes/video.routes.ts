import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get all videos' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Upload video' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Get video ${req.params.id}` });
});

router.post('/:id/view', (req, res) => {
    res.json({ message: `Track video view ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Delete video ${req.params.id}` });
});

export default router;
