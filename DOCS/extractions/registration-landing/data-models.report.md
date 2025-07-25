# Data Models DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Data Model Definitions and Usage

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

#### Person Object Model
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
    Weight: string,
    PrimaryDuplicatePatientId: string,
    PersonAccount: {
      ReceivesStatements: boolean,
      ReceivesFinanceCharges: boolean,
      PersonId: string,
      AccountId: string,
      DataTag: string,
    },
  },
  Phones: Array<any>,
  Emails: Array<any>,
  PreviousDentalOffice: any,
  Referral: any,
  patientIdentifierDtos: Array<any>,
  Flags: Array<any>,
  PatientBenefitPlanDtos: Array<any>,
  PatientLocations: Array<any>,
  patientDiscountTypeDto: any,
  patientGroupDtos: Array<any>,
}
```

- **Rationale:** Central model for all patient registration data, used for form patching and API calls.

---

## 2. Model Usage in Code

- Used in form patching (`patchPersonalDetail`, `patchContactDetail`, etc.)
- Used in API calls (`addPerson`, `updatePerson`)
- Used for UI binding and state management

---

## 3. Relationships and Dependencies

- `Profile` is the main patient demographic model
- `Phones`, `Emails`, `PreviousDentalOffice`, `Referral`, etc. are sub-models/arrays
- All models are mapped to Angular FormGroups and FormArrays

---

## 4. Edge Cases and Legacy Artifacts

- Some fields may be null/undefined depending on workflow (e.g., new vs. edit)
- Legacy fields and patterns are present for compatibility

---

## 5. Diagrams and Tables

| Model | Fields | Usage |
|-------|--------|-------|
| Profile | PatientId, FirstName, ... | Demographics, form patching |
| Phones | PhoneNumber, PhoneType, ... | Contact info, form patching |
| Emails | EmailAddress, ... | Contact info, form patching |
| PreviousDentalOffice | Name, Address, ... | Dental info |
| Referral | ReferralType, ... | Referrals |
| patientIdentifierDtos | ... | Identifiers |
| Flags | ... | Alerts/flags |
| PatientBenefitPlanDtos | ... | Insurance |
| PatientLocations | ... | Locations |
| patientDiscountTypeDto | ... | Discounts |
| patientGroupDtos | ... | Groups |

---

## 6. Rationale and Mapping to Requirements

- All data models are required for form structure, API integration, and UI binding.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Data Models Report**# Data Models DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Data Model Definitions and Usage

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

### a. PersonObject Model
```typescript
this.PersonObject = {
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
  Phones: phones.valid ? [...patientPhones] : [],
  Emails: emails.valid ? [...patientEmails] : [],
  PreviousDentalOffice: {
    Name: dentalRecords.PreviousDentist,
    PatientId: dentalRecords.PatientId,
    Address: {
      AddressLine1: dentalRecords.AddressLine1,
      AddressLine2: dentalRecords.AddressLine2,
      City: dentalRecords.City,
      State: dentalRecords.State,
      ZipCode: dentalRecords.ZipCode,
    },
    PhoneNumber: dentalRecords.PhoneNumber,
    Email: dentalRecords.Email,
    Notes: dentalRecords.Notes,
    PreviousDentalOfficeId: dentalRecords.PreviousDentalOfficeId,
    DataTag: dentalRecords.DataTag,
    ObjectState: dentalRecords.ObjectState,
  },
  Referral: referrals.ReferralType || referrals.ReferredPatientId ? referrals : null,
  patientIdentifierDtos: identifires.PatientIdentifiers,
  Flags: this.getPersonFlags(preferences.Flags),
  PatientBenefitPlanDtos: policies.length === 1 && !policies[0].PolicyHolderType ? [] : policies,
  PatientLocations: this.getPersonLocations(patientLocations),
  patientDiscountTypeDto: preferences.PatientDiscountTypeId || preferences.DiscountType ? {
    MasterDiscountTypeId: preferences.DiscountType,
    ObjectState: preferences.DiscountTypeObjectState,
    PatientId: this.route.patientId ? this.route.patientId : null,
    PatientDiscountTypeId: preferences.PatientDiscountTypeId,
    DataTag: preferences.PatientDiscountDataTag,
  } : null,
  patientGroupDtos: this.getPersonGroups(preferences.Groups),
};
```

- **Purpose:**
  - Aggregates all form and model data for API submission
  - Nested structure for profile, phones, emails, insurance, referrals, etc.

---

## 2. Model Relationships and Usage

- Models are mapped directly from form group values
- All API requests and responses use these models
- Relationships: Profile contains nested PersonAccount, PreviousDentalOffice contains nested Address, etc.

---

## 3. Edge Cases and Legacy Artifacts

- Some fields are conditionally included based on form state
- Uses both explicit and inferred models

---

## 4. Diagrams and Tables

| Model | Fields | Relationships |
|-------|--------|---------------|
| PersonObject | Profile, Phones, Emails, PreviousDentalOffice, Referral, patientIdentifierDtos, Flags, PatientBenefitPlanDtos, PatientLocations, patientDiscountTypeDto, patientGroupDtos | Nested objects |
| Profile | PatientId, PatientSince, DataTag, ... | PersonAccount |
| PreviousDentalOffice | Name, PatientId, Address, ... | Address |

---

**End of Data Models Report**# Data Models Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Data Model Definitions
- **Profile:** Patient profile object, includes all personal, contact, and account fields.
- **Phones/Emails:** Arrays of phone/email objects, each with type, value, flags, etc.
- **Insurance:** Policies array, each with plan, holder, relationship, etc.
- **Preferences:** Preferences object, includes locations, discounts, flags, groups.
- **Dental Records:** Previous dental office, address, notes.
- **Referrals:** Referral object, type, source, patient, etc.
- **Identifiers:** Patient identifier DTOs.
- **Flags/Groups:** Arrays of flag/group objects for alerts and groupings.

## Model Usage
- All models are used to patch form state and build API payloads.
- Models are defined in code and inferred from API responses.
- All form fields map directly to model properties for save/update.

## Relationships and Dependencies
- Profile is the root; all other models are nested or referenced within it.
- Phones, emails, policies, identifiers, flags, groups are arrays within the main object.
- Preferences, dental, referrals are nested objects.

## Diagrams/Tables
| Model | Fields | Usage |
|-------|--------|-------|
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
Data models are comprehensive, normalized, and mapped directly to form and API structures for reliability and maintainability.
# Data Models DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Main Data Models

### a. PersonObject
- **Definition:** Aggregated patient data object used for API calls.
- **Fields:**
  - `Profile`: Patient profile (ID, name, DOB, gender, account, etc.)
  - `Phones`: Array of phone objects (number, type, primary, etc.)
  - `Emails`: Array of email objects (address, primary, etc.)
  - `PreviousDentalOffice`: Dental office details (name, address, phone, etc.)
  - `Referral`: Referral details (type, source, patient IDs, etc.)
  - `patientIdentifierDtos`: Array of identifier objects
  - `Flags`: Array of flag objects (alerts, custom flags, etc.)
  - `PatientBenefitPlanDtos`: Array of insurance policy objects
  - `PatientLocations`: Array of location objects
  - `patientDiscountTypeDto`: Discount type object
  - `patientGroupDtos`: Array of group objects
- **Usage:**
  - Built from form data and sent to API for add/update operations.
  - Example:
    ```typescript
    this.PersonObject = {
      Profile: { ... },
      Phones: [...],
      Emails: [...],
      ...
    };
    ```

### b. FormGroup Models
- **Definition:** Angular Reactive FormGroups for each section (personal, contact, insurance, etc.)
- **Fields:**
  - Each FormGroup contains controls for relevant fields (see validation report for details)
- **Usage:**
  - Used for UI binding, validation, and data aggregation

### c. Event and Static Data Models
- **RegistrationEvent:** Enum for event types (focus section, save, navigation, etc.)
- **RegistrationCustomEvent:** Custom event object for registration events
- **Static Data:** Phone types, states, etc. loaded for form controls

---

## 2. Relationships and Dependencies
- **PersonObject** aggregates all form data and related models for API operations.
- **FormGroups** are bound to UI and used to build the PersonObject.
- **Event models** are used for communication between services and components.
- **Static data** is loaded and injected into form controls as needed.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
