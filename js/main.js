/* ==========================================================================
   AURA 10D SPATIAL INTERIORS — CORE APPLICATION LOGIC
   Magnetic Cursor, Horizontal Drag-Scroll, Before/After Slider, Smart IoT, Clocks
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initNavbarScroll();
  initHorizontalScrollMatrix();
  initBeforeAfterSlider();
  initLightingStudioControls();
  initSmartIoTControls();
  initWorldClocks();
  init3DCardTilt();
  initModalAndForms();
});

/* 1. CUSTOM 10D MAGNETIC CURSOR */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  const label = document.querySelector('.cursor-label');

  if (!cursor || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  // Magnetic hover states on clickable & interactive items
  const interactiveTargets = document.querySelectorAll('a, button, .jump-node, .material-card, .horizontal-room-card, .blueprint-pin, input');
  interactiveTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      const customLabel = el.getAttribute('data-cursor-label');
      if (label) {
        label.innerText = customLabel || 'EXPLORE';
      }
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      if (label) label.innerText = '';
    });
  });
}

/* 2. NAVBAR SCROLL EFFECT */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Lighting theme buttons
  document.querySelectorAll('.lighting-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lighting-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      if (window.spatialScene) {
        window.spatialScene.setLightingMode(mode);
      } else {
        document.body.setAttribute('data-lighting', mode);
      }
    });
  });

  // Sound Engine Quick Nav Toggle
  const navAudio = document.getElementById('nav-audio-toggle');
  if (navAudio) {
    navAudio.addEventListener('click', () => {
      if (window.spatialAudio) {
        window.spatialAudio.togglePlay();
      }
    });
  }

  // Mobile menu toggle
  const mobileBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(10, 14, 23, 0.98)';
        navLinks.style.padding = '24px';
        navLinks.style.borderRadius = '20px';
      }
    });
  }
}

/* 3. HORIZONTAL DRAG & SCROLL ROOM MATRIX (LEFT-TO-RIGHT) */
function initHorizontalScrollMatrix() {
  const trackContainer = document.querySelector('.horizontal-track-container');
  if (!trackContainer) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  trackContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - trackContainer.offsetLeft;
    scrollLeft = trackContainer.scrollLeft;
  });

  trackContainer.addEventListener('mouseleave', () => {
    isDown = false;
  });

  trackContainer.addEventListener('mouseup', () => {
    isDown = false;
  });

  trackContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - trackContainer.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    trackContainer.scrollLeft = scrollLeft - walk;
  });

  // Mouse wheel horizontal scrolling
  trackContainer.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      trackContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // Buttons next / prev
  const nextBtn = document.getElementById('track-next-btn');
  const prevBtn = document.getElementById('track-prev-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      trackContainer.scrollBy({ left: 450, behavior: 'smooth' });
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      trackContainer.scrollBy({ left: -450, behavior: 'smooth' });
    });
  }
}

/* 4. BEFORE & AFTER RENOVATION SLIDER */
function initBeforeAfterSlider() {
  const container = document.querySelector('.comparison-slider-wrapper');
  const beforeImg = document.querySelector('.comparison-before');
  const handle = document.querySelector('.comparison-handle');

  if (!container || !beforeImg || !handle) return;

  let isSliding = false;

  function moveSlider(clientX) {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percentage = (x / rect.width) * 100;

    beforeImg.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  }

  handle.addEventListener('mousedown', () => { isSliding = true; });
  window.addEventListener('mouseup', () => { isSliding = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isSliding) return;
    moveSlider(e.clientX);
  });

  // Touch Support
  handle.addEventListener('touchstart', () => { isSliding = true; });
  window.addEventListener('touchend', () => { isSliding = false; });
  window.addEventListener('touchmove', (e) => {
    if (!isSliding) return;
    moveSlider(e.touches[0].clientX);
  });
}

/* 5. LIGHTING STUDIO CONTROLS */
function initLightingStudioControls() {
  const kelvinSlider = document.getElementById('kelvin-slider');
  const kelvinVal = document.getElementById('kelvin-val');
  const previewImg = document.querySelector('.lighting-preview-img');

  if (kelvinSlider && previewImg) {
    kelvinSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (kelvinVal) kelvinVal.innerText = `${val}K`;

      // Adjust color temperature filter
      if (val < 3500) {
        previewImg.style.filter = `sepia(0.35) saturate(1.4) hue-rotate(-15deg) brightness(0.95)`;
      } else if (val < 5000) {
        previewImg.style.filter = `sepia(0.1) saturate(1.1) brightness(1.0)`;
      } else {
        previewImg.style.filter = `saturate(1.2) hue-rotate(15deg) brightness(1.05)`;
      }
    });
  }

  // RGB Accent Swatches
  document.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const color = btn.dataset.color;
      if (previewImg) {
        previewImg.style.boxShadow = `0 0 50px ${color}`;
      }
      if (window.spatialScene && window.spatialScene.lights.floorAccent) {
        window.spatialScene.lights.floorAccent.color.set(color);
      }
    });
  });
}

/* 6. SMART IOT CONTROLS */
function initSmartIoTControls() {
  document.querySelectorAll('.smart-widget input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const widget = e.target.closest('.smart-widget');
      const statusEl = widget.querySelector('.widget-status');
      if (statusEl) {
        statusEl.innerText = e.target.checked ? 'ACTIVE / ONLINE' : 'STANDBY';
        statusEl.style.color = e.target.checked ? 'var(--accent-gold)' : 'var(--text-dim)';
      }
    });
  });
}

/* 7. WORLD CLOCKS (TOKYO, NEW YORK, PARIS, DUBAI) */
function initWorldClocks() {
  function update() {
    const timeZones = [
      { id: 'time-tokyo', tz: 'Asia/Tokyo' },
      { id: 'time-ny', tz: 'America/New_York' },
      { id: 'time-paris', tz: 'Europe/Paris' },
      { id: 'time-dubai', tz: 'Asia/Dubai' }
    ];

    timeZones.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        const str = new Intl.DateTimeFormat('en-US', {
          timeZone: item.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date());
        el.innerText = str;
      }
    });
  }
  update();
  setInterval(update, 1000);
}

/* 8. 3D CARD TILT ON MOUSE HOVER */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* 9. MODALS, BOOKING FORM & HUD CLOSE */
function initModalAndForms() {
  const closeInspectBtn = document.getElementById('hud-inspect-close');
  if (closeInspectBtn) {
    closeInspectBtn.addEventListener('click', () => {
      const card = document.getElementById('hud-inspect-card');
      if (card) card.style.display = 'none';
      if (window.spatialScene) {
        window.spatialScene.cameraTargetPosition.set(0, 3, 14);
      }
    });
  }

  // Fast Jump Node clicks
  document.querySelectorAll('.jump-node').forEach(node => {
    node.addEventListener('click', () => {
      document.querySelectorAll('.jump-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const spotId = node.dataset.spot;
      if (window.spatialScene) {
        const spot = window.spatialScene.hotspots.find(h => h.userData.id === spotId);
        if (spot) {
          window.spatialScene.focusHotspot(spot.userData);
        }
      }
    });
  });

  // Soundscape buttons in section
  document.querySelectorAll('.soundscape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sound = btn.dataset.sound;
      if (window.spatialAudio) {
        window.spatialAudio.playPreset(sound);
      }
    });
  });

  // Booking form submission
  const bookingForm = document.getElementById('vip-booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = 'VIP RESERVATION CONFIRMED!';
        submitBtn.style.background = '#38ef7d';
        setTimeout(() => {
          submitBtn.innerHTML = 'CONFIRM VIP CONSULTATION';
          submitBtn.style.background = '';
          bookingForm.reset();
        }, 3000);
      }
    });
  }
}
