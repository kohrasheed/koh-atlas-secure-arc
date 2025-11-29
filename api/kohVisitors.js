const fs = require('fs').promises;
const path = require('path');

// Simple visitor logger for Node.js backend
// Deploy this to Vercel, Netlify, or any Node.js server

const LOG_FILE = path.join(__dirname, 'kohVisitors.json');

// Initialize log file if it doesn't exist
async function initLogFile() {
  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, JSON.stringify({ visitors: [] }, null, 2));
  }
}

// Log visitor
async function logVisitor(visitorData) {
  await initLogFile();
  
  const data = JSON.parse(await fs.readFile(LOG_FILE, 'utf8'));
  data.visitors.push({
    ...visitorData,
    serverTimestamp: new Date().toISOString()
  });
  
  await fs.writeFile(LOG_FILE, JSON.stringify(data, null, 2));
  return data.visitors.length;
}

// Get all visitors
async function getVisitors() {
  await initLogFile();
  const data = JSON.parse(await fs.readFile(LOG_FILE, 'utf8'));
  return data.visitors;
}

// Export for Vercel/Netlify Functions
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    try {
      const visitorData = req.body;
      const count = await logVisitor(visitorData);
      
      res.status(200).json({ 
        success: true, 
        message: 'Visitor logged',
        totalVisitors: count
      });
    } catch (error) {
      console.error('Error logging visitor:', error);
      res.status(500).json({ error: 'Failed to log visitor' });
    }
  } else if (req.method === 'GET') {
    try {
      const visitors = await getVisitors();
      
      // If downloading, return as file
      if (req.query.download === 'true') {
        let content = '=== KOH VISITORS LOG ===\n';
        content += `Generated: ${new Date().toISOString()}\n`;
        content += `Total Visits: ${visitors.length}\n`;
        content += '='.repeat(50) + '\n\n';
        
        visitors.forEach((visit, index) => {
          content += `\n--- Visit #${index + 1} ---\n`;
          content += `Timestamp: ${visit.timestamp}\n`;
          content += `IP: ${visit.ip}\n`;
          content += `Location: ${visit.city}, ${visit.region}, ${visit.country}\n`;
          content += `Coordinates: ${visit.latitude}, ${visit.longitude}\n`;
          content += `Organization: ${visit.org}\n`;
          content += `Browser: ${visit.userAgent}\n`;
          content += `Page: ${visit.page}\n`;
        });
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=kohVisitors.txt');
        res.status(200).send(content);
      } else {
        res.status(200).json({ 
          totalVisitors: visitors.length,
          visitors: visitors 
        });
      }
    } catch (error) {
      console.error('Error getting visitors:', error);
      res.status(500).json({ error: 'Failed to get visitors' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
