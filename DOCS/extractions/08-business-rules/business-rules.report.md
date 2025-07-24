# Business Rules and Logic Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## Key Business Rules

### 1. Responsible Person Requirement
- **Rule:** If `ResponsiblePerson` is '2' (other), `ResponsiblePersonId` must be set.
- **Enforcement:**
  ```typescript
  if (personaldetail.value.ResponsiblePerson === '2' && !personaldetail.value.ResponsiblePersonId) {
    personaldetail.get('ResponsiblePersonId').setErrors(Validators.required);
    this.setscrollIntoView(this.personalDetail);
  }
  ```
- **Rationale:** Ensures that a responsible party is always identified for patients who are not self-responsible.

### 2. No Duplicate Emails/Phones
- **Rule:** Patient cannot have duplicate email addresses or phone numbers.
- **Enforcement:**
  ```typescript
  hasDuplicateEmail = (emailAddresses: string[]): boolean => {
    return emailAddresses.some((emailAddress, index) => {
      return emailAddresses.slice(index + 1).some(nextEmailAddress => nextEmailAddress.trim().toLowerCase().normalize("NFC") === emailAddress.trim().toLowerCase().normalize("NFC"));
    });
  }
  // Similar logic for phone numbers
  ```
- **Rationale:** Prevents data integrity issues and ensures unique contact information.

### 3. Patient Must Have a Primary Location
- **Rule:** At least one primary location must be set for the patient.
- **Enforcement:**
  - Checked before save; if not set, form is invalid and user is notified.
- **Rationale:** Required for scheduling, billing, and reporting.

### 4. Referral Logic Based on Feature Flags
- **Rule:** Referral section is enabled/disabled based on feature flag values.
- **Enforcement:**
  ```typescript
  this.featureFlagService.getOnce$(FuseFlag.ReleseEnableReferralNewPatientSection).subscribe((value) => {
    this.enableNewReferral = value;
  });
  ```
- **Rationale:** Allows dynamic enablement of features without code changes.

### 5. Modal Confirmation Before Navigation
- **Rule:** User must confirm before navigating away if there are unsaved changes.
- **Enforcement:**
  ```typescript
  if (!personaldetail.pristine || !contactDetail.pristine || ... ) {
    this.openConfirmationModal(navigationModal, url);
  } else {
    this.window.location.href = _.escape(url);
  }
  ```
- **Rationale:** Prevents accidental data loss.

### 6. Data Transformation Before Save
- **Rule:** All form data is transformed and validated before being sent to the API.
- **Enforcement:**
  - Methods like `removeInvalidDataForAddOrUpdate`, `getPersonGroups`, `getPersonFlags`, and `getPersonLocations` clean and structure the data.
- **Rationale:** Ensures only valid and necessary data is persisted.

---

## Edge Cases and Exceptions
- Handles missing/partial data by disabling fields or providing defaults.
- All business rules are checked before API calls; save is blocked if not met.
- Feature flags allow for dynamic business logic changes without redeploying code.

---

**End of Business Rules and Logic Report**
