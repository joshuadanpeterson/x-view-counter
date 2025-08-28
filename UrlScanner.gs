/**
 * URL scanning functions for Twitter View Counter
 * Functions to scan spreadsheet for Twitter URLs
 */

/**
 * Scans the sheet for Twitter/X.com URLs
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to scan
 * @returns {Array<{row: number, url: string}>} Array of URL data
 */
function scanForTwitterUrls(sheet) {
  return scanForTwitterUrlsInSheet(sheet, CONFIG);
}

/**
 * Scans the sheet for Twitter/X.com URLs with custom config
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to scan
 * @param {Object} config - Configuration object
 * @returns {Array<{row: number, url: string}>} Array of URL data
 */
function scanForTwitterUrlsInSheet(sheet, config) {
  console.log(`Scanning column ${config.URL_COLUMN} for Twitter URLs...`);
  
  // Get the last row with data
  const lastRow = sheet.getLastRow();
  if (lastRow < config.START_ROW) {
    console.log('No data rows found');
    return [];
  }
  
  // Get the range of URLs
  const range = sheet.getRange(
    config.START_ROW, 
    columnLetterToNumber(config.URL_COLUMN), 
    lastRow - config.START_ROW + 1, 
    1
  );
  const values = range.getValues();
  
  // Extract URLs with row numbers
  const urlData = [];
  for (let i = 0; i < values.length; i++) {
    const cellValue = values[i][0];
    if (cellValue && isTwitterUrl(cellValue)) {
      urlData.push({
        row: config.START_ROW + i,
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
