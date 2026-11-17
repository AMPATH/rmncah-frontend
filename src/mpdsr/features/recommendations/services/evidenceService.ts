import { apiGet, apiPost } from '../../../api/apiClient';

// A file attached as proof that the work was done (e.g. an attendance list or a photo).
export interface EvidenceFile {
  id: string;
  code: string;
  fileName: string;
  type: string;
  size: number;
  at: string;
  byUserId: string;
  // json-server only: the file itself, as a data URL. The real backend stores the file and
  // returns a download link instead.
  dataUrl: string;
}

export const EVIDENCE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
// Files are kept inside json-server's db.json for now, so they must stay small.
export const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;

// Why a file can't be used, or '' when it can.
export function evidenceProblem(file: File): string {
  if (!EVIDENCE_TYPES.includes(file.type)) {
    return 'Choose a PDF, JPG or PNG file.';
  }
  if (file.size > MAX_EVIDENCE_BYTES) {
    return 'The file is larger than 2 MB. Choose a smaller file or a photo at lower quality.';
  }
  return '';
}

// "1.4 MB" / "320 KB"
export function fileSizeText(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// json-server: saves the file in /evidence. The real API receives it as part of
// POST /recommendations/:id/mark-done (form data), so this function will go.
export async function uploadEvidence(code: string, file: File, byUserId: string): Promise<EvidenceFile> {
  return apiPost<EvidenceFile>('/evidence', {
    code,
    fileName: file.name,
    type: file.type,
    size: file.size,
    at: new Date().toISOString(),
    byUserId,
    dataUrl: await readAsDataUrl(file),
  });
}

// The evidence attached to one recommendation, oldest first.
export function getEvidence(code: string): Promise<EvidenceFile[]> {
  return apiGet<EvidenceFile[]>('/evidence', { code });
}
