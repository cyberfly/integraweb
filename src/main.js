import './style.css';
import Alpine from 'alpinejs';

window.Alpine = Alpine;
Alpine.start();

document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Hero typing animation
  const typed = document.getElementById('typed');
  const cursor = document.getElementById('cursor');
  if (typed) {
    const text = '"I spend hours every day on follow-up emails and updating our CRM. Can we automate this?"';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typed.textContent = text;
    } else {
      let i = 0;
      function tick() {
        if (i <= text.length) { typed.textContent = text.slice(0, i++); setTimeout(tick, 34); }
        else if (cursor) { cursor.style.display = 'none'; }
      }
      setTimeout(tick, 700);
    }
  }

  // Reading progress (blog post pages)
  const progress = document.getElementById('readingProgress');
  if (progress) {
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, pct)) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  // Contact form
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const successMsg = document.getElementById('successMsg');
  const failMsg = document.getElementById('failMsg');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameErr = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const messageErr = document.getElementById('messageErr');

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const showErr = (input, err, msg) => {
    input.classList.add('error'); err.textContent = msg; err.classList.add('show');
  };
  const clearErr = (input, err) => {
    input.classList.remove('error'); err.classList.remove('show');
  };

  nameInput.addEventListener('blur', () => nameInput.value.trim() ? clearErr(nameInput, nameErr) : showErr(nameInput, nameErr, 'Please enter your name'));
  emailInput.addEventListener('blur', () => validateEmail(emailInput.value) ? clearErr(emailInput, emailErr) : showErr(emailInput, emailErr, 'Please enter a valid email address'));
  messageInput.addEventListener('blur', () => messageInput.value.trim() ? clearErr(messageInput, messageErr) : showErr(messageInput, messageErr, 'Please enter a message'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successMsg.classList.remove('show');
    failMsg.classList.remove('show');

    let valid = true;
    if (!nameInput.value.trim()) { showErr(nameInput, nameErr, 'Please enter your name'); valid = false; } else clearErr(nameInput, nameErr);
    if (!validateEmail(emailInput.value)) { showErr(emailInput, emailErr, 'Please enter a valid email address'); valid = false; } else clearErr(emailInput, emailErr);
    if (!messageInput.value.trim()) { showErr(messageInput, messageErr, 'Please enter a message'); valid = false; } else clearErr(messageInput, messageErr);
    if (!valid) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // No backend — compose an email to Integra Solid via the visitor's mail client.
    const subject = `New enquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:integrasolid@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    successMsg.classList.add('show');
    form.reset();
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
