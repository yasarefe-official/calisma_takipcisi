// This file is kept for backward compatibility but most functionality is removed
// Local storage items are preserved for future migration if needed

document.addEventListener('DOMContentLoaded', () => {
    // Remove any streak modal references
    const streakModal = document.getElementById('streakModal');
    if (streakModal) {
        streakModal.remove();
    }
});