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

function updateLevelUI() {
    const level = getCurrentLevel(totalPoints);
    const dailyLevel = getCurrentLevel(dailyRP);
    if (!level || !dailyLevel) return;

    document.getElementById('currentLevel').textContent = level.name;
    document.getElementById('currentLevel').className = `level-badge ${level.badge}`;
    
    document.getElementById('progressFill').style.width = `${level.progress}%`;
    document.getElementById('progressText').textContent = 
        `${totalPoints - level.min}/${level.max - level.min} XP`;
    
    document.getElementById('totalRP').textContent = totalPoints;
    document.getElementById('nextLevel').innerHTML = `Sonraki seviye: <span>${level.nextLevel || 'Maksimum Seviye'}</span>`;
    
    document.getElementById('currentLevelInfo').textContent = level.name;
    document.getElementById('levelProgressFill').style.width = `${level.progress}%`;
    document.getElementById('levelProgressText').textContent = `${totalPoints - level.min}/${level.max - level.min} XP`;
    document.getElementById('nextLevelInfo').textContent = level.nextLevel || 'Maksimum Seviye';
    document.getElementById('totalPointsInfo').textContent = totalPoints;
    
    document.getElementById('rpMultiplier').textContent = rpMultiplier.toFixed(1);
    document.getElementById('permMultiplierInfo').textContent = rpMultiplier.toFixed(1); 
    document.getElementById('currentMultiplier').textContent = rpMultiplier.toFixed(1);
    document.getElementById('dailyMultiplier').textContent = dailyMultiplier.toFixed(1);
    document.getElementById('dailyMultiplierValue').textContent = (1.5 * dailyMultiplier).toFixed(1);
    
    document.getElementById('dailyRPInfo').textContent = dailyRP;
    
    document.getElementById('currentDailyLevelInfo').textContent = dailyLevel.name;
    document.getElementById('dailyProgressFill').style.width = `${dailyLevel.progress}%`;
    document.getElementById('dailyProgressText').textContent = `${dailyRP - dailyLevel.min}/${dailyLevel.max - dailyLevel.min} XP`;
    document.getElementById('nextDailyLevelInfo').textContent = dailyLevel.nextLevel || 'Maksimum Seviye';

    document.getElementById('moneyAmount').textContent = money;
}

function upgradeMultiplier() {
    if (money >= 100) {
        money -= 100;
        rpMultiplier += 0.1;
        localStorage.setItem('money', money);
        localStorage.setItem('rpMultiplier', rpMultiplier);
        updateLevelUI();
    }
}

function upgradeDailyMultiplier() {
    if (money >= 100) {
        money -= 100;
        dailyMultiplier += 0.1;
        localStorage.setItem('money', money);
        localStorage.setItem('dailyMultiplier', dailyMultiplier);
        updateLevelUI();
    }
}

function resetLevels() {
    if (confirm('Tüm kademe verilerini sıfırlamak istediğinizden emin misiniz?')) {
        totalPoints = 0;
        dailyRP = 0;
        rpMultiplier = 0.5;
        dailyMultiplier = 1.0;
        money = 0;
        
        localStorage.setItem('totalPoints', '0');
        localStorage.setItem('dailyRP', '0');
        localStorage.setItem('rpMultiplier', '0.5');
        localStorage.setItem('dailyMultiplier', '1.0');
        localStorage.setItem('money', '0');
        
        updateLevelUI();
    }
}