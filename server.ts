import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Parse port and host from CLI arguments or environment variables
// Note: In Cloud Run/AI Studio, process.env.PORT=8080 is reserved for Nginx.
// The Node/Express server must ALWAYS bind to port 3000 (DEFAULT_APP_PORT).
let port = 3000;
let host = '0.0.0.0';

const portArgIdx = process.argv.indexOf('--port');
if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
  port = parseInt(process.argv[portArgIdx + 1], 10);
} else if (process.env.DEFAULT_APP_PORT) {
  port = parseInt(process.env.DEFAULT_APP_PORT, 10);
} else if (process.env.PORT && process.env.PORT !== '8080') {
  port = parseInt(process.env.PORT, 10);
}

const hostArgIdx = process.argv.indexOf('--host');
if (hostArgIdx !== -1 && process.argv[hostArgIdx + 1]) {
  host = process.argv[hostArgIdx + 1];
}

app.use(express.json());

// Immediate Health check endpoints - always respond 200 OK instantly for platform readiness
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// API route for Lyria music generation
app.post('/api/generate-music', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured in environment. Using procedural relaxing synthesizer music.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const {
      prompt = 'Gentle, relaxing, peaceful ambient background music for a cozy voxel sandbox game, soft piano and warm marimba notes, calm and uplifting for children learning',
    } = req.body;

    // Call Lyria Clip model
    const response = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    let audioBase64 = '';
    let mimeType = 'audio/wav';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ error: 'No audio returned from Lyria generation' });
    }

    res.json({ audioBase64, mimeType });
  } catch (err: any) {
    console.error('Error generating music with Lyria:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate music with Lyria',
    });
  }
});

// Vite middleware holder for development
let viteMiddleware: ((req: any, res: any, next: any) => void) | null = null;
let viteReadyPromise: Promise<void> | null = null;

async function initDevVite() {
  try {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? { server } : false,
      },
      appType: 'spa',
    });
    viteMiddleware = vite.middlewares;
    console.log('Vite development middleware attached successfully');
  } catch (err) {
    console.error('Failed to initialize Vite development server:', err);
  }
}

const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  viteReadyPromise = initDevVite();
  // Pass non-healthz/API requests through Vite middlewares when ready
  app.use(async (req, res, next) => {
    let handler: ((req: any, res: any, next: any) => void) | null = viteMiddleware;
    if (!handler && viteReadyPromise) {
      await viteReadyPromise;
      handler = viteMiddleware;
    }
    if (handler) {
      return handler(req, res, next);
    }
    next();
  });
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

server.on('error', (err: any) => {
  console.error('Server error encountered:', err);
});

// Bind immediately on startup so port 3000 is open in under 50ms
server.listen(port, host, () => {
  console.log(`Server listening immediately on http://${host}:${port}`);
});
