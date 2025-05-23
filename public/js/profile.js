// Enable editing
function editUserInfo() {
  document.querySelectorAll('#profileForm input, #profileForm textarea').forEach(el => {
    el.removeAttribute('disabled');
  });

  // Shows the save button
  document.getElementById('submit1').style.display = 'inline-block';
}

// show speech bubble
window.addEventListener('DOMContentLoaded', () => {
  const bubble = document.querySelector('.speech-bubble');

  setTimeout(() => {
    bubble.classList.add('show');

    setTimeout(() => {
      bubble.classList.remove('show');
    }, 5000); 
  }, 2000); // Delay before showing (e.g., 2 seconds)
});
