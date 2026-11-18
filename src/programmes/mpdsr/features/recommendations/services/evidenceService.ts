import { apiGet, apiPost } from '../../../api/apiClient';

export interface EvidenceFile {
  id: string;
  code: string;
  fileName: string;
  type: string;
  size: number;
  at: string;
  byUserId: string;
  dataUrl: string;
}

export const EVIDENCE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;

export function evidenceProblem(file: File): string {
  if (!EVIDENCE_TYPES.includes(file.type)) {
    return 'Choose a PDF, JPG or PNG file.';
  }
  if (file.size > MAX_EVIDENCE_BYTES) {
    return 'The file is larger than 2 MB. Choose a smaller file or a photo at lower quality.';
  }
  return '';
}

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

export function getEvidence(code: string): Promise<EvidenceFile[]> {
  return apiGet<EvidenceFile[]>('/evidence', { code });
}
