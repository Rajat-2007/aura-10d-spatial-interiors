/* ==========================================================================
   AURA 10D SPATIAL BUDGET & PROJECT ESTIMATOR
   Interactive Real-Time Architecture & Renovation Valuation Engine
   ========================================================================== */

class SpatialCalculator {
  constructor() {
    this.areaSlider = document.getElementById('calc-area-slider');
    this.areaValueEl = document.getElementById('calc-area-val');
    this.typeRadios = document.querySelectorAll('input[name="property-type"]');
    this.tierRadios = document.querySelectorAll('input[name="material-tier"]');
    this.smartToggle = document.getElementById('calc-smart-toggle');
    this.acousticToggle = document.getElementById('calc-acoustic-toggle');

    this.totalPriceEl = document.getElementById('calc-total-price');
    this.timelineEl = document.getElementById('calc-timeline');
    this.breakdownListEl = document.getElementById('calc-breakdown');

    this.init();
  }

  init() {
    if (!this.areaSlider) return;

    this.areaSlider.addEventListener('input', () => this.calculate());
    this.typeRadios.forEach(r => r.addEventListener('change', () => this.calculate()));
    this.tierRadios.forEach(r => r.addEventListener('change', () => this.calculate()));
    if (this.smartToggle) this.smartToggle.addEventListener('change', () => this.calculate());
    if (this.acousticToggle) this.acousticToggle.addEventListener('change', () => this.calculate());

    const copyBtn = document.getElementById('calc-copy-estimate');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyEstimate());
    }

    this.calculate();
  }

  calculate() {
    const area = parseInt(this.areaSlider.value, 10);
    if (this.areaValueEl) {
      this.areaValueEl.innerText = `${area.toLocaleString()} sq.ft`;
    }

    // Property Type multiplier
    let typeMultiplier = 1.0;
    this.typeRadios.forEach(r => {
      if (r.checked) typeMultiplier = parseFloat(r.value);
    });

    // Material tier rate per sq.ft
    let baseRate = 180; // Default Platinum
    this.tierRadios.forEach(r => {
      if (r.checked) baseRate = parseFloat(r.value);
    });

    // Addons
    const smartCost = (this.smartToggle && this.smartToggle.checked) ? area * 35 : 0;
    const acousticCost = (this.acousticToggle && this.acousticToggle.checked) ? area * 25 : 0;

    // Total Calculation
    const architectureMillwork = Math.round(area * baseRate * typeMultiplier);
    const total = architectureMillwork + smartCost + acousticCost;

    // Estimated Timeline in weeks
    const weeks = Math.round(12 + (area / 800) * 2);

    if (this.totalPriceEl) {
      this.totalPriceEl.innerText = `$${total.toLocaleString()}`;
    }
    if (this.timelineEl) {
      this.timelineEl.innerText = `${weeks} - ${weeks + 4} Weeks`;
    }

    if (this.breakdownListEl) {
      this.breakdownListEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.85rem;">
          <span style="color:var(--text-muted)">Architectural Millwork & PBR Finishes:</span>
          <span style="color:#fff;font-family:var(--font-tech)">$${architectureMillwork.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.85rem;">
          <span style="color:var(--text-muted)">Circadian IoT & Lighting Engine:</span>
          <span style="color:#fff;font-family:var(--font-tech)">$${smartCost.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:0.85rem;">
          <span style="color:var(--text-muted)">10D Spatial Acoustics & Sound Isolation:</span>
          <span style="color:#fff;font-family:var(--font-tech)">$${acousticCost.toLocaleString()}</span>
        </div>
      `;
    }
  }

  copyEstimate() {
    const total = this.totalPriceEl ? this.totalPriceEl.innerText : '$0';
    const area = this.areaSlider ? this.areaSlider.value : '0';
    const text = `AURA 10D Spatial Interiors — Official Estimate\nProperty Area: ${area} sq.ft\nEstimated Investment: ${total}\nTurnkey Delivery: Guaranteed`;

    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = document.getElementById('calc-copy-estimate');
      if (copyBtn) {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'COPIED TO CLIPBOARD!';
        setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.spatialCalc = new SpatialCalculator();
});
