# Data Models Report for `registration-landing`

_Context Source: `DOCS/extraction/extraction-report.md`_

## Overview

This report provides a detailed breakdown of all data models and interfaces used in the `registration-landing` component, referencing all relevant files with complete relative paths from the workspace root. It follows the DNA extraction workflow and the requirements in `DOCS/system.prompt.md`.

---

## 1. Main Data Models and Interfaces

### 1.1. Person Object (API Model)
- **Definition:**
  - Used for add/update API calls via `PatientRegistrationService`.
  - Constructed from form values and includes nested objects for profile, phones, emails, dental office, referrals, identifiers, flags, benefit plans, locations, discounts, and groups.
- **Key Fields:**
  ```typescript
  {
    Profile: {
      PatientId: string,
      PatientSince: Date,
      DataTag: string,
      IsActive: boolean,
      FirstName: string,
      MiddleName: string,
      LastName: string,
      PreferredName: string,
      Suffix: string,
      DateOfBirth: Date,
      Sex: string,
      IsPatient: boolean,
      ResponsiblePersonType: number,
      ResponsiblePersonId: string,
      IsSignatureOnFile: boolean,
      AddressReferrerId: string,
      AddressLine1: string,
      AddressLine2: string,
      City: string,
      State: string,
      ZipCode: string,
      PreferredDentist: string,
      PreferredHygienist: string,
      PreferredLocation: string,
      HeightFeet: number,
      HeightInches: number,
      Weight: number,
      PrimaryDuplicatePatientId: string,
      PersonAccount: {
        ReceivesStatements: boolean,
        ReceivesFinanceCharges: boolean,
        PersonId: string,
        AccountId: string,
        DataTag: string,
      },
    },
    Phones: Array<...>,
    Emails: Array<...>,
    PreviousDentalOffice: { ... },
    Referral: { ... },
    patientIdentifierDtos: Array<...>,
    Flags: Array<...>,
    PatientBenefitPlanDtos: Array<...>,
    PatientLocations: Array<...>,
    patientDiscountTypeDto: { ... },
    patientGroupDtos: Array<...>
  }
  // src/patient/patient-registration/registration-landing/registration-landing.component.ts
  ```

### 1.2. Form Group Models (Reactive Forms)
- **Definition:**
  - Angular `FormGroup` and `FormArray` structures for each section of the registration form.
- **Examples:**
  - `personalDetailsForm`, `contactDetailsForm`, `insuranceDetailsForm`, `preferencesForm`, `dentalRecordsForm`, `referralsForm`, `identifiresForm`
- **Sample:**
  ```typescript
  this.personGroup = this.fb.group({
    personalDetailsForm: this.personalDetailsControls(),
    contactDetailsForm: this.contactDetailControls(),
    insuranceDetailsForm: this.insuranceDetailsControls(),
    preferencesForm: this.prefrencesControls(),
    dentalRecordsForm: this.dentalRecordControls(),
    referralsForm: this.referralsControls(),
    identifiresForm: this.additionalIdenitfiersControls(),
  });
  // src/patient/patient-registration/registration-landing/registration-landing.component.ts
  ```

### 1.3. Nested Form Controls
- **Each section has its own model:**
  - Example: `personalDetailsControls()` returns a `FormGroup` with fields for name, DOB, gender, etc.
  - Example: `newPhone()` returns a `FormGroup` for a phone entry.
- **Sample:**
  ```typescript
  personalDetailsControls = () => this.fb.group({
    FirstName: ['', [Validators.required, Validators.maxLength(64)]],
    MiddleInitial: ['', [Validators.maxLength(1)]],
    LastName: ['', [Validators.required, Validators.maxLength(64)]],
    // ...more fields...
  });
  // src/patient/patient-registration/registration-landing/registration-landing.component.ts
  ```

---

## 2. Usage in Code

- **Form Models:**
  - Used for binding UI inputs to data and for validation.
  - Example: `formGroup.get('personalDetailsForm').value` is used to build the API payload.
- **API Models:**
  - Used for constructing requests to the backend and parsing responses.
- **Transformation:**
  - Data is mapped from form models to API models before submission.

---

## 3. Relationships and Dependencies

- **Form models are composed and nested:**
  - Each section of the form is a `FormGroup` or `FormArray`.
- **API model is an aggregation:**
  - The `PersonObject` aggregates all form sections and related data for API calls.
- **Dependencies:**
  - Models depend on Angular Reactive Forms, custom validators, and service interfaces.

---

## 4. File References
- Main logic and models: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- Service interfaces: `src/patient/common/http-providers/patient-registration.service`

---

*This report is part of the DNA extraction for the `registration-landing` component. All file references use complete relative paths from the workspace root.*
