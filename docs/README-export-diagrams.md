# Exporting OpenLove Architecture Diagrams

## Quick Export Guide

The architecture diagrams are available in multiple formats:

### 1. View Diagrams

#### Option A: Markdown with Mermaid (Recommended)
Open `OpenLove-Architecture-2025.md` in:
- VS Code with Mermaid extension
- GitHub (renders Mermaid automatically)
- Any Markdown viewer that supports Mermaid

#### Option B: Interactive HTML
Open `openlove-architecture-diagram.html` in any web browser to see all diagrams with interactive features.

### 2. Export to PNG

#### Using Browser (Easiest)
1. Open `openlove-architecture-diagram.html` in Chrome/Edge
2. For each diagram you want to export:
   - Right-click on the diagram
   - Select "Save image as..."
   - Choose PNG format

#### Using Browser Screenshot
1. Open the HTML file
2. Press F12 (Developer Tools)
3. Press Ctrl+Shift+P
4. Type "screenshot" and select "Capture node screenshot"
5. Click on the diagram you want to export

#### Using Print to PDF
1. Open the HTML file
2. Press Ctrl+P
3. Select "Save as PDF"
4. In advanced settings, enable "Background graphics"

### 3. Export to SVG

Open `openlove-architecture-diagram.html` in browser and run this in the console:

```javascript
// Export a specific diagram (0-8)
function exportDiagram(index) {
    const svgs = document.querySelectorAll('.mermaid svg');
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
    
    if (svgs[index]) {
        const svg = svgs[index];
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = names[index] + '.svg';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export all diagrams
for(let i = 0; i < 9; i++) {
    exportDiagram(i);
}
```

### 4. High-Resolution Export

For print-quality diagrams:

1. **Using Mermaid CLI** (if installed):
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i OpenLove-Architecture-2025.md -o architecture.png -w 3840 -H 2160
```

2. **Using Online Tools**:
- Go to https://mermaid.live/
- Copy each diagram from the .md file
- Paste and export as PNG/SVG

### 5. Professional Tools

For the highest quality:
- Import SVG exports into Adobe Illustrator or Inkscape
- Adjust colors, fonts, and layout as needed
- Export at any resolution

## Diagram List

1. **System Architecture Overview** - Complete system overview with all components
2. **Data Model & Database Schema** - 25+ tables with relationships
3. **Authentication & User Flow** - Registration and login sequences
4. **Payment System Flow** - Stripe and AbacatePay integration
5. **Real-time Features Architecture** - Chat, notifications, and WebRTC
6. **Content & Media Flow** - Post creation and distribution
7. **AI & Recommendation System** - Machine learning pipeline
8. **Security & Privacy Architecture** - Security layers and controls
9. **DevOps & Deployment Pipeline** - CI/CD and infrastructure

## Tips for Best Results

- For presentations: Export as PNG at 1920x1080 or higher
- For documentation: Use SVG for scalability
- For printing: Export at 300 DPI minimum
- For web: Optimize PNG with tools like TinyPNG

## Color Scheme

The diagrams use OpenLove's brand colors:
- Primary: `#ff6b6b` (Coral Red)
- Secondary: `#4ecdc4` (Turquoise)
- Tertiary: `#5c7cfa` (Blue)
- Accent: `#ffe66d` (Yellow)

---

*Need help? Check the main documentation at `/docs/OPENLOVE_OVERVIEW.md`*