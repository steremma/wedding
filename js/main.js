/* ============================================================
   WEDDING WEBSITE — Main JavaScript
   ============================================================ */

/* ---- CONFIG — update these values ----------------------------- */
const WEDDING_DATE = new Date('2027-06-19T20:30:00'); // party start time

/* ---- Countdown Timer ------------------------------------------ */
function updateCountdown() {
  const diff = WEDDING_DATE - Date.now();

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p style="font-family:var(--f-serif);font-size:1.4rem;color:#fff;letter-spacing:2px;">Today is the day!</p>';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);

  document.getElementById('days').textContent    = String(d).padStart(2, '0');
  document.getElementById('hours').textContent   = String(h).padStart(2, '0');
  document.getElementById('minutes').textContent = String(m).padStart(2, '0');
  document.getElementById('seconds').textContent = String(s).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ---- Navbar scroll state -------------------------------------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ---- Mobile navigation ---------------------------------------- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---- Scroll reveal -------------------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), i * 120);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- Active nav highlight on scroll --------------------------- */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    const inView = y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight;
    const link = navLinks.querySelector(`a[href="#${sec.id}"]`);
    if (link) link.style.color = inView ? 'var(--gold)' : '';
  });
}, { passive: true });

/* ---- RSVP: show/hide guest fields based on attendance --------- */
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
const groupGuests  = document.getElementById('groupGuests');
const groupDietary = document.getElementById('groupDietary');

function syncAttendanceFields() {
  const checked = document.querySelector('input[name="attendance"]:checked');
  const attending = checked && checked.value === 'Joyfully accepts';
  groupGuests.style.display  = attending ? '' : 'none';
  groupDietary.style.display = attending ? '' : 'none';
}
attendanceRadios.forEach(r => r.addEventListener('change', syncAttendanceFields));

/* ---- RSVP form submission (Formspree) ------------------------- */
const rsvpForm   = document.getElementById('rsvpForm');
const submitBtn  = document.getElementById('submitBtn');
const btnLabel   = submitBtn.querySelector('.btn-label');
const btnLoading = submitBtn.querySelector('.btn-loading');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  btnLabel.style.display   = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled = true;
  formSuccess.style.display = 'none';
  formError.style.display   = 'none';

  try {
    const res = await fetch(rsvpForm.action, {
      method:  'POST',
      body:    new FormData(rsvpForm),
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      rsvpForm.reset();
      rsvpForm.style.display    = 'none';
      formSuccess.style.display = 'block';
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      throw new Error('non-ok response');
    }
  } catch {
    formError.style.display  = 'block';
    btnLabel.style.display   = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
  }
});
