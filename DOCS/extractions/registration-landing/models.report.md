# Models DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Explicit and Inferred Models

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

### a. PersonObject Model

```typescript
// See full structure in savePerson method and data-models.report.md
this.PersonObject = {
  Profile: { ... },
  Phones: [...],
  Emails: [...],
  PreviousDentalOffice: { ... },
  Referral: { ... },
  patientIdentifierDtos: [...],
  Flags: [...],
  PatientBenefitPlanDtos: [...],
  PatientLocations: [...],
  patientDiscountTypeDto: { ... },
  patientGroupDtos: [...],
};
```

### b. Form Models

- Each FormGroup and FormArray structure (see forms.report.md)
- Mapped directly to API DTOs and business logic

---

## 2. Property Mapping and Transformation

- All form fields are mapped to model properties in `savePerson`
- Patch methods map API data to form controls
- Business logic transforms form values to DTOs for API calls

---

## 3. Rationale and Usage

- Models are designed to match backend DTOs for patient registration
- All business logic, validation, and UI state is mapped to these models

---

## 4. Diagrams and Tables

| Model | Properties | Usage |
|-------|------------|-------|
| PersonObject | Profile, Phones, Emails, ... | API submission |
| Profile | PatientId, FirstName, ... | Nested in PersonObject |
| PreviousDentalOffice | Name, Address, ... | Nested in PersonObject |
| FormGroups | personalDetailsForm, ... | UI state, validation |

---

**End of Models Report**# Models Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Models Used

- **Profile:** Patient profile model for all personal and account data.
- **Phone:** Phone model for contact details.
- **Email:** Email model for contact details.
- **Policy:** Insurance policy model.
- **Preferences:** Preferences model for locations, discounts, flags, groups.
- **Dental:** Dental record model.
- **Referral:** Referral model for patient referrals.
- **Identifier:** Patient identifier model.
- **Flag/Group:** Models for alerts and groupings.

## Model Definitions and Usage

- All models are defined in code or inferred from API responses.
- Used for form patching, validation, and API payloads.
- All properties map directly to form fields and API models.

## Mapping to Forms and Business Logic

- Each model property is mapped to a form control for validation and save.
- Transformations and conversions handled in component methods.

## Diagrams/Tables

| Model | Properties | Usage |
|-------|------------|-------|
| Profile | PatientId, Name, DOB, Gender, etc. | Form, API |
| Phone | PhoneNumber, Type, IsPrimary, etc. | Form, API |
| Email | EmailAddress, IsPrimary, etc. | Form, API |
| Policy | PlanName, PolicyHolderType, etc. | Form, API |
| Preferences | Locations, Discounts, Flags | Form, API |
| Dental | PreviousDentist, Address, Notes | Form, API |
| Referral | ReferralType, Source, Patient | Form, API |
| Identifier | Id, Value, Description | Form, API |
| Flag/Group | Description, Id, State | Form, API |

## Rationale

Models are comprehensive, mapped directly to forms and API, and support all business logic and validation requirements.

# Models (Inferred/Explicit) DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Files Included:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## Overview

This report extracts all models (explicit or inferred) used for forms, patchValue, data binding, and business logic in the `registration-landing` component. It includes model definitions, property mappings, usage in forms and business logic, and transformation details. All file references are complete relative paths from the workspace root.

---

## 1. Model Identification and Definitions

### A. Form Models (Reactive Forms)

The main form model is `personGroup: FormGroup`, which contains nested form groups for each section:

- `personalDetailsForm`
- `contactDetailsForm`
- `insuranceDetailsForm`
- `preferencesForm`
- `dentalRecordsForm`
- `referralsForm`
- `identifiresForm`

Each sub-form is defined via a method returning a `FormGroup` with explicit controls and validators. Example:

```typescript
// src/patient/patient-registration/registration-landing/registration-landing.component.ts
this.personGroup = this.fb.group({
  personalDetailsForm: this.personalDetailsControls(),
  contactDetailsForm: this.contactDetailControls(),
  insuranceDetailsForm: this.insuranceDetailsControls(),
  preferencesForm: this.prefrencesControls(),
  dentalRecordsForm: this.dentalRecordControls(),
  referralsForm: this.referralsControls(),
  identifiresForm: this.additionalIdenitfiersControls(),
});
```

#### Example: `personalDetailsForm` Model

```typescript
personalDetailsControls = () => {
  return this.fb.group({
    FirstName: ['', [Validators.required, Validators.maxLength(64)]],
    MiddleInitial: ['', [Validators.maxLength(1)]],
    LastName: ['', [Validators.required, Validators.maxLength(64)]],
    Suffix: ['', [Validators.maxLength(20)]],
    PreferredName: ['', [Validators.maxLength(64)]],
    DateOfBirth: [null],
    Gender: [''],
    Patient: [true],
    ResponsiblePerson: [''],
    SignatureOnFile: [true],
    Status: [true],
    ResponsiblePersonId: [''],
    ResponsiblePersonName: [''],
    HeightFt: [''],
    HeightIn: [''],
    Weight: [''],
    DataTag: [null],
    PatientId: [null],
    PatientSince: [null],
    unscheduleOnly: [false],
    updatePatientActive: [false],
    PrimaryDuplicatePatientId: [''],
  });
};
```

#### Example: `contactDetailsForm` Model

```typescript
contactDetailControls = () => {
  return this.fb.group({
    AddressLine1: [null],
    AddressLine2: [null],
    City: [null],
    ZipCode: [null, [Validators.minLength(5), Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$')]],
    State: [''],
    MemberAddress: [''],
    Phones: this.route.patientId ? this.fb.array([]) : this.fb.array([this.newPhone(true)]),
    Emails: this.route.patientId ? this.fb.array([]) : this.fb.array([this.newEmail(true)]),
    optOutPhones: [null],
    optOutEmails: [null],
    showPhoneOwner: [false],
    ResponsiblePersonId: [null],
    RPLastName: [null],
    RPFirstName: [null],
    PersonAccountId: [null],
  });
};
```

#### Example: `Phones` and `Emails` Array Models

```typescript
newPhone = (isPrimary: boolean) => {
  return this.fb.group({
    PhoneNumber: [null, [Validators.required, Validators.minLength(10)]],
    PhoneType: [0, [Validators.required]],
    IsPrimary: [isPrimary],
    PhoneReminder: [true],
    TextReminder: [false],
    ValidPhoneNumber: [true],
    ValidPhoneType: [true],
    ObjectState: ['Add'],
    PhoneOwner: [0],
    ContactId: [null],
    PatientId: [this.route.patientId],
    PhoneReferrerId: [null],
    isDisabled: [false],
  });
};

newEmail = (isPrimary: boolean) => {
  return this.fb.group({
    EmailAddress: [null, [Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$")]],
    IsPrimary: [isPrimary],
    EmailReminder: [true],
    ValidEmail: [true],
    ObjectState: ['Add'],
    EmailOwner: [0],
    PatientEmailId: [null],
    PatientId: [this.route.patientId],
    AcountEmailId: [null],
    isDisabled: [false],
  });
};
```

### B. Data Models for API and Business Logic

#### `PersonObject` Model

This is a composite object built from form values, used for API calls and business logic. It includes nested objects for Profile, Phones, Emails, PreviousDentalOffice, Referral, Identifiers, Flags, Benefit Plans, Locations, Discounts, and Groups.

```typescript
// src/patient/patient-registration/registration-landing/registration-landing.component.ts
this.PersonObject = {
  Profile: { ... },
  Phones: [...],
  Emails: [...],
  PreviousDentalOffice: { ... },
  Referral: { ... },
  patientIdentifierDtos: [...],
  Flags: [...],
  PatientBenefitPlanDtos: [...],
  PatientLocations: [...],
  patientDiscountTypeDto: { ... },
  patientGroupDtos: [...],
};
```

#### Example: `Profile` Sub-Model

```typescript
Profile: {
  PatientId: personaldetail.PatientId,
  PatientSince: personaldetail.PatientSince,
  DataTag: personaldetail.DataTag,
  IsActive: personaldetail.Status,
  FirstName: personaldetail.FirstName,
  MiddleName: personaldetail.MiddleInitial,
  LastName: personaldetail.LastName,
  PreferredName: personaldetail.PreferredName,
  Suffix: personaldetail.Suffix,
  DateOfBirth: this.getCalculateDOB(personaldetail.DateOfBirth),
  Sex: personaldetail.Gender,
  IsPatient: personaldetail.Patient,
  ResponsiblePersonType: Number(personaldetail.ResponsiblePerson),
  ResponsiblePersonId: personaldetail.ResponsiblePersonId ? personaldetail.ResponsiblePersonId : '',
  IsSignatureOnFile: personaldetail.SignatureOnFile,
  AddressReferrerId: contactDetail.MemberAddress ? contactDetail.MemberAddress : null,
  AddressLine1: contactDetail.MemberAddress ? null : contactDetail.AddressLine1,
  AddressLine2: contactDetail.MemberAddress ? null : contactDetail.AddressLine2,
  City: contactDetail.MemberAddress ? null : contactDetail.City,
  State: contactDetail.MemberAddress ? null : contactDetail.State,
  ZipCode: contactDetail.MemberAddress ? null : contactDetail.ZipCode,
  PreferredDentist: preferences.PreferredDentists,
  PreferredHygienist: preferences.PreferredHygienists,
  PreferredLocation: preferences.PrimaryLocation,
  HeightFeet: personaldetail.HeightFt ? personaldetail.HeightFt : 0,
  HeightInches: personaldetail.HeightIn ? personaldetail.HeightIn : 0,
  Weight: personaldetail.Weight,
  PrimaryDuplicatePatientId: personaldetail.PrimaryDuplicatePatientId,
  PersonAccount: {
    ReceivesStatements: preferences.ReceivesStatements,
    ReceivesFinanceCharges: preferences.ReceivesFinanceCharges,
    PersonId: profile ? this.route.patientId : null,
    AccountId: profile && profile.PersonAccount ? profile.PersonAccount.AccountId : null,
    DataTag: profile && profile.PersonAccount ? profile.PersonAccount.DataTag : null,
  },
},
```

---

## 2. Property Mapping and Usage

- Each property in the form models is mapped to corresponding fields in the `PersonObject` for API submission.
- Patch methods (e.g., `patchPersonalDetail`, `patchContactDetail`) map API data to form controls.
- Array models (Phones, Emails, Policies, Identifiers) are mapped between form arrays and API DTOs.

---

## 3. Transformations and Conversions

- Date fields are converted using `getCalculateDOB` to adjust for timezone.
- Phone and email arrays are mapped to DTOs with property renaming and conditional logic.
- Location and group arrays are mapped with additional metadata (ObjectState, DataTag, etc.).

---

## 4. Purpose and Business Logic

- Models are designed to capture all patient registration data, including personal, contact, insurance, preferences, dental, referral, and identifiers.
- Each property is mapped to business requirements for patient onboarding, validation, and downstream API integration.

---

## 5. Diagrams and Tables

| Form Group           | Key Properties (Sample)                |
|----------------------|----------------------------------------|
| personalDetailsForm  | FirstName, LastName, Gender, DOB, ...  |
| contactDetailsForm   | AddressLine1, Phones[], Emails[]       |
| insuranceDetailsForm | Policies[]                             |
| preferencesForm      | PrimaryLocation, Flags[], Groups[]     |
| dentalRecordsForm    | PreviousDentist, PhoneNumber, Email    |
| referralsForm        | ReferralType, ReferralSourceId, ...    |
| identifiresForm      | PatientIdentifiers[]                   |

---

## 6. Anti-Patterns, Legacy Artifacts, Edge Cases

- Some models use `any` type, reducing type safety.
- Some form controls and DTOs have legacy or redundant fields (e.g., DataTag, ObjectState).
- Conditional logic for mapping between form and DTOs can introduce edge cases if not kept in sync.

---

## 7. File References

All code samples and model definitions are from:

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

---

## 8. Rationale

- The model structure is designed to support a complex, multi-section patient registration workflow, with modular forms and DTOs for each section.
- The mapping logic ensures all data is captured, validated, and transformed for API compatibility and business requirements.

---

*End of report.*
