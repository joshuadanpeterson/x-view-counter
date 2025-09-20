/**
 * Main orchestration functions for Twitter View Counter
 * 
 * @author Josh Peterson
 * @version 1.0.0
 */

/**
 * Main function to update Twitter view counts for Sept 2025 sheet
 * Processes column D and outputs to column E
 */
function updateSept2025ViewCounts() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting Twitter view count update for Sept 2025...`);
  
  // Create a custom config for Sept 2025
  const SEPT_CONFIG = {
    ...CONFIG,
    SHEET_NAME: 'Sept 2025',
    URL_COLUMN: 'D',
    VIEW_COUNT_COLUMN: 'E',
    START_ROW: 2
  };
  
  try {
    // Get the active spreadsheet and target sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SEPT_CONFIG.SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SEPT_CONFIG.SHEET_NAME}" not found`);
    }
    
    // Check if we're resuming from a previous execution
    const scriptProperties = PropertiesService.getScriptProperties();
    const lastProcessedRow = parseInt(scriptProperties.getProperty('SEPT_LAST_PROCESSED_ROW') || '0');
    
    // Scan for Twitter URLs and process them
    const allUrlData = scanForTwitterUrlsInSheet(sheet, SEPT_CONFIG);
    
    // Filter URLs based on last processed row
    const urlData = lastProcessedRow > 0 
      ? allUrlData.filter(item => item.row > lastProcessedRow)
      : allUrlData;
    
    // Limit URLs to process in this execution
    const urlsToProcess = urlData.slice(0, SEPT_CONFIG.MAX_URLS_PER_EXECUTION);
    
    if (urlsToProcess.length === 0) {
      console.log('No URLs to process. All URLs have been processed.');
      scriptProperties.deleteProperty('SEPT_LAST_PROCESSED_ROW');
      SpreadsheetApp.getUi().alert('Sept 2025: All URLs have been processed!');
      return;
    }
    
    console.log(`Sept 2025: Processing ${urlsToProcess.length} of ${urlData.length} remaining URLs...`);
    if (urlData.length > SEPT_CONFIG.MAX_URLS_PER_EXECUTION) {
      console.log(`Will process remaining ${urlData.length - SEPT_CONFIG.MAX_URLS_PER_EXECUTION} URLs in next execution.`);
    }
    
    const results = processUrls(urlsToProcess);
    
    // Update the spreadsheet with view counts
    updateSpreadsheetWithConfig(sheet, results, SEPT_CONFIG);
    
    // Save progress
    if (urlsToProcess.length > 0) {
      const lastRow = Math.max(...urlsToProcess.map(u => u.row));
      scriptProperties.setProperty('SEPT_LAST_PROCESSED_ROW', lastRow.toString());
      
      if (urlData.length > SEPT_CONFIG.MAX_URLS_PER_EXECUTION) {
        console.log(`Progress saved. Last processed row: ${lastRow}`);
        console.log('Run the script again to continue processing remaining URLs.');
        SpreadsheetApp.getUi().alert(
          `Sept 2025: Processed ${urlsToProcess.length} URLs.\n` +
          `${urlData.length - SEPT_CONFIG.MAX_URLS_PER_EXECUTION} URLs remaining.\n` +
          `Use "Continue Sept Processing" to continue.`
        );
      } else {
        // All URLs processed, clear the progress
        scriptProperties.deleteProperty('SEPT_LAST_PROCESSED_ROW');
        SpreadsheetApp.getUi().alert(`Sept 2025: Successfully processed all ${urlsToProcess.length} URLs!`);
      }
    }
    
    // Log summary
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    logSummary(results, duration);
    
  } catch (error) {
    console.error(`Fatal error in updateSept2025ViewCounts: ${error.message}`);
    SpreadsheetApp.getUi().alert(`Error processing Sept 2025: ${error.message}`);
  }
}

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
    
    // Check if we're resuming from a previous execution
    const scriptProperties = PropertiesService.getScriptProperties();
    const lastProcessedRow = parseInt(scriptProperties.getProperty('LAST_PROCESSED_ROW') || '0');
    
    // Scan for Twitter URLs and process them
    const allUrlData = scanForTwitterUrls(sheet);
    
    // Filter URLs based on last processed row
    const urlData = lastProcessedRow > 0 
      ? allUrlData.filter(item => item.row > lastProcessedRow)
      : allUrlData;
    
    // Limit URLs to process in this execution
    const urlsToProcess = urlData.slice(0, CONFIG.MAX_URLS_PER_EXECUTION);
    
    if (urlsToProcess.length === 0) {
      console.log('No URLs to process. All URLs have been processed.');
      scriptProperties.deleteProperty('LAST_PROCESSED_ROW');
      return;
    }
    
    console.log(`Processing ${urlsToProcess.length} of ${urlData.length} remaining URLs...`);
    if (urlData.length > CONFIG.MAX_URLS_PER_EXECUTION) {
      console.log(`Will process remaining ${urlData.length - CONFIG.MAX_URLS_PER_EXECUTION} URLs in next execution.`);
    }
    
    const results = processUrls(urlsToProcess);
    
    // Update the spreadsheet with view counts
    updateSpreadsheet(sheet, results);
    
    // Save progress
    if (urlsToProcess.length > 0) {
      const lastRow = Math.max(...urlsToProcess.map(u => u.row));
      scriptProperties.setProperty('LAST_PROCESSED_ROW', lastRow.toString());
      
      if (urlData.length > CONFIG.MAX_URLS_PER_EXECUTION) {
        console.log(`Progress saved. Last processed row: ${lastRow}`);
        console.log('Run the script again to continue processing remaining URLs.');
      } else {
        // All URLs processed, clear the progress
        scriptProperties.deleteProperty('LAST_PROCESSED_ROW');
      }
    }
    
    // Log summary
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    logSummary(results, duration);
    
  } catch (error) {
    console.error(`Fatal error in updateTwitterViewCounts: ${error.message}`);
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
  }
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
