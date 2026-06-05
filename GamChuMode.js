// GamChuMode.js - 金主模式彈窗功能（支援刷新記住狀態）
let isGamChuMode = false;

function toggleGamChuMode() {
    const modalHTML = `
        <div id="gamchuModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; font-family:sans-serif;">
            <div style="background:white; border-radius:16px; width:380px; box-shadow:0 10px 30px rgba(0,0,0,0.2); overflow:hidden;">
                <!-- Header -->
                <div style="padding:20px 24px; background:#fffaf0; border-bottom:1px solid #eee; display:flex; align-items:center; gap:12px;">
                    <span style="font-size:28px;">💰</span>
                    <h2 style="margin:0; color:#8B4513; font-size:1.4em;">金主模式</h2>
                </div>
               
                <!-- Body -->
                <div style="padding:24px;">
                    <div style="background:#f9f7f0; padding:16px; border-radius:12px; margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:1.1em; font-weight:500;">金主模式</span>
                            <button onclick="toggleGamChuSwitch()" id="modeSwitch"
                                style="padding:6px 20px; border:none; border-radius:9999px; font-weight:bold; cursor:pointer; min-width:70px;">
                                ON
                            </button>
                        </div>
                    </div>
                    <div style="background:#fff9e6; padding:18px; border-radius:12px; text-align:center; margin-bottom:20px;">
                        <div style="color:#d97706; font-weight:600; margin-bottom:8px;">課金打賞</div>
                        <div style="color:#b45309; font-size:0.95em;">CHANnal of Kowloon Creation</div>
                        <div style="margin:16px 0 8px; font-size:1.05em;">
                            <strong>FPS</strong>
                            <span id="fpsNumber" style="background:#fef3c7; padding:6px 14px; border-radius:8px; font-family:monospace; font-size:1.1em; cursor:pointer;" onclick="copyFPS()">
                                127097723
                            </span>
                        </div>
                        <div style="font-size:0.85em; color:#d97706;">長按數字可複製</div>
                    </div>
                    <div style="text-align:center; color:#666; font-size:0.95em; line-height:1.5;">
                        回饋、意見可以用 FPS 的備註留言。
                    </div>
                </div>
                <!-- Footer -->
                <div style="padding:16px 24px; border-top:1px solid #eee; text-align:center;">
                    <button onclick="closeGamChuModal()"
                        style="padding:12px 32px; background:#e5e7eb; color:#333; border:none; border-radius:9999px; font-size:1.05em; cursor:pointer;">
                        關閉
                    </button>
                </div>
            </div>
        </div>
    `;

    // 移除舊的 modal
    const oldModal = document.getElementById('gamchuModal');
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    updateSwitchUI();
}

function toggleGamChuSwitch() {
    isGamChuMode = !isGamChuMode;
    localStorage.setItem('gamChuMode', isGamChuMode);
    updateSwitchUI();
	// 控制紀錄區顯示
    const recordArea = document.getElementById('jinZhuRecordArea');
    if (recordArea) {
        recordArea.style.display = isGamChuMode ? 'block' : 'none';
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
    navigator.clipboard.writeText(fps).then(() => {
        const el = document.getElementById('fpsNumber');
        const originalText = el.textContent;
        el.textContent = "已複製！";
        setTimeout(() => { el.textContent = originalText; }, 1500);
    });
}

function closeGamChuModal() {
    const modal = document.getElementById('gamchuModal');
    if (modal) modal.remove();
}

// 頁面載入時恢復狀態
window.addEventListener('load', () => {
    const saved = localStorage.getItem('gamChuMode');
    if (saved === 'true') {
        isGamChuMode = true;
        const title = document.getElementById('mainTitle');
        if (title) title.style.color = '#d4af37';
    }
});

// 暴露到 window
window.toggleGamChuMode = toggleGamChuMode;
window.copyFPS = copyFPS;
window.closeGamChuModal = closeGamChuModal;
window.toggleGamChuSwitch = toggleGamChuSwitch;