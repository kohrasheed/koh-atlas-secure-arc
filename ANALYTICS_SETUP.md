# Visitor Analytics Setup Guide

## What This Does
Tracks visitors to your GitHub Pages site including:
- IP address
- Location (city, region, country)
- Visit timestamp
- Browser/device information
- Visit count per user
- Referrer source

## Setup Instructions

### Option 1: Google Sheets (Free & Easy)

1. **Create a Google Sheet**
   - Go to https://sheets.google.com
   - Create a new spreadsheet called "Website Analytics"
   - Add headers in row 1: Timestamp | IP | Country | Region | City | Latitude | Longitude | User Agent | Referrer | Page | Language | Screen | Timezone | Organization

2. **Create Google Apps Script**
   - In your sheet, go to Extensions > Apps Script
   - Delete the default code and paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.timestamp,
    data.ip,
    data.country,
    data.region,
    data.city,
    data.latitude,
    data.longitude,
    data.userAgent,
    data.referrer,
    data.page,
    data.language,
    data.screenResolution,
    data.timezone,
    data.org
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return doPost(e);
}
```

3. **Deploy the Script**
   - Click "Deploy" > "New deployment"
   - Select type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the Web app URL

4. **Update Your Analytics Script**
   - Edit `/workspaces/koh-atlas-secure-arc/public/analytics.js`
   - Replace `YOUR_SCRIPT_ID` with your actual script URL
   - Redeploy: `npm run deploy`

### Option 2: Simple Analytics Dashboard (View in Console)

For now, the analytics data is logged to the browser console. You can:
- Press F12 to open Developer Tools
- Go to Console tab
- See visitor data logged there

### Option 3: Use Third-Party Analytics (Privacy-Friendly)

Instead of building custom tracking, you can use:

**Free Options:**
- **Plausible** (https://plausible.io) - Privacy-focused, $9/month (has free trial)
- **Simple Analytics** (https://simpleanalytics.com) - Privacy-focused
- **Umami** (https://umami.is) - Open source, self-hosted or cloud
- **Counter.dev** (https://counter.dev) - Completely free

**Quick Setup with Counter.dev (5 minutes):**
1. Go to https://counter.dev
2. Add your site: `kohrasheed.github.io`
3. Copy the script tag
4. Add to your index.html before `</head>`

### Privacy Considerations

⚠️ **Important**: Tracking IPs and location data may require:
- Privacy Policy on your website
- Cookie consent (GDPR compliance if EU visitors)
- Terms of Service

Consider using privacy-friendly analytics that don't track IPs instead.

## Current Setup

Your site currently has:
✅ Analytics script installed
✅ IP geolocation API integrated (ipapi.co - 1000 requests/day free)
✅ Local visit counter
❌ Backend endpoint (needs Google Apps Script setup)

## View Your Data

Once set up, you can:
1. View live data in your Google Sheet
2. Create charts and dashboards in Google Sheets
3. Export to CSV for analysis
4. Set up email alerts for new visitors

## Testing

To test if it's working:
1. Deploy your site: `npm run deploy`
2. Visit: https://kohrasheed.github.io/koh-atlas-secure-arc/
3. Open Console (F12) - you should see "Visitor tracked: {data}"
4. Check your Google Sheet for new row (if configured)
