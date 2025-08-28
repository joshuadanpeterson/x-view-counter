# X/Twitter View Counter for Google Sheets

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
3. API key from TwitterAPI.io (free to sign up - see instructions below)

### Getting an API Key from TwitterAPI.io

1. **Sign up for a free account**
   - Visit [TwitterAPI.io](https://twitterapi.io)
   - Click "Get Started" or "Sign Up"
   - Create your account (no Twitter developer account needed!)
   - Copy your API key from the dashboard

2. **Why TwitterAPI.io?**
   - ✅ **No Twitter approval needed** - Start immediately
   - ✅ **Simple pricing** - $0.15 per 1,000 tweets fetched
   - ✅ **Real-time data** - Always up-to-date view counts
   - ✅ **High performance** - 1000+ requests per second
   - ✅ **Developer-friendly** - RESTful API with clear documentation

### Installation

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/joshuadanpeterson/x-view-counter.git
   ```

2. **Install dependencies** (for local development)
   ```bash
   npm install
   ```

3. **Deploy to Google Apps Script**
   ```bash
   clasp push
   ```

4. **Configure API Key in Google Apps Script** (IMPORTANT!)
   - Open the Apps Script editor:
     ```bash
     npx clasp open
     ```
   - In the Apps Script editor:
     - Click the **gear icon** (Project Settings) in the left sidebar
     - Scroll down to **Script properties**
     - Click **Add script property**
     - Enter:
       - **Property**: `TWITTER_API_KEY`
       - **Value**: Your API key from TwitterAPI.io
     - Click **Save script properties**

5. **Open your Google Sheet**
   - The script will automatically create a "Twitter Tools" menu
   - The API key is now securely stored and will be used automatically

## Configuration

### Customizable Settings

The script is **fully customizable** to match your spreadsheet layout! Edit the `CONFIG` object in `Config.gs` to match your specific needs:

```javascript
const CONFIG = {
  SHEET_NAME: 'August 2025',        // Change to YOUR sheet name (e.g., 'Data', 'Tweets', etc.)
  URL_COLUMN: 'D',                  // Change to YOUR column with URLs (e.g., 'A', 'B', 'F', etc.)
  VIEW_COUNT_COLUMN: 'E',            // Change to YOUR desired output column (e.g., 'B', 'G', etc.)
  START_ROW: 2,                      // Change if your data starts on a different row
  API_ENDPOINT: 'https://api.twitterapi.io/twitter/tweets',
  API_KEY: 'API_KEY',     // Placeholder - actual key stored in Script Properties
  BATCH_SIZE: 10,                   // URLs to process in each batch
  MAX_RETRIES: 3,                   // Retry attempts for failed requests
  RETRY_DELAY_MS: 1000              // Delay between retries
};
```

### Example Configurations

**Example 1: URLs in column A, view counts in column B**
```javascript
SHEET_NAME: 'Twitter Data',
URL_COLUMN: 'A',
VIEW_COUNT_COLUMN: 'B',
```

**Example 2: URLs in column F, view counts in column G, starting from row 5**
```javascript
SHEET_NAME: 'Social Media',
URL_COLUMN: 'F',
VIEW_COUNT_COLUMN: 'G',
START_ROW: 5,
```

**Note:** The current default values (`August 2025`, column `D`, column `E`) are just examples - adapt them to your spreadsheet!

## Usage

### Method 1: Menu Interface

1. Open your Google Sheet
2. Click on **Twitter Tools** in the menu bar
3. Select **Update View Counts** to process URLs in your configured column
4. Or select specific cells and choose **Update View Counts (Selected Range)**

**Note:** The script will process the sheet and columns you've configured in `Config.gs`

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
x-view-counter/
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

### API Key Security Best Practices

**Never hardcode API keys in your code!** This script uses Google Apps Script's secure Script Properties:

```javascript
// How the script retrieves the API key securely:
function getApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('TWITTER_API_KEY');
  
  if (!apiKey) {
    console.warn('API key not found in Script Properties.');
    // Falls back to placeholder - won't work without proper setup
    return CONFIG.API_KEY;
  }
  
  return apiKey;
}
```

### Benefits of Script Properties:
- ✅ **Not visible in code** - API keys stay private
- ✅ **Not in version control** - Safe from Git exposure
- ✅ **Easy to update** - Change keys without editing code
- ✅ **Access controlled** - Only script editors can view
- ✅ **Environment-specific** - Different keys for dev/prod

### Required Permissions

The script requires these permissions:
- **Google Sheets** - Read/write spreadsheet data
- **External Requests** - Call TwitterAPI.io endpoints
- **Script Properties** - Retrieve stored API key
- **UI Services** - Create custom menus

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
