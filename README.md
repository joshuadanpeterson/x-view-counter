# Twitter View Counter for Google Sheets

A Google Apps Script that automatically fetches Twitter/X.com view counts for URLs in your Google Sheets and updates adjacent cells with the data.

## Features

- 🔍 **Automatic URL Detection**: Scans specified columns for Twitter/X.com URLs
- 📊 **View Count Fetching**: Uses Twitter API to get real-time view counts
- 🔄 **Batch Processing**: Efficiently processes multiple URLs with retry logic
- 📝 **Comprehensive Logging**: Detailed logs for debugging and monitoring
- 🎨 **Custom Menu Integration**: Easy-to-use menu items in Google Sheets
- ⚡ **Error Handling**: Graceful error recovery with detailed reporting
- 🔒 **Secure API Storage**: API keys stored securely in Script Properties
- 📈 **Cross-Sheet Aggregation**: Custom formula for summing data across sheets
- 🔄 **Progress Tracking**: Resume capability for interrupted executions

## Setup

### Prerequisites

1. A Google Sheets document with Twitter/X.com URLs
2. Access to Google Apps Script
3. Twitter API credentials (included in script)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/joshuadanpeterson/warp-advocacy.git
   ```

2. **Install dependencies** (for local development)
   ```bash
   npm install
   ```

3. **Deploy to Google Apps Script**
   ```bash
   clasp push
   ```

4. **Open your Google Sheet**
   - The script will automatically create a "Twitter Tools" menu

## Configuration

Edit the `CONFIG` object in `Config.gs` to customize:

```javascript
const CONFIG = {
  SHEET_NAME: 'August 2025',        // Name of the sheet to process
  URL_COLUMN: 'D',                  // Column containing Twitter URLs
  VIEW_COUNT_COLUMN: 'E',            // Column to write view counts
  START_ROW: 2,                      // First data row (skip headers)
  API_ENDPOINT: 'https://api.twitterapi.io/twitter/tweets',
  API_KEY: 'API_KEY',     // Replace with your API key
  BATCH_SIZE: 10,                   // URLs to process in each batch
  MAX_RETRIES: 3,                   // Retry attempts for failed requests
  RETRY_DELAY_MS: 1000              // Delay between retries
};
```

## Usage

### Method 1: Menu Interface

1. Open your Google Sheet
2. Click on **Twitter Tools** in the menu bar
3. Select **Update View Counts** to process all URLs in the configured column
4. Or select specific cells and choose **Update View Counts (Selected Range)**

### Method 2: Function Execution

1. Open the Script Editor (Extensions → Apps Script)
2. Select `updateTwitterViewCounts` from the function dropdown
3. Click **Run**

### Method 3: Triggers (Automation)

Set up automatic updates:

1. In Apps Script, go to **Triggers** (clock icon)
2. Add a new trigger for `updateTwitterViewCounts`
3. Choose your preferred schedule (e.g., hourly, daily)

## URL Format Support

The script supports various Twitter/X.com URL formats:

- ✅ `https://x.com/username/status/1234567890`
- ✅ `https://twitter.com/username/status/1234567890`
- ✅ `http://x.com/username/status/1234567890`
- ✅ With or without `www.`

## API Response

The script fetches the following data for each tweet:

```json
{
  "viewCount": 12345,
  "tweetId": "1234567890",
  "success": true
}
```

## Error Handling

The script includes robust error handling:

- **Retry Logic**: Automatically retries failed requests up to 3 times
- **Rate Limiting**: Handles API rate limits with exponential backoff
- **Invalid URLs**: Skips and logs URLs that don't match Twitter format
- **Missing Data**: Continues processing even if some tweets fail
- **Summary Report**: Logs detailed summary after each execution

## Logging

View logs in the Apps Script editor:

1. Open Apps Script (Extensions → Apps Script)
2. Click **Execution log** (View → Executions)
3. Click on any execution to see detailed logs

Example log output:
```
[2025-08-22T10:00:00.000Z] Starting Twitter view count update...
Scanning column D for Twitter URLs...
Found 25 Twitter URLs
Fetching data for tweet 1234567890 (attempt 1/3)...
Updated 24 cells with view counts

========================================
Twitter View Count Update Summary
========================================
Total URLs processed: 25
Successful: 24
Failed: 1
Duration: 12.34 seconds
========================================
```

## Troubleshooting

### Common Issues

1. **"Sheet not found" error**
   - Verify the sheet name in CONFIG matches exactly (case-sensitive)

2. **No URLs detected**
   - Check that URLs are in the correct column
   - Ensure URLs follow the supported format

3. **API errors**
   - Verify API key is valid
   - Check API rate limits
   - Ensure network connectivity

4. **Permission errors**
   - Grant necessary permissions when prompted
   - Ensure script has access to the spreadsheet

## Development

### Project Structure

```
warp-advocacy/
├── Config.gs               # Configuration and API key management
├── Main.gs                 # Primary orchestration functions
├── ApiClient.gs            # Twitter API interactions
├── UrlScanner.gs           # URL detection and validation
├── Processor.gs            # Batch processing logic
├── SpreadsheetUpdater.gs   # Sheet update operations
├── ProgressManagement.gs   # Progress tracking functions
├── MenuUI.gs               # User interface and menus
├── Utils.gs                # Utility functions
├── SheetSumUtilities.gs    # Cross-sheet calculations
├── .clasp.json             # Clasp configuration
├── .claspignore            # Files to ignore during push
├── .gitignore              # Git ignore file
├── package.json            # Node dependencies
├── README.md               # Documentation
├── WARP.md                 # Detailed project guide
└── IMPLEMENTATION_STATUS_LOG.md  # Development tracking
```

### Local Development

1. Make changes to the relevant `.gs` files
2. Test locally with `clasp push && clasp open`
3. View logs with `clasp logs`

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- **API Key**: Now securely stored in Script Properties (set TWITTER_API_KEY in Project Settings)
- **Permissions**: The script requires access to:
  - Google Sheets (read/write)
  - External API calls (UrlFetchApp)
  - UI interactions (custom menus)

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: Josh Peterson (@jdpeterson)

## Changelog

### Version 2.0.0 (2025-08-28)
- Major refactoring: Split monolithic code into modular files
- Added secure API key management via Script Properties
- Added cross-sheet aggregation formula (SUM_MONTH_SHEETS)
- Enhanced rate limiting and progress tracking
- Improved error handling and recovery

### Version 1.0.0 (2025-08-22)
- Initial release
- Core functionality for fetching Twitter view counts
- Custom menu integration
- Comprehensive error handling and logging

## Future Enhancements

- [ ] Support for bulk operations with progress bar
- [ ] Caching mechanism to reduce API calls
- [ ] Support for other Twitter metrics (likes, retweets)
- [ ] Configuration UI for easier setup
- [ ] Export functionality for reports
- [ ] Support for multiple sheets/columns

---

Built with ❤️ for Warp Advocacy by Josh Peterson
