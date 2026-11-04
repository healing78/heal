/**
 * Healing78 개인 구글 드라이브 앨범 자동 저장 브릿지 (Google Apps Script)
 *
 * [설치 방법 - 3분 완성]
 * 1. 본인 구글 드라이브(https://drive.google.com)에서 새 폴더(예: 'Healing78_앨범')를 만들고 폴더 안으로 들어갑니다.
 * 2. 브라우저 주소창의 마지막 폴더 ID 문자열(https://drive.google.com/drive/folders/여기_문자열)을 복사하여 아래 ROOT_FOLDER_ID에 붙여넣습니다.
 * 3. https://script.google.com 접속 -> [새 프로젝트] 클릭 -> 이 파일의 코드를 전체 복사해 붙여넣고 저장(Ctrl+S)합니다.
 * 4. 우측 상단 [배포] -> [새 배포] 클릭:
 *    - 유형 선택: '웹 앱'
 *    - 다음 사용자 인증 정보로 실행: '나 (본인 구글 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자' (우리 앱의 카카오 로그인 회원들이 업로드할 수 있도록 허용)
 * 5. [배포] 클릭 후 권한 승인 -> 생성된 '웹 앱 URL (https://script.google.com/macros/s/.../exec)'을 복사하여 Healing78 운영 관리 설정에 붙여넣으면 완료됩니다!
 */

const ROOT_FOLDER_ID = '여기에_구글드라이브_폴더_ID를_붙여넣으세요';

function getOrCreateSubFolder(parentFolder, folderName) {
  const iter = parentFolder.getFoldersByName(folderName);
  if (iter.hasNext()) {
    return iter.next();
  }
  return parentFolder.createFolder(folderName);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const meetingId = String(payload.meetingId || 'general').trim();
    const meetingTitle = String(payload.meetingTitle || '일정').trim();
    const uploaderName = String(payload.uploaderName || '회원').trim();
    const mimeType = String(payload.mimeType || 'image/jpeg').trim();
    const base64Data = String(payload.base64Data || '').replace(/^data:[^;]+;base64,/, '');

    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const subFolderName = `[${meetingId}] ${meetingTitle}`;
    const targetFolder = getOrCreateSubFolder(rootFolder, subFolderName);

    const ext = mimeType.includes('video')
      ? 'mp4'
      : mimeType.includes('webp')
        ? 'webp'
        : 'jpg';
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd_HHmmss');
    const fileName = `${meetingId}_${uploaderName}_${timestamp}.${ext}`;

    const decodedBytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
    const file = targetFolder.createFile(blob);

    // 앱 내에서 이미지/동영상 조회 및 다운로드가 가능하도록 링크 공개 설정
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const result = {
      ok: true,
      fileId: fileId,
      fileName: fileName,
      folderName: subFolderName,
      viewUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
    };

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({
        ok: false,
        error: String(err && err.message ? err.message : err)
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
