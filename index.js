// Conversion constants
const BF_TO_M3 = 0.00236;
const M3_TO_BF = 423.776;

// History array
let conversionHistory = [];

// Initialize event listeners on page load
document.addEventListener('DOMContentLoaded', function() {
    // Board Feet input listener
    document.getElementById('bf-input').addEventListener('input', convertBFToM3);
    
    // Cubic Meter input listener
    document.getElementById('m3-input').addEventListener('input', convertM3ToBF);
    
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
    
    // Add to array (limit to 20 entries)
    conversionHistory.unshift(historyEntry);
    if (conversionHistory.length > 20) {
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
