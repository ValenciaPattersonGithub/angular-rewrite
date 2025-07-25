# Forms DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Forms Defined in Component

- Main form: `formGroup` (Angular Reactive Form)
- Sub-forms: Nested FormGroups and FormArrays for phones, emails, addresses, etc.

---

## 2. Form Structure and Controls

| Control/Group         | Type         | Validators                | Purpose                        |
|-----------------------|--------------|---------------------------|--------------------------------|
| `firstName`           | FormControl  | required                  | Patient first name             |
| `lastName`            | FormControl  | required                  | Patient last name              |
| `dateOfBirth`         | FormControl  | required, date            | Patient DOB                    |
| `phones`              | FormArray    | required, pattern         | Patient phone numbers          |
| `emails`              | FormArray    | required, email           | Patient email addresses        |
| `address`             | FormGroup    | required, pattern         | Patient address                |
| ...                   | ...          | ...                       | ...                            |

---

## 3. Form Initialization and Patching

- Forms are initialized in `ngOnInit` and via helper methods
- Data is patched from `personObject` and API responses
- Form state is reset/cleared on new registration or cancel

---

## 4. Validation and Error Handling

- Validators are set on controls and groups
- Error messages are displayed in the template for invalid fields
- Custom validation logic for business rules (e.g., age, duplicate check)

---

## 5. Form Submission and API Integration

- On submit, form is validated and data is mapped to `personObject`
- Calls `addPerson` or `updatePerson` API methods
- Handles success and error responses, updates UI accordingly

---

## 6. Rationale and Mapping to Requirements

- Form structure and validation ensure data integrity and user guidance
- Follows DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`

---

**End of Forms Report**
# Forms DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. FormGroups, FormControls, and FormArrays

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

### Main FormGroup Structure

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
```

### Example: Personal Details Controls

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

### Example: Contact Details Controls

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

### Example: Phones FormArray

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
})
```

---

## 2. PatchValue, Get, and Dynamic Logic

- Uses `patchValue` to update form sections with API data
- Uses `get` to access nested controls and arrays
- Dynamic addition of phones, emails, policies, etc.

---

## 3. Validators and Error Messages

- All validators are defined in the form group/control definitions
- Error messages are surfaced via Angular error state and toast notifications

---

## 4. Mapping to Models and Business Logic

- Form values are mapped directly to API models in `savePerson`
- Business rules are enforced via form validation and custom logic

---

## 5. Diagrams and Tables

| Form Section         | Controls/Arrays                   | Validators                   |
| -------------------- | --------------------------------- | ---------------------------- |
| personalDetailsForm  | FirstName, LastName, ...          | required, maxLength          |
| contactDetailsForm   | AddressLine1, Phones, Emails, ... | required, minLength, pattern |
| insuranceDetailsForm | Policies                          | required                     |
| preferencesForm      | PrimaryLocation, Flags, ...       | required                     |
| dentalRecordsForm    | PreviousDentist, PhoneNumber, ... | minLength, pattern           |
| referralsForm        | referralCategory, provider, ...   | required, email, minLength   |
| identifiresForm      | PatientIdentifiers                | n/a                          |

---

**End of Forms Report**# Forms Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## FormGroups, FormControls, and FormArrays

- **personGroup:** Main FormGroup containing all form sections.
- **personalDetailsForm:** FormGroup for personal details (FirstName, LastName, Gender, etc.).
- **contactDetailsForm:** FormGroup for contact details (Address, Phones, Emails, etc.).
- **insuranceDetailsForm:** FormGroup for insurance (Policies array, plan, holder, etc.).
- **preferencesForm:** FormGroup for preferences (locations, discounts, flags, etc.).
- **dentalRecordsForm:** FormGroup for dental records (dentist, address, notes, etc.).
- **referralsForm:** FormGroup for referrals (type, source, patient, etc.).
- **identifiresForm:** FormGroup for additional identifiers (PatientIdentifiers array).

## Initialization and Validation

- All forms initialized in `initializePersonForm()` using FormBuilder.
- Validators applied for required fields, patterns, and business rules.
- Dynamic form logic for patching, enabling/disabling controls, and handling arrays.

## Mapping to Models

- Each form field maps directly to a property in the data model for save/update.
- Uses `patchValue`, `get`, and custom methods for dynamic updates.

## Diagrams/Tables

| Form Section         | Controls                          | Validators          |
| -------------------- | --------------------------------- | ------------------- |
| personalDetailsForm  | FirstName, LastName, Gender, etc. | required, maxLength |
| contactDetailsForm   | Address, Phones, Emails           | required, pattern   |
| insuranceDetailsForm | Policies, PlanName, etc.          | required            |
| preferencesForm      | Locations, Discounts, Flags       | required            |
| dentalRecordsForm    | Dentist, Address, Notes           | pattern             |
| referralsForm        | Type, Source, Patient             | required, pattern   |
| identifiresForm      | PatientIdentifiers                | required            |

## Rationale

Forms are modular, validated, and mapped directly to models for reliability and maintainability.

# Forms (Angular FormGroups/FormControls) DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Files Included:**

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`

---

## 1. FormGroups, FormControls, and FormArrays

### Main FormGroup: `personGroup`

- Defined in `registration-landing.component.ts` as the root form for the registration landing page.
- Structure:

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
```

#### Sub-Forms and Their Controls

- **personalDetailsForm**: Contains controls for FirstName, LastName, Gender, DOB, etc.
- **contactDetailsForm**: Contains controls for address, Phones (FormArray), Emails (FormArray), etc.
- **insuranceDetailsForm**: Contains controls for insurance policies (Policies: FormArray).
- **preferencesForm**: Contains controls for locations, flags, groups, etc.
- **dentalRecordsForm**: Contains controls for previous dentist, contact, address, etc.
- **referralsForm**: Contains controls for referral details.
- **identifiresForm**: Contains PatientIdentifiers (FormArray).

---

## 2. Initialization, Patching, and Validation

### Initialization

Each sub-form is initialized via a method returning a FormGroup. Example:

```typescript
personalDetailsControls = () => this.fb.group({
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

### Patching

Form values are patched from API data using methods like `patchPersonalDetail`, `patchContactDetail`, etc. Example:

```typescript
patchPersonalDetail = () => {
  const profile: any = this.personInfo.Profile;
  if (profile) {
    const personaldetail = this.personGroup.get('personalDetailsForm');
    personaldetail.patchValue({
      FirstName: profile.FirstName,
      MiddleInitial: profile.MiddleName,
      LastName: profile.LastName,
      // ...other fields...
    });
    // ...additional logic...
  }
};
```

### Validation

Validators are defined inline in the form control definitions. Example:

- `FirstName: ['', [Validators.required, Validators.maxLength(64)]]`
- `ZipCode: [null, [Validators.minLength(5), Validators.pattern('^[0-9]{5}(?:[0-9]{4})?$')]]`
- `EmailAddress: [null, [Validators.required, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+-/=?^_`{|]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$")]]`

---

## 3. Field Mapping to Model Properties

- Each form field is mapped to a property in the `PersonObject` model for API submission.
- Patch methods map API data to form controls, and form values are used to build the DTO for API calls.

---

## 4. Dynamic Form Logic

- Dynamic addition/removal of phones, emails, policies, and identifiers via FormArrays.
- Conditional logic for enabling/disabling controls (e.g., ResponsiblePerson).
- Patch methods update form state based on API data and business rules.

---

## 5. Purpose and Business Logic

- The forms capture all patient registration data, enforce validation, and support dynamic UI updates.
- Each field is mapped to a business requirement for patient onboarding, validation, and downstream integration.

---

## 6. Diagrams and Tables

| Form Group           | Key Controls (Sample)                 | Validators/Notes                  |
| -------------------- | ------------------------------------- | --------------------------------- |
| personalDetailsForm  | FirstName, LastName, Gender, DOB, ... | required, maxLength, custom logic |
| contactDetailsForm   | AddressLine1, Phones[], Emails[]      | minLength, pattern, required      |
| insuranceDetailsForm | Policies[]                            | required, custom logic            |
| preferencesForm      | PrimaryLocation, Flags[], Groups[]    | required, custom logic            |
| dentalRecordsForm    | PreviousDentist, PhoneNumber, Email   | minLength, pattern                |
| referralsForm        | ReferralType, ReferralSourceId, ...   | required, custom logic            |
| identifiresForm      | PatientIdentifiers[]                  | required, custom logic            |

---

## 7. Anti-Patterns, Legacy Artifacts, Edge Cases

- Use of `any` for some form values and API data reduces type safety.
- Some controls and arrays have legacy or redundant fields (e.g., DataTag, ObjectState).
- Conditional logic for patching and mapping can introduce edge cases if not kept in sync.

---

## 8. File References

All code samples and form definitions are from:

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`

---

*End of report.*
