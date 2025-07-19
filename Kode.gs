/**
 * @description Handles POST requests to log attendance (ID, Name, Status).
 * @param {Object} e The event parameter. e.postData.contents should be a JSON string 
 * like: {"id":"S-001", "nama":"Budi Santoso", "status":"H"}
 * @returns {ContentService.TextOutput} A JSON response.
 */
function doPost(e) {
  const SHEET_NAME = "Sheet1"; // Pastikan nama ini sesuai

  let response;
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error(`Sheet dengan nama "${SHEET_NAME}" tidak ditemukan.`);
    }

    const data = JSON.parse(e.postData.contents);
    const studentId = data.id;
    const studentName = data.nama;
    const attendanceStatus = data.status;

    if (!studentId || !studentName || !attendanceStatus) {
      throw new Error("Data tidak lengkap. Pastikan QR code dan status valid.");
    }

    const now = new Date();
    const formattedDate = Utilities.formatDate(now, "Asia/Jakarta", "dd MMMM yyyy");
    const formattedTime = Utilities.formatDate(now, "Asia/Jakarta", "HH:mm:ss");

    // Menambahkan data baru tanpa kolom kelas
    sheet.appendRow([studentId, studentName, attendanceStatus, formattedDate, formattedTime]);
    
    response = { 
      status: 'success', 
      message: 'Absensi berhasil dicatat',
      data: {
        nama: studentName,
        status: attendanceStatus,
        time: formattedTime
      }
    };

    lock.releaseLock();

  } catch (error) {
    response = { 
      status: 'error', 
      message: 'Terjadi kesalahan: ' + error.message 
    };
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
