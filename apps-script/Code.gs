/**
 * PO Open Monthly Report - Google Apps Script Backend
 * 
 * Terintegrasi dengan:
 * 1. Google Sheets: Tab POData, UserMapping, EmailRecipients, AuditLog
 * 2. Gmail / MailApp: Kirim email laporan bulanan otomatis ke daftar penerima per site
 * 3. Google Drive: Buat folder dan simpan arsip laporan PDF bulanan
 * 
 * Deployment:
 * Deploy as Web App -> Execute as: Me -> Who has access: Anyone
 */

const CONFIG = {
  DRIVE_FOLDER_NAME: "PO_Monthly_Reports",
  SHEETS: {
    PO_DATA: "POData",
    USER_MAPPING: "UserMapping",
    EMAIL_RECIPIENTS: "EmailRecipients",
    AUDIT_LOG: "AuditLog"
  }
};

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || 'ping';

    if (action === 'ping') {
      return jsonResponse({ status: 'ok', message: 'Apps Script API is running', timestamp: new Date().toISOString() });
    }

    if (action === 'setup') {
      const res = setupInitialSheets();
      return jsonResponse({ status: 'ok', message: 'Spreadsheet structure initialized successfully', data: res });
    }

    if (action === 'checkAuth') {
      const email = (params.email || '').trim().toLowerCase();
      const user = checkUserAuth(email);
      return jsonResponse({ status: 'ok', data: user });
    }

    if (action === 'getPOData') {
      const site = (params.site || '').trim();
      const includeCancelled = params.includeCancelled === 'true';
      const data = getPOData(site, includeCancelled);
      return jsonResponse({ status: 'ok', data: data, site: site });
    }

    if (action === 'getEmailRecipients') {
      const site = (params.site || '').trim();
      const recipients = getEmailRecipients(site);
      return jsonResponse({ status: 'ok', data: recipients, site: site });
    }

    if (action === 'getAuditLogs') {
      const site = (params.site || '').trim();
      const logs = getAuditLogs(site);
      return jsonResponse({ status: 'ok', data: logs });
    }

    return jsonResponse({ status: 'error', message: 'Unknown GET action: ' + action }, 400);

  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;

    if (action === 'updateFeedback') {
      const result = updatePOFeedback(
        payload.po_number,
        payload.feedback,
        payload.notes,
        payload.user_email,
        payload.site_name
      );
      return jsonResponse({ status: 'ok', message: 'Feedback updated', data: result });
    }

    if (action === 'cancelPO') {
      const result = cancelPO(
        payload.po_number,
        payload.user_email,
        payload.site_name
      );
      return jsonResponse({ status: 'ok', message: 'PO Cancelled', data: result });
    }

    if (action === 'sendReportEmail') {
      const result = sendReportEmail(
        payload.site_name,
        payload.user_email,
        payload.customNote || ''
      );
      return jsonResponse({ status: 'ok', message: 'Report sent successfully', data: result });
    }

    if (action === 'exportDriveReport') {
      const result = exportPDFToDrive(
        payload.site_name,
        payload.user_email
      );
      return jsonResponse({ status: 'ok', message: 'Report saved to Drive', data: result });
    }

    return jsonResponse({ status: 'error', message: 'Unknown POST action: ' + action }, 400);

  } catch (error) {
    return jsonResponse({ status: 'error', message: error.toString() }, 500);
  }
}

/**
 * Helper to return JSON output with CORS
 */
function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Check User in UserMapping sheet
 * Kolom: email | site_name | is_active
 */
function checkUserAuth(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.USER_MAPPING);
  if (!sheet) {
    throw new Error('Sheet ' + CONFIG.SHEETS.USER_MAPPING + ' not found. Run setup first.');
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return null;
  }

  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const emailIdx = headers.indexOf('email');
  const siteIdx = headers.indexOf('site_name');
  const activeIdx = headers.indexOf('is_active');

  for (let i = 1; i < data.length; i++) {
    const rowEmail = String(data[i][emailIdx] || '').trim().toLowerCase();
    const isActive = data[i][activeIdx] === true || String(data[i][activeIdx]).trim().toUpperCase() === 'TRUE';
    if (rowEmail === email) {
      return {
        email: rowEmail,
        site_name: String(data[i][siteIdx] || '').trim(),
        is_active: isActive
      };
    }
  }

  return null;
}

/**
 * Get PO data filtered by site
 * Kolom: site_name | po_number | po_date | vendor | item_description | total_amount | feedback | notes | last_updated | status
 */
function getPOData(siteName, includeCancelled) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PO_DATA);
  if (!sheet) {
    throw new Error('Sheet ' + CONFIG.SHEETS.PO_DATA + ' not found.');
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const siteIdx = headers.indexOf('site_name');
  const poNumIdx = headers.indexOf('po_number');
  const dateIdx = headers.indexOf('po_date');
  const vendorIdx = headers.indexOf('vendor');
  const itemIdx = headers.indexOf('item_description');
  const amountIdx = headers.indexOf('total_amount');
  const fbIdx = headers.indexOf('feedback');
  const notesIdx = headers.indexOf('notes');
  const lastUpdIdx = headers.indexOf('last_updated');
  const statusIdx = headers.indexOf('status');

  const result = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowSite = String(row[siteIdx] || '').trim();
    const rowStatus = String(row[statusIdx] || 'Open').trim();

    // Site filtering
    if (siteName && rowSite.toLowerCase() !== siteName.toLowerCase()) {
      continue;
    }

    // Filter cancelled if not requested
    if (!includeCancelled && rowStatus.toLowerCase() === 'cancelled') {
      continue;
    }

    let formattedDate = row[dateIdx];
    if (row[dateIdx] instanceof Date) {
      formattedDate = Utilities.formatDate(row[dateIdx], Session.getScriptTimeZone(), "yyyy-MM-dd");
    }

    let formattedLastUpdated = row[lastUpdIdx];
    if (row[lastUpdIdx] instanceof Date) {
      formattedLastUpdated = Utilities.formatDate(row[lastUpdIdx], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
    }

    result.push({
      id: 'row_' + (i + 1),
      site_name: rowSite,
      po_number: String(row[poNumIdx] || ''),
      po_date: String(formattedDate || ''),
      vendor: String(row[vendorIdx] || ''),
      item_description: String(row[itemIdx] || ''),
      total_amount: Number(row[amountIdx]) || 0,
      feedback: String(row[fbIdx] || ''),
      notes: String(row[notesIdx] || ''),
      last_updated: String(formattedLastUpdated || ''),
      status: rowStatus || 'Open'
    });
  }

  return result;
}

/**
 * Get email recipients for a given site
 * Kolom: site_name | email | name | role
 */
function getEmailRecipients(siteName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.EMAIL_RECIPIENTS);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const siteIdx = headers.indexOf('site_name');
  const emailIdx = headers.indexOf('email');
  const nameIdx = headers.indexOf('name');
  const roleIdx = headers.indexOf('role');

  const recipients = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowSite = String(row[siteIdx] || '').trim();
    if (!siteName || rowSite.toLowerCase() === siteName.toLowerCase()) {
      recipients.push({
        site_name: rowSite,
        email: String(row[emailIdx] || '').trim(),
        name: String(row[nameIdx] || '').trim(),
        role: String(row[roleIdx] || '').trim()
      });
    }
  }

  return recipients;
}

/**
 * Update PO Feedback & Notes
 */
function updatePOFeedback(poNumber, feedback, notes, userEmail, siteName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PO_DATA);
  if (!sheet) throw new Error('Sheet POData not found');

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const poNumIdx = headers.indexOf('po_number');
  const fbIdx = headers.indexOf('feedback');
  const notesIdx = headers.indexOf('notes');
  const lastUpdIdx = headers.indexOf('last_updated');
  const siteIdx = headers.indexOf('site_name');

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  for (let i = 1; i < values.length; i++) {
    const currentPONum = String(values[i][poNumIdx] || '').trim();
    if (currentPONum.toLowerCase() === String(poNumber).trim().toLowerCase()) {
      const oldFb = String(values[i][fbIdx] || '');
      const oldNotes = String(values[i][notesIdx] || '');
      const rowSite = String(values[i][siteIdx] || siteName);

      // Update cells (1-indexed)
      if (feedback !== undefined) sheet.getRange(i + 1, fbIdx + 1).setValue(feedback);
      if (notes !== undefined) sheet.getRange(i + 1, notesIdx + 1).setValue(notes);
      sheet.getRange(i + 1, lastUpdIdx + 1).setValue(timestamp);

      // Keep status in sync with Cancel PO
      const statusIdx = headers.indexOf('status');
      if (feedback !== undefined && statusIdx !== -1) {
        const oldStatus = String(values[i][statusIdx] || 'Open');
        const newStatus = feedback === 'Cancel PO' ? 'Cancelled' : 'Open';
        if (oldStatus !== newStatus) {
          sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
          logAuditTrail(poNumber, rowSite, userEmail, 'status', oldStatus, newStatus);
        }
      }

      // Audit Log
      if (feedback !== undefined && feedback !== oldFb) {
        logAuditTrail(poNumber, rowSite, userEmail, 'feedback', oldFb, feedback);
      }
      if (notes !== undefined && notes !== oldNotes) {
        logAuditTrail(poNumber, rowSite, userEmail, 'notes', oldNotes, notes);
      }

      return { po_number: poNumber, feedback, notes, last_updated: timestamp };
    }
  }

  throw new Error('PO Number ' + poNumber + ' not found');
}

/**
 * Cancel PO
 */
function cancelPO(poNumber, userEmail, siteName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PO_DATA);
  if (!sheet) throw new Error('Sheet POData not found');

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const poNumIdx = headers.indexOf('po_number');
  const statusIdx = headers.indexOf('status');
  const lastUpdIdx = headers.indexOf('last_updated');
  const siteIdx = headers.indexOf('site_name');

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  for (let i = 1; i < values.length; i++) {
    const currentPONum = String(values[i][poNumIdx] || '').trim();
    if (currentPONum.toLowerCase() === String(poNumber).trim().toLowerCase()) {
      const oldStatus = String(values[i][statusIdx] || 'Open');
      const rowSite = String(values[i][siteIdx] || siteName);
      const fbIdx = headers.indexOf('feedback');

      sheet.getRange(i + 1, statusIdx + 1).setValue('Cancelled');
      if (fbIdx !== -1) {
        sheet.getRange(i + 1, fbIdx + 1).setValue('Cancel PO');
      }
      sheet.getRange(i + 1, lastUpdIdx + 1).setValue(timestamp);

      logAuditTrail(poNumber, rowSite, userEmail, 'status', oldStatus, 'Cancelled');
      return { po_number: poNumber, status: 'Cancelled', feedback: 'Cancel PO', last_updated: timestamp };
    }
  }

  throw new Error('PO Number ' + poNumber + ' not found');
}

/**
 * Log action to AuditLog sheet
 * Kolom: timestamp | po_number | site | user_email | field_changed | old_value | new_value
 */
function logAuditTrail(poNumber, site, userEmail, fieldChanged, oldValue, newValue) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEETS.AUDIT_LOG);
      sheet.appendRow(['timestamp', 'po_number', 'site', 'user_email', 'field_changed', 'old_value', 'new_value']);
    }

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([timestamp, poNumber, site, userEmail || 'anonymous', fieldChanged, oldValue, newValue]);
  } catch (err) {
    Logger.log('Audit log error: ' + err.toString());
  }
}

/**
 * Get recent audit logs
 */
function getAuditLogs(siteName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h).trim().toLowerCase());
  const siteIdx = headers.indexOf('site');

  const logs = [];
  // Read in reverse order
  for (let i = values.length - 1; i >= 1; i--) {
    const row = values[i];
    if (!siteName || String(row[siteIdx] || '').toLowerCase() === siteName.toLowerCase()) {
      logs.push({
        timestamp: String(row[0] || ''),
        po_number: String(row[1] || ''),
        site: String(row[2] || ''),
        user_email: String(row[3] || ''),
        field_changed: String(row[4] || ''),
        old_value: String(row[5] || ''),
        new_value: String(row[6] || '')
      });
      if (logs.length >= 50) break; // Limit to 50
    }
  }

  return logs;
}

/**
 * Send Report Email with PDF attachment via Gmail/MailApp & save to Drive
 */
function sendReportEmail(siteName, senderEmail, customNote) {
  const recipients = getEmailRecipients(siteName);
  if (recipients.length === 0) {
    throw new Error('Tidak ada penerima terdaftar di EmailRecipients untuk site ' + siteName);
  }

  const poList = getPOData(siteName, false);
  const recipientEmails = recipients.map(r => r.email).filter(e => e && e.includes('@'));
  if (recipientEmails.length === 0) {
    throw new Error('Alamat email penerima tidak valid.');
  }

  // Calculate stats
  let totalAmount = 0;
  let agingOver30 = 0;
  let agingOver60 = 0;
  const now = new Date().getTime();

  poList.forEach(po => {
    totalAmount += Number(po.total_amount) || 0;
    if (po.po_date) {
      const poTime = new Date(po.po_date).getTime();
      const diffDays = Math.floor((now - poTime) / (1000 * 3600 * 24));
      if (diffDays > 60) agingOver60++;
      else if (diffDays > 30) agingOver30++;
    }
  });

  const formattedAmount = "Rp " + totalAmount.toLocaleString('id-ID');
  const reportDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMMM yyyy HH:mm");

  // Generate HTML table for email
  let tableRows = '';
  poList.forEach((po, index) => {
    tableRows += `
      <tr style="border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">
        <td style="padding: 6px 8px; text-align: center;">${index + 1}</td>
        <td style="padding: 6px 8px; font-weight: bold;">
          <a href="https://bis.kanosolution.app/bagong/scm/PurchaseOrder?id=${encodeURIComponent(po.po_number)}" target="_blank" style="color: #2563eb; text-decoration: none;">${po.po_number}</a>
        </td>
        <td style="padding: 6px 8px;">${po.po_date}</td>
        <td style="padding: 6px 8px; font-family: sans-serif;">${po.vendor}</td>
        <td style="padding: 6px 8px; font-family: sans-serif;">${po.item_description}</td>
        <td style="padding: 6px 8px; text-align: right;">Rp ${(Number(po.total_amount) || 0).toLocaleString('id-ID')}</td>
        <td style="padding: 6px 8px; font-family: sans-serif;">${po.feedback || '-'}</td>
        <td style="padding: 6px 8px; font-family: sans-serif; color: #475569;">${po.notes || '-'}</td>
      </tr>
    `;
  });

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 900px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px; text-transform: uppercase; letter-spacing: 0.05em;">Laporan PO Open Bulanan</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Site: <strong>${siteName}</strong> &bull; Tanggal Laporan: ${reportDate}</p>
        <p style="margin: 2px 0 0; color: #64748b; font-size: 12px;">Dikirim oleh: ${senderEmail || 'Sistem Enterprise'}</p>
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 20px; background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0;">
        <div style="flex: 1;">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b;">Total PO Open</span><br/>
          <strong style="font-size: 18px; font-family: monospace;">${poList.length} PO</strong>
        </div>
        <div style="flex: 1;">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b;">Total Amount</span><br/>
          <strong style="font-size: 18px; font-family: monospace; color: #1d4ed8;">${formattedAmount}</strong>
        </div>
        <div style="flex: 1;">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b;">Aging &gt; 30 Hari</span><br/>
          <strong style="font-size: 18px; font-family: monospace; color: #b45309;">${agingOver30} PO</strong>
        </div>
      </div>

      ${customNote ? `<div style="padding: 10px; background: #eff6ff; border-left: 4px solid #3b82f6; margin-bottom: 16px; font-size: 13px;"><strong>Catatan Tambahan:</strong> ${customNote}</div>` : ''}

      <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #94a3b8; font-size: 11px; text-transform: uppercase; color: #334155;">
            <th style="padding: 6px 8px; width: 30px; text-align: center;">#</th>
            <th style="padding: 6px 8px;">No. PO</th>
            <th style="padding: 6px 8px;">Tgl PO</th>
            <th style="padding: 6px 8px;">Vendor</th>
            <th style="padding: 6px 8px;">Deskripsi Item</th>
            <th style="padding: 6px 8px; text-align: right;">Total Amount</th>
            <th style="padding: 6px 8px;">Feedback</th>
            <th style="padding: 6px 8px;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="8" style="padding: 16px; text-align: center; color: #94a3b8;">Tidak ada data PO Open.</td></tr>'}
        </tbody>
      </table>

      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #94a3b8; text-align: right;">
        Aplikasi PO Open Monthly Report &bull; Master Data Google Sheets &bull; Internal Enterprise Tool
      </div>
    </div>
  `;

  // Generate PDF and save to Google Drive
  let pdfAttachment = null;
  let driveFileUrl = "";
  try {
    const driveFolder = getOrCreateDriveFolder(CONFIG.DRIVE_FOLDER_NAME);
    const fileName = `Report_PO_Open_${siteName.replace(/\\s+/g, '_')}_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm")}.pdf`;
    
    const htmlBlob = Utilities.newBlob(htmlBody, "text/html", "report.html");
    const pdfBlob = htmlBlob.getAs("application/pdf").setName(fileName);
    const driveFile = driveFolder.createFile(pdfBlob);
    driveFile.setDescription(`Arsip laporan PO Open bulanan site ${siteName} dikirim oleh ${senderEmail}`);
    driveFileUrl = driveFile.getUrl();
    pdfAttachment = pdfBlob;
  } catch (driveErr) {
    Logger.log("Drive PDF creation error: " + driveErr.toString());
  }

  // Send Email via GmailApp / MailApp
  const emailSubject = `[REPORT] PO Open Bulanan - ${siteName} (${poList.length} PO - ${reportDate})`;
  const mailOptions = {
    to: recipientEmails.join(','),
    subject: emailSubject,
    htmlBody: htmlBody,
    name: "PO Open Monitoring System"
  };

  if (pdfAttachment) {
    mailOptions.attachments = [pdfAttachment];
  }

  MailApp.sendEmail(mailOptions);

  // Log in AuditLog
  logAuditTrail('BULK_REPORT', siteName, senderEmail, 'send_email', '', `Sent to ${recipientEmails.length} recipients: ${recipientEmails.join(', ')}`);

  return {
    recipients: recipientEmails,
    total_po: poList.length,
    total_amount: totalAmount,
    driveFileUrl: driveFileUrl
  };
}

/**
 * Export PDF and save directly to Google Drive
 */
function exportPDFToDrive(siteName, userEmail) {
  const poList = getPOData(siteName, false);
  const reportDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd MMMM yyyy HH:mm");
  
  let totalAmount = 0;
  poList.forEach(po => totalAmount += Number(po.total_amount) || 0);

  let tableRows = '';
  poList.forEach((po, index) => {
    tableRows += `
      <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
        <td style="padding: 4px;">${index + 1}</td>
        <td style="padding: 4px; font-weight: bold; font-family: monospace;">${po.po_number}</td>
        <td style="padding: 4px; font-family: monospace;">${po.po_date}</td>
        <td style="padding: 4px;">${po.vendor}</td>
        <td style="padding: 4px;">${po.item_description}</td>
        <td style="padding: 4px; text-align: right; font-family: monospace;">Rp ${(Number(po.total_amount) || 0).toLocaleString('id-ID')}</td>
        <td style="padding: 4px;">${po.feedback || '-'}</td>
        <td style="padding: 4px;">${po.notes || '-'}</td>
      </tr>
    `;
  });

  const htmlContent = `
    <html>
      <body style="font-family: sans-serif; color: #222; padding: 20px;">
        <h2 style="margin: 0;">Laporan PO Open - Site ${siteName}</h2>
        <p style="color: #666; font-size: 12px; margin: 4px 0 16px;">Tanggal: ${reportDate} | Diekspor oleh: ${userEmail}</p>
        <p><strong>Total Open PO:</strong> ${poList.length} baris | <strong>Total Nilai:</strong> Rp ${totalAmount.toLocaleString('id-ID')}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;" border="1" cellpadding="4" cellspacing="0">
          <thead>
            <tr style="background: #f0f0f0; font-size: 11px;">
              <th>#</th><th>No. PO</th><th>Tgl PO</th><th>Vendor</th><th>Item</th><th>Total Amount</th><th>Feedback</th><th>Catatan</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const driveFolder = getOrCreateDriveFolder(CONFIG.DRIVE_FOLDER_NAME);
  const fileName = `PO_Open_Report_${siteName}_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss")}.pdf`;
  const blob = Utilities.newBlob(htmlContent, "text/html").getAs("application/pdf").setName(fileName);
  const file = driveFolder.createFile(blob);

  logAuditTrail('EXPORT_PDF', siteName, userEmail, 'drive_export', '', file.getUrl());

  return {
    fileId: file.getId(),
    fileName: fileName,
    fileUrl: file.getUrl()
  };
}

/**
 * Get or create folder in Google Drive
 */
function getOrCreateDriveFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * Setup Initial Sheets structure with Demo data
 * Run this function from the Apps Script editor to initialize the spreadsheet!
 */
function setupInitialSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tab UserMapping
  let userSheet = ss.getSheetByName(CONFIG.SHEETS.USER_MAPPING);
  if (!userSheet) {
    userSheet = ss.insertSheet(CONFIG.SHEETS.USER_MAPPING);
    userSheet.appendRow(['email', 'site_name', 'is_active']);
    userSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#e2e8f0');
    userSheet.appendRow(['staffprocurement45@gmail.com', 'Site Balikpapan', true]);
    userSheet.appendRow(['site.samarinda@company.com', 'Site Samarinda', true]);
    userSheet.appendRow(['site.sorong@company.com', 'Site Sorong', true]);
  }

  // 2. Tab EmailRecipients
  let emailSheet = ss.getSheetByName(CONFIG.SHEETS.EMAIL_RECIPIENTS);
  if (!emailSheet) {
    emailSheet = ss.insertSheet(CONFIG.SHEETS.EMAIL_RECIPIENTS);
    emailSheet.appendRow(['site_name', 'email', 'name', 'role']);
    emailSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#e2e8f0');
    emailSheet.appendRow(['Site Balikpapan', 'staffprocurement45@gmail.com', 'Staff Procurement', 'Site Officer']);
    emailSheet.appendRow(['Site Balikpapan', 'purchasing.manager@company.com', 'Purchasing Manager', 'Manager']);
    emailSheet.appendRow(['Site Samarinda', 'site.samarinda@company.com', 'Samarinda Lead', 'Site Officer']);
    emailSheet.appendRow(['Site Sorong', 'site.sorong@company.com', 'Sorong Officer', 'Site Officer']);
  }

  // 3. Tab AuditLog
  let auditSheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT_LOG);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(CONFIG.SHEETS.AUDIT_LOG);
    auditSheet.appendRow(['timestamp', 'po_number', 'site', 'user_email', 'field_changed', 'old_value', 'new_value']);
    auditSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#e2e8f0');
  }

  // 4. Tab POData
  let poSheet = ss.getSheetByName(CONFIG.SHEETS.PO_DATA);
  if (!poSheet) {
    poSheet = ss.insertSheet(CONFIG.SHEETS.PO_DATA);
    poSheet.appendRow([
      'site_name',
      'po_number',
      'po_date',
      'vendor',
      'item_description',
      'total_amount',
      'feedback',
      'notes',
      'last_updated',
      'status'
    ]);
    poSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#e2e8f0');

    const sampleRows = [
      ['Site Balikpapan', 'PO-2026-BPN-001', '2026-08-10', 'PT United Tractors Tbk', 'Sparepart Excavator PC200 Seal Kit & Filter', 48500000, 'Proses Pengiriman', 'Estimasi tiba tgl 28 September', '2026-09-24 14:15:00', 'Open'],
      ['Site Balikpapan', 'PO-2026-BPN-002', '2026-07-15', 'CV Mitra Tehnik Abadi', 'Bearing SKF 6205 & Coupling Rubber Set', 12350000, 'Menunggu Konfirmasi Vendor', 'Vendor konfirmasi stok indent 2 minggu', '2026-09-22 09:30:00', 'Open'],
      ['Site Balikpapan', 'PO-2026-BPN-003', '2026-09-02', 'PT Trakindo Utama', 'Oil Filter & Fuel Filter CAT 320D', 27600000, 'Belum Datang', 'Telah PO, menunggu jadwal kirim ekspedisi', '2026-09-23 11:20:00', 'Open'],
      ['Site Balikpapan', 'PO-2026-BPN-004', '2026-06-20', 'PT Hexindo Adiperkasa', 'Track Roller & Idler Hitachi ZX210', 92400000, 'Proses Retur', 'Barang datang salah tipe part number', '2026-09-20 16:45:00', 'Open'],
      ['Site Balikpapan', 'PO-2026-BPN-005', '2026-09-18', 'PT Cipta Kridatama Parts', 'Hydraulic Hose Parker 1/2 inch x 20m', 15800000, 'Belum Datang', '', '2026-09-24 10:00:00', 'Open'],
      ['Site Balikpapan', 'PO-2026-BPN-006', '2026-07-01', 'PT Altrak 1978', 'Gasket Kit & O-Ring Set Cummins QSM11', 34200000, 'Proses Pengiriman', 'Resi JNE Cargo: BPN88291039', '2026-09-24 13:00:00', 'Open'],
      ['Site Balikpapan', 'PO-2026-BPN-007', '2026-08-25', 'CV Karya Mandiri Teknik', 'Steel Plate Hardox 400 12mm x 4x8 ft', 67000000, 'Menunggu Konfirmasi Vendor', 'Cek kesiapan fabrikasi', '2026-09-21 15:10:00', 'Open'],
      ['Site Samarinda', 'PO-2026-SMD-001', '2026-08-12', 'PT Borneo Jaya Spareparts', 'Brake Lining & Drum Isuzu Giga', 18400000, 'Belum Datang', '', '2026-09-22 08:00:00', 'Open'],
      ['Site Sorong', 'PO-2026-SRG-001', '2026-07-28', 'PT Papua Sarana Teknik', 'Submersible Pump 3 Inch 5HP', 38700000, 'Proses Pengiriman', 'Kapal kontainer tiba minggu depan', '2026-09-20 10:00:00', 'Open']
    ];

    sampleRows.forEach(r => poSheet.appendRow(r));
  }

  // Remove default "Sheet1" if exists
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  return { message: 'Initialized sheets: POData, UserMapping, EmailRecipients, AuditLog' };
}
