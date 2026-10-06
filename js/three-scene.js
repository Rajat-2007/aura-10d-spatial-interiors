/* ==========================================================================
   AURA 10D THREE.JS SPATIAL INTERIOR ENGINE
   Real-Time 3D WebGL Architectural Environment with Mouse Parallax & Lighting
   ========================================================================== */

class SpatialInteriorScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.roomGroup = new THREE.Group();
    this.hotspots = [];
    this.particles = null;

    // Mouse coordinates & lerp smoothing
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.cameraRotationY = 0;
    this.cameraTargetPosition = new THREE.Vector3(0, 3, 14);

    // Lighting Presets
    this.lights = {};
    this.currentMode = 'midnight';

    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090e);
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.025);

    // 2. Camera Setup
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3, 14);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Build Environment & Architecture
    this.setupLighting();
    this.buildArchitecturalRoom();
    this.buildLuxuryFurniture();
    this.createFloatingAtmosphere();
    this.createHotspots();

    this.scene.add(this.roomGroup);

    // 5. Event Listeners
    this.setupEvents();

    // 6. Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Ambient Light
    this.lights.ambient = new THREE.AmbientLight(0x222a38, 1.2);
    this.scene.add(this.lights.ambient);

    // Directional Key Light (Window Moonlight / Sunlight)
    this.lights.directional = new THREE.DirectionalLight(0xdbe7ff, 2.0);
    this.lights.directional.position.set(10, 15, -10);
    this.lights.directional.castShadow = true;
    this.lights.directional.shadow.mapSize.width = 1024;
    this.lights.directional.shadow.mapSize.height = 1024;
    this.lights.directional.shadow.bias = -0.001;
    this.scene.add(this.lights.directional);

    // Chandelier Warm Glow
    this.lights.chandelier = new THREE.PointLight(0xffbe53, 2.5, 18);
    this.lights.chandelier.position.set(0, 5.5, 0);
    this.lights.chandelier.castShadow = true;
    this.scene.add(this.lights.chandelier);

    // Accent Floor LED Strips
    this.lights.floorAccent = new THREE.PointLight(0x00f2fe, 1.5, 12);
    this.lights.floorAccent.position.set(-6, 0.5, 4);
    this.scene.add(this.lights.floorAccent);

    // Cozy Sofa Reading Lamp
    this.lights.lamp = new THREE.PointLight(0xff9966, 1.8, 8);
    this.lights.lamp.position.set(4.5, 3.2, 1);
    this.scene.add(this.lights.lamp);
  }

  buildArchitecturalRoom() {
    // Floor - Luxury Dark Italian Marble with subtle gloss
    const floorGeo = new THREE.PlaneGeometry(30, 30, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.15,
      metalness: 0.25,
      bumpScale: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.roomGroup.add(floor);

    // Back Wall - Architectural Concrete / Dark Slat Acoustic Panels
    const wallGeo = new THREE.PlaneGeometry(30, 14);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x161c28,
      roughness: 0.8,
      metalness: 0.1
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 7, -8);
    backWall.receiveShadow = true;
    this.roomGroup.add(backWall);

    // Fluted Wooden Slats Accent Wall
    const slatGroup = new THREE.Group();
    const slatGeo = new THREE.BoxGeometry(0.08, 12, 0.12);
    const slatMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.6,
      metalness: 0.1
    });
    for (let i = -7; i < -1; i += 0.22) {
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(i, 6, -7.85);
      slat.castShadow = true;
      slatGroup.add(slat);
    }
    this.roomGroup.add(slatGroup);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(30, 30);
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e16,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.position.y = 10;
    ceiling.rotation.x = Math.PI / 2;
    this.roomGroup.add(ceiling);

    // Floor-to-Ceiling Panoramic Window Frame (Right Side)
    const windowFrameGeo = new THREE.BoxGeometry(0.3, 9, 14);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      metalness: 0.8,
      roughness: 0.2
    });
    const windowFrame = new THREE.Mesh(windowFrameGeo, frameMat);
    windowFrame.position.set(10, 4.5, 0);
    this.roomGroup.add(windowFrame);

    // City Skyline Backdrop behind window
    const skyGeo = new THREE.PlaneGeometry(24, 12);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x0c1322,
      side: THREE.DoubleSide
    });
    const skyline = new THREE.Mesh(skyGeo, skyMat);
    skyline.position.set(14, 5, 0);
    skyline.rotation.y = -Math.PI / 2;
    this.roomGroup.add(skyline);
  }

  buildLuxuryFurniture() {
    // 1. Curvilinear Italian Designer Sofa
    const sofaGroup = new THREE.Group();
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x222a36,
      roughness: 0.7,
      metalness: 0.1
    });

    // Main base
    const baseGeo = new THREE.BoxGeometry(6.5, 0.7, 2.5);
    const base = new THREE.Mesh(baseGeo, sofaMat);
    base.position.set(0, 0.45, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    sofaGroup.add(base);

    // Backrest
    const backGeo = new THREE.BoxGeometry(6.5, 1.2, 0.6);
    const back = new THREE.Mesh(backGeo, sofaMat);
    back.position.set(0, 1.3, -1);
    back.castShadow = true;
    sofaGroup.add(back);

    // Designer Cushions
    const cushionMat = new THREE.MeshStandardMaterial({
      color: 0xe5b96f,
      roughness: 0.85
    });
    const cushionGeo = new THREE.BoxGeometry(0.8, 0.8, 0.3);
    const c1 = new THREE.Mesh(cushionGeo, cushionMat);
    c1.position.set(-1.8, 1.1, -0.6);
    c1.rotation.y = 0.2;
    const c2 = new THREE.Mesh(cushionGeo, cushionMat);
    c2.position.set(1.8, 1.1, -0.6);
    c2.rotation.y = -0.2;
    sofaGroup.add(c1);
    sofaGroup.add(c2);

    this.roomGroup.add(sofaGroup);

    // 2. Marble & Brass Coffee Table
    const tableGroup = new THREE.Group();
    const tableTopGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecef,
      roughness: 0.1,
      metalness: 0.3
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.set(0, 0.8, 2.8);
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    // Brass base
    const legGeo = new THREE.CylinderGeometry(0.6, 1.1, 0.7, 32);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0xb8863b,
      metalness: 0.85,
      roughness: 0.25
    });
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(0, 0.4, 2.8);
    leg.castShadow = true;
    tableGroup.add(leg);

    this.roomGroup.add(tableGroup);

    // 3. Ring Architectural Chandelier
    const chandelierGeo = new THREE.TorusGeometry(1.8, 0.06, 16, 64);
    const chandelierMat = new THREE.MeshStandardMaterial({
      color: 0xe5b96f,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xffbe53,
      emissiveIntensity: 0.6
    });
    const chandelier = new THREE.Mesh(chandelierGeo, chandelierMat);
    chandelier.rotation.x = Math.PI / 2;
    chandelier.position.set(0, 6.5, 0);
    this.roomGroup.add(chandelier);

    // 4. Floor Lamp
    const lampGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.5, 16);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xb8863b, metalness: 0.9, roughness: 0.2 });
    const pole = new THREE.Mesh(poleGeo, brassMat);
    pole.position.set(4.5, 2.25, 1);
    lampGroup.add(pole);

    const shadeGeo = new THREE.ConeGeometry(0.5, 0.6, 32);
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xffe0a3,
      roughness: 0.3,
      emissive: 0xffbe53,
      emissiveIntensity: 0.8
    });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(4.5, 4.2, 1);
    shade.rotation.x = Math.PI;
    lampGroup.add(shade);

    this.roomGroup.add(lampGroup);
  }

  createFloatingAtmosphere() {
    // Floating luminous 10D dust motes
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = Math.random() * 8 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 16;
      scales[i / 3] = Math.random() * 0.08 + 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffdf9e,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createHotspots() {
    const spotData = [
      { id: 'sofa', name: 'Curvilinear Salon Lounge', pos: [0, 1.2, 0], desc: 'Bespoke Italian velvet modular sofa with acoustic memory foam.' },
      { id: 'table', name: 'Calacatta & Brass Console', pos: [0, 1.1, 2.8], desc: 'Honed Italian Calacatta Viola marble with brushed bronze base.' },
      { id: 'chandelier', name: 'Halo 10D Chandelier', pos: [0, 6.2, 0], desc: 'Continuous circadian smart ring emitting 2700K to 6500K tunable lux.' },
      { id: 'window', name: 'Panoramic Infinity Glazing', pos: [8.5, 4.5, 0], desc: 'Triple-laminated acoustic low-iron glass with electrochromic tint.' }
    ];

    spotData.forEach(data => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(...data.pos);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe5b96f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      pinGroup.add(ring);

      // Inner pulsating sphere
      const dotGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      pinGroup.add(dot);

      pinGroup.userData = data;
      this.hotspots.push(pinGroup);
      this.scene.add(pinGroup);
    });
  }

  setupEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.canvas) return;
      const width = this.canvas.clientWidth || window.innerWidth;
      const height = this.canvas.clientHeight || window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Mouse Move Parallax
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Canvas Drag for 3D Camera Orbit
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      this.cameraRotationY += deltaX * 0.005;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Zoom on Scroll inside viewport
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraTargetPosition.z += e.deltaY * 0.005;
      this.cameraTargetPosition.z = Math.max(7, Math.min(18, this.cameraTargetPosition.z));
    }, { passive: false });

    // Raycast Click on 3D Hotspots
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.hotspots, true);

      if (intersects.length > 0) {
        let root = intersects[0].object;
        while (root.parent && !root.userData.name) {
          root = root.parent;
        }
        if (root.userData && root.userData.name) {
          this.focusHotspot(root.userData);
        }
      }
    });
  }

  focusHotspot(data) {
    // Update live HUD inspect card
    const titleEl = document.getElementById('hud-inspect-title');
    const descEl = document.getElementById('hud-inspect-desc');
    const cardEl = document.getElementById('hud-inspect-card');

    if (titleEl && descEl && cardEl) {
      titleEl.innerText = data.name;
      descEl.innerText = data.desc;
      cardEl.style.display = 'block';
      cardEl.style.animation = 'none';
      void cardEl.offsetWidth; // trigger reflow
      cardEl.style.animation = 'fadeIn 0.4s ease';
    }

    // Smooth camera glide
    this.cameraTargetPosition.set(data.pos[0] * 0.4, data.pos[1] + 1.2, data.pos[2] + 4.5);
  }

  setLightingMode(mode) {
    this.currentMode = mode;
    document.body.setAttribute('data-lighting', mode);

    switch (mode) {
      case 'day':
        this.scene.background.set(0x131a26);
        this.lights.ambient.color.set(0x607d9b);
        this.lights.ambient.intensity = 1.8;
        this.lights.directional.color.set(0xfff7e6);
        this.lights.directional.intensity = 2.8;
        this.lights.chandelier.color.set(0xffecc2);
        this.lights.chandelier.intensity = 1.2;
        break;

      case 'sunset':
        this.scene.background.set(0x190f19);
        this.lights.ambient.color.set(0x4a283e);
        this.lights.ambient.intensity = 1.2;
        this.lights.directional.color.set(0xff6e4a);
        this.lights.directional.intensity = 3.2;
        this.lights.chandelier.color.set(0xff9472);
        this.lights.chandelier.intensity = 2.0;
        break;

      case 'cyber':
        this.scene.background.set(0x060814);
        this.lights.ambient.color.set(0x0a1a36);
        this.lights.ambient.intensity = 1.0;
        this.lights.directional.color.set(0x00f2fe);
        this.lights.directional.intensity = 2.5;
        this.lights.chandelier.color.set(0x4facfe);
        this.lights.chandelier.intensity = 2.8;
        this.lights.floorAccent.color.set(0x00f2fe);
        this.lights.floorAccent.intensity = 3.0;
        break;

      case 'midnight':
      default:
        this.scene.background.set(0x07090e);
        this.lights.ambient.color.set(0x222a38);
        this.lights.ambient.intensity = 1.2;
        this.lights.directional.color.set(0xdbe7ff);
        this.lights.directional.intensity = 1.6;
        this.lights.chandelier.color.set(0xffbe53);
        this.lights.chandelier.intensity = 2.5;
        break;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Mouse Lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Smooth Camera Movements
    this.camera.position.x += (this.cameraTargetPosition.x + this.mouseX * 1.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.cameraTargetPosition.y - this.mouseY * 0.8 - this.camera.position.y) * 0.05;
    this.camera.position.z += (this.cameraTargetPosition.z - this.camera.position.z) * 0.05;

    // Apply Orbit rotation
    this.roomGroup.rotation.y = this.cameraRotationY + this.mouseX * 0.1;

    // Hotspot Billboard facing camera
    this.hotspots.forEach(spot => {
      spot.lookAt(this.camera.position);
    });

    // Particle subtle drift
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.002;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.camera.lookAt(0, 2.5, 0);
    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization on DOM load
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('three-canvas') && typeof THREE !== 'undefined') {
    window.spatialScene = new SpatialInteriorScene('three-canvas');
  }
});
