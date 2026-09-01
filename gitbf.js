// ============================================
// CONVERSION FACTORS
// ============================================

const CONVERSION = {
    BF_TO_M3: 0.00236,  // 1 board foot = 0.00236 cubic meters
    M3_TO_BF: 423.776   // 1 cubic meter = 423.776 board feet
};

// ============================================
// TAB MANAGEMENT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
});

function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab and mark button as active
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// ============================================
// BOARD FEET CALCULATOR
// ============================================

/**
 * Calculate board feet from lumber dimensions
 * Formula: (Thickness × Width × Length) / 12
 * BF = (T × W × L) / 12
 * Where T = thickness in inches, W = width in inches, L = length in feet
 */
function calculateBoardFeet() {
    const thickness = parseFloat(document.getElementById('bf-thickness').value);
    const width = parseFloat(document.getElementById('bf-width').value);
    const length = parseFloat(document.getElementById('bf-length').value);
    const quantity = parseInt(document.getElementById('bf-quantity').value) || 1;

    // Validation
    if (isNaN(thickness) || isNaN(width) || isNaN(length) || 
        thickness <= 0 || width <= 0 || length <= 0) {
        alert('Please enter valid thickness, width, and length values');
        return;
    }

    if (quantity < 1 || isNaN(quantity)) {
        alert('Please enter a valid quantity');
        return;
    }

    // Calculate board feet per piece: (T × W × L) / 12
    const bfPerPiece = (thickness * width * length) / 12;
    
    // Calculate total board feet
    const totalBF = bfPerPiece * quantity;
    
    // Convert to cubic meters
    const totalM3 = totalBF * CONVERSION.BF_TO_M3;

    // Format results
    document.getElementById('bf-per-piece').textContent = bfPerPiece.toFixed(4);
    document.getElementById('bf-total').textContent = totalBF.toFixed(4);
    document.getElementById('bf-to-m3-result').textContent = totalM3.toFixed(4);

    // Create detailed summary
    const details = `${quantity} piece(s) of ${thickness}" × ${width}" × ${length}'`;
    document.getElementById('bf-details').textContent = details;
}

// ============================================
// BASIC CONVERSION: Board Feet to Cubic Meters
// ============================================

function convertBFtoM3() {
    const bfInput = parseFloat(document.getElementById('bf-input').value);
    
    if (isNaN(bfInput) || bfInput < 0) {
        alert('Please enter a valid number');
        return;
    }

    const m3Result = bfInput * CONVERSION.BF_TO_M3;
    document.getElementById('bf-result').textContent = m3Result.toFixed(4);
}

// ============================================
// BASIC CONVERSION: Cubic Meters to Board Feet
// ============================================

function convertM3toBF() {
    const m3Input = parseFloat(document.getElementById('m3-input').value);
    
    if (isNaN(m3Input) || m3Input < 0) {
        alert('Please enter a valid number');
        return;
    }

    const bfResult = m3Input * CONVERSION.M3_TO_BF;
    document.getElementById('m3-result').textContent = bfResult.toFixed(2);
}

// ============================================
// STANDING LOG CALCULATOR
// ============================================

function calculateStandingLog() {
    const diameter = parseFloat(document.getElementById('standing-diameter').value);
    const height = parseFloat(document.getElementById('standing-height').value);
    const formula = document.getElementById('standing-formula').value;

    if (isNaN(diameter) || isNaN(height) || diameter <= 0 || height <= 0) {
        alert('Please enter valid diameter and height values');
        return;
    }

    let bf = 0;

    // Apply selected formula
    switch(formula) {
        case 'international':
            bf = internationalQuarterRule(diameter, height);
            break;
        case 'scribner':
            bf = scribnerRule(diameter, height);
            break;
        case 'doyle':
            bf = doyleRule(diameter, height);
            break;
    }

    const m3 = bf * CONVERSION.BF_TO_M3;

    document.getElementById('standing-bf').textContent = bf.toFixed(2);
    document.getElementById('standing-m3').textContent = m3.toFixed(4);
}

// ============================================
// FELLED TREE CALCULATOR
// ============================================

function calculateFelledTree() {
    const largeDia = parseFloat(document.getElementById('felled-large-diameter').value);
    const smallDia = parseFloat(document.getElementById('felled-small-diameter').value);
    const length = parseFloat(document.getElementById('felled-length').value);
    const formula = document.getElementById('felled-formula').value;

    if (isNaN(largeDia) || isNaN(smallDia) || isNaN(length) || 
        largeDia <= 0 || smallDia <= 0 || length <= 0) {
        alert('Please enter valid diameter and length values');
        return;
    }

    // Use average diameter for felled tree
    const avgDia = (largeDia + smallDia) / 2;
    let bf = 0;

    // Apply selected formula
    switch(formula) {
        case 'international':
            bf = internationalQuarterRule(avgDia, length);
            break;
        case 'scribner':
            bf = scribnerRule(avgDia, length);
            break;
        case 'doyle':
            bf = doyleRule(avgDia, length);
            break;
    }

    const m3 = bf * CONVERSION.BF_TO_M3;

    document.getElementById('felled-bf').textContent = bf.toFixed(2);
    document.getElementById('felled-m3').textContent = m3.toFixed(4);
}

// ============================================
// LOG VOLUME FORMULAS
// ============================================

/**
 * International 1/4" Rule
 * Most accurate for hardwoods and softwoods
 * Formula: V = 0.79 × (D - 1.25)² × L / 10
 * Where D = diameter in inches, L = length in feet
 */
function internationalQuarterRule(diameter, length) {
    if (diameter <= 1.25) return 0;
    return 0.79 * Math.pow(diameter - 1.25, 2) * length / 10;
}

/**
 * Scribner Rule
 * Common in Pacific Northwest USA
 * Formula: V = (0.79 × D² - 2 × D - 4) × L / 20
 */
function scribnerRule(diameter, length) {
    return Math.max(0, (0.79 * Math.pow(diameter, 2) - 2 * diameter - 4) * length / 20);
}

/**
 * Doyle Rule
 * Conservative rule, common in Eastern USA
 * Formula: V = ((D - 4) / 4)² × L
 * Underestimates volume for small logs
 */
function doyleRule(diameter, length) {
    if (diameter <= 4) return 0;
    return Math.pow((diameter - 4) / 4, 2) * length;
}

// ============================================
// LIVE CONVERSION (Optional Enhancement)
// ============================================

// Add event listeners for real-time conversion
document.addEventListener('DOMContentLoaded', function() {
    const bfInput = document.getElementById('bf-input');
    const m3Input = document.getElementById('m3-input');

    if (bfInput) {
        bfInput.addEventListener('keyup', convertBFtoM3);
    }

    if (m3Input) {
        m3Input.addEventListener('keyup', convertM3toBF);
    }

    // Add real-time calculation for board feet
    const bfThickness = document.getElementById('bf-thickness');
    const bfWidth = document.getElementById('bf-width');
    const bfLength = document.getElementById('bf-length');
    const bfQuantity = document.getElementById('bf-quantity');

    if (bfThickness && bfWidth && bfLength && bfQuantity) {
        bfThickness.addEventListener('keyup', calculateBoardFeet);
        bfWidth.addEventListener('keyup', calculateBoardFeet);
        bfLength.addEventListener('keyup', calculateBoardFeet);
        bfQuantity.addEventListener('keyup', calculateBoardFeet);
    }
});
