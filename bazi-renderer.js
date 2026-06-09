// bazi-renderer.js - 負責渲染八字命盤的主要 HTML

async function renderBaziFate() {
    const dateInput = document.getElementById('mydate').value;
    const timeInput = document.getElementById('mytime').value || '00:00';
    if (!dateInput) return;

    const [yearStr, monthStr, dayStr] = dateInput.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);
    const [hourStr, minStr] = timeInput.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minStr);
    const gender = document.getElementById('gender').value;
    const baziResult = window.getBazi(year, month, day, hour, minute);
    const dayStem = baziResult.stems.day;

    if (baziResult.error) {
        document.getElementById('here').innerHTML = `<p style="color:red;">${baziResult.error}</p>`;
        return;
    }

    const data = await loadBaziData();
    if (!data) return;

    let terms = await window.getSolarTerms(year);
    if (terms.error) terms = { source: 'local' };

    const currentHK = new Date(year, month - 1, day, hour, minute, 0);
    let currentIndex = -1;
    for (let i = 0; i < terms.length; i++) {
        const [y, m, d] = terms[i].date.split('-').map(Number);
        const [h, mi] = terms[i].time.split(':').map(Number);
        const termTime = new Date(y, m-1, d, h, mi);
        if (termTime.getTime() > currentHK.getTime()) { currentIndex = i - 1; break; }
    }
    if (currentIndex === -1) currentIndex = 23;
    const currentTerm = terms[currentIndex];

    let nextJie = null;
    for (let i = currentIndex + 1; i < terms.length; i++) if (terms[i].isJie) { nextJie = terms[i]; break; }
    if (!nextJie) { const ny = await window.getSolarTerms(year+1); nextJie = ny[0]; }
    let prevJie = null;
    for (let i = currentIndex; i >= 0; i--) if (terms[i].isJie) { prevJie = terms[i]; break; }
    if (!prevJie) { const py = await window.getSolarTerms(year-1); prevJie = py[22]; }

    const currentDateOnly = new Date(year, month - 1, day);
    const nextDateOnly = new Date(nextJie.date.split('-').map(Number)[0], nextJie.date.split('-').map(Number)[1]-1, nextJie.date.split('-').map(Number)[2]);
    const prevDateOnly = new Date(prevJie.date.split('-').map(Number)[0], prevJie.date.split('-').map(Number)[1]-1, prevJie.date.split('-').map(Number)[2]);

    const daysToNext = Math.floor((nextDateOnly - currentDateOnly) / 86400000) + 1;
    const daysToPrev = Math.floor((currentDateOnly - prevDateOnly) / 86400000) + 1;

    // 大運計算
    const birthYear = year;
    const yearStemIdx = stems.indexOf(baziResult.stems.year);
    const monthStemIdx = stems.indexOf(baziResult.stems.month);
    const monthBranchIdx = BranchesNamesshort.indexOf(baziResult.branches.month);
    const isYearYang = (yearStemIdx % 2 === 1);
    const isMale = document.getElementById('gender').value === '男';
    const forward = (isYearYang && isMale) || (!isYearYang && !isMale);
    const daysForLuck = forward ? daysToNext : daysToPrev;
    let luckStart = Math.floor(daysForLuck / 3);
    if (daysForLuck % 3 === 2) luckStart += 1;
    const luckStartYear = birthYear + luckStart - 1;

    let daYears = [], daStems = [], daBranches = [];
    let curStem = monthStemIdx;
    let curBranch = monthBranchIdx;
    for (let i = 0; i < 8; i++) {
        if (forward) {
            curStem = (curStem % 10) + 1;
            curBranch = (curBranch % 12) + 1;
        } else {
            curStem = curStem - 1; if (curStem < 1) curStem = 10;
            curBranch = curBranch - 1; if (curBranch < 1) curBranch = 12;
        }
        daStems.push(stems[curStem]);
        daBranches.push(BranchesNamesshort[curBranch]);
        daYears.push(luckStartYear + i * 10);
    }

    let currentRealYear = parseInt(document.getElementById('currentYear').value) || new Date().getFullYear();
    let currentDaYunIdx = 0;
    for (let i = 0; i < daYears.length; i++) {
        if (currentRealYear >= daYears[i]) currentDaYunIdx = i;
    }
    const currentDaYunStem = daStems[currentDaYunIdx];
    const currentDaYunBranch = daBranches[currentDaYunIdx];

    const currentYearBazi = window.getBazi(currentRealYear, 6, 15, 12, 0);
    const currentLiuNianStem = currentYearBazi.stems.year;
    const currentLiuNianBranch = currentYearBazi.branches.year;

    // 四柱八字表
    let pillarsHTML = `<table class="pillars">`;
    
    pillarsHTML += `<tr style="font-size:0.6em;">`;
    pillarsHTML += `<td>${birthYear + 105}<br>${birthYear + 45}</td>`;
    pillarsHTML += `<td>${birthYear + 90}<br>${birthYear + 30}</td>`;
    pillarsHTML += `<td>${birthYear + 75}<br>${birthYear + 15}</td>`;
    pillarsHTML += `<td>${birthYear + 60}<br>${birthYear}</td>`;
    
    let luckStemText = '';
    const daYunYear = daYears[currentDaYunIdx];
    if (daYunYear) {
        const daYunBazi = window.getBazi(daYunYear, 6, 15, 12, 0);
        const daYunStem = daYunBazi.stems.year;
        const stemOrder = "甲乙丙丁戊己庚辛壬癸";
        let idx = stemOrder.indexOf(daYunStem);
        if (isMale) {
            idx = (idx - 1 + 10) % 10;
            luckStemText = '怕' + stemOrder[idx];
        } else {
            luckStemText = '怕' + daYunStem;
        }
    } else {
        luckStemText = isMale ? '怕交' : '怕脫';
    }
    
    pillarsHTML += `<td>${luckStemText}<br>${daYunYear || ''}</td>`;
    pillarsHTML += `<td>${currentRealYear - birthYear + 1}歲<br>${currentRealYear}</td>`;
    pillarsHTML += `</tr>`;

    pillarsHTML += `<tr style="font-size:0.72em; background:#f9f7f0; line-height:1.3;">`;
    const pillarKeys = ["hour", "day", "month", "year", "luck", "flow"];
    pillarKeys.forEach(key => {
        const m = data && data.pillarMeaning ? data.pillarMeaning[key] : null;
        if (m) {
            pillarsHTML += `<td style="padding: 2px; line-height: 0.7;">
                <span style="display: block; font-weight: normal; font-size: 0.6em; color:#555;">${m.relation}</span><br>
                <span style="display: block; font-weight: bold; padding: 0; font-size: 1.5em;">${key === "hour" ? "時" : key === "day" ? "日" : key === "month" ? "月" : key === "year" ? "年" : key === "luck" ? "運" : "流"}</span><br>
                <span style="display: block; font-weight: normal; font-size: 0.6em; color:#555;">${m.body}</span></td>`;
        }
    });
    pillarsHTML += `</tr>`;
    
    const branches = [baziResult.branches.hour, baziResult.branches.day, baziResult.branches.month, baziResult.branches.year];
    
    const stemsForGods = [baziResult.stems.hour, dayStem, baziResult.stems.month, baziResult.stems.year, currentDaYunStem, currentLiuNianStem];
    pillarsHTML += `<tr>`;
    stemsForGods.forEach((stem, i) => {
        if (i === 1) {
            const yuanText = isMale ? '元男' : '元女';
            pillarsHTML += `<td><span class="hidden-stem" style="color:black; font-size:0.7em;">${yuanText}</span></td>`;
        } else {
            const god = data.tenGods[dayStem]["甲乙丙丁戊己庚辛壬癸".indexOf(stem)];
            pillarsHTML += `<td><span class="hidden-stem" style="color:black; font-size:0.7em;">${god || '——'}</span></td>`;
        }
    });
    pillarsHTML += `</tr>`;

    pillarsHTML += `<tr>`;
    ["hour","day","month","year"].forEach(key => {
        const stem = baziResult.stems[key];
        const color = data.fiveColors[data.stemsElement[stem]];
        pillarsHTML += `<td style="background:#fff2cc;"><span style="color:${color}; font-size:1.15em;">${stem}</span></td>`;
    });
    const daStemColor = data.fiveColors[data.stemsElement[currentDaYunStem]];
    pillarsHTML += `<td><span style="color:${daStemColor}">${currentDaYunStem}</span></td>`;
    const liuStemColor = data.fiveColors[data.stemsElement[currentLiuNianStem]];
    pillarsHTML += `<td><span style="color:${liuStemColor}">${currentLiuNianStem}</span></td>`;
    pillarsHTML += `</tr><tr>`;
    branches.forEach(branch => {
        const color = data.fiveColors[data.branchesElement[branch]];
        pillarsHTML += `<td style="background:#fff2cc;"><span style="color:${color}; font-size:1.15em;">${branch}</span></td>`;
    });    
    const daBranchColor = data.fiveColors[data.branchesElement[currentDaYunBranch]];
    pillarsHTML += `<td><span style="color:${daBranchColor}">${currentDaYunBranch}</span></td>`;
    const liuBranchColor = data.fiveColors[data.branchesElement[currentLiuNianBranch]];
    pillarsHTML += `<td><span style="color:${liuBranchColor}">${currentLiuNianBranch}</span></td>`;
    pillarsHTML += `</tr>`;

    pillarsHTML += `<tr>`;
    const naYinColumns = [
        baziResult.stems.hour + baziResult.branches.hour,
        baziResult.stems.day + baziResult.branches.day,
        baziResult.stems.month + baziResult.branches.month,
        baziResult.stems.year + baziResult.branches.year,
        currentDaYunStem + currentDaYunBranch,
        currentLiuNianStem + currentLiuNianBranch
    ];
    naYinColumns.forEach(key => {
        const naYin = data.naYin[key] || "——";
        const element = naYin.slice(-1) === "金" ? "金" : naYin.slice(-1) === "木" ? "木" : naYin.slice(-1) === "水" ? "水" : naYin.slice(-1) === "火" ? "火" : "土";
        const color = data.fiveColors[element] || "#555";
        pillarsHTML += `<td><span class="hidden-stem" style="color:${color}; writing-mode:vertical-rl; text-orientation:mixed; padding: 0px 2px; min-height:46px;">${naYin}</span></td>`;
    });
    pillarsHTML += `</tr><tr>`;
    
    branches.forEach(branch => {
        const hiddens = data.hiddenStems[branch] || [];
        let html = hiddens.map(h => `<span class="hidden-stem" style="color:${data.fiveColors[data.stemsElement[h]]}">${h}</span>`).join('<br>');
        pillarsHTML += `<td style="padding:2px 4px;">${html}</td>`;
    });
    const daHiddens = data.hiddenStems[currentDaYunBranch] || [];
    let daHiddenHTML = daHiddens.map(h => `<span class="hidden-stem" style="color:${data.fiveColors[data.stemsElement[h]]}">${h}</span>`).join('<br>');
    pillarsHTML += `<td style="padding:2px 4px;">${daHiddenHTML}</td>`;
    const liuHiddens = data.hiddenStems[currentLiuNianBranch] || [];
    let liuHiddenHTML = liuHiddens.map(h => `<span class="hidden-stem" style="color:${data.fiveColors[data.stemsElement[h]]}">${h}</span>`).join('<br>');
    pillarsHTML += `<td style="padding:2px 4px;">${liuHiddenHTML}</td>`;
    pillarsHTML += `</tr>`;

    pillarsHTML += `<tr>`;
    const hiddenGodsColumns = [baziResult.branches.hour, baziResult.branches.day, baziResult.branches.month, baziResult.branches.year, currentDaYunBranch, currentLiuNianBranch];
    hiddenGodsColumns.forEach(branch => {
        const hiddens = data.hiddenStems[branch] || [];
        let html = hiddens.map(h => {
            const idx = "甲乙丙丁戊己庚辛壬癸".indexOf(h);
            return `<span class="hidden-stem" style="color:black;">${data.tenGods[dayStem][idx]}</span>`;
        }).join('<br>');
        pillarsHTML += `<td style="padding:2px 4px;">${html}</td>`;
    });
    pillarsHTML += `</tr></table>`;
    
    // ====================== 格局表 ======================
    const tenGodsList1 = ["比肩","食神","偏財","七殺","偏印"];
    const tenGodsList2 = ["劫財","傷官","正財","正官","正印"];

    let patternHTML = `<p style="margin:25px 0 8px; color:#666; font-size:1.05em;">格局表 
        <button id="toggleLuck" style="margin-left:12px; padding:6px 14px; font-size:0.95em; cursor:pointer; border-radius:8px; border:2px solid #8B4513;">運流</button>
    </p>`;

    patternHTML += `<table id="patternTable" class="gods-table" style="font-size:1.1em; margin-bottom:15px; cursor:pointer;">`;
    
    patternHTML += `<tr>`;
    tenGodsList1.forEach((g, i) => {
        patternHTML += `<td id="cell1_${i}" data-god="${g}">${g}<span id="tg1_${i}" style="margin-left:6px;">0/0</span></td>`;
    });
    patternHTML += `</tr>`;
    
    patternHTML += `<tr>`;
    tenGodsList2.forEach((g, i) => {
        patternHTML += `<td id="cell2_${i}" data-god="${g}">${g}<span id="tg2_${i}" style="margin-left:6px;">0/0</span></td>`;
    });
    patternHTML += `</tr>`;
    patternHTML += `</table>`;

    pillarsHTML += patternHTML;

    const dayBranch = data.stemToBranch[dayStem][0];
    const godsList = data.daily12Gods;
    const branchesOrder = data.branchesOrder;
    const daStemMapped = data.stemToBranch[currentDaYunStem][0];
    const liuStemMapped = data.stemToBranch[currentLiuNianStem][0];

    let godsHTML = `<p style="margin:15px 0 8px; color:#666; font-size:1.05em;">神煞表（點擊可查看詳解）</p>`;
    godsHTML += `<table class="gods-table"><tr><th>時</th><th>日</th><th>月</th><th>年</th><th>運</th><th>流</th></tr>`;
    
    godsHTML += `<tr>`;
    ["hour","day","month","year"].forEach((key, idx) => {
        if (idx === 1) {
            godsHTML += `<td><strong>日元</strong></td>`;
        } else {
            const stem = baziResult.stems[key];
            const mappedBranch = data.stemToBranch[stem][0];
            const offset = (branchesOrder.indexOf(mappedBranch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
            const godName = godsList[offset];
            godsHTML += `<td onclick="showGodDetail('${godName}')" style="cursor:pointer;">${godName}</td>`;
        }
    });
    const daStemOffset = (branchesOrder.indexOf(daStemMapped) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    godsHTML += `<td onclick="showGodDetail('${godsList[daStemOffset]}')" style="cursor:pointer;">${godsList[daStemOffset]}</td>`;
    const liuStemOffset = (branchesOrder.indexOf(liuStemMapped) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    godsHTML += `<td onclick="showGodDetail('${godsList[liuStemOffset]}')" style="cursor:pointer;">${godsList[liuStemOffset]}</td>`;
    godsHTML += `</tr>`;

    godsHTML += `<tr>`;
    branches.forEach(branch => {
        const offset = (branchesOrder.indexOf(branch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
        const godName = godsList[offset];
        godsHTML += `<td onclick="showGodDetail('${godName}')" style="cursor:pointer;">${godName}</td>`;
    });
    const daBranchOffset = (branchesOrder.indexOf(currentDaYunBranch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    godsHTML += `<td onclick="showGodDetail('${godsList[daBranchOffset]}')" style="cursor:pointer;">${godsList[daBranchOffset]}</td>`;
    const liuBranchOffset = (branchesOrder.indexOf(currentLiuNianBranch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    godsHTML += `<td onclick="showGodDetail('${godsList[liuBranchOffset]}')" style="cursor:pointer;">${godsList[liuBranchOffset]}</td>`;
    godsHTML += `</tr></table>`;

    let daYunHTML = `<p style="margin:15px 0 8px; color:#666; font-size:1.05em;">大運表（${forward ? '順行' : '逆行'} • 上運 ${luckStartYear} 年）</p>`;
    daYunHTML += `<table class="daiyun"><tr style="background:#f9f7f0; font-weight:bold;">`;
    for (let i = 7; i >= 0; i--) daYunHTML += `<td style="font-size:0.6em;">${daYears[i]}</td>`;
    daYunHTML += `</tr><tr>`;
    for (let i = 7; i >= 0; i--) daYunHTML += `<td><span style="color:${data.fiveColors[data.stemsElement[daStems[i]]]}">${daStems[i]}</span></td>`;
    daYunHTML += `</tr><tr>`;
    for (let i = 7; i >= 0; i--) daYunHTML += `<td><span style="color:${data.fiveColors[data.branchesElement[daBranches[i]]]}">${daBranches[i]}</span></td>`;
    daYunHTML += `</tr></table>`;

    const gregorianLine = `${year}年　${month}月　${day}日　${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
    let hourLabel = baziResult.branches.hour + '時';
    if (baziResult.branches.hour === '子') {
        hourLabel = (hour === 23) ? '夜子時' : '早子時';
    }
    const lunarLine = `${baziResult.lunar.full}　${hourLabel}`;

    let stemBranchHTML = `<p style="margin:25px 0 4px; color:#666; font-size:1.0em;">天干通地支表</p>`;
    stemBranchHTML += `<table class="gods-table" style="font-size:0.7em;"><tr><th>甲</th><th>乙</th><th>丙</th><th>丁</th><th>戊</th><th>己</th><th>庚</th><th>辛</th><th>壬</th><th>癸</th></tr>`;
    stemBranchHTML += `<tr><td>寅</td><td>卯</td><td>巳</td><td>午</td><td>戌</td><td>丑</td><td>申</td><td>酉</td><td>亥</td><td>子</td></tr></table>`;

    let fullGodsHTML = `<p style="margin:25px 0 8px; color:#666; font-size:1.0em;">日家十二神煞表</p>`;
    fullGodsHTML += `<table class="gods-table" style="font-size:0.6em;"><tr>`;
    data.daily12Gods.forEach(god => {
        fullGodsHTML += `<td style="writing-mode:vertical-rl; text-orientation:mixed; padding:4px 4px;">${god}</td>`;
    });
    fullGodsHTML += `</tr></table>`;

    const html = `
        <div class="lunar-line" style="font-size:1.0em;">
            ${gregorianLine}<br>
            ${lunarLine}
        </div>
        ${pillarsHTML}
        ${daYunHTML}
        ${godsHTML}
        <div class="current-term">節氣：${currentTerm.name}　<span style="font-size:0.7em; color:#666;">（${currentTerm.type}）</span></div>
        <div class="days-container">
            <div class="days-box">距離上一個節令<br><strong>${prevJie.name}</strong>　${prevJie.date}<br><span style="font-size:1.3em; color:#8B4513;">${daysToPrev} 天</span></div>
            <div class="days-box">距離下一個節令<br><strong>${nextJie.name}</strong>　${nextJie.date}<br><span style="font-size:1.3em; color:#8B4513;">${daysToNext} 天</span></div>
        </div>
        <div class="source-info">✅ 節氣來源：香港天文台</div>
        ${stemBranchHTML}
        ${fullGodsHTML}
    `;

    document.getElementById('here').innerHTML = html;
    saveToLocal();
    window.baziData = data;
    
    setTimeout(() => {
        const btn = document.getElementById('toggleLuck');
        let includeLuck = true;

        function updatePatternTable() {
            let tgCount = { "比肩":0, "劫財":0, "食神":0, "傷官":0, "偏財":0, "正財":0, "七殺":0, "正官":0, "偏印":0, "正印":0 };
            let cgCount = { ...tgCount };

            let stemsList = [baziResult.stems.hour, baziResult.stems.day, baziResult.stems.month, baziResult.stems.year];
            if (includeLuck) stemsList.push(currentDaYunStem, currentLiuNianStem);
            stemsList.forEach(stem => {
                if (stem === dayStem) {
                    tgCount["日元"] = (tgCount["日元"] || 0) + 1;
                } else {
                    const idx = "甲乙丙丁戊己庚辛壬癸".indexOf(stem);
                    const god = data.tenGods[dayStem][idx];
                    if (god) tgCount[god] = (tgCount[god] || 0) + 1;
                }
            });

            let branchesList = [baziResult.branches.hour, baziResult.branches.day, baziResult.branches.month, baziResult.branches.year];
            if (includeLuck) branchesList.push(currentDaYunBranch, currentLiuNianBranch);
            branchesList.forEach(branch => {
                const hiddens = data.hiddenStems[branch] || [];
                hiddens.forEach(h => {
                    const idx = "甲乙丙丁戊己庚辛壬癸".indexOf(h);
                    const god = data.tenGods[dayStem][idx];
                    if (god) cgCount[god] = (cgCount[god] || 0) + 1;
                });
            });

            const allGods = [...tenGodsList1, ...tenGodsList2];

            allGods.forEach((g, idx) => {
                const tg = tgCount[g] || 0;
                const cg = cgCount[g] || 0;
                const total = tg + cg;
                const isFirstRow = idx < 5;
                const cellId = isFirstRow ? `cell1_${idx}` : `cell2_${idx-5}`;
                const numId  = isFirstRow ? `tg1_${idx}` : `tg2_${idx-5}`;

                const cell = document.getElementById(cellId);
                const numSpan = document.getElementById(numId);
                if (!cell || !numSpan) return;

                numSpan.textContent = `${tg}/${cg}`;

                let fontWeight = 'normal';
                let bgColor = 'transparent';
                let textColor = '#333';

                if (tg === 1 && cg === 1) {
                    fontWeight = 'bold';
                    textColor = '#d32f2f';
                    bgColor = '#f9e79f';
                } else if (total >= 3 && total <= 4) {
                    fontWeight = 'bold';
                    bgColor = '#e0e0e0';
                } else if (total >= 5 && total <= 6) {
                    bgColor = '#a3d8ff';
                } else if (total >= 7) {
                    fontWeight = 'bold';
                    textColor = '#ffffff';
                    bgColor = '#6b46c0';
                }

                cell.style.fontWeight = fontWeight;
                cell.style.backgroundColor = bgColor;
                cell.style.color = textColor;
            });

            btn.style.backgroundColor = includeLuck ? '#8B4513' : '#f9f7f0';
            btn.style.color = includeLuck ? 'white' : '#8B4513';
        }
		
		btn.addEventListener('click', () => {
            includeLuck = !includeLuck;
            updatePatternTable();
        });

        // 初始更新
        updatePatternTable();

        // === 新增：格局表點擊事件委派（解決手機無法點擊問題）===
        const patternTable = document.getElementById('patternTable');
        if (patternTable) {
            patternTable.addEventListener('click', function(e) {
                const td = e.target.closest('td');
                if (td && td.dataset.god) {
                    showTenGodDetail(td.dataset.god);
                }
            });
        }
    }, 100);
}

window.renderBaziFate = renderBaziFate;

