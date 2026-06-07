// GamChuMode.js - 金主模式（Google 登入 + Firestore 雲端同步 - Debug 版）
let isGamChuMode = false;
let currentUser = null;

console.log("GamChuMode.js 已載入");

// Google 登入
async function googleLogin() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        console.log("登入成功", currentUser.uid);
        updateAuthUI();
        loadFromCloud();   // 登入後立即載入雲端資料
        alert(`✅ 登入成功！\n${currentUser.displayName}`);
    } catch (error) {
        console.error("登入失敗", error);
        alert("登入失敗：" + error.message);
    }
}

function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        updateAuthUI();
    });
}

function updateAuthUI() {
    const loginArea = document.getElementById('loginArea');
    const userArea = document.getElementById('userArea');
    if (!loginArea || !userArea) return;

    if (currentUser) {
        loginArea.style.display = 'none';
        userArea.style.display = 'block';
        document.getElementById('userNameDisplay').textContent = currentUser.displayName || currentUser.email;
        const photo = document.getElementById('userPhoto');
        if (photo && currentUser.photoURL) photo.src = currentUser.photoURL;
    } else {
        loginArea.style.display = 'block';
        userArea.style.display = 'none';
    }
}

function toggleGamChuMode() {
    const modalHTML = `
        <div id="gamchuModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; padding:10px; box-sizing:border-box;">
            <div style="background:white; border-radius:16px; width:100%; max-width:380px; box-shadow:0 10px 30px rgba(0,0,0,0.2); overflow:hidden;">
                <div style="padding:20px 24px; background:#fffaf0; border-bottom:1px solid #eee; display:flex; align-items:center; gap:12px;">
                    <span style="font-size:28px;">💰</span>
                    <h2 style="margin:0; color:#8B4513; font-size:1.4em;">金主模式</h2>
                </div>
                
                <div style="padding:24px;">
                    <div id="loginArea" style="text-align:center; margin-bottom:20px;">
                        <button onclick="googleLogin()" style="padding:12px 24px; background:#4285f4; color:white; border:none; border-radius:8px; font-size:1.05em; cursor:pointer; width:100%;">
                            🔑 使用 Google 登入
                        </button>
                        <p style="margin-top:12px; color:#666; font-size:0.9em;">登入後紀錄自動雲端同步</p>
                    </div>

                    <div id="userArea" style="display:none; text-align:center; margin-bottom:20px;">
                        <img id="userPhoto" style="width:64px; height:64px; border-radius:50%; margin-bottom:10px; border:2px solid #f9e79f;">
                        <div id="userNameDisplay" style="font-weight:600; margin-bottom:8px; color:#333;"></div>
                        <button onclick="logout()" style="padding:6px 20px; background:#ef4444; color:white; border:none; border-radius:9999px; font-size:0.95em;">登出</button>
                    </div>

                    <div style="background:#f9f7f0; padding:16px; border-radius:12px; margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:1.1em; font-weight:500;">金主模式</span>
                            <button onclick="toggleGamChuSwitch()" id="modeSwitch" style="padding:6px 20px; border:none; border-radius:9999px; font-weight:bold; cursor:pointer; min-width:70px;">
                                ON
                            </button>
                        </div>
                    </div>
                    
                    <!-- 其他內容保持不變 -->
                    <div style="background:#fff9e6; padding:18px; border-radius:12px; text-align:center; margin-bottom:20px;">
                        <div style="color:#d97706; font-weight:600; margin-bottom:8px;">課金打賞</div>
                        <div style="color:#b45309; font-size:0.95em;">CHANnal of Kowloon Creation</div>
                        <div style="margin:16px 0 8px; font-size:1.05em;">
                            <strong>FPS</strong>
                            <span id="fpsNumber" style="background:#fef3c7; padding:6px 14px; border-radius:8px; font-family:monospace; font-size:1.1em; cursor:pointer;" onclick="copyFPS()">127097723</span>
                        </div>
                        <div style="font-size:0.85em; color:#d97706;">長按數字可複製</div>
                    </div>
                    <div style="text-align:center; color:#666; font-size:0.95em; line-height:1.5;">
                        歡迎自由打賞，意見回饋請於 FPS 備註留言。
                    </div>
                </div>
                
                <div style="padding:16px 24px; border-top:1px solid #eee; text-align:center;">
                    <button onclick="closeGamChuModal()" style="padding:12px 32px; background:#e5e7eb; color:#333; border:none; border-radius:9999px; font-size:1.05em; cursor:pointer;">關閉</button>
                </div>
            </div>
        </div>
    `;

    const oldModal = document.getElementById('gamchuModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    updateAuthUI();
    updateSwitchUI();
}

// 其他函數
function toggleGamChuSwitch() {
    isGamChuMode = !isGamChuMode;
    localStorage.setItem('gamChuMode', isGamChuMode);
    updateSwitchUI();
    
    const recordArea = document.getElementById('jinZhuRecordArea');
    if (recordArea) recordArea.style.display = isGamChuMode ? 'block' : 'none';

    // 切換時也同步一次
    if (isGamChuMode && currentUser) {
        saveToCloud();
    }
}

function updateSwitchUI() {
    const btn = document.getElementById('modeSwitch');
    if (btn) {
        btn.textContent = isGamChuMode ? 'ON' : 'OFF';
        btn.style.backgroundColor = isGamChuMode ? '#10b981' : '#e5e7eb';
        btn.style.color = isGamChuMode ? 'white' : '#374151';
    }
}

function copyFPS() {
    const fps = "127097723";
    const el = document.getElementById('fpsNumber');
    
    // 更穩定的複製方式
    try {
        // 方法1: 使用 Clipboard API
        navigator.clipboard.writeText(fps).then(() => {
            const originalText = el.textContent;
            el.textContent = "已複製！";
            setTimeout(() => { el.textContent = originalText; }, 1500);
        });
    } catch (err) {
        // 方法2: 後備方案（建立臨時 textarea）
        const textarea = document.createElement('textarea');
        textarea.value = fps;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const originalText = el.textContent;
        el.textContent = "已複製！";
        setTimeout(() => { el.textContent = originalText; }, 1500);
    }
}

function closeGamChuModal() {
    const modal = document.getElementById('gamchuModal');
    if (modal) modal.remove();
}

// ==================== Firestore 同步 ====================
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

function toggleGamChuSwitch() {
    isGamChuMode = !isGamChuMode;
    localStorage.setItem('gamChuMode', isGamChuMode);
    updateSwitchUI();
    
    const recordArea = document.getElementById('jinZhuRecordArea');
    if (recordArea) recordArea.style.display = isGamChuMode ? 'block' : 'none';

    if (isGamChuMode && currentUser) saveToCloud();
}

// 監聽登入狀態
auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    if (user) {
        console.log("用戶已登入，UID:", user.uid);
        loadFromCloud();
    }
});

window.toggleGamChuMode = toggleGamChuMode;
window.googleLogin = googleLogin;
window.logout = logout;
window.copyFPS = copyFPS;
window.closeGamChuModal = closeGamChuModal;
window.toggleGamChuSwitch = toggleGamChuSwitch;
