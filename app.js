let currentSubject = 'turkce';
let calismalar = JSON.parse(localStorage.getItem('calismalar')) || [];
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
let dailyRP = parseInt(localStorage.getItem('dailyRP')) || 0;
let money = parseInt(localStorage.getItem('money')) || 0;
let rpMultiplier = parseFloat(localStorage.getItem('rpMultiplier')) || 0.5;
let dailyMultiplier = parseFloat(localStorage.getItem('dailyMultiplier')) || 1.0;
let kuranEnabled = localStorage.getItem('kuranEnabled') !== 'false';
let kitapEnabled = localStorage.getItem('kitapEnabled') !== 'false';
let lastExportDate = localStorage.getItem('lastExportDate') || null;

function calculatePoints(dogru, kuranSayfa, kitapSayfa) {
    const testPoints = Math.floor(dogru * rpMultiplier);
    let kuranPoints = 0;
    let kitapPoints = 0;
    let readingReward = 0;
    
    if (kuranEnabled) {
        kuranPoints = Math.floor(kuranSayfa * 0.6);
        readingReward += Math.floor(kuranSayfa / 4);
    }
    
    if (kitapEnabled) {
        kitapPoints = Math.floor(kitapSayfa * 0.4);
        readingReward += Math.floor(kitapSayfa / 4);
    }
    
    money += readingReward;
    localStorage.setItem('money', money);
    
    return {
        testPoints,
        kuranPoints,
        kitapPoints,
        total: testPoints + kuranPoints + kitapPoints,
        readingReward
    };
}

function calculateDailyPoints(dogru, kuranSayfa, kitapSayfa) {
    const testPoints = Math.floor(dogru * 1.5 * dailyMultiplier);
    const kuranPoints = Math.floor(kuranSayfa * 1.6);
    const kitapPoints = Math.floor(kitapSayfa * 1.4);
    return {
        testPoints,
        kuranPoints,
        kitapPoints,
        total: testPoints + kuranPoints + kitapPoints
    };
}

function changeSubject(subject) {
    currentSubject = subject;
    document.querySelectorAll('.subject-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

function calculateNet() {
    const dogru = parseFloat(document.getElementById('dogru').value) || 0;
    const yanlis = parseFloat(document.getElementById('yanlis').value) || 0;
    const net = dogru - yanlis * 0.25;
    document.getElementById('netSonuc').textContent = `Net: ${net.toFixed(2)}`;
    return net;
}

function updatePointsPreview() {
    const dogru = parseInt(document.getElementById('dogru').value) || 0;
    const kuranSayfa = parseInt(document.getElementById('kuran').value) || 0;
    const kitapSayfa = parseInt(document.getElementById('hikaye').value) || 0;

    const points = calculatePoints(dogru, kuranSayfa, kitapSayfa);
    const dailyPoints = calculateDailyPoints(dogru, kuranSayfa, kitapSayfa);

    document.getElementById('testPoints').textContent = 
        `${points.testPoints} (Günlük: ${dailyPoints.testPoints})`;
    document.getElementById('kuranPoints').textContent = 
        `${points.kuranPoints} (Günlük: ${dailyPoints.kuranPoints})`;
    document.getElementById('kitapPoints').textContent = 
        `${points.kitapPoints} (Günlük: ${dailyPoints.kitapPoints})`;
    document.getElementById('totalPointsPreview').textContent = 
        `${points.total} (Günlük: ${dailyPoints.total})`;
}

function kaydet() {
    const dogru = parseInt(document.getElementById('dogru').value) || 0;
    const kuranSayfa = parseInt(document.getElementById('kuran').value) || 0;
    const kitapSayfa = parseInt(document.getElementById('hikaye').value) || 0;

    const points = calculatePoints(dogru, kuranSayfa, kitapSayfa);
    const dailyPoints = calculateDailyPoints(dogru, kuranSayfa, kitapSayfa);
    
    totalPoints += points.total;
    dailyRP += dailyPoints.total;
    
    localStorage.setItem('totalPoints', totalPoints);
    localStorage.setItem('dailyRP', dailyRP);
    
    updateLevelUI();
    
    const yeniCalisma = {
        tarih: new Date().toLocaleDateString('tr-TR'),
        ders: currentSubject,
        dogru: dogru,
        yanlis: parseInt(document.getElementById('yanlis').value) || 0,
        bos: parseInt(document.getElementById('bos').value) || 0,
        net: calculateNet(),
        kuran: kuranSayfa,
        hikaye: kitapSayfa
    };
    calismalar.push(yeniCalisma);
    localStorage.setItem('calismalar', JSON.stringify(calismalar));
    tabloyuGuncelle();
    formuTemizle();
    
    startRewardTimer();
}

function formuTemizle() {
    document.getElementById('dogru').value = '';
    document.getElementById('yanlis').value = '';
    document.getElementById('bos').value = '';
    document.getElementById('kuran').value = '';
    document.getElementById('hikaye').value = '';
    document.getElementById('netSonuc').textContent = 'Net: 0.00';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const pageId = item.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
        });
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            calculateNet();
            updatePointsPreview();
        });
    });

    const kuranToggle = document.getElementById('kuranToggle');
    const kitapToggle = document.getElementById('kitapToggle');
    const kuranInput = document.getElementById('kuran');
    const hikayeInput = document.getElementById('hikaye');
    
    kuranToggle.checked = kuranEnabled;
    kitapToggle.checked = kitapEnabled;
    
    kuranInput.disabled = !kuranEnabled;
    hikayeInput.disabled = !kitapEnabled;
    
    kuranToggle.addEventListener('change', (e) => {
        kuranEnabled = e.target.checked;
        localStorage.setItem('kuranEnabled', kuranEnabled);
        kuranInput.disabled = !kuranEnabled;
        updatePointsPreview();
    });
    
    kitapToggle.addEventListener('change', (e) => {
        kitapEnabled = e.target.checked;
        localStorage.setItem('kitapEnabled', kitapEnabled);
        hikayeInput.disabled = !kitapEnabled;
        updatePointsPreview();
    });
    
    updateLastExportDate();
});

let rewardEndTime = null;
let currentRewardTimer = null;

function startRewardTimer() {
    if (!rewardEndTime) {
        rewardEndTime = Date.now() + (300 * 1000); // 5 minutes from now
    }
    
    if (currentRewardTimer) {
        clearInterval(currentRewardTimer);
    }
    
    const timerDisplay = document.querySelector('.reward-timer');
    timerDisplay.classList.add('active');
    
    currentRewardTimer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((rewardEndTime - now) / 1000));
        
        if (timeLeft <= 0) {
            clearInterval(currentRewardTimer);
            timerDisplay.classList.remove('active');
            rewardEndTime = null;
            giveReward();
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('rewardTime').textContent = timeString;
        document.getElementById('rewardTimeDisplay').textContent = `Ödül için: ${timeString}`;
    }, 1000);
}

function giveReward() {
    const dailyReward = Math.floor(dailyRP / 4);
    money += dailyReward;
    localStorage.setItem('money', money);
    updateLevelUI();
    alert(`Günlük ödülünüz verildi: ${dailyReward} para!`);
}

function updateLevelUI() {
    const LEVELS = {
        'Bronz III': { min: 0, max: 100, badge: 'bronze' },
        'Bronz II Plus': { min: 100, max: 200, badge: 'bronze' },
        'Bronz II': { min: 200, max: 300, badge: 'bronze' },
        'Bronz II Elite': { min: 300, max: 400, badge: 'bronze' },
        'Bronz I Plus': { min: 400, max: 500, badge: 'bronze' },
        'Bronz I': { min: 500, max: 600, badge: 'bronze' },
        'Bronz I Elite': { min: 600, max: 700, badge: 'bronze' },
        'Gümüş III Plus': { min: 700, max: 800, badge: 'silver' },
        'Gümüş III': { min: 800, max: 900, badge: 'silver' },
        'Gümüş III Elite': { min: 900, max: 1000, badge: 'silver' },
        'Gümüş II Plus': { min: 1000, max: 1100, badge: 'silver' },
        'Gümüş II': { min: 1100, max: 1200, badge: 'silver' },
        'Gümüş II Elite': { min: 1200, max: 1300, badge: 'silver' },
        'Gümüş I Plus': { min: 1300, max: 1400, badge: 'silver' },
        'Gümüş I': { min: 1400, max: 1500, badge: 'silver' },
        'Gümüş I Elite': { min: 1500, max: 1600, badge: 'silver' },
        'Altın III Plus': { min: 1600, max: 1700, badge: 'gold' },
        'Altın III': { min: 1700, max: 1800, badge: 'gold' },
        'Altın III Elite': { min: 1800, max: 1900, badge: 'gold' },
        'Altın II Plus': { min: 1900, max: 2000, badge: 'gold' },
        'Altın II': { min: 2000, max: 2100, badge: 'gold' },
        'Altın II Elite': { min: 2100, max: 2200, badge: 'gold' },
        'Altın I Plus': { min: 2200, max: 2300, badge: 'gold' },
        'Altın I': { min: 2300, max: 2400, badge: 'gold' },
        'Altın I Elite': { min: 2400, max: 2500, badge: 'gold' },
        'Platin III Plus': { min: 2500, max: 2600, badge: 'platinum' },
        'Platin III': { min: 2600, max: 2700, badge: 'platinum' },
        'Platin III Elite': { min: 2700, max: 2800, badge: 'platinum' },
        'Platin II Plus': { min: 2800, max: 2900, badge: 'platinum' },
        'Platin II': { min: 2900, max: 3000, badge: 'platinum' },
        'Platin II Elite': { min: 3000, max: 3100, badge: 'platinum' },
        'Platin I': { min: 3100, max: 3200, badge: 'platinum' },
        'Elmas III': { min: 3200, max: 3300, badge: 'diamond' },
        'Elmas II': { min: 3300, max: 3400, badge: 'diamond' },
        'Elmas I': { min: 3400, max: 3500, badge: 'diamond' },
        'Usta III': { min: 3500, max: 3600, badge: 'master' },
        'Usta II': { min: 3600, max: 3700, badge: 'master' },
        'Usta I': { min: 3700, max: 3800, badge: 'master' },
        'Büyük Usta III': { min: 3800, max: 3900, badge: 'grandmaster' },
        'Büyük Usta II': { min: 3900, max: 4000, badge: 'grandmaster' },
        'Büyük Usta I': { min: 4000, max: 4100, badge: 'grandmaster' },
        'Efsanevi III': { min: 4100, max: 4200, badge: 'grandmaster' },
        'Efsanevi II': { min: 4200, max: 4300, badge: 'grandmaster' },
        'Efsanevi I': { min: 4300, max: Infinity, badge: 'grandmaster' }
    };

    function getCurrentLevel(points) {
        let nextLevelName = null;
        for (let [level, range] of Object.entries(LEVELS)) {
            if (points >= range.min && points < range.max) {
                const levelIndex = Object.keys(LEVELS).indexOf(level);
                nextLevelName = Object.keys(LEVELS)[levelIndex + 1];
                return {
                    name: level,
                    nextLevel: nextLevelName,
                    ...range,
                    progress: ((points - range.min) / (range.max - range.min)) * 100
                };
            }
        }
        return null;
    }

    const level = getCurrentLevel(totalPoints);
    const dailyLevel = getCurrentLevel(dailyRP);
    if (!level || !dailyLevel) return;

    const levelBadge = document.getElementById('currentLevel');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const totalRP = document.getElementById('totalRP');
    const nextLevel = document.getElementById('nextLevel');
    const currentLevelInfo = document.getElementById('currentLevelInfo');
    const levelProgressFill = document.getElementById('levelProgressFill');
    const levelProgressText = document.getElementById('levelProgressText');
    const nextLevelInfo = document.getElementById('nextLevelInfo');
    const totalPointsInfo = document.getElementById('totalPointsInfo');
    const rpMultiplierInfo = document.getElementById('rpMultiplier');
    const permMultiplierInfo = document.getElementById('permMultiplierInfo');
    const dailyMultiplierElement = document.getElementById('dailyMultiplier');
    const dailyMultiplierValue = document.getElementById('dailyMultiplierValue');
    const dailyRPInfo = document.getElementById('dailyRPInfo');
    const currentDailyLevelInfo = document.getElementById('currentDailyLevelInfo');
    const dailyProgressFill = document.getElementById('dailyProgressFill');
    const dailyProgressText = document.getElementById('dailyProgressText');
    const nextDailyLevelInfo = document.getElementById('nextDailyLevelInfo');
    const moneyDisplay = document.getElementById('moneyAmount');

    levelBadge.textContent = level.name;
    levelBadge.className = `level-badge ${level.badge}`;
    
    progressFill.style.width = `${level.progress}%`;
    progressText.textContent = `${totalPoints - level.min}/${level.max - level.min} XP`;
    
    totalRP.textContent = totalPoints;
    nextLevel.innerHTML = `Sonraki seviye: <span>${level.nextLevel || 'Maksimum Seviye'}</span>`;
    
    currentLevelInfo.textContent = level.name;
    levelProgressFill.style.width = `${level.progress}%`;
    levelProgressText.textContent = `${totalPoints - level.min}/${level.max - level.min} XP`;
    nextLevelInfo.textContent = level.nextLevel || 'Maksimum Seviye';
    totalPointsInfo.textContent = totalPoints;
    
    rpMultiplierInfo.textContent = rpMultiplier.toFixed(1);
    permMultiplierInfo.textContent = rpMultiplier.toFixed(1); 
    document.getElementById('currentMultiplier').textContent = rpMultiplier.toFixed(1);
    if (dailyMultiplierElement) {
        dailyMultiplierElement.textContent = dailyMultiplier.toFixed(1);
    }
    dailyMultiplierValue.textContent = (1.5 * dailyMultiplier).toFixed(1);
    
    dailyRPInfo.textContent = dailyRP;
    
    currentDailyLevelInfo.textContent = dailyLevel.name;
    dailyProgressFill.style.width = `${dailyLevel.progress}%`;
    dailyProgressText.textContent = `${dailyRP - dailyLevel.min}/${dailyLevel.max - dailyLevel.min} XP`;
    nextDailyLevelInfo.textContent = dailyLevel.nextLevel || 'Maksimum Seviye';

    moneyDisplay.textContent = money;
}

function tabloyuGuncelle() {
    const tbody2 = document.querySelector('#historyTable2 tbody');
    tbody2.innerHTML = '';
    calismalar.forEach((calisma, index) => {
        const row = tbody2.insertRow();
        row.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" class="row-checkbox" data-index="${index}">
            </td>
            <td>${calisma.tarih}</td>
            <td>${calisma.ders}</td>
            <td>${calisma.dogru}</td>
            <td>${calisma.yanlis}</td>
            <td>${calisma.bos}</td>
            <td>${calisma.net.toFixed(2)}</td>
            <td>${calisma.kuran}</td>
            <td>${calisma.hikaye}</td>
        `;
    });
}

function exportData() {
    const data = {
        calismalar,
        totalPoints,
        dailyRP,
        money,
        rpMultiplier,
        dailyMultiplier,
        streak: 0, // Added to avoid undefined property
        highestStreak: 0, // Added to avoid undefined property
        totalStreakMoney: 0, // Added to avoid undefined property
        lastVisit: new Date().toISOString(), // Added to avoid undefined property
        kuranEnabled,
        kitapEnabled,
        lastExportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calisma_verileri_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('lastExportDate', data.lastExportDate);
    updateLastExportDate();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Clear all existing data
            localStorage.clear();
            
            // Set new data
            localStorage.setItem('calismalar', JSON.stringify(data.calismalar));
            localStorage.setItem('totalPoints', data.totalPoints);
            localStorage.setItem('dailyRP', data.dailyRP);
            localStorage.setItem('money', data.money);
            localStorage.setItem('rpMultiplier', data.rpMultiplier);
            localStorage.setItem('dailyMultiplier', data.dailyMultiplier);
            localStorage.setItem('streak', data.streak);
            localStorage.setItem('highestStreak', data.highestStreak);
            localStorage.setItem('totalStreakMoney', data.totalStreakMoney);
            localStorage.setItem('lastVisit', data.lastVisit);
            localStorage.setItem('kuranEnabled', data.kuranEnabled);
            localStorage.setItem('kitapEnabled', data.kitapEnabled);
            localStorage.setItem('lastExportDate', data.lastExportDate);
            
            // Refresh page to load new data
            location.reload();
        } catch (error) {
            alert('Geçersiz veri dosyası!');
        }
    };
    reader.readAsText(file);
}

function updateLastExportDate() {
    const lastExportElement = document.getElementById('lastExportDate');
    if (lastExportDate) {
        const date = new Date(lastExportDate);
        lastExportElement.textContent = date.toLocaleDateString('tr-TR');
    }
}