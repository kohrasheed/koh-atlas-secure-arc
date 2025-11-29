// Simple Analytics Backend - Can be deployed to Vercel/Netlify Functions
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://kohrasheed.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const visitorData = req.body;
    
    // Get real IP from headers
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress;
    
    const logEntry = {
      ...visitorData,
      serverIP: ip,
      timestamp: new Date().toISOString(),
    };

    // Log to console (in production, save to database)
    console.log('Visitor logged:', JSON.stringify(logEntry, null, 2));
    
    // TODO: Save to database
    // Example: await db.visitors.insert(logEntry);
    
    res.status(200).json({ 
      success: true, 
      message: 'Visit logged',
      visitCount: 1 
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
