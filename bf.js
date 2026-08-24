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
      return;
    }

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

    // Details text
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

  // Events
  ['input', 'change'].forEach(ev => {
    [lengthEl, widthEl, heightEl, lengthUnit, widthUnit, heightUnit, precisionEl, showDetailsEl].forEach(el => {
      el.addEventListener(ev, computeAndRender, { passive: true });
    });
  });

  copyBtn.addEventListener('click', async () => {
    const text = `Board Feet: ${boardFeetEl.textContent}\nCubic meters: ${cubicMetersEl.textContent}\nCubic feet: ${cubicFeetEl.textContent}`;
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
    computeAndRender();
  });

  // initial demo values
  lengthEl.value = 8;
  lengthUnit.value = 'ft';
  widthEl.value = 6;
  widthUnit.value = 'in';
  heightEl.value = 2;
  heightUnit.value = 'in';
  computeAndRender();
})();
