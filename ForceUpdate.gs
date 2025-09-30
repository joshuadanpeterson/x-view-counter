/**
 * Force update functions for Twitter View Counter
 * Functions to update ALL Twitter URLs regardless of existing values
 * 
 * @author Josh Peterson
 * @version 1.0.0
 */

/**
 * Force updates ALL Twitter view counts in Sept 2025 sheet
 * This will overwrite any existing values in column E
 */
function forceUpdateSept2025ViewCounts() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting FORCE update for Sept 2025...`);
  
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
    
    // Clear any saved progress to start fresh
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteProperty('SEPT_LAST_PROCESSED_ROW');
    
    // Scan for ALL Twitter URLs (no filtering)
    const allUrlData = scanForTwitterUrlsInSheet(sheet, SEPT_CONFIG);
    
    console.log(`FORCE UPDATE: Found ${allUrlData.length} Twitter URLs to process`);
    
    // Process in batches
    const urlsToProcess = allUrlData.slice(0, SEPT_CONFIG.MAX_URLS_PER_EXECUTION);
    
    if (urlsToProcess.length === 0) {
      console.log('No URLs found to process.');
      SpreadsheetApp.getUi().alert('Sept 2025: No Twitter URLs found in column D');
      return;
    }
    
    console.log(`FORCE UPDATE: Processing ${urlsToProcess.length} of ${allUrlData.length} URLs...`);
    
    const results = processUrls(urlsToProcess);
    
    // Update the spreadsheet with view counts (this will overwrite existing values)
    updateSpreadsheetWithConfig(sheet, results, SEPT_CONFIG);
    
    // Save progress if there are more URLs to process
    if (allUrlData.length > SEPT_CONFIG.MAX_URLS_PER_EXECUTION) {
      const lastRow = Math.max(...urlsToProcess.map(u => u.row));
      scriptProperties.setProperty('SEPT_LAST_PROCESSED_ROW', lastRow.toString());
      
      console.log(`Progress saved. Last processed row: ${lastRow}`);
      SpreadsheetApp.getUi().alert(
        `Sept 2025 FORCE UPDATE:\n` +
        `Processed ${urlsToProcess.length} URLs.\n` +
        `${allUrlData.length - SEPT_CONFIG.MAX_URLS_PER_EXECUTION} URLs remaining.\n` +
        `Use "Continue Sept Force Update" to continue.`
      );
    } else {
      SpreadsheetApp.getUi().alert(`Sept 2025: Successfully force updated all ${urlsToProcess.length} URLs!`);
    }
    
    // Log summary
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    logSummary(results, duration);
    
  } catch (error) {
    console.error(`Fatal error in forceUpdateSept2025ViewCounts: ${error.message}`);
    SpreadsheetApp.getUi().alert(`Error during force update: ${error.message}`);
  }
}

/**
 * Force updates ALL Twitter view counts in August 2025 sheet
 * This will overwrite any existing values in column E
 */
function forceUpdateAugust2025ViewCounts() {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting FORCE update for August 2025...`);
  
  try {
    // Get the active spreadsheet and target sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);
    }
    
    // Clear any saved progress to start fresh
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteProperty('LAST_PROCESSED_ROW');
    
    // Scan for ALL Twitter URLs (no filtering)
    const allUrlData = scanForTwitterUrls(sheet);
    
    console.log(`FORCE UPDATE: Found ${allUrlData.length} Twitter URLs to process`);
    
    // Process in batches
    const urlsToProcess = allUrlData.slice(0, CONFIG.MAX_URLS_PER_EXECUTION);
    
    if (urlsToProcess.length === 0) {
      console.log('No URLs found to process.');
      SpreadsheetApp.getUi().alert('August 2025: No Twitter URLs found in column D');
      return;
    }
    
    console.log(`FORCE UPDATE: Processing ${urlsToProcess.length} of ${allUrlData.length} URLs...`);
    
    const results = processUrls(urlsToProcess);
    
    // Update the spreadsheet with view counts (this will overwrite existing values)
    updateSpreadsheet(sheet, results);
    
    // Save progress if there are more URLs to process
    if (allUrlData.length > CONFIG.MAX_URLS_PER_EXECUTION) {
      const lastRow = Math.max(...urlsToProcess.map(u => u.row));
      scriptProperties.setProperty('LAST_PROCESSED_ROW', lastRow.toString());
      
      console.log(`Progress saved. Last processed row: ${lastRow}`);
      SpreadsheetApp.getUi().alert(
        `August 2025 FORCE UPDATE:\n` +
        `Processed ${urlsToProcess.length} URLs.\n` +
        `${allUrlData.length - CONFIG.MAX_URLS_PER_EXECUTION} URLs remaining.\n` +
        `Use "Continue August Force Update" to continue.`
      );
    } else {
      SpreadsheetApp.getUi().alert(`August 2025: Successfully force updated all ${urlsToProcess.length} URLs!`);
    }
    
    // Log summary
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    logSummary(results, duration);
    
  } catch (error) {
    console.error(`Fatal error in forceUpdateAugust2025ViewCounts: ${error.message}`);
    SpreadsheetApp.getUi().alert(`Error during force update: ${error.message}`);
  }
}

/**
 * Continue force update for Sept 2025
 */
function continueSeptForceUpdate() {
  forceUpdateSept2025ViewCounts();
}

/**
 * Continue force update for August 2025
 */
function continueAugustForceUpdate() {
  forceUpdateAugust2025ViewCounts();
}