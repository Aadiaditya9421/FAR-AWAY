export const MAX_PROOF_FILE_SIZE = 1_500_000;

export const ALLOWED_PROOF_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export function proofTypeLabel(type) {
  return type === 'certificate' ? 'Certificate' : 'Resume';
}

export function validateProofFile(file) {
  if (!file) return 'Upload a resume PDF or skill certificate.';
  if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
    return 'Use PDF, PNG, JPG, or WebP proof only.';
  }
  if (file.size > MAX_PROOF_FILE_SIZE) {
    return 'Proof file must be 1.5MB or smaller.';
  }
  return '';
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read proof file.'));
    reader.readAsDataURL(file);
  });
}

export async function buildVerificationProof({ file, proofType }) {
  const error = validateProofFile(file);
  if (error) throw new Error(error);

  const dataUrl = await fileToDataUrl(file);
  return {
    proofType,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    dataUrl,
  };
}
