# Logging and Error Handling Details Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Logging Overview
- **Toasts:** Uses `toastrFactory.success` and `toastrFactory.error` for all major actions (save, update, error).
- **Modal Messages:** Modal overlay provides user feedback for confirmation/cancel actions.
- **Console Logging:** Minimal; relies on UI feedback for most logging.
- **Analytics/Monitoring:** Not explicitly implemented; hooks could be added for API calls and error events.

## Log Messages and Context
- All log messages are user-facing via toasts and modals.
- Messages are translated via `TranslateService` for i18n support.

## Relationship to Business Logic
- All major business logic actions (save, update, error) trigger a log message.
- API errors and validation failures are logged to the user via UI feedback.

## Diagrams/Tables
| Action | Log/Message | Context |
|--------|------------|--------|
| Save | toastrFactory.success | On successful save |
| Update | toastrFactory.success | On successful update |
| Error | toastrFactory.error | On API or validation error |
| Modal | Modal message | On confirmation/cancel |

## Rationale
Logging is user-centric, focused on actionable feedback. All major actions are logged to the user, supporting maintainability and troubleshooting.
# Logging and Error Handling Details DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Logging and Messaging

- **Toastr Notifications:**
  - Used for surfacing errors and success messages to the user.
  - Example:
    ```typescript
    this.toastrFactory.error('Unable to Save', 'Missing Information');
    this.toastrFactory.success(this.translate.instant(`Patient has been ${mode} successfully.`), this.translate.instant('Success'));
    ```
- **Modal Dialogs:**
  - Used for confirmation and error states, not for persistent logging.

## 2. Context and Rationale

- **Why:**
  - To provide immediate feedback to the user for form errors, API failures, and successful operations.
  - Ensures users are aware of the result of their actions and any required corrections.
- **Context:**
  - Messages are context-specific (e.g., missing information, server error, success on save/update).
  - All messages are internationalized using `translate.instant()`.

## 3. Analytics and Monitoring

- **No explicit analytics or monitoring hooks** are present in this component.
- All feedback is user-facing via notifications and modals.

## 4. Integration with Business Logic and API

- **Form Operations:**
  - Errors and successes in form validation and submission are surfaced via notifications.
- **API/Data Operations:**
  - API errors and successes are handled in subscription callbacks and surfaced to the user.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
