# Interactions Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## Child Component Interactions

### 1. Personal Details, Contact Details, Insurance, Preferences, Dental Records, Additional Identifiers

- **Components:**
  - `personal-details`, `contact-details`, `insurance-details`, `preferences`, `dental-records`, `additional-identifiers`
  - **File:** `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- **Interaction:**
  - Passed respective `FormGroup` controls as `[input]` bindings:

    ```html
    <personal-details [personalDetails]="personGroup.controls.personalDetailsForm"></personal-details>
    <contact-details [contactDetails]="personGroup.controls.contactDetailsForm" [phoneTypes]="phoneTypes" [states]="states"></contact-details>
    <insurance-details [insuranceDetails]="personGroup.controls.insuranceDetailsForm"></insurance-details>
    <preferences [patientPreference]="personGroup.controls.preferencesForm"></preferences>
    <dental-records [dentalRecords]="personGroup.controls.dentalRecordsForm"></dental-records>
    <additional-identifiers [additionalIdentifiers]="personGroup.controls.identifiresForm"></additional-identifiers>
    ```

  - **Data Exchanged:** Form state, validation, and user input for each section.
  - **Lifecycle:** Initialized on component load, patched with data on edit, updated on user input.

### 2. Patient Referral CRUD

- **Component:** `patient-referral-crud`
- **File:** `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- **Interaction:**
  - Rendered conditionally based on feature flag and patient state:

    ```html
    <patient-referral-crud [fromAddPatientProfile]="true"></patient-referral-crud>
    ```

  - Accessed via `@ViewChild(PatientReferralCrudComponent)` in TS for validation and save logic.
  - **Data Exchanged:** Referral form state, validation status, and save events.
  - **Lifecycle:** Only present for new patients if feature flag is enabled.

### 3. App Patient Documents, Account Members

- **Components:** `app-patient-documents`, `app-patient-account-members`
- **File:** `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- **Interaction:**
  - Rendered with patient profile or registration context.
  - **Data Exchanged:** Patient profile, account member data.

---

## Service Interactions

### 1. PatientRegistrationService

- **File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- **Interaction:**
  - API calls for patient CRUD, registration events, and data loading.
  - Event subscription for registration events:

    ```typescript
    this.registrationService.getRegistrationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe((event: RegistrationCustomEvent) => { ... });
    this.registrationService.setRegistrationEvent({ eventtype: RegistrationEvent.SelectedMenu, data: this.selectedMenuItem });
    ```

  - **Data Exchanged:** Patient data, registration events, form patching triggers.
  - **Lifecycle:** On init, on scroll, on save, on navigation.

### 2. ConfirmationModalService

- **Interaction:**
  - Opens confirmation modals for save/cancel actions.
  - Subscribes to modal events for user confirmation.
  - **Data Exchanged:** Modal state, user confirmation events.

### 3. FeatureFlagService

- **Interaction:**
  - Checks feature flags to enable/disable UI sections (e.g., referrals).
  - **Data Exchanged:** Feature flag values.
  - **Lifecycle:** On component initialization.

### 4. ImagingPatientService, PersonFactory

- **Interaction:**
  - Syncs patient data with imaging systems and sets patient active status.
  - **Data Exchanged:** Patient data objects.
  - **Lifecycle:** On save/update.

---

## Event and Data Flow

- **Tab Navigation and Scroll:**
  - `onScroll($event)` updates `selectedMenuItem` and emits registration events.
- **Form Patching:**
  - Methods like `patchPersonalDetail`, `patchContactDetail`, etc., update form state from loaded patient data.
- **Modal Workflow:**
  - `openModal`, `closeModal`, and confirmation modal logic manage user review and confirmation before save/cancel.
- **Validation and Save:**
  - `validateandSavePatient` and `savePerson` coordinate form validation, data transformation, and API calls.

---

## Side Effects and Dependencies

- **RxJS Subscriptions:** All event and service subscriptions are cleaned up in `ngOnDestroy` using `unsubscribe$`.
- **Feature Flags:** UI and logic are conditionally enabled/disabled based on feature flag values.
- **Direct DOM Access:** Uses `@ViewChild` and `ElementRef` for scroll/focus management.
- **Legacy AngularJS Services:** Some injected tokens (e.g., `$routeParams`, `$location`) are for legacy support and should be replaced in modern Angular.

---

**End of Interactions Report**
