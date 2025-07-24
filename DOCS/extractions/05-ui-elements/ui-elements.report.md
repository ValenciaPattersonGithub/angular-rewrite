# User Interface Elements Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## Main UI Structure

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.html`

- **Container Layout:**
  - Uses a grid layout for header, table of contents, and main content.
  - Main form is wrapped in `<form [formGroup]="personGroup" class="form-horizontal" id="person-form">`.

---

## Tabs and Navigation

- **Tab Navigation:**
  - Tabs are managed via the `personTabs` array and rendered in the template (commented out Kendo TabStrip, but logic is present).
  - Navigation between sections is handled by scrolling and updating `selectedMenuItem`.
  - Table of contents is rendered via `<table-of-content></table-of-content>`.

---

## Sectioned Forms (Personal, Contact, Insurance, Preferences, Dental, Referrals, Identifiers, Documents, Account Members)

- **Each section is a child component:**
  - Example:
    ```html
    <personal-details [personalDetails]="personGroup.controls.personalDetailsForm"></personal-details>
    <contact-details [contactDetails]="personGroup.controls.contactDetailsForm" [phoneTypes]="phoneTypes" [states]="states"></contact-details>
    <insurance-details [insuranceDetails]="personGroup.controls.insuranceDetailsForm"></insurance-details>
    <preferences [patientPreference]="personGroup.controls.preferencesForm"></preferences>
    <dental-records [dentalRecords]="personGroup.controls.dentalRecordsForm"></dental-records>
    <additional-identifiers [additionalIdentifiers]="personGroup.controls.identifiresForm"></additional-identifiers>
    ```
  - **Purpose:** Each section encapsulates a logical part of the registration form, with its own validation and UI.
  - **Rendering:** Bound to sub-form controls for reactive updates.
  - **Events/Data:** Handles user input, validation, and emits changes to parent form.

---

## Modals and Overlays

- **Confirmation Modal:**
  - Rendered via `<ng-template cdkConnectedOverlay ...>`
  - Shows a summary table of changed fields for user confirmation before save/cancel.
  - Buttons for "Yes" and "No" actions, bound to `savePerson()` and `closeModal()`.
  - Example:
    ```html
    <app-button id="btnRegisterNo" variation="secondary" class="reg-btn" (onClick)="closeModal()" buttonLabel="No"></app-button>
    <app-button id="btnRegisterYes" variation="primary" class="reg-btn" buttonLabel="Yes" (onClick)="isCancelled?initializePersonForm():savePerson()"></app-button>
    ```
  - **Accessibility:** Uses ARIA roles and overlays for focus management.

---

## Event Bindings and Change Detection

- **Scroll Event:**
  - `<div class="person-container" (scroll)="onScroll($event)">`
  - Updates navigation state and triggers registration events.

- **Button Clicks:**
  - Modal buttons trigger save/cancel logic.

- **Form Bindings:**
  - All form controls are bound via Angular Reactive Forms for real-time validation and updates.

---

## Accessibility and Usability

- **Section Headings:** Each section is clearly labeled and separated for user clarity.
- **Keyboard Navigation:** Modal overlays and tab navigation support keyboard interaction.
- **Validation Feedback:** Invalid fields are highlighted in child components.
- **Responsive Layout:** Uses grid and flex layouts for adaptive design.

---

**End of User Interface Elements Report**
