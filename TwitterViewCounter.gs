/**
 * Twitter View Counter for Google Sheets
 * 
 * This script scans a Google Sheet for x.com (Twitter) URLs and fetches 
 * view counts using the Twitter API, then updates adjacent cells with the data.
 * 
 * @author Josh Peterson
 * @version 1.0.0
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  SHEET_NAME: 'August 2025',
  URL_COLUMN: 'D',
  VIEW_COUNT_COLUMN: 'E',
  START_ROW: 2,
  API_ENDPOINT: 'https://api.twitterapi.io/twitter/tweets',
  API_KEY: 'API_KEY',
  BATCH_SIZE: 10, // Process URLs in batches to avoid timeout
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000
};

// ==================== MAIN FUNCTION ====================
/**
 * Main function to update Twitter view counts in the spreadsheet
 * This function orchestrates the entire process
 */
function updateTwitterViewCounts() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting Twitter view count update...`);
  
  try {
    // Get the active spreadsheet and target sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);
    }
    
    // Scan for Twitter URLs and process them
    const urlData = scanForTwitterUrls(sheet);
    const results = processUrls(urlData);
    
    // Update the spreadsheet with view counts
    updateSpreadsheet(sheet, results);
    
    // Log summary
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    logSummary(results, duration);
    
  } catch (error) {
    console.error(`Fatal error in updateTwitterViewCounts: ${error.message}`);
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
  }
}

// ==================== URL SCANNING ====================
/**
 * Scans the sheet for Twitter/X.com URLs
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to scan
 * @returns {Array<{row: number, url: string}>} Array of URL data
 */
function scanForTwitterUrls(sheet) {
  console.log(`Scanning column ${CONFIG.URL_COLUMN} for Twitter URLs...`);
  
  // Get the last row with data
  const lastRow = sheet.getLastRow();
  if (lastRow < CONFIG.START_ROW) {
    console.log('No data rows found');
    return [];
  }
  
  // Get the range of URLs
  const range = sheet.getRange(
    CONFIG.START_ROW, 
    columnLetterToNumber(CONFIG.URL_COLUMN), 
    lastRow - CONFIG.START_ROW + 1, 
    1
  );
  const values = range.getValues();
  
  // Extract URLs with row numbers
  const urlData = [];
  for (let i = 0; i < values.length; i++) {
    const cellValue = values[i][0];
    if (cellValue && isTwitterUrl(cellValue)) {
      urlData.push({
        row: CONFIG.START_ROW + i,
        url: cellValue.toString().trim()
      });
    }
  }
  
  console.log(`Found ${urlData.length} Twitter URLs`);
  return urlData;
}

/**
 * Checks if a URL is a Twitter/X.com URL
 * @param {string} url - URL to check
 * @returns {boolean} True if Twitter URL
 */
function isTwitterUrl(url) {
  const pattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//i;
  return pattern.test(url);
}

// ==================== TWEET ID EXTRACTION ====================
/**
 * Extracts tweet ID from a Twitter/X.com URL
 * @param {string} url - Twitter URL
 * @returns {string|null} Tweet ID or null if not found
 */
function extractTweetId(url) {
  try {
    // Pattern to match tweet URLs
    // Handles formats like:
    // https://x.com/username/status/1234567890
    // https://twitter.com/username/status/1234567890
    const pattern = /(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/i;
    const match = url.match(pattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    console.warn(`Could not extract tweet ID from URL: ${url}`);
    return null;
  } catch (error) {
    console.error(`Error extracting tweet ID from ${url}: ${error.message}`);
    return null;
  }
}

// ==================== API INTEGRATION ====================
/**
 * Fetches tweet data from the Twitter API
 * @param {string} tweetId - Tweet ID
 * @returns {Object} API response with view count
 */
function fetchTweetData(tweetId) {
  const url = `${CONFIG.API_ENDPOINT}?tweet_ids=${tweetId}`;
  const options = {
    method: 'GET',
    headers: {
      'X-API-Key': CONFIG.API_KEY
    },
    muteHttpExceptions: true
  };
  
  let lastError;
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching data for tweet ${tweetId} (attempt ${attempt}/${CONFIG.MAX_RETRIES})...`);
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      
      if (responseCode === 200) {
        const data = JSON.parse(response.getContentText());
        
        if (data.tweets && data.tweets.length > 0) {
          const tweet = data.tweets[0];
          return {
            success: true,
            viewCount: tweet.viewCount || 0,
            tweetId: tweetId
          };
        } else {
          throw new Error('No tweet data in response');
        }
      } else if (responseCode === 429) {
        // Rate limited
        console.warn(`Rate limited for tweet ${tweetId}. Waiting...`);
        Utilities.sleep(CONFIG.RETRY_DELAY_MS * attempt);
      } else {
        throw new Error(`API returned status ${responseCode}: ${response.getContentText()}`);
      }
      
    } catch (error) {
      lastError = error;
      console.error(`Error fetching tweet ${tweetId}: ${error.message}`);
      
      if (attempt < CONFIG.MAX_RETRIES) {
        Utilities.sleep(CONFIG.RETRY_DELAY_MS);
      }
    }
  }
  
  return {
    success: false,
    error: lastError ? lastError.message : 'Unknown error',
    tweetId: tweetId
  };
}

// ==================== URL PROCESSING ====================
/**
 * Processes all URLs and fetches their view counts
 * @param {Array<{row: number, url: string}>} urlData - URLs to process
 * @returns {Array} Processing results
 */
function processUrls(urlData) {
  const results = [];
  
  for (let i = 0; i < urlData.length; i++) {
    const { row, url } = urlData[i];
    
    // Extract tweet ID
    const tweetId = extractTweetId(url);
    
    if (!tweetId) {
      results.push({
        row: row,
        success: false,
        error: 'Could not extract tweet ID',
        url: url
      });
      continue;
    }
    
    // Fetch tweet data from API
    const apiResult = fetchTweetData(tweetId);
    
    results.push({
      row: row,
      url: url,
      tweetId: tweetId,
      ...apiResult
    });
    
    // Brief pause between API calls to avoid rate limiting
    if (i < urlData.length - 1) {
      Utilities.sleep(100);
    }
  }
  
  return results;
}

// ==================== SPREADSHEET UPDATE ====================
/**
 * Updates the spreadsheet with view counts
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet
 * @param {Array} results - Processing results
 */
function updateSpreadsheet(sheet, results) {
  console.log('Updating spreadsheet with view counts...');
  
  const updates = [];
  const viewCountColumn = columnLetterToNumber(CONFIG.VIEW_COUNT_COLUMN);
  
  for (const result of results) {
    if (result.success) {
      updates.push({
        row: result.row,
        column: viewCountColumn,
        value: result.viewCount
      });
    }
  }
  
  // Batch update for efficiency
  if (updates.length > 0) {
    for (const update of updates) {
      const cell = sheet.getRange(update.row, update.column);
      cell.setValue(update.value);
      cell.setNumberFormat('#,##0'); // Format as number with thousands separator
    }
    
    console.log(`Updated ${updates.length} cells with view counts`);
  }
}

// ==================== UTILITY FUNCTIONS ====================
/**
 * Converts column letter to number (A=1, B=2, etc.)
 * @param {string} letter - Column letter
 * @returns {number} Column number
 */
function columnLetterToNumber(letter) {
  let column = 0;
  for (let i = 0; i < letter.length; i++) {
    column = column * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return column;
}

/**
 * Logs a summary of the processing results
 * @param {Array} results - Processing results
 * @param {number} duration - Execution duration in seconds
 */
function logSummary(results, duration) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const summary = `
========================================
Twitter View Count Update Summary
========================================
Total URLs processed: ${results.length}
Successful: ${successful}
Failed: ${failed}
Duration: ${duration.toFixed(2)} seconds
========================================`;
  
  console.log(summary);
  
  // Log failures for debugging
  if (failed > 0) {
    console.log('\nFailed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`Row ${r.row}: ${r.url} - Error: ${r.error}`);
    });
  }
}

// ==================== MENU INTEGRATION ====================
/**
 * Creates a custom menu when the spreadsheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Twitter Tools')
    .addItem('Update View Counts', 'updateTwitterViewCounts')
    .addItem('Update View Counts (Selected Range)', 'updateSelectedRange')
    .addSeparator()
    .addItem('Settings', 'showSettings')
    .addToUi();
}

/**
 * Updates view counts for selected range only
 */
function updateSelectedRange() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  
  if (!range) {
    SpreadsheetApp.getUi().alert('Please select a range containing Twitter URLs');
    return;
  }
  
  // Process selected range
  const values = range.getValues();
  const urlData = [];
  
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      const cellValue = values[i][j];
      if (cellValue && isTwitterUrl(cellValue)) {
        urlData.push({
          row: range.getRow() + i,
          url: cellValue.toString().trim()
        });
      }
    }
  }
  
  if (urlData.length === 0) {
    SpreadsheetApp.getUi().alert('No Twitter URLs found in selection');
    return;
  }
  
  const results = processUrls(urlData);
  updateSpreadsheet(sheet, results);
  
  SpreadsheetApp.getUi().alert(`Processed ${results.length} URLs`);
}

/**
 * Shows settings dialog (placeholder for future enhancement)
 */
function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <div style="padding: 20px;">
      <h3>Twitter View Counter Settings</h3>
      <p>Current configuration:</p>
      <ul>
        <li>Sheet: ${CONFIG.SHEET_NAME}</li>
        <li>URL Column: ${CONFIG.URL_COLUMN}</li>
        <li>View Count Column: ${CONFIG.VIEW_COUNT_COLUMN}</li>
        <li>Start Row: ${CONFIG.START_ROW}</li>
      </ul>
      <p style="color: #666; font-size: 12px;">
        To change settings, edit the CONFIG object in the script.
      </p>
    </div>
  `)
  .setWidth(400)
  .setHeight(300);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
