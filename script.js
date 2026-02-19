const yearElement = document.getElementById('year');
const form = document.querySelector('.contact-form');
const status = document.getElementById('form-status');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (form && status) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'Thanks! Your message has been captured.';
    form.reset();
  });
}
