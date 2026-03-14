/**
 * OLED Image Converter Logic
 */

// State
const state = {
    originalImage: null,
    canvasData: null, // 1D array of 0/1
    width: 128,
    height: 64,
    threshold: 128,
    scale: 4, // Zoom level
    tool: 'pencil', // pencil, eraser
    isDrawing: false,
    invert: false,
    keepRatio: true,
    view: 'editor', // editor, original
};

// Elements
const els = {
    fileInput: document.getElementById('file-input'),
    dropZone: document.getElementById('drop-zone'),
    widthInput: document.getElementById('width-input'),
    heightInput: document.getElementById('height-input'),
    keepRatio: document.getElementById('keep-ratio'),
    thresholdSlider: document.getElementById('threshold-slider'),
    thresholdValue: document.getElementById('threshold-value'),
    invertColors: document.getElementById('invert-colors'),
    exportFormat: document.getElementById('export-format'),
    byteLayout: document.getElementById('byte-layout'),
    canvas: document.getElementById('editor-canvas'),
    ctx: document.getElementById('editor-canvas').getContext('2d'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    codeOutput: document.getElementById('code-output'),
    copyBtn: document.getElementById('copy-btn'),
    saveBtn: document.getElementById('save-btn'),
    zoomIn: document.getElementById('zoom-in'),
    zoomOut: document.getElementById('zoom-out'),
    zoomLevel: document.getElementById('zoom-level'),
    themeToggle: document.getElementById('theme-toggle'),
    tabs: document.querySelectorAll('.tab-btn'),
    btns: {
        pencil: document.getElementById('tool-pencil'),
        eraser: document.getElementById('tool-eraser'),
        clear: document.getElementById('clear-canvas'),
    },
    emptyState: document.getElementById('empty-state'),
};

// Init
function init() {
    setupEventListeners();
    updateCanvasSize();
}

function setupEventListeners() {
    // Theme Toggle
    els.themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
    });

    // View Switching
    els.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            els.tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            state.view = e.target.dataset.view;
            renderCanvas();
        });
    });

    // File Upload
    els.fileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    els.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        els.dropZone.classList.add('dragover');
    });
    els.dropZone.addEventListener('dragleave', () => els.dropZone.classList.remove('dragover'));
    els.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        els.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Settings
    els.widthInput.addEventListener('change', (e) => {
        state.width = parseInt(e.target.value) || 128;
        processImage();
    });
    els.heightInput.addEventListener('change', (e) => {
        state.height = parseInt(e.target.value) || 64;
        processImage();
    });
    els.thresholdSlider.addEventListener('input', (e) => {
        state.threshold = parseInt(e.target.value);
        els.thresholdValue.textContent = state.threshold;
        processImage();
    });
    els.invertColors.addEventListener('change', (e) => {
        state.invert = e.target.checked;
        processImage();
    });
    els.keepRatio.addEventListener('change', (e) => {
        state.keepRatio = e.target.checked;
        if (state.originalImage) processImage();
    });

    // Editor Tools
    els.btns.pencil.addEventListener('click', () => setTool('pencil'));
    els.btns.eraser.addEventListener('click', () => setTool('eraser'));
    els.btns.clear.addEventListener('click', clearCanvas);

    // Zoom
    els.zoomIn.addEventListener('click', () => setZoom(state.scale + 1));
    els.zoomOut.addEventListener('click', () => setZoom(state.scale - 1));

    // Canvas Interaction
    els.canvas.addEventListener('mousedown', startDrawing);
    els.canvas.addEventListener('mousemove', draw);
    els.canvas.addEventListener('mouseup', stopDrawing);
    els.canvas.addEventListener('mouseleave', stopDrawing);

    // Export
    els.exportFormat.addEventListener('change', generateOutput);
    els.byteLayout.addEventListener('change', generateOutput);
    els.copyBtn.addEventListener('click', copyCode);
    els.saveBtn.addEventListener('click', downloadFile);
}

// Logic
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            // Auto-set dimensions if needed, or keep defaults
            if (!els.widthInput.value) {
                state.width = 128;
                state.height = 64;
            }
            els.emptyState.style.display = 'none';
            processImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function processImage() {
    if (!state.originalImage) return;

    // 1. Resize logic
    let targetW = state.width;
    let targetH = state.height;

    // Create offscreen canvas for resizing
    const oc = document.createElement('canvas');
    oc.width = targetW;
    oc.height = targetH;
    const octx = oc.getContext('2d');

    // Fill background (Black usually safer for OLED to avoid square borders on transparency)
    // But for "Thresholding", we need to decide what transparent means.
    // Let's stick to White background so transparent -> White -> Off (after threshold > 128)
    // If Invert is on, then White -> Black -> On.
    octx.fillStyle = '#ffffff';
    octx.fillRect(0, 0, targetW, targetH);

    // Draw image with Aspect Ratio
    if (state.keepRatio) {
        // Calculate scaling
        const scale = Math.min(targetW / state.originalImage.width, targetH / state.originalImage.height);
        const w = state.originalImage.width * scale;
        const h = state.originalImage.height * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;
        octx.drawImage(state.originalImage, x, y, w, h);
    } else {
        // Stretch
        octx.drawImage(state.originalImage, 0, 0, targetW, targetH);
    }

    // 2. Thresholding
    const imgData = octx.getImageData(0, 0, targetW, targetH);
    const pixels = imgData.data; // rgba

    // Init binary data array
    state.canvasData = new Array(targetW * targetH).fill(0);

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const avg = (r + g + b) / 3;

        let isWhite = avg > state.threshold;
        if (state.invert) isWhite = !isWhite;

        // OLED: usually 1 = Lit (Color), 0 = Dark.
        // In our editor: 1 = Lit (Bright), 0 = Dark.
        const pixelParams = i / 4;
        state.canvasData[pixelParams] = isWhite ? 1 : 0;
    }

    renderCanvas();
    generateOutput();
}

function renderCanvas() {
    if (!state.canvasData) return;

    // Rescale displayed canvas
    els.canvas.width = state.width * state.scale;
    els.canvas.height = state.height * state.scale;

    // View: Pixel Editor
    if (state.view === 'editor') {
        els.ctx.fillStyle = '#000000'; // Background
        els.ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

        els.ctx.fillStyle = '#4ade80'; // Pixel Color (Bright Green-ish OLED look)

        // Draw Pixels
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                const idx = y * state.width + x;
                if (state.canvasData[idx] === 1) {
                    els.ctx.fillRect(
                        x * state.scale,
                        y * state.scale,
                        state.scale,
                        state.scale
                    );
                }

                // Grid lines logic optimized: Only draw if high zoom
                if (state.scale >= 8) {
                    els.ctx.strokeStyle = '#222';
                    els.ctx.lineWidth = 0.5;
                    els.ctx.strokeRect(x * state.scale, y * state.scale, state.scale, state.scale);
                }
            }
        }
    }
    // View: Original Image
    else if (state.view === 'original' && state.originalImage) {
        // Draw original image scaled to fit canvas current dimension
        els.ctx.imageSmoothingEnabled = false;
        // Check ratio of original vs canvas
        const canvasRatio = els.canvas.width / els.canvas.height;
        const imgRatio = state.originalImage.width / state.originalImage.height;

        let dw, dh, dx, dy;
        if (imgRatio > canvasRatio) {
            dw = els.canvas.width;
            dh = dw / imgRatio;
            dx = 0;
            dy = (els.canvas.height - dh) / 2;
        } else {
            dh = els.canvas.height;
            dw = dh * imgRatio;
            dy = 0;
            dx = (els.canvas.width - dw) / 2;
        }

        els.ctx.drawImage(state.originalImage, dx, dy, dw, dh);
    }
}

// Editor Interaction
function getMousePos(evt) {
    const rect = els.canvas.getBoundingClientRect();
    return {
        x: Math.floor((evt.clientX - rect.left) / state.scale),
        y: Math.floor((evt.clientY - rect.top) / state.scale)
    };
}

function startDrawing(e) {
    state.isDrawing = true;
    draw(e);
}

function stopDrawing() {
    state.isDrawing = false;
    generateOutput(); // Update code on stop
}

function draw(e) {
    if (!state.isDrawing || !state.canvasData || state.view !== 'editor') return;

    const pos = getMousePos(e);
    if (pos.x < 0 || pos.x >= state.width || pos.y < 0 || pos.y >= state.height) return;

    const idx = pos.y * state.width + pos.x;
    const newVal = state.tool === 'pencil' ? 1 : 0;

    if (state.canvasData[idx] !== newVal) {
        state.canvasData[idx] = newVal;
        // Redraw single pixel for optimization? Or full render. 
        // Full render is fine for small OLEDs.
        renderCanvas();
    }
}

function setTool(tool) {
    state.tool = tool;
    els.btns.pencil.classList.toggle('active', tool === 'pencil');
    els.btns.eraser.classList.toggle('active', tool === 'eraser');
}

function clearCanvas() {
    if (!state.canvasData) return;
    state.canvasData.fill(0);
    renderCanvas();
    generateOutput();
}

function setZoom(val) {
    if (val < 1) val = 1;
    if (val > 30) val = 30; // Increased max zoom from 20 to 30
    state.scale = val;
    els.zoomLevel.textContent = `${val * 100}%`;
    renderCanvas();
}

function updateCanvasSize() {
    // Initial Layout
}

// Generators
function generateOutput() {
    if (!state.canvasData) return;

    const format = els.exportFormat.value;
    const layout = els.byteLayout.value;
    let code = '';

    if (format === 'c_array') {
        const bytes = getBytes(layout);
        code = formatCArray(bytes);
    } else if (format === 'xbm') {
        code = generateXBM();
    } else if (format === 'raw') {
        const bytes = getBytes(layout);
        code = formatHexDump(bytes);
    }

    els.codeOutput.value = code;
}

function getBytes(layout) {
    const w = state.width;
    const h = state.height;
    let bytes = [];

    if (layout === 'horizontal') {
        // Linear scan: Top-Left -> Right, then Next Row
        for (let i = 0; i < state.canvasData.length; i += 8) {
            let byte = 0;
            for (let b = 0; b < 8; b++) {
                if (i + b < state.canvasData.length) {
                    if (state.canvasData[i + b]) {
                        byte |= (1 << (7 - b)); // MSB first
                    }
                }
            }
            bytes.push(byte);
        }
    } else {
        // Vertical (SSD1306 standard)
        const pages = Math.ceil(h / 8);
        for (let p = 0; p < pages; p++) {
            for (let x = 0; x < w; x++) {
                let byte = 0;
                for (let bit = 0; bit < 8; bit++) {
                    let y = p * 8 + bit;
                    if (y < h) {
                        if (state.canvasData[y * w + x]) {
                            byte |= (1 << bit); // LSB at top
                        }
                    }
                }
                bytes.push(byte);
            }
        }
    }
    return new Uint8Array(bytes);
}

function formatCArray(bytes) {
    const w = state.width;
    const h = state.height;
    let output = `// ${w}x${h} OLED Image\n`;
    output += `const unsigned char bitmap[] PROGMEM = {\n`;
    for (let i = 0; i < bytes.length; i++) {
        if (i % 16 === 0) output += '  ';
        output += '0x' + bytes[i].toString(16).padStart(2, '0').toUpperCase();
        if (i < bytes.length - 1) output += ', ';
        if ((i + 1) % 16 === 0) output += '\n';
    }
    output += '\n};';
    return output;
}

function formatHexDump(bytes) {
    let output = `// RAW BINARY HEX DUMP (${bytes.length} bytes)\n`;
    output += `// Use "Save File" to download actual .bin file\n\n`;
    for (let i = 0; i < bytes.length; i++) {
        output += bytes[i].toString(16).padStart(2, '0').toUpperCase() + " ";
        if ((i + 1) % 16 === 0) output += "\n";
    }
    return output;
}

function generateXBM() {
    // XBM requires each row to be padded to byte boundary
    const w = state.width;
    const h = state.height;
    let bytes = [];

    // Calculate bytes per row (ceil(width / 8))
    const bytesPerRow = Math.ceil(w / 8);

    for (let y = 0; y < h; y++) {
        for (let b = 0; b < bytesPerRow; b++) {
            let byte = 0;
            // A byte contains up to 8 pixels
            for (let bit = 0; bit < 8; bit++) {
                const x = b * 8 + bit;
                if (x < w) {
                    const idx = y * w + x;
                    if (state.canvasData[idx]) {
                        byte |= (1 << bit); // LSB first for XBM
                    }
                }
            }
            bytes.push(byte);
        }
    }

    let output = `#define image_width ${w}\n`;
    output += `#define image_height ${h}\n`;
    output += `static char image_bits[] = {\n`;
    for (let i = 0; i < bytes.length; i++) {
        if (i % 16 === 0) output += '  ';
        output += '0x' + bytes[i].toString(16).padStart(2, '0').toUpperCase();
        if (i < bytes.length - 1) output += ', ';
        if ((i + 1) % 16 === 0) output += '\n';
    }
    output += '\n};';
    return output;
}

function copyCode() {
    els.codeOutput.select();
    document.execCommand('copy');
    // Simple toast could go here
    const originalText = els.copyBtn.textContent;
    els.copyBtn.textContent = 'Skopiowano!';
    setTimeout(() => els.copyBtn.textContent = originalText, 2000);
}

function downloadFile() {
    const format = els.exportFormat.value;

    // For RAW, we need binary blob
    if (format === 'raw') {
        const layout = els.byteLayout.value;
        const bytes = getBytes(layout);
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oled_image.bin`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
    }

    // For Text formats
    const code = els.codeOutput.value;
    if (!code) return;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Determine filename
    let ext = 'txt';
    if (format === 'xbm') ext = 'xbm';
    else if (format === 'c_array') ext = 'c';

    a.download = `oled_image.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Start
init();
