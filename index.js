// Converter script
(() => {
  // DOM refs
  const lengthEl = document.getElementById('length');
  const widthEl = document.getElementById('width');
  const heightEl = document.getElementById('height');
  const lengthUnit = document.getElementById('lengthUnit');
  const widthUnit = document.getElementById('widthUnit');
  const heightUnit = document.getElementById('heightUnit');
  const precisionEl = document.getElementById('precision');
  const showDetailsEl = document.getElementById('showDetails');
  const boardFeetEl = document.getElementById('boardFeet');
  const cubicMetersEl = document.getElementById('cubicMeters');
  const cubicFeetEl = document.getElementById('cubicFeet');
  const detailsEl = document.getElementById('details');
  const detailText = document.getElementById('detailText');
  const copyBtn = document.getElementById('copyBtn');
  const resetBtn = document.getElementById('resetBtn');

  // New DOM refs: felled and standing
  const felledDiameterEl = document.getElementById('felledDiameter');
  const felledDiameterUnitEl = document.getElementById('felledDiameterUnit');
  const felledLengthEl = document.getElementById('felledLength');
  const felledLengthUnitEl = document.getElementById('felledLengthUnit');
  const felledFormEl = document.getElementById('felledForm');
  const felledBarkEl = document.getElementById('felledBark');

  const standingDiameterEl = document.getElementById('standingDiameter');
  const standingDiameterUnitEl = document.getElementById('standingDiameterUnit');
  const standingHeightEl = document.getElementById('standingHeight');
  const standingHeightUnitEl = document.getElementById('standingHeightUnit');
  const standingFormEl = document.getElementById('standingForm');
  const standingBarkEl = document.getElementById('standingBark');

  const felledVolumeEl = document.getElementById('felledVolume');
  const standingVolumeEl = document.getElementById('standingVolume');

  // Unit helpers (meters, inches, feet conversions)
  function toMeters(value, unit) {
    if (isNaN(value)) return NaN;
    switch (unit) {
      case 'm': return value;
      case 'cm': return value / 100;
      case 'mm': return value / 1000;
      case 'in': return value * 0.0254;
      case 'ft': return value * 0.3048;
      default: return NaN;
    }
  }
  function toInches(value, unit) {
    if (isNaN(value)) return NaN;
    switch (unit) {
      case 'in': return value;
      case 'ft': return value * 12;
      case 'cm': return value / 2.54;
      case 'mm': return value / 25.4;
      case 'm': return value / 0.0254;
      default: return NaN;
    }
  }
  function toFeet(value, unit) {
    if (isNaN(value)) return NaN;
    switch (unit) {
      case 'ft': return value;
      case 'in': return value / 12;
      case 'cm': return (value / 100) / 0.3048;
      case 'mm': return (value / 1000) / 0.3048;
      case 'm': return value / 0.3048;
      default: return NaN;
    }
  }

  function formatNumber(value, decimals) {
    if (!isFinite(value)) return '—';
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  }

  // Round log: cylinder volume helper
  function cylinderVolume(diameter_m, length_m) {
    const r = diameter_m / 2;
    return Math.PI * r * r * length_m; // m^3
  }

  function computeAndRender() {
    const p = Math.max(0, Math.min(6, Number(precisionEl.value) || 3));
    const L = Number(lengthEl.value);
    const W = Number(widthEl.value);
    const H = Number(heightEl.value);

    if ([L, W, H].some(v => v <= 0 || isNaN(v))) {
      boardFeetEl.textContent = '—';
      cubicMetersEl.textContent = '—';
      cubicFeetEl.textContent = '—';
      detailText.textContent = 'Enter positive numeric values for Length, Width and Height.';
      detailsEl.hidden = !showDetailsEl.checked;
    } else {
      // Convert to meters
      const L_m = toMeters(L, lengthUnit.value);
      const W_m = toMeters(W, widthUnit.value);
      const H_m = toMeters(H, heightUnit.value);

      // Volumes
      const volume_m3 = L_m * W_m * H_m; // cubic meters
      const cubicFeet = volume_m3 / 0.028316846592; // 1 ft^3 = 0.028316846592 m^3

      // Board feet calculation:
      // BF = (width_in_inches * thickness_in_inches * length_in_feet) / 12
      const W_in = toInches(W, widthUnit.value);
      const H_in = toInches(H, heightUnit.value); // treat height as thickness
      const L_ft = toFeet(L, lengthUnit.value);
      const boardFeet = (W_in * H_in * L_ft) / 12;

      // Render
      boardFeetEl.textContent = formatNumber(boardFeet, p) + ' bf';
      cubicMetersEl.textContent = formatNumber(volume_m3, p) + ' m³';
      cubicFeetEl.textContent = formatNumber(cubicFeet, p) + ' ft³';

      // Details text base
      const details = [
        `Inputs: Length = ${L} ${lengthUnit.value}, Width = ${W} ${widthUnit.value}, Height (thickness) = ${H} ${heightUnit.value}`,
        '',
        `Converted: Length = ${formatNumber(L_m, 6)} m (${formatNumber(L_ft, 6)} ft)`,
        `Converted: Width = ${formatNumber(W_m, 6)} m (${formatNumber(W_in, 6)} in)`,
        `Converted: Height = ${formatNumber(H_m, 6)} m (${formatNumber(H_in, 6)} in)`,
        '',
        `Volume = L × W × H = ${formatNumber(volume_m3, 6)} m³ = ${formatNumber(cubicFeet, 6)} ft³`,
        `Board Feet = (W_in × H_in × L_ft) / 12 = (${formatNumber(W_in, 6)} × ${formatNumber(H_in, 6)} × ${formatNumber(L_ft, 6)}) / 12 = ${formatNumber(boardFeet, 6)} bf`
      ].join('\n');

      detailText.textContent = details;
      detailsEl.hidden = !showDetailsEl.checked;
    }

    // --- Felled log computation ---
    const d_f = Number(felledDiameterEl.value);
    const d_f_unit = felledDiameterUnitEl.value;
    const l_f = Number(felledLengthEl.value);
    const l_f_unit = felledLengthUnitEl.value;
    const form_f = Math.max(0, Math.min(1, Number(felledFormEl.value) || 0.9));
    const bark_f = Math.max(0, Math.min(100, Number(felledBarkEl.value) || 0));

    let felled_m3 = NaN;
    if (!(isNaN(d_f) || d_f <= 0 || isNaN(l_f) || l_f <= 0)) {
      const d_f_m = toMeters(d_f, d_f_unit);
      const l_f_m = toMeters(l_f, l_f_unit);
      const raw = cylinderVolume(d_f_m, l_f_m);
      felled_m3 = raw * form_f * (1 - bark_f / 100);
    }

    // --- Standing tree computation (basal area * height * form factor) ---
    const d_s = Number(standingDiameterEl.value);
    const d_s_unit = standingDiameterUnitEl.value;
    const h_s = Number(standingHeightEl.value);
    const h_s_unit = standingHeightUnitEl.value;
    const form_s = Math.max(0, Math.min(1, Number(standingFormEl.value) || 0.4));
    const bark_s = Math.max(0, Math.min(100, Number(standingBarkEl.value) || 0));

    let standing_m3 = NaN;
    if (!(isNaN(d_s) || d_s <= 0 || isNaN(h_s) || h_s <= 0)) {
      const d_s_m = toMeters(d_s, d_s_unit);
      const h_s_m = toMeters(h_s, h_s_unit);
      const basal_area = Math.PI * Math.pow(d_s_m / 2, 2); // m^2
      const raw = basal_area * h_s_m * form_s; // m^3
      standing_m3 = raw * (1 - bark_s / 100);
    }

    // Render felled and standing results
    const felled_ft3 = isFinite(felled_m3) ? felled_m3 / 0.028316846592 : NaN;
    const standing_ft3 = isFinite(standing_m3) ? standing_m3 / 0.028316846592 : NaN;

    const p = Math.max(0, Math.min(6, Number(precisionEl.value) || 3));
    felledVolumeEl.textContent = (isFinite(felled_m3) ? `${formatNumber(felled_m3, p)} m³ / ${formatNumber(felled_ft3, p)} ft³` : '—');
    standingVolumeEl.textContent = (isFinite(standing_m3) ? `${formatNumber(standing_m3, p)} m³ / ${formatNumber(standing_ft3, p)} ft³` : '—');

    // Append felled/standing details when details visible
    if (!detailsEl.hidden) {
      const more = [
        '',
        '--- Round log calculations ---',
        felled_m3 ? `Felled log: diameter = ${d_f} ${d_f_unit}, length = ${l_f} ${l_f_unit}, form = ${form_f}, bark% = ${bark_f} => ${formatNumber(felled_m3, 6)} m³` : 'Felled log: enter diameter and length',
        standing_m3 ? `Standing tree: DBH = ${d_s} ${d_s_unit}, height = ${h_s} ${h_s_unit}, form = ${form_s}, bark% = ${bark_s} => ${formatNumber(standing_m3, 6)} m³` : 'Standing tree: enter DBH and merchantable height'
      ].join('\n');

      detailText.textContent = detailText.textContent + more;
    }
  }

  // Events
  ['input', 'change'].forEach(ev => {
    [lengthEl, widthEl, heightEl, lengthUnit, widthUnit, heightUnit, precisionEl, showDetailsEl,
     felledDiameterEl, felledDiameterUnitEl, felledLengthEl, felledLengthUnitEl, felledFormEl, felledBarkEl,
     standingDiameterEl, standingDiameterUnitEl, standingHeightEl, standingHeightUnitEl, standingFormEl, standingBarkEl
    ].forEach(el => {
      el.addEventListener(ev, computeAndRender, { passive: true });
    });
  });

  copyBtn.addEventListener('click', async () => {
    const text = `Board Feet: ${boardFeetEl.textContent}\nCubic meters: ${cubicMetersEl.textContent}\nCubic feet: ${cubicFeetEl.textContent}\nFelled log: ${felledVolumeEl.textContent}\nStanding tree: ${standingVolumeEl.textContent}`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy results'), 1400);
    } catch (err) {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => (copyBtn.textContent = 'Copy results'), 1400);
    }
  });

  resetBtn.addEventListener('click', () => {
    lengthEl.value = '';
    widthEl.value = '';
    heightEl.value = '';
    lengthUnit.value = 'ft';
    widthUnit.value = 'in';
    heightUnit.value = 'in';
    precisionEl.value = '3';
    showDetailsEl.checked = true;

    // reset new inputs
    felledDiameterEl.value = '';
    felledDiameterUnitEl.value = 'm';
    felledLengthEl.value = '';
    felledLengthUnitEl.value = 'm';
    felledFormEl.value = '0.9';
    felledBarkEl.value = '0';

    standingDiameterEl.value = '';
    standingDiameterUnitEl.value = 'm';
    standingHeightEl.value = '';
    standingHeightUnitEl.value = 'm';
    standingFormEl.value = '0.4';
    standingBarkEl.value = '0';

    computeAndRender();
  });

  // initial demo values
  lengthEl.value = 8;
  lengthUnit.value = 'ft';
  widthEl.value = 6;
  widthUnit.value = 'in';
  heightEl.value = 2;
  heightUnit.value = 'in';

  // leave new fields empty by default
  computeAndRender();
})();
