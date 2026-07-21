// bazi-renderer.js - 最新正確版本（2026-06-18）

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

    // 大運計算（改為12個）
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
	// 加強保護：luckStart 最少為 1（避免 0 年就交運的邊界問題）
    if (daysForLuck > 0) {
        luckStart = Math.max(1, luckStart);
    }
    
    const luckStartYear = birthYear + luckStart - 1;   // 保留你原本的 -1

    let daYears = [], daStems = [], daBranches = [];
    let curStem = monthStemIdx;
    let curBranch = monthBranchIdx;
    for (let i = 0; i < 12; i++) {   // ← 改成 12
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
	
	//神煞表 用
    const dayBranch = data.stemToBranch[dayStem][0];
    const godsList = data.daily12Gods;
    const branchesOrder = data.branchesOrder;
    const daStemMapped = data.stemToBranch[currentDaYunStem][0];
    const liuStemMapped = data.stemToBranch[currentLiuNianStem][0];

    // ====================== 四柱八字表 ======================
    let pillarsHTML = `<table class="pillars">`;

    // 年份參考行
    pillarsHTML += `<tr style="font-size:0.6em;">`;
    pillarsHTML += `<td>${birthYear + 105}<br>${birthYear + 45}<br><span class="jiazi-number">${getJiaZiNumber(baziResult.stems.hour + baziResult.branches.hour)}</span></td>`;
    pillarsHTML += `<td>${birthYear + 90}<br>${birthYear + 30}<br><span class="jiazi-number">${getJiaZiNumber(baziResult.stems.day + baziResult.branches.day)}</span></td>`;
    pillarsHTML += `<td>${birthYear + 75}<br>${birthYear + 15}<br><span class="jiazi-number">${getJiaZiNumber(baziResult.stems.month + baziResult.branches.month)}</span></td>`;
    pillarsHTML += `<td>${birthYear + 60}<br>${birthYear}<br><span class="jiazi-number">${getJiaZiNumber(baziResult.stems.year + baziResult.branches.year)}</span></td>`;
    
    // 運的怕X
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
    pillarsHTML += `<td>${luckStemText}<br>${daYunYear || ''}<br><span class="jiazi-number">${getJiaZiNumber(currentDaYunStem + currentDaYunBranch)}</span></td>`;
    pillarsHTML += `<td>${currentRealYear - birthYear + 1}歲<br>${currentRealYear}<br><span class="jiazi-number">${getJiaZiNumber(currentLiuNianStem + currentLiuNianBranch)}</span></td>`;
    pillarsHTML += `</tr>`;

	
	

    // 柱位含義行
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
    
    // 十神行（已使用統一顏色邏輯）
    const stemsForGods = [baziResult.stems.hour, dayStem, baziResult.stems.month, baziResult.stems.year, currentDaYunStem, currentLiuNianStem];
    const stemsListForCount = [baziResult.stems.hour, baziResult.stems.day, baziResult.stems.month, baziResult.stems.year, currentDaYunStem, currentLiuNianStem];
    const branchesListForCount = [baziResult.branches.hour, baziResult.branches.day, baziResult.branches.month, baziResult.branches.year, currentDaYunBranch, currentLiuNianBranch];

	pillarsHTML += `<tr>`;
    stemsForGods.forEach((stem, i) => {
        if (i === 1) {
            const yuanText = isMale ? '元男' : '元女';
            pillarsHTML += `<td><span class="godsformat">${yuanText}</span></td>`;
        } else {
            const god = data.tenGods[dayStem]["甲乙丙丁戊己庚辛壬癸".indexOf(stem)] || '——';
            const style = getTenGodStyle(god, dayStem, data, stemsListForCount, branchesListForCount);
            pillarsHTML += `<td onclick="showTenGodDetail('${god}')" style="cursor:pointer;"><span class="godsformat" style="font-weight:${style.fontWeight}; color:${style.textColor}; text-shadow:${style.textShadow};">${god}</span></td>`;
        }
    });
    pillarsHTML += `</tr>`;


	//神煞表 天干
    pillarsHTML += `<tr>`;
    ["hour","day","month","year"].forEach((key, idx) => {
        if (idx === 1) {
            pillarsHTML += `<td><span class="godsformat"><strong>日元</strong></span></td>`;
        } else {
            const stem = baziResult.stems[key];
            const mappedBranch = data.stemToBranch[stem][0];
            const offset = (branchesOrder.indexOf(mappedBranch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
            const godName = godsList[offset];
            pillarsHTML += `<td onclick="showGodDetail('${godName}')" style="cursor:pointer;"><span class="godsformat">${godName}</span></td>`;
        }
    });
    const daStemOffset = (branchesOrder.indexOf(daStemMapped) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    pillarsHTML += `<td onclick="showGodDetail('${godsList[daStemOffset]}')" style="cursor:pointer;"><span class="godsformat">${godsList[daStemOffset]}</span></td>`;
    const liuStemOffset = (branchesOrder.indexOf(liuStemMapped) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    pillarsHTML += `<td onclick="showGodDetail('${godsList[liuStemOffset]}')" style="cursor:pointer;"><span class="godsformat">${godsList[liuStemOffset]}</td>`;
    pillarsHTML += `</span></tr>`;



    // 天干行（已依位置調整深淺）
    const dayElement = data.stemsElement[dayStem];
    const baseColor = data.fiveColors[dayElement] || '#fff2cc';

    // 定義深淺版本
    const colorMap = {
        "金": { dark: "#d4af37", medium: "#f8e8b0", light: "#fff9d0", light2: "#fffdf0" },
        "木": { dark: "#228B22", medium: "#90ee90", light: "#c1f0c1", light2: "#e0ffe0" },
        "火": { dark: "#ff4500", medium: "#ff9999", light: "#ffc1c1", light2: "#ffe0e0" },
        "水": { dark: "#1e90ff", medium: "#87cefa", light: "#b0e0ff", light2: "#d0f0ff" },
        "土": { dark: "#cd853f", medium: "#f4c48c", light: "#ffe8b8", light2: "#fff4d8" }
    }[dayElement] || { dark: baseColor, medium: baseColor, light: baseColor, light2: baseColor };

    pillarsHTML += `<tr>`;
    ["hour","day","month","year"].forEach((key, idx) => {
        const stem = baziResult.stems[key];
        const color = data.fiveColors[data.stemsElement[stem]];
        const isYang = ["甲","丙","戊","庚","壬"].includes(stem);
        let bg = colorMap.medium;
        if (idx === 1) bg = colorMap.dark;        // 日干 - 深一級
        if (idx === 3) bg = colorMap.light;       // 年干 - 淺一級
        pillarsHTML += `<td style="background:${bg};"><span style="color:${color}; font-size:1.15em;" class="${isYang ? 'yang-stem' : 'yin-stem'}">${stem}</span></td>`;
    });
	// 當前大運天干
	const daStemColor = data.fiveColors[data.stemsElement[currentDaYunStem]];
	const isYangDaStem = ["甲","丙","戊","庚","壬"].includes(currentDaYunStem);
	pillarsHTML += `<td><span style="color:${daStemColor}; font-size:1.15em;" class="${isYangDaStem ? 'yang-stem' : 'yin-stem'}">${currentDaYunStem}</span></td>`;

	// 當前流年天干
	const liuStemColor = data.fiveColors[data.stemsElement[currentLiuNianStem]];
	const isYangLiuStem = ["甲","丙","戊","庚","壬"].includes(currentLiuNianStem);
	pillarsHTML += `<td><span style="color:${liuStemColor}; font-size:1.15em;" class="${isYangLiuStem ? 'yang-stem' : 'yin-stem'}">${currentLiuNianStem}</span></td>`;
    pillarsHTML += `</tr><tr>`;

	// 地支行（已依位置調整深淺）
	branches.forEach((branch, idx) => {
		const color = data.fiveColors[data.branchesElement[branch]];
		const isYang = ["子","寅","辰","午","申","戌"].includes(branch);
		let bg = colorMap.medium;
		if (idx === 0) bg = colorMap.light;      // 時支 - 淺一級
		if (idx === 2) bg = colorMap.light;      // 月支 - 淺一級
		if (idx === 3) bg = colorMap.light2;     // 年支 - 淺二級
		pillarsHTML += `<td style="background:${bg};"><span style="color:${color}; font-size:1.15em;" class="branch ${isYang ? 'yang-branch' : 'yin-branch'}">${branch}</span></td>`;
	});	

	// 當前大運地支
	const daBranchColor = data.fiveColors[data.branchesElement[currentDaYunBranch]];
	const isYangDaBranch = ["子","寅","辰","午","申","戌"].includes(currentDaYunBranch);
	pillarsHTML += `<td><span style="color:${daBranchColor}; font-size:1.15em;" class="branch ${isYangDaBranch ? 'yang-branch' : 'yin-branch'}">${currentDaYunBranch}</span></td>`;

	// 當前流年地支
	const liuBranchColor = data.fiveColors[data.branchesElement[currentLiuNianBranch]];
	const isYangLiuBranch = ["子","寅","辰","午","申","戌"].includes(currentLiuNianBranch);
	pillarsHTML += `<td><span style="color:${liuBranchColor}; font-size:1.15em;" class="branch ${isYangLiuBranch ? 'yang-branch' : 'yin-branch'}">${currentLiuNianBranch}</span></td>`;
    pillarsHTML += `</tr>`;

    // 納音五行 + 五勝六忌標記
    pillarsHTML += `<tr>`;
    const naYinColumns = [
        baziResult.stems.hour + baziResult.branches.hour,
        baziResult.stems.day + baziResult.branches.day,
        baziResult.stems.month + baziResult.branches.month,
        baziResult.stems.year + baziResult.branches.year,
        currentDaYunStem + currentDaYunBranch,
        currentLiuNianStem + currentLiuNianBranch
    ];

    naYinColumns.forEach((key, index) => {
        const naYin = data.naYin[key] || "——";
        const element = naYin.slice(-1) === "金" ? "金" : naYin.slice(-1) === "木" ? "木" : naYin.slice(-1) === "水" ? "水" : naYin.slice(-1) === "火" ? "火" : "土";
        const color = data.fiveColors[element] || "#555";

        // 五勝六忌標記
        let markHTML = "";
        const relations = data.naYinRelations || { fiveWins: [], sixTaboos: [] };

        const isWinner = relations.fiveWins.some(r => r.winner === naYin);
        const isLoser = relations.fiveWins.some(r => r.loser === naYin);
        const isAvoider = relations.sixTaboos.some(r => r.avoider === naYin);
        const isAvoided = relations.sixTaboos.some(r => r.avoided === naYin);

        if (isWinner) markHTML += `<span style="color:#006400; font-size:0.6em;">勝</span> `;
        if (isLoser) markHTML += `<span style="color:#8B0000; font-size:0.6em;">負</span> `;
        if (isAvoider) markHTML += `<span style="color:#8B0000; font-size:0.6em;">忌</span> `;
        if (isAvoided) markHTML += `<span style="color:#8B0000; font-size:0.6em;">忌</span> `;

        pillarsHTML += `<td onclick="showNaYinDetail('${naYin}')" style="cursor:pointer; vertical-align:top;">`;
        pillarsHTML += `<span class="naYin-text" style="color:${color}; writing-mode:vertical-rl; text-orientation:mixed; padding: 0px 2px; min-height:46px;">${naYin}</span>`;
        if (markHTML) {
            pillarsHTML += `<br>${markHTML}`;
        }
        pillarsHTML += `</td>`;
    });
    pillarsHTML += `</tr><tr>`;

	//神煞表 地干
    pillarsHTML += `<tr>`;
    branches.forEach(branch => {
        const offset = (branchesOrder.indexOf(branch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
        const godName = godsList[offset];
        pillarsHTML += `<td onclick="showGodDetail('${godName}')" style="cursor:pointer;"><span class="godsformat">${godName}</span></td>`;
    });
    const daBranchOffset = (branchesOrder.indexOf(currentDaYunBranch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    pillarsHTML += `<td onclick="showGodDetail('${godsList[daBranchOffset]}')" style="cursor:pointer;"><span class="godsformat">${godsList[daBranchOffset]}</span></td>`;
    const liuBranchOffset = (branchesOrder.indexOf(currentLiuNianBranch) - branchesOrder.indexOf(dayBranch) + 12) % 12;
    pillarsHTML += `<td onclick="showGodDetail('${godsList[liuBranchOffset]}')" style="cursor:pointer;"><span class="godsformat">${godsList[liuBranchOffset]}</span></td>`;
    pillarsHTML += `</tr>`;


// 支藏（藏干） + 右邊加上對應十神（已套用顏色邏輯）
branches.forEach(branch => {
    const hiddens = data.hiddenStems[branch] || [];
    let html = hiddens.map(h => {
        const hColor = data.fiveColors[data.stemsElement[h]] || "#555";
        const isYang = ["甲","丙","戊","庚","壬"].includes(h);
        const idx = "甲乙丙丁戊己庚辛壬癸".indexOf(h);
        const tenGod = data.tenGods[dayStem][idx] || "——";
        const style = getTenGodStyle(tenGod, dayStem, data, stemsListForCount, branchesListForCount);  // 套用顏色

        return `<span class="hidden-stem ${isYang ? 'yang-stem' : 'yin-stem'}" style="color:${hColor}">${h}</span> 
                <span class="hidden-stem" style="font-weight:${style.fontWeight}; color:${style.textColor}; text-shadow:${style.textShadow};">${tenGod}</span>`;
    }).join('<br>');
    pillarsHTML += `<td style="padding:2px 4px; line-height:1.1;">${html}</td>`;
});

// 當前大運支藏 + 十神
const daHiddens = data.hiddenStems[currentDaYunBranch] || [];
let daHiddenHTML = daHiddens.map(h => {
    const hColor = data.fiveColors[data.stemsElement[h]] || "#555";
    const isYang = ["甲","丙","戊","庚","壬"].includes(h);
    const idx = "甲乙丙丁戊己庚辛壬癸".indexOf(h);
    const tenGod = data.tenGods[dayStem][idx] || "——";
    const style = getTenGodStyle(tenGod, dayStem, data, stemsListForCount, branchesListForCount);

    return `<span class="hidden-stem ${isYang ? 'yang-stem' : 'yin-stem'}" style="color:${hColor}">${h}</span> 
            <span class="hidden-stem" style="font-weight:${style.fontWeight}; color:${style.textColor}; text-shadow:${style.textShadow};">${tenGod}</span>`;
}).join('<br>');
pillarsHTML += `<td style="padding:2px 4px; line-height:1.1;">${daHiddenHTML}</td>`;

// 當前流年支藏 + 十神
const liuHiddens = data.hiddenStems[currentLiuNianBranch] || [];
let liuHiddenHTML = liuHiddens.map(h => {
    const hColor = data.fiveColors[data.stemsElement[h]] || "#555";
    const isYang = ["甲","丙","戊","庚","壬"].includes(h);
    const idx = "甲乙丙丁戊己庚辛壬癸".indexOf(h);
    const tenGod = data.tenGods[dayStem][idx] || "——";
    const style = getTenGodStyle(tenGod, dayStem, data, stemsListForCount, branchesListForCount);

    return `<span class="hidden-stem ${isYang ? 'yang-stem' : 'yin-stem'}" style="color:${hColor}">${h}</span> 
            <span class="hidden-stem" style="font-weight:${style.fontWeight}; color:${style.textColor}; text-shadow:${style.textShadow};">${tenGod}</span>`;
}).join('<br>');
pillarsHTML += `<td style="padding:2px 4px; line-height:1.1;">${liuHiddenHTML}</td>`;

    // ====================== 新增：神煞行（空亡） ======================
    pillarsHTML += `<tr style="font-size:0.75em; background:#f9f7f0;">`;
    const dayPillar = baziResult.stems.day + baziResult.branches.day;
    const kongWangBranches = data.kongWang[dayPillar] || [];
    
    const allBranches = [
        baziResult.branches.hour,
        baziResult.branches.day,
        baziResult.branches.month,
        baziResult.branches.year,
        currentDaYunBranch,
        currentLiuNianBranch
    ];

    allBranches.forEach(branch => {
        const isKongWang = kongWangBranches.includes(branch);
        pillarsHTML += `<td style="color:${isKongWang ? '#8B0000' : '#666'};">${isKongWang ? '空亡' : '——'}</td>`;
    });
    pillarsHTML += `</tr>`;


    pillarsHTML += `</tr></table>`;

    // 格局表（保持原樣）
    const tenGodsList1 = ["比肩","食神","偏財","七殺","偏印"];
    const tenGodsList2 = ["劫財","傷官","正財","正官","正印"];

    let patternHTML = `<p style="margin:25px 0 8px; color:#666; font-size:1.05em;">格局表 
        <button id="toggleLuck" style="margin-left:12px; padding:6px 14px; font-size:0.95em; cursor:pointer; border-radius:8px; border:2px solid #8B4513;">運流</button>
    </p>`;
    patternHTML += `<table id="patternTable" class="gods-table" style="font-size:1.1em; margin-bottom:15px;">`;
    patternHTML += `<tr>`;
    tenGodsList1.forEach((g, i) => {
        patternHTML += `<td id="cell1_${i}" data-god="${g}">${g}<span id="tg1_${i}" style="margin-left:6px;">0/0</span></td>`;
    });
    patternHTML += `</tr>`;
    patternHTML += `<tr>`;
    tenGodsList2.forEach((g, i) => {
        patternHTML += `<td id="cell2_${i}" data-god="${g}">${g}<span id="tg2_${i}" style="margin-left:6px;">0/0</span></td>`;
    });
    patternHTML += `</tr></table>`;
    //pillarsHTML += patternHTML;

    // 大運表（12 個 + 連續流年 3 行，從目前正在行的大運開始）
	let daYunHTML = `<table class="daiyun">
	<tr><td colspan="12" style="color:#666; font-size:0.8em; border-left: none; border-top: none; border-right: none; text-align: center;">大運表（${forward ? '順行' : '逆行'} • 上運 ${luckStartYear} 年）</td></tr><tr style="background:#f9f7f0; font-weight:bold;">`;
	
    // 第1行：大運年份（每隔10年）
    for (let i = 11; i >= 0; i--) {
        const y = daYears[i];
        daYunHTML += `<td onclick="setCurrentYear(${y})" style="cursor:pointer; font-size:0.6em;">${y}</td>`;
    }
    daYunHTML += `</tr><tr>`;
    
    // 第2行：大運天干（點擊切換對應年份）
    for (let i = 11; i >= 0; i--) {
        const s = daStems[i];
        const isYang = ["甲","丙","戊","庚","壬"].includes(s);
        const y = daYears[i];
        daYunHTML += `<td onclick="setCurrentYear(${y})" style="cursor:pointer;"><span style="color:${data.fiveColors[data.stemsElement[s]]}" class="${isYang ? 'yang-stem' : 'yin-stem'}">${s}</span></td>`;
    }
    daYunHTML += `</tr><tr>`;
    
    // 第3行：大運地支（點擊切換對應年份）
	for (let i = 11; i >= 0; i--) {
		const b = daBranches[i];
		const isYang = ["子","寅","辰","午","申","戌"].includes(b);
        const y = daYears[i];
		daYunHTML += `<td onclick="setCurrentYear(${y})" style="cursor:pointer;"><span style="color:${data.fiveColors[data.branchesElement[b]]}" class="branch ${isYang ? 'yang-branch' : 'yin-branch'}">${b}</span></td>`;
	}
    daYunHTML += `</tr>`;

    // ========== 第4行：連續流年年份 ==========
    const currentDaYunStartYear = daYears[currentDaYunIdx];
    daYunHTML += `<tr style="background:#f9f7f0; font-size:0.6em;">`;
    for (let i = 11; i >= 0; i--) {
        const liuYear = currentDaYunStartYear + i;
        daYunHTML += `<td onclick="setCurrentYear(${liuYear})" style="cursor:pointer;">${liuYear}</td>`;
    }
    daYunHTML += `</tr>`;

    // ========== 第5行：連續流年年干 ==========
    daYunHTML += `<tr>`;
    for (let i = 11; i >= 0; i--) {
        const liuYear = currentDaYunStartYear + i;
        const yBazi = window.getBazi(liuYear, 6, 15, 12, 0);
        const yStem = yBazi.stems.year;
        const isYang = ["甲","丙","戊","庚","壬"].includes(yStem);
        daYunHTML += `<td onclick="setCurrentYear(${liuYear})" style="cursor:pointer;"><span style="color:${data.fiveColors[data.stemsElement[yStem]]}" class="${isYang ? 'yang-stem' : 'yin-stem'}">${yStem}</span></td>`;
    }
    daYunHTML += `</tr>`;

    // ========== 第6行：連續流年年支 ==========
    daYunHTML += `<tr>`;
    for (let i = 11; i >= 0; i--) {
        const liuYear = currentDaYunStartYear + i;
        const yBazi = window.getBazi(liuYear, 6, 15, 12, 0);
        const yBranch = yBazi.branches.year;
        const isYang = ["子","寅","辰","午","申","戌"].includes(yBranch);
        daYunHTML += `<td onclick="setCurrentYear(${liuYear})" style="cursor:pointer;"><span style="color:${data.fiveColors[data.branchesElement[yBranch]]}" class="branch ${isYang ? 'yang-branch' : 'yin-branch'}">${yBranch}</span></td>`;
    }
    daYunHTML += `</tr></table>`;

    const gregorianLine = `${year}年　${month}月　${day}日　${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
    let hourLabel = baziResult.branches.hour + '時';
    if (baziResult.branches.hour === '子') {
        hourLabel = (hour === 23) ? '夜子時' : '早子時';
    }
    const lunarLine = `${baziResult.lunar.full}　${hourLabel}`;

	//天干通地支表
    //let baziDataTable = `<p style="margin:25px 0 4px; color:#666; font-size:1.0em;">天干通地支表</p>`;	
    //baziDataTable += `<table class="gods-table" style="font-size:0.7em;">
	let baziDataTable = `<table class="gods-table">
						<tr><td colspan="12" style="color:#666; border-left: none; border-top: none; border-right: none; text-align: center;">天干通地支表</td></tr>
						<tr><th>甲</th><th>乙</th><th>丙</th><th>丁</th><th>戊</th><th>己</th><th>庚</th><th>辛</th><th>壬</th><th>癸</th><th></th><th></th></tr>`;
    baziDataTable += `<tr><td>寅</td><td>卯</td><td>巳</td><td>午</td><td>戌</td><td>丑</td><td>申</td><td>酉</td><td>亥</td><td>子</td><td>辰</td><td>未</td></tr>
	
	<tr><td colspan="12" style="color:#666; border-left: none; border-top: none; border-right: none; text-align: center;">地支藏干表</td></tr>
	
	<tr><td style="writing-mode: vertical-rl;">甲丙戊</td><td style="writing-mode: vertical-rl;">乙</td><td style="writing-mode: vertical-rl;">庚丙戊</td><td style="writing-mode: vertical-rl;">丁己</td><td style="writing-mode: vertical-rl;">辛丁戊</td><td style="writing-mode: vertical-rl;">癸辛己</td><td style="writing-mode: vertical-rl;">庚壬戊</td><td style="writing-mode: vertical-rl;">辛</td><td style="writing-mode: vertical-rl;">甲壬</td><td style="writing-mode: vertical-rl;">癸</td><td style="writing-mode: vertical-rl;">乙戊癸</td><td style="writing-mode: vertical-rl;">乙己</td></tr>
	
	
	<tr><td colspan="12" style="color:#666; font-size:0.8em; border-left: none; border-top: none; border-right: none; text-align: center;">日家十二神煞表</td></tr><tr>`;
	
	    data.daily12Gods.forEach(god => {
        baziDataTable += `<td style="writing-mode:vertical-rl; text-orientation:mixed;">${god}</td>`;
    });
    baziDataTable += `</tr></table>`;
	
	


	//節氣
    const html = `
        <div class="lunar-line" style="font-size:1.0em;">
            ${gregorianLine}<br>
            ${lunarLine}
        </div>

		${pillarsHTML}           <!-- 四柱表 -->
        ${daYunHTML}             <!-- 大運表 -->


        <div class="current-term">節氣：${currentTerm.name}　<span style="font-size:0.7em; color:#666;">（${currentTerm.type}）</span></div>
        <div class="days-container">
            <div class="days-box">距離上一個節令<br><strong>${prevJie.name}</strong>　${prevJie.date}<br><span style="font-size:1.3em; color:#8B4513;">${daysToPrev} 天</span></div>
            <div class="days-box">距離下一個節令<br><strong>${nextJie.name}</strong>　${nextJie.date}<br><span style="font-size:1.3em; color:#8B4513;">${daysToNext} 天</span></div>
        </div>
        <div class="source-info">✅ 節氣來源：香港天文台</div>
		${patternHTML}           <!-- 格局表（移到這裡） -->
		${baziDataTable}
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

			// 天干統計（自己日干不計入比肩，其他位置的比肩要計入）
			let stemsList = [baziResult.stems.hour, baziResult.stems.day, baziResult.stems.month, baziResult.stems.year];
			if (includeLuck) stemsList.push(currentDaYunStem, currentLiuNianStem);

			stemsList.forEach((stem, idx) => {
				if (idx === 1) {
					// 自己日干（日元）不計入比肩
					tgCount["日元"] = (tgCount["日元"] || 0) + 1;
				} else {
					const godIdx = "甲乙丙丁戊己庚辛壬癸".indexOf(stem);
					const god = data.tenGods[dayStem][godIdx];
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
                let textColor = '#333';
                let textShadow = 'none';

                // 計算有多少個十神達到 1/1，以及是否有其他強格
                let oneOneCount = 0;
                let hasStrongPattern = false;

                allGods.forEach(g2 => {
                    const t = tgCount[g2] || 0;
                    const c = cgCount[g2] || 0;
                    const tot = t + c;
                    if (t === 1 && c === 1) oneOneCount++;
                    if (tot >= 3) hasStrongPattern = true;
                });

                if (tg === 1 && cg === 1 && oneOneCount === 1 && !hasStrongPattern) {
                    // 剛好只有一個 1/1 且沒有其他強格 → 紅色 + 黃色陰影
                    fontWeight = 'bold';
                    textColor = '#d32f2f';
                    textShadow = '0 0 6px #ffeb3b, 0 0 12px #ffeb3b';
                } else if (total >= 3 && total <= 4 || (tg === 1 && cg === 1 && (oneOneCount > 1 || hasStrongPattern))) {
                    // 3~4 或有多個 1/1 或有其他強格 → 灰色陰影（不用粗體）
                    textShadow = '0 0 4px #888, 0 0 8px #666';
                } else if (total >= 5 && total <= 6) {
                    // 5~6 → 藍色陰影（不用粗體）
                    textShadow = '0 0 5px #4da6ff, 0 0 10px #3399ff';
                } else if (total >= 7) {
                    fontWeight = 'bold';
                    textColor = '#ffffff';
                    textShadow = '0 0 6px #6b46c0, 0 0 12px #8b5cf6';
                }

                cell.style.fontWeight = fontWeight;
                cell.style.color = textColor;
                cell.style.textShadow = textShadow;
                cell.style.backgroundColor = 'transparent';
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


// 點擊納音 → MessageBox 詳細解釋（已加入大運流年五勝六忌）
function showNaYinDetail(naYinName) {
    const data = window.baziData;
    if (!data) {
        alert("資料尚未載入");
        return;
    }

    const meaning = data.naYinMeaning ? data.naYinMeaning[naYinName] : null;
    const relations = data.naYinRelations || { fiveWins: [], sixTaboos: [] };
    const fiveElements = data.naYinFiveElements || {};

    // 取得六十甲子
    let jiaZiStr = meaning && meaning.pillars ? meaning.pillars.join("、") : "";
    let title = naYinName;
    if (jiaZiStr) title += ` (${jiaZiStr})`;

    let contentHTML = "";

    // 五行屬性
    const element = naYinName.slice(-1);
    const five = fiveElements[element];
    if (five) {
        contentHTML += `<div style="background:#f9f7f0; padding:12px; border-radius:8px; margin-bottom:15px;">`;
        contentHTML += `<p style="margin:4px 0;"><strong>五音：</strong>${five.wuYin}</p>`;
        contentHTML += `<p style="margin:4px 0;"><strong>五臟：</strong>${five.wuZang}</p>`;
        contentHTML += `<p style="margin:4px 0;"><strong>五腑：</strong>${five.wuFu}</p>`;
        contentHTML += `<p style="margin:4px 0;"><strong>外連：</strong>${five.waiLian}</p>`;
        contentHTML += `<p style="margin:4px 0;"><strong>情志：</strong>${five.qingZhi}</p>`;
        contentHTML += `<p style="margin:4px 0;"><strong>五德：</strong>${five.wuDe}</p>`;
        contentHTML += `</div>`;
    }

    // 納音本義
    if (meaning && meaning.content) {
        contentHTML += `<p style="color:#444; line-height:1.7;">${meaning.content}</p><br>`;
    }

    // 五勝
    const wins = relations.fiveWins.filter(r => r.winner === naYinName || r.loser === naYinName);
    if (wins.length > 0) {
        contentHTML += `<p style="color:#006400; font-weight:bold; margin:12px 0 6px;">五勝：</p>`;
        wins.forEach(r => {
            contentHTML += `<p style="margin:3px 0;">${r.winner} 勝 ${r.loser}</p>`;
        });
    }

    // 六忌
    const taboos = relations.sixTaboos.filter(r => r.avoider === naYinName || r.avoided === naYinName);
    if (taboos.length > 0) {
        contentHTML += `<p style="color:#8B0000; font-weight:bold; margin:12px 0 6px;">六忌：</p>`;
        taboos.forEach(r => {
            contentHTML += `<p style="margin:3px 0;">${r.avoider} 忌 ${r.avoided}</p>`;
        });
    }

    // ====================== 新增：出生至120歲的大運流年 ======================
    const dateInput = document.getElementById('mydate').value;
    const birthYear = dateInput ? parseInt(dateInput.split('-')[0]) : 1980;
    const endYear = birthYear + 120;

    let relatedHTML = `<p style="margin-top:18px; color:#8B4513; font-weight:bold;">出生至120歲會遇到的五勝六忌：</p>`;
    let hasRelated = false;

    // 收集所有相關納音
    const relatedNaYins = new Set();
    wins.forEach(r => { relatedNaYins.add(r.winner); relatedNaYins.add(r.loser); });
    taboos.forEach(r => { relatedNaYins.add(r.avoider); relatedNaYins.add(r.avoided); });

    for (let y = birthYear; y <= endYear; y++) {
        const yearBazi = window.getBazi(y, 6, 15, 12, 0);
        if (yearBazi.error) continue;

        const yearPillar = yearBazi.stems.year + yearBazi.branches.year;
        const yearNaYin = data.naYin[yearPillar];
        if (!yearNaYin) continue;

        if (relatedNaYins.has(yearNaYin)) {
            hasRelated = true;
            const isWin = wins.some(r => r.winner === yearNaYin || r.loser === yearNaYin);
            const isTaboo = taboos.some(r => r.avoider === yearNaYin || r.avoided === yearNaYin);

            let tag = "";
            if (isWin) tag += `<span style="color:#006400;">勝</span>`;
            if (isTaboo) tag += `<span style="color:#8B0000;">忌</span>`;

            relatedHTML += `<p style="margin:3px 0;">${y}年　${yearNaYin}　${tag}</p>`;
        }
    }

    if (hasRelated) {
        contentHTML += relatedHTML;
    } else {
        contentHTML += `<p style="color:#666; margin-top:12px;">出生至120歲內無相關五勝六忌。</p>`;
    }
    // ====================== 新增結束 ======================

    showMessageBox(title, contentHTML);
}

window.showNaYinDetail = showNaYinDetail;

// 取得六十甲子號碼 (1~60) - 正確版
function getJiaZiNumber(pillar) {
    if (!pillar || pillar.length !== 2) return "—";
    
    const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
    const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
    
    const allJiaZi = [];
    for (let i = 0; i < 60; i++) {
        const s = stems[i % 10];
        const b = branches[i % 12];
        allJiaZi.push(s + b);
    }
    
    const index = allJiaZi.indexOf(pillar);
    return index !== -1 ? index + 1 : "—";
}

// 十神顏色邏輯（完整版，可重用）
function getTenGodStyle(god, dayStem, data, stemsList, branchesList) {
    let tgCount = { "比肩":0, "劫財":0, "食神":0, "傷官":0, "偏財":0, "正財":0, "七殺":0, "正官":0, "偏印":0, "正印":0 };
    let cgCount = { ...tgCount };

    // 天干計數
    stemsList.forEach((stem, idx) => {
        if (idx === 1) {
            tgCount["日元"] = (tgCount["日元"] || 0) + 1;
        } else {
            const godIdx = "甲乙丙丁戊己庚辛壬癸".indexOf(stem);
            const g = data.tenGods[dayStem][godIdx];
            if (g) tgCount[g] = (tgCount[g] || 0) + 1;
        }
    });

    // 藏干計數
    branchesList.forEach(branch => {
        const hiddens = data.hiddenStems[branch] || [];
        hiddens.forEach(h => {
            const godIdx = "甲乙丙丁戊己庚辛壬癸".indexOf(h);
            const g = data.tenGods[dayStem][godIdx];
            if (g) cgCount[g] = (cgCount[g] || 0) + 1;
        });
    });

    const tg = tgCount[god] || 0;
    const cg = cgCount[god] || 0;
    const total = tg + cg;

    let fontWeight = 'normal';
    let textColor = '#333';
    let textShadow = 'none';

    let oneOneCount = 0;
    Object.keys(tgCount).forEach(g2 => {
        if ((tgCount[g2]||0) === 1 && (cgCount[g2]||0) === 1) oneOneCount++;
    });

    let hasStrongPattern = Object.keys(tgCount).some(g2 => (tgCount[g2]||0) + (cgCount[g2]||0) >= 3);

    if (tg === 1 && cg === 1 && oneOneCount === 1 && !hasStrongPattern) {
        fontWeight = 'bold';
        textColor = '#d32f2f';
        textShadow = '0 0 6px #ffeb3b, 0 0 12px #ffeb3b';
    } else if (total >= 3 && total <= 4 || (tg === 1 && cg === 1 && (oneOneCount > 1 || hasStrongPattern))) {
        textShadow = '0 0 4px #888, 0 0 8px #666';
    } else if (total >= 5 && total <= 6) {
        textShadow = '0 0 5px #4da6ff, 0 0 10px #3399ff';
    } else if (total >= 7) {
        fontWeight = 'bold';
        textColor = '#ffffff';
        textShadow = '0 0 6px #6b46c0, 0 0 12px #8b5cf6';
    }

    return { fontWeight, textColor, textShadow };
}

// 點擊大運/流年 → 切換 currentYear 並重新計算
function setCurrentYear(year) {
    document.getElementById('currentYear').value = `${year}-01-01`;   // 補上月日
    queryBaziFate();   // 重新計算命盤
}
