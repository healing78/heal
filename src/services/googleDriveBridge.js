/**
 * Personal Google Drive Storage Bridge Client
 * Communicates with Google Apps Script (GAS) Web App
 */

export const getGoogleDriveBridgeUrl = (communityConfig) => {
  const envUrl = import.meta.env.VITE_GOOGLE_DRIVE_BRIDGE_URL || '';
  const configUrl = communityConfig?.googleDriveBridgeUrl || '';
  return (configUrl || envUrl || '').trim();
};

/**
 * Uploads compressed media (Base64) to personal Google Drive via GAS Bridge.
 * @param {Object} params
 * @param {string} params.bridgeUrl
 * @param {string} params.meetingId
 * @param {string} params.meetingTitle
 * @param {string} params.uploaderName
 * @param {string} params.mimeType
 * @param {string} params.base64Data
 * @returns {Promise<{ok: boolean, fileId?: string, fileName?: string, folderName?: string, viewUrl?: string, downloadUrl?: string, thumbnailUrl?: string, error?: string}>}
 */
export async function uploadMediaToGoogleDrive({
  bridgeUrl,
  meetingId,
  meetingTitle,
  uploaderName,
  mimeType,
  base64Data
}) {
  if (!bridgeUrl) {
    return {
      ok: false,
      error: 'Google Drive Bridge URL is not configured.'
    };
  }

  const payload = {
    meetingId: String(meetingId || 'general'),
    meetingTitle: String(meetingTitle || '일정'),
    uploaderName: String(uploaderName || '회원'),
    mimeType: String(mimeType || 'image/jpeg'),
    base64Data: String(base64Data || '')
  };

  try {
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // GAS doPost parses plain text safely without preflight OPTIONS CORS blockage
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Google Drive Bridge upload failed, falling back to local storage:', err);
    return {
      ok: false,
      error: err.message || '네트워크 연결 오류'
    };
  }
}
