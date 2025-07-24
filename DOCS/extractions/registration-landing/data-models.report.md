# Data Models Report: registration-landing

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
