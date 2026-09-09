export interface TryOnResultProps {
  userPhotoUrl: string | null;
  resultPhotoUrl: string;
  shareProductName: string;
  onDownload: () => void;
  onReset: () => void;
}
