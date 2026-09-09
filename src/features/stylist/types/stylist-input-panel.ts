import type { GenderPref, Status } from '@/features/stylist/types/ai-stylist-page';
import type { StylistProduct } from '@/features/stylist/types/stylist';
import React from 'react';

export interface StylistInputPanelProps {
  photoUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleRemovePhoto: (e: React.MouseEvent) => void;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  selectedProduct: StylistProduct | null;
  setShowCatalogModal: React.Dispatch<React.SetStateAction<boolean>>;
  productsLoading: boolean;
  setOccasion: React.Dispatch<React.SetStateAction<string>>;
  occasion: string;
  setStylePreference: React.Dispatch<React.SetStateAction<string>>;
  stylePreference: string;
  setBudget: React.Dispatch<React.SetStateAction<string>>;
  budget: string;
  setGenderPreference: React.Dispatch<React.SetStateAction<GenderPref>>;
  genderPreference: GenderPref;
  pageState: Status;
  errorMessage: string | null;
  handleAnalyze: () => Promise<void>;
  photoFile: File | null;
  isAnalyzing: boolean;
}
