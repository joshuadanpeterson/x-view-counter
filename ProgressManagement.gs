/**
 * Progress management functions for Twitter View Counter
 * Functions to track and manage processing progress
 */

/**
 * Clears the saved progress and starts fresh
 */
function clearProgress() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('LAST_PROCESSED_ROW');
  scriptProperties.deleteProperty('RESUME_INDEX');
  console.log('Progress cleared. Next execution will start from the beginning.');
  SpreadsheetApp.getUi().alert('Progress cleared. Next execution will start from the beginning.');
}

/**
 * Continues processing from where the last execution left off
 */
function continueProcessing() {
  updateTwitterViewCounts();
}

/**
 * Continues processing Sept 2025 from where the last execution left off
 */
function continueSeptProcessing() {
  updateSept2025ViewCounts();
}

/**
 * Clears the saved progress for Sept 2025
 */
function clearSeptProgress() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('SEPT_LAST_PROCESSED_ROW');
  console.log('Sept 2025 progress cleared. Next execution will start from the beginning.');
  SpreadsheetApp.getUi().alert('Sept 2025 progress cleared. Next execution will start from the beginning.');
}

/**
 * Gets the current processing status for Sept 2025
 */
function getSeptProcessingStatus() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const lastProcessedRow = scriptProperties.getProperty('SEPT_LAST_PROCESSED_ROW');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sept 2025');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Sept 2025 sheet not found!');
    return;
  }
  
  const SEPT_CONFIG = {
    ...CONFIG,
    SHEET_NAME: 'Sept 2025',
    URL_COLUMN: 'D',
    VIEW_COUNT_COLUMN: 'E',
    START_ROW: 2
  };
  
  const allUrls = scanForTwitterUrlsInSheet(sheet, SEPT_CONFIG);
  
  if (!lastProcessedRow) {
    SpreadsheetApp.getUi().alert(`Sept 2025: No saved progress. Total URLs to process: ${allUrls.length}`);
  } else {
    const remaining = allUrls.filter(item => item.row > parseInt(lastProcessedRow)).length;
    SpreadsheetApp.getUi().alert(
      `Sept 2025 Status:\n` +
      `Last processed row: ${lastProcessedRow}\n` +
      `Remaining URLs: ${remaining} of ${allUrls.length}\n` +
      `Progress: ${Math.round(((allUrls.length - remaining) / allUrls.length) * 100)}%`
    );
  }
}

/**
 * Gets the current processing status
 */
function getProcessingStatus() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const lastProcessedRow = scriptProperties.getProperty('LAST_PROCESSED_ROW');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const allUrls = scanForTwitterUrls(sheet);
  
  if (!lastProcessedRow) {
    SpreadsheetApp.getUi().alert(`No saved progress. Total URLs to process: ${allUrls.length}`);
  } else {
    const remaining = allUrls.filter(item => item.row > parseInt(lastProcessedRow)).length;
    SpreadsheetApp.getUi().alert(
      `Last processed row: ${lastProcessedRow}\n` +
      `Remaining URLs: ${remaining} of ${allUrls.length}\n` +
      `Progress: ${Math.round(((allUrls.length - remaining) / allUrls.length) * 100)}%`
    );
  }
}
