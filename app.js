let currentSubject = 'turkce';
let calismalar = JSON.parse(localStorage.getItem('calismalar')) || [];
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
let dailyRP = parseInt(localStorage.getItem('dailyRP')) || 0;
let money = parseInt(localStorage.getItem('money')) || 0;
let rpMultiplier = parseFloat(localStorage.getItem('rpMultiplier')) || 0.5;
let dailyMultiplier = parseFloat(localStorage.getItem('dailyMultiplier')) || 1.5;
let kuranEnabled = localStorage.getItem('kuranEnabled') !== 'false';
let kitapEnabled = localStorage.getItem('kitapEnabled') !== 'false';
let lastExportDate = localStorage.getItem('lastExportDate') || null;
let rewardEndTime = localStorage.getItem('rewardEndTime') ? parseInt(localStorage.getItem('rewardEndTime')) : null;
let currentRewardTimer = null;

// Computer mode functionality
let isComputerMode = false;
let loadingTimeout = null;

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

function updateMoneyDisplays() {
    const moneyDisplays = ['moneyAmount', 'moneyAmount2'];
    moneyDisplays.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = money;
        }
    });
}

function toggleComputerMode() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const bottomNav = document.querySelector('.bottom-nav');
  
  loadingOverlay.style.display = 'flex';
  
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }
  
  loadingTimeout = setTimeout(() => {
    isComputerMode = !isComputerMode;
    document.body.classList.toggle('computer-mode', isComputerMode);
    bottomNav.style.display = isComputerMode ? 'none' : 'flex';
    loadingOverlay.style.display = 'none';
    
    localStorage.setItem('computerMode', isComputerMode);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    updateMoneyDisplays();
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const pageId = item.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            
            // Update UI based on active page
            if (pageId === 'levelsPage') {
                updateLevelUI();
            }
        });
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            calculateNet();
            updatePointsPreview();
        });
    });

    updateLastExportDate();
    updateLevelUI();
    tabloyuGuncelle();
    
    isComputerMode = localStorage.getItem('computerMode') === 'true';
    if (isComputerMode) {
        document.body.classList.add('computer-mode');
        document.querySelector('.bottom-nav').style.display = 'none';
    }
    
    setupKeyboardShortcuts();
});

const currentLevel = document.getElementById('currentLevel');
if (currentLevel) {
    currentLevel.onclick = null; // Remove the click handler
}

function startRewardTimer() {
    giveReward();
}

function giveReward() {
    const dailyReward = Math.floor(dailyRP / 4);
    money += dailyReward;
    localStorage.setItem('money', money);
    updateMoneyDisplays();
    
    alert(`Günlük ödülünüz verildi: ${dailyReward} para!`);
}

function updateLevelUI() {
    updateMoneyDisplays();
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

    const currentLevel = getCurrentLevel(totalPoints);
    const dailyLevel = getCurrentLevel(dailyRP);
    
    if (!currentLevel || !dailyLevel) return;

    const safeUpdateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    const safeUpdateProgressBar = (fillId, textId, progress, text) => {
        const fill = document.getElementById(fillId);
        const textElement = document.getElementById(textId);
        if (fill) fill.style.width = `${progress}%`;
        if (textElement) textElement.textContent = text;
    };

    safeUpdateElement('moneyAmount', money);
    
    const levelBadge = document.getElementById('currentLevel');
    if (levelBadge) {
        levelBadge.textContent = currentLevel.name;
        levelBadge.className = `level-badge ${currentLevel.badge}`;
    }

    safeUpdateProgressBar('progressFill', 'progressText', currentLevel.progress, 
        `${totalPoints - currentLevel.min}/${currentLevel.max - currentLevel.min} XP`);

    safeUpdateElement('totalRP', totalPoints);
    safeUpdateElement('nextLevel', `Sonraki seviye: ${currentLevel.nextLevel || 'Maksimum Seviye'}`);
    
    safeUpdateElement('currentLevelInfo', currentLevel.name);
    safeUpdateProgressBar('levelProgressFill', 'levelProgressText', currentLevel.progress,
        `${totalPoints - currentLevel.min}/${currentLevel.max - currentLevel.min} XP`);
    safeUpdateElement('nextLevelInfo', currentLevel.nextLevel || 'Maksimum Seviye');
    safeUpdateElement('totalPointsInfo', totalPoints);
    
    safeUpdateElement('rpMultiplierInfo', rpMultiplier.toFixed(1));
    safeUpdateElement('permMultiplierInfo', rpMultiplier.toFixed(1));
    safeUpdateElement('currentMultiplier', rpMultiplier.toFixed(1));
    
    safeUpdateElement('dailyMultiplierValue', '1.5');
    safeUpdateElement('dailyMultiplierElement', dailyMultiplier.toFixed(1));
    
    safeUpdateElement('dailyRPInfo', dailyRP);
    safeUpdateElement('currentDailyLevelInfo', dailyLevel.name);
    
    safeUpdateProgressBar('dailyProgressFill', 'dailyProgressText', dailyLevel.progress,
        `${dailyRP - dailyLevel.min}/${dailyLevel.max - dailyLevel.min} XP`);
    
    safeUpdateElement('nextDailyLevelInfo', dailyLevel.nextLevel || 'Maksimum Seviye');
}

function upgradeMultiplier() {
    const upgradeCost = 100;
    if (money >= upgradeCost) {
        money -= upgradeCost;
        rpMultiplier += 0.1;
        localStorage.setItem('money', money);
        localStorage.setItem('rpMultiplier', rpMultiplier);
        updateMoneyDisplays();
        updateLevelUI();
        alert('Çarpan başarıyla geliştirildi!');
    } else {
        alert('Yeterli paranız yok!');
    }
}

function upgradeDailyMultiplier() {
    const upgradeCost = 100;
    if (money >= upgradeCost) {
        money -= upgradeCost;
        dailyMultiplier += 0.1;
        localStorage.setItem('money', money);
        localStorage.setItem('dailyMultiplier', dailyMultiplier);
        updateMoneyDisplays();
        updateLevelUI();
        alert('Günlük çarpan başarıyla geliştirildi!');
    } else {
        alert('Yeterli paranız yok!');
    }
}

function resetLevels() {
    if (confirm('Tüm kademe verilerini sıfırlamak istediğinizden emin misiniz?')) {
        totalPoints = 0;
        dailyRP = 0;
        
        localStorage.setItem('totalPoints', totalPoints);
        localStorage.setItem('dailyRP', dailyRP);
        
        updateLevelUI();
        alert('Kademe verileri başarıyla sıfırlandı!');
    }
}

function resetUpgrades() {
    if (confirm('Tüm geliştirme verilerini sıfırlamak istediğinizden emin misiniz?')) {
        rpMultiplier = 0.5;
        dailyMultiplier = 1.5;
        
        localStorage.setItem('rpMultiplier', rpMultiplier);
        localStorage.setItem('dailyMultiplier', dailyMultiplier);
        
        updateLevelUI();
        alert('Geliştirme verileri başarıyla sıfırlandı!');
    }
}

function resetMoney() {
    if (confirm('Para verilerini sıfırlamak istediğinizden emin misiniz?')) {
        money = 0;
        localStorage.setItem('money', money);
        updateMoneyDisplays();
        alert('Para verileri başarıyla sıfırlandı!');
    }
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

function updateLastExportDate() {
    const lastExportElement = document.getElementById('lastExportDate');
    if (lastExportDate) {
        const date = new Date(lastExportDate);
        lastExportElement.textContent = date.toLocaleDateString('tr-TR');
    }
}

window.upgradeDailyMultiplier = function() {
    const upgradeCost = 100;
    if (money >= upgradeCost) {
        money -= upgradeCost;
        dailyMultiplier += 0.1;
        localStorage.setItem('money', money);
        localStorage.setItem('dailyMultiplier', dailyMultiplier);
        updateMoneyDisplays();
        updateLevelUI();
        alert('Günlük çarpan başarıyla geliştirildi!');
    } else {
        alert('Yeterli paranız yok!');
    }
};

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (isComputerMode) {
      // Show shortcuts modal
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        showShortcutsModal();
      }
      
      // Page navigation shortcuts
      if (e.ctrlKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            switchPage('dataPage');
            break;
          case '2':
            e.preventDefault(); 
            switchPage('tablePage');
            break;
          case '3':
            e.preventDefault();
            switchPage('levelsPage');
            break;
          case '4':
            e.preventDefault();
            switchPage('upgradePage');
            break;
          case 'm':
            e.preventDefault();
            toggleComputerMode();
            break;
        }
      }
    }
  });
}

function showShortcutsModal() {
  const modal = document.getElementById('shortcutsModal');
  modal.style.display = 'block';
}

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

function toggleComputerMode() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const bottomNav = document.querySelector('.bottom-nav');
  
  loadingOverlay.style.display = 'flex';
  
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }
  
  loadingTimeout = setTimeout(() => {
    isComputerMode = !isComputerMode;
    document.body.classList.toggle('computer-mode', isComputerMode);
    bottomNav.style.display = isComputerMode ? 'none' : 'flex';
    loadingOverlay.style.display = 'none';
    
    localStorage.setItem('computerMode', isComputerMode);
  }, 3000);
}