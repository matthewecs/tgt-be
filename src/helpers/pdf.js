const PDFDocument = require('pdfkit');

function formatNumber(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('id-ID');
}

async function generateOfferingPDF(offering) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Company header
    doc.fontSize(18).font('Helvetica-Bold').text('TGT Water Treatment', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Internal Offering Document', { align: 'center' });
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Offering info
    doc.fontSize(14).font('Helvetica-Bold').text(offering.title);
    doc.fontSize(10).font('Helvetica')
      .text(`Status: ${offering.status}`)
      .text(`Date: ${offering.created_at ? new Date(offering.created_at).toLocaleDateString('id-ID') : '-'}`);

    if (offering.approved_at) {
      doc.text(`Approved: ${new Date(offering.approved_at).toLocaleDateString('id-ID')}`);
    }
    doc.moveDown();

    // Customer info
    doc.fontSize(12).font('Helvetica-Bold').text('Customer Information');
    doc.fontSize(10).font('Helvetica')
      .text(`Company : ${offering.customer.company_name}`)
      .text(`Contact  : ${offering.customer.contact_name}`)
      .text(`Phone    : ${offering.customer.phone}`);
    if (offering.customer.city) doc.text(`City     : ${offering.customer.city}`);
    if (offering.customer.email) doc.text(`Email    : ${offering.customer.email}`);
    doc.moveDown();

    // Items table
    doc.fontSize(12).font('Helvetica-Bold').text('Items');
    doc.moveDown(0.3);

    // Table header
    const col = { no: 50, name: 70, qty: 340, price: 380, currency: 470, total: 490 };
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('No', col.no, doc.y, { continued: true, width: 20 })
       .text('Item Name', col.name, doc.y, { continued: true, width: 270 })
       .text('Qty', col.qty, doc.y, { continued: true, width: 40, align: 'right' })
       .text('Unit Price', col.price, doc.y, { continued: true, width: 90, align: 'right' })
       .text('Currency', col.currency, doc.y, { continued: true, width: 50, align: 'center' })
       .text('Subtotal', col.total, doc.y, { width: 60, align: 'right' });

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.2);

    // Table rows
    doc.fontSize(9).font('Helvetica');
    offering.items.forEach((item, i) => {
      const subtotal = (item.quantity || 0) * (item.selling_price || 0);
      const y = doc.y;
      doc.text(String(i + 1), col.no, y, { continued: true, width: 20 })
         .text(item.item_name, col.name, y, { continued: true, width: 270 })
         .text(String(item.quantity || 0), col.qty, y, { continued: true, width: 40, align: 'right' })
         .text(formatNumber(item.selling_price), col.price, y, { continued: true, width: 90, align: 'right' })
         .text('IDR', col.currency, y, { continued: true, width: 50, align: 'center' })
         .text(formatNumber(subtotal), col.total, y, { width: 60, align: 'right' });
      doc.moveDown(0.3);
    });

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Revenue totals
    doc.fontSize(11).font('Helvetica-Bold').text('Total Revenue', { align: 'right' });
    doc.fontSize(10).font('Helvetica');
    const revenue = offering.total_revenue || {};
    Object.entries(revenue).forEach(([currency, amount]) => {
      doc.text(`${currency} ${formatNumber(amount)}`, { align: 'right' });
    });

    doc.end();
  });
}

module.exports = { generateOfferingPDF };
