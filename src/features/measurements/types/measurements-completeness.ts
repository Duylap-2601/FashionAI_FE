export interface MissingMeasurementField {
  field: string;
  label: string;
}

export interface MeasurementCategoryCompleteness {
  category: 'UPPER' | 'LOWER' | 'FULL_BODY' | string;
  complete: boolean;
  requiredFields: string[];
  missingFields: string[];
  missing: MissingMeasurementField[];
}

export interface MeasurementsCompletenessResponse {
  canOrder: boolean;
  hasMeasurement: boolean;
  byCategory: MeasurementCategoryCompleteness[];
}
