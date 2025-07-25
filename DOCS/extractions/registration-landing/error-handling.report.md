# Error Handling and Messaging DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Error Detection, Handling, and Propagation

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

```typescript
// Error handling in savePersonFailure
savePersonFailure = (res: any) => {
  const mode = this.route.patientId ? 'update' : 'save';
  if (mode) {
    this.toastrFactory.error(
      this.translate.instant(`Unable to ${mode} patient.`),
      this.translate.instant('Server Error')
    );
  }
  this.loadingModal.close();
};
```

- **Rationale:** All API errors are surfaced to the user via toast notifications and modal closure.

---

## 2. UI, Notification, and Error Boundary Code

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.html`

```html
<p id="modal-header" class="reg-modal-header">
  {{!isCancelled ? 'Is everything correct? Do you want to continue?':'Cancel now and you will lose the changes below. Do you want to continue?' | translate}}
</p>
<!-- Error messages for form fields are handled in child components and via Angular validators -->
```

- **Rationale:** Modal and toast notifications are used for user feedback. Field-level errors are handled in child components.

---

## 3. Logging and Analytics Hooks

- **toastrFactory:** Used for all error and success notifications.
- **No explicit analytics hooks in this component.**

---

## 4. Edge Cases, Anti-Patterns, and Legacy Artifacts

- Error handling is centralized in `savePersonFailure` and via Angular form validation.
- Some legacy patterns (e.g., direct DOM access, legacy tokens) are present but do not affect error handling directly.

---

## 5. Diagrams and Tables

| Error Source | Handling | User Feedback | Code Reference |
|--------------|----------|--------------|---------------|
| API Failure | savePersonFailure | Toast notification, modal close | savePersonFailure |
| Form Validation | Angular Validators | Field-level error messages | Child components |
| Modal Actions | Modal logic | Confirmation/cancel messages | HTML template |

---

## 6. Rationale and Mapping to Requirements

- All error handling and messaging logic is required for user feedback, workflow integrity, and state management.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Error Handling and Messaging Report**

## Messaging

- **Toasts:** Uses `toastrFactory` to show success/error messages for save/update actions.
- **Modal Messages:** Modal overlay displays confirmation/cancel messages, translated via `TranslateService`.
- **UI Feedback:** Form fields show validation errors inline; modal and toast messages provide user feedback for actions and errors.

## Error Flow

- **Try/Catch:** API calls use RxJS `subscribe` error handlers. (See [API Interactions Report](api-interactions.report.md), Section 3.)
- **Error Propagation:** Errors are propagated to the UI via service calls and state changes. (See [Business Rules Report](business-rules.report.md), Section 1.)
- **Edge Cases:** Handles missing/invalid data, duplicate emails/phones, and failed API calls.

## Diagrams/Tables

| Error Source | Handling | User Feedback |
|--------------|----------|--------------|
| Form validation | Angular Validators, inline errors | Field error messages |
| API failure | RxJS error handler, toastrFactory | Toast error message |
| Modal actions | Modal close/cancel logic | Modal message |

## Rationale

Error handling is robust and user-centric, ensuring all errors are surfaced to the user and handled gracefully in the UI. All error flows are testable and maintainable.

## Cross-References

- See [Validation Report](validation.report.md) for validation logic and error surfacing.
- See [API Interactions Report](api-interactions.report.md) for API error handling.
- See [Business Rules Report](business-rules.report.md) for business rule enforcement and error propagation.

---

## Summary of Changes (Review Step)
- Added cross-references to validation, API, and business rules reports.
- Clarified error propagation and handling.
- Added this summary section per review workflow.
# Error Handling and Messaging DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Error Detection

- **Form Validation Errors:**
  - Detected using Angular Reactive Forms validators (e.g., `Validators.required`, `Validators.pattern`, `Validators.minLength`).
  - Example:
    ```typescript
    personaldetail.get('ResponsiblePersonId').setErrors(Validators.required);
    ...
    if (!phones.valid) { ... }
    if (!emails.valid) { ... }
    ```
- **API Errors:**
  - Detected in API call subscriptions (e.g., `.subscribe(success, error => this.savePersonFailure(error))`).

## 2. Surfacing Errors to the User

- **Toastr Notifications:**
  - Uses injected `toastrFactory` to display error and success messages.
  - Example:
    ```typescript
    this.toastrFactory.error('Unable to Save', 'Missing Information');
    this.toastrFactory.error(this.translate.instant(`Unable to ${mode} patient.`), this.translate.instant('Server Error'));
    this.toastrFactory.success(this.translate.instant(`Patient has been ${mode} successfully.`), this.translate.instant('Success'));
    ```
- **Modal Dialogs:**
  - Confirmation and error modals are shown using `ConfirmationModalService` and modal overlay templates.

## 3. Error Handling Flow

- **Form Submission:**
  - Validates all form controls before allowing save.
  - If invalid, scrolls to the relevant section and shows error notification.
  - Example:
    ```typescript
    if (!personaldetail.valid) {
      this.setscrollIntoView(this.personalDetail);
    } else if (!isValidPhones || !isValidEmails) {
      this.setscrollIntoView(this.contactDetail);
    } ...
    this.toastrFactory.error('Unable to Save', 'Missing Information');
    ```
- **API Calls:**
  - Handles errors in API responses and shows error messages.
  - Example:
    ```typescript
    this.registrationService.updatePerson(personToUpdate).subscribe(
      (updatedPatient: any) => { ... },
      error => this.savePersonFailure(error)
    );
    ```
- **Modal Confirmation:**
  - Handles user confirmation/cancellation and error states in modal dialogs.

## 4. Messaging and Rationale

- **User Feedback:**
  - Immediate feedback for missing/invalid fields and server errors.
  - Success messages on save/update.
- **Translation:**
  - All messages are passed through `translate.instant()` for i18n support.

## 5. Logging and Analytics

- No explicit logging or analytics hooks in this component, but error and success messages are surfaced via UI notifications and modals.

## 6. Edge Cases

- Handles duplicate phone/email detection and disables save if found.
- Handles both new and existing patient flows, with different error handling for each.
- Ensures all subscriptions are cleaned up on destroy to prevent memory leaks.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
