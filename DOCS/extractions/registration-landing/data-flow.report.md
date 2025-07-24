# Data Flow and State Management Report: registration-landing

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
