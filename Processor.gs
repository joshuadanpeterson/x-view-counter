/**
 * URL processing functions for Twitter View Counter
 * Handles batch processing with rate limit awareness
 */

/**
 * Processes URLs in batches with rate limit awareness
 * @param {Array<{row: number, url: string}>} urlData - URLs to process
 * @returns {Array} Processing results
 */
function processUrls(urlData) {
  const results = [];
  const rateLimitState = {
    consecutiveRateLimits: 0,
    cooldownUntil: null
  };
  
  // Process in batches to manage rate limits and execution time
  const totalBatches = Math.ceil(urlData.length / CONFIG.BATCH_SIZE);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * CONFIG.BATCH_SIZE;
    const end = Math.min(start + CONFIG.BATCH_SIZE, urlData.length);
    const batch = urlData.slice(start, end);
    
    console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (URLs ${start + 1}-${end} of ${urlData.length})`);
    
    for (let i = 0; i < batch.length; i++) {
      const { row, url } = batch[i];
      
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
      
      // Fetch tweet data from API with rate limit state
      const apiResult = fetchTweetData(tweetId, rateLimitState);
      
      results.push({
        row: row,
        url: url,
        tweetId: tweetId,
        ...apiResult
      });
      
      // Adaptive delay between API calls
      if (i < batch.length - 1) {
        // Always use the configured delay to prevent rate limiting
        Utilities.sleep(CONFIG.API_CALL_DELAY_MS);
      }
      
      // Check if we should abort due to excessive rate limiting
      if (rateLimitState.consecutiveRateLimits >= 3) {
        console.error('Rate limiting detected. Stopping to prevent further issues.');
        // Save progress and stop
        const scriptProperties = PropertiesService.getScriptProperties();
        if (batch[i].row) {
          scriptProperties.setProperty('LAST_PROCESSED_ROW', batch[i].row.toString());
        }
        
        // Add remaining URLs as skipped
        for (let j = i + 1; j < batch.length; j++) {
          results.push({
            row: batch[j].row,
            url: batch[j].url,
            success: false,
            error: 'Skipped - will retry in next execution',
            rateLimited: true
          });
        }
        
        // Add remaining batches as skipped
        for (let k = batchIndex + 1; k < totalBatches; k++) {
          const remainingStart = k * CONFIG.BATCH_SIZE;
          const remainingEnd = Math.min(remainingStart + CONFIG.BATCH_SIZE, urlData.length);
          for (let l = remainingStart; l < remainingEnd; l++) {
            results.push({
              row: urlData[l].row,
              url: urlData[l].url,
              success: false,
              error: 'Skipped - will retry in next execution',
              rateLimited: true
            });
          }
        }
        
        return results; // Exit early
      }
    }
    
    // Pause between batches - always use longer pause to prevent rate limiting
    if (batchIndex < totalBatches - 1) {
      const pauseTime = 2000; // Always 2 seconds between batches
      console.log(`Pausing ${pauseTime/1000}s between batches...`);
      Utilities.sleep(pauseTime);
    }
  }
  
  return results;
}

/**
 * Processes URLs with resume capability for large datasets
 * @param {Array<{row: number, url: string}>} urlData - URLs to process
 * @param {number} startIndex - Index to start processing from (for resume)
 * @returns {Array} Processing results
 */
function processUrlsWithResume(urlData, startIndex = 0) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const resumeIndex = startIndex || parseInt(scriptProperties.getProperty('RESUME_INDEX') || '0');
  
  if (resumeIndex > 0) {
    console.log(`Resuming from index ${resumeIndex}`);
  }
  
  const results = [];
  const rateLimitState = {
    consecutiveRateLimits: 0,
    cooldownUntil: null
  };
  
  try {
    for (let i = resumeIndex; i < urlData.length; i++) {
      const { row, url } = urlData[i];
      
      // Save progress periodically
      if (i % 10 === 0) {
        scriptProperties.setProperty('RESUME_INDEX', i.toString());
      }
      
      // Process URL (same logic as before)
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
      
      const apiResult = fetchTweetData(tweetId, rateLimitState);
      
      results.push({
        row: row,
        url: url,
        tweetId: tweetId,
        ...apiResult
      });
      
      // Adaptive delay
      if (i < urlData.length - 1) {
        const delay = rateLimitState.consecutiveRateLimits > 0 
          ? CONFIG.API_CALL_DELAY_MS * 2 
          : CONFIG.API_CALL_DELAY_MS;
        Utilities.sleep(delay);
      }
    }
    
    // Clear resume index on successful completion
    scriptProperties.deleteProperty('RESUME_INDEX');
    
  } catch (error) {
    console.error(`Processing interrupted at index ${results.length}: ${error.message}`);
    // Resume index is already saved
  }
  
  return results;
}
