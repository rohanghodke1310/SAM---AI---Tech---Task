// ── Scroll Reveal ──────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

reveals.forEach(r => revealObserver.observe(r));


// ── Active Nav Link on Scroll ───────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current
      ? 'var(--teal-light)'
      : '';
  });
});


// ── Contact Form Submit (Demo) ──────────────────────────────
const formBtn = document.querySelector('.form-btn');
if (formBtn) {
  formBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.form-input');
    let allFilled = true;
    inputs.forEach(input => {
      if (!input.value.trim()) allFilled = false;
    });

    if (allFilled) {
      formBtn.textContent = '✓ Message Sent!';
      formBtn.style.background = '#1a8c5a';
      inputs.forEach(input => input.value = '');
      setTimeout(() => {
        formBtn.textContent = 'Send Message →';
        formBtn.style.background = '';
      }, 3000);
    } else {
      formBtn.textContent = '⚠ Please fill all fields';
      formBtn.style.background = '#8c3a1a';
      setTimeout(() => {
        formBtn.textContent = 'Send Message →';
        formBtn.style.background = '';
      }, 2000);
    }
  });
}
