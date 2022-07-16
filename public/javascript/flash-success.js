const successToggle = document.getElementById('successToggle')
const successWrapper = document.getElementById('success-wrapper')

successToggle.addEventListener('click', () => {
  successWrapper.classList.toggle('hidden');
})