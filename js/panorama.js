/* ==========================================================================
   AURA 360° INTERACTIVE PANORAMA ROOM VIEWER
   Mouse Drag & Tilt 360 Equirectangular Panoramic Explorer
   ========================================================================== */

class PanoramaViewer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Mouse control parameters
    this.isUserInteracting = false;
    this.onMouseDownMouseX = 0;
    this.onMouseDownMouseY = 0;
    this.lon = 0;
    this.onMouseDownLon = 0;
    this.lat = 0;
    this.onMouseDownLat = 0;
    this.phi = 0;
    this.theta = 0;
    this.fov = 75;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || 800;
    const height = this.canvas.clientHeight || 500;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.fov, width / height, 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // High-res Procedural Interior Sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert sphere inside out

    // Generate high-resolution procedural interior texture canvas
    const canvasTexture = this.generateProceduralPanoTexture();
    const texture = new THREE.CanvasTexture(canvasTexture);

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  generateProceduralPanoTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 2048;
    pCanvas.height = 1024;
    const ctx = pCanvas.getContext('2d');

    // Gradient room ambient: floor, walls, ceiling
    const grad = ctx.createLinearGradient(0, 0, 0, pCanvas.height);
    grad.addColorStop(0, '#0a0d14');   // Ceiling
    grad.addColorStop(0.3, '#141c2b'); // Wall upper
    grad.addColorStop(0.5, '#1e2638'); // Horizon
    grad.addColorStop(0.7, '#151b26'); // Floor lower
    grad.addColorStop(1, '#080a0f');   // Floor ground
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, pCanvas.width, pCanvas.height);

    // Architectural windows & city lights
    ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.fillRect(600, 300, 800, 400);

    // Architectural Slats & Lines
    ctx.strokeStyle = 'rgba(229, 185, 111, 0.25)';
    ctx.lineWidth = 4;
    for (let x = 0; x < pCanvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 280);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }

    // Modern glowing lights
    ctx.fillStyle = '#ffbe53';
    ctx.shadowColor = '#ffbe53';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(1024, 250, 24, 0, Math.PI * 2);
    ctx.fill();

    return pCanvas;
  }

  setupEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isUserInteracting = true;
      this.onMouseDownMouseX = e.clientX;
      this.onMouseDownMouseY = e.clientY;
      this.onMouseDownLon = this.lon;
      this.onMouseDownLat = this.lat;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isUserInteracting) return;
      this.lon = (this.onMouseDownMouseX - e.clientX) * 0.1 + this.onMouseDownLon;
      this.lat = (e.clientY - this.onMouseDownMouseY) * 0.1 + this.onMouseDownLat;
    });

    window.addEventListener('mouseup', () => {
      this.isUserInteracting = false;
    });

    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.fov += e.deltaY * 0.05;
      this.fov = Math.max(40, Math.min(95, this.fov));
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }, { passive: false });

    // Window resize
    window.addEventListener('resize', () => {
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Zoom buttons
    const btnIn = document.getElementById('pano-zoom-in');
    const btnOut = document.getElementById('pano-zoom-out');
    if (btnIn) {
      btnIn.addEventListener('click', () => {
        this.fov = Math.max(40, this.fov - 10);
        this.camera.fov = this.fov;
        this.camera.updateProjectionMatrix();
      });
    }
    if (btnOut) {
      btnOut.addEventListener('click', () => {
        this.fov = Math.min(95, this.fov + 10);
        this.camera.fov = this.fov;
        this.camera.updateProjectionMatrix();
      });
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Auto rotate slowly when not interacting
    if (!this.isUserInteracting) {
      this.lon += 0.04;
    }

    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = THREE.MathUtils.degToRad(90 - this.lat);
    this.theta = THREE.MathUtils.degToRad(this.lon);

    this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
    this.camera.target.y = 500 * Math.cos(this.phi);
    this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);

    this.camera.lookAt(this.camera.target);
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('panorama-canvas') && typeof THREE !== 'undefined') {
    window.panoramaViewer = new PanoramaViewer('panorama-canvas');
  }
});
