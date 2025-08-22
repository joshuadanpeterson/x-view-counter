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

## Architecture

### Execution Flow

The script follows this high-level flow:

1. **`updateTwitterViewCounts()`** - Main orchestrator function
   - Retrieves the target sheet from `CONFIG.SHEET_NAME`
   - Initiates URL scanning process
   - Coordinates batch processing
   - Handles error aggregation and reporting

2. **`scanForTwitterUrls(sheet)`** - URL discovery
   - Reads column specified in `CONFIG.URL_COLUMN`
   - Validates URLs against Twitter/X.com patterns
   - Returns array of `{row, url}` objects for processing

3. **`extractTweetId(url)`** - Tweet ID extraction
   - Parses various Twitter URL formats (twitter.com, x.com)
   - Extracts numeric tweet ID from `/status/` path
   - Returns null for invalid formats

4. **`fetchTweetData(tweetId)`** - API integration
   - Constructs API request with authentication headers
   - Implements retry logic with exponential backoff
   - Handles rate limiting (429 responses)
   - Returns `{success, viewCount, tweetId}` or error object

5. **`updateSpreadsheet(sheet, results)`** - Data persistence
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

The `CONFIG` object in `TwitterViewCounter.gs` controls all script behavior:

```javascript
const CONFIG = {
  SHEET_NAME: 'August 2025',        // Exact name of target sheet
  URL_COLUMN: 'D',                  // Column containing Twitter URLs (A, B, C, etc.)
  VIEW_COUNT_COLUMN: 'E',           // Column for view count output
  START_ROW: 2,                      // First data row (typically 2 to skip headers)
  API_ENDPOINT: 'https://api.twitterapi.io/twitter/tweets',
  API_KEY: 'API_KEY',  // Consider moving to Script Properties
  BATCH_SIZE: 10,                   // URLs processed per batch (tune for performance)
  MAX_RETRIES: 3,                   // Retry attempts for failed API calls
  RETRY_DELAY_MS: 1000             // Base delay between retries (multiplied on each attempt)
};
```

### Performance Tuning

- **`BATCH_SIZE`**: Increase for faster processing, decrease if hitting timeout limits
- **`MAX_RETRIES`**: Balance between reliability and execution time
- **`RETRY_DELAY_MS`**: Adjust based on API rate limit behavior

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
- Exponential backoff (delay increases with each retry)
- 100ms pause between API calls
- Batch processing to minimize total requests

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
- API key is embedded in code (migration to Script Properties recommended)
- View counts are formatted with thousand separators automatically
- Failed URLs are logged but don't interrupt processing
- The script supports both twitter.com and x.com URL formats
