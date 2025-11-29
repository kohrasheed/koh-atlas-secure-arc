// Visitor Analytics Tracker - Logs to kohVisitors file
(function() {
  'use strict';
  
  console.log('🔍 Analytics script loaded and running');
  
  async function trackVisitor() {
    try {
      console.log('📊 Starting visitor tracking...');
      
      // Get visitor information
      const visitorData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'direct',
        page: window.location.pathname,
      };

      console.log('📝 Basic data collected:', visitorData);

      // Get IP and location from a free geolocation API
      let geoData = {};
      try {
        console.log('🌍 Fetching geolocation data...');
        const response = await fetch('https://ipapi.co/json/');
        geoData = await response.json();
        console.log('✅ Geolocation data received:', geoData);
      } catch (geoError) {
        console.warn('⚠️ Geolocation API failed, using defaults:', geoError);
        geoData = {
          ip: 'unknown',
          city: 'Unknown',
          region: 'Unknown',
          country_name: 'Unknown',
          country_code: 'XX',
          latitude: 0,
          longitude: 0,
          org: 'Unknown'
        };
      }
      
      const trackingData = {
        ...visitorData,
        ip: geoData.ip || 'unknown',
        city: geoData.city || 'Unknown',
        region: geoData.region || 'Unknown',
        country: geoData.country_name || 'Unknown',
        countryCode: geoData.country_code || 'XX',
        latitude: geoData.latitude || 0,
        longitude: geoData.longitude || 0,
        org: geoData.org || 'Unknown',
        fullUrl: window.location.href
      };

      console.log('✅ VISITOR TRACKED:', trackingData);
      console.log('═'.repeat(80));
      console.log('IP:', trackingData.ip);
      console.log('Location:', `${trackingData.city}, ${trackingData.region}, ${trackingData.country}`);
      console.log('Time:', trackingData.timestamp);
      console.log('═'.repeat(80));
      
      // Save to localStorage for aggregation
      const storageKey = 'kohVisitors';
      let visitors = [];
      try {
        const stored = localStorage.getItem(storageKey);
        visitors = stored ? JSON.parse(stored) : [];
        console.log(`📦 Found ${visitors.length} existing visitors in storage`);
      } catch (e) {
        console.warn('⚠️ Could not parse existing visitors:', e);
        visitors = [];
      }
      
      visitors.push(trackingData);
      
      // Keep only last 1000 visitors in localStorage
      if (visitors.length > 1000) {
        visitors = visitors.slice(-1000);
      }
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(visitors));
        console.log(`💾 SAVED! Total visitors: ${visitors.length}`);
        console.log(`📥 To download all visitors, run: downloadKohVisitors()`);
      } catch (storageError) {
        console.error('❌ Failed to save:', storageError);
      }
      
      // Store visit count
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
      localStorage.setItem('visitCount', (visitCount + 1).toString());
      localStorage.setItem('lastVisit', new Date().toISOString());
      
      console.log(`🎯 Your visit #${visitCount + 1} has been logged!`);
      console.log('✨ Tracking complete!');
      
      // Make data globally accessible
      window.kohVisitorsData = visitors;
      
    } catch (error) {
      console.error('❌ Analytics tracking error:', error);
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }

  // Download function - accessible from console
  window.downloadKohVisitors = function() {
    const visitors = JSON.parse(localStorage.getItem('kohVisitors') || '[]');
    
    let content = '=== KOH VISITORS LOG ===\n';
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Total Visits: ${visitors.length}\n`;
    content += '='.repeat(80) + '\n\n';
    
    visitors.forEach((visit, index) => {
      content += `\n--- Visit #${index + 1} ---\n`;
      content += `Timestamp: ${visit.timestamp}\n`;
      content += `IP Address: ${visit.ip}\n`;
      content += `Location: ${visit.city}, ${visit.region}, ${visit.country}\n`;
      content += `Coordinates: ${visit.latitude}, ${visit.longitude}\n`;
      content += `Organization: ${visit.org}\n`;
      content += `Browser: ${visit.userAgent}\n`;
      content += `Screen: ${visit.screenResolution}\n`;
      content += `Language: ${visit.language}\n`;
      content += `Timezone: ${visit.timezone}\n`;
      content += `Referrer: ${visit.referrer}\n`;
      content += `Page: ${visit.page}\n`;
      content += `URL: ${visit.fullUrl || visit.page}\n`;
      content += '-'.repeat(80) + '\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kohVisitors_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📥 kohVisitors file downloaded!');
    return `Downloaded ${visitors.length} visitors`;
  };
  
  // View all visitors in console
  window.viewKohVisitors = function() {
    const visitors = JSON.parse(localStorage.getItem('kohVisitors') || '[]');
    console.clear();
    console.log('═'.repeat(80));
    console.log('KOH VISITORS LOG');
    console.log(`Total: ${visitors.length} visitors`);
    console.log('═'.repeat(80));
    console.table(visitors);
    return visitors;
  };
  
  // Keyboard shortcut (Ctrl+Shift+V)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
      downloadKohVisitors();
    }
  });

  // Track on page load
  console.log('🚀 Initializing visitor tracking...');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisitor);
  } else {
    trackVisitor();
  }
  
  console.log('💡 TIP: Type downloadKohVisitors() in console to download visitor log');
  console.log('💡 TIP: Type viewKohVisitors() to view all visitors in a table');
})();
