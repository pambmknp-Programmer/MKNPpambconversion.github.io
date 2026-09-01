// Conversion constants
const BF_TO_M3 = 0.00236;
const M3_TO_BF = 423.776;
const M3_TO_FT3 = 35.3147;
const FT3_TO_M3 = 0.0283168;

// History array
let conversionHistory = [];

// Initialize event listeners on page load
document.addEventListener('DOMContentLoaded', function() {
    // Board Feet input listeners
    document.getElementById('bf-input').addEventListener('input', convertBFToM3);
    document.getElementById('m3-input').addEventListener('input', convertM3ToBF);
    
    // Felled tree listeners
    document.getElementById('felled-diameter').addEventListener('input', calculateFelledTree);
    document.getElementById('felled-diameter-unit').addEventListener('change', calculateFelledTree);
    document.getElementById('felled-length').addEventListener('input', calculateFelledTree);
    document.getElementById('felled-length-unit').addEventListener('change', calculateFelledTree);
    document.getElementById('felled-form-factor').addEventListener('input', calculateFelledTree);
    document.getElementById('felled-bark-loss').addEventListener('input', calculateFelledTree);
    
    // Standing tree listeners
    document.getElementById('standing-dbh').addEventListener('input', calculateStandingTree);
    document.getElementById('standing-dbh-unit').addEventListener('change', calculateStandingTree);
    document.getElementById('standing-height').addEventListener('input', calculateStandingTree);
    document.getElementById('standing-height-unit').addEventListener('change', calculateStandingTree);
    document.getElementById('standing-form-factor').addEventListener('input', calculateStandingTree);
    document.getElementById('standing-bark-loss').addEventListener('input', calculateStandingTree);
    
    // Load history from localStorage
    loadHistory();
});

/**
 * Convert Board Feet to Cubic Meters
 */
function convertBFToM3() {
    const bfInput = document.getElementById('bf-input');
    const m3Output = document.getElementById('bf-to-m3');
    
    const bfValue = parseFloat(bfInput.value);
    
    if (isNaN(bfValue) || bfInput.value === '') {
        m3Output.value = '';
        return;
    }
    
    if (bfValue < 0) {
        bfInput.value = 0;
        return;
    }
    
    const m3Value = bfValue * BF_TO_M3;
    m3Output.value = m3Value.toFixed(4);
    
    // Add to history
    addToHistory(`${bfValue.toFixed(2)} BF = ${m3Value.toFixed(4)} m³`);
}

/**
 * Convert Cubic Meters to Board Feet
 */
function convertM3ToBF() {
    const m3Input = document.getElementById('m3-input');
    const bfOutput = document.getElementById('m3-to-bf');
    
    const m3Value = parseFloat(m3Input.value);
    
    if (isNaN(m3Value) || m3Input.value === '') {
        bfOutput.value = '';
        return;
    }
    
    if (m3Value < 0) {
        m3Input.value = 0;
        return;
    }
    
    const bfValue = m3Value * M3_TO_BF;
    bfOutput.value = bfValue.toFixed(2);
    
    // Add to history
    addToHistory(`${m3Value.toFixed(4)} m³ = ${bfValue.toFixed(2)} BF`);
}

/**
 * Convert unit to meters
 */
function toMeters(value, unit) {
    if (isNaN(value) || value <= 0) return NaN;
    switch(unit) {
        case 'm': return value;
        case 'cm': return value / 100;
        case 'mm': return value / 1000;
        case 'in': return value * 0.0254;
        case 'ft': return value * 0.3048;
        default: return NaN;
    }
}

/**
 * Calculate Felled Tree (Round Log) Volume
 * Formula: Volume = π × (diameter/2)² × length × form_factor × (1 - bark_loss/100)
 */
function calculateFelledTree() {
    const diameterInput = document.getElementById('felled-diameter');
    const diameterUnit = document.getElementById('felled-diameter-unit').value;
    const lengthInput = document.getElementById('felled-length');
    const lengthUnit = document.getElementById('felled-length-unit').value;
    const formFactor = parseFloat(document.getElementById('felled-form-factor').value) || 0.9;
    const barkLoss = parseFloat(document.getElementById('felled-bark-loss').value) || 0;
    
    const diameter = parseFloat(diameterInput.value);
    const length = parseFloat(lengthInput.value);
    
    const m3Output = document.getElementById('felled-volume-m3');
    const ft3Output = document.getElementById('felled-volume-ft3');
    
    if (isNaN(diameter) || isNaN(length) || diameter <= 0 || length <= 0) {
        m3Output.textContent = '—';
        ft3Output.textContent = '—';
        return;
    }
    
    // Convert to meters
    const diameterM = toMeters(diameter, diameterUnit);
    const lengthM = toMeters(length, lengthUnit);
    
    if (isNaN(diameterM) || isNaN(lengthM)) {
        m3Output.textContent = '—';
        ft3Output.textContent = '—';
        return;
    }
    
    // Calculate cylinder volume
    const radius = diameterM / 2;
    const cylinderVolume = Math.PI * radius * radius * lengthM;
    
    // Apply form factor and bark loss
    const barkLossFactor = (100 - barkLoss) / 100;
    const actualVolume = cylinderVolume * formFactor * barkLossFactor;
    
    // Convert to cubic feet
    const volumeFt3 = actualVolume * M3_TO_FT3;
    
    m3Output.textContent = actualVolume.toFixed(4);
    ft3Output.textContent = volumeFt3.toFixed(4);
    
    // Add to history
    addToHistory(`Felled Log: Ø${diameter}${diameterUnit} × ${length}${lengthUnit} = ${actualVolume.toFixed(4)} m³ / ${volumeFt3.toFixed(4)} ft³`);
}

/**
 * Calculate Standing Tree Volume
 * Formula: Volume = π × (DBH/2)² × height × form_factor × (1 - bark_loss/100)
 * This uses basal area method: BA = π × (diameter/2)²
 */
function calculateStandingTree() {
    const dbhInput = document.getElementById('standing-dbh');
    const dbhUnit = document.getElementById('standing-dbh-unit').value;
    const heightInput = document.getElementById('standing-height');
    const heightUnit = document.getElementById('standing-height-unit').value;
    const formFactor = parseFloat(document.getElementById('standing-form-factor').value) || 0.4;
    const barkLoss = parseFloat(document.getElementById('standing-bark-loss').value) || 0;
    
    const dbh = parseFloat(dbhInput.value);
    const height = parseFloat(heightInput.value);
    
    const m3Output = document.getElementById('standing-volume-m3');
    const ft3Output = document.getElementById('standing-volume-ft3');
    
    if (isNaN(dbh) || isNaN(height) || dbh <= 0 || height <= 0) {
        m3Output.textContent = '—';
        ft3Output.textContent = '—';
        return;
    }
    
    // Convert to meters
    const dbhM = toMeters(dbh, dbhUnit);
    const heightM = toMeters(height, heightUnit);
    
    if (isNaN(dbhM) || isNaN(heightM)) {
        m3Output.textContent = '—';
        ft3Output.textContent = '—';
        return;
    }
    
    // Calculate basal area (π × (diameter/2)²)
    const radius = dbhM / 2;
    const basalArea = Math.PI * radius * radius;
    
    // Calculate volume: basal area × height × form factor
    const cylinderVolume = basalArea * heightM;
    
    // Apply form factor and bark loss
    const barkLossFactor = (100 - barkLoss) / 100;
    const actualVolume = cylinderVolume * formFactor * barkLossFactor;
    
    // Convert to cubic feet
    const volumeFt3 = actualVolume * M3_TO_FT3;
    
    m3Output.textContent = actualVolume.toFixed(4);
    ft3Output.textContent = volumeFt3.toFixed(4);
    
    // Add to history
    addToHistory(`Standing Tree: DBH ${dbh}${dbhUnit} × ${height}${heightUnit} = ${actualVolume.toFixed(4)} m³ / ${volumeFt3.toFixed(4)} ft³`);
}

/**
 * Clear Board Feet input
 */
function clearBFInput() {
    document.getElementById('bf-input').value = '';
    document.getElementById('bf-to-m3').value = '';
}

/**
 * Clear Cubic Meter input
 */
function clearM3Input() {
    document.getElementById('m3-input').value = '';
    document.getElementById('m3-to-bf').value = '';
}

/**
 * Clear Felled Tree inputs
 */
function clearFelledTree() {
    document.getElementById('felled-diameter').value = '';
    document.getElementById('felled-length').value = '';
    document.getElementById('felled-form-factor').value = '0.9';
    document.getElementById('felled-bark-loss').value = '0';
    document.getElementById('felled-volume-m3').textContent = '—';
    document.getElementById('felled-volume-ft3').textContent = '—';
}

/**
 * Clear Standing Tree inputs
 */
function clearStandingTree() {
    document.getElementById('standing-dbh').value = '';
    document.getElementById('standing-height').value = '';
    document.getElementById('standing-form-factor').value = '0.4';
    document.getElementById('standing-bark-loss').value = '0';
    document.getElementById('standing-volume-m3').textContent = '—';
    document.getElementById('standing-volume-ft3').textContent = '—';
}

/**
 * Add conversion to history
 */
function addToHistory(conversion) {
    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString();
    
    // Create history entry
    const historyEntry = {
        conversion: conversion,
        time: timeString,
        timestamp: timestamp.getTime()
    };
    
    // Add to array (limit to 30 entries)
    conversionHistory.unshift(historyEntry);
    if (conversionHistory.length > 30) {
        conversionHistory.pop();
    }
    
    // Save to localStorage
    saveHistory();
    
    // Update UI
    displayHistory();
}

/**
 * Display conversion history
 */
function displayHistory() {
    const historyList = document.getElementById('history-list');
    
    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No conversions yet. Start converting!</p>';
        return;
    }
    
    let historyHTML = '';
    conversionHistory.forEach((entry, index) => {
        historyHTML += `
            <div class="history-item">
                <div class="history-item-text">${entry.conversion}</div>
                <div class="history-item-time">${entry.time}</div>
            </div>
        `;
    });
    
    historyList.innerHTML = historyHTML;
}

/**
 * Clear conversion history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear the conversion history?')) {
        conversionHistory = [];
        saveHistory();
        displayHistory();
    }
}

/**
 * Save history to localStorage
 */
function saveHistory() {
    try {
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
    } catch (e) {
        console.error('Error saving history:', e);
    }
}

/**
 * Load history from localStorage
 */
function loadHistory() {
    try {
        const saved = localStorage.getItem('conversionHistory');
        if (saved) {
            conversionHistory = JSON.parse(saved);
            displayHistory();
        }
    } catch (e) {
        console.error('Error loading history:', e);
        conversionHistory = [];
    }
}
