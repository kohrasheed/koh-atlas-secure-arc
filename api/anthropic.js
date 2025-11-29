module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: 'Anthropic proxy server is running' });
  }

  if (req.method === 'POST') {
    try {
      const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
      }

      const { model, messages, max_tokens, temperature } = req.body;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: max_tokens || 2048,
          temperature: temperature || 1,
          messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Failed to call Anthropic API', 
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
