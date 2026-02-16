// Kinetic Signup Webhook — Google Apps Script
// Deploy as Web App (Anyone can access, Execute as: admin@kineticfam.com)
//
// When someone submits their email on kineticfam.com, this script:
// 1. Receives the POST request with their email
// 2. Sends them the branded onboarding email from admin@kineticfam.com
// 3. Logs the signup to a Google Sheet for tracking

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = data.email;
    
    if (!email || email.indexOf('@') === -1) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid email'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Send onboarding email
    sendOnboardingEmail(email);
    
    // Log to sheet
    logSignup(email);
    
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

function sendOnboardingEmail(recipientEmail) {
  var subject = "You're Invited to Kinetic -- Your Family's Daily Planner";
  
  var htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">' +
    '<div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">' +
    
    // Header with logo placeholder (we'll use text-based header)
    '<div style="background:#ffffff; text-align:center; padding:30px 20px 10px;">' +
    '<h1 style="font-size:28px; color:#1565C0; margin:0;">Kinetic</h1>' +
    '<p style="font-size:13px; color:#888; margin:4px 0 0;">Designed for families on the move.</p>' +
    '<div style="height:3px; background:linear-gradient(to right, #1565C0, #FF6F00); margin:15px 40px 0;"></div>' +
    '</div>' +
    
    // Body
    '<div style="padding:30px 32px;">' +
    '<p style="font-size:18px; color:#333; margin-top:0;">Hi there!</p>' +
    
    '<p style="font-size:15px; color:#444; line-height:1.7;">You\'ve been invited to try <strong>Kinetic</strong> — a personalized daily newsletter designed to keep busy families organized and in the know.</p>' +
    
    '<p style="font-size:15px; color:#444; line-height:1.7;">Every morning, Kinetic delivers a personalized email to your inbox with:</p>' +
    
    '<ul style="font-size:15px; color:#444; line-height:2;">' +
    '<li>Your family\'s schedule for the day and upcoming weeks</li>' +
    '<li>Local weather for your area</li>' +
    '<li>Top national and local news headlines</li>' +
    '<li>Popular events happening near you</li>' +
    '<li>A daily dose of inspiration</li>' +
    '</ul>' +
    
    '<p style="font-size:15px; color:#444; line-height:1.7;"><strong>The best part?</strong> Adding to your family calendar is as easy as forwarding an email or snapping a photo of a schedule on your fridge. No apps to download. No accounts to set up.</p>' +
    
    '<div style="background:#f0f7ff; border-left:4px solid #1565C0; padding:20px 24px; margin:24px 0; border-radius:0 6px 6px 0;">' +
    '<p style="font-size:16px; color:#1565C0; font-weight:bold; margin:0 0 10px;">To get started, just reply to this email with:</p>' +
    '<ol style="font-size:15px; color:#444; line-height:2; margin:0;">' +
    '<li>Your <strong>last name</strong> (e.g., "Smith")</li>' +
    '<li>Your <strong>zip code</strong> (e.g., "90210")</li>' +
    '<li>Email addresses of anyone in your family who should receive the daily newsletter</li>' +
    '</ol>' +
    '</div>' +
    
    '<p style="font-size:15px; color:#444; line-height:1.7;">That\'s it — we\'ll handle the rest and have your first Kinetic Daily in your inbox within 24 hours.</p>' +
    
    '<p style="font-size:15px; color:#444; line-height:1.7;">Welcome to the family!</p>' +
    
    '<p style="font-size:15px; color:#888; margin-top:30px;">— The Kinetic Team</p>' +
    
    '</div></div></body></html>';
  
  GmailApp.sendEmail(recipientEmail, subject, '', {
    htmlBody: htmlBody,
    name: 'Kinetic',
    replyTo: 'admin@kineticfam.com'
  });
}

function logSignup(email) {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) return;
  
  try {
    var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    sheet.appendRow([new Date(), email, 'website']);
  } catch(err) {
    Logger.log('Sheet logging error: ' + err);
  }
}
