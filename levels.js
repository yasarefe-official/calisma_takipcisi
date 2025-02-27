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
    'Efsanevi I': { min: 4300, max: 4400, badge: 'grandmaster' },
    'Mistik III': { min: 4400, max: 4500, badge: 'mystic' },
    'Mistik II': { min: 4500, max: 4600, badge: 'mystic' },
    'Mistik I': { min: 4600, max: 4700, badge: 'mystic' },
    'İlahi III': { min: 4700, max: 4800, badge: 'divine' },
    'İlahi II': { min: 4800, max: 4900, badge: 'divine' },
    'İlahi I': { min: 4900, max: 5000, badge: 'divine' },
    'Kozmik III': { min: 5000, max: 5100, badge: 'cosmic' },
    'Kozmik II': { min: 5100, max: 5200, badge: 'cosmic' },
    'Kozmik I': { min: 5200, max: 5300, badge: 'cosmic' },
    'Sonsuz': { min: 5300, max: Infinity, badge: 'infinite' }
};

function getCurrentLevel(points) {
    for (let [level, data] of Object.entries(LEVELS)) {
        if (points >= data.min && points < data.max) {
            const levelIndex = Object.keys(LEVELS).indexOf(level);
            const nextLevelName = Object.keys(LEVELS)[levelIndex + 1];
            return {
                name: level,
                nextLevel: nextLevelName,
                ...data,
                progress: ((points - data.min) / (data.max - data.min)) * 100
            };
        }
    }
    return null;
}

function getAllLevels() {
    return Object.entries(LEVELS).map(([name, data]) => {
        return {
            name,
            ...data
        };
    });
}