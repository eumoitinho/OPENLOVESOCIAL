const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function exportDiagrams() {
    console.log('Starting diagram export...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport for high quality
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2 // For high DPI
    });
    
    // Load the HTML file
    const htmlPath = path.join(__dirname, 'openlove-architecture-diagram.html');
    await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    
    // Wait for Mermaid to render
    await page.waitForTimeout(5000);
    
    // Get all diagram containers
    const diagrams = await page.$$('.diagram-container');
    
    const diagramNames = [
        'system-architecture-overview',
        'data-model-database-schema',
        'authentication-user-flow',
        'payment-system-flow',
        'realtime-features-architecture',
        'content-media-flow',
        'ai-recommendation-system',
        'security-privacy-architecture',
        'devops-deployment-pipeline'
    ];
    
    // Export each diagram
    for (let i = 0; i < diagrams.length; i++) {
        const diagram = diagrams[i];
        const name = diagramNames[i] || `diagram-${i + 1}`;
        
        console.log(`Exporting ${name}...`);
        
        // Take screenshot of the specific diagram
        const box = await diagram.boundingBox();
        
        // PNG export
        await page.screenshot({
            path: path.join(__dirname, `${name}.png`),
            clip: {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height
            }
        });
        
        console.log(`✓ Exported ${name}.png`);
    }
    
    // Export full page as well
    console.log('Exporting full architecture document...');
    
    // Full page PNG
    await page.screenshot({
        path: path.join(__dirname, 'openlove-complete-architecture.png'),
        fullPage: true
    });
    
    // Generate PDF (which can be converted to SVG)
    await page.pdf({
        path: path.join(__dirname, 'openlove-complete-architecture.pdf'),
        format: 'A3',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });
    
    console.log('✓ Exported complete architecture document');
    
    await browser.close();
    
    console.log('\nDiagram export completed successfully!');
    console.log('Generated files:');
    diagramNames.forEach(name => {
        console.log(`  - ${name}.png`);
    });
    console.log('  - openlove-complete-architecture.png');
    console.log('  - openlove-complete-architecture.pdf');
    
    // Create a simple script to convert Mermaid to SVG
    const svgExportScript = `
// To export as SVG, use this script in the browser console:
// 1. Open openlove-architecture-diagram.html in a browser
// 2. Open Developer Console (F12)
// 3. Run this script for each diagram:

function exportDiagramToSVG(index, filename) {
    const svgs = document.querySelectorAll('.mermaid svg');
    if (svgs[index]) {
        const svgData = new XMLSerializer().serializeToString(svgs[index]);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Exported: ' + filename + '.svg');
    }
}

// Export all diagrams
const names = [
    'system-architecture-overview',
    'data-model-database-schema',
    'authentication-user-flow',
    'payment-system-flow',
    'realtime-features-architecture',
    'content-media-flow',
    'ai-recommendation-system',
    'security-privacy-architecture',
    'devops-deployment-pipeline'
];

names.forEach((name, index) => {
    exportDiagramToSVG(index, name);
});
`;
    
    fs.writeFileSync(path.join(__dirname, 'export-to-svg.js'), svgExportScript);
    console.log('\nCreated export-to-svg.js for manual SVG export');
}

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
    exportDiagrams().catch(console.error);
} catch(e) {
    console.log('Puppeteer not installed. Please run: npm install puppeteer');
    console.log('Or use the HTML file directly in a browser to view and export the diagrams.');
}