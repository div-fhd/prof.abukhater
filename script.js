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

function hideIntro() {
  intro?.classList.add('hidden');
  
}

window.addEventListener('load', () => {
  setTimeout(hideIntro, 6000);
});
skipIntro?.addEventListener('click', hideIntro);
playIntro?.addEventListener('click', () => {
  if (!document.body.contains(intro)) return;
  intro.classList.remove('hidden');
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
  const message = encodeURIComponent(
    `Appointment Request%0A%0AName: ${data.name}%0APhone: ${data.phone}%0AEmail: ${data.email || '-'}%0AService: ${data.service}%0ADate: ${data.date || '-'}%0ATime: ${data.time || '-'}%0AMessage: ${data.message || '-'}`
  );
  window.open(`https://wa.me/4917645122026?text=${message}`, '_blank', 'noopener,noreferrer');
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
