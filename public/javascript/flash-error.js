const errorToggle = document.getElementById('errorToggle')
const errorWrapper = document.getElementById('error-wrapper')

errorToggle.addEventListener('click', () => {
  errorWrapper.classList.toggle('hidden');
})