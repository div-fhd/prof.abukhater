const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const intro = $('#intro');
const skipIntro = $('#skipIntro');
const playIntro = $('#playIntro');
const menuBtn = $('#menuBtn');
const themeBtn = $('#themeBtn');
const timelineTrack = $('#timelineTrack');
const prevBtn = $('#timelinePrev');
const nextBtn = $('#timelineNext');

const dateInput = $('input[name="date"]');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

function getDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function generateTimeSlots(dateStr) {
  const timeSlotDiv = $('#timeSlots');
  const dayName = getDayName(dateStr);
  const isSaturday = new Date(dateStr + 'T00:00').getDay() === 6;
  const isSunday = new Date(dateStr + 'T00:00').getDay() === 0;

  if (isSunday) {
    timeSlotDiv.innerHTML = '<small>❌ Closed on Sundays</small>';
    return;
  }

  const availableSlots = isSaturday
    ? timeSlots.filter(t => t <= '14:00')
    : timeSlots;

  timeSlotDiv.innerHTML = availableSlots.map(slot =>
    `<button type="button" class="time-slot" data-time="${slot}">${slot}</button>`
  ).join('');

  $$('.time-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      $$('.time-slot').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      $('#timeInput').value = btn.dataset.time;
    });
  });
}

function hideIntro() {
  intro?.classList.add('hidden');
  document.body.classList.remove('intro-active');
}

dateInput?.addEventListener('change', (e) => {
  if (e.target.value) {
    generateTimeSlots(e.target.value);
  }
});

window.addEventListener('load', () => {
  setTimeout(hideIntro, 6000);
});
skipIntro?.addEventListener('click', hideIntro);
playIntro?.addEventListener('click', () => {
  if (!document.body.contains(intro)) return;
  intro.classList.remove('hidden');
  document.body.classList.add('intro-active');
  setTimeout(hideIntro, 6000);
});

menuBtn?.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
themeBtn?.addEventListener('click', () => document.body.classList.toggle('light-mode'));

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
});

prevBtn?.addEventListener('click', () => timelineTrack.scrollBy({ left: -260, behavior: 'smooth' }));
nextBtn?.addEventListener('click', () => timelineTrack.scrollBy({ left: 260, behavior: 'smooth' }));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach((el) => revealObserver.observe(el));

const sections = $$('section[id]');
const navLinks = $$('.side-nav a, .top-nav a');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { threshold: 0.35 });
sections.forEach((section) => navObserver.observe(section));

const testimonials = $$('.testimonial');
const dotsWrap = $('#testimonialDots');
let currentTestimonial = 0;

testimonials.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Show testimonial ${index + 1}`);
  dot.addEventListener('click', () => showTestimonial(index));
  dotsWrap?.appendChild(dot);
});

function showTestimonial(index) {
  currentTestimonial = index;
  testimonials.forEach((item, i) => item.classList.toggle('active', i === index));
  $$('#testimonialDots button').forEach((dot, i) => dot.classList.toggle('active', i === index));
}
showTestimonial(0);
setInterval(() => showTestimonial((currentTestimonial + 1) % testimonials.length), 4500);

$('#bookingForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());

  if (data.date) {
    const selected = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      alert('❌ Please select a date in the future');
      return;
    }
  }

  if (!data.time) {
    alert('⏰ Please select a time');
    return;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(h), parseInt(m));
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const message = encodeURIComponent(
    `📋 *APPOINTMENT REQUEST*\n\n` +
    `👤 *Name:* ${data.name}\n` +
    `📞 *Phone:* ${data.phone}\n` +
    `📧 *Email:* ${data.email || '—'}\n` +
    `🏥 *Service:* ${data.service}\n` +
    `📅 *Date:* ${formatDate(data.date)}\n` +
    `⏰ *Time:* ${formatTime(data.time)}\n` +
    `💬 *Message:* ${data.message || '—'}`
  );
  window.open(`https://wa.me/4917645122026?text=${message}`, '_blank', 'noopener,noreferrer');
  form.reset();
  $('#timeSlots').innerHTML = '<small>Select a date first</small>';
  $('#timeInput').value = '';
});

function createNeuralCanvas(canvasId, particleCount = 75, speed = 0.22) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const pointer = { x: null, y: null };

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: Math.random() * 1.8 + 0.6
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70, 213, 255, 0.72)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 130) {
          ctx.strokeStyle = `rgba(47, 125, 255, ${0.16 * (1 - distance / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      if (pointer.x !== null) {
        const distance = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (distance < 170) {
          ctx.strokeStyle = `rgba(70, 213, 255, ${0.22 * (1 - distance / 170)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; });
  window.addEventListener('pointerleave', () => { pointer.x = null; pointer.y = null; });
  resize();
  draw();
}

createNeuralCanvas('neuralCanvas', 85, 0.18);
createNeuralCanvas('introCanvas', 105, 0.32);