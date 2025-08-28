/**
 * Utility functions for Twitter View Counter
 * Helper functions used across modules
 */

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
  const rateLimited = results.filter(r => r.rateLimited).length;
  
  const summary = `
========================================
Twitter View Count Update Summary
========================================
Total URLs processed: ${results.length}
Successful: ${successful}
Failed: ${failed}
Rate Limited: ${rateLimited}
Duration: ${duration.toFixed(2)} seconds
Avg time per URL: ${(duration / results.length).toFixed(2)} seconds
========================================`;
  
  console.log(summary);
  
  // Log failures for debugging
  if (failed > 0) {
    console.log('\nFailed URLs:');
    const failures = results.filter(r => !r.success);
    
    // Group failures by error type
    const errorGroups = {};
    failures.forEach(r => {
      const errorKey = r.error || 'Unknown error';
      if (!errorGroups[errorKey]) {
        errorGroups[errorKey] = [];
      }
      errorGroups[errorKey].push(r);
    });
    
    // Log grouped errors
    Object.keys(errorGroups).forEach(errorType => {
      console.log(`\n  ${errorType} (${errorGroups[errorType].length} URLs):`);
      errorGroups[errorType].slice(0, 5).forEach(r => {
        console.log(`    Row ${r.row}: ${r.url}`);
      });
      if (errorGroups[errorType].length > 5) {
        console.log(`    ... and ${errorGroups[errorType].length - 5} more`);
      }
    });
  }
  
  // Provide recommendations based on results
  if (rateLimited > 0) {
    console.log('\n⚠️ Rate Limiting Detected:');
    console.log('Consider reducing BATCH_SIZE or increasing API_CALL_DELAY_MS in CONFIG.');
  }
  
  if (duration > 300) { // More than 5 minutes
    console.log('\n⏰ Long Execution Time:');
    console.log('Consider processing URLs in smaller batches or using time-based triggers.');
  }
}
