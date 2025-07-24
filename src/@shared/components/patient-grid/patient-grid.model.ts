export class PatientGridColumnSetting {
    field?: string;
    title?: string;
    format?: string;
    type?: 'text' | 'numeric' | 'boolean' | 'date';
    width?: number;
    filterable?: boolean;
    sortable?: boolean
  }