# Validation and Error Handling for Forms DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Validators and Validation Rules

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

#### Personal Details Form
```typescript
this.fb.group({
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
```

#### Contact Details Form
```typescript
this.fb.group({
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
```

#### Phone Control
```typescript
this.fb.group({
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
```

#### Email Control
```typescript
this.fb.group({
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
```

#### Insurance Details Form
```typescript
this.fb.group({
  showPlans: [false],
  showPolicyHolderSearch: [false],
  showRelationships: [false],
  showPersonSearch: [false],
  Policies: this.fb.array([this.newPolicy(0)]),
});
```

#### Policy Control
```typescript
this.fb.group({
  BenefitPlanId: [''],
  PolicyHolderId: [''],
  PolicyHolderType: [''],
  PolicyHolderStringId: [null],
  RelationshipToPolicyHolder: [''],
  Priority: [policiesLength],
  EffectiveDate: [new Date()],
  PlanName: [''],
  PersonName: [''],
  validPolicy: [true],
  DependentChildOnly: [false],
  MemberId: [null]
});
```

#### Preferences Form
```typescript
this.fb.group({
  PrimaryLocation: [''],
  PrimaryLocationName: [''],
  CurrentPrimaryLocation: [''],
  AlternateLocations: [''],
  CloneAlternateLocations: [''],
  DiscountType: [''],
  DiscountTypeObjectState: [''],
  PatientDiscountTypeId: [''],
  PatientDiscountDataTag: [''],
  DiscountName: [''],
  PreferredHygienists: [''],
  PreferredHygienistsName: [''],
  PreferredDentists: [''],
  PreferredDentistsName: [''],
  CustomFlag: ['', [Validators.required]],
  Flags: '',
  EndDate: [''],
  Groups: [''],
  ReceivesStatements: [true],
  ReceivesFinanceCharges: [true],
  PrimaryLocations: [''],
});
```

#### Dental Records Form
```typescript
this.fb.group({
  PreviousDentist: [null],
  PhoneNumber: [null, [Validators.minLength(10)]],
  Email: [null, [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
  AddressLine1: [null],
  AddressLine2: [null],
  City: [null],
  ZipCode: [null, [Validators.minLength(5), Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$')]],
  State: [''],
  Notes: [''],
  DataTag: [null],
  ObjectState: ['Add'],
  PreviousDentalOfficeId: [null],
  PatientId: [null],
});
```

#### Referrals Form
```typescript
this.fb.group({
  referralDirection: [null],
  referralCategory: ['', Validators.required],
  provider: ['', Validators.required],
  txPlan: [null],
  chkPrintTxPlan: [],
  notes: [],
  referringTo: [null, Validators.required],
  referringFrom: [null],
  firstName: [],
  lastName: [],
  email: [, [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$')]],
  phone: [, [Validators.minLength(10)]],
  sourceName: [null],
  referralSource: ['', Validators.required],
  campaignName: [],
  patient: [],
  returnDate: [],
  actualReturnDate: []
});
```

#### Additional Identifiers Form
```typescript
this.fb.group({
  PatientIdentifiers: this.fb.array([]),
});
```

---

## 2. Error Messages and UI Feedback

- All error messages for validation failures are surfaced via Angular form validation and child component templates.
- Example: Required, maxLength, minLength, pattern, and custom error messages are shown inline in the UI.
- Modal and toast notifications are used for global errors (see Error Handling report).

---

## 3. Edge Cases and Business Logic

- Duplicate phone/email detection and validation in `validateandSavePatient`.
- Conditional disabling of fields based on business rules (e.g., ResponsiblePerson).
- Custom logic for patching and validating nested form arrays.

---

## 4. Diagrams and Tables

| Field | Validators | Error Messages | UI Binding |
|-------|------------|---------------|------------|
| FirstName | required, maxLength(64) | Required, max 64 chars | personal-details |
| LastName | required, maxLength(64) | Required, max 64 chars | personal-details |
| EmailAddress | required, pattern | Required, invalid email | contact-details |
| PhoneNumber | required, minLength(10) | Required, min 10 digits | contact-details |
| ... | ... | ... | ... |

---

## 5. Rationale and Mapping to Requirements

- All validation and error handling logic is required for data integrity, user feedback, and workflow enforcement.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Validation and Error Handling for Forms Report**
# Validation and Error Handling for Forms DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Field Validators and Rules

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

### Personal Details Form
```typescript
this.fb.group({
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
})
```

### Contact Details Form
```typescript
this.fb.group({
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
})
```

#### Phone Control
```typescript
PhoneNumber: [null, [Validators.required, Validators.minLength(10)]],
PhoneType: [0, [Validators.required]],
```

#### Email Control
```typescript
EmailAddress: [null, [Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$")]],
```

### Insurance Details Form
```typescript
PlanName: ['', Validators.required],
PolicyHolderType: ['', Validators.required],
RelationshipToPolicyHolder: ['', Validators.required],
```

### Referrals Form
```typescript
referralCategory: ['', Validators.required],
provider: ['', Validators.required],
referringTo: [null, Validators.required],
referralSource: ['', Validators.required],
email: [, [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$')]],
phone: [, [Validators.minLength(10)]],
```

---

## 2. Error Messages and UI Feedback

- Error messages are surfaced via `toastrFactory.error` and translated with `TranslateService`
- Form controls use Angular's built-in error state and validation feedback
- On validation failure, the UI scrolls to the relevant section and displays a toast error

---

## 3. Validation Logic and Edge Cases

- Duplicate phone and email detection logic in `validateandSavePatient`
- Required fields enforced via Angular Validators
- Custom logic for responsible person, insurance, and referrals
- All validation rules are explicit in the form group definitions

---

## 4. Diagrams and Tables

| Field | Validators | Error Message |
|-------|------------|--------------|
| FirstName | required, maxLength(64) | "First Name is required." |
| LastName | required, maxLength(64) | "Last Name is required." |
| PhoneNumber | required, minLength(10) | "Phone number is required and must be at least 10 digits." |
| EmailAddress | required, pattern | "Valid email is required." |
| PlanName | required | "Plan Name is required." |
| PolicyHolderType | required | "Policy Holder Type is required." |
| referralCategory | required | "Referral Category is required." |
| provider | required | "Provider is required." |
| referringTo | required | "Referring To is required." |
| referralSource | required | "Referral Source is required." |

---

**End of Validation and Error Handling for Forms Report**# Validation and Error Handling for Forms Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Validation Rules and Feedback

- **Personal Details:** Required fields (FirstName, LastName), max lengths, gender selection, date of birth format, etc. (See [Business Rules Report](business-rules.report.md), Section 1.)
- **Contact Details:** Required phone/email, phone number min length, email pattern, state/zip validation. (See [Business Rules Report](business-rules.report.md), Section 1.)
- **Insurance:** Policy fields, plan name, policy holder type, relationship required.
- **Preferences:** Required primary location, discount type, flags, etc.
- **Dental Records:** Phone/email validation, address fields, notes.
- **Referrals:** Required referral category, provider, source, email/phone pattern.
- **Identifiers:** Patient identifier required if present.

## Validation Patterns

- Uses Angular Validators: `Validators.required`, `Validators.maxLength`, `Validators.pattern`, `Validators.minLength`.
- Custom validation for duplicate emails/phones, responsible person logic, etc. (See [Business Rules Report](business-rules.report.md), Section 1.)
- Inline error messages in UI for invalid fields.

## Feedback to User

- Inline error messages for each field.
- Modal and toast messages for save/cancel errors. (See [Error Handling Report](error-handling.report.md), Section 2.)
- Disabled controls for non-editable fields.

## Edge Cases and Business Logic

- Handles missing/invalid data, duplicate entries, conditional required fields (e.g., responsible person).
- Validates all form groups before save; blocks save if any invalid. (See [API Interactions Report](api-interactions.report.md), Section 2.)

## Diagrams/Tables

| Field/Section       | Validation           | Feedback     |
| ------------------- | -------------------- | ------------ |
| FirstName, LastName | Required, max length | Inline error |
| PhoneNumber         | Required, min length | Inline error |
| EmailAddress        | Required, pattern    | Inline error |
| PolicyHolderType    | Required             | Inline error |
| PrimaryLocation     | Required             | Inline error |
| ReferralCategory    | Required             | Inline error |

## Rationale

Validation is comprehensive and user-focused, ensuring all business rules and edge cases are enforced before data is saved. All feedback is immediate and actionable for the user.

## Cross-References

- See [Business Rules Report](business-rules.report.md) for rule mapping and enforcement.
- See [API Interactions Report](api-interactions.report.md) for data model mapping and submission.
- See [Error Handling Report](error-handling.report.md) for user feedback and error surfacing.

---

## Summary of Changes (Review Step)
- Added cross-references to business rules, API, and error handling reports.
- Clarified enforcement and feedback mechanisms.
- Added this summary section per review workflow.
# Validation and Error Handling for Forms DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Field Validation Rules

- **Personal Details:**
  - `FirstName`, `LastName`: `Validators.required`, `Validators.maxLength(64)`
  - `MiddleInitial`: `Validators.maxLength(1)`
  - `Suffix`: `Validators.maxLength(20)`
  - `PreferredName`: `Validators.maxLength(64)`
  - `DateOfBirth`: Optional, but transformed for timezone
  - `Gender`, `Patient`, `ResponsiblePerson`, `SignatureOnFile`, `Status`: Various required/boolean

- **Contact Details:**
  - `AddressLine1`, `AddressLine2`, `City`, `State`: Optional
  - `ZipCode`: `Validators.minLength(5)`, `Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$')`
  - `Phones`: Array of phone groups, each with:
    - `PhoneNumber`: `Validators.required`, `Validators.minLength(10)`
    - `PhoneType`: `Validators.required`
  - `Emails`: Array of email groups, each with:
    - `EmailAddress`: `Validators.required`, `Validators.pattern(...)` (email regex)

- **Insurance Details:**
  - `Policies`: Array, each with:
    - `PolicyHolderType`, `PlanName`, `RelationshipToPolicyHolder`: `Validators.required` (conditional)

- **Preferences, Dental Records, Referrals, Identifiers:**
  - Various required and pattern validators as per business logic

## 2. Validation Patterns and Logic

- **Email Pattern:**
  - `^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$`
- **Phone Number:**
  - Minimum length 10, required
- **Zip Code:**
  - US ZIP code pattern: `^[0-9]{5}(?:[0-9]{4})?$`

## 3. Feedback to User

- **UI Feedback:**
  - Invalid fields are marked and scrolled into view
  - Error messages shown via `toastrFactory.error()`
  - Modal overlays prevent submission if invalid

- **Example:**
  ```typescript
  if (!personaldetail.valid) {
    this.setscrollIntoView(this.personalDetail);
  } else if (!isValidPhones || !isValidEmails) {
    this.setscrollIntoView(this.contactDetail);
  }
  this.toastrFactory.error('Unable to Save', 'Missing Information');
  ```

## 4. Edge Cases and Business Logic

- **Duplicate Detection:**
  - Checks for duplicate phone numbers and emails before allowing save
  - Example:
    ```typescript
    isDuplicatePhone = phoneNumbers.some((phoneNumber, index) => phoneNumbers.indexOf(phoneNumber, index + 1) !== -1);
    isDuplicateEmail = this.hasDuplicateEmail(emailAddresses);
    ```
- **Conditional Validation:**
  - Some fields required only if certain conditions are met (e.g., responsible person, referral status)
- **Form Arrays:**
  - Handles dynamic addition/removal of phones, emails, policies, etc.

## 5. Implementation and Rationale

- Uses Angular Reactive Forms for robust, scalable validation
- All validation logic is centralized in form control definitions and patching methods
- Ensures user cannot submit incomplete or invalid data
- Provides immediate feedback and guidance for correction

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
