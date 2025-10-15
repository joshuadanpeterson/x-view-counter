/**
 * Config and secure key retrieval for Twitter View Counter
 * - CONFIG: runtime configuration
 * - getApiKey: reads TWITTER_API_KEY from Script Properties
 */

/**
 * IMPORTANT: API Key Security
 *
 * The API key should be stored securely in Script Properties, not in code.
 * To set up the API key:
 * 1. Open Apps Script editor (clasp open or from Google Sheets)
 * 2. Go to Project Settings > Script Properties
 * 3. Add a new property:
 *    - Property name: TWITTER_API_KEY
 *    - Value: [your actual API key]
 *
 * The script will automatically retrieve the key from Script Properties.
 */
const CONFIG = {
  SHEET_NAME: 'Oct 2025',
  URL_COLUMN: 'D',
  VIEW_COUNT_COLUMN: 'E',
  START_ROW: 2,
  API_ENDPOINT: 'https://api.twitterapi.io/twitter/tweets',
  API_KEY: 'API_KEY', // This is a placeholder - actual key stored in Script Properties
  BATCH_SIZE: 5, // Reduced batch size to avoid timeout
  MAX_RETRIES: 3, // Reduced retries to save time
  INITIAL_RETRY_DELAY_MS: 2000, // Increased initial delay
  MAX_RETRY_DELAY_MS: 60000, // Maximum delay (1 minute)
  API_CALL_DELAY_MS: 1000, // Increased delay between calls (1 second)
  RATE_LIMIT_PAUSE_MS: 60000, // Longer pause when rate limited (1 minute)
  MAX_URLS_PER_EXECUTION: 20 // Limit URLs per execution to avoid timeout
};

/**
 * Get the API key from Script Properties (secure storage)
 * Falls back to CONFIG.API_KEY if not found (for development)
 * @returns {string} The API key
 */
function getApiKey() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiKey = scriptProperties.getProperty('TWITTER_API_KEY');

    if (!apiKey) {
      console.warn('API key not found in Script Properties. Please set TWITTER_API_KEY in Project Settings.');
      return CONFIG.API_KEY;
    }

    return apiKey;
  } catch (error) {
    console.error('Error retrieving API key:', error.message);
    return CONFIG.API_KEY;
  }
}

