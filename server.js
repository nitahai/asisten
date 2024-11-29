import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRoast } from './asisten.js';
import cors from 'cors'; // Import cors

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: '/tmp/uploads/', limits: { fileSize: 6 * 1024 * 1024 } }); // Changed to use temporary directory and set file size limit to 6MB

// Use CORS middleware
app.use(cors());

app.use(express.static(path.join(__dirname, 'public'))); // Added to serve static files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

 app.post('/asisten', upload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    if (req.file.size > 6 * 1024 * 1024) { // Check file size
        return res.status(400).json({ error: 'File size exceeds 6MB limit' });
    }
    try {
        console.log('Received file:', req.file); // Log file information
        const roast = await getRoast(req.file);
        res.json({ ok: true, text: roast });
    } catch (error) {
        console.error('Roasting error:', error);

        // Menangani error 504 (timeout) jika proses memakan waktu lama
        if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                error: 'Maaf, sedang error. Silakan coba lagi nanti.'
            });
        }

        // Menangani error lainnya
        return res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app; // Added for Vercel
