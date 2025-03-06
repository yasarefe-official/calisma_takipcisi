let currentSubject = 'turkce';
let calismalar = JSON.parse(localStorage.getItem('calismalar')) || [];
let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
let rpMultiplier = 0.5; 
let kuranEnabled = localStorage.getItem('kuranEnabled') !== 'false';
let kitapEnabled = localStorage.getItem('kitapEnabled') !== 'false';
let lastExportDate = localStorage.getItem('lastExportDate') || null;
let appVersion = 'v10';

function calculatePoints(dogru, kuranSayfa, kitapSayfa) {
    const testPoints = Math.floor(dogru * rpMultiplier);
    let kuranPoints = 0;
    let kitapPoints = 0;
    
    if (kuranEnabled) {
        kuranPoints = Math.floor(kuranSayfa * 0.6);
    }
    
    if (kitapEnabled) {
        kitapPoints = Math.floor(kitapSayfa * 0.4);
    }
    
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
    
    const buttonElement = document.querySelector(`.subject-tab[onclick*="${subject}"]`);
    if (buttonElement) {
        buttonElement.classList.add('active');
        
        buttonElement.style.animation = 'none';
        setTimeout(() => {
            buttonElement.style.animation = 'tabActivate 0.5s ease forwards';
        }, 10);
    }
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

    document.getElementById('testPoints').textContent = points.testPoints;
    document.getElementById('kuranPoints').textContent = points.kuranPoints;
    document.getElementById('kitapPoints').textContent = points.kitapPoints;
    document.getElementById('totalPointsPreview').textContent = points.total;
}

function kaydet() {
    const dogru = parseInt(document.getElementById('dogru').value) || 0;
    const kuranSayfa = parseInt(document.getElementById('kuran').value) || 0;
    const kitapSayfa = parseInt(document.getElementById('hikaye').value) || 0;

    const points = calculatePoints(dogru, kuranSayfa, kitapSayfa);
    
    totalPoints += points.total;
    
    localStorage.setItem('totalPoints', totalPoints);
    
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
    
    const saveButton = document.querySelector('.button-group button');
    saveButton.classList.add('save-success');
    saveButton.textContent = 'Kaydedildi!';
    setTimeout(() => {
        saveButton.classList.remove('save-success');
        saveButton.textContent = 'Kaydet';
        formuTemizle();
    }, 1500);
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
    document.querySelectorAll('.nav-item').forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const pageId = item.getAttribute('data-page');
            
            const currentPage = document.querySelector('.page.active');
            if (currentPage) {
                currentPage.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    currentPage.classList.remove('active');
                    currentPage.style.animation = '';
                    
                    const nextPage = document.getElementById(pageId);
                    nextPage.classList.add('active');
                    nextPage.style.animation = 'fadeIn 0.4s forwards';
                    
                    if (pageId === 'levelsPage') {
                        updateLevelUI();
                        renderAllLevels();
                    }
                }, 300);
            }
        });
        
        setTimeout(() => {
            item.style.animation = 'fadeIn 0.4s forwards';
        }, 100 + (index * 50));
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
    
    renderAllLevels();
});

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

    const currentLevel = getCurrentLevel(totalPoints);
    
    if (!currentLevel) return;

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
    
    const levelBadge = document.getElementById('currentLevel');
    if (levelBadge) {
        levelBadge.textContent = currentLevel.name;
        levelBadge.className = `level-badge ${currentLevel.badge}`;
        
        levelBadge.animate([
            { transform: 'scale(0.9)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
        });
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
}

function renderAllLevels() {
    const levelsContainer = document.getElementById('allLevelsContainer');
    if (!levelsContainer) return;
    
    levelsContainer.innerHTML = '';
    
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

    Object.entries(LEVELS).forEach(([levelName, data], index) => {
        const levelItem = document.createElement('div');
        levelItem.className = `level-item ${data.badge}`;
        levelItem.textContent = levelName;
        
        levelItem.style.animationDelay = `${index * 30}ms`;
        
        levelsContainer.appendChild(levelItem);
    });
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

function resetLevels() {
    if (confirm('Tüm kademe verilerini sıfırlamak istediğinizden emin misiniz?')) {
        totalPoints = 0;
        
        localStorage.setItem('totalPoints', totalPoints);
        
        updateLevelUI();
        
        const resetBtn = document.querySelector('.reset-btn');
        resetBtn.classList.add('reset-active');
        setTimeout(() => {
            resetBtn.classList.remove('reset-active');
            alert('Kademe verileri başarıyla sıfırlandı!');
        }, 1000);
    }
}