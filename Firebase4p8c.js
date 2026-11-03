// Firebase4p8c.js - Firebase 配置（已抽離，方便部署）
const firebaseConfig = {
  apiKey: "AIzaSyDgqy_XItlIPJZI5bxlyYc7h1LTeQ8tuPk",                    // ← GitHub Actions 會自動替換
  authDomain: "p8c-d1673.firebaseapp.com",
  projectId: "p8c-d1673",
  storageBucket: "p8c-d1673.firebasestorage.app",
  messagingSenderId: "352251453242",
  appId: "1:352251453242:web:37cfd6e5bd12f05c10fa03"
};

window.firebaseConfig = firebaseConfig;
console.log("✅ Firebase Config 已載入");

// ==================== Firestore 同步 ==================== From GamChuMode.js
async function saveToCloud() {
    if (!currentUser) {
        console.log("未登入，無法上傳");
        return;
    }
    const records = JSON.parse(localStorage.getItem('baziRecords') || '[]');
    console.log("準備上傳", records.length, "筆紀錄");
    try {
        await db.collection('users').doc(currentUser.uid).set({
            records: records,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("✅ 上傳成功");
    } catch (e) {
        console.error("❌ 上傳失敗", e);
    }
}

async function loadFromCloud() {
    if (!currentUser) {
        console.log("未登入，無法下載");
        return;
    }
    try {
        console.log("正在從雲端下載...");
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.records && data.records.length > 0) {
                localStorage.setItem('baziRecords', JSON.stringify(data.records));
                loadRecordOptions();
                console.log("✅ 已從雲端載入", data.records.length, "筆紀錄");
            }
        } else {
            console.log("雲端無資料");
        }
    } catch (e) {
        console.error("❌ 下載失敗", e);
    }
}
