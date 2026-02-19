// Kinetic Signup Webhook — Google Apps Script
// Deploy as Web App (Anyone can access, Execute as: admin@kineticfam.com)
//
// When someone submits the signup form on kineticfam.com, this script:
// 1. Receives the POST with email, lastName, zipCode
// 2. Sends a notification email to admin@kineticfam.com (onboarding cron picks it up)
// 3. Logs the signup to a Google Sheet for tracking
//
// NOTE: The actual welcome email is sent by the onboarding cron via Postmark
// after creating the family account. This script just notifies admin.

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').trim();
    var lastName = (data.lastName || '').trim();
    var zipCode = (data.zipCode || '').trim();
    
    if (!email || email.indexOf('@') === -1) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid email'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!lastName || lastName.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid last name'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid zip code'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Send notification to admin (onboarding cron will process it)
    notifyAdmin(email, lastName, zipCode);
    
    // Log to sheet
    logSignup(email, lastName, zipCode);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle CORS preflight
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ok', message: 'Kinetic signup webhook'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function notifyAdmin(email, lastName, zipCode) {
  var subject = 'KINETIC_SIGNUP: ' + lastName;
  var body = 'New Kinetic signup from website:\n\n' +
    'Email: ' + email + '\n' +
    'Last Name: ' + lastName + '\n' +
    'Zip Code: ' + zipCode + '\n\n' +
    'Timestamp: ' + new Date().toISOString();
  
  GmailApp.sendEmail('admin@kineticfam.com', subject, body, {
    name: 'Kinetic Signup Bot'
  });
}

function logSignup(email, lastName, zipCode) {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) return;
  
  try {
    var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    sheet.appendRow([new Date(), email, lastName, zipCode, 'website']);
  } catch(err) {
    Logger.log('Sheet logging error: ' + err);
  }
}
