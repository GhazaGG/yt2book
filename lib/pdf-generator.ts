import { PDFDocument, StandardFonts } from "pdf-lib";

export const generatePDF = async (text: string): Promise<string> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(text, {
        x: 50,
        y: 750,
        size: 12,
        font,
        maxWidth: 500,
        lineHeight: 18,
    })

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes).toString('base64');
}