# Component Structure Report: registration-landing

> Context: See `DOCS/extraction/extraction-report.md` for overall DNA extraction context and guidance.

---

## Files and Roles

- `src/patient/patient-registration/registration-landing/registration-landing.component.ts`  
  **Type:** Angular Component (TypeScript)  
  **Role:** Main logic, class, and business rules for the registration landing page.

- `src/patient/patient-registration/registration-landing/registration-landing.component.html`  
  **Type:** Angular Template (HTML)  
  **Role:** UI structure, form layout, tab navigation, and modal overlays.

- `src/patient/patient-registration/registration-landing/registration-landing.component.scss`  
  **Type:** SCSS Stylesheet  
  **Role:** Component-specific styles and layout.

- `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`  
  **Type:** Jest/Karma Test (TypeScript)  
  **Role:** Unit tests for component logic, form handling, and business rules.

---

## Main Class: `RegistrationLandingComponent`

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.ts`

### Key Features

- Implements Angular lifecycle hooks: `OnInit`, `AfterContentInit`, `OnDestroy`
- Manages multiple reactive forms for patient data
- Handles tab navigation, scrolling, and event-driven UI updates
- Integrates with services for API, modals, feature flags, and data transformation
- Uses RxJS for event handling and subscription management

### Key Properties

- `personTabs: any[]` — Tab navigation for patient sections
- `personGroup: FormGroup` — Main reactive form group containing all sub-forms
- `selectedMenuItem: any` — Tracks selected tab/menu
- `fieldList: any[]` — List of fields for modal review
- `phoneTypes: any[]`, `states: any[]` — Static data for form controls
- `profile`, `personInfo`, `patientIdentifiers` — Patient data models
- `unsubscribe$: Subject<any>` — RxJS subject for cleaning up subscriptions
- `isOpen: boolean` — Modal open state
- `enableNewReferral: boolean` — Feature flag for referral section
- `confirmationRef`, `confirmationModalSubscription` — Modal management

### Key Methods (with code samples)

#### Lifecycle

```typescript
ngOnInit() { ... }
ngAfterContentInit() { ... }
ngOnDestroy() { ... }
```

#### Form Initialization and Patching

```typescript
initializeComponent = () => { ... }
initializePersonForm = () => { ... }
patchPersonalDetail = () => { ... }
patchContactDetail = () => { ... }
patchPhones = () => { ... }
patchEmails = () => { ... }
patchPreference = () => { ... }
patchDentalRecords = () => { ... }
patchReferral = () => { ... }
```

#### Event Handling and Navigation

```typescript
onScroll($event: any): void { ... }
setFocusOnSection = (eventData: any) => { ... }
setscrollIntoView = (element: any) => { ... }
validateandSavePatient = (data: any) => { ... }
validateAndNavigate = (url: any) => { ... }
openModal = () => { ... }
closeModal = () => { ... }
openConfirmationModal = (data: any, url: any) => { ... }
```

#### Data Transformation and API

```typescript
savePerson = (url?: any) => { ... }
removeInvalidDataForAddOrUpdate = (person: any) => { ... }
syncImagingPatient = (updatedPatient: any, url?: any) => { ... }
syncBlueLocationIfEnabled = (updatedPatient: any) => { ... }
setPersonActiveStatus = (updatedPatient: any, url?: any) => { ... }
savePersonSuccess = (res: any, url?: any) => { ... }
savePersonFailure = (res: any) => { ... }
```

#### Utility and Validation

```typescript
BuildFieldList = () => { ... }
addToFieldList = (formgroupValue: any) => { ... }
getPhoneType = (value: any) => { ... }
getPhoneTypeId = (value: any) => { ... }
applyTransfomation = (key: any, value: any) => { ... }
hasDuplicateEmail = (emailAddresses: string[]): boolean => { ... }
ValidateInsuracePolicy = (policyForm: any, skipPolicyHolderId: boolean) => { ... }
getPersonGroups = (groups: any[]) => { ... }
getPersonFlags = (flags: any[]) => { ... }
getCalculateDOB = (dob: any) => { ... }
getPersonLocations = (locations: any[]) => { ... }
getLoadingModal = () => { ... }
checkFeatureFlags() { ... }
```

### Architectural Patterns and Conventions

- **Reactive Forms:** All patient data is managed via Angular Reactive Forms, with sub-forms for each section (personal, contact, insurance, preferences, dental, referrals, identifiers).
- **Event-Driven UI:** Uses RxJS and Angular event emitters for tab navigation, form patching, and modal confirmation.
- **Service Injection:** Relies on Angular DI for all services, static data, and feature flags.
- **Separation of Concerns:** UI logic is separated from data transformation and API calls.
- **Modal Pattern:** Uses modal overlays for confirmation and review before saving/cancelling.
- **Feature Flags:** Controls UI sections and logic with feature flags (e.g., referrals section).

### Relationships to Other Files/Modules

- **Child Components:**
  - `personal-details`, `contact-details`, `insurance-details`, `preferences`, `dental-records`, `additional-identifiers`, `patient-referral-crud`, `app-patient-documents`, `app-patient-account-members`
- **Services:**
  - `PatientRegistrationService`, `ConfirmationModalService`, `FeatureFlagService`, `ImagingPatientService`, `PersonFactory`, static data services, toastr
- **Testing:**
  - `registration-landing.component.spec.ts` provides unit tests for form logic, API calls, and business rules

---

## Template Structure

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.html`

- Main container with header, table of contents, and person detail sections
- Uses Angular form bindings: `[formGroup]`, `formControlName`, etc.
- Renders child components for each section of the registration process
- Modal overlay for review/confirmation before save/cancel
- Conditional rendering for referrals and identifiers based on feature flags and patient state

---

## Stylesheet

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.scss`

- Defines grid layout for the registration landing page
- Styles for modal overlays, table, buttons, and section containers
- Uses SCSS variables and mixins for theme consistency
- Customizes scrollbars and tabstrip appearance

---

## Test File

**File:** `src/patient/patient-registration/registration-landing/registration-landing.component.spec.ts`

- Sets up Angular TestBed with all required modules and providers
- Mocks services and dependencies for isolated unit testing
- Tests form initialization, patching, and save logic
- Verifies navigation and modal behavior
- Ensures business rules are enforced in form logic

---

## File Organization and Conventions

- All files are co-located in `src/patient/patient-registration/registration-landing/`
- Follows Angular CLI conventions for file naming and structure
- Uses `.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts` suffixes
- All file references in this report use complete relative paths from the workspace root

---

**End of Component Structure Report**
