const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    generatePickingList(data) {
        return new Promise((resolve, reject) => {
            try {
                const timestamp = new Date().getTime();
                const fileName = `PICKING_LIST_${data.referenceNumber}_${timestamp}.pdf`;
                const filePath = path.join(__dirname, '../uploads/picking-lists', fileName);
                
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: `Picking List - ${data.referenceNumber}`,
                        Author: 'MedOx Pharmacy',
                        Subject: 'Stock Adjustment Picking List'
                    }
                });
                
                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);
                
                // HEADER
                doc.rect(50, 40, 500, 4).fill('#D69E2E');
                doc.fontSize(24).font('Helvetica-Bold').fillColor('#D69E2E').text('MEDOX PHARMACY', 50, 55, { align: 'center' });
                doc.moveDown(0.3);
                doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Quality Healthcare Solutions', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(8).font('Helvetica').fillColor('#999999').text('• Reliable • Trusted • Professional •', { align: 'center' });
                doc.moveDown(0.5);
                doc.strokeColor('#D69E2E').lineWidth(1.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
                
                // TITLE
                doc.fontSize(18).font('Helvetica-Bold').fillColor('#1A2332').text('PICKING LIST', { align: 'center' });
                doc.moveDown(0.3);
                doc.fontSize(9).font('Helvetica').fillColor('#888888').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
                doc.moveDown(1.5);
                
                // REFERENCE INFO BOX
                const boxY = doc.y;
                doc.rect(50, boxY, 500, 65).fill('#F8FAFC').strokeColor('#E2E8F0').lineWidth(1).stroke();
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('REFERENCE INFORMATION', 65, boxY + 8);
                doc.moveDown(0.5);
                
                doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`Reference Number: `, 65, boxY + 28, { continued: true })
                    .font('Helvetica-Bold').fillColor('#1A2332').text(`${data.referenceNumber || 'N/A'}`);
                doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`Adjustment Type: `, 65, boxY + 44, { continued: true })
                    .font('Helvetica-Bold').fillColor('#1A2332').text(`${data.adjustmentType ? data.adjustmentType.toUpperCase() : 'N/A'}`);
                doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`Date: `, 350, boxY + 28, { continued: true })
                    .font('Helvetica-Bold').fillColor('#1A2332').text(`${data.adjustmentDate ? new Date(data.adjustmentDate).toLocaleDateString() : 'N/A'}`);
                doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`Approved By: `, 350, boxY + 44, { continued: true })
                    .font('Helvetica-Bold').fillColor('#1A2332').text(`${data.approvedBy || 'N/A'}`);
                
                doc.moveDown(2);
                
                // FACILITY INFO
                if (data.facilityName && data.facilityName !== 'N/A') {
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('RECEIVING FACILITY:', 50, doc.y);
                    doc.moveDown(0.3);
                    doc.fontSize(9).font('Helvetica').fillColor('#1A2332').text(`Name: ${data.facilityName}`, 65, doc.y);
                    doc.moveDown(0.3);
                    if (data.facilityContact && data.facilityContact !== 'N/A') {
                        doc.fontSize(9).font('Helvetica').fillColor('#1A2332').text(`Contact: ${data.facilityContact}`, 65, doc.y);
                        doc.moveDown(0.5);
                    }
                    doc.moveDown(0.5);
                }
                
                // REMARKS
                if (data.remarks) {
                    doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('REMARKS:', 50, doc.y);
                    doc.moveDown(0.3);
                    doc.fontSize(9).font('Helvetica').fillColor('#1A2332').text(data.remarks, 65, doc.y, { width: 450 });
                    doc.moveDown(0.5);
                }
                doc.moveDown(0.5);
                
                // TABLE HEADER
                const tableTop = doc.y;
                const col1 = 50, col2 = 120, col3 = 230, col4 = 340, col5 = 410;
                doc.rect(col1, tableTop, 500, 28).fill('#1A2332');
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF')
                    .text('#', col1 + 15, tableTop + 7)
                    .text('PRODUCT NAME', col2 + 10, tableTop + 7)
                    .text('BATCH #', col3 + 10, tableTop + 7)
                    .text('EXPIRY', col4 + 10, tableTop + 7)
                    .text('QTY', col5 + 15, tableTop + 7);
                doc.moveDown(1);
                
                // TABLE ROWS
                let rowY = tableTop + 35;
                let rowCount = 0;
                let pageNumber = 1;
                
                data.items.forEach((item, index) => {
                    if (rowY > 720) {
                        pageNumber++;
                        doc.fontSize(8).font('Helvetica').fillColor('#999999').text(`Page ${pageNumber}`, 50, 780, { align: 'center' });
                        doc.addPage();
                        rowY = 50;
                        doc.rect(col1, rowY, 500, 28).fill('#1A2332');
                        doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF')
                            .text('#', col1 + 15, rowY + 7)
                            .text('PRODUCT NAME', col2 + 10, rowY + 7)
                            .text('BATCH #', col3 + 10, rowY + 7)
                            .text('EXPIRY', col4 + 10, rowY + 7)
                            .text('QTY', col5 + 15, rowY + 7);
                        rowY += 35;
                    }
                    
                    const isEven = rowCount % 2 === 0;
                    if (isEven) { doc.rect(col1, rowY - 3, 500, 24).fill('#F8FAFC'); }
                    
                    const expiryDate = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    }) : 'N/A';
                    
                    doc.fontSize(9).font('Helvetica').fillColor('#1A2332')
                        .text(String(index + 1), col1 + 15, rowY + 2)
                        .text(item.productName || 'N/A', col2 + 10, rowY + 2, { width: 100 })
                        .text(item.batchNumber || 'N/A', col3 + 10, rowY + 2)
                        .text(expiryDate, col4 + 10, rowY + 2)
                        .text(String(item.quantity || 0), col5 + 15, rowY + 2);
                    
                    rowY += 26;
                    rowCount++;
                });
                
                // SUMMARY
                const totalItems = data.items.length;
                const totalQuantity = data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                doc.moveDown(1);
                doc.rect(50, doc.y + 5, 500, 45).fill('#F1F5F9').strokeColor('#E2E8F0').lineWidth(1).stroke();
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#1A2332').text('SUMMARY', 65, doc.y + 12);
                doc.moveDown(0.5);
                doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`Total Items: `, 65, doc.y + 30, { continued: true })
                    .font('Helvetica-Bold').fillColor('#D69E2E').text(`${totalItems}`);
                doc.fontSize(9).font('Helvetica').fillColor('#334155').text(`Total Quantity: `, 250, doc.y + 30, { continued: true })
                    .font('Helvetica-Bold').fillColor('#D69E2E').text(`${totalQuantity}`);
                doc.moveDown(3);
                
                // SIGNATURES
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#1A2332').text('AUTHORIZATION SIGNATURES', { align: 'center' });
                doc.moveDown(0.5);
                
                const sigY = doc.y;
                const issuedByName = data.issuedBy || data.approvedBy || '___________________________';
                
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('ISSUED BY (Staff):', 50, sigY + 10);
                doc.moveDown(0.3);
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#1A2332').text(issuedByName, 50, sigY + 25);
                doc.moveDown(0.3);
                doc.fontSize(8).font('Helvetica').fillColor('#999999').text(`Date: ${new Date().toLocaleDateString()}`, 50, sigY + 42);
                
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('RECEIVED BY (Facility):', 230, sigY + 10);
                doc.moveDown(0.3);
                doc.fontSize(9).font('Helvetica').fillColor('#1A2332').text('___________________________', 230, sigY + 25);
                doc.moveDown(0.3);
                doc.fontSize(8).font('Helvetica').fillColor('#999999').text('Date: _______________', 230, sigY + 42);
                
                doc.fontSize(8).font('Helvetica-Bold').fillColor('#475569').text('CHECKED BY:', 410, sigY + 10);
                doc.moveDown(0.3);
                doc.fontSize(9).font('Helvetica').fillColor('#1A2332').text('___________________________', 410, sigY + 25);
                doc.moveDown(0.3);
                doc.fontSize(8).font('Helvetica').fillColor('#999999').text('Date: _______________', 410, sigY + 42);
                
                doc.moveDown(3.5);
                
                // FOOTER
                doc.strokeColor('#D69E2E').lineWidth(1.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
                doc.fontSize(8).font('Helvetica').fillColor('#999999').text(`Generated by MedOx Pharmacy Management System • ${new Date().toLocaleString()}`, { align: 'center' });
                doc.fontSize(8).font('Helvetica').fillColor('#999999').text(`Page ${pageNumber} of ${pageNumber}`, 280, 780, { align: 'center' });
                
                doc.end();
                
                writeStream.on('finish', () => {
                    resolve(filePath);
                });
                
                writeStream.on('error', (err) => {
                    reject(err);
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new PDFService();
