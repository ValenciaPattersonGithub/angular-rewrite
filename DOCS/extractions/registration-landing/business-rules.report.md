# Business Rules and Logic DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Rule Implementations and Enforcement

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

#### Save/Cancel Logic
```typescript
validateandSavePatient = (data: any) => {
  // ...existing code...
  if (data.cancelEvent) {
    if (personaldetail.valid) {
      this.triggerOrigin = data.triggerData;
      this.BuildFieldList();
      this.openModal();
    } else {
      this.isCancelled = false;
      this.NavigateToResponseUrl('#/Patient');
    }
  } else {
    // ...validation and save logic...
  }
}
```

- **Rationale:** Enforces business rules for cancel/save, including validation and modal confirmation.

#### Duplicate Detection
```typescript
hasDuplicateEmail = (emailAddresses: string[]): boolean => {
  return emailAddresses.some((emailAddress, index) => {
    return emailAddresses.slice(index + 1).some(nextEmailAddress => nextEmailAddress.trim().toLowerCase().normalize("NFC") === emailAddress.trim().toLowerCase().normalize("NFC"));
  });
};
```

- **Rationale:** Prevents duplicate emails in the form.

#### Responsible Person Enforcement
```typescript
if (personaldetail.value.ResponsiblePerson === '2' && !personaldetail.value.ResponsiblePersonId) {
  personaldetail.get('ResponsiblePersonId').setErrors(Validators.required);
  this.setscrollIntoView(this.personalDetail);
}
```

- **Rationale:** Ensures a responsible person is selected if required by business rules.

#### Feature Flag Checks
```typescript
this.featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe((value) => {
  this.releseOldReferral = value;
});
this.featureFlagService.getOnce$(FuseFlag.ReleseEnableReferralNewPatientSection).subscribe((value) => {
  this.enableNewReferral = value;
});
```

- **Rationale:** Enables/disables features based on configuration.

---

## 2. Configuration, Constants, and Supporting Code

- Uses enums like `RegistrationEvent` for event types.
- Uses constants for feature flags and modal messages.

---

## 3. Edge Cases, Exceptions, and Anti-Patterns

- Handles edge cases for duplicate emails/phones, missing required fields, and feature toggles.
- Some legacy patterns (e.g., direct DOM access, legacy tokens) are present.

---

## 4. Diagrams and Tables

| Rule | Enforcement | Code Reference |
|------|-------------|---------------|
| Duplicate Email | hasDuplicateEmail | hasDuplicateEmail |
| Responsible Person Required | validateandSavePatient | validateandSavePatient |
| Feature Flag Toggle | featureFlagService.getOnce$ | checkFeatureFlags |
| Save/Cancel Modal | validateandSavePatient | openModal |

---

## 5. Rationale and Mapping to Requirements

- All business rules and logic are required for workflow enforcement, data integrity, and feature management.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Business Rules and Logic Report**
# Business Rules and Logic DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Business Rule Implementations

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

### a. Responsible Person Logic
```typescript
if (personaldetail.value.ResponsiblePerson === '2' && !personaldetail.value.ResponsiblePersonId) {
  personaldetail.get('ResponsiblePersonId').setErrors(Validators.required);
  this.setscrollIntoView(this.personalDetail);
}
```
- **Rule:** If Responsible Person is 'Other', ResponsiblePersonId is required.

### b. Duplicate Phone/Email Detection
```typescript
let isDuplicatePhone = phoneNumbers.some((phoneNumber, index) => phoneNumbers.indexOf(phoneNumber, index + 1) !== -1);
let isDuplicateEmail = this.hasDuplicateEmail(emailAddresses);
```
- **Rule:** No duplicate phone numbers or emails allowed.

### c. Insurance Policy Validation
```typescript
if (!policy.PolicyHolderType) {
  policyForm.get('PolicyHolderType').setErrors(Validators.required);
}
if (!policy.PlanName) {
  policyForm.get('PlanName').setErrors(Validators.required);
}
if (policy.PolicyHolderType === '2' && !policy.RelationshipToPolicyHolder) {
  policyForm.get('RelationshipToPolicyHolder').setErrors(Validators.required);
}
```
- **Rule:** PolicyHolderType, PlanName, and RelationshipToPolicyHolder (if type 2) are required.

### d. Referral Form Status
```typescript
var referralFormStatus = (this.enableNewReferral == true && this.referralsComponent) ? this.referralsComponent.isValidFromAddPatient() : 'Valid';
```
- **Rule:** Referral form must be valid or not required to proceed.

### e. Feature Flags
```typescript
this.featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe((value) => {
  this.releseOldReferral = value;
});
this.featureFlagService.getOnce$(FuseFlag.ReleseEnableReferralNewPatientSection).subscribe((value) => {
  this.enableNewReferral = value;
});
```
- **Rule:** Feature flags control availability of certain features/sections.

---

## 2. Enforcement and Rationale

- All business rules are enforced via explicit validation and conditional logic in the component
- Rationale: Ensures data integrity, compliance, and correct workflow for patient registration

---

## 3. Edge Cases and Legacy Artifacts

- Handles both new and existing patient flows
- Some logic is duplicated for patching and saving forms
- Uses both Angular and legacy DI patterns

---

## 4. Diagrams and Tables

| Rule | Enforcement | Rationale |
|------|-------------|-----------|
| Responsible Person required | Form validation | Data integrity |
| No duplicate phones/emails | Custom logic | Data integrity |
| Insurance policy required fields | Form validation | Compliance |
| Referral form status | Component logic | Workflow correctness |
| Feature flags | Service subscription | Dynamic feature control |

---

**End of Business Rules and Logic Report**# Business Rules and Logic Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Business Rules Overview

- **Person must have required fields:** First/Last name, gender, date of birth, etc. (See [Validation Report](validation.report.md), Section 1.)
- **Contact must have at least one valid phone/email:** Duplicates not allowed. (See [Validation Report](validation.report.md), Section 4.)
- **Insurance must have valid policy and plan:** Policy holder and plan name required.
- **Preferences must have primary location:** Cannot save without it.
- **Dental records, referrals, identifiers:** All must meet required and pattern-based rules.
- **Responsible person logic:** If responsible person is 'Other', must provide ID and name. (See [Validation Report](validation.report.md), Section 4.)
- **Feature flags:** Enable/disable sections and logic dynamically. (See [API Interactions Report](api-interactions.report.md), Section 1.)

## Enforcement in Code

- All rules enforced via Angular Validators, custom logic in component methods, and service calls. (See [Validation Report](validation.report.md), Section 2.)
- Save is blocked if any rule is violated; user is notified via UI feedback. (See [Error Handling Report](error-handling.report.md), Section 2.)
- Conditional logic for new vs. existing patient, feature flags, and section enablement.

## Mapping of Rules to Code Sections

| Rule               | Enforcement          | Code Section/Method                                                 | Edge Case             |
| ------------------ | -------------------- | ------------------------------------------------------------------- | --------------------- |
| Required fields    | Validators, UI       | `validateandSavePatient`, form control definitions                  | Missing data          |
| No duplicates      | Custom logic         | `hasDuplicateEmail`, phone/email checks in `validateandSavePatient` | Duplicate phone/email |
| Responsible person | Conditional required | `validateandSavePatient`                                            | Missing ID/name       |
| Feature flag       | Service call         | `checkFeatureFlags`                                                 | Section disabled      |

## Edge Cases and Exceptions

- Handles missing/invalid data, duplicate entries, and conditional requirements.
- All edge cases are surfaced to the user for correction before save. (See [Error Handling Report](error-handling.report.md), Section 6.)

## Diagrams/Tables

| Rule               | Enforcement          | Code Section/Method                                                 | Edge Case             |
| ------------------ | -------------------- | ------------------------------------------------------------------- | --------------------- |
| Required fields    | Validators, UI       | `validateandSavePatient`, form control definitions                  | Missing data          |
| No duplicates      | Custom logic         | `hasDuplicateEmail`, phone/email checks in `validateandSavePatient` | Duplicate phone/email |
| Responsible person | Conditional required | `validateandSavePatient`                                            | Missing ID/name       |
| Feature flag       | Service call         | `checkFeatureFlags`                                                 | Section disabled      |

## Technical Debt and Migration Recommendations

- Some business rules are enforced in the component rather than in dedicated services; recommend moving to a centralized validation or business logic service for maintainability.
- Consider using a state management solution (e.g., NgRx) to centralize business rule enforcement and reduce component complexity.

## Cross-References

- See [Validation Report](validation.report.md) for field-level validation and enforcement.
- See [API Interactions Report](api-interactions.report.md) for API mapping and integration.
- See [Error Handling Report](error-handling.report.md) for user feedback and error propagation.

---

## Summary of Changes (Review Step)

- Added explicit cross-links to validation, API, and error handling reports.
- Mapped business rules to code sections and methods.
- Documented technical debt and migration recommendations.
- Added this summary section per review workflow.

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
