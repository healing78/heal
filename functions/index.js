const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

/**
 * Kakao Authentication Function
 * Exchanges Kakao Access Token for Firebase Custom Token
 */
exports.kakaoCustomAuth = functions.https.onCall(async (data, context) => {
  const kakaoAccessToken = data.token;

  if (!kakaoAccessToken) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Kakao access token is required."
    );
  }

  try {
    // 1. Verify token and get user profile from Kakao
    const kakaoUserResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    });

    const kakaoUser = kakaoUserResponse.data;
    const uid = `kakao:${kakaoUser.id}`;

    // 2. Prepare Firebase user record
    const userRecord = {
      uid: uid,
      displayName: kakaoUser.kakao_account.profile.nickname,
      photoURL: kakaoUser.kakao_account.profile.thumbnail_image_url,
    };

    // 3. Create or update user in Firebase Auth
    try {
      await admin.auth().updateUser(uid, userRecord);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        await admin.auth().createUser(userRecord);
      } else {
        throw error;
      }
    }

    // 4. Create Firebase Custom Token
    const customToken = await admin.auth().createCustomToken(uid);

    return { token: customToken };
  } catch (error) {
    console.error("Kakao Auth Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to authenticate with Kakao."
    );
  }
});
