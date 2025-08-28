# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Google Apps Script project that fetches Twitter/X.com view counts for URLs in Google Sheets. The script scans specified columns for Twitter URLs, queries the Twitter API for view metrics, and updates adjacent cells with the data.

## Essential Commands

### Initial Setup
```bash
# Install dependencies (includes Google Apps Script type definitions)
npm install

# Authenticate with Google (first time setup)
clasp login

# Create .clasp.json to link with existing Apps Script project
clasp clone 171vCkNodak2PLvMdsRyKO0Ccf_kReQHwpqLXMnVTU9D08ZqLtbA9OUk2
```

### Development Workflow
```bash
# Push local changes to Google Apps Script
clasp push

# Pull remote changes to local
clasp pull

# Open Apps Script editor in browser
clasp open

# View execution logs (streaming)
clasp logs --watch

# Run a specific function remotely
clasp run updateTwitterViewCounts
```

### Testing & Debugging
```bash
# View recent execution logs
clasp logs

# Run function and see output
clasp run updateTwitterViewCounts --params '[]'

# Open Apps Script editor for interactive debugging
clasp open
```

## Project Structure

The script is organized into modular files for better maintainability:

### Core Files
- **`Config.gs`** - Configuration settings and API key management
  - `CONFIG` object with all runtime settings
  - `getApiKey()` for secure Script Properties retrieval

- **`Main.gs`** - Primary orchestration functions
  - `updateTwitterViewCounts()` - Main entry point for August 2025
  - `updateJuly2025ViewCounts()` - Dedicated July 2025 processor
  - `updateSelectedRange()` - Process user-selected cells

- **`ApiClient.gs`** - Twitter API interactions
  - `fetchTweetData()` - API calls with rate limiting
  - `calculateBackoffDelay()` - Exponential backoff logic

### Processing Components
- **`UrlScanner.gs`** - URL detection and parsing
  - `scanForTwitterUrls()` - Sheet scanning
  - `isTwitterUrl()` - URL validation
  - `extractTweetId()` - Tweet ID extraction

- **`Processor.gs`** - Batch processing logic
  - `processUrls()` - Main batch processor
  - `processUrlsWithResume()` - Large dataset handler

- **`SpreadsheetUpdater.gs`** - Sheet update operations
  - `updateSpreadsheet()` - Cell updates and formatting

### Support Components
- **`Utils.gs`** - Utility functions
  - `columnLetterToNumber()` - Column conversion
  - `logSummary()` - Processing reports

- **`ProgressManagement.gs`** - Progress tracking
  - Progress clearing and status functions
  - Resume capability management

- **`MenuUI.gs`** - User interface
  - `onOpen()` - Menu creation
  - `showSettings()` - Settings dialog

- **`SheetSumUtilities.gs`** - Cross-sheet calculations
  - `SUM_MONTH_SHEETS()` - Custom formula for aggregating data

## Architecture

### Execution Flow

The script follows this high-level flow:

1. **`updateTwitterViewCounts()`** (Main.gs) - Main orchestrator function
   - Retrieves the target sheet from `CONFIG.SHEET_NAME`
   - Initiates URL scanning process
   - Coordinates batch processing
   - Handles error aggregation and reporting

2. **`scanForTwitterUrls(sheet)`** (UrlScanner.gs) - URL discovery
   - Reads column specified in `CONFIG.URL_COLUMN`
   - Validates URLs against Twitter/X.com patterns
   - Returns array of `{row, url}` objects for processing

3. **`extractTweetId(url)`** (UrlScanner.gs) - Tweet ID extraction
   - Parses various Twitter URL formats (twitter.com, x.com)
   - Extracts numeric tweet ID from `/status/` path
   - Returns null for invalid formats

4. **`fetchTweetData(tweetId)`** (ApiClient.gs) - API integration
   - Constructs API request with authentication headers
   - Implements retry logic with exponential backoff
   - Handles rate limiting (429 responses)
   - Returns `{success, viewCount, tweetId}` or error object

5. **`updateSpreadsheet(sheet, results)`** (SpreadsheetUpdater.gs) - Data persistence
   - Batch updates cells in `CONFIG.VIEW_COUNT_COLUMN`
   - Applies number formatting with thousand separators
   - Preserves row associations from scan phase

### Error Handling Strategy

The script implements multi-level error handling:

- **API Level**: Retry logic with `MAX_RETRIES` attempts and exponential backoff
- **Row Level**: Individual URL failures don't halt processing of other URLs
- **Batch Level**: Processes URLs in batches to avoid timeout (6-minute execution limit)
- **Summary Level**: Comprehensive logging of all successes and failures

## Configuration

The `CONFIG` object in `Config.gs` controls all script behavior:

```javascript
const CONFIG = {
  SHEET_NAME: 'August 2025',        // Exact name of target sheet
  URL_COLUMN: 'D',                  // Column containing Twitter URLs (A, B, C, etc.)
  VIEW_COUNT_COLUMN: 'E',           // Column for view count output
  START_ROW: 2,                      // First data row (typically 2 to skip headers)
  API_ENDPOINT: 'https://api.twitterapi.io/twitter/tweets',
  API_KEY: 'API_KEY',  // Consider moving to Script Properties
  BATCH_SIZE: 10,                   // URLs processed per batch (tune for performance)
  MAX_RETRIES: 5,                   // Retry attempts for failed API calls
  INITIAL_RETRY_DELAY_MS: 1000,     // Starting delay for exponential backoff
  MAX_RETRY_DELAY_MS: 60000,        // Maximum delay between retries (1 minute)
  API_CALL_DELAY_MS: 200,           // Delay between API calls (increase if rate limited)
  RATE_LIMIT_PAUSE_MS: 30000        // Extended pause when rate limited (30 seconds)
};
```

### Performance Tuning

- **`BATCH_SIZE`**: Increase for faster processing, decrease if hitting timeout limits
- **`MAX_RETRIES`**: Number of retry attempts (5 recommended for rate limits)
- **`INITIAL_RETRY_DELAY_MS`**: Starting delay for exponential backoff
- **`MAX_RETRY_DELAY_MS`**: Maximum delay to prevent excessive waiting
- **`API_CALL_DELAY_MS`**: Base delay between calls (increase if frequently rate limited)
- **`RATE_LIMIT_PAUSE_MS`**: Extended pause after multiple rate limits

## API Integration Details

### Authentication
The script uses API key authentication via the `X-API-Key` header. For production use, store the API key in Script Properties:

```javascript
// More secure approach (recommended)
const scriptProperties = PropertiesService.getScriptProperties();
const apiKey = scriptProperties.getProperty('TWITTER_API_KEY');
```

### API Response Format
```json
{
  "tweets": [
    {
      "viewCount": 12345,
      "tweetId": "1234567890",
      // Additional fields may be present
    }
  ]
}
```

### Rate Limiting
The script handles HTTP 429 (Too Many Requests) responses with:
- Exponential backoff with jitter (randomized delays to prevent thundering herd)
- Respects API rate limit headers (Retry-After, X-RateLimit-Reset)
- Adaptive delays based on consecutive rate limits (200ms default, 400ms when limited)
- Cooldown periods shared across API calls within a batch
- Extended pause (30 seconds) after 3 consecutive rate limits
- Automatic abort after 5 consecutive rate limits to prevent quota exhaustion
- Batch processing with configurable pauses between batches
- Resume capability for large datasets using Script Properties

## Required Permissions

The script requires these OAuth scopes (defined in `appsscript.json`):

- `https://www.googleapis.com/auth/spreadsheets` - Read/write spreadsheet data
- `https://www.googleapis.com/auth/script.external_request` - Call external APIs
- `https://www.googleapis.com/auth/script.container.ui` - Create custom menus

## Debugging

### Using Apps Script Editor
1. Open with `clasp open`
2. Set breakpoints by clicking line numbers
3. Use Debug button instead of Run
4. Inspect variables in debugger panel

### Production Logging
```javascript
// Strategic logging points already in code:
console.log(`[${timestamp}] Starting Twitter view count update...`);
console.log(`Found ${urlData.length} Twitter URLs`);
console.log(`Fetching data for tweet ${tweetId} (attempt ${attempt}/${MAX_RETRIES})...`);
```

View logs:
- Real-time: `clasp logs --watch`
- Historical: Apps Script Editor → View → Executions

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Sheet not found" | Verify `CONFIG.SHEET_NAME` matches exactly (case-sensitive) |
| No URLs detected | Check `CONFIG.URL_COLUMN` setting and URL format |
| API returns 401 | Verify API key is valid and properly formatted |
| API returns 429 | Rate limited - script will auto-retry with backoff |
| Execution timeout | Reduce `BATCH_SIZE` or process fewer URLs per run |
| Permission denied | Re-authorize script when prompted |

## Deployment

### Manual Execution
1. Open target spreadsheet
2. Click "Twitter Tools" menu
3. Select "Update View Counts"

### Automated Execution (Time-based Triggers)
```javascript
// In Apps Script Editor:
// Edit → Current project's triggers → Add Trigger
// Function: updateTwitterViewCounts
// Event source: Time-driven
// Type: Hour timer / Day timer
// Time: Select interval
```

### Performance Considerations
- Script has 6-minute execution limit for triggered runs
- Process ~500-1000 URLs per execution depending on API response time
- Consider splitting large datasets across multiple sheets

## Project-Specific Notes

- The script currently processes the "August 2025" sheet by default
- API key now stored securely via Script Properties (set TWITTER_API_KEY in Project Settings)
- View counts are formatted with thousand separators automatically
- Failed URLs are logged but don't interrupt processing
- The script supports both twitter.com and x.com URL formats
- Code is modularized into separate files for better maintainability
