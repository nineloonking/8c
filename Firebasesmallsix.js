// Firebasesmallsix.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_smallsix",
  authDomain: "smallsix-5607c.firebaseapp.com",
  projectId: "smallsix-5607c",
  storageBucket: "smallsix-5607c.firebasestorage.app",
  messagingSenderId: "1079138789533",
  appId: "1:1079138789533:web:6a3b0c2b5fa35915870c74"
};

window.firebaseConfig = firebaseConfig;
//console.log("✅ Firebase Config 已載入");

// ==================== Firestore 同步 ==================== from GamChuMode
async function saveToCloud() {
    if (!currentUser || !window.CLOUD_STORAGE_KEY) return;
    const raw = localStorage.getItem(window.CLOUD_STORAGE_KEY) || '{}';
    const data = JSON.parse(raw);
    const field = window.CLOUD_FIELD || 'data';
    try {
        await db.collection('users').doc(currentUser.uid).set({
            [field]: data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("✅ 已上傳到雲端");
    } catch (e) {
        console.error("❌ 上傳失敗", e);
    }
}

async function loadFromCloud() {
    if (!currentUser || !window.CLOUD_STORAGE_KEY) return;
    const field = window.CLOUD_FIELD || 'data';
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists && doc.data()[field]) {
            localStorage.setItem(window.CLOUD_STORAGE_KEY, JSON.stringify(doc.data()[field]));
            // 通知頁面重新載入
            if (typeof window.onCloudDataLoaded === 'function') {
                window.onCloudDataLoaded();
            }
            console.log("✅ 已從雲端載入");
        }
    } catch (e) {
        console.error("❌ 下載失敗", e);
    }
}
