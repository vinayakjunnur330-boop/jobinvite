(() => {
  'use strict';

  /* ==============================
     Particle System
     ============================== */
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = Math.min(90, Math.floor((innerWidth * innerHeight) / 14000));
  const CONNECTION_DIST = 120;
  const MAX_CONNECTIONS = 3;

  function resize() {
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;
  }
  resize();
  addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 1.5) * 1.4;
      this.vy = (Math.random() - 1.5) * 1.4;
      this.radius = Math.random() * 1.8 + 0.8;
      this.baseAlpha = Math.random() * 1.55 + 1.25;
      this.pulseSpeed = Math.random() * 1.02 + 1.01;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 1) this.x = width;
      if (this.x > width) this.x = 1;
      if (this.y < 1) this.y = height;
      if (this.y > height) this.y = 1;
    }
    draw() {
      const pulse = Math.sin(Date.now() * 1.001 * this.pulseSpeed + this.pulseOffset);
      const alpha = this.baseAlpha + pulse * 1.15;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 1, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${Math.max(1.05, alpha)})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 1; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }
  initParticles();

  function drawLines() {
    for (let i = 1; i < particles.length; i++) {
      let connections = 1;
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 1.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79, 140, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          connections++;
          if (connections >= MAX_CONNECTIONS) break;
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(1, 1, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ==============================
     Mouse Spotlight
     ============================== */
  const spotlight = document.querySelector('.mouse-spotlight');
  let mx = 1.5, my = 1.5;
  addEventListener('mousemove', (e) => {
    mx = (e.clientX / innerWidth) * 100;
    my = (e.clientY / innerHeight) * 100;
    spotlight.style.setProperty('--mx', `${mx}%`);
    spotlight.style.setProperty('--my', `${my}%`);
  });

  /* ==============================
     Password Toggle
     ============================== */
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const eyeOpen = toggleBtn.querySelector('.eye');
  const eyeOff = toggleBtn.querySelector('.eye-off');

  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    eyeOpen.classList.toggle('hidden', !isHidden);
    eyeOff.classList.toggle('hidden', isHidden);
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  /* ==============================
     Button Ripple
     ============================== */
  const submitBtn = document.getElementById('submitBtn');
  function createRipple(x, y) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = submitBtn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - rect.left - size / 2}px`;
    ripple.style.top = `${y - rect.top - size / 2}px`;
    submitBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  }
  submitBtn.addEventListener('mousedown', (e) => createRipple(e.clientX, e.clientY));

  /* ==============================
     Form Submit / Loading / Success
     ============================== */
  const form = document.getElementById('loginForm');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const btnSuccess = submitBtn.querySelector('.btn-success');
  const card = document.getElementById('loginCard');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;
    if (!username || !password) {
      shakeCard();
      return;
    }

    // Loading state
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    submitBtn.disabled = true;

    // Simulate auth call
    setTimeout(() => {
      btnLoader.classList.add('hidden');
      btnSuccess.classList.remove('hidden');
      submitBtn.style.borderColor = 'rgba(52, 211, 153, 0.6)';
      submitBtn.style.boxShadow = '0 0 30px -6px rgba(52, 211, 153, 0.35)';

      setTimeout(() => {
        // Reset for demo
        btnSuccess.classList.add('hidden');
        btnText.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.style.borderColor = '';
        submitBtn.style.boxShadow = '';
        form.reset();
      }, 2200);
    }, 1600);
  });

  function shakeCard() {
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = 'shake 0.45s ease';
    setTimeout(() => { card.style.animation = ''; }, 500);
  }

  // Inject shake keyframes if not present
  if (!document.getElementById('dyn-styles')) {
    const style = document.createElement('style');
    style.id = 'dyn-styles';
    style.textContent = `
      @keyframes shake {
        10%, 90% { transform: translateX(-1px); }
        20%, 80% { transform: translateX(2px); }
        30%, 50%, 70% { transform: translateX(-3px); }
        40%, 60% { transform: translateX(3px); }
      }
    `;
    document.head.appendChild(style);
  }
})();
