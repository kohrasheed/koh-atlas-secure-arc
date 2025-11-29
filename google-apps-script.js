// Google Apps Script for Koh Visitors Logging
// This script receives visitor data and logs it to a Google Sheet

function doPost(e) {
  try {
    // Parse the incoming visitor data
    var data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    // REPLACE THIS with your Google Sheet ID after you create it
    var SHEET_ID = '1sdV2jnT0Rrf20ErGd82V4KCLC15Ffd5lIOLdo7_riW0';
    
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName('Visitors');
    
    // Create the Visitors sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Visitors');
      // Add headers
      sheet.appendRow([
        'Timestamp',
        'IP Address',
        'Country',
        'Region', 
        'City',
        'Latitude',
        'Longitude',
        'Organization',
        'User Agent',
        'Page',
        'Referrer',
        'Language',
        'Screen',
        'Timezone'
      ]);
      
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 14);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#667eea');
      headerRange.setFontColor('#ffffff');
      
      // Freeze header row
      sheet.setFrozenRows(1);
    }
    
    // Append the visitor data
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.ip || 'Unknown',
      data.country || 'Unknown',
      data.region || 'Unknown',
      data.city || 'Unknown',
      data.latitude || 0,
      data.longitude || 0,
      data.org || 'Unknown',
      data.userAgent || 'Unknown',
      data.page || '/',
      data.referrer || 'Direct',
      data.language || 'Unknown',
      data.screenResolution || 'Unknown',
      data.timezone || 'Unknown'
    ]);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 14);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Visitor logged successfully',
        totalVisitors: sheet.getLastRow() - 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput('Koh Visitors Logger is active! Use POST to log visitors.')
    .setMimeType(ContentService.MimeType.TEXT);
}
