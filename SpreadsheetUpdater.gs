/**
 * Spreadsheet update functions for Twitter View Counter
 * Functions to update Google Sheets with view counts
 */

/**
 * Updates the spreadsheet with view counts
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet
 * @param {Array} results - Processing results
 */
function updateSpreadsheet(sheet, results) {
  updateSpreadsheetWithConfig(sheet, results, CONFIG);
}

/**
 * Updates the spreadsheet with view counts using custom config
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet
 * @param {Array} results - Processing results
 * @param {Object} config - Configuration object
 */
function updateSpreadsheetWithConfig(sheet, results, config) {
  console.log('Updating spreadsheet with view counts...');
  
  const updates = [];
  const viewCountColumn = columnLetterToNumber(config.VIEW_COUNT_COLUMN);
  
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
