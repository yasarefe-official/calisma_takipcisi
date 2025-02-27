document.addEventListener('DOMContentLoaded', () => {
    // Initialize table controls
    const selectAllCheckbox = document.getElementById('selectAll');
    const deleteSelectedBtn = document.getElementById('deleteSelected');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateDeleteButtonState();
        });
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedRows);
    }
    
    // Event delegation for checkbox changes
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList.contains('row-checkbox')) {
            updateDeleteButtonState();
        }
    });
    
    function updateDeleteButtonState() {
        const anyChecked = document.querySelector('.row-checkbox:checked');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.disabled = !anyChecked;
        }
    }
    
    function deleteSelectedRows() {
        if (confirm('Seçili kayıtları silmek istediğinizden emin misiniz?')) {
            const checkboxes = document.querySelectorAll('.row-checkbox:checked');
            const indicesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
            
            // Sort indices in descending order to avoid index shifting problems
            indicesToRemove.sort((a, b) => b - a);
            
            // Get current data from localStorage
            let calismalar = JSON.parse(localStorage.getItem('calismalar')) || [];
            
            // Remove the selected items
            indicesToRemove.forEach(index => {
                if (index >= 0 && index < calismalar.length) {
                    calismalar.splice(index, 1);
                }
            });
            
            // Save back to localStorage
            localStorage.setItem('calismalar', JSON.stringify(calismalar));
            
            // Refresh the page instead of just updating the table
            location.reload();
        }
    }
});