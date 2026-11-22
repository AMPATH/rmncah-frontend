import type { PdfReport } from './downloadPdf';

const BLUE = 'FF0F62FE';
const GREY = 'FF525252';

export async function downloadExcel(report: PdfReport) {
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Report');

  sheet.addRow([report.title]).font = { bold: true, size: 14 };
  for (const line of report.details) {
    sheet.addRow([line]).font = { color: { argb: GREY }, size: 9 };
  }

  let widest = 2;
  for (const section of report.sections) {
    widest = Math.max(widest, section.head.length);
    sheet.addRow([]);
    sheet.addRow([section.title]).font = { bold: true, size: 11 };

    const head = sheet.addRow(section.head);
    head.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } };
    });

    for (const row of section.rows) {
      const added = sheet.addRow(row);
      added.eachCell((cell, column) => {
        if (column > 1) cell.alignment = { horizontal: 'right' };
      });
    }

    if (section.note) {
      sheet.addRow([section.note]).font = { italic: true, color: { argb: GREY }, size: 9 };
    }
  }

  sheet.getColumn(1).width = 36;
  for (let column = 2; column <= widest; column += 1) {
    sheet.getColumn(column).width = 18;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = report.fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}