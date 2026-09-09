export interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  uploadedImage: string | null;
  onCameraSelect: () => void;
}
