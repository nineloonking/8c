<!-- 把下面這段完整程式碼，取代你原本 bazi-calculator.js 的內容（或直接複製貼上覆蓋） -->
<!-- 新增功能：getSolarTerms(year) 可取得該年全部 24 節氣的精準香港時間 -->

<script>
// ====================== 原有所有程式碼（不變） ======================
const sTermInfo = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];

function generateSolarTerms(year) {
    const base = Date.UTC(1900, 0, 6, 2, 5);
    let terms = [];
    for (let i = 0; i < 24; i++) {
        let offset = 31556925974.7 * (year - 1900) + sTermInfo[i] * 60000;
        let termTime = base + offset;
        terms.push(new Date(termTime).toISOString());
    }
    return terms;
}

// （以下所有原有函數：lunarInfo、getLunarYearDays、getLeapMonth...、getLunar、getinrange、finddifference、findSurroundingDates、window.getBazi 全部保留不變）
const lunarInfo = [0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,0x0d520];

const chineseMonth = ["正","二","三","四","五","六","七","八","九","十","十一","十二"];
const chineseDay = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];
const stems = ["", "甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BranchesNamesshort = ["","子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

function getLunarYearDays(year) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[year - 1900] & i) ? 1 : 0;
    return sum + getLeapDays(year);
}
function getLeapMonth(year) { return lunarInfo[year - 1900] & 0xf; }
function getLeapDays(year) {
    if (getLeapMonth(year)) return (lunarInfo[year - 1900] & 0x10000) ? 30 : 29;
    return 0;
}
function getMonthDays(year, month) {
    return (lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}
function getLunar(sy, sm, sd) {
    let base = Date.UTC(1900, 0, 31);
    let target = Date.UTC(sy, sm - 1, sd);
    let diff = Math.floor((target - base) / 86400000);
    let year = 1900;
    while (diff > 0) {
        let days = getLunarYearDays(year);
        if (diff < days) break;
        diff -= days;
        year++;
    }
    let lunarYear = year;
    let leap = getLeapMonth(lunarYear);
    let isLeap = false;
    let month = 1;
    let temp = 0;
    for (month = 1; month <= 12; month++) {
        if (leap > 0 && month === leap + 1 && !isLeap) {
            month--; isLeap = true; temp = getLeapDays(lunarYear);
        } else {
            temp = getMonthDays(lunarYear, month);
        }
        if (diff < temp) break;
        diff -= temp;
        if (isLeap && month === leap) isLeap = false;
    }
    return { year: lunarYear, month: month, day: diff + 1, isLeap: isLeap };
}
function getinrange(number, range) {
    while (number > range) number -= range;
    while (number <= 0) number += range;
    return number;
}
function finddifference(StartDate, EndDate) {
    let enddatetemp = new Date(EndDate);
    const oneDay = 24 * 60 * 60 * 1000;
    enddatetemp.setHours(0,0,0,0); StartDate.setHours(0,0,0,0);
    return Math.round(Math.abs((enddatetemp - StartDate) / oneDay));
}
function findSurroundingDates(dateArray, targetDate) {
    const target = new Date(targetDate).getTime();
    let low = 0, high = dateArray.length - 1;
    if (target < new Date(dateArray[0]).getTime()) return { beforeIndex: null, afterIndex: 0 };
    if (target > new Date(dateArray[high]).getTime()) return { beforeIndex: high, afterIndex: null };
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midTime = new Date(dateArray[mid]).getTime();
        if (midTime === target) return { beforeIndex: mid, afterIndex: mid };
        else if (midTime < target) low = mid + 1;
        else high = mid - 1;
    }
    return { beforeIndex: high, afterIndex: low };
}

// ====================== 原有 getBazi API（不變） ======================
window.getBazi = function(year, month, day, hour = 0, minute = 0) {
    // （原 getBazi 完整內容，完全不變）
    try {
        if (year < 1900 || year > 2100) return { error: '目前支援 1900～2100 年' };
        let workingdates = generateSolarTerms(year);
        let comparedate = new Date(); comparedate.setFullYear(1); comparedate.setDate(1); comparedate.setMonth(0);
        let dateafteradjustment = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        let datediff = finddifference(comparedate, dateafteradjustment);
        let daystem = getinrange((datediff % 10) + 6, 10);
        let daybranch = getinrange((datediff % 12) + 4, 12);
        let utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, 0) - (8 * 3600 * 1000);
        let utcDate = new Date(utcTimestamp);
        let surroundingindex = findSurroundingDates(workingdates, utcDate.toISOString());
        let previoussolartermindex = surroundingindex.beforeIndex ?? -1;
        let yearstem = ((year - 3) % 10) || 10;
        let yearbranch = ((year - 3) % 12) || 12;
        if (previoussolartermindex < 2) {
            yearstem = getinrange(yearstem - 1, 10);
            yearbranch = getinrange(yearbranch - 1, 12);
        }
        let last_jie_index = (previoussolartermindex === -1) ? 22 : (previoussolartermindex % 2 === 1 ? previoussolartermindex - 1 : previoussolartermindex);
        let monthbranch = getinrange((last_jie_index / 2) + 2, 12);
        let solarmonth = getinrange(monthbranch - 2, 12);
        let monthstem = getinrange(((yearstem % 5) * 2) + solarmonth, 10);
        let hourbranch = (Math.floor((hour + 1) / 2) % 12) + 1;
        let starting_stem = ((daystem * 2 - 1) % 10) || 10;
        let hourstem = getinrange(starting_stem + hourbranch - 1, 10);

        let lunar = getLunar(year, month, day);
        let lunarYearStem = ((lunar.year - 3) % 10) || 10;
        let lunarYearBranch = ((lunar.year - 3) % 12) || 12;
        let lunarYearStr = stems[lunarYearStem] + BranchesNamesshort[lunarYearBranch];
        let isLeapStr = lunar.isLeap ? '閏' : '';
        let lunarMonthStr = chineseMonth[lunar.month - 1];
        let lunarDayStr = chineseDay[lunar.day - 1];

        return {
            baziString: `${stems[yearstem]}${BranchesNamesshort[yearbranch]}　${stems[monthstem]}${BranchesNamesshort[monthbranch]}　${stems[daystem]}${BranchesNamesshort[daybranch]}　${stems[hourstem]}${BranchesNamesshort[hourbranch]}`,
            pillars: { year: stems[yearstem] + BranchesNamesshort[yearbranch], month: stems[monthstem] + BranchesNamesshort[monthbranch], day: stems[daystem] + BranchesNamesshort[daybranch], hour: stems[hourstem] + BranchesNamesshort[hourbranch] },
            stems: { year: stems[yearstem], month: stems[monthstem], day: stems[daystem], hour: stems[hourstem] },
            branches: { year: BranchesNamesshort[yearbranch], month: BranchesNamesshort[monthbranch], day: BranchesNamesshort[daybranch], hour: BranchesNamesshort[hourbranch] },
            lunar: { year: lunarYearStr, month: isLeapStr + lunarMonthStr, day: lunarDayStr, full: `${lunarYearStr}年　${isLeapStr}${lunarMonthStr}月　${lunarDayStr}`, isLeap: lunar.isLeap },
            hkTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}（香港時間）`,
            inputDate: `${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`
        };
    } catch(e) {
        return { error: '計算錯誤，請檢查日期時間' };
    }
};

// ====================== 【新增】24節氣精準時間 API ======================
window.getSolarTerms = function(year) {
    try {
        if (year < 1900 || year > 2100) {
            return { error: '目前僅支援 1900～2100 年' };
        }

        const termsUTC = generateSolarTerms(year);

        // 24節氣標準名稱（與 generateSolarTerms 順序完全一致）
        const solarTermNames = [
            "小寒", "大寒", "立春", "雨水", "驚蟄", "春分",
            "清明", "穀雨", "立夏", "小滿", "芒種", "夏至",
            "小暑", "大暑", "立秋", "處暑", "白露", "秋分",
            "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
        ];

        let result = [];

        for (let i = 0; i < 24; i++) {
            // UTC 時間 → 轉香港時間（+8小時）
            let utcDate = new Date(termsUTC[i]);
            let hkTimestamp = utcDate.getTime() + 8 * 3600 * 1000;
            let hkDate = new Date(hkTimestamp);

            const dateStr = `${hkDate.getFullYear()}-${String(hkDate.getMonth() + 1).padStart(2, '0')}-${String(hkDate.getDate()).padStart(2, '0')}`;
            const timeStr = `${String(hkDate.getHours()).padStart(2, '0')}:${String(hkDate.getMinutes()).padStart(2, '0')}`;

            result.push({
                index: i,
                name: solarTermNames[i],
                date: dateStr,
                time: timeStr,
                fullHK: `${dateStr} ${timeStr}（香港時間）`,
                isJie: (i % 2 === 0),   // 偶數為「節」（立春、驚蟄...），奇數為「氣」
                type: (i % 2 === 0) ? "節" : "氣"
            });
        }

        return result;

    } catch (e) {
        return { error: '節氣計算錯誤' };
    }
};
</script>
