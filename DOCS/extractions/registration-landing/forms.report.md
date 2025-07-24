# Forms Report: registration-landing

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

| Form Section | Controls | Validators |
|--------------|----------|------------|
| personalDetailsForm | FirstName, LastName, Gender, etc. | required, maxLength |
| contactDetailsForm | Address, Phones, Emails | required, pattern |
| insuranceDetailsForm | Policies, PlanName, etc. | required |
| preferencesForm | Locations, Discounts, Flags | required |
| dentalRecordsForm | Dentist, Address, Notes | pattern |
| referralsForm | Type, Source, Patient | required, pattern |
| identifiresForm | PatientIdentifiers | required |

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

| Form Group           | Key Controls (Sample)                   | Validators/Notes                  |
|----------------------|-----------------------------------------|-----------------------------------|
| personalDetailsForm  | FirstName, LastName, Gender, DOB, ...   | required, maxLength, custom logic |
| contactDetailsForm   | AddressLine1, Phones[], Emails[]        | minLength, pattern, required      |
| insuranceDetailsForm | Policies[]                              | required, custom logic            |
| preferencesForm      | PrimaryLocation, Flags[], Groups[]      | required, custom logic            |
| dentalRecordsForm    | PreviousDentist, PhoneNumber, Email     | minLength, pattern                |
| referralsForm        | ReferralType, ReferralSourceId, ...     | required, custom logic            |
| identifiresForm      | PatientIdentifiers[]                    | required, custom logic            |

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
