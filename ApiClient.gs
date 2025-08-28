/**
 * API client functions for Twitter View Counter
 * Handles Twitter API interactions with rate limiting and retry logic
 */

/**
 * Calculates exponential backoff delay
 * @param {number} attempt - Current attempt number
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt) {
  const exponentialDelay = CONFIG.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter
  return Math.min(jitteredDelay, CONFIG.MAX_RETRY_DELAY_MS);
}

/**
 * Fetches tweet data from the Twitter API with enhanced rate limit handling
 * @param {string} tweetId - Tweet ID
 * @param {Object} rateLimitState - Shared rate limit state
 * @returns {Object} API response with view count
 */
function fetchTweetData(tweetId, rateLimitState = {}) {
  const url = `${CONFIG.API_ENDPOINT}?tweet_ids=${tweetId}`;
  const apiKey = getApiKey(); // Use secure API key retrieval
  
  const options = {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey
    },
    muteHttpExceptions: true
  };
  
  let lastError;
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      // Check if we're in a rate limit cooldown period
      if (rateLimitState.cooldownUntil && new Date() < rateLimitState.cooldownUntil) {
        const waitTime = rateLimitState.cooldownUntil - new Date();
        console.log(`Rate limit cooldown: waiting ${Math.round(waitTime/1000)}s...`);
        Utilities.sleep(waitTime);
      }
      
      console.log(`Fetching data for tweet ${tweetId} (attempt ${attempt}/${CONFIG.MAX_RETRIES})...`);
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      
      if (responseCode === 200) {
        const data = JSON.parse(response.getContentText());
        
        if (data.tweets && data.tweets.length > 0) {
          const tweet = data.tweets[0];
          // Reset rate limit state on success
          rateLimitState.consecutiveRateLimits = 0;
          return {
            success: true,
            viewCount: tweet.viewCount || 0,
            tweetId: tweetId
          };
        } else {
          throw new Error('No tweet data in response');
        }
      } else if (responseCode === 429) {
        // Rate limited - implement exponential backoff
        rateLimitState.consecutiveRateLimits = (rateLimitState.consecutiveRateLimits || 0) + 1;
        
        // Parse rate limit headers if available
        const headers = response.getHeaders();
        const resetTime = headers['X-RateLimit-Reset'] || headers['x-ratelimit-reset'];
        const retryAfter = headers['Retry-After'] || headers['retry-after'];
        
        let delayMs;
        if (retryAfter) {
          delayMs = parseInt(retryAfter) * 1000;
        } else if (resetTime) {
          delayMs = Math.max(0, (parseInt(resetTime) * 1000) - Date.now());
        } else {
          // Use longer delays for rate limits
          delayMs = CONFIG.INITIAL_RETRY_DELAY_MS * Math.pow(2, rateLimitState.consecutiveRateLimits);
        }
        
        // Cap the delay
        delayMs = Math.min(delayMs, CONFIG.MAX_RETRY_DELAY_MS);
        
        // Set cooldown period
        rateLimitState.cooldownUntil = new Date(Date.now() + delayMs);
        
        console.warn(`Rate limited (429) for tweet ${tweetId}. Waiting ${Math.round(delayMs/1000)}s...`);
        console.log(`Consecutive rate limits: ${rateLimitState.consecutiveRateLimits}`);
        
        // If we're getting too many rate limits, return early to save time
        if (rateLimitState.consecutiveRateLimits >= 2) {
          console.warn('Multiple rate limits detected. Skipping further retries for this tweet.');
          return {
            success: false,
            error: 'Rate limited - skipped after multiple attempts',
            tweetId: tweetId,
            rateLimited: true
          };
        }
        
        Utilities.sleep(delayMs);
      } else if (responseCode === 503) {
        // Service unavailable - retry with backoff
        const delay = calculateBackoffDelay(attempt);
        console.warn(`Service unavailable (503). Retrying in ${Math.round(delay/1000)}s...`);
        Utilities.sleep(delay);
      } else {
        throw new Error(`API returned status ${responseCode}: ${response.getContentText()}`);
      }
      
    } catch (error) {
      lastError = error;
      console.error(`Error fetching tweet ${tweetId}: ${error.message}`);
      
      if (attempt < CONFIG.MAX_RETRIES) {
        const delay = calculateBackoffDelay(attempt);
        console.log(`Retrying in ${Math.round(delay/1000)}s...`);
        Utilities.sleep(delay);
      }
    }
  }
  
  return {
    success: false,
    error: lastError ? lastError.message : 'Unknown error',
    tweetId: tweetId,
    rateLimited: rateLimitState.consecutiveRateLimits > 0
  };
}
