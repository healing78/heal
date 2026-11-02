import { signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions, isFirebaseConfigured } from './firebase';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';
const KAKAO_SDK_URL = 'https://developers.kakao.com/sdk/js/kakao.min.js';

export const isKakaoConfigured = Boolean(KAKAO_JS_KEY);

let sdkLoadPromise = null;

/**
 * Dynamically loads and initializes the Kakao JavaScript SDK.
 */
export const ensureKakaoSdkInitialized = () => {
  if (!isKakaoConfigured) {
    return Promise.reject(
      new Error('VITE_KAKAO_JS_KEY 환경변수가 설정되지 않았습니다.')
    );
  }

  if (typeof window !== 'undefined' && window.Kakao) {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }
    return Promise.resolve(window.Kakao);
  }

  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JS_KEY);
        }
        resolve(window.Kakao);
      } else {
        reject(new Error('Kakao SDK 로드에 실패했습니다.'));
      }
    };
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error('Kakao SDK 스크립트를 불러오지 못했습니다.'));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
};

/**
 * Performs Kakao login via popup and fetches user profile (/v2/user/me).
 * Optionally exchanges token via Firebase Cloud Functions (kakaoCustomAuth) if deployed.
 */
export const loginWithKakao = async () => {
  const Kakao = await ensureKakaoSdkInitialized();

  const authObj = await new Promise((resolve, reject) => {
    Kakao.Auth.login({
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });

  const accessToken = authObj.access_token;

  const userProfile = await new Promise((resolve, reject) => {
    Kakao.API.request({
      url: '/v2/user/me',
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });

  const kakaoId = String(userProfile.id);
  const uid = `kakao:${kakaoId}`;
  const nickname =
    userProfile?.kakao_account?.profile?.nickname ||
    userProfile?.properties?.nickname ||
    '';

  // Optional: Try exchanging for Firebase Auth Custom Token if Cloud Functions is deployed (Blaze plan)
  if (isFirebaseConfigured && functions && auth) {
    try {
      const kakaoCustomAuth = httpsCallable(functions, 'kakaoCustomAuth');
      const result = await kakaoCustomAuth({ token: accessToken });
      if (result?.data?.token) {
        await signInWithCustomToken(auth, result.data.token);
      }
    } catch {
      // Spark (free) plan without Cloud Functions deployed: proceed with verified Kakao UID
    }
  }

  return {
    uid,
    kakaoId,
    nickname,
    accessToken
  };
};

/**
 * Logs out from Kakao SDK session if initialized.
 */
export const logoutFromKakao = () => {
  if (typeof window !== 'undefined' && window.Kakao?.isInitialized()) {
    try {
      if (window.Kakao.Auth.getAccessToken()) {
        window.Kakao.Auth.logout();
      }
    } catch {
      // ignore logout errors
    }
  }
};
