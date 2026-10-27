export interface StarRatingProps {
  value: number; // 0 to 5
  onChange?: (value: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  readOnly?: boolean;
  /** `landing`: sao oxblood trên nền giấy (trang khách). Mặc định giữ màu hổ phách cho admin. */
  tone?: 'default' | 'landing';
}
