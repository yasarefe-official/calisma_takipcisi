// Streak functionality
let streak = parseInt(localStorage.getItem('streak')) || 0;
let highestStreak = parseInt(localStorage.getItem('highestStreak')) || 0;
let totalStreakMoney = parseInt(localStorage.getItem('totalStreakMoney')) || 0;
let lastVisit = localStorage.getItem('lastVisit');

function updateStreak() {
    const now = new Date();
    const today = now.toDateString();
    let shouldGiveBonus = false;
    
    if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            const oldStreak = streak;
            streak++;
            const streakReward = 10;
            money += streakReward;
            
            // Set flag for bonus if streak is 1
            if (streak === 1) {
                shouldGiveBonus = true;
            }
            
            totalStreakMoney += streakReward;
            
            if (streak > highestStreak) {
                highestStreak = streak;
                localStorage.setItem('highestStreak', highestStreak);
            }
        } else if (diffDays > 1) {
            streak = 1;
            shouldGiveBonus = true;
        }
    } else {
        streak = 1;
        shouldGiveBonus = true;
    }
    
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastVisit', today);
    localStorage.setItem('totalStreakMoney', totalStreakMoney);
    
    // Update streak display in levels page
    document.getElementById('streakCountLarge').textContent = `${streak} gün`;

    // Give bonus after 4 seconds if needed
    if (shouldGiveBonus) {
        setTimeout(() => {
            money += 50;
            localStorage.setItem('money', money);
            updateLevelUI();
            alert('Tebrikler! İlk gün serisi bonusu: 50 para kazandınız!');
        }, 4000);
    }
}

// Modal functionality
const streakModal = document.getElementById('streakModal');
const streakDisplay = document.querySelector('.streak-display-large');
const closeModal = document.querySelector('.close-modal');

streakDisplay.addEventListener('click', () => {
    document.getElementById('currentStreak').textContent = streak;
    document.getElementById('highestStreak').textContent = highestStreak;
    document.getElementById('totalStreakMoney').textContent = totalStreakMoney;
    streakModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    streakModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === streakModal) {
        streakModal.style.display = 'none';
    }
});

// Initialize streak on page load
updateStreak();