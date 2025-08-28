/**
 * Menu and UI functions for Twitter View Counter
 * Handles Google Sheets menu creation and UI dialogs
 */

/**
 * Creates a custom menu when the spreadsheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Twitter Tools')
    .addItem('Update August 2025 (Process 20)', 'updateTwitterViewCounts')
    .addItem('Continue August Processing', 'continueProcessing')
    .addSeparator()
    .addItem('Update July 2025 (Process 20)', 'updateJuly2025ViewCounts')
    .addItem('Continue July Processing', 'continueJulyProcessing')
    .addSeparator()
    .addItem('Update Selected Range', 'updateSelectedRange')
    .addSeparator()
    .addSubMenu(ui.createMenu('Status & Progress')
      .addItem('August 2025 Status', 'getProcessingStatus')
      .addItem('July 2025 Status', 'getJulyProcessingStatus')
      .addSeparator()
      .addItem('Clear August Progress', 'clearProgress')
      .addItem('Clear July Progress', 'clearJulyProgress'))
    .addSeparator()
    .addItem('Settings', 'showSettings')
    .addToUi();
}

/**
 * Shows settings dialog (placeholder for future enhancement)
 */
function showSettings() {
  const html = HtmlService.createHtmlOutput(`
    <div style="padding: 20px;">
      <h3>Twitter View Counter Settings</h3>
      <p>Current configuration:</p>
      <ul>
        <li>Sheet: ${CONFIG.SHEET_NAME}</li>
        <li>URL Column: ${CONFIG.URL_COLUMN}</li>
        <li>View Count Column: ${CONFIG.VIEW_COUNT_COLUMN}</li>
        <li>Start Row: ${CONFIG.START_ROW}</li>
      </ul>
      <p style="color: #666; font-size: 12px;">
        To change settings, edit the CONFIG object in the script.
      </p>
    </div>
  `)
  .setWidth(400)
  .setHeight(300);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}
