export interface PdfSection {
  title: string;
  head: string[];
  rows: (string | number)[][];
  note?: string;
}

export interface PdfReport {
  fileName: string;
  title: string;
  details: string[];
  sections: PdfSection[];
}

const MARGIN = 40;
const BLUE: [number, number, number] = [15, 98, 254];

export async function downloadPdf(report: PdfReport) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const endOfLastTable = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(report.title, MARGIN, MARGIN + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(82, 82, 82);
  report.details.forEach((line, index) =>
    doc.text(line, MARGIN, MARGIN + 28 + index * 12, { maxWidth: pageWidth - 2 * MARGIN })
  );
  doc.setTextColor(22, 22, 22);

  let y = MARGIN + 28 + report.details.length * 12 + 16;
  for (const section of report.sections) {
    if (y > pageHeight - 120) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.title, MARGIN, y);
    autoTable(doc, {
      startY: y + 6,
      head: [section.head],
      body: section.rows,
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: BLUE, textColor: 255 },
      didParseCell: (cell) => {
        if (cell.column.index > 0) cell.cell.styles.halign = 'right';
      },
    });
    y = endOfLastTable() + 14;
    if (section.note) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(82, 82, 82);
      doc.text(section.note, MARGIN, y, { maxWidth: pageWidth - 2 * MARGIN });
      doc.setTextColor(22, 22, 22);
      y += 22;
    } else {
      y += 8;
    }
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(82, 82, 82);
    doc.text(`${report.title} - page ${page} of ${pages}`, MARGIN, pageHeight - 20);
  }

  doc.save(report.fileName);
}
