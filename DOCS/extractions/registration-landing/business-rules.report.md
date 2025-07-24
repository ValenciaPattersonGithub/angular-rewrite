# Business Rules and Logic Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Business Rules Overview
- **Person must have required fields:** First/Last name, gender, date of birth, etc.
- **Contact must have at least one valid phone/email:** Duplicates not allowed.
- **Insurance must have valid policy and plan:** Policy holder and plan name required.
- **Preferences must have primary location:** Cannot save without it.
- **Dental records, referrals, identifiers:** All must meet required and pattern-based rules.
- **Responsible person logic:** If responsible person is 'Other', must provide ID and name.
- **Feature flags:** Enable/disable sections and logic dynamically.

## Enforcement in Code
- All rules enforced via Angular Validators, custom logic in component methods, and service calls.
- Save is blocked if any rule is violated; user is notified via UI feedback.
- Conditional logic for new vs. existing patient, feature flags, and section enablement.

## Edge Cases and Exceptions
- Handles missing/invalid data, duplicate entries, and conditional requirements.
- All edge cases are surfaced to the user for correction before save.

## Diagrams/Tables
| Rule | Enforcement | Edge Case |
|------|-------------|----------|
| Required fields | Validators, UI | Missing data |
| No duplicates | Custom logic | Duplicate phone/email |
| Responsible person | Conditional required | Missing ID/name |
| Feature flag | Service call | Section disabled |

## Rationale
Business rules are explicit, enforced at all layers, and mapped to requirements. All exceptions are handled gracefully and surfaced to the user.
# Business Rules and Logic DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Business Rules

### a. Required Fields and Validation
- **Rule:** All required fields must be filled before saving a patient.
- **Enforcement:** Angular validators and conditional checks in `validateandSavePatient`.
- **Code Example:**
  ```typescript
  if (!personaldetail.valid) { ... }
  if (!isValidPhones || !isValidEmails) { ... }
  if (!preferences.PrimaryLocation) { ... }
  if (!policies.valid) { ... }
  ```

### b. Duplicate Detection
- **Rule:** No duplicate phone numbers or emails allowed.
- **Enforcement:** Checks for duplicates before save.
- **Code Example:**
  ```typescript
  isDuplicatePhone = phoneNumbers.some((phoneNumber, index) => phoneNumbers.indexOf(phoneNumber, index + 1) !== -1);
  isDuplicateEmail = this.hasDuplicateEmail(emailAddresses);
  ```

### c. Responsible Person Logic
- **Rule:** If `ResponsiblePerson` is '2' (Other), `ResponsiblePersonId` is required.
- **Enforcement:** Sets error and scrolls to section if missing.
- **Code Example:**
  ```typescript
  if (personaldetail.value.ResponsiblePerson === '2' && !personaldetail.value.ResponsiblePersonId) {
    personaldetail.get('ResponsiblePersonId').setErrors(Validators.required);
    this.setscrollIntoView(this.personalDetail);
  }
  ```

### d. Feature Flags
- **Rule:** Certain features (e.g., referrals) are enabled/disabled by feature flags.
- **Enforcement:** Uses `FeatureFlagService` to check flags and conditionally render sections.
- **Code Example:**
  ```typescript
  this.featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe((value) => {
    this.releseOldReferral = value;
  });
  ```

### e. Modal Confirmation
- **Rule:** User must confirm before saving or cancelling registration.
- **Enforcement:** Modal overlay and confirmation logic.
- **Code Example:**
  ```typescript
  this.confirmationRef = this.confirmationModalService.open({ data });
  ```

### f. API Data Sync
- **Rule:** Patient data must be synchronized with backend on save/update.
- **Enforcement:** Calls `addPerson` or `updatePerson` with cleaned data object.
- **Code Example:**
  ```typescript
  this.registrationService.updatePerson(personToUpdate).subscribe(...);
  this.registrationService.addPerson(personToAdd).subscribe(...);
  ```

---

## 2. Edge Cases and Exceptions
- Handles both new and existing patient flows.
- Conditional logic for form arrays and dynamic fields.
- Cleans up subscriptions and resets state on destroy.

---

## 3. Rationale and Impact
- Ensures data integrity and prevents incomplete or duplicate records.
- Provides a robust, user-friendly registration experience.
- Supports feature toggling for phased rollouts and A/B testing.
- Centralizes business logic for maintainability and testability.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
