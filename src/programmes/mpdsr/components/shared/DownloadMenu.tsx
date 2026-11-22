import { useState } from 'react';
import { MenuButton, MenuItem } from '@carbon/react';
import { downloadPdf } from '../../features/dashboard/utils/downloadPdf';
import type { PdfReport } from '../../features/dashboard/utils/downloadPdf';
import { downloadExcel } from '../../features/dashboard/utils/downloadExcel';
import { showToast } from './toast/toast';

interface DownloadMenuProps {
  build: (extension: 'xlsx' | 'pdf') => PdfReport;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

function DownloadMenu({ build, size = 'md', disabled = false }: DownloadMenuProps) {
  const [busy, setBusy] = useState(false);

  async function handle(format: 'excel' | 'pdf') {
    setBusy(true);
    try {
      if (format === 'excel') {
        await downloadExcel(build('xlsx'));
      } else {
        await downloadPdf(build('pdf'));
      }
    } catch {
      showToast(`Couldn't make the ${format === 'excel' ? 'Excel file' : 'PDF'}. Try again.`, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <MenuButton
      kind="tertiary"
      size={size}
      label={busy ? 'Preparing…' : 'Download'}
      disabled={busy || disabled}
      menuAlignment="bottom-end"
    >
      <MenuItem label="Excel (.xlsx)" onClick={() => handle('excel')} />
      <MenuItem label="PDF" onClick={() => handle('pdf')} />
    </MenuButton>
  );
}

export default DownloadMenu;