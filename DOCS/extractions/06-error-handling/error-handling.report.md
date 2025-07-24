# Error Handling and Messaging Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## Error Detection

- **Form Validation Errors:**
  - Detected via Angular Reactive Forms validators (e.g., `Validators.required`, `Validators.pattern`).
  - Example:
    ```typescript
    personalDetailsControls = () => {
      return this.fb.group({
        FirstName: ['', [Validators.required, Validators.maxLength(64)]],
        ...
      });
    }
    ```
  - Custom validation logic for duplicate emails/phones and required business rules.

- **API/Service Errors:**
  - Detected in API call subscriptions (e.g., `savePersonFailure`, error callbacks in `subscribe`).
  - Example:
    ```typescript
    this.registrationService.addPerson(personToAdd).subscribe(
      (data: any) => this.savePersonSuccess(data),
      error => this.savePersonFailure(error)
    );
    ```

---

## Error Surfacing and Messaging

- **Toastr Notifications:**
  - Uses `toastrFactory` to display error and success messages to the user.
  - Example:
    ```typescript
    this.toastrFactory.error('Unable to Save', 'Missing Information');
    this.toastrFactory.success('Patient has been saved successfully.', 'Success');
    ```
  - Translated messages via `TranslateService` for i18n support.

- **UI Feedback:**
  - Invalid fields are highlighted in child components via Angular form validation.
  - Modal overlays provide user confirmation and error context before save/cancel.

---

## Error Handling Flow

- **Form Submission:**
  - On save, all forms are validated. If invalid, focus is set to the first invalid section and an error message is shown.
  - Example:
    ```typescript
    if (!personaldetail.valid) {
      this.setscrollIntoView(this.personalDetail);
      this.toastrFactory.error('Unable to Save', 'Missing Information');
    }
    ```

- **API Errors:**
  - On API failure, error messages are shown and loading modals are closed.
  - Example:
    ```typescript
    savePersonFailure = (res: any) => {
      this.toastrFactory.error('Unable to save patient.', 'Server Error');
      this.loadingModal.close();
    }
    ```

---

## Logging and Analytics

- **User-Facing Logging:**
  - All error and success messages are surfaced via toastr notifications.
  - No explicit analytics or external logging hooks present in this component.

---

## Edge Cases and Rationale

- **Duplicate Data:**
  - Custom logic checks for duplicate emails/phones and surfaces errors before save.
- **Business Rule Violations:**
  - Required fields and business rules are enforced before API calls; errors are shown if not met.
- **API Failures:**
  - All API failures are caught and surfaced to the user with appropriate messaging.

---

**End of Error Handling and Messaging Report**
