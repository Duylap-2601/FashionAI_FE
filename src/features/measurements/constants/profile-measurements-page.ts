import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';

export const UPPER_FIELDS: MeasurementField[] = [
  { id: 'shoulder', label: 'Rộng vai', unit: 'cm', min: 30, max: 70, desc: 'Từ đầu vai trái đến vai phải', requiredFor: 'Áo & Đồ liền', svgY: '22%' },
  { id: 'chest', label: 'Vòng ngực', unit: 'cm', min: 60, max: 140, desc: 'Vòng lớn nhất của ngực', requiredFor: 'Áo & Đồ liền', svgY: '31%' },
  { id: 'shirtLength', label: 'Dài thân áo', unit: 'cm', min: 50, max: 85, desc: 'Từ điểm vai đến lai áo', requiredFor: 'Áo & Đồ liền', svgY: null },
  { id: 'sleeveLength', label: 'Dài tay áo', unit: 'cm', min: 45, max: 80, desc: 'Từ vai đến cổ tay', requiredFor: 'Áo', svgY: null },
  { id: 'neck', label: 'Vòng cổ', unit: 'cm', min: 28, max: 55, desc: 'Vòng quanh cổ, cách cổ áo 2cm', svgY: '14%' },
  { id: 'underbust', label: 'Vòng ngực dưới', unit: 'cm', min: 55, max: 130, desc: 'Ngay dưới ngực (dành cho nữ)', svgY: null },
  { id: 'wrist', label: 'Vòng cổ tay', unit: 'cm', min: 12, max: 25, desc: 'Vòng quanh cổ tay', svgY: null },
];

export const LOWER_FIELDS: MeasurementField[] = [
  { id: 'waist', label: 'Vòng eo', unit: 'cm', min: 50, max: 130, desc: 'Phần thắt nhỏ nhất của eo', requiredFor: 'Quần & Váy', svgY: '45%' },
  { id: 'hip', label: 'Vòng hông', unit: 'cm', min: 60, max: 145, desc: 'Vòng lớn nhất của mông', requiredFor: 'Quần & Váy', svgY: '55%' },
  { id: 'outseam', label: 'Dài quần', unit: 'cm', min: 80, max: 120, desc: 'Từ cạp xuống gấu quần', requiredFor: 'Quần & Váy', svgY: null },
  { id: 'thigh', label: 'Vòng đùi', unit: 'cm', min: 35, max: 90, desc: 'Vòng lớn nhất của đùi', requiredFor: 'Quần & Váy', svgY: '63%' },
  { id: 'inseam', label: 'Dài đũng quần', unit: 'cm', min: 55, max: 95, desc: 'Từ đũng quần đến mắt cá chân', svgY: null },
  { id: 'knee', label: 'Vòng đầu gối', unit: 'cm', min: 25, max: 55, desc: 'Vòng quanh đầu gối', svgY: null },
  { id: 'calf', label: 'Vòng bắp chân', unit: 'cm', min: 25, max: 55, desc: 'Vòng lớn nhất của bắp chân', svgY: null },
];

export const OVERVIEW_FIELDS: MeasurementField[] = [
  { id: 'height', label: 'Chiều cao', unit: 'cm', min: 130, max: 220, desc: 'Từ gót chân đến đỉnh đầu', requiredFor: 'Bắt buộc tất cả' },
  { id: 'weight', label: 'Cân nặng', unit: 'kg', min: 35, max: 150, desc: 'Cân nặng cơ thể' },
];

export const allMeasurementFields = [...OVERVIEW_FIELDS, ...UPPER_FIELDS, ...LOWER_FIELDS];

export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const TROUSER_SIZES = ['28', '29', '30', '31', '32', '33', '34', '36'];

export const SHOE_SIZES_VN = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
