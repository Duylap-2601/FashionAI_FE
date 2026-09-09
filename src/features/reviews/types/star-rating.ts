export interface StarRatingProps {
  value: number; // 0 to 5
  onChange?: (value: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  readOnly?: boolean;
}
