# Logging and Error Handling Details DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Log Messages and Notification Calls

### File: `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

#### Toast Notifications
```typescript
this.toastrFactory.error(
  this.translate.instant(`Unable to ${mode} patient.`),
  this.translate.instant('Server Error')
);
this.toastrFactory.success(
  this.translate.instant(`Patient has been ${mode} successfully.`),
  this.translate.instant('Success')
);
```

- **Rationale:** All error and success messages are surfaced to the user via toast notifications.

---

## 2. Analytics and Monitoring Hooks

- **No explicit analytics or monitoring hooks are present in this component.**

---

## 3. Relationships to Business Logic, API, and Forms

- Logging and notifications are triggered by API responses, form validation, and business rule enforcement.
- All error handling is centralized in `savePersonFailure` and form validation logic.

---

## 4. Edge Cases, Anti-Patterns, and Legacy Artifacts

- Centralized error handling via toast notifications is a best practice.
- No anti-patterns or legacy logging artifacts detected in this component.

---

## 5. Diagrams and Tables

| Event | Log/Notification | Trigger | Code Reference |
|-------|------------------|---------|---------------|
| API Failure | toastrFactory.error | API error | savePersonFailure |
| API Success | toastrFactory.success | API success | savePersonSuccess |
| Form Error | Angular validation | Form invalid | Child components |

---

## 6. Rationale and Mapping to Requirements

- All logging and error handling details are required for user feedback, workflow integrity, and state management.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Logging and Error Handling Details Report**# Logging and Error Handling Details DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Log Messages and Notification Calls

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

```typescript
this.toastrFactory.error(
  this.translate.instant(`Unable to ${mode} patient.`),
  this.translate.instant('Server Error')
);
this.toastrFactory.success(
  this.translate.instant(`Patient has been ${mode} successfully.`),
  this.translate.instant('Success')
);
```

- **Purpose:**
  - Provides user feedback for success and error states
  - All messages are translated using `TranslateService`

---

## 2. Analytics and Monitoring Hooks

- No explicit analytics or external logging hooks in this component
- All logging is user-facing via toast notifications

---

## 3. Relationships to Business Logic, API, and Forms

- Logging is tightly coupled to API call results and form validation
- All error and success states are surfaced to the user immediately

---

## 4. Edge Cases and Legacy Artifacts

- Uses AngularJS-style DI for `toastrFactory`
- No persistent or server-side logging

---

## 5. Diagrams and Tables

| Event | Logging/Notification | User Feedback |
|-------|---------------------|--------------|
| API error | toastrFactory.error | Toast error |
| API success | toastrFactory.success | Toast success |
| Validation error | toastrFactory.error | Toast error |

---

**End of Logging and Error Handling Details Report**# Logging and Error Handling Details Report: registration-landing

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
