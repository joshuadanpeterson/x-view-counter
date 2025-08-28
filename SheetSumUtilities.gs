/**
 * Custom spreadsheet functions for summing data across multiple sheets
 * @fileoverview Utility functions for cross-sheet calculations
 */

/**
 * Sums column E for rows where column A equals `key`
 * across all sheets whose names match `pattern` (RegExp).
 * 
 * This function is designed to be used as a custom formula in Google Sheets.
 * It searches through all sheets in the spreadsheet, filters by sheet name pattern,
 * and sums values from column E where the corresponding column A value matches the key.
 *
 * @param {string|number} key - The value to match in column A
 * @param {string} pattern - Regular expression pattern to match sheet names
 * @return {number} The sum of matching values from column E
 * 
 * @customfunction
 * 
 * Example usage in a cell:
 *   =SUM_MONTH_SHEETS(B5,"(July|August|September) 2025")
 *   =SUM_MONTH_SHEETS(B5,".* 2025")   // all 2025 month sheets
 *   =SUM_MONTH_SHEETS("Twitter","August 2025")  // specific month
 */
function SUM_MONTH_SHEETS(key, pattern) {
  // Create RegExp from the pattern string
  const re = new RegExp(pattern);
  
  // Get the active spreadsheet
  const ss = SpreadsheetApp.getActive();
  
  // Initialize the total sum
  let total = 0;

  // Iterate through all sheets in the spreadsheet
  ss.getSheets().forEach(sh => {
    // Skip sheets that don't match the pattern
    if (!re.test(sh.getName())) return;
    
    // Get values from column A starting from row 6
    const aVals = sh.getRange("A6:A").getValues().flat();
    
    // Get values from column E starting from row 6
    const eVals = sh.getRange("E6:E").getValues().flat();
    
    // Iterate through the values and sum matches
    for (let i = 0; i < aVals.length; i++) {
      if (aVals[i] === key) {
        // Add the value from column E, treating non-numbers as 0
        total += Number(eVals[i]) || 0;
      }
    }
  });
  
  return total;
}
