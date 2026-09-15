/**
 * Paperbell Purchases → Supabase webhook sync
 *
 * SETUP (one-time):
 *  1. Open Apps Script (Extensions → Apps Script) in your Google Sheet.
 *  2. Paste this entire file.
 *  3. Set script properties (Project Settings → Script Properties):
 *       WEBHOOK_URL   → https://<your-project>.supabase.co/functions/v1/paperbell-webhook
 *       WEBHOOK_SECRET → (same value as WEBHOOK_SECRET in your Supabase function env)
 *  4. Run installTrigger() once to register the recurring trigger.
 *
 * HOW IT WORKS:
 *  - syncNewPurchases() runs every 5 minutes via a time-based trigger.
 *  - It reads all data rows from "Paperbell Purchases", skips any Purchase ID
 *    already stored in Script Properties, and POSTs the rest to the webhook.
 *  - On success the Purchase ID is saved so it is never re-sent.
 *  - On HTTP error or network failure it retries up to MAX_ATTEMPTS times
 *    with exponential backoff. If all attempts fail the row is left unsent
 *    and the next trigger run will retry it.
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SHEET_NAME   = 'Paperbell Purchases';
const MAX_ATTEMPTS = 3;
const SENT_IDS_KEY = 'sentPurchaseIds';

// Column indices (0-based) matching your sheet layout:
// Purchase ID | Product ID | Product Description | Date/Time |
// Amount | Currency | Client ID | First Name | Last Name | Email
const COL = {
  PURCHASE_ID:         0,
  PRODUCT_ID:          1,
  PRODUCT_DESCRIPTION: 2,
  DATE_TIME:           3,
  AMOUNT:              4,
  CURRENCY:            5,
  CLIENT_ID:           6,
  FIRST_NAME:          7,
  LAST_NAME:           8,
  EMAIL:               9,
};

// ─── MAIN ────────────────────────────────────────────────────────────────────

function syncNewPurchases() {
  const props       = PropertiesService.getScriptProperties();
  const webhookUrl  = props.getProperty('WEBHOOK_URL');
  const secret      = props.getProperty('WEBHOOK_SECRET');

  if (!webhookUrl || !secret) {
    console.error('Missing WEBHOOK_URL or WEBHOOK_SECRET in Script Properties.');
    return;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    console.error(`Sheet "${SHEET_NAME}" not found.`);
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return; // header only, nothing to do

  const rows    = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  const sentIds = getSentIds();
  const toSave  = [];

  for (const row of rows) {
    const purchaseId = String(row[COL.PURCHASE_ID]).trim();
    if (!purchaseId || sentIds.has(purchaseId)) continue;

    const payload = {
      purchaseId,
      productId:          String(row[COL.PRODUCT_ID]).trim(),
      productDescription: String(row[COL.PRODUCT_DESCRIPTION]).trim(),
      dateTime:           toIso(row[COL.DATE_TIME]),
      amount:             Number(row[COL.AMOUNT]),
      currency:           String(row[COL.CURRENCY]).trim() || 'USD',
      clientId:           String(row[COL.CLIENT_ID]).trim(),
      firstName:          String(row[COL.FIRST_NAME]).trim(),
      lastName:           String(row[COL.LAST_NAME]).trim(),
      email:              String(row[COL.EMAIL]).trim(),
    };

    try {
      postWithRetry(webhookUrl, secret, payload);
      sentIds.add(purchaseId);
      toSave.push(purchaseId);
      console.log(`✓ Sent purchase ${purchaseId}`);
    } catch (err) {
      // Log and move on — the next trigger run will retry this row.
      console.error(`✗ Failed purchase ${purchaseId}: ${err.message}`);
    }
  }

  if (toSave.length > 0) {
    props.setProperty(SENT_IDS_KEY, JSON.stringify([...sentIds]));
    console.log(`Saved ${toSave.length} new sent ID(s).`);
  }
}

// ─── HTTP WITH RETRY ─────────────────────────────────────────────────────────

function postWithRetry(url, secret, payload) {
  const backoffMs = [1000, 2000, 4000]; // delays before attempt 2, 3, (4 would be unused)
  let lastErr;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) Utilities.sleep(backoffMs[attempt - 1]);

    try {
      const res = UrlFetchApp.fetch(url, {
        method:           'post',
        contentType:      'application/json',
        payload:          JSON.stringify(payload),
        muteHttpExceptions: true,
        headers:          { Authorization: `Bearer ${secret}` },
      });

      const code = res.getResponseCode();
      if (code >= 200 && code < 300) return; // success

      // 4xx errors won't be fixed by retrying — bail immediately
      if (code >= 400 && code < 500) {
        throw new Error(`HTTP ${code} (client error): ${res.getContentText().slice(0, 300)}`);
      }

      lastErr = new Error(`HTTP ${code}: ${res.getContentText().slice(0, 300)}`);
    } catch (err) {
      // Re-throw 4xx immediately; retry everything else
      if (err.message && err.message.includes('client error')) throw err;
      lastErr = err;
    }
  }

  throw lastErr ?? new Error(`Failed after ${MAX_ATTEMPTS} attempts`);
}

// ─── TRACKING ────────────────────────────────────────────────────────────────

function getSentIds() {
  const raw = PropertiesService.getScriptProperties().getProperty(SENT_IDS_KEY);
  return new Set(raw ? JSON.parse(raw) : []);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toIso(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  // Try parsing string dates Sheets sometimes returns
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toISOString();
}

// ─── SETUP ───────────────────────────────────────────────────────────────────

/**
 * Run once from the Apps Script editor to install the recurring trigger.
 * Safe to re-run — removes any existing syncNewPurchases trigger first.
 */
function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'syncNewPurchases')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('syncNewPurchases')
    .timeBased()
    .everyMinutes(5)
    .create();

  console.log('Trigger installed: syncNewPurchases runs every 5 minutes.');
}

/**
 * Utility: clear all tracked sent IDs (useful during testing).
 */
function resetSentIds() {
  PropertiesService.getScriptProperties().deleteProperty(SENT_IDS_KEY);
  console.log('Sent ID tracking cleared.');
}
