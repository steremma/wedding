/* ============================================================
   WEDDING WEBSITE — Main JavaScript
   ============================================================ */

/* ---- CONFIG — update these values ----------------------------- */
const WEDDING_DATE = new Date('2027-06-19T20:30:00'); // party start time

// Google Photos shared album link (https://photos.app.goo.gl/...).
// Leave empty to show the upload button as "coming soon".
const PHOTO_ALBUM_URL = 'https://photos.app.goo.gl/PDhR6A87FfjMYmMV6';

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

/* ---- RSVP: confetti when a guest accepts ---------------------- */
const CONFETTI_COLORS = ['#C4622D', '#E8A87A', '#6B7B3A', '#A8B46A', '#EFE2CC', '#FFFFFF'];

function burstConfetti(x, y) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: 150 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 13;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 7,
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    };
  });

  const DURATION = 2800;
  const start = performance.now();
  let last = start;

  function frame(now) {
    const elapsed = now - start;
    if (elapsed > DURATION) { canvas.remove(); return; }

    const step = Math.min((now - last) / 16.67, 3); // normalise to 60fps
    last = now;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalAlpha = Math.min(1, (DURATION - elapsed) / 700);

    pieces.forEach(p => {
      p.vx *= Math.pow(.985, step);
      p.vy  = p.vy * Math.pow(.985, step) + .38 * step;
      p.x  += p.vx * step;
      p.y  += p.vy * step;
      p.rot += p.spin * step;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

attendanceRadios.forEach(r => r.addEventListener('change', () => {
  if (r.value !== 'Joyfully accepts' || !r.checked) return;
  const box = r.closest('label')?.getBoundingClientRect() ?? r.getBoundingClientRect();
  burstConfetti(box.left + box.width / 2, box.top + box.height / 2);
}));

/* ---- Photo upload link ---------------------------------------- */
const uploadBtn  = document.getElementById('uploadBtn');
const photosNote = document.getElementById('photosNote');

if (PHOTO_ALBUM_URL) {
  uploadBtn.href = PHOTO_ALBUM_URL;
  uploadBtn.removeAttribute('aria-disabled');
  photosNote.textContent = 'Opens our shared Google Photos album — sign in with any Google account to add yours.';
}

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
