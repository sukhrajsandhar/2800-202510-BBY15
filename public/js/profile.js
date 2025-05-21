function editUserInfo() {
    document.querySelectorAll('#profileForm input, #profileForm textarea').forEach(el => {
      el.removeAttribute('disabled');
    });

    // Show save button
    document.getElementById('submit1').style.display = 'inline-block'
  }