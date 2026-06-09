// MessageBox.js - 可重用彈窗模組
function showMessageBox(title, contentHTML, options = {}) {
    const modalHTML = `
        <div id="customMessageBox" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:10000; display:flex; align-items:center; justify-content:center; padding:15px; box-sizing:border-box;">
            <div style="background:white; border-radius:16px; width:100%; max-width:420px; box-shadow:0 10px 30px rgba(0,0,0,0.25); overflow:hidden; position:relative;">
                
                <!-- 右上角 X -->
                <button onclick="closeMessageBox()" 
                        style="position:absolute; top:12px; right:12px; background:none; border:none; font-size:28px; color:#888; cursor:pointer; z-index:10;">
                    ✕
                </button>

                <!-- Header -->
                <div style="padding:20px 24px; background:#fffaf0; text-align:center; border-bottom:1px solid #eee;">
                    <h2 style="margin:0; color:#8B4513; font-size:1.35em;">${title}</h2>
                </div>

                <!-- Content -->
                <div style="padding:24px; line-height:1.7; color:#333;">
                    ${contentHTML}
                </div>

            </div>
        </div>
    `;

    // 移除舊的彈窗
    const old = document.getElementById('customMessageBox');
    if (old) old.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 關閉彈窗
function closeMessageBox() {
    const modal = document.getElementById('customMessageBox');
    if (modal) modal.remove();
}

// 暴露到全域
window.showMessageBox = showMessageBox;
window.closeMessageBox = closeMessageBox;