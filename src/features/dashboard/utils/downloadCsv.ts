// Builds a CSV file from rows of values and makes the browser download it.

function toCsvCell(value: string | number): string {
  const text = String(value);
  // Quote a cell that contains a comma, quote or new line, doubling any quotes inside.
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(fileName: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
