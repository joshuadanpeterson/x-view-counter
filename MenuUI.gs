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
    .addItem('Update Oct 2025 (Process 20)', 'updateTwitterViewCounts')
    .addItem('Continue Oct Processing', 'continueProcessing')
    .addSeparator()
    .addItem('Update Sept 2025 (Process 20)', 'updateSept2025ViewCounts')
    .addItem('Continue Sept Processing', 'continueSeptProcessing')
    .addSeparator()
    .addSubMenu(ui.createMenu('Force Update (Overwrites Existing)')
      .addItem('Force Update Oct 2025', 'forceUpdateAugust2025ViewCounts')
      .addItem('Force Update Sept 2025', 'forceUpdateSept2025ViewCounts')
      .addSeparator()
      .addItem('Continue Oct Force Update', 'continueAugustForceUpdate')
      .addItem('Continue Sept Force Update', 'continueSeptForceUpdate')
      .addSeparator()
      .addItem('Clear Sept Force Progress', 'clearSeptForceProgress')
      .addItem('Clear Oct Force Progress', 'clearAugustForceProgress'))
    .addSeparator()
    .addItem('Update Selected Range', 'updateSelectedRange')
    .addSeparator()
    .addSubMenu(ui.createMenu('Status & Progress')
      .addItem('Oct 2025 Status', 'getProcessingStatus')
      .addItem('Sept 2025 Status', 'getSeptProcessingStatus')
      .addSeparator()
      .addItem('Clear Oct Progress', 'clearProgress')
      .addItem('Clear Sept Progress', 'clearSeptProgress'))
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
