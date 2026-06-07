// Firebase4p8c.js - Firebase 配置（已抽離，方便部署）
const firebaseConfig = {
  apiKey: YOUR_API_KEY_HERE,                    // ← GitHub Actions 會自動替換
  authDomain: "p8c-d1673.firebaseapp.com",
  projectId: "p8c-d1673",
  storageBucket: "p8c-d1673.firebasestorage.app",
  messagingSenderId: "352251453242",
  appId: "1:352251453242:web:37cfd6e5bd12f05c10fa03"
};

window.firebaseConfig = firebaseConfig;
console.log("✅ Firebase Config 已載入");
