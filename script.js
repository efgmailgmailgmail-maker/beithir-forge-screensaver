(() => {
  const canvas = document.getElementById('embers');
  const ctx = canvas.getContext('2d');
  const clock = document.getElementById('clock');
  const fullscreenButton = document.getElementById('fullscreen');
  const hint = document.getElementById('hint');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let particles = [];
  let lastFrame = 0;
  let hiddenTimer;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = reducedMotion ? 0 : Math.min(95, Math.floor(width / 15));
    particles = Array.from({ length: count }, () => createParticle(true));
  };

  const createParticle = (initial = false) => ({
    x: Math.random() * width,
    y: initial ? Math.random() * height : height + 12,
    size: Math.random() * 2.2 + 0.45,
    speed: Math.random() * 0.65 + 0.18,
    drift: (Math.random() - 0.5) * 0.55,
    alpha: Math.random() * 0.56 + 0.17,
    phase: Math.random() * Math.PI * 2,
    hue: Math.random() > 0.78 ? 37 : 17 + Math.random() * 15
  });

  const draw = (time = 0) => {
    requestAnimationFrame(draw);
    if (time - lastFrame < 30) return;
    lastFrame = time;
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift + Math.sin(time / 1100 + p.phase) * 0.22;
      const shimmer = 0.65 + Math.sin(time / 420 + p.phase) * 0.35;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.hue === 37 ? 66 : 58}%, ${p.alpha * shimmer})`;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 54%, .8)`;
      ctx.shadowBlur = p.size * 5;
      ctx.arc(p.x, p.y, p.size * shimmer, 0, Math.PI * 2);
      ctx.fill();
      if (p.y < -15 || p.x < -15 || p.x > width + 15) Object.assign(p, createParticle());
    });
    ctx.shadowBlur = 0;
  };

  const updateClock = () => {
    clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(new Date());
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      hint.textContent = 'FULLSCREEN IS NOT AVAILABLE IN THIS BROWSER';
    }
  };

  fullscreenButton.addEventListener('click', toggleFullscreen);
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f' && !event.repeat) toggleFullscreen();
    if (event.key === 'Escape') hint.classList.remove('is-hidden');
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenButton.querySelector('span:last-child').textContent = document.fullscreenElement ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
  });
  document.addEventListener('pointermove', () => {
    hint.classList.add('is-hidden');
    clearTimeout(hiddenTimer);
    hiddenTimer = setTimeout(() => hint.classList.remove('is-hidden'), 4000);
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  const style = document.createElement('style');
  style.textContent = '.hint { transition: opacity .5s; } .hint.is-hidden { opacity: 0; }';
  document.head.appendChild(style);
  resize();
  updateClock();
  window.setInterval(updateClock, 1000);
  requestAnimationFrame(draw);
})();
