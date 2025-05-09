function handleCategoryChange() {
    const categorySelect = document.getElementById('alertCategory');
    const customDiv = document.getElementById('customCategoryDiv');
    if (categorySelect.value === 'Other') {
        customDiv.classList.remove('d-none');
    } else {
        customDiv.classList.add('d-none');
    }
}