# Error Handling and Messaging Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Error Detection and Handling
- **Form Validation:** Uses Angular Validators for required fields, patterns, and min/max lengths. Errors are surfaced in the UI via child components and form control states.
- **API Errors:** API call failures (add/update person) are caught and surfaced via `toastrFactory.error` and modal dialogs.
- **Modal Confirmation:** User navigation or save triggers confirmation modal; errors in modal actions are handled gracefully.
- **RxJS Subscriptions:** All subscriptions are cleaned up on destroy to prevent memory leaks.

## Messaging
- **Toasts:** Uses `toastrFactory` to show success/error messages for save/update actions.
- **Modal Messages:** Modal overlay displays confirmation/cancel messages, translated via `TranslateService`.
- **UI Feedback:** Form fields show validation errors inline; modal and toast messages provide user feedback for actions and errors.

## Error Flow
- **Try/Catch:** API calls use RxJS `subscribe` error handlers.
- **Error Propagation:** Errors are propagated to the UI via service calls and state changes.
- **Edge Cases:** Handles missing/invalid data, duplicate emails/phones, and failed API calls.

## Diagrams/Tables
| Error Source | Handling | User Feedback |
|--------------|----------|--------------|
| Form validation | Angular Validators, inline errors | Field error messages |
| API failure | RxJS error handler, toastrFactory | Toast error message |
| Modal actions | Modal close/cancel logic | Modal message |

## Rationale
Error handling is robust and user-centric, ensuring all errors are surfaced to the user and handled gracefully in the UI. All error flows are testable and maintainable.
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
