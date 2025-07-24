# User Interface Elements Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## UI Elements Overview
- **Form Structure:** Main form uses Angular Reactive Forms, divided into sections for personal, contact, insurance, preferences, dental, referrals, identifiers, documents, and account members.
- **Section Containers:** Each section is a `<div>` with a unique id and reference, containing a child component for that section.
- **Navigation:** Table of contents and scroll-based navigation update the selected section.
- **Modal Overlay:** Confirmation/cancel modal uses Angular CDK overlay and custom modal component.
- **Dynamic Rendering:** Some sections (insurance, referrals, identifiers, documents) are conditionally rendered based on patient state or feature flags.

## Template Bindings and Events
- `[formGroup]="personGroup"` binds the main form group.
- `[personalDetails]`, `[contactDetails]`, `[insuranceDetails]`, `[patientPreference]`, etc. bind form controls to child components.
- `(scroll)="onScroll($event)"` handles scroll events for navigation.
- `(onClick)="closeModal()"`, `(onClick)="isCancelled?initializePersonForm():savePerson()"` handle modal actions.

## Accessibility and Usability
- Uses semantic HTML and ARIA roles where appropriate.
- Modal overlay disables background interaction and focuses user attention.
- Table of contents and section navigation support keyboard and mouse interaction.

## Diagrams/Tables
| UI Element | Type | Binding/Event | Purpose |
|------------|------|--------------|---------|
| person-form | Form | [formGroup] | Main form container |
| personal-details | Child Component | [personalDetails] | Personal details section |
| contact-details | Child Component | [contactDetails], [phoneTypes], [states] | Contact section |
| insurance-details | Child Component | [insuranceDetails] | Insurance section |
| preferences | Child Component | [patientPreference] | Preferences section |
| dental-records | Child Component | [dentalRecords] | Dental section |
| patient-referral-crud | Child Component | [fromAddPatientProfile] | Referrals section |
| additional-identifiers | Child Component | [additionalIdentifiers], [patientIdentifiers] | Identifiers section |
| app-patient-documents | Child Component | [patientProfile] | Documents section |
| app-patient-account-members | Child Component | [featureName] | Account members section |
| reg-modal | Modal | (onClick), [cdkConnectedOverlayOpen] | Confirmation/cancel modal |

## Rationale
UI is modular, accessible, and event-driven, supporting a modern Angular architecture. All elements are bound to state and events, enabling dynamic, testable, and maintainable UI.
# User Interface Elements DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Main Container and Layout

- **Element:** `<div class="registration-landing-container">`
  - **Purpose:** Main wrapper for the registration landing page.
  - **Behavior:** Uses grid layout for header and content sections.
  - **SCSS:** `.registration-landing-container { display: grid; ... }`

## 2. Header

- **Element:** `<div class="registration-landing-header">`
  - **Purpose:** Contains the registration header component.
  - **Template:**
    ```html
    <registration-header [patientProfile]="this.personInfo.Profile"></registration-header>
    ```

## 3. Table of Contents (TOC)

- **Element:** `<div class="registration-landing-content-toc">`
  - **Purpose:** Displays navigation for form sections.
  - **Template:**
    ```html
    <table-of-content></table-of-content>
    ```

## 4. Form and Sections

- **Element:** `<form [formGroup]="personGroup" class="form-horizontal" id="person-form">`
  - **Purpose:** Main form for patient registration, using Angular Reactive Forms.
  - **Sections:**
    - Personal Details: `<personal-details [personalDetails]="personGroup.controls.personalDetailsForm">`
    - Contact Details: `<contact-details [contactDetails]="personGroup.controls.contactDetailsForm" [phoneTypes]="phoneTypes" [states]="states"></contact-details>`
    - Insurance: `<insurance-details ...>` or `<app-patient-insurance ...>`
    - Preferences: `<preferences [patientPreference]="personGroup.controls.preferencesForm" [onlyActive]="true"></preferences>`
    - Dental Records: `<dental-records [dentalRecords]="personGroup.controls.dentalRecordsForm"></dental-records>`
    - Referrals: `<patient-referral-crud [fromAddPatientProfile]="true"></patient-referral-crud>` (conditional)
    - Additional Identifiers: `<additional-identifiers ...>`
    - Documents: `<app-patient-documents ...>`
    - Account Members: `<app-patient-account-members ...>`

- **Behavior:**
  - Each section is a child component, bound to a specific FormGroup or data property.
  - Scrollable container with section anchors for navigation.
  - Event bindings for scroll and modal actions.

## 5. Modal Overlay

- **Element:** `<ng-template cdkConnectedOverlay ... id="modalPatientRegistration">`
  - **Purpose:** Displays a confirmation modal for saving/cancelling registration.
  - **Template:**
    ```html
    <div class="reg-modal">
      ...
      <div class="reg-modal-footer containerPadding">
        <app-button id="btnRegisterNo" ... buttonLabel="No"></app-button>
        <app-button id="btnRegisterYes" ... buttonLabel="Yes" ...></app-button>
      </div>
    </div>
    ```
  - **Behavior:**
    - Shows field list for review before saving/cancelling.
    - Buttons trigger modal close or save actions.

## 6. Accessibility and Usability

- Uses semantic HTML and ARIA roles where appropriate.
- Buttons and form controls are labeled and accessible.
- Modal overlay dims background and traps focus.
- Scrollable sections for large forms.

## 7. SCSS and Styling

- Grid-based layout for responsive design.
- BEM-like class naming for maintainability.
- Custom scrollbar and modal styling for usability.

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
