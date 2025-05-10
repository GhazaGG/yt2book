import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const generatePDF = async (text: string, title: string): Promise<string> => {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed the Helvetica font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set up page dimensions (A4 size)
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const lineHeight = 18;
    const fontSize = 12;
    const boldFontSize = 14;
    const titleFontSize = 20;

    // Clean and normalize the text
    const cleanText = text
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newlines
        .trim();

    // Create first page with title
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    let pageCount = 1;

    // Add title
    const titleWidth = titleFont.widthOfTextAtSize(title, titleFontSize);
    currentPage.drawText(title, {
        x: (pageWidth - titleWidth) / 2,
        y: pageHeight - 100,
        size: titleFontSize,
        font: titleFont,
        color: rgb(0, 0, 0),
    });

    // Add some space after title
    y = pageHeight - 150;

    // Split text into paragraphs
    const paragraphs = cleanText.split('\n\n');

    // Process each paragraph
    for (const paragraph of paragraphs) {
        // Check if this is a heading (starts with # or is short)
        const isHeading = paragraph.startsWith('#') || paragraph.length < 100;
        const currentFont = isHeading ? boldFont : font;
        const currentFontSize = isHeading ? boldFontSize : fontSize;

        // Clean paragraph text
        const cleanParagraph = paragraph
            .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
            .replace(/#/g, '') // Remove # characters
            .trim();

        // Split paragraph into words
        const words = cleanParagraph.split(/\s+/);
        let line = '';

        // Process each word
        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const testWidth = currentFont.widthOfTextAtSize(testLine, currentFontSize);

            // If adding this word would exceed the line width, draw the current line
            if (testWidth > pageWidth - (2 * margin)) {
                // Check if we need a new page
                if (y < margin) {
                    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                    pageCount++;
                }

                // Draw the line
                currentPage.drawText(line, {
                    x: margin,
                    y,
                    size: currentFontSize,
                    font: currentFont,
                    color: rgb(0, 0, 0),
                });

                // Move to next line
                y -= lineHeight;
                line = word;
            } else {
                line = testLine;
            }
        }

        // Draw the last line of the paragraph
        if (line) {
            // Check if we need a new page
            if (y < margin) {
                currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
                pageCount++;
            }

            currentPage.drawText(line, {
                x: margin,
                y,
                size: currentFontSize,
                font: currentFont,
                color: rgb(0, 0, 0),
            });

            // Add extra space after paragraphs
            y -= lineHeight * 1.5;
        }
    }

    // Add page numbers
    for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i);
        const pageNumber = `Page ${i + 1} of ${pageCount}`;
        const pageNumberWidth = font.widthOfTextAtSize(pageNumber, fontSize);
        
        page.drawText(pageNumber, {
            x: (pageWidth - pageNumberWidth) / 2,
            y: margin / 2,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
        });
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
};