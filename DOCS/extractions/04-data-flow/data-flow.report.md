# Data Flow and State Management Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` and rehydration guidance in `DOCS/system.prompt.md`.

---

## State Variables and Data Sources

- **personTabs: any[]**
  - **Purpose:** Tracks tab navigation for patient registration sections.
  - **Initialization:** Set in `initializeComponent()` and updated on navigation.
  - **Triggers:** User navigation, registration events.

- **personGroup: FormGroup**
  - **Purpose:** Main reactive form group containing all sub-forms (personal, contact, insurance, preferences, dental, referrals, identifiers).
  - **Initialization:** Created in `initializePersonForm()` using Angular FormBuilder.
  - **Data Flow:**
    - Patched with loaded patient data in edit mode (see `patchPersonalDetail`, `patchContactDetail`, etc.).
    - Updated on user input and validated before save.
    - Used to build the payload for API calls.

- **selectedMenuItem: any**
  - **Purpose:** Tracks the currently selected tab/menu.
  - **Triggers:** Updated in `onScroll($event)` and via registration events.

- **fieldList: any[]**
  - **Purpose:** List of fields for modal review before save/cancel.
  - **Population:** Built in `BuildFieldList()` by extracting values from all sub-forms.

- **phoneTypes: any[]**, **states: any[]**
  - **Purpose:** Static data for dropdowns and selectors.
  - **Loading:** Loaded asynchronously from `StaticData` service in `initializeComponent()`.

- **profile, personInfo, patientIdentifiers**
  - **Purpose:** Hold loaded patient data and identifiers.
  - **Loading:** Set in `ngAfterContentInit()` via API call to `getPersonByPersonId()`.
  - **Usage:** Used to patch forms and build API payloads.

- **unsubscribe$: Subject<any>**
  - **Purpose:** RxJS subject for cleaning up subscriptions on destroy.
  - **Usage:** Used with `takeUntil(this.unsubscribe$)` in all subscriptions.

- **isOpen: boolean**
  - **Purpose:** Tracks modal open state.
  - **Triggers:** Set by `openModal()` and `closeModal()`.

- **enableNewReferral: boolean**
  - **Purpose:** Feature flag for enabling the referral section.
  - **Loading:** Set in `checkFeatureFlags()` via `FeatureFlagService`.

---

## Data Loading and Transformation

- **Patient Data Loading:**
  - On edit, patient data is loaded in `ngAfterContentInit()`:
    ```typescript
    this.registrationService.getPersonByPersonId(this.route.patientId).subscribe((person: any) => {
      this.personInfo = person;
      this.titleService.setTitle(`${person.Profile.PatientCode} - Edit Person`);
      this.handlePatchForms();
    });
    ```
  - **Transformation:** Data is patched into the form using methods like `patchPersonalDetail`, `patchContactDetail`, etc.

- **Form Patching:**
  - Each section has a dedicated patch method to update the form with loaded data.
  - Example:
    ```typescript
    patchPersonalDetail = () => {
      const profile: any = this.personInfo.Profile;
      if (profile) {
        const personaldetail = this.personGroup.get('personalDetailsForm');
        personaldetail.patchValue({ ... });
      }
    }
    ```

- **Static Data Loading:**
  - Phone types and states are loaded asynchronously:
    ```typescript
    this.staticData.PhoneTypes().then(this.phoneTypesOnSuccess);
    this.staticData.States().then(this.StatesOnSuccess);
    ```

---

## State Change Triggers

- **User Actions:**
  - Tab navigation, form input, and modal actions trigger state changes.
- **Registration Events:**
  - Subscribed to via RxJS; trigger focus, save, and navigation logic.
- **API Responses:**
  - Data loaded from API triggers form patching and state updates.
- **Feature Flags:**
  - Enable/disable UI sections and logic on initialization.

---

## State Synchronization and Management

- **Reactive Forms:**
  - All patient data is managed via Angular Reactive Forms for synchronization and validation.
- **RxJS Subscriptions:**
  - All event and service subscriptions use `takeUntil(this.unsubscribe$)` for cleanup.
- **Modal State:**
  - Managed via `isOpen` and modal methods.
- **Edge Cases:**
  - Handles missing/partial data, disables fields as needed, and ensures all forms are validated before save.

---

**End of Data Flow and State Management Report**
