export interface SapiValidationError {
  ExtendedStatusCode: number;
  Value: string;
  Count: number;
  InvalidProperties: InvalidPropertyInfo[];
}

export interface InvalidPropertyInfo {
  PropertyName: string;
  ValidationMessage: string;
}
