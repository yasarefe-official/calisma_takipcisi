function tabloyuGuncelle() {
    const tbody = document.querySelector('#historyTable2 tbody');
    tbody.innerHTML = '';
    calismalar.forEach((calisma, index) => {
        const row = tbody.insertRow();
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
    updateDeleteButtonState();
}

function updateDeleteButtonState() {
    const deleteButton = document.getElementById('deleteSelected');
    const hasSelection = document.querySelector('.row-checkbox:checked');
    deleteButton.disabled = !hasSelection;
}

// Initialize table controls
document.addEventListener('DOMContentLoaded', () => {
    const selectAllCheckbox = document.getElementById('selectAll');
    const deleteButton = document.getElementById('deleteSelected');

    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
        updateDeleteButtonState();
    });

    document.querySelector('#historyTable2').addEventListener('change', (e) => {
        if (e.target.classList.contains('row-checkbox')) {
            updateDeleteButtonState();
            const checkboxes = document.querySelectorAll('.row-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        }
    });

    deleteButton.addEventListener('click', () => {
        if (confirm('Seçili kayıtları silmek istediğinizden emin misiniz?')) {
            const selectedIndexes = Array.from(document.querySelectorAll('.row-checkbox:checked'))
                .map(checkbox => parseInt(checkbox.dataset.index))
                .sort((a, b) => b - a);

            selectedIndexes.forEach(index => {
                calismalar.splice(index, 1);
            });

            localStorage.setItem('calismalar', JSON.stringify(calismalar));
            tabloyuGuncelle();
            selectAllCheckbox.checked = false;
        }
    });
});