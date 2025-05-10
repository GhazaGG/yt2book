import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const generatePDF = async (content: string, title: string): Promise<string> => {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Use standard fonts
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Set up page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 50;
    const lineHeight = 20;
    const titleFontSize = 24;
    const contentFontSize = 12;
    
    // Clean and normalize the content
    const cleanContent = content
        .replace(/\r\n/g, ' ')  // Replace Windows line endings with space
        .replace(/\n/g, ' ')    // Replace Unix line endings with space
        .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
        .trim();                // Remove leading/trailing spaces
    
    // Split content into words
    const words = cleanContent.split(' ');
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;
    let currentLine = '';
    
    // Add title
    const cleanTitle = title.replace(/[\r\n]/g, ' ').trim();
    const titleWidth = boldFont.widthOfTextAtSize(cleanTitle, titleFontSize);
    currentPage.drawText(cleanTitle, {
        x: (pageWidth - titleWidth) / 2,
        y: pageHeight - 100,
        size: titleFontSize,
        font: boldFont,
        color: rgb(0, 0, 0)
    });
    
    currentY -= 150; // Space after title
    
    // Add content
    for (const word of words) {
        // Skip empty words
        if (!word.trim()) continue;
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const lineWidth = font.widthOfTextAtSize(testLine, contentFontSize);
        
        if (lineWidth > pageWidth - (2 * margin)) {
            // Draw current line and start new one
            currentPage.drawText(currentLine, {
                x: margin,
                y: currentY,
                size: contentFontSize,
                font: font,
                color: rgb(0, 0, 0)
            });
            
            currentY -= lineHeight;
            currentLine = word;
            
            // Check if we need a new page
            if (currentY < margin) {
                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                currentY = pageHeight - margin;
            }
        } else {
            currentLine = testLine;
        }
    }
    
    // Draw the last line
    if (currentLine) {
        currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: contentFontSize,
            font: font,
            color: rgb(0, 0, 0)
        });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to base64
    const base64 = Buffer.from(pdfBytes).toString('base64');
    return `data:application/pdf;base64,${base64}`;
};