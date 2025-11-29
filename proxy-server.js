import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🔍 Environment check:');
console.log('  PORT from env:', process.env.PORT);
console.log('  Using PORT:', PORT);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Anthropic proxy server is running' });
});

app.get('/api/anthropic', (req, res) => {
  res.json({ error: 'Use POST method to call this endpoint' });
});

app.post('/api/anthropic', async (req, res) => {
  console.log('📥 Received request to /api/anthropic');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const { model, messages, max_tokens, temperature } = req.body;
    console.log('🔑 Using model:', model);

    console.log('🌐 Calling Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        temperature,
        messages
      })
    });

    console.log('📡 Anthropic API status:', response.status);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Anthropic API error:', data);
      return res.status(response.status).json({ error: data });
    }

    console.log('✅ Success! Sending response back to client');
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to call Anthropic API', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Anthropic proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Binding to all interfaces for Railway`);
});
