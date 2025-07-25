# Data Flow and State Management DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Files Included:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

---

## 1. Data Sources and Destinations

- **API Data:** Loaded via `PatientRegistrationService.getPersonByPersonId(this.route.patientId)` and patched into form groups.
- **Form State:** Managed via Angular Reactive Forms (`FormGroup`, `FormArray`, etc.)
- **Feature Flags:** Loaded via `FeatureFlagService.getOnce$` and used to toggle UI/logic.
- **UI State:** Managed via component properties (e.g., `selectedMenuItem`, `isOpen`, `isCancelled`, etc.)

---

## 2. Data Loading, Transformation, and Storage

```typescript
ngAfterContentInit() {
  if (this.route.patientId) {
    this.loadingModal = this.getLoadingModal();
    this.registrationService.getPersonByPersonId(this.route.patientId)
      .subscribe((person: any) => {
        this.personInfo = person;
        this.titleService.setTitle(`${person.Profile.PatientCode} - Edit Person`);
        this.handlePatchForms();
      });
  } else {
    this.patientIdentifiers = [];
    this.profile = null;
  }
}
```

- **Rationale:** Loads patient data from API, updates local state, and patches forms.

---

## 3. State Management and Synchronization

### Form Initialization and Patching
```typescript
initializePersonForm = () => {
  this.personGroup = this.fb.group({
    personalDetailsForm: this.personalDetailsControls(),
    contactDetailsForm: this.contactDetailControls(),
    insuranceDetailsForm: this.insuranceDetailsControls(),
    preferencesForm: this.prefrencesControls(),
    dentalRecordsForm: this.dentalRecordControls(),
    referralsForm: this.referralsControls(),
    identifiresForm: this.additionalIdenitfiersControls(),
  });
  if (this.isCancelled) {
    this.isCancelled = false;
    this.closeModal();
    this.location.back();
  }
};
```

### Event Subscriptions
```typescript
this.registrationService.getRegistrationEvent()
  .pipe(takeUntil(this.unsubscribe$))
  .subscribe((event: RegistrationCustomEvent) => {
    if (event) {
      switch (event.eventtype) {
        case RegistrationEvent.FocusSection:
          this.setFocusOnSection(event.data);
          break;
        case RegistrationEvent.SavePatient:
          this.validateandSavePatient(event.data);
          break;
        case RegistrationEvent.PerformNavigation:
          this.validateAndNavigate(event.data);
          break;
      }
    }
  });
```

---

## 4. State Variables and Triggers

- `personTabs`, `selectedMenuItem`, `fromTocEvent`, `isOpen`, `isCancelled`, `fieldList`, `phoneTypes`, `states`, `patientIdentifiers`, `profile`, `personInfo`, `loadingModal`, `PersonObject`, etc.
- Triggers include form events, scroll events, modal actions, and service events.

---

## 5. Edge Cases and Legacy Artifacts

- Use of legacy AngularJS tokens and direct DOM manipulation for section focus.
- Manual subscription management with `unsubscribe$` for RxJS cleanup.

---

## 6. Diagrams and Tables

| Data Source | Destination | Trigger/Event | Code Reference |
|-------------|-------------|---------------|---------------|
| API | personInfo | ngAfterContentInit | registrationService.getPersonByPersonId |
| personInfo | FormGroups | handlePatchForms | patch* methods |
| FeatureFlagService | enableNewReferral, releseOldReferral | ngOnInit | featureFlagService.getOnce$ |
| User Actions | UI State | Scroll, Modal, Save | onScroll, openModal, savePerson |

---

## 7. Rationale and Mapping to Requirements

- All data flow and state management logic is required for the registration workflow, UI navigation, and form handling.
- Follows the DNA extraction checklist and rehydration guidance in `DOCS/system.prompt.md`.

---

**End of Data Flow and State Management Report**
# Data Flow and State Management DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`

**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Data Sources and Destinations

- **API Data:** Loaded via `PatientRegistrationService.getPersonByPersonId` and mapped to form controls
- **Form State:** Managed via Angular Reactive Forms (`FormGroup`, `FormArray`)
- **UI State:** Managed via component properties and RxJS subscriptions

---

## 2. Data Loading and Transformation

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

```typescript
ngAfterContentInit() {
  if (this.route.patientId) {
    this.loadingModal = this.getLoadingModal();
    this.registrationService
      .getPersonByPersonId(this.route.patientId)
      .subscribe((person: any) => {
        this.personInfo = person;
        this.titleService.setTitle(
          `${person.Profile.PatientCode} - Edit Person`
        );
        this.handlePatchForms();
      });
  } else {
    this.patientIdentifiers = [];
    this.profile = null;
  }
}
```

- **Purpose:** Loads person data from API and patches all form groups with the returned data

---

## 3. State Management and Synchronization

- **Form Initialization:**
  - `initializePersonForm()` creates the main `FormGroup` with all subgroups and arrays
- **Form Patching:**
  - `handlePatchForms()` calls patch methods for each form section
- **Event Subscriptions:**
  - `registrationService.getRegistrationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(...)` for event-driven updates
- **State Variables:**
  - `personTabs`, `selectedMenuItem`, `personGroup`, `fieldList`, `phoneTypes`, `states`, etc.
- **RxJS Subjects:**
  - `unsubscribe$` for managing subscription cleanup

---

## 4. Event Handlers and Triggers

- **Scroll Event:**
  - `@HostListener('scroll', ['$event']) onScroll($event)` updates `selectedMenuItem` and emits registration events
- **Form Events:**
  - Form control changes trigger validation and UI updates
- **Modal Events:**
  - Modal open/close and confirmation handled via component state and service

---

## 5. Edge Cases and Legacy Artifacts

- Handles both new and existing patient flows
- Uses both direct property assignment and RxJS for state
- Some legacy patterns in event and modal management

---

## 6. Diagrams and Tables

| Data Source | Destination | Trigger/Event |
|-------------|-------------|---------------|
| API (getPersonByPersonId) | personInfo, form groups | ngAfterContentInit |
| FormGroup | UI template | Data binding |
| User input | FormGroup | Form events |
| RegistrationEvent | Component state | RxJS subscription |

---

**End of Data Flow and State Management Report**# Data Flow and State Management Report: registration-landing

**Target Folder:** `src/patient/patient-registration/registration-landing`

## Data Sources and Flow
- **personGroup (FormGroup):** Central state for all form data, initialized and patched from API/service.
- **personInfo:** Loaded from `registrationService.getPersonByPersonId()` and used to patch form sections.
- **Static Data:** `phoneTypes`, `states` loaded from `StaticData` service.
- **Feature Flags:** Loaded from `featureFlagService` to toggle UI/logic.

## State Variables
- `personTabs`, `selectedMenuItem`, `fromTocEvent`, `isOpen`, `triggerOrigin`, `fieldList`, `isCancelled`, etc.
- RxJS `unsubscribe$` for subscription management.

## Data Loading/Transformation
- On init, loads person data if `route.patientId` exists, otherwise initializes empty form.
- Patches form sections with API data using dedicated patch methods.
- Transforms API data to form structure and vice versa for save.

## State Change Triggers
- User navigation (scroll, menu selection)
- API responses (person data, static data)
- Form events (patch, validation, save/cancel)
- Feature flag changes

## State Synchronization
- RxJS subscriptions for registration events and feature flags.
- Form state synchronized with API data and user input.
- Modal state managed via component properties and service calls.

## Diagrams/Tables
| State Variable | Source | Trigger | Usage |
|----------------|--------|---------|-------|
| personGroup | FormBuilder | Init, patch, save | All form data |
| personInfo | API | Init, patch | Data model |
| phoneTypes, states | StaticData | OnInit | Form options |
| isOpen | Modal | User action | Modal state |
| selectedMenuItem | UI | Scroll/menu | Navigation |

## Rationale
State and data flow are managed using Angular Reactive Forms and RxJS, ensuring robust, testable, and maintainable state management. All data transformations are explicit, and state is synchronized with API and user actions for reliability.
# Data Flow and State Management DNA Extraction Report

**Target Folder:** `src/patient/patient-registration/registration-landing`
**Included Files:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

---

## 1. Data Sources and Destinations

- **Patient Data:**
  - **Source:** Loaded from API via `PatientRegistrationService.getPersonByPersonId()`
  - **Destination:** Stored in `personInfo` and used to patch form controls
  - **Code Example:**
    ```typescript
    this.registrationService.getPersonByPersonId(this.route.patientId)
      .subscribe((person: any) => {
        this.personInfo = person;
        this.titleService.setTitle(`${person.Profile.PatientCode} - Edit Person`);
        this.handlePatchForms();
      });
    ```

- **Form Data:**
  - **Source:** Initialized via `FormBuilder` and patched with API data
  - **Destination:** Used for UI binding and submission
  - **Code Example:**
    ```typescript
    this.personGroup = this.fb.group({
      personalDetailsForm: this.personalDetailsControls(),
      contactDetailsForm: this.contactDetailControls(),
      ...
    });
    ```

## 2. Data Loading, Transformation, and Storage

- **Static Data:**
  - Loaded via `staticData.PhoneTypes()` and `staticData.States()`
  - Transformed in `phoneTypesOnSuccess` and `StatesOnSuccess`
  - Stored in `phoneTypes` and `states` arrays

- **Form Patching:**
  - Data from `personInfo` is patched into form controls using methods like `patchPersonalDetail`, `patchContactDetail`, etc.
  - Handles edge cases (e.g., missing data, conditional disabling of controls)

## 3. State Change Triggers

- **Lifecycle Hooks:**
  - `ngOnInit` and `ngAfterContentInit` trigger data loading and form initialization
- **User Events:**
  - Scroll, form input, and modal actions trigger state changes
- **RxJS Subscriptions:**
  - Subscribes to registration events and feature flags, updates state accordingly

## 4. State Management and Synchronization

- **RxJS Subjects:**
  - `unsubscribe$` used for cleaning up subscriptions
- **FormGroup State:**
  - All form state managed via Angular Reactive Forms
- **Component Properties:**
  - State variables like `selectedMenuItem`, `isOpen`, `isCancelled`, etc. track UI and business logic state
- **API Calls:**
  - Data is synchronized with backend via `addPerson` and `updatePerson` methods

## 5. Edge Cases and Rationale

- **Conditional Logic:**
  - Handles both new and existing patients (conditional rendering and data loading)
  - Feature flags enable/disable sections dynamically
- **Form Validation:**
  - Validates and synchronizes form state before submission
- **Unsubscription:**
  - Ensures all subscriptions are cleaned up on destroy to prevent memory leaks

---

**Files included in this extraction:**
- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`
- `src/patient/patient-registration/registration-landing/registration-landing.component.html`
- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`
- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

**Extraction method:** All files in the folder were included as per the workflow instructions.
